import { buildDesignVocabularyReport } from '@/services/designImplementationRegistry';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { resolveThemeTokens } from '@/sections/themes';
import { buildGeneratedUiFoundation } from '@/platform/core/generatedUiFoundation';
import { buildWizardLaneBRegistryContext } from '@/services/wizardLaneBEnrichment';
import type { SiteBundleSnapshot } from '@/platform/core/canonicalPipeline';
import { THEME_PRESETS } from '@/components/onboarding/themePresets';
import { describe, it, expect } from 'vitest';
import { getAllIndustries } from '@/platform/core/industryMatrix';
import { getCompositionById } from '@/sections/templates';
import { getCompositionCardsForIndustry, SYSTEM_TO_BUSINESS_MODEL } from '@/components/onboarding/wizard/wizardCatalog';
import { buildWizardDesignIntervention, readWizardDesignIntervention } from '@/services/wizardDesignIntervention';
import { ART_DIRECTION_PACKS } from '@/sections/variants/artDirectionPacks';
import { getGenerationVariantsForSection, familyForSection, getVariantById, getVariantsForSection } from '@/sections/variants';
import { compositionToReactFileSet } from '@/sections/compositionToFileSet';
import { buildWizardAggregatedRegistryContext } from '@/services/launch/wizardRegistryAggregation';
import { generateTopologyPlaceholderFiles } from '@/utils/topologyVFSScaffolder';
import type { GeneratedSitePlan, PageRouteNode } from '@/platform/core/siteTopologyPlanner';
import type { SectionEntry } from '@/sections/types';

const parseSections = (source: string): SectionEntry[] => JSON.parse(source.match(/const SECTIONS = ([\s\S]*?);\nconst HYDRATABLE/)![1]);

