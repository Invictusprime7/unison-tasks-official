# Deterministic AI Design Execution Plan

This plan operationalizes the Unison Deterministic AI Design Guidebook Version
1 against the current repository. It supersedes any plan that lets AI replace
Launcher page files, treats a registry count as implementation completion, or
allows Preview, Playground, imports, exports, or snapshots to develop separate
authorities.

## 1. Canonical Contract

The protected chain is:

```text
LauncherWizard
  -> runLaunchPipeline
  -> deterministic resolution
  -> canonical compiler
  -> Stage 4b
  -> canonical preflight
  -> commitMutation / VFSCommitService
  -> SiteBundleSnapshot and revision
  -> Live Preview and Playground
```

The following rules apply to every phase:

1. Audit the affected path before editing.
2. Implement one closure-sized batch at a time.
3. Keep topology, visual implementation, artifact semantics, theme, and commit
   authority separate.
4. Derive cross-registry projections; do not create duplicate registries.
5. Keep Stage 4b as the only global theme-token authority.
6. Keep `commitMutation` as the only accepted mutation boundary.
7. Require Registry -> Compiler -> VFS -> Snapshot -> Preview -> Playground ->
   canonical round-trip evidence for every accepted design asset.
8. Add regression and closure tests in the same change as implementation.
9. Stop on an architectural conflict instead of adding a parallel path.
10. Keep Launcher fully functional with AI disabled or unavailable.

## Recipe Acceptance Criteria

These eight dimensions are required for every new or expanded generated-site
recipe. Apply them to each supported industry/page-role combination, not just
to a component demo. Mark each dimension verified, failed, unverified, or not
applicable with a reason. An unverified requirement is not a passing gate.

| Dimension | Required behavior | Acceptance evidence |
| --- | --- | --- |
| Page composition | Industry-appropriate ordered sections, density and purpose; Home, Pricing, FAQ, Booking and Services have distinct compositions. Counts derive from ordered references. | Template/page-role fixtures assert exact source IDs, order and dedicated semantic content; rendered routes match the resolved composition. |
| Visual recipes | Typography, spacing, grids, imagery, navigation, cards, forms, overlays and responsive behavior follow the selected art direction. Stage 4b remains the only global token owner. | Generated CSS consumes semantic tokens; desktop, tablet and mobile screenshots show coherent hierarchy and no clipping or overlap. Theme changes preserve structure and bindings. |
| Interaction recipes | Mobile navigation, accordions, validation and loading/empty/error/success states work. Canonical intents and bindings remain intact. | Pointer and keyboard interaction tests plus generated-runtime checks; submit failures retain input, retries do not duplicate writes, and success follows confirmed completion. |
| Accessibility | Keyboard operation, visible focus, semantic headings, contrast, touch targets and reduced motion are supported. | Automated checks plus manual keyboard/focus review, 200% zoom, reduced-motion checks, WCAG AA contrast, and primary touch controls at least 44 CSS pixels where practical. |
| Content resilience | Long business names/descriptions, missing or failed images, variable prices and sparse catalogs remain usable without fabricated business data. | Stress fixtures at narrow widths, image-failure checks and empty/one/many-item states; no overlapping text or lost controls, and explicit binding hide policies remain respected. |
| Deterministic eligibility | Template, page role, theme, canonical capabilities and rendering environment constrain selection. Seed and explicit user choices survive edits. | Same inputs reproduce the same eligible choice; incompatible recipes reject with a reason; explicit choices take precedence; recommit/reload retains resolved IDs and seed. |
| Performance | Media dimensions prevent layout shifts; responsive images, font loading, JavaScript budgets and restrained animation keep the site usable. | Record generated compressed JS/CSS, media bytes and font requests against an approved per-recipe budget before rollout; measure representative routes with targets LCP <= 2.5s, INP <= 200ms and CLS <= 0.1. Lab results do not establish field performance. |
| Round-trip proof | Registry -> compiler -> sealed revision -> Preview -> Playground edit -> recommit -> reload preserves identity, content, implementation, slots, intents and bindings. | Real persisted revision recovery and browser execution with a structured edit; byte/identity checks at sealing, no fallback page authorship, no post-seal mutation. |

