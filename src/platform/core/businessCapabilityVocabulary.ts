/**
 * Business capability vocabulary — the canonical, closed set of business
 * capability identifiers the Builder request ontology may reference.
 *
 * This is NOT a new registry. It is the vocabulary previously embedded inside
 * `capabilityInterpretation.ts`, extracted so that the request envelope, the
 * capability planner and the edge runtime all validate against one list
 * without importing the interpretation layer (and its cycles).
 *
 * `supabase/functions/_shared/businessCapabilityVocabulary.ts` mirrors this
 * file for Deno; `src/test/builderRequestOntology.test.ts` fails on drift.
 */

import type { BusinessCapability } from '@/platform/core/capabilityRegistry';

export const BUSINESS_CAPABILITIES: BusinessCapability[] = [
  'business_profile',
  'catalog.services',
  'catalog.products',
  'catalog.menu',
  'crm.leads',
  'crm.contacts',
  'booking.appointments',
  'commerce.cart',
  'commerce.checkout',
  'forms.contact',
  'forms.quote',
  'auth.customer',
  'portal.customer',
  'automation.follow_up',
  'notifications.email',
];

const CAPABILITY_SET = new Set<string>(BUSINESS_CAPABILITIES);

/**
 * Loose aliases the interpreter (or the abstract-goal ontology) may emit.
 * Anything not resolvable here is dropped rather than guessed.
 */
export const CAPABILITY_ALIASES: Record<string, BusinessCapability> = {
  booking: 'booking.appointments',
  bookings: 'booking.appointments',
  appointments: 'booking.appointments',
  scheduling: 'booking.appointments',
  services: 'catalog.services',
  'service catalog': 'catalog.services',
  products: 'catalog.products',
  'product catalog': 'catalog.products',
  menu: 'catalog.menu',
  commerce: 'commerce.checkout',
  ecommerce: 'commerce.checkout',
  cart: 'commerce.cart',
  checkout: 'commerce.checkout',
  payments: 'commerce.checkout',
  crm: 'crm.contacts',
  contacts: 'crm.contacts',
  leads: 'crm.leads',
  'lead capture': 'crm.leads',
  'contact form': 'forms.contact',
  contact: 'forms.contact',
  quote: 'forms.quote',
  quotes: 'forms.quote',
  quoting: 'forms.quote',
  auth: 'auth.customer',
  authentication: 'auth.customer',
  accounts: 'auth.customer',
  login: 'auth.customer',
  portal: 'portal.customer',
  dashboard: 'portal.customer',
  memberships: 'portal.customer',
  automation: 'automation.follow_up',
  automations: 'automation.follow_up',
  'follow up': 'automation.follow_up',
  notifications: 'notifications.email',
  email: 'notifications.email',
  'business profile': 'business_profile',
  profile: 'business_profile',
};

/** Resolve a loose term to a canonical business capability, or null. */
export function normalizeBusinessCapability(raw: string): BusinessCapability | null {
  const v = String(raw ?? '').trim().toLowerCase();
  if (!v) return null;
  if (CAPABILITY_SET.has(v)) return v as BusinessCapability;
  const underscored = v.replace(/[\s-]+/g, '_');
  if (CAPABILITY_SET.has(underscored)) return underscored as BusinessCapability;
  return CAPABILITY_ALIASES[v] ?? CAPABILITY_ALIASES[v.replace(/[_-]+/g, ' ')] ?? null;
}

// ---------------------------------------------------------------------------
// Request-term domains
// ---------------------------------------------------------------------------

/**
 * A Builder request term belongs to exactly one domain. Only `capability`
 * terms may ever reach backend provisioning / pack verification.
 */
export type BuilderRequestTermDomain = 'capability' | 'experience' | 'design' | 'goal';

/** Presentation vocabulary — never a backend concern. */
const DESIGN_TRAIT_TERMS = new Set([
  'premium', 'luxury', 'high-end', 'upscale', 'elevated', 'boutique',
  'modern', 'sleek', 'contemporary', 'fresh', 'clean', 'minimal', 'minimalist',
  'bold', 'editorial', 'elegant', 'playful', 'warm', 'dark', 'light',
  'trustworthy', 'professional', 'credible', 'established',
  'aesthetic', 'look', 'feel', 'style', 'theme', 'palette', 'typography',
  'spacing', 'whitespace', 'radius', 'geometry', 'contrast', 'hierarchy',
]);

const DESIGN_TRAIT_RE =
  /\b(spacing|whitespace|typograph|palette|colou?r|radius|contrast|hierarchy|imagery|gradient|accent|font|layout|editorial|aesthetic)\b/i;

/** Motion / immersive vocabulary — a presentation feature, never a pack. */
const EXPERIENCE_PREFIX_RE = /^(motion|experience|animation|immersive|3d|scene)[.:]/i;
const EXPERIENCE_RE =
  /\b(marquee|parallax|ticker|carousel|animation|animated|motion|immersive|3d|webgl|scroll[- ]effect|reveal|transition)\b/i;

/**
 * Classify a single free term emitted by the interpreter or the abstract-goal
 * ontology. Deterministic and total: every term lands in exactly one domain.
 */
export function classifyBuilderRequestTerm(raw: string): {
  domain: BuilderRequestTermDomain;
  value: string;
} {
  const value = String(raw ?? '').trim();
  const lower = value.toLowerCase();
  if (!value) return { domain: 'goal', value };

  const capability = normalizeBusinessCapability(value);
  if (capability) return { domain: 'capability', value: capability };

  // Explicit design words win over incidental motion words ("subtle motion").
  if (DESIGN_TRAIT_TERMS.has(lower)) return { domain: 'design', value };

  if (EXPERIENCE_PREFIX_RE.test(lower) || EXPERIENCE_RE.test(lower)) {
    return { domain: 'experience', value };
  }

  if (
    DESIGN_TRAIT_RE.test(lower) ||
    lower.split(/[\s-]+/).some((word) => DESIGN_TRAIT_TERMS.has(word))
  ) {
    return { domain: 'design', value };
  }

  return { domain: 'goal', value };
}