describe('21st-derived Launcher variants across every industry', () => {
  it.each(getAllIndustries())('$industry selects certified sourced variants for every eligible template and style', profile => {
    const cards = getCompositionCardsForIndustry(profile.industry);
    expect(cards.length).toBeGreaterThan(0);
    for (const card of cards) {
      const template = getCompositionById(card.id)!;
      for (const style of THEME_PRESETS) {
        const input = { businessName: 'Industry proof', businessModel: SYSTEM_TO_BUSINESS_MODEL[profile.systemType], industryOverlay: profile.industry, templateId: card.id, themePresetId: style.id, wizardSeedId: '21st-proof' };
        const design = buildWizardDesignIntervention(input);
        const resolvedPack = ART_DIRECTION_PACKS[design.artDirectionPackId];
        expect(buildWizardDesignIntervention(input)).toEqual(design);
        expect(readWizardDesignIntervention({ '/.unison/design-intervention.json': JSON.stringify(design) })).toEqual(design);
        let sourcedCount = 0;
        for (const section of template.sections) {
          expect(design.activeVariants[section.id], card.id + ':' + section.type + ':' + resolvedPack.id).toBeDefined();
          const selected = getVariantById(design.activeVariants[section.id])!;
          expect(selected, section.id).toBeDefined();
          expect(selected.sectionType).toBe(section.type);
          expect(selected.generationStatus).not.toBe('legacy');
          if (selected.pageRoles?.length) expect(selected.pageRoles).toContain('home');
          const allowed = getGenerationVariantsForSection(section.type, resolvedPack, 'home').map(variant => variant.id);
          expect(selected.source?.origin).toBe('21st');
          expect(selected.vfs?.certification).toBe('approved');
          if (allowed.length) expect(allowed).toContain(selected.id);
          const sourced = getVariantsForSection(section.type).filter(variant =>
            allowed.includes(variant.id) && variant.source?.origin === '21st' &&
            variant.vfs?.certification === 'approved' && variant.generationStatus === 'preferred' &&
            (!variant.pageRoles?.length || variant.pageRoles.includes('home')));
          if (sourced.length) {
            expect(sourced.map(variant => variant.id)).toContain(selected.id);
            sourcedCount++;
          }
        }
        expect(sourcedCount).toBeGreaterThan(0);
      }
      const design = buildWizardDesignIntervention({ businessName: 'Industry proof', businessModel: SYSTEM_TO_BUSINESS_MODEL[profile.systemType], industryOverlay: profile.industry, templateId: card.id, themePresetId: 'editorial', wizardSeedId: 'compile-proof' });
      const files = compositionToReactFileSet(template, '/src/pages/Home.tsx', { designIntervention: design });
      const emitted = parseSections(files['/src/pages/Home.tsx']);
      expect(emitted.map(section => section.id)).toEqual(template.sections.map(section => section.id));
      for (const section of emitted) {
        expect(section.variantId).toBe(design.activeVariants[section.id]);
        const original = template.sections.find(entry => entry.id === section.id)!;
        const { layout: _originalLayout, ...originalProps } = original.props as Record<string, unknown>;
        const { layout: _emittedLayout, ...emittedProps } = section.props as Record<string, unknown>;
        expect(emittedProps).toEqual(originalProps);
        const Component = getVariantById(section.variantId!)!.component;
        expect(() => renderToStaticMarkup(createElement(Component, { section, theme: resolveThemeTokens(template.theme) }))).not.toThrow();
      }
      const context = buildWizardAggregatedRegistryContext({ industry: profile.industry, templateId: card.id, themePresetId: 'editorial', seed: design.seed });
      expect(context.version).toBe('2.0');
      const snapshot = { vfsFiles: { ...files, ...buildGeneratedUiFoundation({ themePresetId: 'editorial' }).files }, meta: {} } as Pick<SiteBundleSnapshot, 'vfsFiles' | 'meta'>;
      const laneB = buildWizardLaneBRegistryContext(snapshot, context);
      expect(laneB.implementationContext.length).toBeGreaterThan(0);
      const sectionTypes = new Set(emitted.map(section => section.type));
      expect(laneB.implementationContext.every(implementation => sectionTypes.has(implementation.sectionType))).toBe(true);
      expect(laneB.designVocabularyReport.selectedIds).toEqual(buildDesignVocabularyReport({ eligibleImplementationIds: [], selectedImplementationIds: emitted.flatMap(section => section.variantId ? [section.variantId] : []) }).selectedIds);
      expect(buildWizardLaneBRegistryContext(snapshot, { sections: context.sections }).implementationContext).toEqual([]);
      expect(context.sections.every(section => section.isFirstClass)).toBe(true);
      for (const implementation of context.implementations!) {
        expect(context.sections.find(section => section.type === implementation.sectionType)!.allowedVariantIds).toContain(implementation.id);
        expect(implementation.source).toEqual(getVariantById(implementation.id as SectionEntry['variantId'] & string)?.source);
      }
    }
  });

  it('keeps checkout and contact route designs when Home overrides are populated', () => {
    const template = getCompositionById('salon-premium')!;
    const design = buildWizardDesignIntervention({ businessName: 'Studio', businessModel: 'appointment_service', industryOverlay: 'salon', templateId: template.id, themePresetId: 'editorial', wizardSeedId: 'route-proof' });
    for (const role of ['checkout', 'contact'] as const) {
      const page: PageRouteNode = { id: role, name: role, title: role, route: '/' + role, role, filePath: '/src/pages/' + role + '.tsx', visibleInNav: true, isHome: false, generatedBy: 'wizard' };
      const plan: GeneratedSitePlan = { siteId: 'proof', industry: 'salon', businessName: 'Studio', homePageId: 'home', pages: [page], navItems: [role], funnels: [], redirects: [], generatedAt: '2026-09-17', selectedTemplateId: template.id, selectedThemePresetId: 'editorial' };
      const files = generateTopologyPlaceholderFiles(page, plan, template, { designIntervention: design });
      const contact = parseSections(files[page.filePath]).find(section => section.type === 'contact')!;
      if (role === 'checkout') expect(contact.variantId).toBe('contact:checkout-panel');
      else expect(['contact:editorial-form', 'contact:map-studio']).toContain(contact.variantId);
    }
  });
});
