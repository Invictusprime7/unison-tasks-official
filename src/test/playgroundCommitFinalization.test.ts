import { describe, expect, it, vi } from 'vitest';

const { revisions, reconcile } = vi.hoisted(() => ({
  revisions: [] as Record<string, unknown>[],
  reconcile: vi.fn(async () => ({ data: { success: true }, error: null })),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (table: string) => {
      if (table === 'ai_events') return { insert: vi.fn() };
      const chain = {
        select: () => chain,
        eq: () => chain,
        order: () => chain,
        limit: () => chain,
        single: async () => ({ data: { site_id: '55555555-5555-4555-8555-555555555555' }, error: null }),
        maybeSingle: async () => ({ data: revisions[revisions.length - 1], error: null }),
      };
      return chain;
    },
    functions: { invoke: reconcile },
    rpc: async (name: string, payload: Record<string, unknown>) => {
      expect(name).toBe('commit_canonical_site_revision');
      const snapshot = payload.p_site_bundle_snapshot as { vfsFiles: Record<string, string> };
      const runtimeFiles = Object.fromEntries(Object.entries(payload.p_vfs_files as Record<string, string>)
        .filter(([path]) => !path.startsWith('/.unison/')));
      expect(snapshot.vfsFiles).toEqual(runtimeFiles);
      const row = Object.fromEntries(Object.entries(payload).map(([key, value]) => [key.replace(/^p_/, ''), value]));
      row.id = `00000000-0000-4000-8000-${String(revisions.length + 1).padStart(12, '0')}`;
      revisions.push(JSON.parse(JSON.stringify(row)));
      return { data: row.id, error: null };
    },
  },
}));
vi.mock('@/services/elementReadinessEvaluator', () => ({
  evaluateElementReadiness: vi.fn(async () => ({ summary: { previewBlocked: 0, publishBlocked: 0 } })),
}));
vi.mock('@/services/playgroundControlPlaneResolver', () => ({
  resolvePlaygroundControlPlane: vi.fn(() => ({
    readinessReport: { summary: { previewBlocked: 0, publishBlocked: 0 } },
    validationSummary: {}, overview: {},
  })),
}));

import { commitToPipeline } from '@/platform/core/commitToPipeline';
import { buildCanonicalLaunchArtifacts } from '@/services/canonicalLaunchVfs';
import { commitMutation, loadLatestRevisionForProject } from '@/services/vfsCommitService';
import { emptyPatchPlan } from '@/types/patchPlan';
import { THEME_PRESETS } from '@/components/onboarding/themePresets';
import { themePresetToThemeTokens } from '@/components/onboarding/themePresetToTokens';
import { findUnresolvedLocalImports } from '@/services/laneBCompanionModules';
import { collectResolvedCompositions } from '@/platform/core/resolvedComposition';
import portableRecipes from '@/sections/recipes/stylexRecipes.generated.json';

