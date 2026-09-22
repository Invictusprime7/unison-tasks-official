/** Shared by the canonical compiler and Wizard layout descriptions. */
import type { SectionEntry, SectionType } from './types';
import type { VariantId } from './variants/types';
import { getVariantById, getVariantsForSection, getLayoutForVariantId } from './variants/registry';

export interface SectionFamilyEmit {
  sectionType: SectionType;
  /** Legacy layout token used when a composition carries no explicit variant. */
  defaultLayout?: string;
  /** Certified default variant id, preferred over the layout token. */
  defaultVariantId?: VariantId;
  /** Legacy aliases kept so older compositions still resolve to a certified variant. */
  aliases?: Record<string, VariantId>;
}

/**
 * P1.10 — legacy fallback retirement.
 *
 * A family's *fallback* design (what renders when a composition carries no
 * explicit, resolvable variant) must be a certified implementation. Generic
 * pre-21st layouts stay registered so authored compositions that name them
 * keep resolving, but they may never win by default again.
 */
export function isCertifiedImplementation(variantId: string | undefined): boolean {
  if (!variantId) return false;
  const variant = getVariantById(variantId as VariantId);
  return variant?.vfs?.mode === 'portable-recipe' && variant.vfs.certification === 'approved';
}

export const SECTION_FAMILY_EMIT = {
  Navbar: { sectionType: 'navbar', defaultLayout: 'standard', defaultVariantId: 'navbar:standard' },
  Hero: {
    sectionType: 'hero',
    defaultLayout: 'centered',
    defaultVariantId: 'hero:centered',
    aliases: { split: 'hero:split-image' },
  },
  About: { sectionType: 'about', defaultVariantId: 'about:image-story' },
  Services: { sectionType: 'services', defaultLayout: 'card-grid', defaultVariantId: 'services:editorial-rows' },
  Features: { sectionType: 'features', defaultLayout: 'grid', defaultVariantId: 'features:spotlight-cards', aliases: { centered: 'features:minimal-centered' } },
  Gallery: { sectionType: 'gallery', defaultLayout: 'grid', defaultVariantId: 'gallery:case-study' },
  Pricing: { sectionType: 'pricing', defaultLayout: 'tiers', defaultVariantId: 'pricing:feature-table' },
  LogoCloud: { sectionType: 'logo-cloud', defaultVariantId: 'logo-cloud:reveal-tiles' },
  BlogPreview: { sectionType: 'blog-preview', defaultVariantId: 'blog-preview:four-columns' },
  BeforeAfter: { sectionType: 'before-after', defaultVariantId: 'before-after:reveal-panel' },
  Testimonials: {
    sectionType: 'testimonials',
    defaultLayout: 'grid',
    defaultVariantId: 'testimonials:columns',
    aliases: { carousel: 'testimonials:rail', single: 'testimonials:spotlight' },
  },
  CTA: { sectionType: 'cta', defaultLayout: 'centered', defaultVariantId: 'cta:inset-panel' },
  Contact: { sectionType: 'contact', defaultLayout: 'centered', defaultVariantId: 'contact:editorial-form' },
  Footer: { sectionType: 'footer', defaultLayout: 'columns', defaultVariantId: 'footer:brand-social' },
  Stats: { sectionType: 'stats', defaultVariantId: 'stats:metric-cards' },
  Team: { sectionType: 'team', defaultVariantId: 'team:profile-cards' },
  FAQ: { sectionType: 'faq', defaultVariantId: 'faq:editorial' },
} satisfies Record<string, SectionFamilyEmit>;

export function layoutVariantMap(family: SectionFamilyEmit): Record<string, string> {
  const map: Record<string, string> = {};
  for (const variant of getVariantsForSection(family.sectionType)) {
    const layout = getLayoutForVariantId(variant.id);
    if (layout) map[layout] = variant.id;
    if (variant.slug) map[variant.slug] = variant.id;
    map[variant.id] = variant.id;
  }
  for (const [alias, variantId] of Object.entries(family.aliases ?? {})) {
    if (getVariantById(variantId)) map[alias] = variantId;
  }
  return map;
}

export function certifiedDefaultVariantId(
  componentName: string,
  family: SectionFamilyEmit,
  map: Record<string, string>,
): string {
  const declared = [
    family.defaultVariantId,
    family.defaultLayout ? map[family.defaultLayout] : undefined,
  ].filter(Boolean) as string[];
  const resolved = declared.find(isCertifiedImplementation)
    ?? getVariantsForSection(family.sectionType).find((variant) => isCertifiedImplementation(variant.id))?.id;
  if (!resolved) {
    throw new Error(
      `[compositionToFileSet] section family ${componentName} (${family.sectionType}) has no certified ` +
      'registered variant. A family may not be emitted without a canonical implementation.',
    );
  }
  return resolved;
}



export function resolveSectionLayout(section: SectionEntry) {
  const family = Object.values(SECTION_FAMILY_EMIT).find(entry => entry.sectionType === section.type);
  if (!family) return undefined;
  const map = layoutVariantMap(family);
  const layout = (section.props as { layout?: string }).layout;
  const requested = section.variantId || (layout && map[layout]);
  const candidate = requested ? getVariantById(requested as VariantId) : undefined;
  return candidate?.sectionType === section.type ? candidate : getVariantById(
    certifiedDefaultVariantId(section.type, family, map) as VariantId,
  );
}
