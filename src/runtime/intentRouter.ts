/**
 * Intent Router - Central handler for all button/form intents
 * Maps user actions to backend Edge Functions
 * 
 * Supports full end-to-end CTA handling across all template categories:
 * - Landing: trials, demos, signups
 * - Portfolio: project inquiries, contact
 * - Restaurant: reservations, orders
 * - E-commerce: cart, checkout, wishlist
 * - Blog: subscriptions, comments
 * - Contractor: quotes, service booking
 * - Agency: project briefs, consultations
 * - Startup: waitlists, beta signups
 */

import { supabase } from "@/integrations/supabase/client";
import { getDemoResponse, type BusinessSystemType } from "@/data/templates";


export interface IntentPayload {
  businessId?: string;
  [key: string]: unknown;
}

export type IntentResult = {
  success: boolean;
  data?: unknown;
  error?: string;
};

// Intent to Edge Function mapping - comprehensive for all template types
const INTENT_FUNCTION_MAP: Record<string, string> = {
  // ============================================
  // LEADS PACK - Contact forms, newsletters, waitlists
  // ============================================
  'contact.submit': 'create-lead',
  'newsletter.subscribe': 'create-lead',
  'join.waitlist': 'create-lead',
  'beta.apply': 'create-lead',
  
  // ============================================
  // BOOKING PACK - Reservations, appointments, services
  // ============================================
  'booking.create': 'create-booking',
  'booking.cancel': 'create-booking',
  'booking.reschedule': 'create-booking',
  'calendar.book': 'create-booking',
  
  // ============================================
  // AUTH PACK - Authentication
  // ============================================
  'auth.signup': 'supabase-auth',
  'auth.signin': 'supabase-auth',
  'auth.signout': 'supabase-auth',
  
  // ============================================
  // SALES & DEMOS
  // ============================================
  'trial.start': 'create-lead',
  'demo.request': 'create-lead',
  'sales.contact': 'create-lead',
  'quote.request': 'create-lead',
  'project.start': 'create-lead',
  'project.inquire': 'create-lead',
  'consultation.book': 'create-booking',
  
  // ============================================
  // E-COMMERCE
  // ============================================
  'cart.add': 'workflow-trigger',
  'cart.view': 'navigation',
  'checkout.start': 'workflow-trigger',
  'wishlist.add': 'workflow-trigger',
  'product.compare': 'workflow-trigger',
  'notify.restock': 'create-lead',
  'shop.browse': 'navigation',
  
  // ============================================
  // RESTAURANT
  // ============================================
  'order.online': 'workflow-trigger',
  'order.pickup': 'workflow-trigger',
  'order.delivery': 'workflow-trigger',
  'menu.view': 'navigation',
  'gift.purchase': 'workflow-trigger',
  'event.inquire': 'create-lead',
  
  // ============================================
  // CONTENT & BLOG
  // ============================================
  'content.read': 'navigation',
  'content.share': 'workflow-trigger',
  'content.bookmark': 'workflow-trigger',
  'author.follow': 'workflow-trigger',
  'comment.submit': 'workflow-trigger',
  
  // ============================================
  // CONTRACTOR/SERVICE
  // ============================================
  'emergency.service': 'create-lead',
  'call.now': 'navigation',
  
  // ============================================
  // PORTFOLIO/AGENCY
  // ============================================
  'portfolio.view': 'navigation',
  'case.study': 'navigation',
  'resume.download': 'workflow-trigger',
  
  // ============================================
  // NAVIGATION & DASHBOARD
  // ============================================
  'dashboard.open': 'navigation',
  'pricing.view': 'navigation',
};

