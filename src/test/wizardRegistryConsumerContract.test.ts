import { afterEach, describe, expect, it } from 'vitest';
import {
  buildGeneratedUiFoundation, buildGeneratedUiFoundationDirective,
  GENERATED_MOTION_PRIMITIVES, GENERATED_MOTION_TYPES,
  readGeneratedUiManifest, validateGeneratedUiContract,
} from '@/platform/core/generatedUiFoundation';
import {
  buildDesignVocabularyReport, designCapabilityFingerprint, designRegistrySignature,
  resetDesignImplementationIndex,
} from '@/services/designImplementationRegistry';
import { buildWizardAggregatedRegistryContext } from '@/services/launch/wizardRegistryAggregation';
import { buildWizardLaneBRegistryContext, validateWizardLaneBProposal, type WizardLaneBEnrichmentRequest } from '@/services/wizardLaneBEnrichment';
import { buildWizardDesignIntervention } from '@/services/wizardDesignIntervention';
import { VARIANT_REGISTRY } from '@/sections/variants';
import type { SiteBundleSnapshot } from '@/platform/core/canonicalPipeline';

const foundation = buildGeneratedUiFoundation({ themePresetId: 'editorial' });
const selection = { industry: 'salon', templateId: 'salon-premium', themePresetId: 'editorial' };
afterEach(resetDesignImplementationIndex);

describe('snapshot-aware motion exports', () => {
  it.each(GENERATED_MOTION_PRIMITIVES)('advertises and accepts the emitted %s component', (name) => {
    const manifest = readGeneratedUiManifest(foundation.files)!;
    expect(buildGeneratedUiFoundationDirective(manifest)).toContain(name);
    expect(validateGeneratedUiContract({ '/src/pages/Home.tsx': `import { ${name} as Effect } from '@/unison/ui/motion'; export default function Home(){ return <Effect />; }` }, manifest).valid).toBe(true);
  });

  it.each(GENERATED_MOTION_TYPES)('allows %s only as a type import', (name) => {
    const path = '/src/pages/Home.tsx';
    const typeSource = `import type { ${name} as Props } from '@/unison/ui/motion'; export default function Home(){ return <main />; }`;
    expect(validateGeneratedUiContract({ [path]: typeSource }, foundation.manifest).valid).toBe(true);
    expect(validateGeneratedUiContract({ [path]: typeSource.replace('import type', 'import') }, foundation.manifest).valid).toBe(false);
  });

  it('recovers legacy capabilities from stored source without rewriting files', () => {
    const legacy = { ...foundation.files,
      '/.unison/ui-manifest.json': JSON.stringify({ ...foundation.manifest, version: '1.8', motionExports: undefined, requirements: ['For @/unison/ui/motion, use only Reveal.'] }),
      '/src/unison/ui/motion.tsx': 'export function Reveal(){ return null; }\nexport type MotionRecipe = string;',
    };
    const before = JSON.stringify(legacy);
    const manifest = readGeneratedUiManifest(legacy)!;
    expect(manifest.motionExports).toEqual({ components: ['Reveal'], types: ['MotionRecipe'] });
    const directive = buildGeneratedUiFoundationDirective(manifest);
    expect(directive).not.toContain('MarqueeBand');
    expect(directive).not.toContain('StaggerGroup');
    expect(validateGeneratedUiContract({ '/src/pages/Home.tsx': "import { MarqueeBand } from '@/unison/ui/motion';" }, manifest).valid).toBe(false);
    expect(JSON.stringify(legacy)).toBe(before);
  });

  it('does not trust a manifest claim when its snapshot module is absent', () => {
    const files = { ...foundation.files };
    delete files['/src/unison/ui/motion.tsx'];
    expect(readGeneratedUiManifest(files)?.motionExports).toEqual({ components: [], types: [] });
  });

  it('keeps foundation and theme files protected', () => {
    expect(validateGeneratedUiContract({ '/src/unison/ui/motion.tsx': 'export {}' }, foundation.manifest).valid).toBe(false);
    expect(validateGeneratedUiContract({ '/src/index.css': ':root{}' }, foundation.manifest).valid).toBe(false);
  });
});

