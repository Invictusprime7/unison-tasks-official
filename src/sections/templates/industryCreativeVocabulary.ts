/**
 * Industry creative dialect — the industry half of the compiled design
 * vocabulary (governing plan, Phase 7).
 *
 * The art direction pack owns the SITE's visual language. The page archetype
 * owns the PAGE's rhythm, required roles and negative vocabulary. Neither knows
 * that a salon home page should lead with transformation proof while a SaaS
 * home page should lead with product features. That difference is this table.
 *
 * Invariant K: these profiles are AUTHORING INPUTS. They are merged into the
 * page archetype by `resolvePageArchetype()` in
 * `src/sections/pageArchetypeContract.ts` and compiled from there into the
 * design contract the composition lanes, validators and Stage 4b read. No
 * consumer queries this table as a second runtime authority.
 *
 * Nothing here introduces a new family, variant, token or runtime: every value
 * is an existing registered section family, art direction pack id or variant
 * tag.
 */

import type { SectionType } from '@/sections/types';
import type { ArtDirectionPackId } from '@/sections/variants/artDirectionPacks';
import { normalizeIndustryKey } from '@/platform/core/industryMatrix';

/** Per-page-role industry dialect. Every field is a modulation, never a replacement. */
export interface IndustryPageProfile {
  /** Families this industry's page of this role must carry, on top of the archetype. */
  requiredFamilies?: readonly SectionType[];
  /** Families that fit this industry/page pair especially well. */
  preferredFamilies?: readonly SectionType[];
  /** Negative vocabulary for this industry/page pair. Never overrides a required family. */
  discouragedFamilies?: readonly SectionType[];
}

export interface IndustryCreativeProfile {
  industry: string;
  /** Art directions that read as native for this industry (ordered, best first). */
  preferredArtDirections: readonly ArtDirectionPackId[];
  /** Site-wide family affinity — families this industry should reach for. */
  preferredFamilies: readonly SectionType[];
  /** Site-wide negative vocabulary — families that read as wrong for this industry. */
  discouragedFamilies: readonly SectionType[];
  /** Variant traits that read as wrong for this industry (e.g. a clinic with neon marquees). */
  discouragedTags: readonly string[];
  /** Page-role dialect. Roles absent here inherit the plain page archetype. */
  pageProfiles: Readonly<Record<string, IndustryPageProfile>>;
}