// Lead source mappings for different intents
const LEAD_SOURCE_MAP: Record<string, string> = {
  'contact.submit': 'contact_form',
  'newsletter.subscribe': 'newsletter',
  'join.waitlist': 'waitlist',
  'beta.apply': 'beta_application',
  'trial.start': 'trial_signup',
  'demo.request': 'demo_request',
  'sales.contact': 'sales_inquiry',
  'quote.request': 'quote_request',
  'project.start': 'project_brief',
  'project.inquire': 'project_inquiry',
  'emergency.service': 'emergency_request',
  'event.inquire': 'event_inquiry',
  'notify.restock': 'restock_notification',
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
  const { target, action } = payload as { target?: string; action?: string };
  
  switch (intent) {
    case "dashboard.open":
      window.location.href = "/dashboard";
      return { success: true, data: { navigatedTo: "/dashboard" } };
    
    case "cart.view":
      // Emit cart view event for listeners
      window.dispatchEvent(new CustomEvent('intent:cart.view'));
      return { success: true, data: { action: 'cart_opened' } };
    
    case "menu.view":
      // Scroll to menu section or emit event
      const menuEl = document.querySelector('#menu, [data-section="menu"]');
      if (menuEl) {
        menuEl.scrollIntoView({ behavior: 'smooth' });
      }
      return { success: true, data: { action: 'scrolled_to_menu' } };
    
    case "pricing.view":
      const pricingEl = document.querySelector('#pricing, [data-section="pricing"]');
      if (pricingEl) {
        pricingEl.scrollIntoView({ behavior: 'smooth' });
      }
      return { success: true, data: { action: 'scrolled_to_pricing' } };
    
    case "portfolio.view":
      const workEl = document.querySelector('#work, #portfolio, [data-section="work"]');
      if (workEl) {
        workEl.scrollIntoView({ behavior: 'smooth' });
      }
      return { success: true, data: { action: 'scrolled_to_work' } };
    
    case "shop.browse":
      window.dispatchEvent(new CustomEvent('intent:shop.browse'));
      return { success: true, data: { action: 'shop_opened' } };
    
    case "content.read":
      if (target) {
        window.location.href = target;
      }
      return { success: true, data: { action: 'navigated_to_content' } };
    
    case "case.study":
      if (target) {
        window.location.href = target;
      }
      return { success: true, data: { action: 'navigated_to_case_study' } };
    
    case "call.now":
      const phone = payload.phone || payload.phoneNumber;
      if (phone) {
        window.location.href = `tel:${phone}`;
      }
      return { success: true, data: { action: 'phone_call_initiated' } };
    
    default:
      return { success: false, error: "Unknown navigation intent" };
  }
}

/**
 * Handle workflow trigger intents (cart, orders, etc.)
 */
async function handleWorkflowIntent(intent: string, payload: IntentPayload): Promise<IntentResult> {
  console.log("[IntentRouter] Triggering workflow:", intent, payload);
  
  try {
    const { data, error } = await supabase.functions.invoke('workflow-trigger', {
      body: {
        eventType: 'button_click',
        buttonId: intent,
        buttonLabel: intent.split('.').pop(),
        payload,
      }
    });
    
    if (error) {
      console.error("[IntentRouter] Workflow error:", error);
      // Don't fail - emit event for local handling
      window.dispatchEvent(new CustomEvent(`intent:${intent}`, { detail: payload }));
      return { success: true, data: { handled: 'local', intent } };
    }
    
    window.dispatchEvent(new CustomEvent(`intent:${intent}`, { detail: { ...payload, workflowResult: data } }));
    return { success: true, data };
  } catch {
    // Fallback to local event
    window.dispatchEvent(new CustomEvent(`intent:${intent}`, { detail: payload }));
    return { success: true, data: { handled: 'local', intent } };
  }
}

// Default businessId for templates (can be overridden by location state or template config)
let defaultBusinessId: string | null = null;
let currentSystemType: BusinessSystemType | null = null;
let isDemoMode: boolean = false;

/**
 * Set the default business ID for intent routing
 * Called from WebBuilder when loading a template with context
 */
export function setDefaultBusinessId(businessId: string | null): void {
  defaultBusinessId = businessId;
  console.log("[IntentRouter] Default businessId set:", businessId);
}

/**
 * Get the current default business ID
 */
export function getDefaultBusinessId(): string | null {
  return defaultBusinessId;
}

/**
 * Set the current system type for demo mode responses
 */
export function setCurrentSystemType(systemType: BusinessSystemType | null): void {
  currentSystemType = systemType;
  console.log("[IntentRouter] System type set:", systemType);
}

/**
 * Enable or disable demo mode
 * In demo mode, intents return mocked success responses instead of calling backend
 */
export function setDemoMode(enabled: boolean): void {
  isDemoMode = enabled;
  console.log("[IntentRouter] Demo mode:", enabled ? "enabled" : "disabled");
}

/**
 * Check if demo mode is active
 */
export function isDemoModeActive(): boolean {
  return isDemoMode;
}

/**
 * Main intent handler - routes intents to appropriate handlers/functions
 */
