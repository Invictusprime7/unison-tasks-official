/**
 * AI Site Elements Library — Type Definitions
 *
 * Structured types for the AI's permanent knowledge base of
 * web components distilled from patterns across thousands of sites.
 *
 * This is NOT a UI component library — it's a *knowledge system* that
 * teaches the AI what real-world site elements look like, their common
 * variations, layout patterns, content slots, and conversion best practices.
 */

// ============================================================================
// Core Taxonomy
// ============================================================================

/** Top-level element category */
export type ElementCategory =
  | 'navigation'
  | 'hero'
  | 'features'
  | 'content'
  | 'social-proof'
  | 'pricing'
  | 'cta'
  | 'forms'
  | 'media'
  | 'ecommerce'
  | 'footer'
  | 'utility';

/** Sub-categories within each element category */
export type ElementSubCategory = string;

/** Visual style archetype */
export type StyleArchetype =
  | 'minimal'
  | 'bold'
  | 'elegant'
  | 'playful'
  | 'corporate'
  | 'dark-luxury'
  | 'glassmorphism'
  | 'brutalist'
  | 'editorial'
  | 'retro';

/** Layout pattern used by the element */
export type LayoutPattern =
  | 'full-width'
  | 'contained'
  | 'split-screen'
  | 'asymmetric'
  | 'grid-2'
  | 'grid-3'
  | 'grid-4'
  | 'masonry'
  | 'carousel'
  | 'stacked'
  | 'sidebar'
  | 'floating'
  | 'sticky'
  | 'overlay';

/** Industries this element is commonly seen in */
export type IndustryAffinity =
  | 'universal'
  | 'saas'
  | 'ecommerce'
  | 'restaurant'
  | 'salon'
  | 'real-estate'
  | 'portfolio'
  | 'agency'
  | 'coaching'
  | 'nonprofit'
  | 'local-service'
  | 'healthcare'
  | 'fitness'
  | 'education';

// ============================================================================
// Content Slot System
// ============================================================================

/** A named placeholder within an element that holds content */
export interface ContentSlot {
  /** Slot name (e.g., "headline", "subheadline", "cta_primary") */
  name: string;
  /** What kind of content goes here */
  type: 'text' | 'heading' | 'paragraph' | 'image' | 'icon' | 'button' | 'form' | 'list' | 'badge' | 'stat' | 'video' | 'map';
  /** Is this slot required or optional? */
  required: boolean;
  /** Description of what this slot does */
  description: string;
  /** Example content for this slot */
  example?: string;
  /** Character count guidance (for text slots) */
  charRange?: { min: number; max: number };
}

// ============================================================================
// Variation System
// ============================================================================

/** A specific visual/structural variation of an element */
export interface ElementVariation {
  /** Unique variation id (e.g., "hero-split-image-right") */
  id: string;
  /** Human-readable name */
  name: string;
  /** What makes this variation different */
  description: string;
  /** Layout pattern used */
  layout: LayoutPattern;
  /** Style archetype */
  style: StyleArchetype;
  /** Tailwind/CSS class hints for the AI */
  cssHints: string[];
  /** HTML structure skeleton (Tailwind + semantic HTML) */
  skeleton: string;
  /** Best-for usage notes */
  bestFor: string[];
  /** Popularity score (0-100, based on real-world frequency) */
  popularity: number;
}

// ============================================================================
// Conversion Intelligence
// ============================================================================

/** Conversion best practices for an element */
export interface ConversionIntelligence {
  /** Primary conversion goal */
  goal: string;
  /** Recommended intent to wire */
  recommendedIntent?: string;
  /** Placement tips */
  placementTips: string[];
  /** Copy guidelines */
  copyGuidelines: string[];
  /** A/B test insights (from aggregated patterns) */
  abInsights?: string[];
  /** Mobile-specific considerations */
  mobileNotes?: string[];
}

// ============================================================================
// Core Element Blueprint
// ============================================================================

/**
 * A single site element/component in the AI's knowledge base.
 *
 * This is NOT renderable code — it's *structured intelligence* that tells
 * the AI everything it needs to generate production-quality versions.
 */
export interface SiteElement {
  /** Unique element id (e.g., "hero-centered") */
  id: string;
  /** Human-readable name */
  name: string;
  /** What this element does on a page */
  description: string;
  /** Primary category */
  category: ElementCategory;
  /** Sub-category for finer classification */
  subCategory: ElementSubCategory;
  /** Industries where this element is most common */
  industryAffinity: IndustryAffinity[];
  /** Named content slots */
  contentSlots: ContentSlot[];
  /** Available visual/structural variations */
  variations: ElementVariation[];
  /** Conversion intelligence */
  conversion: ConversionIntelligence;
  /** Accessibility requirements */
  a11y: {
    /** Required ARIA attributes */
    ariaRequirements: string[];
    /** Keyboard navigation notes */
    keyboardNav?: string;
    /** Screen reader considerations */
    screenReader?: string;
  };
  /** SEO notes */
  seo?: {
    /** Important semantic elements */
    semanticElements: string[];
    /** Schema.org type if applicable */
    schemaType?: string;
  };
  /** Responsive breakpoint notes */
  responsive: {
    /** Mobile behavior */
    mobile: string;
    /** Tablet behavior */
    tablet?: string;
    /** Desktop behavior */
    desktop: string;
  };
  /** Tags for search/filtering */
  tags: string[];
  /** Frequency score — how often this appears across sites (0-100) */
  frequencyScore: number;
}

// ============================================================================
// Library Aggregates
// ============================================================================

/** A curated collection of elements forming a page recipe */
export interface PageBlueprint {
  /** Page type (e.g., "landing", "about", "pricing") */
  pageType: string;
  /** Ordered list of element IDs that form this page */
  elementSequence: string[];
  /** Industry this blueprint targets */
  industry: IndustryAffinity;
  /** Description */
  description: string;
}

/** The full library registry */
export interface SiteElementsLibrary {
  /** Library version */
  version: string;
  /** Last updated timestamp */
  lastUpdated: string;
  /** Total element count */
  elementCount: number;
  /** All elements indexed by category */
  elements: Record<ElementCategory, SiteElement[]>;
  /** Page blueprints */
  pageBlueprints: PageBlueprint[];
}
