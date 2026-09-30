import { describe, expect, it } from 'vitest';
import { getCompositionById } from '@/sections/templates';
import { compositionToReactFileSet } from '@/sections/compositionToFileSet';
import type { SectionEntry } from '@/sections/types';
import { ART_DIRECTION_PACKS, getVariantById } from '@/sections/variants';
import type { VariantId } from '@/sections/variants';
import { resolveBuilderRegistryContext } from '@/services/builderRegistryContext';
import { compileArtDirectionGrammar } from '@/services/launch/artDirectionGrammar';
import { compileSiteDesignContract } from '@/services/launch/siteDesignContract';
import { buildWizardAggregatedRegistryContext, WIZARD_REGISTRY_CONTEXT_PATH } from '@/services/launch/wizardRegistryAggregation';

function compiledSections(packId: keyof typeof ART_DIRECTION_PACKS): SectionEntry[] {
  const template = getCompositionById('restaurant-premium')!;
  const source = compositionToReactFileSet(template, '/src/pages/Home.tsx', {
    designIntervention: { sectionVariants: [], artDirectionPackId: packId },
  })['/src/pages/Home.tsx'];
  const match = source.match(/const SECTIONS = ([\s\S]*?);\nconst HYDRATABLE/)!;
  return JSON.parse(match[1]) as SectionEntry[];
}

describe('executable art-direction grammar', () => {
  it('projects every grammar dimension from registered pack behavior', () => {
    for (const pack of Object.values(ART_DIRECTION_PACKS)) {
      const grammar = compileArtDirectionGrammar(pack);
      for (const [dimension, values] of Object.entries(grammar)) {
        expect(values.length, `${pack.id}.${dimension}`).toBeGreaterThan(0);
      }
      for (const implementationId of grammar.compositionFamilies) {
        expect(getVariantById(implementationId as VariantId), `${pack.id}:${implementationId}`).toBeDefined();
      }
      expect(grammar.heroFamilies).toEqual(pack.sectionFamilies.hero);
    }
  });

  it('changes composition architecture for identical topology across art directions', () => {
    const warm = compiledSections('warm-craft');
    const futuristic = compiledSections('neon-grid');
    expect(warm.map((section) => section.type)).toEqual(futuristic.map((section) => section.type));
    const warmArchitecture = warm.map((section) => `${section.type}:${section.variantId}`).join('|');
    const futuristicArchitecture = futuristic.map((section) => `${section.type}:${section.variantId}`).join('|');
    expect(warmArchitecture).not.toBe(futuristicArchitecture);
    expect(warm.filter((section, index) => section.variantId !== futuristic[index]?.variantId).length)
      .toBeGreaterThanOrEqual(3);
  });

  it('carries the same grammar through canonical, Wizard and Builder projections', () => {
    const contract = compileSiteDesignContract({
      industry: 'restaurant', roles: ['home', 'services'], artDirectionPackId: 'warm-craft',
    });
    const wizard = buildWizardAggregatedRegistryContext({
      industry: 'restaurant', templateId: 'restaurant-premium', themePresetId: 'organic',
      designSelection: { version: '1.0', mode: 'auto', experience: 'standard', artDirectionPackId: 'warm-craft', sectionPins: {} },
    });
    const builder = resolveBuilderRegistryContext({
      vfsFiles: { [WIZARD_REGISTRY_CONTEXT_PATH]: JSON.stringify(wizard) },
    });
    expect(wizard.artDirectionGrammar).toEqual(contract.grammar);
    expect(builder?.artDirectionGrammar).toEqual(contract.grammar);
  });
});