export async function handleIntent(intent: string, payload: IntentPayload): Promise<IntentResult> {
  console.log("[IntentRouter] Handling intent:", intent, payload, { isDemoMode, currentSystemType });
  
  // Handle demo mode - return mocked responses
  if (isDemoMode && currentSystemType) {
    const demoResponse = getDemoResponse(currentSystemType, intent);
    if (demoResponse) {
      console.log("[IntentRouter] Demo mode response:", demoResponse);
      return {
        success: demoResponse.success,
        data: demoResponse.data,
        error: demoResponse.success ? undefined : demoResponse.message,
      };
    }
  }
  
  // Inject default businessId if not provided
  if (!payload.businessId && defaultBusinessId) {
    payload.businessId = defaultBusinessId;
    console.log("[IntentRouter] Injected default businessId:", defaultBusinessId);
  }
  
  // Generate a fallback businessId if still missing (for demo/preview mode)
  if (!payload.businessId) {
    // IMPORTANT: must be a UUID because backend tables commonly type business_id as uuid
    payload.businessId = crypto.randomUUID();
    console.log("[IntentRouter] Generated fallback businessId:", payload.businessId);
  }
  
  try {
    // Handle auth intents specially (no edge function needed)
    if (intent.startsWith("auth.")) {
      return await handleAuthIntent(intent, payload);
    }
    
    // Get the edge function to call
    const functionName = INTENT_FUNCTION_MAP[intent];
    
    if (!functionName) {
      console.warn("[IntentRouter] Unknown intent:", intent);
      // Emit as custom event for potential local handling
      window.dispatchEvent(new CustomEvent(`intent:${intent}`, { detail: payload }));
      return { success: true, data: { handled: 'event', intent } };
    }
    
    // Handle navigation intents
    if (functionName === 'navigation') {
      return handleNavigationIntent(intent, payload);
    }
    
    // Handle workflow trigger intents
    if (functionName === 'workflow-trigger') {
      return await handleWorkflowIntent(intent, payload);
    }
    
    // Enrich payload based on intent type
    let enrichedPayload = { ...payload };
    
    // Add source for lead intents
    if (LEAD_SOURCE_MAP[intent]) {
      enrichedPayload.source = enrichedPayload.source || LEAD_SOURCE_MAP[intent];
    }
    
    // Add action type for booking intents
    if (intent === 'booking.cancel') {
      enrichedPayload.action = 'cancel';
    } else if (intent === 'booking.reschedule') {
      enrichedPayload.action = 'reschedule';
    } else if (intent === 'booking.create' || intent === 'calendar.book' || intent === 'consultation.book') {
      enrichedPayload.action = 'create';
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
  return intent in INTENT_FUNCTION_MAP || intent.startsWith('custom.');
}

/**
 * Get the pack name for an intent
 */
export function getIntentPack(intent: string): string | null {
  if (intent.startsWith('contact.') || intent.startsWith('newsletter.') || intent.startsWith('join.') ||
      intent.startsWith('demo.') || intent.startsWith('quote.') || intent.startsWith('project.') ||
      intent.startsWith('sales.') || intent.startsWith('beta.') || intent.startsWith('trial.') ||
      intent.startsWith('emergency.') || intent.startsWith('event.') || intent.startsWith('notify.')) {
    return 'leads';
  }
  if (intent.startsWith('booking.') || intent.startsWith('calendar.') || intent.startsWith('consultation.')) {
    return 'booking';
  }
  if (intent.startsWith('auth.') || intent === 'dashboard.open') {
    return 'auth';
  }
  if (intent.startsWith('cart.') || intent.startsWith('checkout.') || intent.startsWith('wishlist.') ||
      intent.startsWith('shop.') || intent.startsWith('product.')) {
    return 'ecommerce';
  }
  if (intent.startsWith('order.') || intent.startsWith('menu.') || intent.startsWith('gift.')) {
    return 'restaurant';
  }
  if (intent.startsWith('content.') || intent.startsWith('author.') || intent.startsWith('comment.')) {
    return 'content';
  }
  if (intent.startsWith('portfolio.') || intent.startsWith('case.') || intent.startsWith('resume.')) {
    return 'portfolio';
  }
  return null;
}

/**
 * Get the function name for an intent
 */
export function getIntentFunction(intent: string): string | null {
  return INTENT_FUNCTION_MAP[intent] || null;
}

// Export for use in templates and AI assistant
export const AVAILABLE_INTENTS = getAvailableIntents();
export const INTENT_PACKS = {
  leads: [
    'contact.submit', 'newsletter.subscribe', 'join.waitlist', 'beta.apply',
    'trial.start', 'demo.request', 'sales.contact', 'quote.request',
    'project.start', 'project.inquire', 'emergency.service', 'event.inquire', 'notify.restock'
  ],
  booking: ['booking.create', 'booking.cancel', 'booking.reschedule', 'calendar.book', 'consultation.book'],
  auth: ['auth.signup', 'auth.signin', 'auth.signout', 'dashboard.open'],
  ecommerce: ['cart.add', 'cart.view', 'checkout.start', 'wishlist.add', 'product.compare', 'shop.browse'],
  restaurant: ['order.online', 'order.pickup', 'order.delivery', 'menu.view', 'gift.purchase'],
  content: ['content.read', 'content.share', 'content.bookmark', 'author.follow', 'comment.submit'],
  portfolio: ['portfolio.view', 'case.study', 'resume.download'],
  navigation: ['pricing.view', 'call.now'],
};
