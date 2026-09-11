/**
 * Step 2 — Deterministic (AI-off) launch certification.
 *
 * No AI participates in any of this. For every first-class industry the
 * wizard selections are compiled by the canonical compiler alone, sealed,
 * and flattened for Preview. The suite certifies that what a user sees on
 * every route is complete design, not scaffolding:
 *
 *   • every registered page has a real body with a meaningful section count
 *   • no page is a clone of Home and no page repeats a hero
 *   • no section type is duplicated inside one page
 *   • every selected variant id is materialized in the emitted recipes
 *   • themed CSS + the style bridge survive compilation into the VFS
 *   • nothing dangles: no unresolved local imports, no placeholder copy
 *   • Sandpack flattening preserves the sealed sections for every route
 */

import { describe, expect, it } from 'vitest';
import type { SystemType } from '@/types/launchState';
import type { LayoutCategory } from '@/data/templates/types';
import { commitToPipeline } from '@/platform/core/commitToPipeline';
import { buildCanonicalLaunchArtifacts } from '@/services/canonicalLaunchVfs';
import { buildPreviewArtifacts } from '@/utils/previewArtifacts';
import { createLaunchState } from '@/types/launchState';
import { findUnresolvedLocalImports } from '@/services/laneBCompanionModules';
import { UNISON_VFS_STYLE_BRIDGE } from '@/utils/unisonVfsStyleBridge';
import { THEME_PRESETS } from '@/components/onboarding/themePresets';
import { themePresetToThemeTokens } from '@/components/onboarding/themePresetToTokens';
import stylexRecipes from '@/sections/recipes/stylexRecipes.generated.json';
import type { WizardSelections } from '@/platform/core/playground';
import type { SectionEntry } from '@/sections/types';

function readPageSections(source: string): SectionEntry[] {
  const match = source.match(/const SECTIONS = ([\s\S]*?);\nconst HYDRATABLE/);
  if (!match) throw new Error('Compiled page did not serialize sections');
  return JSON.parse(match[1]) as SectionEntry[];
}

const PLACEHOLDER_MARKERS = [
  'Lorem ipsum',
  'TODO:',
  'PLACEHOLDER',
  'Placeholder text',
  'Coming soon…',
];

interface Fixture {
  label: string;
  industry: string;
  systemType: SystemType;
  themePresetId: string;
  selections: WizardSelections;
}

function fixture(
  label: string,
  industry: string,
  systemType: SystemType,
  themePresetId: string,
  extra: Partial<WizardSelections>,
): Fixture {
  const preset = THEME_PRESETS.find((candidate) => candidate.id === themePresetId);
  if (!preset) throw new Error(`Unknown theme preset ${themePresetId}`);
  return {
    label,
    industry,
    systemType,
    themePresetId,
    selections: {
      businessName: `${label} Certification Co`,
      industryOverlay: industry,
      systemType,
      scaffoldMode: 'selected-pages',
      themePresetId,
      themeTokens: themePresetToThemeTokens(preset),
      ...extra,
    } as WizardSelections,
  };
}

const FIXTURES: Fixture[] = [
  fixture('salon', 'salon', 'booking', 'editorial', {
    businessModel: 'appointment_service',
    primaryGoal: 'book',
    needsBooking: true,
    requestedPages: ['home', 'about', 'services', 'gallery', 'booking', 'contact'],
    primaryIntent: 'booking.create',
  }),
  fixture('portfolio', 'portfolio', 'portfolio', 'minimalist', {
    businessModel: 'portfolio_creator',
    primaryGoal: 'contact',
    requestedPages: ['home', 'about', 'gallery', 'contact'],
    primaryIntent: 'contact.submit',
  }),
  fixture('restaurant', 'restaurant', 'booking', 'organic', {
    businessModel: 'appointment_service',
    primaryGoal: 'book',
    needsBooking: true,
    requestedPages: ['home', 'about', 'services', 'gallery', 'contact'],
    primaryIntent: 'booking.create',
  }),
  fixture('contractor', 'contractor', 'agency', 'bold', {
    businessModel: 'quote_lead',
    primaryGoal: 'contact',
    wantsLeadCapture: true,
    requestedPages: ['home', 'about', 'services', 'gallery', 'contact'],
    primaryIntent: 'lead.submit',
  }),
  fixture('coaching', 'coaching', 'booking', 'modern', {
    businessModel: 'appointment_service',
    primaryGoal: 'book',
    needsBooking: true,
    requestedPages: ['home', 'about', 'services', 'pricing', 'booking', 'contact'],
    primaryIntent: 'booking.create',
  }),
  fixture('ecommerce', 'ecommerce', 'store', 'futuristic', {
    businessModel: 'ecommerce',
    primaryGoal: 'sell',
    requestedPages: ['home', 'about', 'shop', 'contact'],
    primaryIntent: 'cart.add',
  }),
  fixture('nonprofit', 'nonprofit', 'content', 'organic', {
    businessModel: 'quote_lead',
    primaryGoal: 'contact',
    wantsLeadCapture: true,
    requestedPages: ['home', 'about', 'services', 'contact'],
    primaryIntent: 'donation.start',
  }),
  fixture('agency', 'agency', 'agency', 'editorial', {
    businessModel: 'quote_lead',
    primaryGoal: 'contact',
    wantsLeadCapture: true,
    requestedPages: ['home', 'about', 'services', 'contact', 'faq'],
    primaryIntent: 'lead.submit',
  }),
  fixture('saas', 'saas', 'saas', 'futuristic', {
    businessModel: 'saas_digital',
    primaryGoal: 'signup',
    wantsLeadCapture: true,
    requestedPages: ['home', 'about', 'pricing', 'faq', 'contact'],
    primaryIntent: 'lead.submit',
  }),
];

