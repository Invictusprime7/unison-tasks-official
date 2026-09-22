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
