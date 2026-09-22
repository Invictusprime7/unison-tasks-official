/**
 * Edge mirror of src/sections/pageArchetypeContract.ts.
 *
 * Only the data the edge validator needs: required families, negative
 * vocabulary and the body-section ceiling per page role. Drift against the
 * client table is asserted by src/test/pageArchetypeContract.test.ts.
 */

export interface EdgePageArchetype {
  requiredFamilies: string[];
  forbiddenFamilies: string[];
  forbiddenTags: string[];
  maxBodySections: number;
}

export const COMPILER_OWNED_FAMILIES = ['navbar', 'footer'];

export const PAGE_ARCHETYPES: Record<string, EdgePageArchetype> = {
  home: { requiredFamilies: ['hero', 'cta'], forbiddenFamilies: ['blog-preview'], forbiddenTags: [], maxBodySections: 8 },
  services: { requiredFamilies: ['services', 'cta'], forbiddenFamilies: ['blog-preview', 'logo-cloud'], forbiddenTags: ['marquee'], maxBodySections: 7 },
  pricing: { requiredFamilies: ['pricing', 'faq'], forbiddenFamilies: ['gallery', 'blog-preview', 'before-after', 'team'], forbiddenTags: ['marquee', 'immersive'], maxBodySections: 6 },
  about: { requiredFamilies: ['about'], forbiddenFamilies: ['pricing', 'blog-preview'], forbiddenTags: [], maxBodySections: 6 },
  contact: { requiredFamilies: ['contact'], forbiddenFamilies: ['pricing', 'gallery', 'blog-preview', 'before-after', 'logo-cloud', 'testimonials'], forbiddenTags: ['marquee', 'immersive'], maxBodySections: 4 },
  gallery: { requiredFamilies: ['gallery'], forbiddenFamilies: ['pricing', 'faq', 'blog-preview'], forbiddenTags: [], maxBodySections: 5 },
  faq: { requiredFamilies: ['faq'], forbiddenFamilies: ['gallery', 'pricing', 'blog-preview', 'before-after', 'team', 'logo-cloud'], forbiddenTags: ['marquee', 'immersive'], maxBodySections: 4 },
  booking: { requiredFamilies: ['services', 'contact'], forbiddenFamilies: ['blog-preview', 'gallery', 'logo-cloud', 'before-after'], forbiddenTags: ['marquee', 'immersive'], maxBodySections: 5 },
  shop: { requiredFamilies: ['services'], forbiddenFamilies: ['blog-preview', 'team'], forbiddenTags: [], maxBodySections: 7 },
  checkout: { requiredFamilies: ['contact'], forbiddenFamilies: ['hero', 'gallery', 'blog-preview', 'testimonials', 'logo-cloud', 'before-after', 'team', 'stats', 'cta', 'pricing', 'services', 'features', 'about'], forbiddenTags: ['marquee', 'immersive', 'parallax'], maxBodySections: 3 },
  thank_you: { requiredFamilies: ['cta'], forbiddenFamilies: ['pricing', 'gallery', 'blog-preview', 'before-after', 'logo-cloud', 'team', 'services', 'features', 'testimonials'], forbiddenTags: ['marquee', 'immersive', 'parallax'], maxBodySections: 3 },
  blog: { requiredFamilies: ['blog-preview'], forbiddenFamilies: ['pricing', 'before-after', 'gallery', 'team', 'logo-cloud'], forbiddenTags: ['immersive'], maxBodySections: 4 },
  immersive: { requiredFamilies: ['hero'], forbiddenFamilies: ['pricing', 'faq', 'blog-preview', 'logo-cloud', 'team', 'contact'], forbiddenTags: [], maxBodySections: 4 },
  custom: { requiredFamilies: [], forbiddenFamilies: [], forbiddenTags: [], maxBodySections: 6 },
};

export const pageArchetypeFor = (role: string): EdgePageArchetype =>
  PAGE_ARCHETYPES[role] ?? PAGE_ARCHETYPES.custom;

/**
 * Edge mirror of src/sections/templates/industryCreativeVocabulary.ts — the
 * industry dialect. Only the validator-relevant fields are mirrored (required,
 * preferred and discouraged families, discouraged traits). Drift against the
 * client table is asserted by src/test/pageArchetypeContract.test.ts.
 */
export interface EdgeIndustryPageProfile {
  requiredFamilies?: string[];
  preferredFamilies?: string[];
  discouragedFamilies?: string[];
}
export interface EdgeIndustryDialect {
  preferredFamilies: string[];
  discouragedFamilies: string[];
  discouragedTags: string[];
  pageProfiles: Record<string, EdgeIndustryPageProfile>;
}

