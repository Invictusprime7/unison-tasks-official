import { briefSchema } from '../../supabase/functions/wizard-site-composer/contract';
import { runCompositionLane, COMPOSITION_SYSTEM_PROMPT, compositionMatchesCatalog } from '../../supabase/functions/ai-code-assistant/compositionLane';
import { commitToPipeline } from '@/platform/core/commitToPipeline';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { validateAIPageComposition, applyAIPageComposition } from '@/sections/aiPageComposition';
import { requestAIPageComposition } from '@/services/requestAIPageComposition';
import { runBuilderTurn } from '@/services/builderBrainClient';
import { buildWizardDesignIntervention, readWizardDesignIntervention } from '@/services/wizardDesignIntervention';
import { getCompositionById } from '@/sections/templates';
import { compositionToReactFileSet } from '@/sections/compositionToFileSet';
import { collectResolvedCompositions } from '@/platform/core/resolvedComposition';
import type { WizardSelections } from '@/types/playground';
import { classifyTask } from '../../supabase/functions/ai-code-assistant/taskClassifier';
vi.mock('@/services/builderBrainClient', () => ({ runBuilderTurn: vi.fn() }));
const selections: WizardSelections = { businessName: 'Studio', businessModel: 'appointment_service', industryOverlay: 'salon', primaryGoal: 'book', secondaryGoals: [], requestedPages: ['home','contact'], templateId: 'salon-premium', themePresetId: 'editorial', wizardSeedId: 'composition-proof' };
const candidate = { version: '1.0' as const, pages: [{ role: 'home', sectionOrder: ['navbar','hero','gallery','services','footer'], variants: { services: 'services:editorial-rows' }, copy: { hero: { headline: 'Care shaped around you' } } }] };
const template = getCompositionById('salon-premium')!;
beforeEach(() => vi.clearAllMocks());
describe('structured AI page composition', () => {
  it('classifies composition as bounded JSON planning', () => {
    expect(classifyTask({ mode: 'wizard-composition', editMode: false, navPageGen: false, surgicalEdit: false, behavioralEdit: false, debugMode: false })).toMatchObject({ type: 'wizard_composition', prefersJsonOutput: true, skipResearch: true });
  });
  it('rejects unknown IDs, cross-role variants, new routes, duplicates and source-code fields', () => {
    const check = (value: unknown) => validateAIPageComposition(value, 'soft-editorial', ['home']);
    expect(check(candidate)).not.toBeNull();
    expect(check({ ...candidate, files: {} })).toBeNull();
    expect(check({ ...candidate, pages: [candidate.pages[0],candidate.pages[0]] })).toBeNull();
    expect(check({ ...candidate, pages: [{ ...candidate.pages[0], role: 'checkout' }] })).toBeNull();
    expect(check({ ...candidate, pages: [{ ...candidate.pages[0], variants: { services: 'services:not-real' } }] })).toBeNull();
    expect(check({ ...candidate, pages: [{ role:'home', sectionOrder:['contact'], variants:{ contact:'contact:checkout-panel' } }] })).toBeNull();
    expect(check({ ...candidate, pages: [{ ...candidate.pages[0], sectionOrder:['services','services'] }] })).toBeNull();
  });
  it('validates page coverage and variant eligibility before remembering a plan', () => {
    const brief = { roles: ['home'], variants: [{ id: 'services:editorial-rows', family: 'services', pageRoles: ['home'] }] };
    expect(compositionMatchesCatalog(candidate, brief)).toBe(true);
    expect(compositionMatchesCatalog(candidate, { ...brief, roles: ['home', 'contact'] })).toBe(false);
    expect(compositionMatchesCatalog(candidate, { ...brief, variants: [] })).toBe(false);
  });
  it('compiles original copy and adds an eligible missing section without changing source data', () => {
    const sparse = { ...template, sections: template.sections.filter(section => section.type !== 'about') };
    const plan = validateAIPageComposition({ version: '1.0', pages: [{ role: 'home', sectionOrder: ['hero','about'], variants: { about: 'about:image-story' }, copy: { hero: { headline: 'Your next chapter starts here' }, about: { headline: 'Meet the studio', description: 'Thoughtful care shaped around your goals.' } } }] }, 'soft-editorial', ['home'])!;
    expect(plan).not.toBeNull();
    const result = applyAIPageComposition(sparse, plan);
    expect(result.sections.find(section => section.type === 'hero')?.props).toMatchObject({ headline: 'Your next chapter starts here' });
    expect(result.sections.find(section => section.type === 'about')?.props).toMatchObject({ headline: 'Meet the studio' });
    expect(sparse.sections.some(section => section.type === 'about')).toBe(false);
    const design = buildWizardDesignIntervention({ ...selections, themePresetId: 'editorial', compositionPlan: plan });
    const files = compositionToReactFileSet(sparse, '/src/pages/Home.tsx', { designIntervention: design });
    expect(files['/src/pages/Home.tsx']).toContain('Your next chapter starts here');
    expect(collectResolvedCompositions(files)['/src/pages/Home.tsx'].sections.find(section => section.semanticType === 'about')?.variantId).toBe('about:image-story');
  });
  it('preserves all source data, IDs, chrome and unspecified sections while reordering', () => {
    const plan = validateAIPageComposition(candidate, 'soft-editorial', ['home'])!;
    const before = JSON.stringify(template);
    const next = applyAIPageComposition(template, plan);
    expect(new Set(next.sections.map(section => section.id))).toEqual(new Set(template.sections.map(section => section.id)));
    expect(next.sections[0].type).toBe('navbar');
    expect(next.sections[1].type).toBe('hero');
    expect(next.sections[next.sections.length - 1]?.type).toBe('footer');
    expect(next.sections.indexOf(next.sections.find(section => section.type === 'gallery')!)).toBeLessThan(next.sections.indexOf(next.sections.find(section => section.type === 'services')!));
    expect(JSON.stringify(template)).toBe(before);
  });
  it('executes and serializes accepted decisions through the canonical compiler', () => {
    const plan = validateAIPageComposition(candidate, 'soft-editorial', ['home'])!;
    const design = buildWizardDesignIntervention({ ...selections, themePresetId:'editorial', compositionPlan:plan });
    const files = compositionToReactFileSet(template, '/src/pages/Home.tsx', { designIntervention:design });
    const resolved = collectResolvedCompositions(files)['/src/pages/Home.tsx'];
    expect(resolved.sections.find(section=>section.semanticType==='services')?.variantId).toBe('services:editorial-rows');
    expect(resolved.sections[2].semanticType).toBe('gallery');
    expect(readWizardDesignIntervention({'/.unison/design-intervention.json':JSON.stringify(design)})).toEqual(design);
    const service = template.sections.find(section=>section.type==='services')!;
    const edited = compositionToReactFileSet(template, '/src/pages/Home.tsx', { designIntervention:{...design,activeVariants:{...design.activeVariants,[service.id]:'services:card-grid'}} });
    expect(collectResolvedCompositions(edited)['/src/pages/Home.tsx'].sections.find(section=>section.semanticType==='services')?.variantId).toBe('services:card-grid');
  });
  it('carries the plan through a real canonical launch and its serialized snapshot', () => {
    const plan = validateAIPageComposition(candidate, 'soft-editorial', ['home'])!;
    const result = commitToPipeline({ selections: { ...selections, compositionPlan: plan, themeTokens: template.theme } }, 'wizard-launch');
    const snapshot = JSON.parse(JSON.stringify(result.siteBundleSnapshot));
    expect(snapshot.meta.designIntervention.compositionPlan).toEqual(plan);
    const home = Object.values(snapshot.pageRegistry.pages).find((page: any) => page.isHome) as { filePath: string };
    const descriptor = collectResolvedCompositions(snapshot.vfsFiles)[home.filePath];
    expect(descriptor.sections[2].semanticType).toBe('gallery');
    expect(descriptor.sections.find(section => section.semanticType === 'services')?.variantId).toBe('services:editorial-rows');
  });
  it('accepts a valid model response without sending source files or credentials', async () => {
    vi.mocked(runBuilderTurn).mockResolvedValue({ data:{content:JSON.stringify(candidate)}, error:null });
    expect(await requestAIPageComposition({ ...selections, requestedPages: ['home'] }, new AbortController().signal)).toEqual(candidate);
    const request = vi.mocked(runBuilderTurn).mock.calls[0][0];
    expect(request.mode).toBe('wizard-site-composition');
    expect(request.vfsFiles).toBeUndefined();
    expect(briefSchema.safeParse(JSON.parse(String(request.messages[0].content))).success).toBe(true);
    expect(JSON.stringify(request)).not.toContain('21st_sk_');
  });
  it('round-trips the backend lane through client validation and canonical compilation', async () => {
    const invoke = vi.fn(async (input: Parameters<typeof runBuilderTurn>[0], _options?: Parameters<typeof runBuilderTurn>[1]) => {
      const response = await runCompositionLane(String(input.messages[0].content), {}, async messages => {
        expect(messages[0].content).toBe(COMPOSITION_SYSTEM_PROMPT);
        expect(messages[0].content).not.toContain('[BUILDER ASSISTANT MODE]');
        return { content: JSON.stringify(candidate) };
      });
      return { data: await response.json(), error: null };
    });
    const plan = await requestAIPageComposition({ ...selections, requestedPages: ['home'] }, new AbortController().signal, invoke);
    expect(plan).toEqual(candidate);
    expect(invoke.mock.calls[0][1]).toMatchObject({ timeoutMs: 110000, functionName: 'wizard-site-composer' });
    const result = commitToPipeline({ selections: { ...selections, compositionPlan: plan!, themeTokens: template.theme } }, 'wizard-launch');
    expect(result.siteBundleSnapshot!.meta.designIntervention!.compositionPlan).toEqual(candidate);
  });
  it('reports incomplete plans and rejects code responses at the backend boundary', async () => {
    const failed = vi.fn();
    vi.mocked(runBuilderTurn).mockResolvedValue({ data: { content: JSON.stringify(candidate) }, error: null });
    expect(await requestAIPageComposition(selections, new AbortController().signal, runBuilderTurn, failed)).toBeNull();
    expect(failed).toHaveBeenCalledWith('incomplete-plan', expect.objectContaining({ missingRoles: ['contact'] }));
    const response = await runCompositionLane('{}', {}, async () => ({ content: '{"files":{}}' }));
    expect(response.status).toBe(502);
    expect(await response.json()).toMatchObject({ errorType: 'composition_contract' });
  });
  it('distinguishes an undeployed endpoint from a provider failure', async () => {
    const failed = vi.fn();
    vi.mocked(runBuilderTurn).mockResolvedValue({ data: { code: 'NOT_FOUND' }, error: Object.assign(new Error('not found'), { context: { status: 404, body: '{"code":"NOT_FOUND"}' } }) });
    expect(await requestAIPageComposition(selections, new AbortController().signal, runBuilderTurn, failed)).toBeNull();
    expect(failed).toHaveBeenCalledWith('endpoint-unavailable', expect.objectContaining({ status: 404, message: expect.stringContaining('not deployed') }));
  });
  it('falls back on invalid and unavailable AI, but propagates cancellation', async () => {
    vi.mocked(runBuilderTurn).mockResolvedValue({ data:{files:{}}, error:null });
    expect(await requestAIPageComposition(selections, new AbortController().signal)).toBeNull();
    vi.mocked(runBuilderTurn).mockRejectedValue(new Error('offline'));
    expect(await requestAIPageComposition(selections, new AbortController().signal)).toBeNull();
    const controller = new AbortController(); controller.abort();
    await expect(requestAIPageComposition(selections,controller.signal)).rejects.toThrow();
  });
});
