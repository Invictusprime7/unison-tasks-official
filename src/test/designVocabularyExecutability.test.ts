import { describe, expect, it } from 'vitest';
import { VARIANT_REGISTRY } from '@/sections/variants';
import type { SectionVariant } from '@/sections/variants';
import { DESIGN_VOCABULARY, getVocabularyEntry } from '@/platform/core/designVocabulary';
import {
  getDesignImplementation,
  isExecutableVocabulary,
  listImplementationsForVocabulary,
  vocabularyExecutabilityReport,
  vocabularyKey,
} from '@/services/designImplementationRegistry';
import { buildWizardDesignIntervention } from '@/services/wizardDesignIntervention';

const allVariants = Object.values(VARIANT_REGISTRY).flat() as SectionVariant[];
const mappedVariants = allVariants.filter((variant) => variant.vocabulary);

describe('design vocabulary executability', () => {
  it.each(mappedVariants)('resolves $id against a real vocabulary entry', (variant) => {
    const { category, id } = variant.vocabulary!;
    expect(getVocabularyEntry(category, id), `unknown vocabulary entry ${category}:${id}`).toBeDefined();
    expect(listImplementationsForVocabulary(variant.vocabulary!).map((impl) => impl.implementationId))
      .toContain(variant.id);
  });

  it('does not let two families claim the same vocabulary entry by accident', () => {
    for (const [key, implementations] of Object.entries(
      mappedVariants.reduce<Record<string, string[]>>((groups, variant) => {
        const key = vocabularyKey(variant.vocabulary!);
        (groups[key] ??= []).push(variant.sectionType);
        return groups;
      }, {}),
    )) {
      expect(new Set(implementations).size, `${key} is claimed by multiple section families`).toBe(1);
    }
  });

  it('reports the current executable / unimplemented partition of the vocabulary', () => {
    const report = vocabularyExecutabilityReport();

    expect([...report.executable, ...report.unimplemented].sort())
      .toEqual(DESIGN_VOCABULARY.map((entry) => vocabularyKey(entry)).sort());
    expect(report.executable).toEqual([
      'hero:split-cinematic',
      'content:horizontal-scroll',
      'content:split-feature',
      'content:comparison',
      'media:masonry',
      'media:lightbox',
      'navigation:split',
    ]);
    // Phase 5 closes this by registering implementations, never by trimming
    // the vocabulary — so this list is expected to shrink, not to be edited.
    expect(report.unimplemented.length).toBeGreaterThan(0);
    expect(report.unimplemented).toContain('hero:immersive-product');
    expect(report.unimplemented).toContain('commerce:product-stage');
  });

  it('treats an unmapped entry as unexecutable', () => {
    expect(isExecutableVocabulary({ category: 'media', id: 'masonry' })).toBe(true);
    expect(isExecutableVocabulary({ category: 'hero', id: 'kinetic-type' })).toBe(false);
    // Ids are unique per category only: `split` exists for navigation, not hero.
    expect(isExecutableVocabulary({ category: 'hero', id: 'split' })).toBe(false);
  });
});

describe('sealed composition directive', () => {
  const launches = [
    {
      businessName: 'Northstar Salon',
      businessModel: 'appointment_service' as const,
      industryOverlay: 'salon' as const,
      templateId: 'salon-premium',
      themePresetId: 'organic',
      wizardSeedId: 'wizard-salon-1',
      needsBooking: true,
    },
    {
      businessName: 'Northstar Store',
      businessModel: 'ecommerce' as const,
      industryOverlay: 'ecommerce' as const,
      templateId: 'store-boutique',
      themePresetId: 'editorial',
      wizardSeedId: 'wizard-store-1',
      sellsProducts: true,
    },
  ];

  it.each(launches)('names only implementations this launch resolved for $businessName', (launch) => {
    const { aiDirective, activeVariants } = buildWizardDesignIntervention(launch);
    const resolved = new Set(Object.values(activeVariants));
    const named = [...aiDirective.matchAll(/registered implementations ([^—]+)—/g)][0]?.[1]
      .split(',').map((id) => id.trim()) ?? [];

    expect(named.length).toBeGreaterThan(0);
    expect(new Set(named)).toEqual(resolved);
    for (const id of named) expect(getDesignImplementation(id)).toBeDefined();
  });

  it('describes the design language only through implementations that claim one', (): void => {
    const { aiDirective, activeVariants } = buildWizardDesignIntervention(launches[0]);
    const claimed = new Set(
      Object.values(activeVariants)
        .map((id) => getDesignImplementation(id)?.vocabulary)
        .filter(Boolean)
        .map((ref) => ref!.id),
    );
    const stated = [...aiDirective.matchAll(/design language is ([^;]+);/g)][0]?.[1]
      .split(',').map((id) => id.trim()) ?? [];

    expect(new Set(stated)).toEqual(claimed);
    for (const id of stated) {
      expect(
        DESIGN_VOCABULARY.some((entry) => entry.id === id && isExecutableVocabulary(entry)),
        `directive states unimplemented vocabulary "${id}"`,
      ).toBe(true);
    }
  });
});
