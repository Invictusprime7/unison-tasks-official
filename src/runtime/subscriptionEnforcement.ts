/**
 * Subscription Enforcement for Intent Execution
 * 
 * Checks user subscription status and entitlements before allowing
 * certain intents to execute.
 * 
 * This ensures:
 * - Users can't exceed their plan limits
 * - Premium features require active subscriptions
 * - Graceful upgrade prompts when limits are hit
 */

import { supabase } from '@/integrations/supabase/client';
import type { IntentResult, IntentContext } from './intentExecutor';

// ============ TYPES ============

export interface SubscriptionStatus {
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'none';
  limits: {
    checkouts_monthly: number;
    bookings_monthly: number;
    leads_monthly: number;
    storage_gb: number;
  };
  usage: {
    checkouts_this_month: number;
    bookings_this_month: number;
    leads_this_month: number;
  };
}

// Plan limits
const PLAN_LIMITS: Record<string, SubscriptionStatus['limits']> = {
  free: {
    checkouts_monthly: 5,
    bookings_monthly: 10,
    leads_monthly: 50,
    storage_gb: 1,
  },
  starter: {
    checkouts_monthly: 100,
    bookings_monthly: 100,
    leads_monthly: 500,
    storage_gb: 10,
  },
  pro: {
    checkouts_monthly: -1, // unlimited
    bookings_monthly: -1,
    leads_monthly: -1,
    storage_gb: 50,
  },
  enterprise: {
    checkouts_monthly: -1,
    bookings_monthly: -1,
    leads_monthly: -1,
    storage_gb: -1, // unlimited
  },
};

// Intents that require subscription checking
const METERED_INTENTS: Record<string, keyof SubscriptionStatus['usage']> = {
  'pay.checkout': 'checkouts_this_month',
  'cart.checkout': 'checkouts_this_month',
  'booking.create': 'bookings_this_month',
  'contact.submit': 'leads_this_month',
  'lead.capture': 'leads_this_month',
  'newsletter.subscribe': 'leads_this_month',
};

// ============ SUBSCRIPTION CHECK ============

let cachedStatus: SubscriptionStatus | null = null;
let cacheExpiry = 0;
const CACHE_TTL = 60_000; // 1 minute

/**
 * Get current subscription status for user
 */
export async function getSubscriptionStatus(userId?: string): Promise<SubscriptionStatus> {
  // Return cached if valid
  if (cachedStatus && Date.now() < cacheExpiry) {
    return cachedStatus;
  }

  // Default for unauthenticated users
  const defaultStatus: SubscriptionStatus = {
    plan: 'free',
    status: 'none',
    limits: PLAN_LIMITS.free,
    usage: {
      checkouts_this_month: 0,
      bookings_this_month: 0,
      leads_this_month: 0,
    },
  };

  if (!userId || !supabase) {
    return defaultStatus;
  }

  try {
    // Get subscription from user_subscriptions table
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select('plan, status, usage, current_period_start')
      .eq('user_id', userId)
      .single();

    if (error || !subscription) {
      return defaultStatus;
    }

    const plan = (subscription.plan || 'free') as SubscriptionStatus['plan'];
    const usage = (subscription.usage || {}) as SubscriptionStatus['usage'];

    cachedStatus = {
      plan,
      status: (subscription.status || 'none') as SubscriptionStatus['status'],
      limits: PLAN_LIMITS[plan] || PLAN_LIMITS.free,
      usage: {
        checkouts_this_month: usage.checkouts_this_month ?? 0,
        bookings_this_month: usage.bookings_this_month ?? 0,
        leads_this_month: usage.leads_this_month ?? 0,
      },
    };
    cacheExpiry = Date.now() + CACHE_TTL;

    return cachedStatus;
  } catch (err) {
    console.error('[Subscription] Failed to get status:', err);
    return defaultStatus;
  }
}

/**
 * Check if an intent can be executed based on subscription limits
 */
export async function checkIntentAllowed(
  intent: string,
  context: IntentContext
): Promise<{ allowed: boolean; result?: IntentResult }> {
  // Get normalized intent
  const normalizedIntent = intent;

  // Check if this intent is metered
  const usageKey = METERED_INTENTS[normalizedIntent];
  if (!usageKey) {
    // Intent not metered - always allowed
    return { allowed: true };
  }

  // Get subscription status
  const status = await getSubscriptionStatus(context.userId);

  // Check if subscription is active
  if (status.status === 'past_due') {
    return {
      allowed: false,
      result: {
        ok: false,
        toast: {
          type: 'warning',
          message: 'Please update your payment method to continue.',
        },
        ui: { openModal: 'subscription-update' },
        error: { code: 'SUBSCRIPTION_PAST_DUE', message: 'Subscription payment overdue' },
      },
    };
  }

  if (status.status === 'canceled') {
    return {
      allowed: false,
      result: {
        ok: false,
        toast: {
          type: 'info',
          message: 'Your subscription has ended. Reactivate to continue.',
        },
        ui: { openModal: 'subscription-reactivate' },
        error: { code: 'SUBSCRIPTION_CANCELED', message: 'Subscription canceled' },
      },
    };
  }

  // Check limit (if not unlimited)
  const limitKey = usageKey.replace('_this_month', '_monthly') as keyof SubscriptionStatus['limits'];
  const limit = status.limits[limitKey];
  const used = status.usage[usageKey];

  // -1 = unlimited
  if (limit !== -1 && used >= limit) {
    return {
      allowed: false,
      result: {
        ok: false,
        toast: {
          type: 'error',
          message: `You've reached your ${status.plan} plan limit. Upgrade for more.`,
        },
        ui: { openModal: 'subscription-upgrade' },
        error: { 
          code: 'LIMIT_EXCEEDED', 
          message: `${limitKey} limit exceeded (${used}/${limit})` 
        },
      },
    };
  }

  return { allowed: true };
}

/**
 * Increment usage counter after successful intent execution
 */
export async function incrementUsage(
  intent: string,
  context: IntentContext
): Promise<void> {
  const usageKey = METERED_INTENTS[intent];
  if (!usageKey || !context.userId || !supabase) {
    return;
  }

  try {
    // Increment usage in user_subscriptions.usage JSONB field
    // If RPC doesn't exist, fall back to direct update
    const { data: sub } = await supabase
      .from('user_subscriptions')
      .select('usage')
      .eq('user_id', context.userId)
      .single();

    if (sub) {
      const usage = (sub.usage as Record<string, number>) || {};
      usage[usageKey] = (usage[usageKey] || 0) + 1;

      await supabase
        .from('user_subscriptions')
        .update({ usage })
        .eq('user_id', context.userId);
    }

    // Invalidate cache
    cacheExpiry = 0;
  } catch (err) {
    console.error('[Subscription] Failed to increment usage:', err);
  }
}

/**
 * Middleware wrapper for intent execution with subscription enforcement
 */
export function withSubscriptionCheck(
  handler: (intent: string, context: IntentContext) => Promise<IntentResult>
): (intent: string, context: IntentContext) => Promise<IntentResult> {
  return async (intent: string, context: IntentContext) => {
    // Check if allowed
    const check = await checkIntentAllowed(intent, context);
    if (!check.allowed) {
      return check.result!;
    }

    // Execute handler
    const result = await handler(intent, context);

    // Increment usage on success
    if (result.ok) {
      await incrementUsage(intent, context);
    }

    return result;
  };
}

/**
 * Clear subscription cache (call after subscription changes)
 */
export function clearSubscriptionCache(): void {
  cachedStatus = null;
  cacheExpiry = 0;
}
