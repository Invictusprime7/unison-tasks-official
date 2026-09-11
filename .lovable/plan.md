# Wire Launch Wizard Lane B design proposals into the canonical pipeline

## Current state

- **Lane B at launch time is not invoked.** `launchOrchestrator.ts` runs a fully deterministic Stage 4b compile from `WizardSelections`. The page bodies, section order, and variant choices come from the deterministic compiler + `wizardDesignIntervention.ts` rule engine.
- **Lane B scaffolding exists but is dormant.** `laneBBatchPlanner.ts` and `wizardLaneBVfsPayload.ts` were built to split a wizard-time Lane B request across batches, but no production caller uses them.
- **Lane B currently only runs in the editor.** `AIBuilderPanel.tsx` calls `runBuilderTurn()` in `builderBrainClient.ts`, and its output re-enters the canonical pipeline through `commitToPipeline({ source: 'ai-builder' })`.
- **In-builder AI edits are already gated.** `aiApplyGate.ts` → `aiPatchScopeGuard.ts` → `commitMutation` → `VFSCommitService` is the only write path; AI cannot touch the router, entry file, Unison modules, or backend code.
- **Launch Wizard "AI design proposal" does not exist as an LLM feature.** `wizardDesignIntervention.ts` is a deterministic, seeded rule engine that emits an `aiDirective` string. No LLM call generates the design plan.

## Goal

Add a constrained, optional AI design-proposal stage to the Launch Wizard that runs **before** the deterministic Stage 4b compiler. The AI proposes industry-aware design choices; the proposal is validated against existing registries and then fed into the deterministic compiler. If the AI is slow, fails, or is disabled, the launch still ships the deterministic site unchanged.

## Plan

### 1. Add a wizard-time design-proposal entry point

- Create `src/services/launch/wizardDesignProposal.ts` that accepts the same pre-compile context as Stage 4b: `WizardSelections`, `SiteConfiguration`, `industryMatrix` profile, selected art-direction pack, page topology, and the deterministic design brief.
- The function calls an edge function or `builderBrainClient.ts` design-proposal route with a prompt that asks for a **design proposal only**, not code.
- The proposal shape is typed and registry-bound:
  - `palette`: registered token overrides (must match declared CSS variables).
  - `typography`: registered font pair / scale choice.
  - `sectionOrder`: per-page array of registered section family ids.
  - `variantRanking`: per-section ranked list of registered variant ids.
  - `motionIntensity`: one of registered motion presets.
  - `mediaDirection`: focal treatment, mood, subject tags.
  - `copyVoice`: tone directive string consumed by the deterministic copy layer.
- Any proposed value not found in the registry is dropped. Missing values are filled by the deterministic rule engine.

### 2. Validate the proposal against canonical authorities

- Reuse `designImplementationRegistry.ts` to verify every section family, variant, and token exists.
- Reuse `industryMatrix.ts` to verify every proposed section is legal for the industry and page role.
- Reuse `artDirectionPacks.ts` to verify palette/motion/media choices belong to the selected pack or the industry's allowed packs.
- Reuse `wizardDesignIntervention.ts` to merge the validated AI proposal with the deterministic `aiDirective`.

### 3. Feed the validated proposal into Stage 4b

- Extend `WizardSelections` (or `SiteConfiguration`) with an optional `aiDesignProposal` field.
- In `launchOrchestrator.ts`, add a new stage before `seed`: `design-proposal`.
  - If AI proposals are enabled and the proposal succeeds, write it into the launch context.
  - If it fails or times out, mark a degradation and continue with deterministic defaults.
- In `wizardStage4bRuntime.ts` / `executeCanonicalPipeline`, read `aiDesignProposal` when resolving section order and variant choices. The deterministic compiler remains the sole author of the actual page files.

### 4. Wire the existing Lane B batch planner

- Use `planLaneBBatches()` from `laneBBatchPlanner.ts` to split multi-page proposal generation across batches when the topology has many pages.
- Use `wizardLaneBVfsPayload.ts` to assemble the VFS/catalog context sent to the AI for each batch.
- Ensure the proposal call streams or uses bounded timeouts so it cannot hang the launch.

### 5. Harden the in-builder AI patch surface (B2 continuation)

- Extend `aiPatchScopeGuard.ts` allowed surfaces to explicitly include `/src/generated/styleBridge.ts` and any new recipe modules emitted by Stage 4b.
- Add `presentationOps` and `bindingOps` helpers so the AI Builder can propose section swaps, variant swaps, token edits, and canonical intent bindings as typed `PatchPlan` operations rather than raw file diffs.
- Keep the escape-hatch `fileOps` patch for genuine page-body edits, but require the same preflight/seal gate.

### 6. Add tests and certification

- Add `src/test/wizardDesignProposal.test.ts`:
  - Proposed unknown variant is dropped.
  - Proposed forbidden section for an industry is dropped.
  - AI failure still yields a launch-ready deterministic site.
  - Valid proposal changes section order and variant ranking.
- Add `src/test/launchOrchestratorDesignProposal.test.ts`:
  - Orchestrator stage sequence includes `design-proposal` → `seed` → `enrich` → `preflight`.
  - Degradation is recorded on proposal failure but launch completes.
- Re-run `deterministicAiOffCertification.test.ts` to confirm AI-off mode still passes.

### 7. Remove dormant scaffolding or put it to use

- If `laneBBatchPlanner.ts` and `wizardLaneBVfsPayload.ts` remain unused after wiring, either delete them or mark them as used by the new proposal stage. The goal is no orphaned, untested production code.

## What this plan does NOT do

- It does not let AI write VFS files directly.
- It does not let AI change site topology, page routes, or the deterministic router.
- It does not create a new parallel registry or pipeline.
- It does not make AI required for launch.

## Rollout order

1. Implement the proposal type and validation helpers.
2. Add the `design-proposal` stage to `launchOrchestrator.ts` behind a feature flag.
3. Feed the proposal into `wizardDesignIntervention.ts` / Stage 4b.
4. Wire `laneBBatchPlanner.ts` for multi-page batches.
5. Extend B2 presentation/binding ops and tests.
6. Run full certification suite and remove any remaining dormant scaffolding.