describe.each(FIXTURES)('deterministic launch certification — $label', (fx) => {
  const laneA = commitToPipeline({ selections: fx.selections }, 'wizard-launch');
  const artifacts = buildCanonicalLaunchArtifacts({
    generatedFiles: laneA.siteBundleSnapshot.vfsFiles,
    preferredEntryPoint: '/src/App.tsx',
    siteBundleSnapshot: laneA.siteBundleSnapshot,
    compileArtifact: laneA.compileArtifact,
    compiledPlayground: laneA.compileResult,
    canonicalPlayground: laneA.playground,
    mergeWithCanonicalSnapshot: true,
    systemType: fx.systemType,
    systemName: fx.systemType,
    businessName: fx.selections.businessName,
    industry: fx.industry,
    themePresetId: fx.themePresetId,
    wizardSelections: fx.selections,
    backendRequired: false,
  });
  const pages = Object.values(laneA.siteBundleSnapshot.pageRegistry.pages)
    .filter((page) => Boolean(page.filePath));

  it('gives every registered route a substantial, sealed body', () => {
    expect(pages.length).toBeGreaterThan(2);
    for (const page of pages) {
      const source = artifacts.files[page.filePath!];
      expect(source, `${page.filePath} must exist in the VFS`).toBeTruthy();
      const sections = readPageSections(source);
      expect(sections.length, `${page.path} is too thin: ${sections.length} sections`)
        .toBeGreaterThanOrEqual(3);
      const types = sections.map((section) => section.type);
      expect(new Set(types).size, `${page.path} repeats a section type: ${types.join(', ')}`)
        .toBe(types.length);
      for (const marker of PLACEHOLDER_MARKERS) {
        expect(source, `${page.path} leaks placeholder copy: ${marker}`).not.toContain(marker);
      }
    }
  });

  it('never clones Home and never repeats a hero across routes', () => {
    const bodies = new Set<string>();
    const heroes = new Set<string>();
    for (const page of pages) {
      const source = artifacts.files[page.filePath!];
      bodies.add(source);
      const hero = readPageSections(source).find((section) => section.type === 'hero');
      if (!hero) continue;
      const identity = `${hero.variantId ?? ''}|${JSON.stringify(hero.props ?? {})}`;
      expect(heroes.has(identity), `${page.path} reuses another page's hero`).toBe(false);
      heroes.add(identity);
    }
    expect(bodies.size, 'two routes compiled to identical bodies').toBe(pages.length);
  });

  it('materializes every selected variant and keeps the styling contract in the VFS', () => {
    for (const page of pages) {
      for (const section of readPageSections(artifacts.files[page.filePath!])) {
        if (!section.variantId) continue;
        const family = (stylexRecipes.families as Record<string, string>)[section.type];
        if (!family) continue;
        expect(family, `${page.path}: ${section.variantId} has no registered implementation`)
          .toContain(JSON.stringify(section.variantId));
        // Some families ship one variant-aware module (FAQ), others ship a
        // recipe per variant — accept either, as long as the id reaches the VFS.
        const emitted = Object.entries(artifacts.files)
          .filter(([path]) => path.startsWith('/src/components/'))
          .map(([, source]) => source);

        expect(
          emitted.some((source) => source.includes(JSON.stringify(section.variantId))),
          `${page.path}: ${section.variantId} was never emitted into the VFS`,
        ).toBe(true);
      }
    }
    expect(artifacts.files['/src/index.css']).toBeTruthy();
    expect(artifacts.files['/src/index.css']).toContain('--font-heading');
    expect(artifacts.files['/src/unison/ui/tailwind.css']).toContain(UNISON_VFS_STYLE_BRIDGE);
    expect(findUnresolvedLocalImports(artifacts.files)).toEqual([]);
  });

  it('survives Sandpack flattening with its sections intact', () => {
    const launchState = createLaunchState({
      systemType: fx.systemType,
      systemName: fx.systemType,
      businessName: fx.selections.businessName!,
      templateName: fx.label,
      templateCategory: fx.industry as LayoutCategory,
      vfsFiles: artifacts.files,
      preloadedIntents: [],
      entryPoint: artifacts.entryPoint,
      industry: fx.industry,
      themePresetId: fx.themePresetId,
      siteBundleSnapshot: artifacts.siteBundleSnapshot,
      materializedPlayground: laneA.playground,
      compiledPlayground: laneA.compileResult,
      wizardSelections: fx.selections,
    });
    const previewFiles = buildPreviewArtifacts({
      sourceFiles: artifacts.files,
      launchState,
    }).sandpackFiles;
    const router = previewFiles['/App.tsx'];
    expect(router).toBeTruthy();
    for (const page of pages) {
      const flattened = page.filePath!.replace(/^\/src/, '');
      expect(previewFiles[flattened], `${page.path} lost its module in Preview`).toContain('const SECTIONS');
      expect(readPageSections(previewFiles[flattened]))
        .toEqual(readPageSections(artifacts.files[page.filePath!]));
    }
  }, 20_000);
});
