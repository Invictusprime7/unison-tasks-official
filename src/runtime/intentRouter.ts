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
import { CORE_INTENTS, type CoreIntent, isCoreIntent } from "@/coreIntents";


export interface IntentPayload {
  businessId?: string;
  [key: string]: unknown;
}

export type IntentResult = {
  success: boolean;
  status?: "ok" | "unsupported";
  message?: string;
  data?: unknown;
  error?: string;
};

type BackendHandler = 'create-lead' | 'create-booking';

// Locked: CoreIntent -> authoritative backend handler
const BACKEND_HANDLERS: Record<CoreIntent, BackendHandler> = {
  'contact.submit': 'create-lead',
  'newsletter.subscribe': 'create-lead',
  'quote.request': 'create-lead',
  'booking.create': 'create-booking',
};

const LEAD_SOURCE_MAP: Record<CoreIntent, string> = {
  'contact.submit': 'contact_form',
  'newsletter.subscribe': 'newsletter',
  'quote.request': 'quote_request',
  // booking.create is not a lead source
  'booking.create': 'booking',
};

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function assertBusinessId(payload: IntentPayload): { ok: true; businessId: string } | { ok: false; error: string } {
  const businessId = typeof payload.businessId === 'string' ? payload.businessId : '';
  if (!businessId) return { ok: false as const, error: 'Missing businessId (this site is not configured for a business yet).' };
  if (!isUuid(businessId)) return { ok: false as const, error: 'Invalid businessId.' };
  return { ok: true as const, businessId };
}

function normalizeLeadPayload(intent: CoreIntent, payload: IntentPayload) {
  // Basic contact fields may come from various form names
  const email = String(payload.email ?? payload.customerEmail ?? '').trim();
  const name = String(payload.name ?? payload.fullName ?? payload.customerName ?? '').trim() || undefined;
  const phone = String(payload.phone ?? payload.customerPhone ?? '').trim() || undefined;
  const message = String(payload.message ?? payload.notes ?? '').trim() || undefined;

  const now = new Date().toISOString();
  const page = typeof window !== 'undefined' ? window.location.href : undefined;

  const metadata = {
    intent,
    timestamp: now,
    page,
    templateId: typeof payload.templateId === 'string' ? payload.templateId : undefined,
    source: payload._source ?? undefined,
  };

  return {
    // create-lead expects these keys
    businessId: payload.businessId,
    intent,
    source: payload.source || LEAD_SOURCE_MAP[intent],
    email,
    name,
    phone,
    message,
    metadata,
  };
}

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

  // Locked surface (authoritative).
  // Non-core intents may still exist in templates, but they are preview-only and cannot persist/publish.
  if (!isCoreIntent(intent)) {
    const message = "This intent is not production-supported yet";
    console.warn("[IntentRouter] Unsupported intent (not CoreIntent):", intent);
    return { success: false, status: "unsupported", message, error: message };
  }

  // Production safety: require real businessId for execution
  const biz = assertBusinessId(payload);
  if (!biz.ok) return { success: false, error: ('error' in biz ? biz.error : 'Invalid businessId') };
  
  try {
    const handler = BACKEND_HANDLERS[intent];

    // Normalize payload per intent, then call authoritative backend handler.
    let body: Record<string, unknown> = { ...payload };
    if (intent === 'contact.submit' || intent === 'newsletter.subscribe' || intent === 'quote.request') {
      body = normalizeLeadPayload(intent, payload);
    }

    if (intent === 'booking.create') {
      body = {
        ...payload,
        businessId: payload.businessId,
        action: 'create',
        // Transform pipeline field names to edge function expected format
        customerName: (payload.customerName || payload.name) ?? undefined,
        customerEmail: (payload.customerEmail || payload.email) ?? undefined,
        customerPhone: (payload.customerPhone || payload.phone) ?? undefined,
        startsAt:
          payload.startsAt ||
          (payload.date && payload.time ? new Date(`${payload.date}T${payload.time}:00`).toISOString() : undefined),
        serviceName: (payload.serviceName || payload.service) ?? undefined,
        metadata: {
          intent,
          timestamp: new Date().toISOString(),
          page: typeof window !== 'undefined' ? window.location.href : undefined,
          templateId: typeof payload.templateId === 'string' ? payload.templateId : undefined,
          source: payload._source ?? undefined,
        },
      };
    }

    const { data, error } = await supabase.functions.invoke(handler, { body });
    
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
  return [...CORE_INTENTS];
}

/**
 * Check if an intent exists
 */
export function isValidIntent(intent: string): boolean {
  return isCoreIntent(intent);
}

/**
 * True if this intent has a registered backend handler.
 * Used for publish gating.
 */
export function hasBackendHandler(intent: string): boolean {
  return isCoreIntent(intent) && !!BACKEND_HANDLERS[intent];
}

/**
 * Get the pack name for an intent
 */
export function getIntentPack(intent: string): string | null {
  if (intent === 'booking.create') return 'booking';
  if (intent === 'newsletter.subscribe' || intent === 'contact.submit' || intent === 'quote.request') return 'leads';
  return null;
}

/**
 * Get the function name for an intent
 */
export function getIntentFunction(intent: string): string | null {
  if (!isCoreIntent(intent)) return null;
  return BACKEND_HANDLERS[intent] || null;
}

// Export for use in templates and AI assistant
export const AVAILABLE_INTENTS = getAvailableIntents();
export const INTENT_PACKS = {
  leads: ['contact.submit', 'newsletter.subscribe', 'quote.request'],
  booking: ['booking.create'],
};
