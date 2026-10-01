# Unison Milestone — App Builder Canonical Substitution

**Date:** September 30, 2026  
**Status:** Canonical architecture migration plan  
**Scope:** Launcher Wizard → Unison App Builder → canonical candidate/commit → Web Builder  
**Primary decision:** Replace the Launcher Wizard's internal website-generation implementation with a first-class **Unison App Builder**. Preserve deterministic planning, design contracts, registries, runtime contracts, candidate validation, VFS revisioning, preview, publish, and backend authority. Retire the model in which the Wizard first compiles a complete deterministic website and AI subsequently rewrites it page by page.

---

## 0. Executive directive

Unison must have **one application-authoring authority**.

The target rule is:

> **Deterministic contracts. Generative implementation. Canonical validation. One accepted VFS.**

The Launcher Wizard is a selection and intent-acquisition surface. It must not own a second website-building engine. The canonical platform decides what the application must contain and which contracts it must satisfy. The **Unison App Builder** authors the application implementation. Canonical gates decide whether the authored candidate can become a revision. The Web Builder edits that same revision through the same App Builder.

The App Builder is **Unison-owned**. Foundation models may be external providers, but provider APIs are infrastructure behind Unison's orchestration and must never become Unison's application authority.

### Final ownership model

```text
LauncherWizard       = DEFINE USER INTENT
Canonical Platform   = DEFINE APPLICATION CONTRACTS
Unison Design System = DEFINE DESIGN VOCABULARY + QUALITY FLOOR
Unison App Builder   = AUTHOR THE APPLICATION
AI Provider          = SUPPLY MODEL INTELLIGENCE
Candidate Gates      = VERIFY THE CANDIDATE
VFS Commit Service   = PROMOTE ONE LEGAL REVISION
SiteBundleSnapshot   = RECORD ACCEPTED CANONICAL STATE
Runtime              = EXECUTE BUSINESS CAPABILITIES
Web Builder          = EDIT THE SAME APPLICATION
```

This milestone does **not** add another generation lane. It replaces the old website-authoring responsibility currently embedded in canonical launch compilation.

---

# 1. Why this milestone exists

The current repository still expresses two application-authoring phases during launch:

```text
LauncherWizard
  -> launchOrchestrator
  -> canonicalPipeline / compilePlayground
  -> Stage 4b
  -> deterministic page VFS
  -> preflight
  -> canonical commit
  -> siteAuthoringOrchestrator
  -> AI Composer rewrites pages
  -> persistAiCommit per accepted page
  -> Builder handoff
```

Observed current source reinforces this split:

- `src/platform/core/canonicalPipeline.ts` still invokes `compilePlayground(...)` and produces page-bearing VFS.
- `src/services/launch/launchOrchestrator.ts` performs the seed/Stage 4b compile, preflight, and initial canonical commit before its `author` stage.
- The same `launchOrchestrator.ts` then calls `authorSitePages(...)` after that deterministic commit.
- `src/services/launch/siteAuthoringOrchestrator.ts` describes itself as AI authoring "on top of the committed deterministic substrate" and retains `kept-baseline` behavior.
- `src/services/builder/aiRepairLoop.ts` already provides the beginnings of a reusable generation → candidate → repair workflow shared by launch and Builder edits.
- `src/services/vfsCommitService.ts` already represents the single legal writer and canonical revision boundary.

This means Unison currently has a **website implementation first** and an **AI-authored implementation second**. Even with source-preservation guards, this creates unnecessary authority tension.

### Architectural consequence

The long-term fix is not another merge rule.

The long-term fix is to stop generating the same application twice.

---

# 2. New canonical launch architecture

## 2.1 Target flow

```text
LauncherWizard
      │
      │ Wizard selections / prompt / style / goals
      ▼
Launch Planning
      │
      ├── industry
      ├── business/system type
      ├── requested pages
      ├── page roles + routes
      ├── canonical intents
      ├── capabilities
      ├── business bindings
      ├── design seed
      ├── Theme Family / tokens
      ├── Art Direction
      ├── experience requirements
      └── allowed design vocabulary
      │
      ▼
AppBuildContract
      │
      ▼
┌─────────────────────────────────────────┐
│          UNISON APP BUILDER             │
│                                         │
│  application planning                   │
│  AI orchestration                       │
│  source/design knowledge                │
│  registry + portable-recipe context     │
│  page composition intelligence          │
│  React/TSX authorship                    │
│  responsive + interaction authorship    │
│  repair / dependency closure            │
└──────────────────────┬──────────────────┘
                       │
                       ▼
              Candidate Application VFS
                       │
                       ▼
              Unison Candidate Gateway
                       │
           syntax / imports / protected paths
           route closure / intent contracts
           dependency policy / visual gates
           runtime capability contracts
                       │
                       ▼
              canonical infrastructure merge
                       │
         router / index.css / .unison metadata
                       │
                       ▼
                  commitMutation()
                       │
                       ▼
                SiteBundleSnapshot
                       │
                       ▼
              Preview / Builder / Publish
```

## 2.2 The critical behavioral change

The first accepted project revision must already be the App Builder-authored application.

