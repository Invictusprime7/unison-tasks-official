import { describe, expect, it } from 'vitest';
import { getCompositionById } from '@/sections/templates';
import { getVariantById } from '@/sections/variants';
import { generateTopologyPlaceholderFiles } from '@/utils/topologyVFSScaffolder';
import { collectResolvedCompositions } from '@/platform/core/resolvedComposition';
import type { GeneratedSitePlan, PageRouteNode, PageRole } from '@/platform/core/siteTopologyPlanner';
import type { SectionEntry } from '@/sections/types';

const template = getCompositionById('salon-premium')!;
function compile(role: PageRole, seed: string, id = role) {
  const page: PageRouteNode = { id, name: role, title: role, route: '/' + role, role, filePath: '/src/pages/' + role + '.tsx', visibleInNav: true, isHome: role === 'home', generatedBy: 'wizard' };
  const plan: GeneratedSitePlan = { siteId: 'proof', industry: 'salon', businessName: 'Studio', homePageId: 'home', pages: [page], navItems: [id], funnels: [], redirects: [], generatedAt: '2026-09-17', selectedTemplateId: template.id, selectedThemePresetId: 'editorial' };
  const files = generateTopologyPlaceholderFiles(page, plan, template, { designIntervention: { seed, motionRecipes: [], sectionVariants: [], activeVariants: {} } });
  const match = files[page.filePath].match(/const SECTIONS = ([\s\S]*?);\nconst HYDRATABLE/)!;
  return { files, sections: JSON.parse(match[1]) as SectionEntry[], descriptor: collectResolvedCompositions(files)[page.filePath] };
}
describe('seeded route design projection', () => {
  it.each(['services','about','contact','gallery','booking','checkout'] as PageRole[])('%s preserves topology and chooses executable role-eligible designs', role => {
    const seen = new Set<string>();
    for (let index = 0; index < 4; index++) {
      const seed = 'route-' + index;
      const result = compile(role, seed);
      seen.add(result.descriptor.compositionAlternativeId!);
      expect(result.files).toEqual(compile(role, seed).files);
      expect(result.sections[0].type).toBe('navbar');
      expect(result.sections[result.sections.length - 1]?.type).toBe('footer');
      for (const section of result.sections) {
        const variant = section.variantId && getVariantById(section.variantId);
        if (variant && variant.tags?.includes('route-design')) {
          expect(variant.pageRoles).toContain(role);
          expect(variant.vfs?.certification).toBe('approved');
          expect(result.files['/src/pages/' + role + '.tsx']).toContain(variant.id);
        }
      }
      if (role === 'checkout') expect(result.sections.find(section => section.type === 'contact')?.variantId).toBe('contact:checkout-panel');
    }
    expect(seen.size).toBe(2);
  });
  it('preserves explicit authored pricing and FAQ alternatives', () => {
    for (const role of ['pricing','faq'] as const) {
      const result = compile(role, 'route-1');
      expect(template.pageCompositions![role]!.alternatives.map(a => a.id)).toContain(result.descriptor.compositionAlternativeId);
    }
  });
  it('does not change Home when assigning interior route designs', () => {
    const result = compile('home', 'route-1');
    expect(result.sections.map(s => s.type)).toEqual(template.sections.map(s => s.type));
    expect(result.sections.some(s => s.variantId === 'contact:checkout-panel')).toBe(false);
  });
});