export const INDUSTRY_ALIASES: Record<string, string> = {
  barber: 'salon', medspa: 'salon', wellness: 'salon',
  dental: 'local-service', healthcare: 'local-service', contractor: 'local-service',
  local_service: 'local-service', hvac: 'local-service', cleaning: 'local-service',
  landscaping: 'local-service', auto_detailing: 'local-service', moving: 'local-service',
  legal: 'agency', landing: 'agency',
  realestate: 'real-estate', real_estate: 'real-estate',
  store: 'ecommerce', 'e-commerce': 'ecommerce',
  photographer: 'portfolio', photography: 'portfolio', creative: 'portfolio', creator: 'portfolio',
  fitness: 'coaching', content: 'nonprofit',
};

export const INDUSTRY_DIALECTS: Record<string, EdgeIndustryDialect> = {
  salon: {
    preferredFamilies: ['gallery', 'before-after', 'team', 'testimonials', 'services'],
    discouragedFamilies: ['logo-cloud', 'blog-preview'], discouragedTags: ['mono-terminal'],
    pageProfiles: {
      home: { requiredFamilies: ['services'], preferredFamilies: ['gallery', 'before-after', 'team', 'testimonials'] },
      services: { preferredFamilies: ['pricing', 'before-after', 'faq'] },
      gallery: { requiredFamilies: ['before-after'], preferredFamilies: ['testimonials'] },
      about: { requiredFamilies: ['team'] },
      booking: { preferredFamilies: ['testimonials', 'faq'] },
    },
  },
  'local-service': {
    preferredFamilies: ['before-after', 'stats', 'testimonials', 'services', 'faq'],
    discouragedFamilies: ['blog-preview'], discouragedTags: ['immersive', 'parallax', 'marquee'],
    pageProfiles: {
      home: { requiredFamilies: ['services'], preferredFamilies: ['stats', 'before-after', 'testimonials', 'faq'] },
      gallery: { requiredFamilies: ['before-after'] },
      services: { preferredFamilies: ['faq', 'stats'] },
      contact: { preferredFamilies: ['faq'] },
    },
  },
  restaurant: {
    preferredFamilies: ['gallery', 'services', 'testimonials', 'about'],
    discouragedFamilies: ['logo-cloud', 'pricing'], discouragedTags: ['mono-terminal', 'brutalist'],
    pageProfiles: {
      home: { requiredFamilies: ['services'], preferredFamilies: ['gallery', 'about', 'testimonials'] },
      services: { preferredFamilies: ['gallery'], discouragedFamilies: ['pricing'] },
      gallery: { preferredFamilies: ['about'] },
      booking: { preferredFamilies: ['faq'] },
    },
  },
  saas: {
    preferredFamilies: ['features', 'pricing', 'logo-cloud', 'stats', 'faq'],
    discouragedFamilies: ['before-after', 'team'], discouragedTags: [],
    pageProfiles: {
      home: { requiredFamilies: ['features'], preferredFamilies: ['logo-cloud', 'pricing', 'stats', 'testimonials'] },
      services: { requiredFamilies: ['features'], preferredFamilies: ['pricing', 'faq'] },
      pricing: { preferredFamilies: ['stats', 'testimonials'] },
      about: { preferredFamilies: ['stats', 'team'] },
    },
  },
  agency: {
    preferredFamilies: ['gallery', 'logo-cloud', 'stats', 'services', 'testimonials'],
    discouragedFamilies: [], discouragedTags: [],
    pageProfiles: {
      home: { requiredFamilies: ['services'], preferredFamilies: ['logo-cloud', 'gallery', 'stats', 'testimonials'] },
      gallery: { preferredFamilies: ['stats', 'testimonials'] },
      about: { requiredFamilies: ['team'], preferredFamilies: ['stats'] },
      services: { preferredFamilies: ['stats'] },
    },
  },
  portfolio: {
    preferredFamilies: ['gallery', 'about', 'testimonials'],
    discouragedFamilies: ['logo-cloud', 'pricing', 'stats'], discouragedTags: [],
    pageProfiles: {
      home: { requiredFamilies: ['gallery'], preferredFamilies: ['about', 'testimonials'] },
      gallery: { preferredFamilies: ['about', 'cta'], discouragedFamilies: ['pricing'] },
      about: { preferredFamilies: ['gallery'] },
      services: { discouragedFamilies: ['logo-cloud'] },
    },
  },
  coaching: {
    preferredFamilies: ['testimonials', 'about', 'faq', 'services', 'stats'],
    discouragedFamilies: ['logo-cloud'], discouragedTags: ['brutalist', 'mono-terminal'],
    pageProfiles: {
      home: { requiredFamilies: ['testimonials'], preferredFamilies: ['about', 'services', 'faq'] },
      services: { preferredFamilies: ['testimonials', 'pricing', 'faq'] },
      about: { preferredFamilies: ['testimonials', 'stats'] },
      booking: { preferredFamilies: ['testimonials', 'faq'] },
    },
  },
  ecommerce: {
    preferredFamilies: ['gallery', 'testimonials', 'features', 'faq'],
    discouragedFamilies: ['team', 'before-after'], discouragedTags: [],
    pageProfiles: {
      home: { requiredFamilies: ['services'], preferredFamilies: ['gallery', 'testimonials', 'features'] },
      shop: { preferredFamilies: ['gallery', 'testimonials', 'faq'] },
      gallery: { preferredFamilies: ['cta'] },
      checkout: {},
    },
  },
  'real-estate': {
    preferredFamilies: ['gallery', 'stats', 'team', 'faq'],
    discouragedFamilies: ['logo-cloud', 'blog-preview'], discouragedTags: ['brutalist', 'mono-terminal'],
    pageProfiles: {
      home: { requiredFamilies: ['gallery'], preferredFamilies: ['stats', 'services', 'testimonials'] },
      gallery: { preferredFamilies: ['stats', 'cta'] },
      about: { requiredFamilies: ['team'], preferredFamilies: ['stats'] },
      contact: { preferredFamilies: ['faq'] },
    },
  },
  nonprofit: {
    preferredFamilies: ['stats', 'about', 'testimonials', 'team'],
    discouragedFamilies: ['pricing'], discouragedTags: ['neon', 'brutalist'],
    pageProfiles: {
      home: { requiredFamilies: ['stats'], preferredFamilies: ['about', 'testimonials', 'gallery'] },
      about: { requiredFamilies: ['team'], preferredFamilies: ['stats'] },
      services: { discouragedFamilies: ['pricing'] },
      blog: { preferredFamilies: ['cta'] },
    },
  },
};

