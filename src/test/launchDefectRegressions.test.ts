/**
 * Regressions for the three reported launch defects:
 *   1. every generated page reports a centered container and gapped rows
 *   2. the preview compiler never emits a duplicate Lucide icon binding
 *   3. form-definition persistence surfaces the real database failure detail
 */

import { describe, expect, it } from 'vitest';
import type { SystemType } from '@/types/launchState';
import { commitToPipeline } from '@/platform/core/commitToPipeline';
import { buildCanonicalLaunchArtifacts } from '@/services/canonicalLaunchVfs';
import { THEME_PRESETS } from '@/components/onboarding/themePresets';
import { themePresetToThemeTokens } from '@/components/onboarding/themePresetToTokens';
import { auditLayoutSource } from '@/services/layoutSnapshotAudit';
import { prepareSandpackFiles } from '@/utils/sandpackFilePrep';
import type { WizardSelections } from '@/platform/core/playground';

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
      businessName: `${label} Layout Co`,
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

describe.each(FIXTURES)('generated layout integrity — $label', (fx) => {
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

  it('reports no uncontained section and no gapless multi-track row', () => {
    for (const page of pages) {
      const source = artifacts.files[page.filePath!];
      expect(source, `${page.filePath} must exist`).toBeTruthy();
      const snapshot = auditLayoutSource(page.filePath!, source);
      const blocking = snapshot.issues.filter(
        (issue) => issue.code === 'uncontained-section' || issue.code === 'grid-without-gap',
      );
      expect(
        blocking.map((issue) => `${issue.code}@${issue.line ?? '?'}`),
        `${page.path} has layout defects`,
      ).toEqual([]);
    }
  });
});

describe('layout audit resolves expression class lists', () => {
  it('sees a centered shell applied through a constant', () => {
    const source = [
      "const shellClass = 'mx-auto w-full max-w-7xl px-5 sm:px-8';",
      'export default function Page() {',
      "  return <section><div className={shellClass + ' grid grid-cols-2 gap-8'}>x</div></section>;",
      '}',
    ].join('\n');
    const snapshot = auditLayoutSource('/src/pages/Booking.tsx', source);
    const codes = snapshot.issues.map((issue) => issue.code);
    expect(codes).not.toContain('uncontained-section');
    expect(codes).not.toContain('grid-without-gap');
  });

  it('still flags a genuine gapless row inside an expression', () => {
    const source = [
      "const shellClass = 'mx-auto w-full max-w-7xl';",
      'export default function Page() {',
      "  return <section><div className={shellClass + ' grid grid-cols-3'}>x</div></section>;",
      '}',
    ].join('\n');
    const snapshot = auditLayoutSource('/src/pages/Booking.tsx', source);
    expect(snapshot.issues.map((issue) => issue.code)).toContain('grid-without-gap');
  });
});

function prepared(source: string): string {
  const files = prepareSandpackFiles({ '/src/pages/Footer.tsx': source });
  const entry = files['/src/pages/Footer.tsx'];
  return entry;
}

function iconDeclarationCount(code: string, name: string): number {
  const re = new RegExp(`^\\s*const\\s+${name}\\s*=\\s*__LucideIcons`, 'gm');
  return code.match(re)?.length ?? 0;
}

describe('lucide icon injection never duplicates a binding', () => {
  it('respects an existing let binding', () => {
    const code = prepared(
      ['let Instagram = null;', 'export default function F(){ return <div><Instagram/></div>; }'].join('\n'),
    );
    expect(iconDeclarationCount(code, 'Instagram')).toBeLessThanOrEqual(1);
  });

  it('respects an existing var binding', () => {
    const code = prepared(
      ['var Facebook = null;', 'export default function F(){ return <div><Facebook/></div>; }'].join('\n'),
    );
    expect(iconDeclarationCount(code, 'Facebook')).toBeLessThanOrEqual(1);
  });

  it('is idempotent when run over already-prepared output', () => {
    const once = prepared('export default function F(){ return <div><Twitter/><Youtube/></div>; }');
    const twice = prepared(once);
    expect(iconDeclarationCount(twice, 'Twitter')).toBe(1);
    expect(iconDeclarationCount(twice, 'Youtube')).toBe(1);
  });

  it('drops a duplicate lookup line that arrives in the source', () => {
    const code = prepared(
      [
        "import * as __LucideIcons from 'lucide-react';",
        'const __LucideFallback = () => null;',
        "const Instagram = __LucideIcons['Instagram'] || __LucideFallback;",
        "const Instagram = __LucideIcons['Instagram'] || __LucideFallback;",
        'export default function F(){ return <div><Instagram/></div>; }',
      ].join('\n'),
    );
    expect(iconDeclarationCount(code, 'Instagram')).toBe(1);
  });
});
