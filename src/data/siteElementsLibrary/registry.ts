/**
 * AI Site Elements Library — Registry & Resolver
 *
 * The central registry that indexes all elements and provides
 * intelligent lookup/filtering for the AI builder pipeline.
 *
 * This is the "brain" that connects the knowledge base to the
 * AI code generation system.
 */

import type {
  SiteElement,
  SiteElementsLibrary,
  ElementCategory,
  IndustryAffinity,
  LayoutPattern,
  StyleArchetype,
  PageBlueprint,
} from './types';

import {
  navigationElements,
  heroElements,
  featuresElements,
  socialProofElements,
  pricingElements,
  ctaElements,
  formElements,
  footerElements,
  ecommerceElements,
  contentElements,
  utilityElements,
} from './elements';

// ============================================================================
// Library Construction
// ============================================================================

/** All elements flattened into a single array */
const ALL_ELEMENTS: SiteElement[] = [
  ...navigationElements,
  ...heroElements,
  ...featuresElements,
  ...socialProofElements,
  ...pricingElements,
  ...ctaElements,
  ...formElements,
  ...footerElements,
  ...ecommerceElements,
  ...contentElements,
  ...utilityElements,
];

/** Elements indexed by category */
function buildCategoryIndex(): Record<ElementCategory, SiteElement[]> {
  const index: Record<string, SiteElement[]> = {};
  for (const element of ALL_ELEMENTS) {
    if (!index[element.category]) {
      index[element.category] = [];
    }
    index[element.category].push(element);
  }
  return index as Record<ElementCategory, SiteElement[]>;
}

/** Pre-built page blueprints based on common page structures */
const PAGE_BLUEPRINTS: PageBlueprint[] = [
  {
    pageType: 'landing-page',
    elementSequence: ['navbar-standard', 'hero-centered', 'logo-strip', 'features-grid-3', 'about-section', 'testimonials-cards', 'pricing-3-tier', 'faq-accordion', 'cta-banner', 'footer-multi-column'],
    industry: 'universal',
    description: 'Complete SaaS/startup landing page with all conversion-optimized sections',
  },
  {
    pageType: 'service-business',
    elementSequence: ['navbar-standard', 'hero-fullbleed', 'service-cards', 'stats-strip', 'about-section', 'team-grid', 'testimonials-cards', 'contact-form-section', 'footer-multi-column'],
    industry: 'local-service',
    description: 'Service business page with booking-focused sections',
  },
  {
    pageType: 'restaurant',
    elementSequence: ['navbar-standard', 'hero-fullbleed', 'about-section', 'service-cards', 'portfolio-gallery', 'testimonials-cards', 'contact-form-section', 'footer-multi-column'],
    industry: 'restaurant',
    description: 'Restaurant page with menu, gallery, and reservation flow',
  },
  {
    pageType: 'ecommerce-store',
    elementSequence: ['announcement-bar', 'navbar-standard', 'hero-split', 'product-card-grid', 'features-grid-3', 'testimonials-cards', 'newsletter-signup', 'footer-multi-column'],
    industry: 'ecommerce',
    description: 'Ecommerce storefront with product grid and cart flow',
  },
  {
    pageType: 'portfolio',
    elementSequence: ['navbar-standard', 'hero-centered', 'portfolio-gallery', 'about-section', 'testimonials-cards', 'contact-form-section', 'footer-multi-column'],
    industry: 'portfolio',
    description: 'Creative portfolio showcasing work with contact form',
  },
  {
    pageType: 'salon-spa',
    elementSequence: ['navbar-standard', 'hero-fullbleed', 'service-cards', 'about-section', 'team-grid', 'portfolio-gallery', 'testimonials-cards', 'contact-form-section', 'footer-multi-column'],
    industry: 'salon',
    description: 'Salon/spa page with services, team, and booking',
  },
  {
    pageType: 'coaching',
    elementSequence: ['navbar-standard', 'hero-split', 'stats-strip', 'features-grid-3', 'about-section', 'testimonials-cards', 'pricing-3-tier', 'faq-accordion', 'cta-banner', 'newsletter-signup', 'footer-multi-column'],
    industry: 'coaching',
    description: 'Coaching/consulting page with programs, pricing, and booking',
  },
  {
    pageType: 'nonprofit',
    elementSequence: ['navbar-standard', 'hero-fullbleed', 'stats-strip', 'about-section', 'features-grid-3', 'testimonials-cards', 'cta-banner', 'contact-form-section', 'footer-multi-column'],
    industry: 'nonprofit',
    description: 'Nonprofit page with mission, impact stats, and donation CTA',
  },
];

// ============================================================================
// Public API
// ============================================================================

