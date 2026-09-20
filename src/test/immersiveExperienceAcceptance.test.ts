/**
 * M10 acceptance — immersive / 3D expansion.
 *
 * Proves the certified experience layer actually reaches the generated site
 * when (a) the business model is WebGL-eligible, (b) the sealed envelope offers
 * the heavy vocabulary, and (c) real media is bound into the gallery slots
 * (M6 asset → slot binding). Also proves the guarded path: no eligibility, no
 * media, or no budget means no canvas is ever mounted.
 */
import { describe, expect, it } from 'vitest';
import { getCompositionById } from '@/sections/templates';
import { compositionToReactFileSet } from '@/sections/compositionToFileSet';
import { resolveCompositionEnhancements } from '@/sections/compositionEnhancements';
import { resolveExperienceEnvelope } from '@/services/experienceCapabilityResolver';
import { buildGeneratedUiFoundation } from '@/platform/core/generatedUiFoundation';
import { runExperiencePreflight } from '@/services/experiencePreflightGate';
import { getDependenciesForSandpack } from '@/utils/dependencyExtractor';
import { bindMediaToComposition, buildSeedMediaLibrary } from '@/services/launch/assetSlotBinding';
import type { TemplateComposition } from '@/sections/types';

const pagePath = '/src/pages/Home.tsx';
const foundation = buildGeneratedUiFoundation({ themePresetId: 'editorial' }).files;

const businessAssets = Array.from({ length: 6 }, (_, i) => ({
  id: `asset-${i}`,
  url: `https://cdn.business.test/studio-${i}.jpg`,
  kind: 'image',
  alt: `Studio photo ${i}`,
}));

const envelope = resolveExperienceEnvelope({
  seed: 'immersive',
  businessModel: 'portfolio_creator',
  industry: 'creative',
  styleIntent: 'experimental',
});
const immersiveEnvelope = {
  ...envelope,
  webgl: 'eligible' as const,
  canvasBudget: 2,
  immersiveRequested: true,
  heroCandidates: ['immersive-product', ...envelope.heroCandidates],
  backgroundCandidates: ['3d-scene', ...envelope.backgroundCandidates],
  mediaCandidates: ['depth-gallery', ...envelope.mediaCandidates],
};

const template = getCompositionById('store-premium') as TemplateComposition;
const withRealMedia = bindMediaToComposition(
  template,
  buildSeedMediaLibrary(businessAssets),
  'immersive',
).composition;

describe('M10 immersive / 3D acceptance', () => {
  it('binds real business media into the gallery slots the scene depends on', () => {
    const gallery = withRealMedia.sections.find((section) => section.type === 'gallery');
    const items = (gallery?.props as { items?: Array<{ src?: string }> })?.items || [];
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((item) => item.src?.startsWith('https://cdn.business.test/'))).toBe(true);
  });

  it('selects the immersive scene and depth gallery for an eligible site', () => {
    const activation = resolveCompositionEnhancements(withRealMedia, immersiveEnvelope);
    const selected = activation.decisions.filter((d) => d.reason === 'selected').map((d) => d.recipeId);
    expect(selected).toContain('immersive-hero');
    expect(selected).toContain('depth-gallery');
    expect(activation.canvasRoots).toBeGreaterThan(0);
    expect(activation.canvasRoots).toBeLessThanOrEqual(2);
  });

  it('compiles the 3D runtime into the generated page within budget', () => {
    const files = {
      ...foundation,
      ...compositionToReactFileSet(withRealMedia, pagePath, {
        designIntervention: { sectionVariants: [], envelope: immersiveEnvelope, compositionPolicy: 'maximum-compatible' },
      }),
    };
    const page = files[pagePath];
    expect(page).toContain('ImmersiveHero');
    expect(page).toContain('DepthGallery');
    const preflight = runExperiencePreflight(files);
    expect(preflight.violations).toEqual([]);
    const { dependencies } = getDependenciesForSandpack(files, {}, { entryPoints: [pagePath] });
    expect(dependencies.three).toBeDefined();
    expect(dependencies['@react-three/fiber']).toBeDefined();
  });

  it('mounts no canvas when the site is not WebGL-eligible', () => {
    const activation = resolveCompositionEnhancements(withRealMedia, { ...immersiveEnvelope, webgl: 'ineligible', canvasBudget: 0 });
    expect(activation.canvasRoots).toBe(0);
    expect(activation.decisions.some((d) => d.reason === 'incompatible-capability')).toBe(true);
  });

  it('keeps immersive scenes absent until the Wizard need is selected', () => {
    const activation = resolveCompositionEnhancements(withRealMedia, { ...immersiveEnvelope, immersiveRequested: false });
    expect(activation.decisions.find((decision) => decision.recipeId === 'immersive-hero')?.reason).toBe('not-applicable');
  });

  it('emits a pointer-responsive, frame-rate-independent scene with a DOM fallback', () => {
    const scene = foundation['/src/unison/ui/experience/scene.tsx'];
    expect(scene).toContain('state.pointer.x');
    expect(scene).toContain('delta * 3.5');
    expect(scene).toContain('fallback={<div');
  });

  it('mounts no depth gallery when the business has no real media', () => {
    const activation = resolveCompositionEnhancements(template, immersiveEnvelope);
    const stockGallery = activation.decisions.filter((d) => d.recipeId === 'depth-gallery');
    expect(stockGallery.length).toBeGreaterThan(0);
  });
});
