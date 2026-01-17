/**
 * Intent Router - Central handler for all button/form intents
 * Maps user actions to backend Edge Functions
 */

import { supabase } from "@/integrations/supabase/client";

export interface IntentPayload {
  businessId?: string;
  [key: string]: unknown;
}

export type IntentResult = {
  success: boolean;
  data?: unknown;
  error?: string;
};

// Intent to Edge Function mapping
const INTENT_FUNCTION_MAP: Record<string, string> = {
  // Leads Pack
  'contact.submit': 'create-lead',
  'newsletter.subscribe': 'create-lead',
  'join.waitlist': 'create-lead',
  
  // Booking Pack
  'booking.create': 'create-booking',
  'booking.cancel': 'create-booking',
  'booking.reschedule': 'create-booking',
  
  // Auth Pack (handled specially)
  'auth.signup': 'supabase-auth',
  'auth.signin': 'supabase-auth',
  'auth.signout': 'supabase-auth',
  
  // Dashboard
  'dashboard.open': 'navigation',
};

/**
 * Handle authentication intents using Supabase Auth directly
 */
async function handleAuthIntent(intent: string, payload: IntentPayload): Promise<IntentResult> {
  const { email, password } = payload as { email: string; password: string };
  
  switch (intent) {
    case "auth.signup": {
      if (!email || !password) {
        return { success: false, error: "Email and password are required" };
      }
      const { data, error } = await supabase.auth.signUp({ email, password });
      return error ? { success: false, error: error.message } : { success: true, data };
    }
    
    case "auth.signin": {
      if (!email || !password) {
        return { success: false, error: "Email and password are required" };
      }
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      return error ? { success: false, error: error.message } : { success: true, data };
    }
    
    case "auth.signout": {
      const { error } = await supabase.auth.signOut();
      return error ? { success: false, error: error.message } : { success: true };
    }
    
    default:
      return { success: false, error: "Unknown auth intent" };
  }
}

/**
 * Handle navigation intents
 */
function handleNavigationIntent(intent: string, payload: IntentPayload): IntentResult {
  switch (intent) {
    case "dashboard.open": {
      // Navigation handled client-side
      window.location.href = "/dashboard";
      return { success: true, data: { navigatedTo: "/dashboard" } };
    }
    default:
      return { success: false, error: "Unknown navigation intent" };
  }
}

/**
 * Main intent handler - routes intents to appropriate handlers/functions
 */
export async function handleIntent(intent: string, payload: IntentPayload): Promise<IntentResult> {
  console.log("[IntentRouter] Handling intent:", intent, payload);
  
  try {
    // Handle auth intents specially (no edge function needed)
    if (intent.startsWith("auth.")) {
      return await handleAuthIntent(intent, payload);
    }
    
    // Handle navigation intents
    if (intent === "dashboard.open") {
      return handleNavigationIntent(intent, payload);
    }
    
    // Get the edge function to call
    const functionName = INTENT_FUNCTION_MAP[intent];
    
    if (!functionName) {
      console.warn("[IntentRouter] Unknown intent:", intent);
      return { success: false, error: `Unknown intent: ${intent}` };
    }
    
    // Add action type for booking intents
    let enrichedPayload = { ...payload };
    if (intent === 'booking.cancel') {
      enrichedPayload.action = 'cancel';
    } else if (intent === 'booking.reschedule') {
      enrichedPayload.action = 'reschedule';
    } else if (intent === 'booking.create') {
      enrichedPayload.action = 'create';
    }
    
    // Add source for lead intents
    if (intent === 'contact.submit') {
      enrichedPayload.source = enrichedPayload.source || 'contact_form';
    } else if (intent === 'newsletter.subscribe') {
      enrichedPayload.source = enrichedPayload.source || 'newsletter';
    } else if (intent === 'join.waitlist') {
      enrichedPayload.source = enrichedPayload.source || 'waitlist';
    }
    
    // Call the edge function
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: enrichedPayload,
    });
    
    if (error) {
      console.error("[IntentRouter] Edge function error:", error);
      return { success: false, error: error.message };
    }
    
    // Edge functions return { success, data, error } format
    if (data && typeof data === 'object') {
      if ('success' in data) {
        return data as IntentResult;
      }
      return { success: true, data };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error("[IntentRouter] Error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Get all available intents (for AI assistant)
 */
export function getAvailableIntents(): string[] {
  return Object.keys(INTENT_FUNCTION_MAP);
}

/**
 * Check if an intent exists
 */
export function isValidIntent(intent: string): boolean {
  return intent in INTENT_FUNCTION_MAP;
}

/**
 * Get the pack name for an intent
 */
export function getIntentPack(intent: string): string | null {
  if (intent.startsWith('contact.') || intent.startsWith('newsletter.') || intent.startsWith('join.')) {
    return 'leads';
  }
  if (intent.startsWith('booking.')) {
    return 'booking';
  }
  if (intent.startsWith('auth.') || intent === 'dashboard.open') {
    return 'auth';
  }
  return null;
}

// Export for use in templates and AI assistant
export const AVAILABLE_INTENTS = getAvailableIntents();
export const INTENT_PACKS = {
  leads: ['contact.submit', 'newsletter.subscribe', 'join.waitlist'],
  booking: ['booking.create', 'booking.cancel', 'booking.reschedule'],
  auth: ['auth.signup', 'auth.signin', 'auth.signout', 'dashboard.open'],
};
