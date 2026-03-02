/**
 * AI Site Elements Library — Intent Wiring Map
 *
 * The unified mapping layer that connects every element's interactive
 * points to the correct backend intents. This is the bridge that turns
 * static HTML skeletons into full-stack, action-driven websites.
 *
 * When the AI generates a page, this map tells it EXACTLY which
 * data-ut-intent, data-ut-cta, data-ut-label, and data-no-intent
 * attributes to place on which elements.
 *
 * Architecture:
 * - Each element ID maps to an array of WiringPoints
 * - Each WiringPoint describes ONE interactive element within that section
 * - Industry overrides allow context-sensitive intent selection
 */

import type { IndustryAffinity } from './types';

// ============================================================================
// Types
// ============================================================================

/** A single interactive point within an element that needs intent wiring */
export interface WiringPoint {
  /** CSS selector or descriptive location (e.g., "primary CTA button", "form submit") */
  selector: string;
  /** The default intent to wire */
  intent: string;
  /** CTA tracking label (data-ut-cta) */
  ctaLabel?: string;
  /** Human-readable button/link label (data-ut-label) */
  utLabel?: string;
  /** Additional data-* payload attributes */
  payload?: Record<string, string>;
  /** Whether this is a nav link that needs data-ut-path or data-ut-anchor */
  navType?: 'goto' | 'anchor' | 'external';
  /** Industry-specific intent overrides */
  industryOverrides?: Partial<Record<IndustryAffinity, string>>;
  /** If true, this is a UI-only control — mark with data-no-intent */
  noIntent?: boolean;
  /** Description of what this interaction does */
  description: string;
}

/** Complete wiring specification for one element */
export interface ElementWiring {
  /** Element ID (matches SiteElement.id) */
  elementId: string;
  /** All interactive points in this element */
  points: WiringPoint[];
  /** Default intents for the whole element (used in prompt summary) */
  primaryIntent: string;
  /** CTA position category */
  ctaPosition: 'nav' | 'hero' | 'primary' | 'secondary' | 'footer' | 'inline' | 'none';
}

// ============================================================================
// Master Wiring Map
// ============================================================================