### Radix And StyleX Integration

- Use the existing canonical Radix facades for accessible behavior. StyleX
  authors recipe-local styles; it does not replace Stage 4b theme ownership.
- Compile approved StyleX sources ahead of time with the official Babel
  plugin. Emit portable JavaScript and extracted CSS through existing section
  emitters and the shared Stage 4b style bridge. No runtime CSS injection or
  arbitrary StyleX compilation in Preview is enabled.
- `npm run recipes:build` regenerates recipe assets; `npm run recipes:check`
  rejects stale output. Production builds must check freshness. Verify every
  dependency against generated Preview and publish environments, not merely
  against packages installed in the host application.
- This choice uses StyleX-styled React components, not the separate
  `styled-components` runtime or Radix Themes palette/reset system.
- Generated FAQ variants use precompiled StyleX; the disclosure variant uses
  Radix Accordion. All three generated navbar layouts now share a StyleX
  mobile menu using the canonical Radix Dialog facade, declared in registry
  dependency metadata. Links and CTA intent attributes survive emission.
- Navigation tests execute the compiled module with real Radix: opening,
  initial focus, Escape dismissal, focus restoration, link dismissal and
  desktop-breakpoint cleanup. The build normalizes bundled default exports
  through Babel's AST to satisfy existing Preview import checks.
- Recipe, variant and golden-launch suites pass 118 tests. Type checks,
  targeted integration lint and architecture guards pass. Production build
  passed before the final breakpoint-handler change, with chunk warnings.
  Isolated mobile DOM measurements show a 44px trigger and no panel overflow;
  the editor browser remained hidden, so pointer, keyboard and resize browser
  verification is incomplete. This fixture is not persisted Preview proof.
- Registry-renderer visual parity, full-navbar long-brand/page-offset checks,
  performance budgets and persisted edit/reload remain unverified. Next recipe
  families are forms and their states, then media, grids and industry-specific
  compositions. Do not certify unverified recipes as rollout-ready.

## 2. Current-State Baseline

### Verified foundations

- `LauncherWizard` delegates launch execution to `runLaunchPipeline`.
- `launchOrchestrator` owns deterministic planning, Stage 4b, preflight,
  canonical commit, and committed handoff.
- Generation seeds, Design Contract V2, resolved composition sidecars, registry
  signatures, zero-bypass certification, and mutation provenance exist.
- `designImplementationRegistry` is a derived view of Section and Variant
  registries rather than an independent visual inventory.
- Fourteen premium section families have at least three registered variants.
- Preview and Playground are hydrated from committed launch artifacts.
- The local Launcher does not call AI to author or replace page VFS.

### Open gaps that control sequencing

- `compositionToReactFileSet` still contains independent, hand-authored section
  module sources. Variant identity reaches page data, but registry implementation
  identity is not yet proven to own the module executed by Sandpack.
- `SectionVariant.renderJSX` is an extraction/swap adapter, not yet a canonical
  VFS module emitter contract.
- `logo-cloud`, `blog-preview`, and `before-after` are not yet certified as
  dedicated first-class families.
- New authority proofs identify `canonical-compiler` with version 2.0 and the
  golden fixture uses compiler output. The version 1.0 read adapter is
  fixture-tested, but persisted legacy restoration remains unverified.
- Design vocabulary is richer than the set of compiler-executable recipes.
- Static quality scoring does not prove browser rendering, responsiveness, or
  interaction behavior.
- Playground does not yet prove variant swap -> commit -> reload -> rehydrate
  identity preservation across the full canonical path.

## 3. Authority Model

| Authority | Owns | Must not own |
| --- | --- | --- |
| Site topology planner | Page existence and roles | Visual implementation |
| Template composition | Industry structure and family baseline | Runtime mutation policy |
| Section Registry | Semantic section family and default component | Industry or theme choice |
| Variant Registry | Concrete visual implementations | Page topology and business capabilities |
| Design Implementation Registry | Derived stable implementation IDs and metadata | A hand-maintained visual list |
| Artifact Registry | Business semantics, slots, intents, bindings, edit scope | Visual layout implementation |
| Component capabilities | Runtime and data requirements | Visual composition |
| Design vocabulary | Executable pattern candidates and recipes | A rendering path |
| Art-direction packs | Compatibility and `--ut-*` behavior profile | Page identity or palette ownership |
| Template Design Contract V2 | Resolved deterministic design identity | Theme CSS values |
| Stage 4b | Semantic theme and global tokens | Topology and artifact identity |
| VFSCommitService | Canonical mutation and revision boundary | Design selection |
| SiteBundleSnapshot | Sealed runtime truth | Post-seal mutation |
| Preview and Playground | Render and hydrate committed truth | Fallback authorship |

