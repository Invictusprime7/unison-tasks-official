import { describe, expect, it } from 'vitest';
import { applySemanticPresentationOps } from '@/services/builder/semanticPresentationOps';
import type { WizardDesignIntervention } from '@/services/wizardDesignIntervention';
import { getGenerationVariantsForSection } from '@/sections/variants/registry';
import { ART_DIRECTION_PACKS, ART_DIRECTION_PACK_IDS } from '@/sections/variants/artDirectionPacks';

const packId = ART_DIRECTION_PACK_IDS[0];
const heroes = getGenerationVariantsForSection('hero', ART_DIRECTION_PACKS[packId], 'home');

function intervention(): WizardDesignIntervention {
  return {
    artDirectionPackId: packId,
    activeVariants: { 'hero-1': heroes[0].id, 'hero-2': heroes[0].id },
    compositionPlan: {
      version: '1.0',
      pages: [
        { role: 'home', sectionOrder: ['hero'], variants: { hero: heroes[0].id } },
        { role: 'about', sectionOrder: ['hero'], variants: { hero: heroes[0].id } },
      ],
    },
  } as unknown as WizardDesignIntervention;
}

describe('§7.7 site-wide edits use inheritance', () => {
  const target = heroes[1] ?? heroes[0];

  it('writes one shared family decision instead of rewriting each page', () => {
    const next = applySemanticPresentationOps(intervention(), [
      { type: 'setFamilyVariant', sectionType: 'hero', variantId: target.id },
    ]);
    expect(next.activeVariants['hero-1']).toBe(target.id);
    expect(next.activeVariants['hero-2']).toBe(target.id);
    for (const page of next.compositionPlan!.pages) {
      expect(page.variants.hero).toBeUndefined();
    }
  });

  it('keeps a named page as an explicit exception', () => {
    const next = applySemanticPresentationOps(intervention(), [
      { type: 'setFamilyVariant', sectionType: 'hero', variantId: target.id, exceptPageRoles: ['home'] },
    ]);
    const home = next.compositionPlan!.pages.find(page => page.role === 'home');
    const about = next.compositionPlan!.pages.find(page => page.role === 'about');
    expect(home?.variants.hero).toBe(heroes[0].id);
    expect(about?.variants.hero).toBeUndefined();
  });


  it('refuses a design that is not registered for the family', () => {
    expect(() => applySemanticPresentationOps(intervention(), [
      { type: 'setFamilyVariant', sectionType: 'hero', variantId: 'footer:columns' },
    ])).toThrow(/not a registered hero design/);
  });

  it('refuses a family the site does not have', () => {
    const pricing = getGenerationVariantsForSection('pricing', ART_DIRECTION_PACKS[packId], 'home')[0];
    expect(() => applySemanticPresentationOps(intervention(), [
      { type: 'setFamilyVariant', sectionType: 'pricing', variantId: pricing.id },
    ])).toThrow(/no pricing section/);
  });
});
