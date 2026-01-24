/**
 * CoreIntent surface (locked)
 *
 * Templates may ONLY emit these intents.
 * If you want to add a new intent, it must be explicitly added here and
 * registered with a backend handler.
 */

export const CORE_INTENTS = [
  'contact.submit',
  'newsletter.subscribe',
  'booking.create',
  'quote.request',
] as const;

export type CoreIntent = (typeof CORE_INTENTS)[number];

export function isCoreIntent(intent: string): intent is CoreIntent {
  return (CORE_INTENTS as readonly string[]).includes(intent);
}