### Retire

```text
revision 1 = deterministic baseline website
revision 2+ = AI replacement pages
```

### Replace with

```text
build contract
   -> App Builder candidate
   -> gates / repair
   -> one initial accepted application revision
```

Normal repair attempts are candidate operations. They do not become canonical revisions until accepted.

---

# 3. What the App Builder substitutes

The App Builder substitutes the **creative application-materialization responsibility** currently performed by the Wizard/canonical compiler.

It should own generation of authored application surfaces such as:

```text
/src/pages/**
/src/project-components/**
/src/components/generated/**
/src/features/generated/**
/src/hooks/generated/**       when allowed by policy
/src/lib/generated/**         when allowed by policy
project-local data/presentation modules
page-local styles when permitted
```

It owns decisions such as:

- page composition;
- information hierarchy;
- section order;
- layout geometry;
- visual rhythm;
- page-specific components;
- reuse vs extension of registered primitives;
- copy and content hierarchy;
- responsive composition;
- supported interactions and motion;
- project-local React component extraction;
- cross-page visual coherence.

The old deterministic generator must no longer independently produce authoritative page bodies for fresh Launcher builds.

---

# 4. What the App Builder does **not** substitute

The following remain canonical Unison authority and must not be delegated to free-form model generation.

## 4.1 Wizard intent

`LauncherWizard.tsx` remains a selection-only UI. It gathers user decisions and calls `runLaunchPipeline`. It does not touch VFS.

## 4.2 Canonical planning

Keep deterministic resolution of:

- industry/system identity;
- route and page topology;
- page roles;
- capabilities;
- intents;
- business-data bindings;
- business runtime requirements;
- publish requirements;
- dependency policy;
- approved experience capabilities;
- theme identity;
- design seed;
- Art Direction identity;
- design/runtime contracts.

## 4.3 Protected infrastructure

Retain canonical ownership of infrastructure such as:

```text
/src/main.tsx
/src/App.tsx or canonical router output
/src/index.css and canonical theme-token layer
/.unison/**
canonical runtime manifests
canonical route metadata
capability / intent manifests
publish metadata
```

Exact protected-path policy should stay centralized rather than duplicated in prompts.

## 4.4 Canonical commit and revision state

`commitMutation()` remains the only legal writer.

The App Builder proposes candidates. It does not bypass:

- candidate gates;
- preflight;
- source ownership rules;
- revision identity;
- snapshot sealing;
- business capability validation;
- publish readiness.

## 4.5 Business runtime

The App Builder may author a UI surface that emits or binds canonical intents such as `booking.create`, but it must not invent a parallel booking system, CRM schema, auth model, or Supabase contract.

---

# 5. Stage 4b after substitution

Stage 4b survives, but its responsibility is narrowed and clarified.

## 5.1 Keep

Stage 4b may deterministically resolve or emit:

- Theme Family identity;
- canonical design tokens;
- canonical `/src/index.css` token layer;
- Art Direction metadata;
- design intervention envelope;
- generated UI foundation inventory/context;
- experience capabilities;
- token and typography constraints;
- design-contract fingerprints.

## 5.2 Remove from Stage 4b authority

Stage 4b must not independently compose or regenerate application page bodies after App Builder authorship.

The durable rule is already directionally present in current source comments:

> **Stage 4b is an art-direction skin, never a re-composer.**

This milestone makes that statement structurally true rather than relying on preservation logic after a full site compile.

## 5.3 Order

Recommended target ordering:

```text
Wizard selections
  -> deterministic launch plan
  -> resolve Theme / Art Direction / UI foundation contracts
  -> produce AppBuildContract
  -> App Builder authors candidate VFS
  -> canonical infrastructure projection + Stage 4b token artifacts
  -> candidate/preflight gates
  -> canonical commit
```

Theme/context resolution may occur before generation so the App Builder can consume it. Final canonical token files are still verified at the acceptance boundary.

---

# 6. Registries after substitution

Do **not** remove the registry expansion work.

The registry changes roles from **template assembler** to **design language and executable knowledge**.

## Previous tendency

```text
Registry variant
  -> deterministic selector
  -> compiler materializes section
  -> page assembled from selected implementations
```

## Target model

```text
Registry + Art Direction + portable recipes + component source
  -> bounded App Builder knowledge
  -> AI reasons about composition
  -> reuse / adapt / combine / extend
  -> project-local React implementation
```

### Registry responsibilities that remain valuable

- certified executable primitives;
- component families;
- implementation source locations;
- props and slots;
- supported states;
- visual signatures;
- motion/experience capabilities;
- artifact contracts;
- business intent bindings;
- asset compatibility;
- accessibility posture;
- dependency requirements;
- proven section recipes;
- industry composition knowledge.

### New rule

> Registries are the **quality floor and preferred vocabulary**, not a ceiling on legal page composition.

Novel presentation structure does not require pre-registration. Novel **business/runtime capability** still requires a canonical contract.

---

# 7. Unison App Builder boundary

Create a first-class Unison-owned service boundary. Do not make `builderBrainClient` itself the App Builder.

Recommended structure:

