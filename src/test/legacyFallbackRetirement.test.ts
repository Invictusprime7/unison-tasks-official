import { describe, it, expect } from 'vitest';
import {
  SECTION_FAMILY_EMIT,
  certifiedDefaultVariantId,
  layoutVariantMap,
  isCertifiedImplementation,
  resolveSectionLayout,
} from '@/sections/resolveSectionLayout';
import { getVariantsForSection, getVariantById } from '@/sections/variants/registry';
import type { SectionEntry } from '@/sections/types';
import type { VariantId } from '@/sections/variants/types';

/**
 * P1.10 — legacy fallback retirement.
 *
 * Generic pre-21st layouts may remain registered so authored compositions that
 * name them still resolve, but no family may fall back to one. Every fallback
 * the compiler can reach must be a certified (portable-recipe, approved)
 * implementation.
 */
describe('legacy fallback retirement', () => {
  const families = Object.entries(SECTION_FAMILY_EMIT);

  it('declares a certified default for every emitted section family', () => {
    for (const [componentName, family] of families) {
      expect(family.defaultVariantId, componentName).toBeTruthy();
      expect(isCertifiedImplementation(family.defaultVariantId), `${componentName} -> ${family.defaultVariantId}`).toBe(true);
    }
  });

  it('resolves the compiled fallback to a certified implementation', () => {
    for (const [componentName, family] of families) {
      const resolved = certifiedDefaultVariantId(componentName, family, layoutVariantMap(family));
      expect(isCertifiedImplementation(resolved), `${componentName} -> ${resolved}`).toBe(true);
      expect(getVariantById(resolved as VariantId)?.sectionType).toBe(family.sectionType);
    }
  });

  it('never falls back to an uncertified layout token or unknown variant', () => {
    for (const [, family] of families) {
      const unknownLayout = resolveSectionLayout({
        id: 'probe', type: family.sectionType, props: { layout: '__retired__' },
      } as SectionEntry);
      const unknownVariant = resolveSectionLayout({
        id: 'probe', type: family.sectionType, variantId: 'does-not:exist', props: {},
      } as unknown as SectionEntry);
      for (const candidate of [unknownLayout, unknownVariant]) {
        expect(candidate?.id, family.sectionType).toBeTruthy();
        expect(isCertifiedImplementation(candidate?.id), `${family.sectionType} -> ${candidate?.id}`).toBe(true);
      }
    }
  });

  it('keeps authored uncertified variants resolvable — retirement applies to fallbacks only', () => {
    const legacy = families
      .map(([, family]) => getVariantsForSection(family.sectionType).find((variant) => !isCertifiedImplementation(variant.id)))
      .find(Boolean);
    if (!legacy) return; // every registered variant is certified — nothing to retire.
    const resolved = resolveSectionLayout({
      id: 'probe', type: legacy.sectionType, variantId: legacy.id, props: {},
    } as SectionEntry);
    expect(resolved?.id).toBe(legacy.id);
  });
});
