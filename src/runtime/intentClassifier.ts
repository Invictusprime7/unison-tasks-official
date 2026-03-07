/**
 * Intent Classifier — Deterministic routing for button actions
 *
 * Classifies every intent into one of three execution lanes:
 *
 *   IMMEDIATE   — Runs locally, no network, no automation overhead.
 *                  Nav, anchors, UI toggles, modals, scroll commands.
 *
 *   BACKEND     — Calls a backend Edge Function but does NOT emit to
 *                  the automation pipeline. Payments, auth, one-shot API calls.
 *
 *   AUTOMATABLE — Triggers the full automation pipeline:
 *                  Inngest event → Recipe matching → Step execution.
 *                  CRM writes, business workflows, lifecycle events.
 *
 * The classification is DETERMINISTIC — it is based solely on the intent ID
 * string prefix/value, not on runtime heuristics or user config.
 *
 * Usage:
 *   import { classifyIntent, IntentLane } from '@/runtime/intentClassifier';
 *
 *   const lane = classifyIntent('nav.goto');       // → 'immediate'
 *   const lane = classifyIntent('pay.checkout');    // → 'backend'
 *   const lane = classifyIntent('lead.capture');    // → 'automatable'
 *   const lane = classifyIntent('deal.won');        // → 'automatable'
 *
 *   if (lane === 'automatable') {
 *     await dispatchAutomation(intent, ctx, result);
 *   }
 */

import {
  isNavIntent,
  isPayIntent,
  isActionIntent,
  isAutomationIntent,
} from '@/coreIntents';

// ============================================================================
// Types
// ============================================================================

export type IntentLane = 'immediate' | 'backend' | 'automatable';

export interface IntentClassification {
  lane: IntentLane;
  /** Whether this intent should fire an Inngest event */
  emitsEvent: boolean;
  /** Whether this intent needs a businessId to execute */
  requiresBusinessId: boolean;
  /** Whether this intent performs a network call */
  requiresNetwork: boolean;
}

// ============================================================================
// Prefix-based fast classification
// ============================================================================

/**
 * Prefix → lane mapping for non-core intents.
 * If an intent isn't in CORE_INTENTS, we classify by prefix.
 */
const PREFIX_LANES: Array<[string, IntentLane]> = [
  // Immediate — client-side only
  ['nav.', 'immediate'],
  ['ui.', 'immediate'],
  ['scroll.', 'immediate'],
  ['modal.', 'immediate'],
  ['toggle.', 'immediate'],
  ['tab.', 'immediate'],
  ['menu.', 'immediate'],
  ['drawer.', 'immediate'],
  ['tooltip.', 'immediate'],
  ['copy.', 'immediate'],
  ['theme.', 'immediate'],
  ['lang.', 'immediate'],

  // Backend — one-shot API, no automation pipeline
  ['pay.', 'backend'],
  ['auth.', 'backend'],
  ['upload.', 'backend'],
  ['search.', 'backend'],

  // Automatable — business events that feed the pipeline
  ['crm/', 'automatable'],
  ['deal.', 'automatable'],
  ['lead.', 'automatable'],
  ['contact.', 'automatable'],
  ['booking.', 'automatable'],
  ['order.', 'automatable'],
  ['cart.', 'automatable'],
  ['form.', 'automatable'],
  ['job.', 'automatable'],
  ['proposal.', 'automatable'],
  ['newsletter.', 'automatable'],
  ['automation/', 'automatable'],
  ['workflow.', 'automatable'],
  ['button.', 'automatable'],
  ['quote.', 'automatable'],
];

// ============================================================================
// Classifier
// ============================================================================

/**
 * Classify an intent string into an execution lane.
 * This is pure, deterministic, and has zero side effects.
 */
export function classifyIntent(intent: string): IntentClassification {
  // 1. Core intents — use the type guards from coreIntents.ts
  if (isNavIntent(intent)) {
    return { lane: 'immediate', emitsEvent: false, requiresBusinessId: false, requiresNetwork: false };
  }

  if (isPayIntent(intent)) {
    return { lane: 'backend', emitsEvent: false, requiresBusinessId: true, requiresNetwork: true };
  }

  if (isActionIntent(intent)) {
    return { lane: 'automatable', emitsEvent: true, requiresBusinessId: true, requiresNetwork: true };
  }

  if (isAutomationIntent(intent)) {
    return { lane: 'automatable', emitsEvent: true, requiresBusinessId: true, requiresNetwork: true };
  }

  // 2. Non-core intents — classify by prefix
  const lower = intent.toLowerCase();
  for (const [prefix, lane] of PREFIX_LANES) {
    if (lower.startsWith(prefix)) {
      return {
        lane,
        emitsEvent: lane === 'automatable',
        requiresBusinessId: lane !== 'immediate',
        requiresNetwork: lane !== 'immediate',
      };
    }
  }

  // 3. Unknown intent — default to immediate (safe, no side effects)
  return { lane: 'immediate', emitsEvent: false, requiresBusinessId: false, requiresNetwork: false };
}

// ============================================================================
// Convenience guards
// ============================================================================

/** Returns true only for intents that should enter the automation pipeline */
export function isAutomatable(intent: string): boolean {
  return classifyIntent(intent).lane === 'automatable';
}

/** Returns true for intents that run client-side with zero network calls */
export function isImmediate(intent: string): boolean {
  return classifyIntent(intent).lane === 'immediate';
}

/** Returns true for intents that call backend but skip automation pipeline */
export function isBackendOnly(intent: string): boolean {
  return classifyIntent(intent).lane === 'backend';
}