```text
src/services/app-builder/
  appBuilderContracts.ts
  appBuilderOrchestrator.ts
  appBuilderContext.ts
  appBuilderCandidate.ts
  appBuilderFallback.ts
  UnisonAppBuilder.ts
```

Existing services should be reused or migrated underneath this boundary rather than duplicated.

## 7.1 Public service contract

Conceptual API:

```ts
export interface UnisonAppBuilder {
  generate(input: AppBuildRequest): Promise<AppBuildResult>;
  edit(input: AppEditRequest): Promise<AppEditResult>;
  addPage(input: AddPageRequest): Promise<AppEditResult>;
  redesign(input: RedesignRequest): Promise<AppEditResult>;
  repair(input: AppRepairRequest): Promise<AppEditResult>;
}
```

The first production milestone only needs `generate`, `edit`, and `repair`; add the broader surface incrementally.

## 7.2 Internal hierarchy

```text
UnisonAppBuilder
      ↓
AppBuilderOrchestrator
      ↓
context assembly
      ↓
site/application authoring engine
      ↓
AI orchestration
      ↓
builderBrainClient / ai-code-assistant
      ↓
foundation model provider
```

`builderBrainClient` remains transport/model access. It is not application authority.

---

# 8. AppBuildContract

Do not introduce a second persistent truth model.

`AppBuildContract` should be a **derived build request** assembled from existing canonical objects and discarded/reproducibly regenerated from the launch inputs/revision metadata. `SiteBundleSnapshot` remains the persistent accepted state after commit.

Conceptual contract:

```ts
interface AppBuildContract {
  protocolVersion: 'unison-app-builder/1';

  identity: {
    projectId: string;
    businessId: string;
    siteId: string;
    systemType: string;
  };

  topology: {
    pages: CanonicalPageSpec[];
    routes: CanonicalRouteSpec[];
    navigation: NavigationContract;
  };

  business: {
    industry: string;
    businessName: string;
    goals: string[];
    intents: string[];
    capabilities: string[];
    bindingGuide: unknown;
  };

  design: {
    seed: string;
    themePresetId: string;
    themeTokens: ThemeTokens;
    artDirection: ResolvedArtDirection;
    siteDesignContract: SiteDesignContract;
    uiFoundation: unknown;
    registryContext: WizardAggregatedRegistryContext;
    compositionPlan: SiteCompositionPlan;
  };

  runtime: {
    framework: 'react-vite';
    language: 'typescript';
    styling: 'tailwind';
    protectedPaths: string[];
    approvedDependencies: string[];
    approvedExperienceCapabilities: string[];
  };
}
```

Prefer deriving this from existing contract types instead of copying their fields into a permanently independent schema. Where practical, reference versioned existing contracts.

---

# 9. Application-level orchestration

The App Builder must understand a **site/application**, not isolated unrelated pages.

Retain the strongest ideas already present in `siteAuthoringOrchestrator.ts`:

- homepage-first visual language establishment;
- site composition planning;
- visual memory;
- redundancy detection;
- cross-page page-role differentiation;
- bounded source knowledge;
- repair loops;
- serialized accepted state.

But elevate them from "rewrite the baseline" to "author the application candidate."

## Recommended orchestration

```text
AppBuildContract
      ↓
Application Architecture Plan
      ├── shared shell posture
      ├── cross-page design language
      ├── shared project components
      ├── page responsibilities
      ├── visual diversity budget
      └── dependency plan
      ↓
Home authoring
      ↓
establish HomepageVisualLanguage
      ↓
remaining page authoring
      ↓
site-wide closure pass
      ├── import graph
      ├── route/navigation coherence
      ├── repeated-composition detection
      ├── design affinity
      └── capability/intent closure
      ↓
Candidate Application VFS
```

Page-level generation may remain internally parallelized, but the App Builder should expose one application-generation operation to the Launcher.

---

# 10. Candidate and repair semantics

Preserve the September 29 convergence work.

The correct model remains:

```text
AI/model output
  -> candidate file operations
  -> isolated candidate
  -> scope/protected-file checks
  -> syntax/import/dependency checks
  -> canonical contract gates
  -> targeted repair
  -> accepted candidate
  -> commitMutation
```

## 10.1 Do not commit every successful page during initial generation

The existing page-by-page commits were useful when improving a deterministic baseline incrementally. Once App Builder owns initial authorship, prefer one **initial application transaction** after site-wide closure.

Internally, the App Builder may checkpoint ephemeral generation state for recovery, but those checkpoints are not canonical `site_revisions` unless explicitly promoted.

This reduces:

- unnecessary revision churn;
- half-authored canonical sites;
- cross-page base-revision races;
- downstream projection during incomplete generation.

## 10.2 Builder edits remain smaller transactions

After launch, `edit()` operations should continue to promote accepted targeted patches as normal revisions.

---

# 11. Deterministic fallback policy

Completely substituting the old Wizard website builder does **not** require making launch reliability depend on a single model response.

However, fallback must not resurrect a second Wizard-owned builder.

### Wrong

```text
App Builder unavailable
  -> call old canonical website generator
```

### Correct

