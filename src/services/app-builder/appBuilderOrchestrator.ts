/** Candidate-only full-application orchestration behind UnisonAppBuilder. */

import { assembleCanonicalAuthoringRequest } from '@/services/builder/canonicalAuthoringRequest';
import type { ComposerLoopInput, ComposerLoopResult } from '@/services/builder/aiRepairLoop';
import type { SiteAuthoringInput, SiteAuthoringResult } from '@/services/launch/siteAuthoringOrchestrator';
import { APP_BUILDER_PROTOCOL_VERSION, type AppBuildRequest, type AppBuildResult } from './appBuilderContracts';
import { validateAppBuildCandidate } from './appBuilderCandidate';

export interface AppBuilderOrchestratorDependencies {
  authorSite: (input: SiteAuthoringInput) => Promise<SiteAuthoringResult>;
  runComposer: (input: ComposerLoopInput) => Promise<ComposerLoopResult>;
}

export async function orchestrateAppBuild(
  input: AppBuildRequest,
  dependencies: AppBuilderOrchestratorDependencies,
): Promise<AppBuildResult> {
  const pages = input.contract.topology.sitePlan.pages.map((page) => ({
    pageId: page.id,
    title: page.title,
    route: page.route,
    filePath: page.filePath,
    role: page.role,
  }));
  const authored = await dependencies.authorSite({
    pages,
    homePageId: input.contract.topology.sitePlan.homePageId,
    designContext: input.contract.design.resolvedSiteDesignContext,
    businessName: input.contract.business.businessName,
    files: { ...input.initialFiles },
    revisionId: input.baseRevisionId,
    signal: input.signal,
    budgetMs: input.budgetMs,
    maxPages: input.maxPages,
    concurrency: input.concurrency,
    preflight: input.preflight,
    onProgress: input.onProgress,
    commitPage: input.acceptPage ?? (async (nextFiles) => ({
      files: nextFiles,
      revisionId: input.baseRevisionId,
    })),
    compositionPlan: input.contract.design.compositionPlan,
    registryContext: input.contract.design.registryContext,
  });

  const compatibilityMode = Boolean(input.acceptPage);
  let candidateFiles = { ...authored.files };
  if (!compatibilityMode && input.preflight) candidateFiles = input.preflight(candidateFiles);
  let closure = validateAppBuildCandidate({
    contract: input.contract,
    files: candidateFiles,
    initialFiles: input.initialFiles,
  });
  let closureRepairAttempts = 0;

  // One site-wide repair attempt sees the complete closure diagnostics and protected-path constraints.
  if (!compatibilityMode && !closure.ok && !input.signal?.aborted) {
    const home = pages.find((page) => page.pageId === input.contract.topology.sitePlan.homePageId) ?? pages[0];
    if (home) {
      const diagnostics = closure.issues
        .filter((issue) => issue.severity === 'blocker')
        .map((issue) => `${issue.code}${issue.path ? ` (${issue.path})` : ''}: ${issue.message}`)
        .slice(0, 30);

      // Enhanced repair instruction for protected-path violations
      const hasProtectedPathViolation = diagnostics.some(d => d.includes('protected-source-changed'));
      const repairInstruction = hasProtectedPathViolation
        ? 'Resolve every supplied closure diagnostic across the candidate application. IMPORTANT: Do not modify package.json, tsconfig.json, or .unison/* files — these are canonical infrastructure. Work only within approved dependencies and available component imports. If imports are missing, use only components and utilities already available in the approved dependencies.'
        : 'Resolve every supplied closure diagnostic across the candidate application.';

      const assembled = await assembleCanonicalAuthoringRequest({
        task: 'site_page_repair',
        page: home,
        brief: 'Repair site-wide application closure without changing canonical infrastructure or the sealed design identity.',
        knowledgeQuery: `${input.contract.business.industry} site-wide module route design closure`,
        instruction: repairInstruction,
        baseFiles: candidateFiles,
        baseRevisionId: input.baseRevisionId,
        sourceTargets: pages.map((page) => page.filePath),
        routes: pages.map((page) => ({ title: page.title, route: page.route })),
        registryContext: input.contract.design.registryContext,
        runtimeContext: `Approved capabilities: ${input.contract.business.capabilities.join(', ')}. Protected paths: ${input.contract.runtime.protectedPaths.join(', ')}. Approved dependencies: ${input.contract.runtime.approvedDependencies.join(', ')}.`,
        diagnostics,
      });
      const repaired = await dependencies.runComposer({
        request: assembled.request,
        baseFiles: candidateFiles,
        baseRevisionId: input.baseRevisionId ?? undefined,
        maxAttempts: 3,
        signal: input.signal,
        preflight: input.preflight,
        candidateOrigin: 'repair',
        candidateIntent: 'site-wide-closure',
      });
      closureRepairAttempts = repaired.attempts;
      if (repaired.ok && repaired.prepared) {
        candidateFiles = repaired.prepared.nextFiles;
        if (input.preflight) candidateFiles = input.preflight(candidateFiles);
        closure = validateAppBuildCandidate({
          contract: input.contract,
          files: candidateFiles,
          initialFiles: input.initialFiles,
        });
      }
    }
  }

  const cancelled = input.signal?.aborted === true;
  const ready = compatibilityMode || closure.ok;
  const authorDiagnostics = authored.outcomes.flatMap((outcome) => outcome.errors);
  const closureDiagnostics = closure.issues
    .filter((issue) => issue.severity === 'blocker')
    .map((issue) => issue.message);
  const strategy = compatibilityMode
    ? 'legacy-commit-adapter' as const
    : closureRepairAttempts > 0
      ? 'ai-candidate+closure-repair' as const
      : 'ai-candidate' as const;
  const candidate = {
    candidateId: `${input.operationId}:candidate:${closure.sourceHash.replace(':', '_')}`,
    status: cancelled ? 'cancelled' as const : ready ? 'ready-for-commit' as const : 'rejected' as const,
    files: candidateFiles,
    entryPoint: input.entryPoint,
    attempts: authored.outcomes.reduce((total, outcome) => total + outcome.attempts, 0) + closureRepairAttempts,
    diagnostics: [...authorDiagnostics, ...closureDiagnostics],
    closure,
    provenance: {
      protocolVersion: APP_BUILDER_PROTOCOL_VERSION,
      operationId: input.operationId,
      baseRevisionId: input.baseRevisionId ?? null,
      contractSeed: input.contract.design.seed,
      sourceHash: closure.sourceHash,
      authoredPageIds: pages.map((page) => page.pageId),
      strategy,
    },
  };
  return {
    operationId: input.operationId,
    protocolVersion: APP_BUILDER_PROTOCOL_VERSION,
    candidate,
    candidateFiles,
    stopReason: cancelled ? 'cancelled' : ready ? 'complete' : closureRepairAttempts ? 'repair-exhausted' : 'validation-failed',
    outcomes: authored.outcomes,
    revisionId: authored.revisionId,
  };
}

