/**
 * Pack Completeness Invariant.
 *
 * An Art Direction Pack is canonical only when every applicable site surface
 * resolves to at least one executable variant: registered, certified, and a
 * portable recipe (the proof that registry, VFS, Preview, WYSIWYG, AI edit,
 * snapshot and rehydration consumers can all execute it). Incomplete packs
 * are never eligible for automatic composition.
 */
import { getVariantById } from './index';
import { isCertifiedImplementation } from '../resolveSectionLayout';
import { ART_DIRECTION_PACKS, type ArtDirectionPack, type ArtDirectionPackId } from './artDirectionPacks';
import type { SectionType } from '../types';

/** Canonical surfaces → section types that may satisfy them (any one). */
export const PACK_SURFACES: Record<string, readonly SectionType[]> = {
  navbar: ['navbar'],
  hero: ['hero'],
  proof: ['stats', 'logo-cloud', 'testimonials'],
  'features-services': ['services', 'features'],
  'media-gallery': ['gallery'],
  products: ['services'],
  testimonials: ['testimonials'],
  pricing: ['pricing'],
  faq: ['faq'],
  'conversion-form': ['contact'],
  cta: ['cta'],
  footer: ['footer'],
} as unknown as Record<string, readonly SectionType[]>;

export interface PackCompletenessReport {
  packId: ArtDirectionPackId;
  complete: boolean;
  missingSurfaces: string[];
  ineligibleVariants: string[];
}

function familyFor(pack: ArtDirectionPack, type: SectionType): string[] {
  if (type === 'navbar') return pack.navbarFamily;
  if (type === 'footer') return pack.footerFamily;
  return (pack.sectionFamilies[type] ?? []) as string[];
}

export function isExecutableVariant(variantId: string): boolean {
  return Boolean(getVariantById(variantId as never)) && isCertifiedImplementation(variantId);
}

export function validatePackCompleteness(pack: ArtDirectionPack): PackCompletenessReport {
  const missingSurfaces: string[] = [];
  const ineligible = new Set<string>();
  for (const [surface, types] of Object.entries(PACK_SURFACES)) {
    let satisfied = false;
    for (const type of types) {
      for (const id of familyFor(pack, type)) {
        if (isExecutableVariant(id)) satisfied = true;
        else ineligible.add(id);
      }
    }
    if (!satisfied) missingSurfaces.push(surface);
  }
  return {
    packId: pack.id as ArtDirectionPackId,
    complete: missingSurfaces.length === 0,
    missingSurfaces,
    ineligibleVariants: [...ineligible].sort(),
  };
}

const cache = new Map<string, PackCompletenessReport>();
export function isCanonicalPack(packId: string): boolean {
  const pack = ART_DIRECTION_PACKS[packId as ArtDirectionPackId];
  if (!pack) return false;
  let report = cache.get(packId);
  if (!report) {
    report = validatePackCompleteness(pack);
    cache.set(packId, report);
  }
  return report.complete;
}

export function listPackCompleteness(): PackCompletenessReport[] {
  return Object.values(ART_DIRECTION_PACKS).map(validatePackCompleteness);
}