```text
UnisonAppBuilder.generate()
  -> AI strategy
  -> if provider unavailable / policy requires fallback
       use App Builder deterministic authoring strategy
       built from the same AppBuildContract + registries
  -> same candidate gateway
  -> same canonical commit
```

Therefore deterministic generation, if retained, becomes an **internal App Builder strategy**, not an independent launch authority.

The fallback can initially be limited to a smaller production-safe composition surface. The architecture is still singular because all generation enters through `UnisonAppBuilder.generate()`.

---

# 12. Current-to-target code migration

## 12.1 `LauncherWizard.tsx`

**Keep:** selection-only role and `runLaunchPipeline` handoff.  
**Change:** wording/comments that say the orchestrator "owns deterministic generation" should evolve to "owns launch planning and App Builder orchestration."  
**Do not add:** direct model calls, VFS mutation, or App Builder implementation logic.

## 12.2 `launchOrchestrator.ts`

Current launch stages include a deterministic site compile/commit followed by an AI author stage.

Target orchestration:

```text
plan
  -> design-contract / build-contract resolution
  -> app-build
  -> preflight
  -> commit
  -> handoff
```

Remove the semantic distinction between:

```text
commit deterministic site
then author AI pages
```

The App Builder generation must occur **before the initial canonical commit**.

Also remove stale contradictory comments such as "AI page authorship is retired" while the same module invokes `authorSitePages`.

## 12.3 `canonicalPipeline.ts`

Split its responsibilities conceptually:

### Keep canonical

- topology derivation;
- route contracts;
- theme-token resolution;
- runtime metadata;
- UI foundation metadata;
- page registry contracts;
- validation helpers;
- final canonical infrastructure projection;
- snapshot sealing support.

### Retire for fresh App Builder launch

- using `compilePlayground()` as the authoritative creative page-body generator before App Builder authorship.

Do not delete `compilePlayground()` immediately if legacy imports/recompile flows still depend on it. Remove it from **fresh Launcher generation authority** first; migrate legacy callers separately.

## 12.4 `siteAuthoringOrchestrator.ts`

Evolve into an App Builder internal engine.

Recommended transition:

```text
src/services/launch/siteAuthoringOrchestrator.ts
            ↓
app-builder application authoring module
```

Retain:

- homepage-first logic;
- composition plan;
- visual memory;
- source knowledge;
- AI brief construction;
- redundancy repair.

Remove assumptions that:

- a committed deterministic page always exists;
- failure means `kept-baseline`;
- each accepted initial page must become a canonical revision immediately.

Replace failure outcome semantics with candidate/app-build states such as:

```text
authored
repaired
generated-fallback
failed
aborted
```

## 12.5 `aiRepairLoop.ts`

Keep and generalize.

It already has the desired shape: model → structured response → candidate gates → diagnostics → repair.

Change naming/contracts over time from Wizard-specific `site_page_author` toward App Builder tasks without breaking existing Builder edit behavior.

Potential modes:

```text
app_generate_page
app_repair_page
app_edit_source
app_generate_shared
app_closure_repair
```

Do not create a second repair stack.

## 12.6 `builderBrainClient.ts`

Keep as model transport/provider client.

The App Builder calls it indirectly through orchestration. Launcher and Web Builder should eventually depend on `UnisonAppBuilder`, not treat `builderBrainClient` as the product-level builder API.

## 12.7 `vfsCommitService.ts`

Keep as sole legal writer.

Add/retain support for an initial App Builder transaction that:

1. starts from canonical build infrastructure rather than an already-committed baseline website;
2. receives the accepted authored candidate;
3. projects protected canonical outputs;
4. validates source preservation and ownership;
5. seals snapshot;
6. persists revision 1.

## 12.8 `aiCandidateGates` / `aiApplyGate`

Retain the candidate-first contract. Rename only when useful; do not duplicate.

The same candidate gateway must support:

- launch generation;
- AI Builder edits;
- WYSIWYG source edits;
- App Builder repairs.

## 12.9 `SiteBundleSnapshot`

Keep as the canonical accepted application state.

Do **not** seal a final launch snapshot that claims authoritative page bodies before App Builder authorship is accepted. The canonical snapshot used by Preview/Builder/Publish should represent the same accepted VFS hash.

---

# 13. Documentation reconciliation

This milestone changes the interpretation of several recent plans. Do not delete their valuable implementation work; update their authority language.

## 13.1 `docs/milestones/UNISON_AI_AUTHORED_CONVERGENCE_MILESTONE_2026-09-29.md`

### Preserve

- AI as first-class source author;
- authored-source preservation invariant;
- ownership/provenance ledger;
- candidate-to-revision protocol;
- shared design knowledge;
- registry as quality floor rather than whitelist;
- source lookup/context completeness;
- Builder/Wizard convergence;
- cross-industry proof requirements.

### Replace

Current language that says the compiler provides a **baseline website** and valid AI page bodies must survive later recompilation.

New wording:

> The canonical platform provides an application build contract and protected runtime infrastructure. The Unison App Builder authors the initial application VFS. Canonical compilation may reconcile protected infrastructure and validate authored source but must not independently generate a competing fresh-launch page implementation.

