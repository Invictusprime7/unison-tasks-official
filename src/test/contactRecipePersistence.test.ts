import { describe, expect, it, vi } from 'vitest';

const revisions: Record<string, unknown>[] = [];

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => {
      const chain = {
        select: () => chain,
        eq: () => chain,
        order: () => chain,
        limit: () => chain,
        single: async () => ({ data: { site_id: '55555555-5555-4555-5555-555555555555' }, error: null }),
        maybeSingle: async () => ({ data: revisions[revisions.length - 1] ?? null, error: null }),
      };
      return chain;
    },
    functions: { invoke: vi.fn(async () => ({ data: { success: true }, error: null })) },
    rpc: async (_name: string, payload: Record<string, unknown>) => {
      const row = {
        ...Object.fromEntries(Object.entries(payload).map(([key, value]) => [key.replace(/^p_/, ''), value])),
        id: '00000000-0000-4000-8000-000000000001',
      };
      revisions.push(structuredClone(row));
      return { data: row.id, error: null };
    },
  },
}));
vi.mock('@/services/elementReadinessEvaluator', () => ({ evaluateElementReadiness: vi.fn(async () => ({ summary: { previewBlocked: 0, publishBlocked: 0 } })) }));
vi.mock('@/services/playgroundControlPlaneResolver', () => ({ resolvePlaygroundControlPlane: vi.fn(() => ({ readinessReport: { summary: { previewBlocked: 0, publishBlocked: 0 } }, validationSummary: {}, overview: {} })) }));

import { commitToPipeline } from '@/platform/core/commitToPipeline';
import { buildCanonicalLaunchArtifacts } from '@/services/canonicalLaunchVfs';
import { commitMutation, loadLatestRevisionForProject } from '@/services/vfsCommitService';
import { emptyPatchPlan } from '@/types/patchPlan';
import { THEME_PRESETS } from '@/components/onboarding/themePresets';
import { themePresetToThemeTokens } from '@/components/onboarding/themePresetToTokens';
import portableRecipes from '@/sections/recipes/stylexRecipes.generated.json';

describe('Contact portable recipe persistence', () => {
  it('survives canonical finalization, commit, and reload with exact bytes', async () => {
    const identity = {
      userId: '11111111-1111-4111-8111-111111111111', businessId: '22222222-2222-4222-8222-222222222222',
      projectId: '33333333-3333-4333-8333-333333333333', draftId: '44444444-4444-8444-8444-444444444444', revisionId: '', sessionId: 'contact-roundtrip',
    };
    const preset = THEME_PRESETS.find((theme) => theme.id === 'editorial')!;
    const compiled = commitToPipeline({ selections: {
      businessName: 'Contact Closure Salon', businessModel: 'appointment_service', industryOverlay: 'salon', systemType: 'booking',
      primaryGoal: 'book', secondaryGoals: ['contact'], needsBooking: true, wantsLeadCapture: true, primaryIntent: 'booking.create',
      requestedPages: ['home', 'contact'], scaffoldMode: 'selected-pages', templateId: 'salon-premium', themePresetId: 'editorial', themeTokens: themePresetToThemeTokens(preset),
    } as never }, 'wizard-launch');
    const launched = buildCanonicalLaunchArtifacts({
      generatedFiles: compiled.siteBundleSnapshot.vfsFiles, siteBundleSnapshot: compiled.siteBundleSnapshot,
      compileArtifact: compiled.compileArtifact, canonicalPlayground: compiled.playground, templateId: 'salon-premium',
      themePresetId: 'editorial', businessName: 'Contact Closure Salon', industry: 'salon', businessId: identity.businessId, projectId: identity.projectId,
    });
    const result = await commitMutation({
      source: 'playground-edit', identity,
      current: { vfsFiles: launched.files, siteBundleSnapshot: launched.siteBundleSnapshot, playground: compiled.playground },
      patch: emptyPatchPlan(),
    });
    const restored = await loadLatestRevisionForProject(identity.projectId);
    expect(result.status).toBe('committed');
    expect(result.vfsFiles['/src/components/recipes/Contact.ts']).toBe(portableRecipes.families.contact);
    expect(restored?.vfsFiles['/src/components/recipes/Contact.ts']).toBe(portableRecipes.families.contact);
  }, 20_000);
});