## 4. Phase Plan

### Phase 0 - Protect and truthfully version the canonical spine

**Objective:** Close the current deterministic Launcher correction before
expanding the compiler or inventory.

**Status:** In progress. Local authority migration, golden-fixture repairs, and
architecture instructions are verified. The full Vitest suite passed 1,119
tests across 141 files; type-check, targeted ESLint, four architecture lints,
production build, and 24 Edge tests passed. This does not establish browser
rendering, persisted legacy restoration, or Playground round-trip closure.
Remote `ai-code-assistant` version 341 is ACTIVE after deployment through the
standard Supabase CLI. All 39 fetched files exactly match the reviewed bundle;
only `taskClassifier.ts` and `orchestrator.ts` differ from v340, with 37 files
preserved (`contextBuilders.ts` already matched production). The tested
`shouldUseCompactContext: true` policy and custom authentication are unchanged.
An unauthenticated live POST returned 401; authenticated model execution was
not exercised by this deployment smoke test.

**Browser verification (2026-09-08 UTC):** Signed-in Booking & Services /
Book Appointments / Salon Premium / Editorial created project
`93d2c983-b8fb-414d-96dd-47d014771497`, draft
`822961fa-5959-404a-88a9-a30060dec45c`, committed revision
`e38ee53b-4678-480c-a9bf-76c007514a02`. Its persisted registry contains
`/`, `/about`, `/services`, `/pricing`, `/gallery`, `/booking`, `/contact`,
and `/faq`, plus canonical Playground state. Home rendered and reappeared
after reload. All-route rendering, implementation/artifact identity, mobile
quality, durable-source hydration, and structured edit/recommit remain unproven.
The seal has version 1.0 but lacks the new authority-proof fields; seal version
alone does not establish v2 authority propagation or legacy provenance.

The browser exposed a dropped Playground save input, now repaired in
`useTemplateFiles`, and a preview gate that ignored explicit runtime
incompatibility, now repaired in both `vfsCommitService` gate passes.
The two focused suites passed 20 tests; type-check, targeted ESLint, and the
canonical VFS writer guard passed. A fresh-module, empty-patch browser dry-run
against the committed revision now rejects after one repair attempt without
persisting a revision. The 1,119-test full-suite result above predates these
save/gate fixes. No registry assets or alternate VFS writers were added.

**Remaining save blockers:** Recompilation emits components importing
`/src/unison/publishedRuntime.ts` and
`/src/unison/generatedSiteRuntimeManifest.ts` without emitting those modules;
the canonical launch finalizer owns their generation. Preflight repairs also
change Contact and Booking page bytes after candidate snapshot projection.
The live save failed the database runtime-VFS/snapshot equality check.
Integrate canonical finalization before sealing; do not weaken equality or
preserve stale runtime bindings as a substitute. Reloaded Builder identity is
not hydrated for autosave, and Save-to-Projects displays success/dismisses the
dialog despite a failed content commit. That attempt created a verification
copy identity shell, not a verified saved revision. Booking remains preview-only
with production readiness blockers. Persisted legacy restoration and Playground
round-trip closure are still required. **Phase 0 DoD is not satisfied.**

**Work:**