export const ELEMENT_INTENT_MAP: ElementWiring[] = [
  // ──────────────────────────────────────────────────────────────────────────
  // NAVIGATION
  // ──────────────────────────────────────────────────────────────────────────
  {
    elementId: 'navbar-standard',
    primaryIntent: 'nav.goto',
    ctaPosition: 'nav',
    points: [
      {
        selector: 'nav links (each <a> in nav)',
        intent: 'nav.goto',
        payload: { 'data-ut-path': '/page-slug' },
        navType: 'goto',
        description: 'Each nav link routes to internal page',
      },
      {
        selector: 'nav anchor links (#section)',
        intent: 'nav.anchor',
        payload: { 'data-ut-anchor': 'section-id' },
        navType: 'anchor',
        description: 'Smooth-scroll to section on same page',
      },
      {
        selector: 'header CTA button',
        intent: 'booking.create',
        ctaLabel: 'cta.nav',
        utLabel: 'Book Now',
        industryOverrides: {
          saas: 'auth.signup',
          ecommerce: 'cart.view',
          coaching: 'booking.create',
          restaurant: 'booking.create',
          salon: 'booking.create',
          portfolio: 'contact.submit',
          agency: 'contact.submit',
          nonprofit: 'nav.anchor',
        },
        description: 'Primary nav CTA — contextual to business type',
      },
      {
        selector: 'mobile menu toggle button',
        intent: '',
        noIntent: true,
        description: 'UI toggle — no backend action',
      },
    ],
  },
  {
    elementId: 'mobile-menu-drawer',
    primaryIntent: 'nav.goto',
    ctaPosition: 'nav',
    points: [
      {
        selector: 'mobile nav links',
        intent: 'nav.goto',
        payload: { 'data-ut-path': '/page-slug' },
        navType: 'goto',
        description: 'Mobile nav link routes to page',
      },
      {
        selector: 'close button',
        intent: '',
        noIntent: true,
        description: 'UI close — no backend action',
      },
      {
        selector: 'backdrop overlay',
        intent: '',
        noIntent: true,
        description: 'Click-to-close backdrop — no backend action',
      },
    ],
  },
  {
    elementId: 'breadcrumb-standard',
    primaryIntent: 'nav.goto',
    ctaPosition: 'none',
    points: [
      {
        selector: 'breadcrumb links',
        intent: 'nav.goto',
        payload: { 'data-ut-path': '/parent-page' },
        navType: 'goto',
        description: 'Navigate to parent/ancestor page',
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // HERO SECTIONS
  // ──────────────────────────────────────────────────────────────────────────
  {
    elementId: 'hero-centered',
    primaryIntent: 'contact.submit',
    ctaPosition: 'hero',
    points: [
      {
        selector: 'primary CTA button',
        intent: 'booking.create',
        ctaLabel: 'cta.hero',
        utLabel: 'Get Started',
        industryOverrides: {
          saas: 'auth.signup',
          ecommerce: 'nav.anchor',
          coaching: 'booking.create',
          restaurant: 'booking.create',
          salon: 'booking.create',
          portfolio: 'contact.submit',
          agency: 'contact.submit',
          nonprofit: 'nav.anchor',
          'local-service': 'quote.request',
        },
        description: 'Main hero CTA — drives primary conversion',
      },
      {
        selector: 'secondary CTA button/link',
        intent: 'nav.anchor',
        ctaLabel: 'cta.hero-secondary',
        utLabel: 'Learn More',
        payload: { 'data-ut-anchor': 'features' },
        navType: 'anchor',
        description: 'Secondary hero action — scroll to content',
      },
    ],
  },
  {
    elementId: 'hero-split',
    primaryIntent: 'contact.submit',
    ctaPosition: 'hero',
    points: [
      {
        selector: 'primary CTA button',
        intent: 'booking.create',
        ctaLabel: 'cta.hero',
        utLabel: 'Get Started',
        industryOverrides: {
          saas: 'auth.signup',
          ecommerce: 'nav.anchor',
          coaching: 'booking.create',
          restaurant: 'booking.create',
          salon: 'booking.create',
          portfolio: 'contact.submit',
          agency: 'contact.submit',
          'real-estate': 'lead.capture',
        },
        description: 'Main hero CTA — drives primary conversion',
      },
      {
        selector: 'secondary CTA button/link',
        intent: 'nav.anchor',
        ctaLabel: 'cta.hero-secondary',
        utLabel: 'Learn More',
        payload: { 'data-ut-anchor': 'services' },
        navType: 'anchor',
        description: 'Secondary hero action — scroll to content',
      },
    ],
  },
  {
    elementId: 'hero-fullbleed',
    primaryIntent: 'booking.create',
    ctaPosition: 'hero',
    points: [
      {
        selector: 'primary CTA button',
        intent: 'booking.create',
        ctaLabel: 'cta.hero',
        utLabel: 'Book Now',
        industryOverrides: {
          saas: 'auth.signup',
          ecommerce: 'nav.anchor',
          restaurant: 'booking.create',
          salon: 'booking.create',
          'local-service': 'quote.request',
          nonprofit: 'nav.anchor',
        },
        description: 'Full-bleed hero CTA — high-impact conversion',
      },
      {
        selector: 'secondary CTA button/link',
        intent: 'nav.anchor',
        ctaLabel: 'cta.hero-secondary',
        utLabel: 'Our Services',
        payload: { 'data-ut-anchor': 'services' },
        navType: 'anchor',
        description: 'Secondary scroll-to action',
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // FEATURES / SERVICES
  // ──────────────────────────────────────────────────────────────────────────
  {
    elementId: 'features-grid-3',
    primaryIntent: 'nav.anchor',
    ctaPosition: 'none',
    points: [
      {
        selector: '"Learn more" links on feature cards (if present)',
        intent: 'nav.goto',
        payload: { 'data-ut-path': '/features/feature-slug' },
        navType: 'goto',
        description: 'Optional deep-link to feature detail page',
      },
    ],
  },
  {
    elementId: 'stats-strip',
    primaryIntent: 'nav.anchor',
    ctaPosition: 'none',
    points: [], // Pure display — no interactive points
  },
  {
    elementId: 'service-cards',
    primaryIntent: 'booking.create',
    ctaPosition: 'primary',
    points: [
      {
        selector: '"Book Now" / "Get Started" button on each card',
        intent: 'booking.create',
        ctaLabel: 'cta.primary',
        utLabel: 'Book Now',
        payload: { 'data-service': 'service-name' },
        industryOverrides: {
          saas: 'pay.checkout',
          ecommerce: 'cart.add',
          coaching: 'booking.create',
          restaurant: 'booking.create',
          salon: 'booking.create',
          'local-service': 'quote.request',
        },
        description: 'Service card CTA — drives booking/purchase',
      },
      {
        selector: 'category filter pills/tabs',
        intent: '',
        noIntent: true,
        description: 'UI filter — no backend action',
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // SOCIAL PROOF
  // ──────────────────────────────────────────────────────────────────────────
  {
    elementId: 'testimonials-cards',
    primaryIntent: 'nav.anchor',
    ctaPosition: 'none',
    points: [], // Pure social proof display — no CTAs
  },
  {
    elementId: 'logo-strip',
    primaryIntent: 'nav.external',
    ctaPosition: 'none',
    points: [], // Pure display — optional external links
  },

  // ──────────────────────────────────────────────────────────────────────────
  // PRICING
  // ──────────────────────────────────────────────────────────────────────────
  {
    elementId: 'pricing-3-tier',
    primaryIntent: 'pay.checkout',
    ctaPosition: 'primary',
    points: [
      {
        selector: 'tier CTA buttons (Starter, Pro, etc.)',
        intent: 'pay.checkout',
        ctaLabel: 'cta.primary',
        utLabel: 'Get Started',
        payload: { 'data-plan': 'plan-name', 'data-price-id': 'price_xxx' },
        description: 'Pricing tier selection — triggers checkout',
      },
      {
        selector: 'Enterprise / "Contact Sales" button',
        intent: 'contact.submit',
        ctaLabel: 'cta.secondary',
        utLabel: 'Contact Sales',
        description: 'Enterprise tier — routes to contact form',
      },
      {
        selector: 'billing toggle (monthly/annual)',
        intent: '',
        noIntent: true,
        description: 'UI toggle — no backend action',
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // CTA SECTIONS
  // ──────────────────────────────────────────────────────────────────────────
  {
    elementId: 'cta-banner',
    primaryIntent: 'contact.submit',
    ctaPosition: 'primary',
    points: [
      {
        selector: 'primary CTA button',
        intent: 'contact.submit',
        ctaLabel: 'cta.primary',
        utLabel: 'Get Started Today',
        industryOverrides: {
          saas: 'auth.signup',
          ecommerce: 'nav.goto',
          coaching: 'booking.create',
          restaurant: 'booking.create',
          salon: 'booking.create',
          'local-service': 'quote.request',
          nonprofit: 'nav.external',
        },
        description: 'CTA banner primary action — drives final conversion',
      },
      {
        selector: 'secondary link (if present)',
        intent: 'nav.anchor',
        ctaLabel: 'cta.secondary',
        utLabel: 'Learn More',
        navType: 'anchor',
        description: 'Optional secondary scroll action',
      },
    ],
  },
  {
    elementId: 'newsletter-signup',
    primaryIntent: 'newsletter.subscribe',
    ctaPosition: 'inline',
    points: [
      {
        selector: 'form submit button',
        intent: 'newsletter.subscribe',
        ctaLabel: 'cta.primary',
        utLabel: 'Subscribe',
        description: 'Newsletter form submission',
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // FORMS
  // ──────────────────────────────────────────────────────────────────────────
  {
    elementId: 'contact-form-section',
    primaryIntent: 'contact.submit',
    ctaPosition: 'primary',
    points: [
      {
        selector: 'form submit button',
        intent: 'contact.submit',
        ctaLabel: 'cta.primary',
        utLabel: 'Send Message',
        industryOverrides: {
          'local-service': 'quote.request',
          'real-estate': 'lead.capture',
        },
        description: 'Contact form submission — captures lead data',
      },
    ],
  },
  {
    elementId: 'faq-accordion',
    primaryIntent: 'nav.anchor',
    ctaPosition: 'none',
    points: [
      {
        selector: 'accordion toggle buttons',
        intent: '',
        noIntent: true,
        description: 'UI expand/collapse — no backend action',
      },
      {
        selector: '"Still have questions? Contact us" link (if present)',
        intent: 'contact.submit',
        ctaLabel: 'cta.secondary',
        utLabel: 'Contact Us',
        description: 'Optional contact fallback link',
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // FOOTER
  // ──────────────────────────────────────────────────────────────────────────
  {
    elementId: 'footer-multi-column',
    primaryIntent: 'nav.goto',
    ctaPosition: 'footer',
    points: [
      {
        selector: 'internal page links',
        intent: 'nav.goto',
        payload: { 'data-ut-path': '/page-slug' },
        navType: 'goto',
        description: 'Footer nav links — internal routing',
      },
      {
        selector: 'anchor links (privacy, terms, etc.)',
        intent: 'nav.goto',
        payload: { 'data-ut-path': '/privacy' },
        navType: 'goto',
        description: 'Footer legal/info links',
      },
      {
        selector: 'social media links',
        intent: 'nav.external',
        navType: 'external',
        description: 'Social links — open in new tab',
      },
      {
        selector: 'footer CTA button (if present)',
        intent: 'contact.submit',
        ctaLabel: 'cta.footer',
        utLabel: 'Get in Touch',
        industryOverrides: {
          saas: 'auth.signup',
          ecommerce: 'newsletter.subscribe',
          coaching: 'booking.create',
          salon: 'booking.create',
        },
        description: 'Optional footer CTA — last-chance conversion',
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // ECOMMERCE
  // ──────────────────────────────────────────────────────────────────────────
  {
    elementId: 'product-card-grid',
    primaryIntent: 'cart.add',
    ctaPosition: 'primary',
    points: [
      {
        selector: '"Add to Cart" button on each card',
        intent: 'cart.add',
        ctaLabel: 'cta.primary',
        utLabel: 'Add to Cart',
        payload: { 'data-product-id': 'product-id', 'data-product-name': 'name', 'data-price': '0.00' },
        description: 'Add product to shopping cart',
      },
      {
        selector: 'wishlist/favorite button',
        intent: '',
        noIntent: true,
        description: 'UI wishlist toggle — no backend action (yet)',
      },
      {
        selector: 'category filter buttons',
        intent: '',
        noIntent: true,
        description: 'UI filter — no backend action',
      },
    ],
  },
  {
    elementId: 'cart-overlay',
    primaryIntent: 'pay.checkout',
    ctaPosition: 'primary',
    points: [
      {
        selector: '"Checkout" / "Complete Purchase" button',
        intent: 'pay.checkout',
        ctaLabel: 'cta.primary',
        utLabel: 'Checkout',
        description: 'Begin checkout flow',
      },
      {
        selector: '"Continue Shopping" button/link',
        intent: '',
        noIntent: true,
        description: 'UI dismiss — close cart overlay',
      },
      {
        selector: 'quantity +/- buttons',
        intent: '',
        noIntent: true,
        description: 'UI quantity control — handled client-side',
      },
      {
        selector: 'remove item button',
        intent: '',
        noIntent: true,
        description: 'UI removal — handled client-side',
      },
      {
        selector: 'close button',
        intent: '',
        noIntent: true,
        description: 'UI close — no backend action',
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // CONTENT SECTIONS
  // ──────────────────────────────────────────────────────────────────────────
  {
    elementId: 'about-section',
    primaryIntent: 'nav.anchor',
    ctaPosition: 'secondary',
    points: [
      {
        selector: '"Learn More" / "Our Story" button (if present)',
        intent: 'nav.goto',
        ctaLabel: 'cta.secondary',
        utLabel: 'Our Story',
        payload: { 'data-ut-path': '/about' },
        navType: 'goto',
        description: 'Optional link to full about page',
      },
    ],
  },
  {
    elementId: 'team-grid',
    primaryIntent: 'nav.anchor',
    ctaPosition: 'none',
    points: [
      {
        selector: 'social media links on team cards',
        intent: 'nav.external',
        navType: 'external',
        description: 'Link to team member social profiles',
      },
    ],
  },
  {
    elementId: 'portfolio-gallery',
    primaryIntent: 'nav.anchor',
    ctaPosition: 'none',
    points: [
      {
        selector: 'filter category buttons',
        intent: '',
        noIntent: true,
        description: 'UI filter — no backend action',
      },
      {
        selector: 'portfolio item click (if links to detail page)',
        intent: 'nav.goto',
        payload: { 'data-ut-path': '/work/project-slug' },
        navType: 'goto',
        description: 'Optional link to project detail page',
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // UTILITY
  // ──────────────────────────────────────────────────────────────────────────
  {
    elementId: 'announcement-bar',
    primaryIntent: 'nav.anchor',
    ctaPosition: 'inline',
    points: [
      {
        selector: 'announcement CTA link ("Shop Now", "Learn More")',
        intent: 'nav.anchor',
        payload: { 'data-ut-anchor': 'products' },
        navType: 'anchor',
        industryOverrides: {
          ecommerce: 'nav.anchor',
          saas: 'nav.goto',
        },
        description: 'Announcement bar action — contextual',
      },
      {
        selector: 'dismiss/close button',
        intent: '',
        noIntent: true,
        description: 'UI dismiss — no backend action',
      },
    ],
  },
  {
    elementId: 'back-to-top',
    primaryIntent: 'nav.anchor',
    ctaPosition: 'none',
    points: [
      {
        selector: 'back-to-top button',
        intent: '',
        noIntent: true,
        description: 'UI scroll — handled by JS, no backend action',
      },
    ],
  },
  {
    elementId: 'cookie-consent',
    primaryIntent: 'button.click',
    ctaPosition: 'none',
    points: [
      {
        selector: '"Accept" button',
        intent: '',
        noIntent: true,
        description: 'UI consent — handled client-side (localStorage)',
      },
      {
        selector: '"Customize" / "Settings" button',
        intent: '',
        noIntent: true,
        description: 'UI toggle — no backend action',
      },
    ],
  },
];

// ============================================================================
// Lookup Helpers
// ============================================================================

/** Get wiring spec for a specific element */
export function getElementWiring(elementId: string): ElementWiring | undefined {
  return ELEMENT_INTENT_MAP.find(w => w.elementId === elementId);
}

/** Get all wiring specs for elements in a blueprint sequence */
export function getBlueprintWiring(elementIds: string[]): ElementWiring[] {
  return elementIds
    .map(id => getElementWiring(id))
    .filter((w): w is ElementWiring => w !== undefined);
}

/**
 * Resolve industry-specific intents for an element's wiring points.
 * Returns a copy of the wiring with overrides applied.
 */
export function resolveIndustryWiring(
  wiring: ElementWiring,
  industry: IndustryAffinity,
): ElementWiring {
  return {
    ...wiring,
    points: wiring.points.map(point => {
      if (point.noIntent) return point;
      const override = point.industryOverrides?.[industry];
      return override ? { ...point, intent: override } : point;
    }),
  };
}

/**
 * Generate a compact wiring instruction block for the AI prompt.
 * This tells the AI exactly which attributes to place on which elements.
 */
export function generateWiringPrompt(
  elementIds: string[],
  industry: IndustryAffinity = 'universal',
): string {
  const wirings = getBlueprintWiring(elementIds);
  if (!wirings.length) return '';

  let prompt = `\n\n🔌 **INTENT WIRING MAP** — Auto-wire these attributes on interactive elements:\n\n`;
  prompt += `| Element | Interactive Point | Attributes |\n`;
  prompt += `|---------|-------------------|------------|\n`;

  for (const wiring of wirings) {
    const resolved = resolveIndustryWiring(wiring, industry);
    for (const point of resolved.points) {
      if (point.noIntent) {
        prompt += `| ${resolved.elementId} | ${point.selector} | \`data-no-intent\` |\n`;
        continue;
      }
      if (!point.intent) continue;

      const attrs: string[] = [];
      attrs.push(`data-ut-intent="${point.intent}"`);
      if (point.ctaLabel) attrs.push(`data-ut-cta="${point.ctaLabel}"`);
      if (point.utLabel) attrs.push(`data-ut-label="${point.utLabel}"`);
      if (point.payload) {
        for (const [key, val] of Object.entries(point.payload)) {
          attrs.push(`${key}="${val}"`);
        }
      }
      prompt += `| ${resolved.elementId} | ${point.selector} | ${attrs.map(a => `\`${a}\``).join(' ')} |\n`;
    }
  }

  prompt += `\n**WIRING RULES REMINDER:**\n`;
  prompt += `• EVERY conversion CTA MUST have \`data-ut-intent\` + \`data-ut-cta\` + \`data-ut-label\`\n`;
  prompt += `• UI-only controls (toggles, filters, accordions, close btns) MUST have \`data-no-intent\`\n`;
  prompt += `• Nav links MUST have \`data-ut-intent="nav.goto"\` + \`data-ut-path="/page"\`\n`;
  prompt += `• Anchor links MUST have \`data-ut-intent="nav.anchor"\` + \`data-ut-anchor="section"\`\n`;
  prompt += `• External links MUST have \`data-ut-intent="nav.external"\` + \`target="_blank"\`\n`;
  prompt += `• NEVER leave a clickable element without either \`data-ut-intent\` OR \`data-no-intent\`\n`;

  return prompt;
}

/**
 * Generate a quick-reference intent map for a specific industry.
 * Used as a condensed cheat-sheet in the system prompt.
 */
export function generateIndustryIntentSheet(industry: IndustryAffinity): string {
  const intentAssignments: Record<string, string> = {};

  for (const wiring of ELEMENT_INTENT_MAP) {
    for (const point of wiring.points) {
      if (point.noIntent || !point.intent) continue;
      const resolved = point.industryOverrides?.[industry] || point.intent;
      const key = `${wiring.elementId}:${point.selector}`;
      intentAssignments[key] = resolved;
    }
  }

  let sheet = `\n🏢 **INDUSTRY INTENT SHEET** (${industry}):\n`;
  const grouped: Record<string, string[]> = {};

  for (const [key, intent] of Object.entries(intentAssignments)) {
    if (!grouped[intent]) grouped[intent] = [];
    grouped[intent].push(key.split(':')[0]);
  }

  for (const [intent, elements] of Object.entries(grouped)) {
    const unique = [...new Set(elements)];
    sheet += `• \`${intent}\` → ${unique.join(', ')}\n`;
  }

  return sheet;
}