/** The complete site elements library instance */
export const siteElementsLibrary: SiteElementsLibrary = {
  version: '1.0.0',
  lastUpdated: '2026-03-01',
  elementCount: ALL_ELEMENTS.length,
  elements: buildCategoryIndex(),
  pageBlueprints: PAGE_BLUEPRINTS,
};

/** Get all elements */
export function getAllElements(): SiteElement[] {
  return ALL_ELEMENTS;
}

/** Get element by ID */
export function getElementById(id: string): SiteElement | undefined {
  return ALL_ELEMENTS.find(el => el.id === id);
}

/** Get elements by category */
export function getElementsByCategory(category: ElementCategory): SiteElement[] {
  return siteElementsLibrary.elements[category] || [];
}

/** Get elements by industry affinity */
export function getElementsByIndustry(industry: IndustryAffinity): SiteElement[] {
  return ALL_ELEMENTS.filter(el =>
    el.industryAffinity.includes('universal') || el.industryAffinity.includes(industry)
  );
}

/** Get elements by tag */
export function getElementsByTag(tag: string): SiteElement[] {
  const lowerTag = tag.toLowerCase();
  return ALL_ELEMENTS.filter(el =>
    el.tags.some(t => t.toLowerCase().includes(lowerTag))
  );
}

/** Search elements by freeform query (matches name, description, tags) */
export function searchElements(query: string): SiteElement[] {
  const lower = query.toLowerCase();
  return ALL_ELEMENTS.filter(el =>
    el.name.toLowerCase().includes(lower) ||
    el.description.toLowerCase().includes(lower) ||
    el.tags.some(t => t.includes(lower)) ||
    el.subCategory.toLowerCase().includes(lower)
  ).sort((a, b) => b.frequencyScore - a.frequencyScore);
}

/** Get page blueprint by type */
export function getPageBlueprint(pageType: string): PageBlueprint | undefined {
  return PAGE_BLUEPRINTS.find(bp => bp.pageType === pageType);
}

/** Get page blueprints for an industry */
export function getPageBlueprintsForIndustry(industry: IndustryAffinity): PageBlueprint[] {
  return PAGE_BLUEPRINTS.filter(bp =>
    bp.industry === industry || bp.industry === 'universal'
  );
}

/** Resolve a blueprint to full element objects */
export function resolveBlueprint(blueprint: PageBlueprint): SiteElement[] {
  return blueprint.elementSequence
    .map(id => getElementById(id))
    .filter((el): el is SiteElement => el !== undefined);
}

/** Get the most common elements, sorted by frequency score */
export function getMostCommonElements(limit = 10): SiteElement[] {
  return [...ALL_ELEMENTS]
    .sort((a, b) => b.frequencyScore - a.frequencyScore)
    .slice(0, limit);
}

/** Get recommended elements for a specific section of a page */
export function getRecommendedForPosition(position: 'top' | 'middle' | 'bottom'): SiteElement[] {
  switch (position) {
    case 'top':
      return ALL_ELEMENTS.filter(el =>
        ['navigation', 'hero', 'utility'].includes(el.category)
      );
    case 'middle':
      return ALL_ELEMENTS.filter(el =>
        ['features', 'content', 'social-proof', 'pricing', 'ecommerce', 'media'].includes(el.category)
      );
    case 'bottom':
      return ALL_ELEMENTS.filter(el =>
        ['cta', 'forms', 'footer'].includes(el.category)
      );
  }
}

/** Get variation recommendations for a given style archetype */
export function getVariationsForStyle(style: StyleArchetype): Array<{ element: SiteElement; variation: SiteElement['variations'][0] }> {
  const results: Array<{ element: SiteElement; variation: SiteElement['variations'][0] }> = [];
  for (const el of ALL_ELEMENTS) {
    for (const v of el.variations) {
      if (v.style === style) {
        results.push({ element: el, variation: v });
      }
    }
  }
  return results.sort((a, b) => b.variation.popularity - a.variation.popularity);
}

// ============================================================================
// Industry-to-System Type Mapper
// ============================================================================

const SYSTEM_TYPE_TO_INDUSTRY: Record<string, IndustryAffinity> = {
  booking: 'salon',
  saas: 'saas',
  agency: 'agency',
  content: 'education',
  portfolio: 'portfolio',
  store: 'ecommerce',
  // Extended mappings
  restaurant: 'restaurant',
  salon: 'salon',
  'real-estate': 'real-estate',
  coaching: 'coaching',
  nonprofit: 'nonprofit',
  'local-service': 'local-service',
  healthcare: 'healthcare',
  fitness: 'fitness',
};

/** Map a business system type to the closest industry affinity */
export function systemTypeToIndustry(systemType: string): IndustryAffinity {
  return SYSTEM_TYPE_TO_INDUSTRY[systemType] || 'universal';
}