- Corrected section loss before further AI work: `buildRoleComposition` now
  preserves the complete Home template composition, rather than filtering it
  through the default subpage pool. Tests compare ordered source identities
  across every registered template/theme pair, preserve explicit subpage pools
  and duplicates, and compare every selected golden route through compile,
  seal, and Preview preparation. Unbound catalog hydration now preserves
  authored sections; an actual binding's explicit hide policy still applies.
  Validation: 114 focused tests, type-check, targeted ESLint, pipeline-bypass
  and single-source-of-truth guards passed. Browser-only compilation (no cloud
  write) produced Salon/Editorial counts including chrome: Home 10, About 7,
  Services 6, Pricing 6, Gallery 6, Booking 7, Contact 6, FAQ 6; every page
  matched its sealed snapshot. The old persisted Home still has six sections,
  but its Services and Testimonials now appear after the hydration correction.
  A fresh persisted launch's DOM counts remain unverified. These counts predate
  the explicit Pricing/FAQ alternatives below and do not certify closure.
- Salon Premium now defines separate page-only Pricing and FAQ inventory with
  two ordered alternatives per role. Home stays unchanged at 10 sections;
  Pricing has 5/7 and FAQ 5/6 sections including chrome, derived from the lists.
  Resolution uses template, role, theme and the sealed design seed. Stable
  source/instance IDs and the chosen composition ID survive canonical
  Playground recompilation. Invalid references, duplicate identities and
  unregistered hero choices reject instead of silently falling back.
  Local generated-module browser checks rendered the 7-section Pricing and
  6-section FAQ alternatives, loaded banner media and exercised the FAQ
  accordion. Desktop/mobile screenshots captured; the existing centered
  navbar overlaps a long business name on mobile. This isolated mount did
  not save a revision or establish persisted Preview/Playground closure.
  Capability-based eligibility, all-alternative browser coverage and
  structured edit/recommit/reload remain open. No cross-industry expansion
  or AI enrichment is enabled by this work.
- Keep Stage 4b VFS as the direct Launcher preflight input.
- Preserve template-first industry resolution, authoritative Wizard selections,
  selected-page topology closure, and public business-profile sanitization.
- Keep `wizard-seed` compatibility-only; do not restore Launcher AI page calls.
- Replace stale Lane B page-authority metadata with a versioned
  `canonical-compiler` authority. Retain a read adapter while persisted v1
  snapshots may still exist.
- Rewrite the golden industry fixture so it uses the real deterministic launch
  path rather than fabricated Lane B page bodies.
- Correct stale comments and architecture instructions that describe the old
  seven-step Launcher, AI-generated VFS, or Lane B ownership.
- Reconcile the remote `ai-code-assistant` deployment with local code only after
  its compatibility behavior and callers are audited.

**Primary files:**

- `src/services/launch/launchOrchestrator.ts`
- `src/services/launch/launchRun.ts`
- `src/platform/core/snapshotSeal.ts`
- `src/services/canonicalLaunchVfs.ts`
- `src/test/launchOrchestratorCanonicalHandoff.test.ts`
- `src/test/goldenIndustryPipeline.test.ts`
- `src/test/artDirectionPacks.test.ts`
- `copilot-instructions.md`
- `supabase/functions/ai-code-assistant/*`

**Acceptance:**

- Focused Launcher, topology, Stage 4b, snapshot, and handoff tests pass.
- Full Vitest suite, type-check, ESLint, architecture lints, Edge tests, and
  production build pass.
- No Launcher source calls a model or consumes AI-authored page files.
- Authority sidecars truthfully identify the canonical compiler.
- Existing persisted authority format remains readable during migration.
- Remote deployment, if performed, matches reviewed local behavior.

**Removal gate:** Remove old Lane B authority writers and compatibility fields
only after repository caller audit and persisted-snapshot restore tests pass.

### Phase 1 - Compiler and Variant Registry convergence

**Objective:** Make the registered visual implementation the source of the VFS
module that Preview executes.

**Work:**

- Extend `SectionVariant` with a VFS-compatible emitter contract that returns a
  stable module identity, module source, imports, primitive dependencies, and
  required data attributes.
- Expose emitter and runtime metadata through the existing derived
  `designImplementationRegistry`.
- Resolve emitted modules by `implementationId` in
  `compositionToReactFileSet`.
- Keep `renderJSX` only as a migration adapter where necessary.
- Migrate Gallery first, then Testimonials. Do not migrate another family until
  each previous family passes full closure.
- Preserve page `SECTIONS`, resolved composition identity, imports, and paths.
- Replace literal palette utilities in migrated emitters with semantic classes
  and Stage 4b / `--ut-*` tokens.

