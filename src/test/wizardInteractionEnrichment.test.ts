import { describe, expect, it } from 'vitest';
import {
  applyCanonicalInteractionEnrichment,
  buildWizardInteractionPlannerPrompt,
  compileWizardInteractionManifest,
  createBaselineInteractionManifest,
  parseWizardInteractionManifest,
  readWizardInteractionManifest,
  WIZARD_INTERACTION_MANIFEST_PATH,
} from '@/services/wizardInteractionEnrichment';
import type { TemplateLayoutContract } from '@/services/templateLayoutContract';

const contract: TemplateLayoutContract = {
  version: '1.0',
  templateId: 'editorial-studio',
  industry: 'creative-services',
  signature: 'layout-signature-1',
  sections: [],
};

describe('wizardInteractionEnrichment', () => {
  it('persists and reads a declarative manifest without changing page source', () => {
    const baseline = createBaselineInteractionManifest({}, contract);
    const manifest = {
      ...baseline,
      source: 'ai' as const,
      interactions: [{
        target: { kind: 'intent' as const, value: 'contact.submit' },
        effect: 'click-feedback' as const,
      }],
    };
    const files = {
      '/src/pages/Home.tsx': 'export default function Home() { return <main />; }',
    };

    const compiled = compileWizardInteractionManifest(files, manifest);

    expect(compiled.files['/src/pages/Home.tsx']).toBe(files['/src/pages/Home.tsx']);
    expect(readWizardInteractionManifest(compiled.files)).toEqual(manifest);
    expect(compiled.mountedPages).toEqual(['/src/pages/Home.tsx']);
  });

  it('rejects malformed rules and falls back instead of partially accepting them', () => {
    const fallback = createBaselineInteractionManifest({}, contract);
    const parsed = parseWizardInteractionManifest({
      ...fallback,
      interactions: [{ target: { kind: 'interactive' }, effect: 'unknown' }],
    }, fallback);

    expect(parsed).toBe(fallback);
  });

  it('does not apply an invalid persisted manifest', () => {
    const files = {
      [WIZARD_INTERACTION_MANIFEST_PATH]: '{not-json',
      '/src/pages/Home.tsx': 'home',
    };

    expect(applyCanonicalInteractionEnrichment(files)).toEqual({
      files,
      manifest: null,
      mountedPages: [],
    });
  });

  it('gives the planner the fixed identity and declarative boundaries', () => {
    const prompt = buildWizardInteractionPlannerPrompt({
      contract,
      industry: contract.industry,
      intents: ['contact.submit'],
    });

    expect(prompt).toContain('templateId must be "editorial-studio"');
    expect(prompt).toContain('layoutSignature must be "layout-signature-1"');
    expect(prompt).toContain('Do not add routes, files, imports, dependencies, CSS, geometry, or page sections.');
  });
});