const PROFILES = {
  salon: {
    industry: 'salon',
    preferredArtDirections: ['soft-editorial', 'luxury-minimal', 'editorial-noir'],
    preferredFamilies: ['gallery', 'before-after', 'team', 'testimonials', 'services'],
    discouragedFamilies: ['logo-cloud', 'blog-preview'],
    discouragedTags: ['mono-terminal'],
    pageProfiles: {
      home: { requiredFamilies: ['services'], preferredFamilies: ['gallery', 'before-after', 'team', 'testimonials'] },
      services: { preferredFamilies: ['pricing', 'before-after', 'faq'] },
      gallery: { requiredFamilies: ['before-after'], preferredFamilies: ['testimonials'] },
      about: { requiredFamilies: ['team'] },
      booking: { preferredFamilies: ['testimonials', 'faq'] },
    },
  },
  'local-service': {
    industry: 'local-service',
    preferredArtDirections: ['bold-commercial', 'warm-craft', 'swiss-grid'],
    preferredFamilies: ['before-after', 'stats', 'testimonials', 'services', 'faq'],
    discouragedFamilies: ['blog-preview'],
    discouragedTags: ['immersive', 'parallax', 'marquee'],
    pageProfiles: {
      home: { requiredFamilies: ['services'], preferredFamilies: ['stats', 'before-after', 'testimonials', 'faq'] },
      gallery: { requiredFamilies: ['before-after'] },
      services: { preferredFamilies: ['faq', 'stats'] },
      contact: { preferredFamilies: ['faq'] },
    },
  },
  restaurant: {
    industry: 'restaurant',
    preferredArtDirections: ['warm-craft', 'editorial-noir', 'print-serif'],
    preferredFamilies: ['gallery', 'services', 'testimonials', 'about'],
    discouragedFamilies: ['logo-cloud', 'pricing'],
    discouragedTags: ['mono-terminal', 'brutalist'],
    pageProfiles: {
      home: { requiredFamilies: ['services'], preferredFamilies: ['gallery', 'about', 'testimonials'] },
      services: { preferredFamilies: ['gallery'], discouragedFamilies: ['pricing'] },
      gallery: { preferredFamilies: ['about'] },
      booking: { preferredFamilies: ['faq'] },
    },
  },
  saas: {
    industry: 'saas',
    preferredArtDirections: ['glass-tech', 'swiss-grid', 'neon-grid'],
    preferredFamilies: ['features', 'pricing', 'logo-cloud', 'stats', 'faq'],
    discouragedFamilies: ['before-after', 'team'],
    discouragedTags: [],
    pageProfiles: {
      home: { requiredFamilies: ['features'], preferredFamilies: ['logo-cloud', 'pricing', 'stats', 'testimonials'] },
      services: { requiredFamilies: ['features'], preferredFamilies: ['pricing', 'faq'] },
      pricing: { preferredFamilies: ['stats', 'testimonials'] },
      about: { preferredFamilies: ['stats', 'team'] },
    },
  },
  agency: {
    industry: 'agency',
    preferredArtDirections: ['editorial-noir', 'swiss-grid', 'bold-commercial'],
    preferredFamilies: ['gallery', 'logo-cloud', 'stats', 'services', 'testimonials'],
    discouragedFamilies: [],
    discouragedTags: [],
    pageProfiles: {
      home: { requiredFamilies: ['services'], preferredFamilies: ['logo-cloud', 'gallery', 'stats', 'testimonials'] },
      gallery: { preferredFamilies: ['stats', 'testimonials'] },
      about: { requiredFamilies: ['team'], preferredFamilies: ['stats'] },
      services: { preferredFamilies: ['stats'] },
    },
  },
  portfolio: {
    industry: 'portfolio',
    preferredArtDirections: ['cinematic-portfolio', 'editorial-noir', 'print-serif'],
    preferredFamilies: ['gallery', 'about', 'testimonials'],
    discouragedFamilies: ['logo-cloud', 'pricing', 'stats'],
    discouragedTags: [],
    pageProfiles: {
      home: { requiredFamilies: ['gallery'], preferredFamilies: ['about', 'testimonials'] },
      gallery: { preferredFamilies: ['about', 'cta'], discouragedFamilies: ['pricing'] },
      about: { preferredFamilies: ['gallery'] },
      services: { discouragedFamilies: ['logo-cloud'] },
    },
  },
  coaching: {
    industry: 'coaching',
    preferredArtDirections: ['soft-editorial', 'organic-studio', 'warm-craft'],
    preferredFamilies: ['testimonials', 'about', 'faq', 'services', 'stats'],
    discouragedFamilies: ['logo-cloud'],
    discouragedTags: ['brutalist', 'mono-terminal'],
    pageProfiles: {
      home: { requiredFamilies: ['testimonials'], preferredFamilies: ['about', 'services', 'faq'] },
      services: { preferredFamilies: ['testimonials', 'pricing', 'faq'] },
      about: { preferredFamilies: ['testimonials', 'stats'] },
      booking: { preferredFamilies: ['testimonials', 'faq'] },
    },
  },
  ecommerce: {
    industry: 'ecommerce',
    preferredArtDirections: ['commerce-editorial', 'bold-commercial', 'luxury-minimal'],
    preferredFamilies: ['gallery', 'testimonials', 'features', 'faq'],
    discouragedFamilies: ['team', 'before-after'],
    discouragedTags: [],
    pageProfiles: {
      home: { requiredFamilies: ['services'], preferredFamilies: ['gallery', 'testimonials', 'features'] },
      shop: { preferredFamilies: ['gallery', 'testimonials', 'faq'] },
      gallery: { preferredFamilies: ['cta'] },
      checkout: {},
    },
  },
  'real-estate': {
    industry: 'real-estate',
    preferredArtDirections: ['luxury-minimal', 'editorial-noir', 'cinematic-portfolio'],
    preferredFamilies: ['gallery', 'stats', 'team', 'faq'],
    discouragedFamilies: ['logo-cloud', 'blog-preview'],
    discouragedTags: ['brutalist', 'mono-terminal'],
    pageProfiles: {
      home: { requiredFamilies: ['gallery'], preferredFamilies: ['stats', 'services', 'testimonials'] },
      gallery: { preferredFamilies: ['stats', 'cta'] },
      about: { requiredFamilies: ['team'], preferredFamilies: ['stats'] },
      contact: { preferredFamilies: ['faq'] },
    },
  },
  nonprofit: {
    industry: 'nonprofit',
    preferredArtDirections: ['soft-editorial', 'print-serif', 'organic-studio'],
    preferredFamilies: ['stats', 'about', 'testimonials', 'team'],
    discouragedFamilies: ['pricing'],
    discouragedTags: ['neon', 'brutalist'],
    pageProfiles: {
      home: { requiredFamilies: ['stats'], preferredFamilies: ['about', 'testimonials', 'gallery'] },
      about: { requiredFamilies: ['team'], preferredFamilies: ['stats'] },
      services: { discouragedFamilies: ['pricing'] },
      blog: { preferredFamilies: ['cta'] },
    },
  },
} satisfies Record<string, IndustryCreativeProfile>;

export const INDUSTRY_CREATIVE_PROFILES: Readonly<Record<string, IndustryCreativeProfile>> = PROFILES;

export const INDUSTRY_CREATIVE_KEYS = Object.keys(PROFILES);

/** Resolve the dialect for an industry (aliases included). Unknown industries have no dialect. */
export function industryCreativeProfile(industry?: string | null): IndustryCreativeProfile | undefined {
  if (!industry) return undefined;
  return INDUSTRY_CREATIVE_PROFILES[normalizeIndustryKey(industry)];
}

/** The dialect line handed verbatim to the composition model, or '' when none applies. */
export function describeIndustryDialect(industry?: string | null): string {
  const profile = industryCreativeProfile(industry);
  if (!profile) return '';
  const list = (values: readonly string[]) => (values.length ? values.join(', ') : 'none');
  return [
    `INDUSTRY DIALECT ("${profile.industry}") — page rules already include it; this states the intent:`,
    `  reach for: ${list(profile.preferredFamilies)}`,
    `  avoid: ${list(profile.discouragedFamilies)}`,
    `  avoid design traits: ${list(profile.discouragedTags)}`,
  ].join('\n');
}
