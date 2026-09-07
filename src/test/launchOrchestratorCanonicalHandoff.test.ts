import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('launch orchestrator canonical handoff', () => {
  const source = readFileSync('src/services/launch/launchOrchestrator.ts', 'utf8');

  const position = (text: string) => {
    const index = source.indexOf(text);
    expect(index, `Expected launchOrchestrator.ts to contain: ${text}`).toBeGreaterThan(-1);
    return index;
  };

  it('hands Builder the exact artifacts returned by the canonical commit', () => {
    expect(source).toContain('const committed = commit.result;');
    expect(source).toContain('vfsFiles: committed.vfsFiles');
    expect(source).toContain('siteBundleSnapshot: committed.siteBundleSnapshot');
    expect(source).toContain('runtimeManifest: committed.runtimeManifest');
    expect(source).toContain('revisionId: committed.persistedRevisionId');
    expect(source).toContain('entryPoint: committed.runtimeManifest.entryPoint');

    const handoffSource = source.slice(source.indexOf('const committed = commit.result;'));
    expect(handoffSource).toContain('compiledPlayground,');
    expect(handoffSource).toContain('committed.playground ?? materializedPlayground');
  });

  it('rejects an incomplete canonical result before navigation', () => {
    expect(source).toContain('if (!result.siteBundleSnapshot || !result.runtimeManifest)');
    expect(source).toContain('The canonical commit returned an incomplete launch artifact.');
  });

  it('does not compile a second Sandpack preview before committing the sealed artifact', () => {
    expect(source).not.toContain('runStrictImportContractCheck');
    expect(source).not.toContain('prepareSandpackFiles');
  });

  it('builds post-Stage4b business and intent runtime contracts before sealing', () => {
    const stage4bResult = position('} = stage4b.pipelineResult;');
    const profileLoad = position('await loadBusinessProfile(input.existingBusinessId)');
    const dataBindings = position('planSectionDataBindings(siteBundleSnapshot)');
    const businessRuntime = position('buildBusinessRuntimeContract({');
    const nativeSetup = position('buildNativePublishSetupSnapshot({');
    const wizardAudit = position('auditWizardIntentGap({');
    const nativeReadiness = position('buildNativePublishReadinessManifest({');
    const intentBindings = position('buildIntentBindingsFile(materializedPlayground)');
    const intentSurfaces = position('buildIntentSurfacesFile(materializedPlayground)');
    const canonicalBuild = position('await buildCanonicalLaunchArtifactsAsync(');

    expect(source).toContain('const businessProfile: BusinessProfileDTO = loadedBusinessProfile || {');
    expect(source).toContain('if (input.existingBusinessId && !loadedBusinessProfile)');
    expect(source).toContain('businessRuntime,');
    expect(stage4bResult).toBeLessThan(profileLoad);
    expect(profileLoad).toBeLessThan(dataBindings);
    expect(dataBindings).toBeLessThan(businessRuntime);
    expect(businessRuntime).toBeLessThan(nativeSetup);
    expect(nativeSetup).toBeLessThan(wizardAudit);
    expect(wizardAudit).toBeLessThan(nativeReadiness);
    expect(nativeReadiness).toBeLessThan(intentBindings);
    expect(intentBindings).toBeLessThan(intentSurfaces);
    expect(intentSurfaces).toBeLessThan(canonicalBuild);
  });

  it('plans forms and degrades embedded published-runtime readiness without blocking launch', () => {
    const canonicalBuild = position('await buildCanonicalLaunchArtifactsAsync(');
    const formPlan = position('planLaunchFormDefinitions(artifacts.siteBundleSnapshot)');
    const readiness = position('evaluatePublishedRuntimeReadiness({');
    const degradation = position('"preflight.publish_not_ready"');

    expect(source).toContain('artifacts.files["/.unison/published-runtime.json"]');
    expect(canonicalBuild).toBeLessThan(formPlan);
    expect(formPlan).toBeLessThan(readiness);
    expect(readiness).toBeLessThan(degradation);
  });

  it('adds launch metadata only to the full commit VFS', () => {
    const canonicalBuild = position('await buildCanonicalLaunchArtifactsAsync(');
    const commitVfs = position('const vfsFiles: Record<string, string> = {');
    const commit = position('const result = await commitMutation({');

    expect(source).toContain('"/.unison/launch-readiness.json": JSON.stringify({');
    expect(source).toContain('"/.unison/native-publish-setup.json": JSON.stringify(');
    expect(source).toContain('"/.unison/setup-snapshot.json": JSON.stringify(');
    expect(source).toContain('"/.unison/intent-bindings.json": JSON.stringify(');
    expect(source).toContain('"/.unison/intent-surfaces.json": JSON.stringify(');
    expect(source).toContain('"/.unison/gate-verdicts.json": JSON.stringify(');
    expect(source).toContain('"/.unison/integrity-report.json": JSON.stringify(');
    expect(source).toContain('vfsFiles["/.unison/draft-classification.json"]');
    expect(source).toContain('wizardAudit,');
    expect(source).toContain('launchContract: plan.launchContract,');
    expect(source).toContain('publishedRuntimeReadiness,');
    expect(source).toContain('previewReady: true,');
    expect(source).toContain('generatedAt: new Date().toISOString(),');
    expect(canonicalBuild).toBeLessThan(commitVfs);
    expect(commitVfs).toBeLessThan(commit);
  });

  it('restores platform-core gates and classification through the committed handoff', () => {
    const compile = position('compileContract(blueprint, { backendInstalled: false })');
    const gates = position('evaluateAllGates(compiledContract)');
    const integrity = position('runIntegrityReport(');
    const classification = position('classifyDraft(vfsFiles)');
    const commit = position('const result = await commitMutation({');
    const routeState = position('const routeState: Record<string, unknown> = {');

    expect(source).toContain('compiledContract,');
    expect(source).toContain('_compiledContract: compiledContract,');
    expect(source).toContain('_previewGateVerdict: gateVerdicts.preview,');
    expect(source).toContain('_publishGateVerdict: gateVerdicts.publish,');
    expect(source).toContain('_draftClassification: draftClassification,');
    expect(compile).toBeLessThan(gates);
    expect(gates).toBeLessThan(integrity);
    expect(integrity).toBeLessThan(classification);
    expect(classification).toBeLessThan(commit);
    expect(commit).toBeLessThan(routeState);
  });

  it('persists planned forms after commit and degrades persistence errors', () => {
    const commit = position('const result = await commitMutation({');
    const persistedRevision = position('if (!result.persistedRevisionId)');
    const persistForms = position('await persistLaunchFormDefinitions({');
    const degradation = position('"commit.form_definitions_unavailable"');

    expect(source).toContain('businessId: commit.confirmed.businessId,');
    expect(source).toContain('projectId: commit.confirmed.projectId,');
    expect(source).toContain('siteId: commit.confirmed.siteId,');
    expect(source).toContain('definitions: plannedFormDefinitions,');
    expect(commit).toBeLessThan(persistedRevision);
    expect(persistedRevision).toBeLessThan(persistForms);
    expect(persistForms).toBeLessThan(degradation);
  });

  it('hydrates live controllers only from committed handoff artifacts', () => {
    const committed = position('const committed = commit.result;');
    const topology = position('livePageTopology.setRegistry(committed.siteBundleSnapshot.pageRegistry)');
    const preview = position('livePreviewRuntime.hydrateFromRegistry(committed.siteBundleSnapshot.pageRegistry)');
    const playground = position('livePlaygroundSync.hydrateFromVFS(committedVfsNodes, committed.vfsFiles)');

    expect(source).toContain('const committedVfsNodes: VirtualNode[] =');
    expect(committed).toBeLessThan(topology);
    expect(topology).toBeLessThan(preview);
    expect(preview).toBeLessThan(playground);
  });
});