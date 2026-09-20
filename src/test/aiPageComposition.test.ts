import { briefSchema } from '../../supabase/functions/wizard-site-composer/contract';
import { runCompositionLane, COMPOSITION_SYSTEM_PROMPT, compositionMatchesCatalog } from '../../supabase/functions/_shared/compositionLane';
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
import { buildWizardAggregatedRegistryContext } from '@/services/launch/wizardRegistryAggregation';
import { classifyTask } from '../../supabase/functions/_shared/taskClassifier';
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
    const mockedBuilderTurn = runBuilderTurn as ReturnType<typeof vi.fn>;
    mockedBuilderTurn.mockResolvedValue({ data:{content:JSON.stringify(candidate)}, error:null });
    expect(await requestAIPageComposition({ ...selections, requestedPages: ['home'] }, new AbortController().signal)).toEqual(candidate);
    const request = mockedBuilderTurn.mock.calls[0][0];
    expect(request.mode).toBe('wizard-site-composition');
    expect(request.vfsFiles).toBeUndefined();
    const brief = JSON.parse(String(request.messages[0].content));
    expect(briefSchema.safeParse(brief).success).toBe(true);
    expect(brief.variants[0]).not.toHaveProperty('origin');
    expect(brief.variants[0]).not.toHaveProperty('sourceUrl');
    expect(brief.variants[0]).not.toHaveProperty('thumbnail');
    expect(brief.variants[0]).not.toHaveProperty('generationStatus');
    expect(JSON.stringify(request)).not.toContain('21st_sk_');
  });
  it('sends bounded Registry Context v2 fields without the global registry', async () => {
    const mockedBuilderTurn = runBuilderTurn as ReturnType<typeof vi.fn>;
    mockedBuilderTurn.mockResolvedValue({ data:{content:JSON.stringify(candidate)}, error:null });
    const registry = buildWizardAggregatedRegistryContext({ industry: 'salon', templateId: 'salon-premium', themePresetId: 'editorial', businessId: 'biz-1', assets: [
      { id: 'asset-1', kind: 'image', name: 'Hero', mime: 'image/jpeg', url: 'https://assets.test/hero.jpg', checksum: 'secret-checksum', businessId: 'biz-1', tags: ['hero'], createdAt: '', updatedAt: '' },
    ] });
    await requestAIPageComposition({ ...selections, requestedPages: ['home'] }, new AbortController().signal, runBuilderTurn, undefined, registry);
    const brief = JSON.parse(String(mockedBuilderTurn.mock.calls[0][0].messages[0].content));
    expect(brief.assets).toEqual([expect.objectContaining({ id: 'asset-1', url: 'https://assets.test/hero.jpg' })]);
    expect(JSON.stringify(brief)).not.toContain('secret-checksum');
    expect(brief.runtimeDependencies.react).toEqual(expect.any(String));
    expect(brief.primitiveFamilies).toEqual(expect.arrayContaining([expect.objectContaining({ family: 'layout' })]));
    expect(brief.implementationContracts[0]).not.toHaveProperty('source');
    expect(brief.variants[0].visualSignature).toEqual(expect.objectContaining({ geometry: expect.any(String), experienceLevel: expect.any(String) }));
    expect(brief.implementationContracts[0].componentStates.supported).toContain('default');
    expect(brief.implementationContracts[0].visualSignature).toEqual(expect.objectContaining({ density: expect.any(String) }));
    expect(briefSchema.safeParse(brief).success).toBe(true);
  });
  it('enforces user pins in client and edge composition validation', () => {
    const pinned = { services: 'services:editorial-rows' };
    expect(validateAIPageComposition(candidate, 'soft-editorial', ['home'], { pinnedVariants: pinned })).not.toBeNull();
    const mismatch = { ...candidate, pages: [{ ...candidate.pages[0], variants: { services: 'services:card-grid' } }] };
    expect(validateAIPageComposition(mismatch, 'soft-editorial', ['home'], { pinnedVariants: pinned })).toBeNull();
    expect(compositionMatchesCatalog(mismatch, { roles: ['home'], variants: [{ id: 'services:card-grid', family: 'services', pageRoles: ['home'] }], designSelection: { pinnedVariants: pinned } })).toBe(false);
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
    expect(invoke.mock.calls[0][1]).toMatchObject({ functionName: 'wizard-site-composer' });
    expect(invoke.mock.calls[0][1]).not.toHaveProperty('timeoutMs');
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


describe('composer catalog repair', () => {
  const brief = { roles: ['home'], variants: [{ id: 'hero:launch-showcase', family: 'hero', pageRoles: ['home'] }] };
  const valid = { version: '1.0', pages: [{ role: 'home', sectionOrder: ['hero'], variants: { hero: 'hero:launch-showcase' }, copy: { hero: { headline: 'Care for your next chapter' } } }] };
  it.each(['unknown-id', 'wrong-role', 'unknown-family', 'malformed'])('repairs %s with AI before acceptance', async failure => {
    const bad = JSON.parse(JSON.stringify(valid));
    if (failure === 'unknown-id') bad.pages[0].variants.hero = 'hero:invented';
    if (failure === 'wrong-role') bad.pages[0].role = 'checkout';
    if (failure === 'unknown-family') bad.pages[0].sectionOrder.push('invented');
    const generate = vi.fn().mockResolvedValueOnce({ content: failure === 'malformed' ? 'invalid JSON' : JSON.stringify(bad) }).mockResolvedValueOnce({ content: JSON.stringify(valid) });
    const response = await runCompositionLane(JSON.stringify(brief), {}, generate, { brief });
    expect(response.status).toBe(200);
    expect(JSON.parse((await response.json()).content)).toEqual(valid);
    expect(generate).toHaveBeenCalledTimes(2);
    expect(generate.mock.calls[1][0].at(-1).content).toContain('Validation issues');
  });
  it('accepts a catalog-valid plan without forcing AI-authored replacement copy', async () => {
    const withoutCopy = { ...valid, pages: [{ ...valid.pages[0], copy: undefined }] };
    delete withoutCopy.pages[0].copy;
    const generate = vi.fn().mockResolvedValue({ content: JSON.stringify(withoutCopy) });
    const response = await runCompositionLane('{}', {}, generate, { brief });
    expect(response.status).toBe(200);
    expect(JSON.parse((await response.json()).content)).toEqual(withoutCopy);
    expect(generate).toHaveBeenCalledOnce();
  });
  it('discards compiler-owned footer selections before validating multi-page compositions', async () => {
    const multiPageBrief = {
      roles: ['pricing', 'faq', 'checkout'],
      variants: [
        { id: 'pricing:tiers', family: 'pricing', pageRoles: ['pricing'] },
        { id: 'faq:accordion', family: 'faq', pageRoles: ['faq'] },
        { id: 'checkout:panel', family: 'checkout', pageRoles: ['checkout'] },
      ],
    };
    const modelPlan = {
      version: '1.0' as const,
      pages: [
        { role: 'pricing', sectionOrder: ['pricing', 'footer'], variants: { pricing: 'pricing:tiers', footer: 'footer:home-only' } },
        { role: 'faq', sectionOrder: ['faq', 'footer'], variants: { faq: 'faq:accordion', footer: 'footer:home-only' } },
        { role: 'checkout', sectionOrder: ['checkout', 'footer'], variants: { checkout: 'checkout:panel', footer: 'footer:home-only' } },
      ],
    };
    const generate = vi.fn().mockResolvedValue({ content: JSON.stringify(modelPlan) });
    const response = await runCompositionLane('{}', {}, generate, { brief: multiPageBrief });
    expect(response.status).toBe(200);
    const accepted = JSON.parse((await response.json()).content);
    expect(accepted.pages.every((page: { variants: Record<string, string> }) => !('footer' in page.variants))).toBe(true);
    expect(compositionMatchesCatalog(modelPlan, multiPageBrief)).toBe(true);
    expect(generate).toHaveBeenCalledOnce();
  });
  it('stops before repair when cancelled', async () => {
    const controller = new AbortController();
    const generate = vi.fn().mockImplementation(async () => { controller.abort(); return { content: '{}' }; });
    await expect(runCompositionLane('{}', {}, generate, { brief, signal: controller.signal })).rejects.toThrow();
    expect(generate).toHaveBeenCalledOnce();
  });
});