describe('Playground canonical finalization', () => {
  it('finalizes, commits and reloads a structured Gallery edit with matching runtime bytes', async () => {
    const identity = {
      userId: '11111111-1111-4111-8111-111111111111',
      businessId: '22222222-2222-4222-8222-222222222222',
      projectId: '33333333-3333-4333-8333-333333333333',
      draftId: '44444444-4444-4444-8444-444444444444',
      revisionId: '', sessionId: 'gallery-roundtrip',
    };
    const preset = THEME_PRESETS.find((theme) => theme.id === 'editorial')!;
    const compiled = commitToPipeline({ selections: {
      businessName: 'Gallery Closure Salon', businessModel: 'appointment_service',
      industryOverlay: 'salon', systemType: 'booking', primaryGoal: 'book', secondaryGoals: ['contact'],
      needsBooking: true, wantsLeadCapture: true, primaryIntent: 'booking.create',
      requestedPages: ['home', 'gallery', 'booking', 'contact'], scaffoldMode: 'selected-pages',
      templateId: 'salon-premium', themePresetId: 'editorial', themeTokens: themePresetToThemeTokens(preset),
    } }, 'wizard-launch');
    const launched = buildCanonicalLaunchArtifacts({
      generatedFiles: compiled.siteBundleSnapshot.vfsFiles,
      siteBundleSnapshot: compiled.siteBundleSnapshot,
      compileArtifact: compiled.compileArtifact,
      canonicalPlayground: compiled.playground,
      themePresetId: 'editorial', templateId: 'salon-premium',
      systemType: 'booking', businessName: 'Gallery Closure Salon', industry: 'salon',
      businessId: identity.businessId, projectId: identity.projectId,
      organizationId: '66666666-6666-4666-8666-666666666666',
      siteId: '55555555-5555-4555-8555-555555555555',
    });
    const approved = compiled.siteBundleSnapshot.meta.uiFoundation?.approvedExperienceCapabilities;
    expect(approved).toContain('experience.three-d');
    expect(launched.siteBundleSnapshot?.meta.uiFoundation?.approvedExperienceCapabilities).toEqual(approved);
    const before = JSON.stringify(launched.siteBundleSnapshot);
    const edited = structuredClone(compiled.playground);
    const gallery = Object.values(edited.pageRegistry.pages).find((page) => page.path === '/gallery')!;
    gallery.title = 'Studio Portfolio';

    const result = await commitMutation({
      source: 'playground-edit', identity,
      current: { vfsFiles: launched.files, playground: edited, siteBundleSnapshot: launched.siteBundleSnapshot },
      patch: emptyPatchPlan(),
    });

    expect(result.status).toBe('committed');
    expect(result.siteBundleSnapshot?.businessName).toBe('Gallery Closure Salon');
    expect(result.siteBundleSnapshot?.industry).toBe('salon');
    expect(result.siteBundleSnapshot?.meta.uiFoundation?.approvedExperienceCapabilities).toEqual(approved);
    expect(findUnresolvedLocalImports(result.vfsFiles)).toEqual([]);
    expect(result.vfsFiles['/src/unison/publishedRuntime.ts']).toContain(identity.projectId);
    expect(result.vfsFiles['/src/unison/generatedSiteRuntimeManifest.ts']).toContain('GENERATED_SITE_RUNTIME_MANIFEST');
    expect(result.siteBundleSnapshot?.meta.seal?.sealedBy).toBe('recompile');
    expect(result.siteBundleSnapshot?.meta.seal).toMatchObject({
      authorityProofVersion: '2.0',
      registeredPageBodyAuthority: 'canonical-compiler',
      pipeline: 'canonical-compiler+stage-4b',
    });
    expect(result.siteBundleSnapshot?.routerFile.content).toBe(result.vfsFiles['/src/App.tsx']);
    expect(JSON.stringify(launched.siteBundleSnapshot)).toBe(before);
    expect(reconcile).toHaveBeenCalledOnce();
    const restored = await loadLatestRevisionForProject(identity.projectId);
    expect(restored?.vfsFiles).toEqual(result.vfsFiles);
    expect(restored?.siteBundleSnapshot).toEqual(result.siteBundleSnapshot);
    expect(restored?.playground?.pageRegistry.pages[gallery.pageId]).toMatchObject({ title: 'Studio Portfolio', path: '/gallery' });
    expect(result.siteBundleSnapshot?.bindings).toEqual(launched.siteBundleSnapshot?.bindings);
    expect(collectResolvedCompositions(result.vfsFiles)[gallery.filePath!])
      .toEqual({
        ...collectResolvedCompositions(launched.files)[gallery.filePath!],
        templateName: 'Gallery Closure Salon · Studio Portfolio',
      });
    expect(restored?.vfsFiles['/src/components/recipes/Gallery.ts']).toBe(portableRecipes.families.gallery);
  }, 20_000);
});
