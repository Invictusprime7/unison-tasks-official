# Copilot Instructions for Unison

## Canonical Architecture

Use `roadmap.md` and `docs/DETERMINISTIC_AI_DESIGN_EXECUTION_PLAN.md` as the
current architecture sources. Preserve this protected chain:

```text
LauncherWizard
  -> runLaunchPipeline
  -> deterministic resolution and canonical compiler
  -> Stage 4b
  -> canonical preflight
  -> commitMutation / VFSCommitService
  -> SiteBundleSnapshot and revision
  -> Live Preview and Playground
```

Launcher must remain deterministic and fully launchable with AI disabled,
unavailable, or rejected. `LauncherWizard` collects authoritative selections;
`launchOrchestrator` owns planning, compilation, Stage 4b, preflight, canonical
commit, and committed handoff.

## Authority Boundaries

- The topology planner owns page existence and roles, not visual design.
- Template composition owns industry structure and section-family baselines,
  not runtime mutation policy.
- The Section Registry owns semantic section families and defaults.
- The Variant Registry owns concrete visual implementations.
- The Design Implementation Registry is derived from existing registries, never
  a second hand-maintained inventory.
- The Artifact Registry owns business semantics, slots, intents, bindings, data
  sources, capabilities, readiness, and edit scope, not visual layout.
- Template Design Contract V2 and resolved composition record deterministic
  design identity; they do not own global theme values.
- Stage 4b is the only global theme and semantic-token authority. Compiler and
  registry emitters consume Stage 4b and `--ut-*` tokens; they must not create
  literal or parallel palette ownership.
- `commitMutation` through `VFSCommitService` is the only accepted mutation and
  revision boundary. No caller writes canonical VFS or snapshots directly.
- `SiteBundleSnapshot` is sealed runtime truth for its revision and is not
  mutated after sealing.
- Live Preview and Playground render and hydrate committed canonical artifacts.
  They may not generate fallback page source or become snapshot authorities.

Route state and local storage may carry navigation or recovery hints. They do
not own canonical project identity, VFS, revisions, or persisted project state.

## Registry-To-Runtime Closure

An asset is incomplete until one stable identity survives this round trip:

```text
Registry
  -> eligibility and seeded deterministic resolution
  -> Template Design Contract V2 / resolved composition
  -> canonical compiler and VFS
  -> Stage 4b semantic theme
  -> commit and sealed snapshot revision
  -> Live Preview execution
  -> Playground hydration
  -> structured edit, recommit, reload, and rehydration
```

Prove registry identity, legal eligibility, seed determinism, compiler emission,
semantic theme compliance, snapshot byte and identity preservation, Preview
execution without fallback authorship, and Playground recovery of artifact,
implementation, slots, intents, and bindings. Registry counts, filenames,
source-only assertions, and static quality scores are not closure evidence.

Derive cross-registry projections. Do not add duplicate registries, compiler
branches, VFS writers, preview owners, snapshot stores, or runtime identities.
Keep compatibility adapters only until persisted-snapshot restore and closure
tests prove that the legacy format can be retired without data loss.

## AI Boundary

AI is optional downstream enrichment only, after deterministic output is
premium, executable, committed, previewed, and editable. AI may propose a
structured, schema-validated, registry-aware plan for content, media, SEO,
registered variant ranking, supported layout properties, or registered
primitive recipes.

AI must never author or replace Launcher page source, write VFS or snapshots
directly, change topology, override Stage 4b, invent canonical identities,
bypass compilation/preflight/commit, or become required for Launcher success.

Apply accepted AI operations to canonical structured state, recompile, run
preflight, and commit through `VFSCommitService`. On timeout, invalid output,
incompatibility, compile failure, or failed preflight, discard the AI plan and
keep the deterministic base site. `wizard-seed` remains compatibility-only and
must not be reconnected as Launcher page authorship.

## Primary Current Files

- `src/services/launch/launchRun.ts` - `runLaunchPipeline` entry contract.
- `src/services/launch/launchOrchestrator.ts` - canonical Launcher owner.
- `src/services/canonicalLaunchVfs.ts` - deterministic canonical launch VFS.
- `src/sections/compositionToFileSet.ts` - composition-to-React file emission.
- `src/sections/variants/types.ts` and `src/sections/variants/registry.ts` -
  concrete variant contracts and inventory.
- `src/services/designImplementationRegistry.ts` - derived implementation view.
- `src/platform/core/resolvedComposition.ts` - resolved implementation identity.
- `src/platform/core/snapshotSeal.ts` - sealed snapshot authority metadata.
- `src/test/launchOrchestratorCanonicalHandoff.test.ts` - handoff proof.
- `src/test/snapshotSeal.test.ts`, `src/test/canonicalLaunchVfs.test.ts`, and
  `src/test/goldenIndustryPipeline.test.ts` - snapshot and launch-path proofs.

Treat filenames as navigation hints, not proof. Before changing architecture,
trace the invoked production call path and confirm the current symbol owner.

## Implementation Workflow

1. Start from one broken behavior or unverified closure gate.
2. Trace selection, resolution, compiler, Stage 4b, preflight, commit, snapshot,
   Preview, and Playground as applicable.
3. Identify the existing canonical owner and nearby duplicate authorities.
4. Add or update a focused closure, compatibility, recovery, or bypass test.
5. Implement one additive closure-sized batch and preserve persisted formats
   with a read adapter or feature gate where needed.
6. Run the focused check immediately after the first substantive edit.
7. Validate identity and bindings through commit, reload, and rehydration.
8. Remove legacy behavior only after parity, restore, and no-bypass proof.

## Validation Commands

Use the narrowest relevant command first, then expand with the blast radius:

```powershell
npx vitest run src/test/snapshotSeal.test.ts src/test/canonicalLaunchVfs.test.ts src/test/goldenIndustryPipeline.test.ts
npx vitest run src/test/launchOrchestratorCanonicalHandoff.test.ts
node scripts/lint-canonical-vfs-writes.mjs
node scripts/lint-pipeline-bypass.mjs
node scripts/lint-single-source-of-truth.mjs
npx tsc -p tsconfig.app.json --noEmit
npm run lint
npm run build
npx vitest run
```

For runtime-facing changes, also prove selected routes in Live Preview,
refresh/reopen from the committed revision, Playground hydration, and mobile
and desktop behavior. Run Edge-function and Supabase checks when their code,
schema, RLS, or deployment contract changes. Local tests do not prove remote
deployment parity.

## Prohibited Parallel Paths

Do not restore or introduce:

- a seven-step `SystemLauncher` architecture;
- `aiLaunchService` or `ai-code-assistant` as Launcher generation authority;
- deleted `siteGenerator` or `templateFamilies` generation guidance;
- Lane B page-body authorship or Lane B authority for new snapshots;
- direct VFS writes outside `commitMutation` / `VFSCommitService`;
- direct snapshot mutation, alternate revision stores, or post-seal mutation;
- Preview or Playground fallback authorship;
- theme ownership outside Stage 4b;
- caller-supplied identity, readiness, capability, price, or tenant authority;
- vertical-specific generators, VFS writers, preview owners, or snapshot owners;
- arbitrary intents or runtime actions outside canonical registries;
- removal of compatibility behavior before persisted restore tests pass.

When an architectural conflict appears, resolve ownership at the canonical
boundary instead of adding another service, fallback, or registry.
