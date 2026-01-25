/**
 * CoreIntent surface (locked)
 *
 * Templates may ONLY emit these intents.
 * If you want to add a new intent, it must be explicitly added here and
 * registered with a backend handler.
 */

// Navigation intents - handle routing within projects
export const NAV_INTENTS = [
  'nav.goto',      // Internal route: { path: "/about" }
  'nav.external',  // External URL: { url: "https://..." }
  'nav.anchor',    // Same-page anchor: { anchor: "#pricing" }
] as const;

// Business/action intents - trigger backend workflows
export const ACTION_INTENTS = [
  'contact.submit',
  'newsletter.subscribe',
  'booking.create',
  'quote.request',
] as const;

// Combined core intents
export const CORE_INTENTS = [
  ...NAV_INTENTS,
  ...ACTION_INTENTS,
] as const;

export type NavIntent = (typeof NAV_INTENTS)[number];
export type ActionIntent = (typeof ACTION_INTENTS)[number];
export type CoreIntent = (typeof CORE_INTENTS)[number];

export function isCoreIntent(intent: string): intent is CoreIntent {
  return (CORE_INTENTS as readonly string[]).includes(intent);
}

export function isNavIntent(intent: string): intent is NavIntent {
  return (NAV_INTENTS as readonly string[]).includes(intent);
}

export function isActionIntent(intent: string): intent is ActionIntent {
  return (ACTION_INTENTS as readonly string[]).includes(intent);
}