Also remove the stale instruction to inspect active `SystemLauncher` call sites. `LauncherWizard` is the active selection surface.

## 13.2 `.lovable/plan/ai-authoring-inside-the-wizard-launch-milestone-3-6-8-13-17-2026-09-27.md`

This plan is **superseded for initial launch sequencing**.

### Retire

```text
plan + Stage 4b deterministic substrate
-> commit revision 1 baseline
-> author page-by-page
-> failed page keeps baseline
```

### Preserve

- shared repair loop;
- structured AI responses;
- protected-path refusal;
- shared Builder edit path;
- homepage-first/page-context concepts;
- bounded repair attempts;
- candidate validation.

### New sequence

```text
plan + design contracts
-> AppBuildContract
-> App Builder authors candidate application
-> targeted repairs
-> site-wide closure
-> one initial canonical commit
-> Builder handoff
```

## 13.3 `docs/UNISON_REGISTRY_VISUAL_COMPOSITION_CANONICAL_LAUNCH_PLAN.md`

### Preserve

Nearly all registry, UI foundation, artifact, asset, interaction, visual-quality, and WYSIWYG expansion work remains relevant.

### Revise authority statement

Replace language equivalent to:

> Stage 4b owns deterministic baseline and Lane B may author candidate page-body enrichments.

with:

> Canonical planning owns topology, contracts, tokens and runtime constraints. The Unison App Builder owns fresh-launch application authorship and consumes certified registry/design context. Stage 4b owns theme/art-direction projection, not page composition. Canonical candidate gates and commit remain final acceptance authority.

### Revise milestone exit conditions

Old examples such as "Stage 4b can create a premium reference-quality hero without Lane B" should no longer be the core production target. The target becomes:

> The App Builder can author a premium reference-quality hero using certified Unison vocabulary, with deterministic fallback implemented inside the App Builder where required.

## 13.4 `docs/UNISON_GUIDEBOOK_21ST_CANONICAL_CONVERGENCE_PLAN_V3.md`

### Preserve

- authority hierarchy;
- certified-source/promoted implementation rules;
- modern validator work;
- Registry Context v2;
- props/slots;
- Builder context migration;
- generated UI foundation expansion;
- Art Direction curation;
- visual quality loop;
- deletion and migration discipline.

### Revise

The old two-AI-layer framing of "composition planner before Stage 4b" plus "Lane B enrichment after Stage 4b" should be simplified into App Builder orchestration. Deterministic planning may still create a `SiteCompositionPlan`, but creative source authorship belongs to App Builder, not a post-compile enrichment lane.

Any remaining `SystemLauncher` terminology should be converted to `LauncherWizard` / launch orchestration where the active code has already migrated.

## 13.5 `docs/milestones/AI_AUTHORED_CONVERGENCE_IMPLEMENTATION.md`

Preserve it as an implementation/evidence ledger for source authority and commit safety, but change its end target from "protect AI output from deterministic recompilation" to the stronger invariant:

> Fresh-launch authored files originate from App Builder; no independent canonical page generator is allowed to produce a competing source set after App Builder acceptance.

## 13.6 `.lovable/plan/cross-industry-page-composition-intelligence-slice-1-2026-09-29.md`

Keep this plan. Move its planner logically under App Builder context assembly.

Target:

```text
Industry + page roles
  -> IndustryPageCompositionProfile
  -> SiteCompositionPlan
  -> AppBuildContract
  -> App Builder authoring
  -> SiteVisualMemory / redundancy gates
```

No separate industry engines are required.

## 13.7 `.lovable/plan/wizard-progressive-redesign-2026-09-29.md`

This UI plan remains valid and largely unaffected.

Change only language that implies `runLaunchPipeline` owns deterministic **site generation**. It owns orchestration of planning, App Builder generation, gates, commit and handoff.

## 13.8 `docs/ARCHITECTURE.md`, `docs/PREVIEW_RUNTIME_ARCHITECTURE.md`, `docs/BUILD_TO_CANVAS_WORKFLOW.md`, integration docs

Remove stale active references to `SystemLauncher.tsx` where they describe the current runtime. Historical references may remain only when clearly labeled historical.

The current active launcher should be documented as:

```text
LauncherWizard -> runLaunchPipeline -> launchOrchestrator
```

---

# 14. Revised authority hierarchy

Use this as the canonical documentation rule going forward.

| Layer | Owns | Must not own |
|---|---|---|
| LauncherWizard | User selections, prompt, goals, style choices, preview/review UI | VFS authorship, direct model calls |
| Launch planning | Topology, page roles, capabilities, intents, business/runtime contracts | Creative page implementation |
| Theme / Stage 4b | Theme tokens, canonical CSS projection, Art Direction metadata, design envelope | Page recomposition |
| Registry / design knowledge | Certified executable vocabulary, source context, design guidance | Canonical page order or VFS writes |
| Unison App Builder | Fresh application source authorship, composition, project components, generation/repair | Bypassing protected contracts or commits |
| Model provider | Model inference | Product authority, direct persistence |
| Candidate gateway | Validation, repair diagnostics, protected paths, closure | Product UI |
| VFS Commit Service | Legal promotion of accepted mutation/revision | Creative authorship |
| SiteBundleSnapshot | Accepted canonical project state | Generation strategy |
| Web Builder | Interactive authoring surface over canonical project | Independent source of truth |
| Business Runtime | Functional intent execution and backend semantics | Unconstrained AI schema generation |

