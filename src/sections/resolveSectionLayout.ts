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

export const SECTION_FAMILY_EMIT = {
  Navbar: { sectionType: 'navbar', defaultLayout: 'standard' },
  Hero: { sectionType: 'hero', defaultLayout: 'centered', aliases: { split: 'hero:split-image' } },
  About: { sectionType: 'about', defaultVariantId: 'about:editorial-split' },
  Services: { sectionType: 'services', defaultLayout: 'card-grid' },
  Features: { sectionType: 'features', defaultLayout: 'grid', aliases: { centered: 'features:minimal-centered' } },
  Gallery: { sectionType: 'gallery', defaultLayout: 'grid' },
  Pricing: { sectionType: 'pricing', defaultLayout: 'tiers' },
  LogoCloud: { sectionType: 'logo-cloud', defaultVariantId: 'logo-cloud:grid' },
  BlogPreview: { sectionType: 'blog-preview', defaultVariantId: 'blog-preview:editorial' },
  BeforeAfter: { sectionType: 'before-after', defaultVariantId: 'before-after:slider' },
  Testimonials: {
    sectionType: 'testimonials',
    defaultLayout: 'grid',
    aliases: { carousel: 'testimonials:rail', single: 'testimonials:spotlight' },
  },
  CTA: { sectionType: 'cta', defaultLayout: 'centered' },
  Contact: { sectionType: 'contact', defaultLayout: 'centered' },
  Footer: { sectionType: 'footer', defaultLayout: 'columns' },
  Stats: { sectionType: 'stats', defaultVariantId: 'stats:row' },
  Team: { sectionType: 'team', defaultVariantId: 'team:portrait-grid' },
  FAQ: { sectionType: 'faq', defaultVariantId: 'faq:accordion' },
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
  const candidates = [
    family.defaultVariantId,
    family.defaultLayout ? map[family.defaultLayout] : undefined,
    getVariantsForSection(family.sectionType)[0]?.id,
  ].filter(Boolean) as string[];
  const resolved = candidates.find((id) => Boolean(getVariantById(id as VariantId)));
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
