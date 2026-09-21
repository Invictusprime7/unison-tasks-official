/**
 * Abstract Goal Registry — ontology that translates outcome language
 * ("make it feel established", "easier to buy") into concrete builder
 * capabilities and design/content signals.
 *
 * This is NOT a keyword router. It is injected into the request interpreter
 * as an ontology so the model can ground abstract goals, and it is used
 * locally only to surface hints.
 */

export interface AbstractGoalDefinition {
  id: string;
  /** Phrases that commonly express this outcome (advisory only). */
  aliases: string[];
  designSignals?: string[];
  contentSignals?: string[];
  components?: string[];
  /**
   * Presentation traits implied by this outcome. These are NEVER backend
   * capabilities and must never reach capability-pack provisioning.
   */
  designTraits?: string[];
  /** Outcome language kept as a business goal, not a capability id. */
  businessGoals?: string[];
  /**
   * Canonical business capability ids only (validated against
   * `businessCapabilityVocabulary`). Anything else belongs in the
   * design/goal/component projections.
   */
  capabilities?: string[];
}

export const ABSTRACT_GOALS: Record<string, AbstractGoalDefinition> = {
  trustworthy: {
    id: 'trustworthy',
    aliases: ['trustworthy', 'established', 'credible', 'legitimate', 'professional', 'reputable'],
    designSignals: ['consistent typography', 'restrained palette', 'clear hierarchy', 'professional spacing'],
    contentSignals: ['specific claims', 'social proof', 'business credentials', 'clear policies'],
    components: ['testimonial section', 'trust badges', 'business details', 'FAQ'],
    designTraits: ['trustworthy', 'consistent-typography', 'restrained-palette', 'clear-hierarchy'],
  },
  premium: {
    id: 'premium',
    aliases: ['premium', 'luxury', 'high-end', 'upscale', 'elevated', 'boutique feel'],
    designSignals: ['editorial spacing', 'high-quality imagery', 'limited accent colors', 'strong typography'],
    contentSignals: ['confident concise copy', 'craft and provenance details'],
    designTraits: ['premium', 'editorial-spacing', 'restrained-accent', 'strong-typography'],
  },
  modern: {
    id: 'modern',
    aliases: ['modern', 'sleek', 'contemporary', 'fresh', 'clean'],
    designSignals: ['generous whitespace', 'subtle motion', 'consistent radii', 'muted gradients'],
    designTraits: ['modern', 'generous-whitespace', 'subtle-motion', 'consistent-radii'],
  },
  easier_to_buy: {
    id: 'easier_to_buy',
    aliases: ['easier to buy', 'more conversions', 'sell more', 'reduce friction', 'streamline purchase'],
    businessGoals: ['easier_to_buy'],
    designTraits: ['clear-product-hierarchy', 'price-visibility'],
    capabilities: [
      'catalog.products',
      'commerce.cart',
      'commerce.checkout',
    ],
    components: ['product cards with add-to-cart', 'persistent cart', 'checkout CTA'],
  },
  easier_to_book: {
    id: 'easier_to_book',
    aliases: ['easier to book', 'take appointments', 'let customers book', 'online booking'],
    businessGoals: ['easier_to_book'],
    capabilities: [
      'catalog.services',
      'booking.appointments',
      'crm.contacts',
      'notifications.email',
    ],
    components: ['service cards with booking CTA', 'availability picker', 'confirmation state'],
  },
  shopify_like: {
    id: 'shopify_like',
    aliases: ['like shopify', 'real store', 'full storefront', 'online shop'],
    businessGoals: ['shopify_like'],
    capabilities: [
      'catalog.products',
      'commerce.cart',
      'commerce.checkout',
      'crm.contacts',
      'notifications.email',
    ],
    components: ['collections', 'variant selection', 'inventory state', 'order confirmation'],
  },
  real_business_system: {
    id: 'real_business_system',
    aliases: ['operate like a real', 'actually work', 'not just look like', 'run the business'],
    businessGoals: ['real_business_system'],
    capabilities: [
      'catalog.services',
      'crm.leads',
      'crm.contacts',
      'booking.appointments',
      'automation.follow_up',
      'notifications.email',
    ],
  },
  lead_generation: {
    id: 'lead_generation',
    aliases: ['more leads', 'capture leads', 'grow the list', 'get inquiries'],
    businessGoals: ['lead_generation'],
    capabilities: ['forms.contact', 'crm.leads', 'automation.follow_up', 'notifications.email'],
    components: ['inline lead form', 'sticky CTA', 'quote request'],
  },
};

/** Compact ontology text safe to inject into an interpreter system prompt. */
export function abstractGoalOntologyPrompt(): string {
  return Object.values(ABSTRACT_GOALS)
    .map((g) => {
      const parts: string[] = [`- ${g.id} (${g.aliases.slice(0, 4).join(', ')})`];
      if (g.designSignals?.length) parts.push(`  design: ${g.designSignals.join('; ')}`);
      if (g.contentSignals?.length) parts.push(`  content: ${g.contentSignals.join('; ')}`);
      if (g.designTraits?.length) parts.push(`  designTraits: ${g.designTraits.join('; ')}`);
      if (g.businessGoals?.length) parts.push(`  businessGoals: ${g.businessGoals.join('; ')}`);
      if (g.capabilities?.length) {
        parts.push(`  requestedBusinessCapabilities: ${g.capabilities.join('; ')}`);
      }
      if (g.components?.length) parts.push(`  components: ${g.components.join('; ')}`);
      return parts.join('\n');
    })
    .join('\n');
}

/** Advisory: abstract goals a prompt may be gesturing at. */
export function matchAbstractGoals(prompt: string): AbstractGoalDefinition[] {
  const lower = (prompt || '').toLowerCase();
  return Object.values(ABSTRACT_GOALS).filter((g) =>
    g.aliases.some((alias) => lower.includes(alias)),
  );
}