**Primary files:**

- `src/sections/variants/types.ts`
- `src/sections/variants/registry.ts`
- `src/sections/variants/jsxTemplates.ts`
- `src/services/designImplementationRegistry.ts`
- `src/sections/compositionToFileSet.ts`
- `src/platform/core/resolvedComposition.ts`

**Tests:**

- Add `variantCompilerConvergence.test.ts`.
- Add `variantSemanticThemeCompliance.test.ts`.
- Extend `compositionVfsVariants.test.ts` and launch-to-Sandpack coverage.

**Acceptance:** For Gallery and Testimonials, selected `VariantId`, derived
`implementationId`, emitted module identity, `data-ut-variant`, resolved
composition, sealed snapshot, and Preview runtime output all agree.

**Removal gate:** Delete each corresponding hard-coded compiler visual branch
only after its registry emitter passes closure and fallback tests.

### Phase 2 - Close all 17 section families

**Objective:** Eliminate semantic placeholder substitution.

**Work:**

- Give `logo-cloud`, `blog-preview`, and `before-after` dedicated React
  components and at least three initial variants each.
- Add semantic-token-safe VFS emitters and primitive dependencies.
- Add artifacts, editable slots, intents, data sources, capabilities, and
  art-direction compatibility.
- Hydrate artifact and implementation identities separately in Playground.

**Tests:**

- Add `allSectionFamiliesFirstClass.test.ts`.
- Extend premium inventory, artifact crosswalk, compiler convergence, Preview,
  and Playground hydration coverage.

**Acceptance:** No family is exempted from premium coverage, no family resolves
through a cross-semantic placeholder, and all three pass the ten-gate closure
harness.

**Removal gate:** Remove placeholder mappings only after all three dedicated
families compile, render, hydrate, and round-trip.

### Phase 3 - Expand premium inventory and primitives

**Objective:** Grow toward 100+ production-quality implementations without
creating a second rendering system.

**Work order:**

1. Hero, gallery, testimonials, services, and CTA depth.
2. Navbar, pricing, contact, footer, and about depth.
3. Features, FAQ, team, stats, logo-cloud, blog-preview, and before-after depth.
4. Reusable layout, typography, surface, media, motion, navigation, experience,
   booking, and commerce primitives required by those variants.

Each batch must declare primitive dependencies, capability dependencies,
responsive behavior, reduced-motion behavior, runtime cost, stable identity,
and semantic token usage.

**Acceptance:** Every new implementation passes the closure harness and visual
snapshots on mobile and desktop before the next batch starts. Registry count
alone is never acceptance evidence.

### Phase 4 - Make design vocabulary executable

**Objective:** Convert descriptive design intelligence into deterministic legal
recipes consumed by the compiler.

**Work:**

- Extend or derive vocabulary metadata for compatible section types,
  implementation candidates, primitive recipe IDs, pack compatibility,
  experience budget, and fallback implementation.
- Make `experienceCapabilityResolver` return registered compiler-consumable
  candidates rather than Lane B prose.
- Keep `wizardDesignIntervention` as the deterministic record of legal choices,
  seed, pack, recipes, and budgets.
- Remove comments and behavior implying AI makes the final Launcher composition.

**Tests:**

- Add `designVocabularyClosure.test.ts`.
- Extend recipe executability, seed determinism, pack coverage, and runtime
  budget tests.

**Acceptance:** Every Launcher-eligible vocabulary entry resolves to an existing
implementation or primitive recipe, and the same seed reproduces the same
ordered legal candidates and final compiler choice.

### Phase 5 - Expand industry families and page archetypes

**Objective:** Add depth through compositions and compatibility envelopes rather
than new generators.

**Work:**

- Booking and services: spa/wellness, contractor/home service, and fitness.
- SaaS: enterprise, AI product, fintech, and creative SaaS.
- Agency: legal, real estate, creative studio, B2B service, contractor lead-gen.
- Portfolio: artist, motion/video, music, developer, creative director.
- Store: fashion editorial, beauty, product launch, catalog-heavy, lifestyle.
- Content: magazine, newsletter, creator, education, community.
- Add role-specific page archetypes while keeping topology as page owner.

