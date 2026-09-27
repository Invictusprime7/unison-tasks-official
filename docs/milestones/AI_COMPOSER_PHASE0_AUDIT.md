# AI-Authored TSX Composer — Phase 0 Audit (2026-09-27)

## Flow
Wizard (LauncherWizard) → launchOrchestrator.runLaunchPipeline → canonicalPipeline.executeCanonicalPipeline → Lane B (laneBBatchPlanner, wizard-site-composer via requestAIPageComposition) → runFullPreflight → vfsCommitService.commitMutation → snapshotSeal → Sandpack preview → Builder (aiApplyGate, builderMutationService) → deploymentService.

## Live VFS writers
- CANONICAL: commitMutation and all callers (launchOrchestrator, aiApplyGate, compositionUpgrade, capabilityProvisioner).
- LEGACY/EXEMPT: WebBuilder baseline writes and snapshot projection (frozen in canonical-vfs-exemption-registry.json).
- UNKNOWN: useAIVFS.ts, frameworkVfsMigration.ts, wizardBindingBridge.applyWizardBindingsToVfs.
- Bypass detector exists: vfsDriftWatcher.

## Gates
| Gate | Status |
|---|---|
| Parse | EXISTS (aiSitePreflightRepair) |
| Protected path | EXISTS (snapshotSeal) |
| Import graph | PARTIAL (analyzer used for context, not blocking) |
| Dependency | PARTIAL (runtimeCompatibilityPreflight) |
| TypeScript | MISSING |
| Build | MISSING |
| Router/topology | PARTIAL |
| Intent closure | EXISTS |
| Isolated render | MISSING |
| Design validation | PARTIAL (advisory only) |

## Design context
Pieces exist separately: compileSiteDesignContract (deterministic, Lane B only), resolveExperienceEnvelope (siloed), resolveImplementationContract. No single ResolvedSiteDesignContext.

## Minimal plan
1. Phase 1: `resolvedSiteDesignContext.ts` composes the three existing compilers into one deterministic context (no new resolver).
2. Phase 2: candidate changeset applied to a copy of committed VFS via commitMutation dry-run.
3. Phase 3: make import/dependency blocking; add TypeScript-lite + router gates.
4. First slice: one Home page AI edit through the candidate → gates → commit → preview.

## Phase 1 — done
`src/services/launch/resolvedSiteDesignContext.ts` → `compileResolvedSiteDesignContext()` joins the contract, experience envelope and legality into one deterministic context with a fingerprint. It splits hard legality (forbidden ids) from creative recommendation (preferred ids; local components permitted). Tests: `src/test/resolvedSiteDesignContext.test.ts`.

## Phase 2 — done (candidate transaction)
`src/services/builder/aiCandidateChangeSet.ts` → `buildAICandidateChangeSet()` normalizes AI output (path canonicalization, protected-path/slot guards, JSX typo repair, dependency resolution — all reused from `aiVFSOrchestrator.ts`) into an `AICandidateChangeSet` of create/replace/delete ops, applied in memory to a copy of the last committed VFS. No VFS write, no preview event, no persistence. Deterministic id. Tests: `src/test/aiCandidateChangeSet.test.ts`. Next: Phase 3 gates consume `candidateFiles`; wiring the Builder path to the candidate happens with the first slice.