---

# 15. Implementation milestones

## M0 — Documentation and authority freeze

**Goal:** Prevent coding agents from implementing contradictory models during the migration.

Actions:

1. Add this milestone to `docs/milestones/` as the current authority for fresh-launch authorship.
2. Add a short supersession banner to the September 27 baseline-first AI authoring plan.
3. Add a revision note to the September 29 AI-authored convergence milestone.
4. Fix stale `SystemLauncher` references in active architecture docs.
5. Fix the contradictory `launchOrchestrator.ts` header claiming AI page authorship is retired.
6. Record in `AGENTS.md`:
   - Launcher Wizard is selection-only;
   - App Builder is the sole fresh-launch application author;
   - canonical compiler owns contracts/infrastructure, not a second page implementation;
   - `commitMutation` remains the only legal writer.

**Exit gate:** A repository-wide documentation search yields no active guidance that instructs new launch work to build a deterministic website first and then AI-rewrite it.

---

## M1 — Define App Builder contracts without changing runtime behavior

**Goal:** Introduce the service boundary safely.

Actions:

1. Create `src/services/app-builder/appBuilderContracts.ts`.
2. Define `AppBuildRequest`, `AppBuildContract`, `AppBuildResult`, `AppEditRequest` and candidate status types.
3. Implement `buildAppBuildContract(...)` using existing canonical plan/design/runtime objects.
4. Do not duplicate page registry, design contract, registry context or intent systems.
5. Add contract versioning and serialization tests.

**Exit gate:** A current Wizard launch can produce a complete AppBuildContract whose topology, design identity, runtime requirements and registry context match the existing canonical launch data.

---

## M2 — Wrap existing AI authoring behind `UnisonAppBuilder`

**Goal:** Establish one product-level authoring API before moving ownership.

Actions:

1. Create `UnisonAppBuilder.generate(...)` and `.edit(...)`.
2. Initially delegate generation internally to adapted `siteAuthoringOrchestrator`/`aiRepairLoop` behavior.
3. Keep `builderBrainClient` as provider transport.
4. Route Builder AI edits through the same App Builder boundary where feasible.
5. Preserve existing candidate gates.

**Exit gate:** Launcher and Builder can invoke the same App Builder service contract even though fresh launch still temporarily uses the old sequencing behind a feature flag.

---

## M3 — Add candidate-only full-site generation

**Goal:** Let App Builder generate a complete application without canonical page commits during generation.

Actions:

1. Change initial authoring orchestration from per-page canonical commits to an isolated candidate workspace.
2. Preserve homepage-first design language and site visual memory.
3. Allow authored companion modules beyond `/src/pages/*` within legal source scope.
4. Run import/module closure after each page and site-wide at completion.
5. Add a final site-wide coherence/closure repair pass.
6. Return `AppBuildResult.candidateFiles` plus provenance and diagnostics.

**Exit gate:** A multi-page site can be generated, repaired and validated entirely as a candidate before creating its first project revision.

---

## M4 — Split canonical planning from deterministic page materialization

**Goal:** Stop fresh Wizard launches from creating the competing baseline website.

Actions:

1. Introduce/refactor a plan-only canonical launch path using existing topology/contracts.
2. Keep deterministic infrastructure generation required by runtime.
3. Bypass `compilePlayground()` page-body materialization for fresh App Builder launches.
4. Do not delete `compilePlayground()` until all non-launch consumers are audited.
5. Ensure Stage 4b/theme resolution can produce the build context and protected theme artifacts without requiring finished page bodies.

**Exit gate:** A fresh Wizard launch reaches App Builder with canonical topology/design/runtime contracts but without a pre-authored deterministic page implementation.

---

## M5 — Make App Builder the fresh-launch authoring authority

**Goal:** Complete the substitution.

Target `launchOrchestrator` stages:

```text
plan
  -> contract
  -> app-build
  -> preflight
  -> commit
  -> handoff
```

Actions:

1. Move App Builder generation before initial canonical commit.
2. Merge only protected canonical infrastructure into the accepted candidate.
3. Run full preflight/readiness on the integrated candidate.
4. Call `commitMutation()` once for revision 1.
5. Seal `SiteBundleSnapshot` from the exact accepted VFS.
6. Hand Builder/Preview the same revision and VFS hash.
7. Remove `kept-baseline` launch semantics.

**Exit gate:** There is no current-launch code path in which the Wizard commits a fully composed website and then AI replaces it.

---

## M6 — Internalize deterministic fallback

**Goal:** Preserve launch reliability without preserving parallel architecture.

Actions:

1. Move any required deterministic composition fallback under `UnisonAppBuilder`.
2. Make fallback consume the same AppBuildContract.
3. Return the same candidate/result contract as AI strategy.
4. Pass fallback output through the same candidate gateway and commit path.
5. Remove fresh-launch fallback calls to the old Wizard site generator.