**Acceptance:** Representative seeds per family produce legal, reproducible,
visually distinct compositions without page drift, missing bindings, or theme
source replacement.

### Phase 6 - Complete artifact and editor closure

**Objective:** Make every generated surface understandable and safely editable.

**Work:**

- Build a derived `ResolvedDesignArtifact` projection joining artifact, section,
  implementation, primitive, capability, data, intent, VFS emitter, export, and
  Playground metadata.
- Complete artifact coverage for all canonical section types.
- Preserve artifact identity and bindings across visual swaps.
- Add first-class booking/product/menu/newsletter/location surfaces only when
  they are real runtime contracts, not aliases.

**Tests:**

- Add `registryArtifactCrosswalk.test.ts`.
- Add binding and intent preservation tests for every operational swap.

**Acceptance:** Every implementation resolves one coherent artifact/editor
contract without duplicate hand-maintained maps.

### Phase 7 - Prove Playground design round trips

**Objective:** Make design edits canonical and reload-safe.

**Work:**

- Hydrate artifact, section, implementation/variant, slots, intents, bindings,
  primitive dependencies, and provenance from committed sidecars and attributes.
- Express swaps as structured design operations.
- Recompile and commit through the canonical mutation service.
- Patch Preview from the new committed revision and rehydrate Playground.

**Tests:**

- Add `playgroundDesignRoundTrip.test.ts`.
- Cover swap -> commit -> reload -> rehydrate, undo/history provenance, stale
  parent revision rejection, and binding preservation.

**Acceptance:** A registered swap survives reload with the same new identity and
cannot be lost by canonical recompilation.

### Phase 8 - Certify rendered visual quality

**Objective:** Replace source-only quality claims with real runtime evidence.

**Work:**

- Add a Launcher inventory matrix across systems, industries, seeds, packs, and
  representative routes.
- Run browser checks for blank output, route completeness, overflow, overlap,
  media loading, responsive layout, interactions, reduced motion, and canvas or
  WebGL fallbacks.
- Verify refresh/reopen loads the committed revision rather than navigation or
  session state.
- Keep static visual scoring advisory unless a check is objectively tied to
  compile/runtime safety.

**Tests:**

- Add `launcherInventoryMatrix.test.ts` and browser journeys.
- Extend `launchToSandpack`, Preview single-owner, golden pipeline, and export
  compatibility coverage.

**Acceptance:** The representative matrix renders every selected route in Live
Preview and after reload with no blank canvas, scaffold, placeholder, missing
import, fallback authoring, or incoherent mobile layout.

### Phase 9 - Add optional structured AI augmentation

**Entry condition:** Phases 1-8 are complete. Deterministic output is already
premium, executable, committed, previewed, and editable without AI.

**Permitted role:** AI may propose content, media, SEO, registered variant
ranking, supported layout props, and registered primitive recipes. Default
Launcher levels are E2 or E3. AI may not write VFS, replace page source, change
topology, override Stage 4b, invent runtime identities, or become required for
launch success.

**Work:**

- Define `AIEnrichmentEnvelope`, `AIEnrichmentPlan`, explicit permissions, and
  stable ranking input/provenance.
- Distinguish implementation prerequisites from per-launch execution order:
  the deterministic system must first be proven without AI, but optional
  enrichment within a launch happens before its final canonical commit.
  Execute complete deterministic base -> optional plan -> canonical validators
  and resolvers -> canonical recompile -> Stage 4b -> preflight ->
  `commitMutation` -> sealed snapshot/revision -> Preview and Playground.
- Include canonical topology, contracts, registries, artifacts, capabilities,
  runtime manifest, normalized imports, and export constraints.
- Default to safe registered enrichment (Mode A). Creative proposals (Mode B)
  must resolve into existing registered recipes or return unsupported, never
  generate arbitrary Launcher TSX.
- Default permissions allow content, media, SEO, registered variant swaps,
  supported layout props, and primitive composition; deny section reorder,
  topology changes, component creation, direct VFS writes, and theme overrides.
- Validate schema, permissions, artifact compatibility, registry identity,
  primitives, capabilities, bindings, Preview runtime, imports, exports, theme
  compliance, canonical compile, and preflight in that order.
