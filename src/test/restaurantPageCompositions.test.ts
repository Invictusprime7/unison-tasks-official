import { describe, expect, it } from 'vitest';
import { collectResolvedCompositions } from '@/platform/core/resolvedComposition';
import type { GeneratedSitePlan, PageRole, PageRouteNode } from '@/platform/core/siteTopologyPlanner';
import { resolveBuilderRegistryContext } from '@/services/builderRegistryContext';
import { getDesignImplementation } from '@/services/designImplementationRegistry';
import { buildWizardAggregatedRegistryContext, WIZARD_REGISTRY_CONTEXT_PATH } from '@/services/launch/wizardRegistryAggregation';
import { getCompositionById } from '@/sections/templates';
import type { SectionEntry } from '@/sections/types';
import { getVariantById } from '@/sections/variants';
import { findUnresolvedLocalImports } from '@/services/laneBCompanionModules';
import { generateTopologyPlaceholderFiles } from '@/utils/topologyVFSScaffolder';

const template = getCompositionById('restaurant-premium')!;

function compile(role: 'services' | 'booking', seed: string) {
  const page: PageRouteNode = {
    id: `${role}-page`, name: role, title: role === 'services' ? 'Menu' : 'Reservations',
    route: role === 'services' ? '/menu' : '/reservations', role: role as PageRole,
    filePath: `/src/pages/${role}.tsx`, visibleInNav: true, isHome: false, generatedBy: 'wizard',
  };
  const plan: GeneratedSitePlan = {
    siteId: 'restaurant-proof', industry: 'restaurant', businessName: 'Ember Test', homePageId: 'home',
    pages: [page], navItems: [page.id], funnels: [], redirects: [], generatedAt: '2026-09-30',
    selectedTemplateId: template.id, selectedThemePresetId: 'organic',
  };
  const files = generateTopologyPlaceholderFiles(page, plan, template, {
    designIntervention: { seed, motionRecipes: [], sectionVariants: [], activeVariants: {} },
  });
  const match = files[page.filePath].match(/const SECTIONS = ([\s\S]*?);\nconst HYDRATABLE/)!;
  return {
    files,
    sections: JSON.parse(match[1]) as SectionEntry[],
    descriptor: collectResolvedCompositions(files)[page.filePath],
  };
}

describe('restaurant deterministic page grammars', () => {
  it.each(['services', 'booking'] as const)('%s reaches every seeded alternative and emits portable VFS', role => {
    const definition = template.pageCompositions![role]!;
    const seen = new Set<string>();
    for (let index = 0; index < 24; index += 1) {
      const result = compile(role, `restaurant-${index}`);
      const alternative = definition.alternatives.find((item) => item.id === result.descriptor.compositionAlternativeId)!;
      seen.add(alternative.id);
      // The authored alternative stays intact while the industry-owned menu
      // contract can supplement it with required route content.
      expect(result.sections.map((section) => section.sourceSectionId))
        .toEqual(expect.arrayContaining(alternative.sectionIds));
      if (role === 'services') expect(result.sections.map((section) => section.type)).toContain('pricing');
      expect(result.sections.at(-1)?.type).toBe('footer');
      expect(result.sections.find((section) => section.type === 'hero')?.variantId).toBe(alternative.heroVariantId);
      expect(result.files).toEqual(compile(role, `restaurant-${index}`).files);
      expect(findUnresolvedLocalImports(result.files)).toEqual([]);
      for (const section of result.sections) {
        if (!section.variantId) continue;
        const variant = getVariantById(section.variantId);
        expect(variant, section.variantId).toBeDefined();
        expect(variant?.vfs?.certification, section.variantId).toMatch(/approved|portable/);
      }
    }
    expect([...seen].sort()).toEqual(definition.alternatives.map((item) => item.id).sort());
  });

  it('projects the executable grammars into Wizard and Builder AI discovery', () => {
    const context = buildWizardAggregatedRegistryContext({
      industry: 'restaurant', templateId: template.id, themePresetId: 'organic', seed: 'proof',
    });
    const serviceGrammar = context.pageCompositions?.find((entry) => entry.role === 'services');
    expect(serviceGrammar?.alternatives.map((item) => item.id)).toEqual([
      'restaurant-menu-editorial', 'restaurant-menu-guided',
    ]);
    const offeredImplementations = new Set(context.implementations?.map((item) => item.id));
    for (const implementationId of serviceGrammar?.alternatives.flatMap((item) => item.implementationIds) ?? []) {
      expect(getDesignImplementation(implementationId), implementationId).toBeDefined();
      expect(offeredImplementations.has(implementationId), implementationId).toBe(true);
    }

    const builder = resolveBuilderRegistryContext({
      vfsFiles: { [WIZARD_REGISTRY_CONTEXT_PATH]: JSON.stringify(context) },
    });
    expect(builder?.pageCompositions).toEqual(context.pageCompositions);
  });
});