**Exit gate:** Provider outage can still produce the agreed safe fallback experience, but no caller outside App Builder needs to know how it was authored.

---

## M7 — Builder/WYSIWYG convergence

**Goal:** Use the same authoring authority throughout project life.

Actions:

1. Route AI Builder source edits through `UnisonAppBuilder.edit()`.
2. Route WYSIWYG structural source changes through the same candidate/commit contract.
3. Provide source selection, design knowledge, visual identity and revision context consistently.
4. Preserve direct deterministic property/token edits where no generative authorship is needed; those still use the legal VFS commit path.
5. Add `addPage` and `redesign` operations only after `generate/edit/repair` are stable.

**Exit gate:** Wizard generation and post-launch AI editing no longer use distinct source-authoring architectures.

---

## M8 — Legacy erasure

**Goal:** Remove obsolete dual-authority code only after proof.

Delete or retire only after reference audits prove safe:

- fresh-launch deterministic page-generation branch;
- baseline-first author-stage assumptions;
- `kept-baseline` launch behavior;
- stale SystemLauncher active documentation;
- duplicate Lane A/Lane B language that no longer maps to current authority;
- merge logic that exists solely to reconcile baseline pages with later AI replacements.

Do **not** delete:

- registries;
- page topology;
- design contracts;
- Stage 4b token ownership;
- UI foundation;
- candidate gates;
- source-preservation/provenance logic;
- VFS commit service;
- snapshot model;
- business runtime contracts;
- legacy compatibility required to open existing saved projects.

**Exit gate:** Fresh launch has one application authoring authority in both code and documentation.

---

# 16. Migration safety for existing projects

Existing projects may contain deterministic baseline provenance, AI-authored revisions, user edits, or older snapshot shapes.

Rules:

1. Do not regenerate existing project pages merely because the new App Builder architecture exists.
2. Hydrate the accepted revision as authoritative source.
3. App Builder edits start from that revision and preserve authored source according to the September 29 source-preservation invariant.
4. Legacy projects may retain historical provenance labels; migration should not rewrite history.
5. New App Builder metadata should be additive.
6. Only fresh launches switch to the new initial-authority path once the feature gate is enabled.
7. Provide rollback to the old launch path during staged rollout, but do not maintain both as permanent product architecture.

---

# 17. Provenance and source authority

The September 29 provenance work becomes more important, not less.

Each accepted file should be attributable to an origin such as:

```text
app-builder-ai
app-builder-fallback
user-edit
builder-ai-edit
canonical-infrastructure
import
```

Authority is revision-based, not "AI always wins."

A later App Builder response cannot overwrite a newer user revision merely because its author type is AI. Candidate application must verify base revision identity and explicit patch scope.

For fresh launch, the important rule is:

> App Builder-authored files are the original authored source of revision 1; canonical infrastructure projection may add or reconcile protected artifacts but may not silently replace those authored files.

---

# 18. Validation contract

A fresh App Builder candidate must not become revision 1 unless the required gates pass.

Minimum launch gates:

1. contract/schema validation;
2. protected-path validation;
3. TS/TSX syntax parse;
4. relative import closure;
5. approved dependency validation;
6. route/page registry closure;
7. shared chrome/navigation coherence;
8. canonical intent surface validation;
9. capability/runtime contract validation;
10. theme/global-token ownership validation;
11. preview artifact/runtime compatibility gate;
12. visual-affinity/redundancy checks where blocking policy requires them;
13. snapshot seal completeness;
14. exact accepted-VFS hash continuity into Builder/Preview/Publish.

Do not silently repair source through unrelated canonical compilers after these gates. Repairs that change authored source are explicit candidate operations with provenance.

---

# 19. Test matrix

## Architecture

- LauncherWizard never writes VFS.
- Fresh launch calls App Builder before initial project commit.
- Fresh launch does not create a deterministic composed website revision first.
- `commitMutation` remains sole legal writer.
- SiteBundleSnapshot matches committed VFS hash.

## App Builder generation

- multi-page Salon site;
- multi-page Restaurant site using same orchestration engine;
- homepage establishes language inherited without copy/layout duplication;
- secondary pages receive distinct composition signatures;
- generated companion component imports resolve;
- legal project-local components survive candidate normalization;
- protected-path write is rejected/redirected;
- requested dependency outside allow-list is rejected;
- targeted repair fixes a failing file without discarding valid files.

## Provider failure

- credits/denied/rate-limit/provider failure produces explicit App Builder strategy outcome;
- fallback, when enabled, runs inside App Builder;
- old Wizard website generator is not directly invoked;
- failed generation never leaves a half-committed revision 1.

## Stage 4b

- selected theme tokens reach App Builder context;
- final `/src/index.css` exactly reflects canonical token authority;
- Stage 4b never rewrites accepted App Builder page bodies;
- Art Direction identity in snapshot matches AppBuildContract.

## Builder continuity

- Builder opens exact revision 1 files;
- AI edit uses App Builder edit path;
- edit repair uses same candidate gateway;
- save/reopen preserves exact accepted source;
- theme-only edit does not regenerate page bodies;
- undo/restore uses revision semantics rather than regenerated source.