const union = (...groups: Array<string[] | undefined>): string[] =>
  Array.from(new Set(groups.flatMap(group => group ?? [])));

/** Exact mirror of the client resolvePageArchetype (validator-relevant fields). */
export function resolvePageArchetype(role: string, industry?: string | null): EdgePageArchetype {
  const base = pageArchetypeFor(role);
  if (!industry) return base;
  const dialect = INDUSTRY_DIALECTS[INDUSTRY_ALIASES[industry.trim().toLowerCase()] ?? industry.trim().toLowerCase()];
  if (!dialect) return base;
  const page = dialect.pageProfiles[role];
  const requiredFamilies = union(base.requiredFamilies, page?.requiredFamilies);
  const forbiddenFamilies = union(base.forbiddenFamilies, dialect.discouragedFamilies, page?.discouragedFamilies)
    .filter(family => !requiredFamilies.includes(family) && !(page?.preferredFamilies ?? []).includes(family));
  return {
    requiredFamilies,
    forbiddenFamilies,
    forbiddenTags: union(base.forbiddenTags, dialect.discouragedTags),
    maxBodySections: Math.max(base.maxBodySections, requiredFamilies.length),
  };
}

const isChrome = (family: string) => COMPILER_OWNED_FAMILIES.includes(family);


/** Exact mirror of the client normalizePageSectionOrder. */
export function normalizePageSectionOrder(role: string, sectionOrder: string[]): string[] {
  const archetype = pageArchetypeFor(role);
  const forbidden = new Set(archetype.forbiddenFamilies);
  const kept = sectionOrder.filter((family, index) =>
    sectionOrder.indexOf(family) === index && (isChrome(family) || !forbidden.has(family)));

  // Missing required families are NOT synthesised here: adding a family the
  // model never planned would emit an empty section. They surface as archetype
  // issues so the composition lane asks the model to repair its own plan.

  const body = kept.filter(family => !isChrome(family));
  if (body.length <= archetype.maxBodySections) return kept;
  const required = new Set(archetype.requiredFamilies);
  const dropped = new Set<string>();
  let over = body.length - archetype.maxBodySections;
  for (let index = body.length - 1; index >= 0 && over > 0; index -= 1) {
    if (required.has(body[index])) continue;
    dropped.add(body[index]);
    over -= 1;
  }
  return kept.filter(family => !dropped.has(family));
}

/** Exact mirror of the client pageArchetypeIssues. */
export function pageArchetypeIssues(
  role: string,
  sectionOrder: string[],
  variantTags: Record<string, string[]> = {},
  options: { requireFamilies?: boolean } = {},
): string[] {
  const archetype = pageArchetypeFor(role);
  const issues: string[] = [];
  const body = sectionOrder.filter(family => !isChrome(family));
  for (const family of sectionOrder) {
    if (archetype.forbiddenFamilies.includes(family)) {
      issues.push(`pages.${role}.sectionOrder: ${family} is forbidden on a ${role} page`);
    }
  }
  for (const required of options.requireFamilies === false ? [] : archetype.requiredFamilies) {
    if (!sectionOrder.includes(required)) {
      issues.push(`pages.${role}.sectionOrder: a ${role} page must include ${required}`);
    }
  }
  if (body.length > archetype.maxBodySections) {
    issues.push(`pages.${role}.sectionOrder: at most ${archetype.maxBodySections} body sections`);
  }
  for (const [family, tags] of Object.entries(variantTags)) {
    const blocked = tags.filter(tag => archetype.forbiddenTags.includes(tag));
    if (blocked.length) {
      issues.push(`pages.${role}.variants.${family}: ${blocked.join(', ')} is forbidden on a ${role} page`);
    }
  }
  return issues;
}
