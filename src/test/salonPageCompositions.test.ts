import { describe, expect, it } from 'vitest';
import { getCompositionById } from '@/sections/templates';
import { generateTopologyPlaceholderFiles } from '@/utils/topologyVFSScaffolder';
import { collectResolvedCompositions } from '@/platform/core/resolvedComposition';
import type { GeneratedSitePlan, PageRouteNode } from '@/platform/core/siteTopologyPlanner';
import type { SectionEntry } from '@/sections/types';

const template = getCompositionById('salon-premium')!;

function compile(role: 'pricing' | 'faq', seed: string, pageId = `${role}-page`, selectedTemplate = template) {
  const page: PageRouteNode = {
    id: pageId, name: role, title: role, route: `/${role}`, role,
    filePath: `/src/pages/${role}.tsx`, visibleInNav: true, isHome: false, generatedBy: 'wizard',
  };
  const plan: GeneratedSitePlan = {
    siteId: 'test', industry: 'salon', businessName: 'Test Studio', homePageId: 'home',
    pages: [page], navItems: [pageId], funnels: [], redirects: [], generatedAt: '2026-09-08',
    selectedTemplateId: template.id, selectedThemePresetId: 'editorial',
  };
  const files = generateTopologyPlaceholderFiles(page, plan, selectedTemplate, {
    designIntervention: { seed, motionRecipes: [], sectionVariants: [], activeVariants: {} },
  });
  const match = files[page.filePath].match(/const SECTIONS = ([\s\S]*?);\nconst HYDRATABLE/)!;
  return { files, sections: JSON.parse(match[1]) as SectionEntry[], descriptor: collectResolvedCompositions(files)[page.filePath] };
}

describe('Salon explicit page alternatives', () => {
  it.each(['pricing', 'faq'] as const)('%s resolves both alternatives reproducibly without page-ID randomness', role => {
    const definition = template.pageCompositions![role]!;
    const seen = new Set<string>();
    const counts = new Set<number>();
    const sectionIdentities = new Map<string, string>();
    for (let seedIndex = 0; seedIndex < 12; seedIndex++) {
      const seed = `seed-${seedIndex}`;
      const result = compile(role, seed);
      const alternative = definition.alternatives.find(candidate => candidate.id === result.descriptor.compositionAlternativeId)!;
      expect(alternative).toBeDefined();
      seen.add(alternative.id);
      counts.add(result.sections.length);
      expect(result.sections.map(section => section.sourceSectionId)).toEqual(alternative.sectionIds);
      expect(result.sections.some(section => section.type === role)).toBe(true);
      expect(result.sections.find(section => section.type === 'hero')?.variantId).toBe(alternative.heroVariantId);
      expect(result.files).toEqual(compile(role, seed).files);
      expect(compile(role, seed, 'different-page-id').descriptor.compositionAlternativeId).toBe(alternative.id);
      expect(result.files[`/src/pages/${role}.tsx`]).toContain(`data-ut-composition-id={${JSON.stringify(alternative.id)}}`);
      for (const section of result.sections) {
        const existing = sectionIdentities.get(section.sourceSectionId!);
        if (existing) expect(section.id).toBe(existing);
        sectionIdentities.set(section.sourceSectionId!, section.id);
      }
    }
    expect([...seen].sort()).toEqual(definition.alternatives.map(alternative => alternative.id).sort());
    expect(counts.size).toBe(2);
  });

  it('keeps page-only inventory out of Home', () => {
    expect(template.sections).toHaveLength(10);
    expect(template.sections.some(section => section.type === 'pricing' || section.type === 'faq')).toBe(false);
  });

  it('rejects missing section references instead of silently filtering them', () => {
    const definition = template.pageCompositions!.pricing!;
    expect(() => compile('pricing', 'test', 'pricing-page', {
      ...template,
      pageCompositions: { pricing: { ...definition, alternatives: [{ id: 'broken', sectionIds: ['missing-section'] }] } },
    })).toThrow('Unknown section');
  });

  it('rejects a Pricing alternative without pricing semantics', () => {
    expect(() => compile('pricing', 'test', 'pricing-page', {
      ...template,
      pageCompositions: { pricing: { sections: [], alternatives: [{ id: 'broken', sectionIds: ['salon-premium-hero'] }] } },
    })).toThrow('Missing pricing section');
  });

  it('rejects alternatives incompatible with the selected theme', () => {
    const definition = template.pageCompositions!.pricing!;
    expect(() => compile('pricing', 'test', 'pricing-page', {
      ...template,
      pageCompositions: { pricing: { ...definition, alternatives: definition.alternatives.map(alternative => ({ ...alternative, themePresetIds: ['modern'] })) } },
    })).toThrow('No eligible pricing composition');
  });

  it('rejects unregistered hero choices', () => {
    const definition = template.pageCompositions!.pricing!;
    expect(() => compile('pricing', 'test', 'pricing-page', {
      ...template,
      pageCompositions: { pricing: { ...definition, alternatives: definition.alternatives.map(alternative => ({ ...alternative, heroVariantId: 'hero:missing' })) } },
    })).toThrow('Unknown hero variant');
  });

  it('rejects duplicate source identities', () => {
    const definition = template.pageCompositions!.pricing!;
    expect(() => compile('pricing', 'test', 'pricing-page', {
      ...template,
      pageCompositions: { pricing: { ...definition, sections: [...definition.sections, template.sections[0]] } },
    })).toThrow('Duplicate composition identity');
  });

  it('rejects duplicate alternative identities', () => {
    const definition = template.pageCompositions!.pricing!;
    expect(() => compile('pricing', 'test', 'pricing-page', {
      ...template,
      pageCompositions: { pricing: { ...definition, alternatives: [definition.alternatives[0], definition.alternatives[0]] } },
    })).toThrow('Duplicate composition identity');
  });
});