## Existing project compatibility

- pre-migration deterministic project opens unchanged;
- existing AI-authored project opens unchanged;
- user-created project-local components survive recompile/save;
- old snapshot is not rewritten until an explicit accepted mutation.

---

# 20. Definition of done

This milestone is complete only when all statements below are true.

```text
[ ] LauncherWizard is selection-only.
[ ] runLaunchPipeline no longer relies on a deterministic complete-site baseline before App Builder authorship.
[ ] Fresh launch produces an AppBuildContract from canonical planning.
[ ] UnisonAppBuilder is the sole fresh-launch application authoring authority.
[ ] Foundation-model provider access is hidden behind Unison orchestration.
[ ] Registries are passed as executable design knowledge, not treated as a mandatory page-template whitelist.
[ ] Stage 4b owns theme/art-direction contracts and cannot recompose authored pages.
[ ] Initial generation remains candidate-only until site-wide closure succeeds.
[ ] revision 1 contains the accepted App Builder application.
[ ] commitMutation remains the only legal canonical writer.
[ ] SiteBundleSnapshot, Preview, Builder and Publish consume the same accepted VFS identity.
[ ] Builder AI edits use the same App Builder/candidate architecture.
[ ] Deterministic fallback, if retained, exists inside App Builder only.
[ ] Fresh-launch dual-authority merge code is retired.
[ ] Existing saved projects remain source-preserving and backward compatible.
[ ] Active docs contain no current SystemLauncher authority claims.
[ ] Active docs no longer prescribe "baseline website first, AI rewrite second" for fresh launches.
```

---

# 21. Non-goals for this milestone

Do not use this migration as justification to simultaneously:

- rewrite the VFS format;
- create another snapshot system;
- replace Supabase;
- replace Vercel deployment;
- create per-industry App Builder engines;
- discard registries;
- discard deterministic page topology;
- make model output responsible for backend schema;
- implement unrestricted dependency installation;
- remove legacy project compatibility prematurely;
- add an unrelated canvas/editor architecture.

The milestone is an **authority consolidation**, not a platform rewrite.

---

# 22. Implementation prompt for coding agents

Use the following directive when handing this milestone to an implementation model:

> Implement the Unison App Builder canonical-substitution milestone incrementally. Do not create a parallel site generator, VFS, snapshot, registry, routing system, or commit path. `LauncherWizard` remains selection-only. Extract a first-class `UnisonAppBuilder` boundary from the existing `siteAuthoringOrchestrator`, `aiRepairLoop`, builder-brain transport, source-knowledge context, candidate gates and VFS commit infrastructure. The canonical platform continues to resolve topology, routes, capabilities, intents, business bindings, Theme/Art Direction, UI foundation context and protected runtime artifacts. For fresh launches, stop treating `compilePlayground()` output as an authoritative complete website that AI later rewrites. Instead derive an AppBuildContract, let App Builder author an isolated candidate application, run repair and site-wide closure, merge/verify compiler-owned infrastructure, and create the first canonical revision only after the final candidate passes required gates. `commitMutation()` remains the only legal writer and `SiteBundleSnapshot` remains the accepted state consumed by Preview, Builder and Publish. Preserve existing projects byte-for-byte unless an explicit accepted mutation changes them. Do not delete the old launch page-materialization path until references and rollback needs have been audited, but once the new path is proven, remove it from fresh-launch authority rather than maintaining permanent dual generation.

---

# 23. Recommended immediate implementation order

If only one sequence is followed, use this order:

```text
1. Documentation/authority correction
2. AppBuildContract
3. UnisonAppBuilder facade
4. Candidate-only full-site generation
5. Plan-only canonical fresh-launch path
6. App Builder before initial commit
7. Stage 4b final ownership cleanup
8. Internal App Builder fallback
9. Builder/WYSIWYG convergence
10. Legacy dual-authority erasure
```

Do **not** start by deleting `compilePlayground`, registries, Stage 4b, or source-preservation logic. First change who owns fresh-launch application implementation, prove the new path, then remove obsolete authority.

---

# 24. Final architectural rule

The enduring Unison architecture after this milestone is:

```text
                 ┌──────────────────┐
                 │ Launcher Wizard  │
                 │   user intent    │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │ Canonical Plan   │
                 │ contracts only   │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │ AppBuildContract │
                 └────────┬─────────┘
                          │
                          ▼
              ┌────────────────────────┐
              │  UNISON APP BUILDER    │
              │ one authoring authority│
              └────────────┬───────────┘
                           │
                           ▼
                 ┌──────────────────┐
                 │ Candidate Gates  │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │ commitMutation   │
                 │ single writer    │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │SiteBundleSnapshot│
                 │ accepted state   │
                 └────────┬─────────┘
                          │
             ┌────────────┼────────────┐
             ▼            ▼            ▼
          Preview      Web Builder    Publish
                          │
                          └── edits return to
                              Unison App Builder
```

> **The Wizard specifies the application. The App Builder authors it. The canonical platform governs it. The Builder edits the same source.**

That is the convergence target.