- Let AI rank only a deterministic legal candidate set. The seeded resolver
  chooses from the accepted ranking and records the ranking input.
- Apply accepted operations to canonical structured state, recompile, then
  commit through `VFSCommitService`.
- On timeout, invalid output, incompatibility, or compile failure, discard the
  plan and launch the deterministic base site.
- Record deterministic, AI, and user provenance in design contracts and
  resolved compositions.

**Tests:**

- `aiEnrichmentSchema.test.ts`
- `aiEnrichmentRegistryResolution.test.ts`
- `aiEnrichmentArtifactSafety.test.ts`
- `aiEnrichmentRuntimeCompatibility.test.ts`
- `aiEnrichmentImportAwareness.test.ts`
- `aiEnrichmentExportAwareness.test.ts`
- `aiEnrichmentFallback.test.ts`
- `aiEnrichmentNoDirectVfs.test.ts`
- `aiEnrichmentPlaygroundRoundTrip.test.ts`
- `aiEnrichmentDeterministicRanking.test.ts`

These are required future suites, not claims of existing coverage. Replay
must preserve selections for identical Wizard selections, generation seed,
registry state, and recorded AI ranking. Visual swaps must preserve artifact
identity, required slots, business bindings, and intents. Runtime/import/export
validation must reject incompatible recipes before canonical acceptance.

**Acceptance:** AI-disabled and AI-failed launches produce the complete
deterministic site; every accepted operation survives canonical commit, reload,
Preview, Playground hydration, and selected export constraints.

**Removal gate:** No compatibility AI route may be connected to Launcher until
the full enrichment validator chain exists. E5 component generation remains a
developer-approved non-default workflow.

### Phase 10 - Scale business runtime verticals

**Objective:** Prove operational completeness using the same canonical model.

**Order:** Booking first, then commerce, restaurant, and contractor.

**Acceptance per vertical:** Industry compositions, page archetypes, artifacts,
capabilities, bindings, intent handlers, generated runtime, Preview, Playground,
publish/export, and browser journeys pass without a vertical-specific generator,
VFS writer, preview owner, or snapshot authority.

## 5. Reusable Ten-Gate Closure Harness

Every new or migrated design asset must prove:

1. **Registry:** Stable identity exists in the owning registry.
2. **Eligibility:** Template, pack, capability, and archetype rules can select it.
3. **Determinism:** The same seed resolves the same implementation.
4. **Contract:** Design Contract and resolved composition record the identity.
5. **Compiler:** Canonical compiler emits the registered implementation.
6. **Theme:** Emitted source uses semantic Stage 4b and `--ut-*` tokens.
7. **Snapshot:** Committed snapshot preserves identity and VFS bytes.
8. **Preview:** Live Preview executes it without fallback authorship.
9. **Playground:** Hydration recovers artifact, implementation, slots, and intents.
10. **Round trip:** Structured edit, commit, reload, and rehydrate preserve it.

Create one shared fixture/helper for this proof rather than duplicating bespoke
assertions across every family.

## 6. CI Release Gates

A phase cannot close unless all relevant checks pass:

- Zero canonical VFS bypasses.
- Zero direct Launcher AI VFS writes or page-authoring calls.
- Zero placeholder section families after Phase 2.
- 100% registered variant-to-emitter coverage after its migration phase.
- 100% Launcher vocabulary-to-executable-recipe coverage after Phase 4.
- 100% selected pages present in sealed snapshot and Preview.
- 100% canonical design-operation identity preservation after Phase 7.
- No literal global palette ownership in premium emitters.
- Full type-check, lint, architecture lints, unit/integration suites, Edge tests,
  production build, and phase-specific browser matrix pass.

## 7. Phase Completion Report

At the end of every phase, report:

- files changed;
- canonical authorities affected;
- registries, artifacts, components, variants, and primitives changed;
- how selected assets resolve into generated VFS;
- how Live Preview proves the emitted implementation is active;
- how Playground hydrates and round-trips the same identity;
- tests added or updated and their results;
- remaining legacy or parallel paths capable of bypassing the chain;
- whether every acceptance and removal gate is satisfied.

Compilation and registry counts alone are not completion evidence.