/**
 * INTENT ROUTER - Canonical execution surface for all CoreIntents
 * 
 * This is the single backend entrypoint that:
 * - Validates businessId and CoreIntent
 * - Persists CRM records (leads, contacts, etc.)
 * - Sends internal notifications using business settings
 * - Returns success/error payload to UI
 * 
 * Every CoreIntent from published templates routes through here.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Navigation intents - client-side only, no backend persistence
const NAV_INTENTS = [
  "nav.goto",
  "nav.anchor",
  "nav.external",
] as const;

// Payment intents - create checkout sessions
const PAY_INTENTS = [
  "pay.checkout",
  "pay.success",
  "pay.cancel",
] as const;

// Action intents - CRM persistence + notifications
const ACTION_INTENTS = [
  "contact.submit",
  "contact.call",
  "contact.email",
  "cta.primary",
  "cta.secondary",
  "booking.create",  // Synced with src/coreIntents.ts
  "quote.request",
  "newsletter.subscribe",
  "lead.capture",
] as const;

// Core Intents that are allowed in production
const CORE_INTENTS = [
  ...NAV_INTENTS,
  ...PAY_INTENTS,
  ...ACTION_INTENTS,
] as const;

type CoreIntent = typeof CORE_INTENTS[number];
type NavIntent = typeof NAV_INTENTS[number];
type PayIntent = typeof PAY_INTENTS[number];
type ActionIntent = typeof ACTION_INTENTS[number];

interface IntentPayload {
  intent: string;
  businessId: string;
  projectId?: string;
  data: Record<string, any>;
  source?: "preview" | "published" | "api";
  sourceUrl?: string;
  visitorId?: string;
}

interface IntentResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: Record<string, any>;
}

// Validate that intent is a CoreIntent
function isCoreIntent(intent: string): intent is CoreIntent {
  return CORE_INTENTS.includes(intent as CoreIntent);
}

// Get Supabase admin client
function getSupabaseAdmin() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables");
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Load business settings for notification dispatch
async function loadBusinessSettings(supabase: any, businessId: string) {
  const { data, error } = await supabase
    .from("businesses")
    .select("name, notification_email, notification_phone, timezone, settings")
    .eq("id", businessId)
    .maybeSingle();
  
  if (error) {
    console.error("[intent-router] Failed to load business settings:", error);
    return null;
  }
  
  return data;
}

// Get email provider configuration for a business
async function getEmailProvider(supabase: any, businessId: string) {
  // Check installed_packs for email configuration
  const { data: pack } = await supabase
    .from("installed_packs")
    .select("config")
    .eq("business_id", businessId)
    .eq("pack_id", "email")
    .eq("status", "active")
    .maybeSingle();
  
  if (pack?.config) {
    return pack.config;
  }
  
  // Fallback: check business owner's user_settings for legacy email setup
  const { data: biz } = await supabase
    .from("businesses")
    .select("owner_id")
    .eq("id", businessId)
    .maybeSingle();
  
  if (biz?.owner_id) {
    const { data: settings } = await supabase
      .from("user_settings")
      .select("settings")
      .eq("user_id", biz.owner_id)
      .maybeSingle();
    
    if (settings?.settings?.emailProvider) {
      return {
        provider: settings.settings.emailProvider,
        configured: settings.settings[`${settings.settings.emailProvider}_configured`] || false,
      };
    }
  }
  
  return null;
}

// Send notification email using Resend
async function sendNotificationEmail(
  to: string,
  subject: string,
  html: string,
  replyTo?: string | null
): Promise<boolean> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  
  if (!apiKey) {
    console.warn("[intent-router] RESEND_API_KEY not configured, skipping email");
    return false;
  }
  
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Notifications <onboarding@resend.dev>",
        to: [to],
        subject,
        html,
        reply_to: replyTo || undefined,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("[intent-router] Resend API error:", response.status, errorText);
      return false;
    }
    
    const result = await response.json();
    console.log("[intent-router] Email sent successfully:", result.id);
    return true;
  } catch (error) {
    console.error("[intent-router] Failed to send email:", error);
    return false;
  }
}

// Create a CRM lead record
async function createLead(
  supabase: any,
  businessId: string,
  projectId: string | undefined,
  data: Record<string, any>
) {
  // First try the 'leads' table (simpler schema)
  const leadsData = {
    business_id: businessId,
    email: data.email || "",
    name: data.name || data.fullName || null,
    phone: data.phone || data.phoneNumber || null,
    message: data.message || data.notes || null,
    source: data.source || "website",
    metadata: {
      projectId: projectId || null,
      firstName: data.firstName || data.first_name || null,
      lastName: data.lastName || data.last_name || null,
      company: data.company || data.organization || null,
      sourceUrl: data.sourceUrl || null,
      rawData: data,
    },
  };
  
  const { data: lead, error } = await supabase
    .from("leads")
    .insert(leadsData)
    .select()
    .single();
  
  if (!error) {
    return lead;
  }
  
  console.log("[intent-router] leads insert failed, trying crm_leads:", error.message);
  
  // Fallback to crm_leads table (different schema)
  const crmLeadsData = {
    business_id: businessId,
    email: data.email || null,
    name: data.name || data.fullName || null,
    status: "new",
    source: data.source || "website",
    notes: data.message || data.notes || null,
    intent: data.intent || null,
    metadata: {
      projectId: projectId || null,
      phone: data.phone || data.phoneNumber || null,
      firstName: data.firstName || data.first_name || null,
      lastName: data.lastName || data.last_name || null,
      company: data.company || data.organization || null,
      sourceUrl: data.sourceUrl || null,
      rawData: data,
    },
  };
  
  const { data: crmLead, error: crmError } = await supabase
    .from("crm_leads")
    .insert(crmLeadsData)
    .select()
    .single();
  
  if (crmError) {
    console.error("[intent-router] Failed to create lead:", crmError);
    throw new Error("Failed to save lead");
  }
  
  return crmLead;
}

// Record intent execution for audit/analytics
async function recordIntentExecution(
  supabase: any,
  payload: IntentPayload,
  result: IntentResult,
  durationMs: number
) {
  try {
    await supabase.from("intent_executions").insert({
      business_id: payload.businessId,
      project_id: payload.projectId || null,
      intent_name: payload.intent,
      intent_payload: payload.data,
      source: payload.source || "published",
      source_url: payload.sourceUrl || null,
      visitor_id: payload.visitorId || null,
      status: result.success ? "success" : "failed",
      result: result.data || null,
      error_message: result.error || null,
      duration_ms: durationMs,
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    });
  } catch (e) {
    console.warn("[intent-router] Failed to record execution:", e);
  }
}

// Handle contact.submit intent
async function handleContactSubmit(
  supabase: any,
  businessId: string,
  projectId: string | undefined,
  data: Record<string, any>
): Promise<IntentResult> {
  // 1. Create lead record
  const lead = await createLead(supabase, businessId, projectId, data);
  
  // 2. Load business settings for notification
  const bizSettings = await loadBusinessSettings(supabase, businessId);
  
  // 3. Send notification email to business owner
  if (bizSettings?.notification_email) {
    const subject = `New Contact Form Submission${bizSettings.name ? ` - ${bizSettings.name}` : ""}`;
    const html = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${data.name || data.firstName || "Not provided"}</p>
      <p><strong>Email:</strong> ${data.email || "Not provided"}</p>
      <p><strong>Phone:</strong> ${data.phone || "Not provided"}</p>
      <p><strong>Message:</strong></p>
      <p>${data.message || "No message"}</p>
      <hr />
      <p style="color: #666; font-size: 12px;">
        Submitted via your website. Lead ID: ${lead.id}
      </p>
    `;
    
    await sendNotificationEmail(
      bizSettings.notification_email,
      subject,
      html,
      data.email // reply to the submitter
    );
  }
  
  return {
    success: true,
    message: "Thank you! We'll be in touch soon.",
    data: { leadId: lead.id },
  };
}

// Handle newsletter.subscribe intent
async function handleNewsletterSubscribe(
  supabase: any,
  businessId: string,
  projectId: string | undefined,
  data: Record<string, any>
): Promise<IntentResult> {
  if (!data.email) {
    return { success: false, error: "Email is required" };
  }
  
  // Check for existing subscription
  const { data: existing } = await supabase
    .from("newsletter_subscribers")
    .select("id")
    .eq("business_id", businessId)
    .eq("email", data.email)
    .maybeSingle();
  
  if (existing) {
    return { success: true, message: "You're already subscribed!" };
  }
  
  // Create subscription
  const { data: subscriber, error } = await supabase
    .from("newsletter_subscribers")
    .insert({
      business_id: businessId,
      project_id: projectId || null,
      email: data.email,
      name: data.name || null,
      status: "active",
      source: data.source || "website",
      created_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) {
    // Table might not exist - just record as a lead
    await createLead(supabase, businessId, projectId, {
      ...data,
      source: "newsletter_signup",
    });
    
    return {
      success: true,
      message: "Thanks for subscribing!",
    };
  }
  
  return {
    success: true,
    message: "Thanks for subscribing!",
    data: { subscriberId: subscriber.id },
  };
}

// Handle booking.request intent
async function handleBookingRequest(
  supabase: any,
  businessId: string,
  projectId: string | undefined,
  data: Record<string, any>
): Promise<IntentResult> {
  // Extract and normalize customer contact info
  const customerName = data.name || data.customerName || data.fullName || "";
  const customerEmail = data.email || data.customerEmail || "";
  const customerPhone = data.phone || data.customerPhone || data.phoneNumber || null;
  const serviceName = data.service || data.serviceName || data.serviceType || "Appointment";
  const notes = data.notes || data.message || null;
  
  // Parse date/time - handle various input formats
  const dateInput = data.date || data.preferredDate || data.bookingDate;
  const timeInput = data.time || data.preferredTime || data.bookingTime || "09:00";
  
  // Create booking date and time
  let bookingDate: string;
  let bookingTime: string;
  let startsAt: string | null = null;
  
  if (dateInput) {
    const parsedDate = new Date(dateInput);
    if (!isNaN(parsedDate.getTime())) {
      bookingDate = parsedDate.toISOString().split('T')[0];
      bookingTime = timeInput || "09:00:00";
      
      // Create full timestamp for starts_at
      const [hours, minutes] = bookingTime.split(':');
      parsedDate.setHours(parseInt(hours) || 9, parseInt(minutes) || 0, 0, 0);
      startsAt = parsedDate.toISOString();
    } else {
      bookingDate = new Date().toISOString().split('T')[0];
      bookingTime = timeInput || "09:00:00";
    }
  } else {
    bookingDate = new Date().toISOString().split('T')[0];
    bookingTime = timeInput || "09:00:00";
  }
  
  // 1. Create lead record with booking context
  const lead = await createLead(supabase, businessId, projectId, {
    email: customerEmail,
    name: customerName,
    phone: customerPhone,
    source: "booking_request",
    message: notes,
  });
  
  // 2. Create booking record with correct schema columns
  let bookingId: string | null = null;
  const bookingData = {
    business_id: businessId,
    customer_name: customerName,
    customer_email: customerEmail,
    customer_phone: customerPhone,
    service_name: serviceName,
    booking_date: bookingDate,
    booking_time: bookingTime,
    starts_at: startsAt,
    duration_minutes: data.duration || 60,
    notes: notes,
    status: "pending",
    metadata: {
      leadId: lead.id,
      projectId: projectId || null,
      rawData: data,
    },
  };
  
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert(bookingData)
    .select("id")
    .single();
  
  if (bookingError) {
    console.warn("[intent-router] Booking insert failed:", bookingError.message);
  } else {
    bookingId = booking?.id;
    console.log("[intent-router] Booking created:", bookingId);
  }
  
  // 3. Send notification email to business owner
  const bizSettings = await loadBusinessSettings(supabase, businessId);
  if (bizSettings?.notification_email) {
    const subject = `New Booking: ${serviceName}${bizSettings.name ? ` - ${bizSettings.name}` : ""}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #4f46e5; padding-bottom: 10px;">
          New Booking Request
        </h2>
        
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #4f46e5;">Customer Details</h3>
          <p><strong>Name:</strong> ${customerName || "Not provided"}</p>
          <p><strong>Email:</strong> <a href="mailto:${customerEmail}">${customerEmail || "Not provided"}</a></p>
          <p><strong>Phone:</strong> ${customerPhone ? `<a href="tel:${customerPhone}">${customerPhone}</a>` : "Not provided"}</p>
        </div>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #16a34a;">Appointment Details</h3>
          <p><strong>Service:</strong> ${serviceName}</p>
          <p><strong>Date:</strong> ${bookingDate}</p>
          <p><strong>Time:</strong> ${bookingTime}</p>
          ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ""}
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #6b7280; font-size: 12px;">
          ${bookingId ? `Booking ID: ${bookingId} | ` : ""}Lead ID: ${lead.id}<br/>
          Reply to this email to contact the customer directly.
        </p>
      </div>
    `;
    
    const emailSent = await sendNotificationEmail(
      bizSettings.notification_email,
      subject,
      html,
      customerEmail // Allow reply-to customer
    );
    
    console.log("[intent-router] Booking notification email sent:", emailSent);
  } else {
    console.warn("[intent-router] No notification_email configured for business:", businessId);
  }
  
  return {
    success: true,
    message: "Booking confirmed! We'll send you a confirmation shortly.",
    data: { 
      leadId: lead.id,
      bookingId: bookingId,
      customerEmail: customerEmail,
      date: bookingDate,
      time: bookingTime,
    },
  };
}

// Handle quote.request intent
async function handleQuoteRequest(
  supabase: any,
  businessId: string,
  projectId: string | undefined,
  data: Record<string, any>
): Promise<IntentResult> {
  // Create lead with quote context
  const lead = await createLead(supabase, businessId, projectId, {
    ...data,
    source: "quote_request",
  });
  
  // Send notification
  const bizSettings = await loadBusinessSettings(supabase, businessId);
  if (bizSettings?.notification_email) {
    const subject = `New Quote Request${bizSettings.name ? ` - ${bizSettings.name}` : ""}`;
    const html = `
      <h2>New Quote Request</h2>
      <p><strong>Name:</strong> ${data.name || "Not provided"}</p>
      <p><strong>Email:</strong> ${data.email || "Not provided"}</p>
      <p><strong>Phone:</strong> ${data.phone || "Not provided"}</p>
      <p><strong>Company:</strong> ${data.company || "Not provided"}</p>
      <p><strong>Details:</strong></p>
      <p>${data.details || data.message || data.requirements || "No details provided"}</p>
    `;
    
    await sendNotificationEmail(bizSettings.notification_email, subject, html, data.email);
  }
  
  return {
    success: true,
    message: "Quote request received! We'll get back to you with a quote soon.",
    data: { leadId: lead.id },
  };
}

// Handle CTA intents (primary/secondary)
async function handleCTA(
  supabase: any,
  businessId: string,
  projectId: string | undefined,
  data: Record<string, any>,
  ctaType: "primary" | "secondary"
): Promise<IntentResult> {
  // CTAs typically navigate or trigger actions, but if they capture data...
  if (data.email || data.name || data.phone) {
    await createLead(supabase, businessId, projectId, {
      ...data,
      source: `cta_${ctaType}`,
    });
  }
  
  // Record the CTA click
  await supabase.from("cta_clicks").insert({
    business_id: businessId,
    project_id: projectId || null,
    cta_type: ctaType,
    cta_label: data.label || data.ctaLabel || null,
    cta_action: data.action || data.href || null,
    visitor_id: data.visitorId || null,
    created_at: new Date().toISOString(),
  }).catch(() => {
    // Table might not exist - that's okay
  });
  
  return {
    success: true,
    message: "Action recorded",
    data: { ctaType },
  };
}

// Main intent router
async function routeIntent(payload: IntentPayload): Promise<IntentResult> {
  const supabase = getSupabaseAdmin();
  const startTime = Date.now();
  
  // Validate required fields
  if (!payload.businessId) {
    return { success: false, error: "businessId is required" };
  }
  
  if (!payload.intent) {
    return { success: false, error: "intent is required" };
  }
  
  // Check if this is a CoreIntent (production-allowed)
  if (!isCoreIntent(payload.intent)) {
    // Non-core intents only work in preview mode
    if (payload.source !== "preview") {
      return {
        success: false,
        error: `Intent "${payload.intent}" is not a CoreIntent. Only CoreIntents are allowed in production.`,
      };
    }
    
    // Allow in preview but log warning
    console.log(`[intent-router] Non-core intent "${payload.intent}" allowed in preview mode`);
  }
  
  let result: IntentResult;
  
  try {
    // Route to appropriate handler
    switch (payload.intent) {
      case "contact.submit":
      case "lead.capture":
        result = await handleContactSubmit(supabase, payload.businessId, payload.projectId, payload.data);
        break;
      
      case "newsletter.subscribe":
        result = await handleNewsletterSubscribe(supabase, payload.businessId, payload.projectId, payload.data);
        break;
      
      case "booking.create":
        result = await handleBookingRequest(supabase, payload.businessId, payload.projectId, payload.data);
        break;
      
      case "quote.request":
        result = await handleQuoteRequest(supabase, payload.businessId, payload.projectId, payload.data);
        break;
      
      case "cta.primary":
        result = await handleCTA(supabase, payload.businessId, payload.projectId, payload.data, "primary");
        break;
      
      case "cta.secondary":
        result = await handleCTA(supabase, payload.businessId, payload.projectId, payload.data, "secondary");
        break;
      
      case "contact.call":
      case "contact.email":
        // These are typically client-side actions (tel: or mailto: links)
        // Just record the intent
        result = { success: true, message: "Intent recorded" };
        break;
      
      default:
        // Unknown intent - record as generic lead if it has contact info
        if (payload.data.email || payload.data.phone) {
          await createLead(supabase, payload.businessId, payload.projectId, {
            ...payload.data,
            source: payload.intent,
          });
        }
        result = { success: true, message: "Intent processed" };
    }
  } catch (error: any) {
    console.error("[intent-router] Error processing intent:", error);
    result = {
      success: false,
      error: error.message || "Failed to process intent",
    };
  }
  
  // Record execution for analytics
  const durationMs = Date.now() - startTime;
  await recordIntentExecution(supabase, payload, result, durationMs);
  
  return result;
}

// HTTP server
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  
  try {
    const payload: IntentPayload = await req.json();
    const result = await routeIntent(payload);
    
    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[intent-router] Request error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