describe('canonical registry consumers', () => {
  it('separates global, pack-eligible and selected vocabulary', () => {
    const report = buildDesignVocabularyReport({ eligibleImplementationIds: ['hero:split-image'], selectedImplementationIds: ['hero:split-image', 'hero:not-real'] });
    expect(report.executableIds).toEqual(['hero:split-cinematic']);
    expect(report.selectedIds).toEqual(['hero:split-cinematic']);
    expect(report.globalExecutableIds).toContain('media:masonry');
    expect(report.unimplementedIds).toContain('hero:kinetic-type');
  });

  it('builds the production request projection from the actual snapshot', () => {
    const registry = buildWizardAggregatedRegistryContext(selection);
    const snapshot = { vfsFiles: foundation.files, meta: { designIntervention: { activeVariants: { hero: 'hero:split-image' } } } } as unknown as SiteBundleSnapshot;
    const context = buildWizardLaneBRegistryContext(snapshot, registry);
    expect(context.designVocabularyReport.selectedIds).toEqual(['hero:split-cinematic']);
    expect(context.designVocabularyReport.unimplementedIds).toContain('hero:kinetic-type');
    expect(context.uiFoundationManifest.motionExports?.components).toEqual([...GENERATED_MOTION_PRIMITIVES]);
    expect(context.uiFoundationDirective).toContain('MarqueeBand');
    expect(() => buildWizardLaneBRegistryContext({ ...snapshot, vfsFiles: {} }, registry)).toThrow('without its UI foundation manifest');
  });

  it('updates capability fingerprints while preserving legacy registry signatures', () => {
    const options = { ...selection, eligibleImplementationIds: ['hero:split-image', 'hero:centered'] };
    const before = designCapabilityFingerprint(options);
    expect(designCapabilityFingerprint({ ...options, eligibleImplementationIds: [...options.eligibleImplementationIds].reverse() })).toBe(before);
    expect(designCapabilityFingerprint({ ...options, themePresetId: 'modern' })).not.toBe(before);
    const legacySignature = designRegistrySignature();
    const variant = VARIANT_REGISTRY.hero!.find((entry) => entry.id === 'hero:split-image')!;
    const previous = variant.vocabularyRefs;
    try {
      variant.vocabularyRefs = [{ category: 'background', id: 'animated-grid' }];
      resetDesignImplementationIndex();
      expect(designCapabilityFingerprint(options)).not.toBe(before);
      expect(designRegistrySignature()).toBe(legacySignature);
    } finally {
      if (previous === undefined) delete variant.vocabularyRefs; else variant.vocabularyRefs = previous;
      resetDesignImplementationIndex();
    }
  });

  it('validates Lane B named motion imports against the same manifest contract', () => {
    const request = { wizardSeedId: 'seed', snapshotId: 'snapshot', designRegistrySignature: 'registry', pageRegistry: [{ filePath: '/src/pages/Home.tsx', requiredIntents: [] }] } as unknown as WizardLaneBEnrichmentRequest;
    const proposal = (name: string) => ({ version: '1.0', wizardSeedId: 'seed', snapshotId: 'snapshot', designRegistrySignature: 'registry', fileOps: [{ type: 'replace', path: '/src/pages/Home.tsx', content: `import React from 'react'; import { ${name} } from '@/unison/ui/motion'; export default function Home(){ return <main><h1>Studio</h1><${name} /></main>; }` }] });
    expect(validateWizardLaneBProposal({ request, proposal: proposal('MarqueeBand'), uiFoundationManifest: foundation.manifest }).valid).toBe(true);
    expect(validateWizardLaneBProposal({ request, proposal: proposal('ImaginaryMotion'), uiFoundationManifest: foundation.manifest }).valid).toBe(false);
  });

  it('projects additional vocabulary only for selected implementations', () => {
    const input = { businessName: 'Studio', businessModel: 'appointment_service' as const, industryOverlay: 'salon' as const, templateId: 'salon-premium', themePresetId: 'editorial', wizardSeedId: 'refs-test' };
    const baseline = buildWizardDesignIntervention(input);
    const selected = new Set(Object.values(baseline.activeVariants));
    const variant = Object.values(VARIANT_REGISTRY).flat().find((entry) => selected.has(entry.id))!;
    const previous = variant.vocabularyRefs;
    try {
      variant.vocabularyRefs = [{ category: 'background', id: 'animated-grid' }];
      resetDesignImplementationIndex();
      expect(buildWizardDesignIntervention(input).aiDirective).toContain('animated-grid');
    } finally {
      if (previous === undefined) delete variant.vocabularyRefs; else variant.vocabularyRefs = previous;
      resetDesignImplementationIndex();
    }
  });
});
