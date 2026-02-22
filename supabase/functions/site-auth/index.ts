/**
 * Site-Auth Edge Function
 * 
 * Handles per-site/template user authentication.
 * This allows the same email to be registered on multiple sites without conflicts.
 * 
 * Actions:
 * - register: Create a new user for a specific site
 * - login: Authenticate a user for a specific site
 * - verify-session: Validate a site session token
 * - get-user: Get user details by session token
 * - logout: Invalidate session (client-side only)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import { SignJWT, jwtVerify } from "https://deno.land/x/jose@v5.2.0/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SiteAuthPayload {
  action: "register" | "login" | "logout" | "get-user" | "verify-session";
  siteId: string;
  businessId?: string;
  email?: string;
  password?: string;
  name?: string;
  sessionToken?: string;
  metadata?: Record<string, unknown>;
}

interface SiteUser {
  id: string;
  email: string;
  name: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

interface SiteSession {
  token: string;
  expiresAt: number;
  siteId: string;
  userId: string;
}

// JWT secret for signing site session tokens
const JWT_SECRET = new TextEncoder().encode(
  Deno.env.get("SITE_AUTH_JWT_SECRET") || Deno.env.get("JWT_SECRET") || "site-auth-default-secret-change-in-production"
);

// Session duration: 7 days
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: SiteAuthPayload = await req.json();
    const { action, siteId, businessId, email, password, name, sessionToken, metadata } = payload;

    // Validate siteId for all actions
    if (!siteId) {
      return jsonResponse({ success: false, error: "siteId is required" }, 400);
    }

    console.log(`[site-auth] Action: ${action}, siteId: ${siteId}`);

    switch (action) {
      // ====================================================================
      // REGISTER - Create new site user
      // ====================================================================
      case "register": {
        if (!email || !password) {
          return jsonResponse({ success: false, error: "Email and password are required" }, 400);
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return jsonResponse({ success: false, error: "Invalid email format" }, 400);
        }

        // Validate password strength
        if (password.length < 6) {
          return jsonResponse({ success: false, error: "Password must be at least 6 characters" }, 400);
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check if user already exists for THIS site (not globally)
        const { data: existingUser } = await supabase
          .from("site_users")
          .select("id")
          .eq("site_id", siteId)
          .eq("email", normalizedEmail)
          .single();

        if (existingUser) {
          return jsonResponse({ 
            success: false, 
            error: "An account with this email already exists for this site" 
          }, 409);
        }

        // Get business_id from site/project if not provided
        let finalBusinessId = businessId;
        if (!finalBusinessId) {
          const { data: project } = await supabase
            .from("projects")
            .select("business_id")
            .eq("id", siteId)
            .single();
          
          finalBusinessId = project?.business_id;
          
          if (!finalBusinessId) {
            return jsonResponse({ success: false, error: "Invalid site or missing business association" }, 400);
          }
        }

        // Hash password with bcrypt
        const passwordHash = await bcrypt.hash(password);

        // Create user
        const { data: newUser, error: insertError } = await supabase
          .from("site_users")
          .insert({
            site_id: siteId,
            business_id: finalBusinessId,
            email: normalizedEmail,
            password_hash: passwordHash,
            name: name?.trim() || null,
            metadata: metadata || {},
          })
          .select("id, email, name, metadata, created_at")
          .single();

        if (insertError) {
          console.error("[site-auth] Insert error:", insertError);
          return jsonResponse({ success: false, error: "Failed to create account" }, 500);
        }

        // Generate session token
        const session = await createSession(newUser.id, siteId, normalizedEmail);

        console.log(`[site-auth] User registered: ${normalizedEmail} for site ${siteId}`);

        return jsonResponse({
          success: true,
          message: "Account created successfully",
          user: sanitizeUser(newUser),
          session,
        });
      }

      // ====================================================================
      // LOGIN - Authenticate existing site user
      // ====================================================================
      case "login": {
        if (!email || !password) {
          return jsonResponse({ success: false, error: "Email and password are required" }, 400);
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Find user for this specific site
        const { data: user, error: findError } = await supabase
          .from("site_users")
          .select("id, email, name, metadata, password_hash, created_at")
          .eq("site_id", siteId)
          .eq("email", normalizedEmail)
          .single();

        if (findError || !user) {
          console.log(`[site-auth] Login failed - user not found: ${normalizedEmail} on site ${siteId}`);
          return jsonResponse({ success: false, error: "Invalid email or password" }, 401);
        }

        // Verify password
        const passwordValid = await bcrypt.compare(password, user.password_hash);
        if (!passwordValid) {
          console.log(`[site-auth] Login failed - invalid password for: ${normalizedEmail}`);
          return jsonResponse({ success: false, error: "Invalid email or password" }, 401);
        }

        // Update last login timestamp
        await supabase
          .from("site_users")
          .update({ last_login_at: new Date().toISOString() })
          .eq("id", user.id);

        // Generate session token
        const session = await createSession(user.id, siteId, normalizedEmail);

        console.log(`[site-auth] User logged in: ${normalizedEmail} for site ${siteId}`);

        return jsonResponse({
          success: true,
          message: "Login successful",
          user: sanitizeUser(user),
          session,
        });
      }

      // ====================================================================
      // VERIFY-SESSION - Validate a session token
      // ====================================================================
      case "verify-session": {
        if (!sessionToken) {
          return jsonResponse({ success: false, error: "Session token is required" }, 400);
        }

        try {
          const { payload: decoded } = await jwtVerify(sessionToken, JWT_SECRET);

          // Verify token is for the correct site
          if (decoded.siteId !== siteId) {
            return jsonResponse({ success: false, error: "Session is not valid for this site" }, 401);
          }

          // Get current user data
          const { data: user, error: userError } = await supabase
            .from("site_users")
            .select("id, email, name, metadata, created_at")
            .eq("id", decoded.userId)
            .eq("site_id", siteId)
            .single();

          if (userError || !user) {
            return jsonResponse({ success: false, error: "User not found" }, 401);
          }

          return jsonResponse({
            success: true,
            user: sanitizeUser(user),
            session: {
              token: sessionToken,
              expiresAt: (decoded.exp as number) * 1000,
              siteId,
              userId: user.id,
            },
          });
        } catch (err) {
          console.log("[site-auth] Token verification failed:", err);
          return jsonResponse({ success: false, error: "Invalid or expired session" }, 401);
        }
      }

      // ====================================================================
      // GET-USER - Get user by session token
      // ====================================================================
      case "get-user": {
        if (!sessionToken) {
          return jsonResponse({ success: false, error: "Session token is required" }, 400);
        }

        try {
          const { payload: decoded } = await jwtVerify(sessionToken, JWT_SECRET);

          if (decoded.siteId !== siteId) {
            return jsonResponse({ success: false, error: "Session is not valid for this site" }, 401);
          }

          const { data: user } = await supabase
            .from("site_users")
            .select("id, email, name, metadata, created_at")
            .eq("id", decoded.userId)
            .single();

          if (!user) {
            return jsonResponse({ success: false, error: "User not found" }, 404);
          }

          return jsonResponse({ success: true, user: sanitizeUser(user) });
        } catch {
          return jsonResponse({ success: false, error: "Invalid session" }, 401);
        }
      }

      // ====================================================================
      // LOGOUT - Acknowledge logout (actual invalidation is client-side)
      // ====================================================================
      case "logout": {
        // Note: JWT tokens are stateless, so logout is handled client-side
        // by removing the token from localStorage. This endpoint just acknowledges.
        console.log(`[site-auth] Logout acknowledged for site ${siteId}`);
        return jsonResponse({ success: true, message: "Logged out successfully" });
      }

      default:
        return jsonResponse({ success: false, error: `Unknown action: ${action}` }, 400);
    }
  } catch (error) {
    console.error("[site-auth] Error:", error);
    return jsonResponse(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      500
    );
  }
});

// ============================================================================
// Helper Functions
// ============================================================================

function jsonResponse(data: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function createSession(userId: string, siteId: string, email: string): Promise<SiteSession> {
  const expiresAt = Date.now() + SESSION_DURATION_MS;

  const token = await new SignJWT({
    userId,
    siteId,
    email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt / 1000))
    .sign(JWT_SECRET);

  return {
    token,
    expiresAt,
    siteId,
    userId,
  };
}

function sanitizeUser(user: Record<string, unknown>): SiteUser {
  return {
    id: user.id as string,
    email: user.email as string,
    name: user.name as string | null,
    metadata: (user.metadata as Record<string, unknown>) || {},
    created_at: user.created_at as string,
  };
}
