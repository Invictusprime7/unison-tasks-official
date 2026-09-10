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

**Canonical recovery continuation (2026-09-08):** Saved canonical snapshot
hydration no longer substitutes pending local recovery-journal files for the
committed VFS. Initial VFS observation cannot force-save that journal after a
revision is loaded; while canonical hydration is unresolved, reactive autosave,
interval saves and forced navigation flushes defer without writing a journal.
The existing hydration-attempt marker supplies this guard. Legacy noncanonical
draft replay remains supported and existing journals are not deleted or marked
persisted by reopening a canonical project.

Seven executable callback regressions cover committed-file authority, legacy
replay, pending hydration, loaded-revision baselines and forced flushes. The
focused recovery/save/revision/Gallery suites pass 81 tests; app typecheck,
targeted lint and all three architecture guards pass. The shared browser reached
the editor but remained hidden without a Preview frame, so cold-reopen visual
proof and remote revision-pointer stability are not certified. This fixes a
reproduced journal replay path, not every possible unsolicited-save cause;
Phase 0/1 and Gallery closure remain open.

### Experience Capability Integration

The Canonical Experience Capability Implementation Plan is adopted as an
extension of these phases, not a replacement pipeline. Its Lane B page-authoring
instructions are superseded by this guidebook: registered implementations and
the canonical compiler author pages; optional AI proposes structured edits only.
Stage 4b owns theme/material tokens, and the existing snapshot-owned
`/src/unison/ui/experience/*` foundation remains the implementation root.

The repository already has a generated React 19 profile, runtime capability
registry, experience primitives, technical preflight and UI manifest v1.6.
Extend those owners; do not introduce a parallel registry or downgrade to v1.2.
Platform-supported packages, launch-approved capabilities and actually reached
dependencies are separate concepts. Business provisioning capabilities must not
be passed as visual-runtime approval.

| Existing phase | Compatible experience work |
| --- | --- |
| 0 | Explicit approval enforcement; truthful legacy reads; compatible exact renderer pins; explicit runtime migrations and preservation. |
| 1-2 | Declared primitive dependencies and implementation identity survive compiler, seal, Preview and recommit. Gallery/Testimonials ordering remains unchanged. |
| 4 | Expand shared primitives and registered component implementations first; declare future experience dependencies without enabling new live 3D or advanced animation recipes. |
| 5 | Resolve seeded eligible vocabulary into executable registered recipes, not AI page-authoring prompts. |
| 6 | Expand and verify industry families and page archetypes using the registered primitive/component foundation. |
| 6A | After primitive/component and cross-industry expansion acceptance, implement live 3D and advanced animation through registered recipes, with real assets and usable fallbacks. |
| 7-10 | Semantic editor targets, structured edits, save/reload, export/import, performance budgets, reduced motion, no-WebGL and desktop/mobile visual proof. |
| 11 | Optional AI may propose approved recipe/content/property edits through the canonical transaction boundary. |

Initial hardening implemented: an explicit empty visual approval list denies
experience usage, including detected instances imported through the root UI
facade. Unused foundation modules do not count as site capability usage. New
Launcher finalization derives a separate approval list from the resolved WebGL
eligibility and supported foundation capability set. The list is sealed in
`meta.uiFoundation.approvedExperienceCapabilities` and retained on structured
recompile. Business capabilities remain in their existing contract.

Legacy callers with no explicit approval declaration retain the existing
compatibility path; omission is not equivalent to explicit `[]`. Manifest reads
without experience metadata grant no capabilities or dependencies. Missing
runtime profiles are marked `legacy-unspecified`, not relabeled React 19;
declared historical profiles and budgets remain unchanged and stored bytes are
not rewritten. This is read compatibility, not certification that arbitrary old
renderer profiles execute in today's Preview. Explicit profile migration,
recompile profile preservation, exact renderer dependency pinning, and versioned
budget changes remain required. No legacy runtime or budget is silently upgraded
by this batch.

The default one-canvas/one-heavy-scene policy from the attached plan is intended
for a future versioned new-launch policy, not retroactive mutation of the current
two-per-page/six-per-site budget. WebGL absence with a fallback remains a runtime
degradation, never a business-provisioning requirement. No new 3D UI is certified
until its registered implementation passes the existing closure harness.

Phase 4 declaration batch (2026-09-10): `SectionVariant` now carries an optional
`experience` declaration — a `status` of `declared` or `enabled` plus the design
vocabulary entry (`category` + `id`) the implementation executes. Primitives are
never restated on the variant; they are derived from that entry, so the
vocabulary stays their only owner. `declared` is inventory metadata that grants
nothing; only `enabled` contributes a capability. The variant registry exposes
`resolveExperienceRequirement`, which resolves active variant ids into enabled
primitives, declared primitives and reached capability ids in
`EXPERIENCE_PRIMITIVES` order, ignoring unregistered ids and unknown vocabulary
references. `designImplementationRegistry` projects the declaration as a clone,
so the derived view still owns no independent list, and
`designRegistrySignature` is deliberately unchanged so stored signatures stay
valid.

Launch approval is now requirement-derived rather than eligibility-derived:
`resolveApprovedExperienceCapabilities` approves only capabilities that a
registered `enabled` implementation requires or that the sealed VFS already
reaches, intersected with the emitted foundation's supported set, and only when
the sealed envelope is not `ineligible`. A business model that merely *could*
run WebGL no longer approves the 3D capability. Sites whose committed VFS
already reaches `@/unison/ui/experience` keep their approval, so this is a
tightening of an over-broad grant, not a migration.

`gallery:cinematic-grid` carries the first declaration (`media:depth-gallery`,
which owns `DepthGallery`). Its DOM implementation, recipe bytes, Radix
requirements and emitted output are unchanged; retarget the declaration if
Phase 6A chooses a different registered surface for that vocabulary entry. A
per-declaration regression asserts every declaration resolves to a real
vocabulary entry that actually owns experience primitives, so a typo or a
retired entry fails the suite instead of silently resolving to nothing.

Validation: 1,252 tests across 155 files pass, including ten new regressions
covering declaration/vocabulary consistency, declaration projection, the
registry-wide "nothing is enabled" gate, unregistered ids, and every approval
branch. Application typecheck, all four architecture lints, recipe freshness and
the production build pass; existing chunk-size warnings remain. No live 3D was
enabled, no manifest version or budget changed, and no browser, schema,
deployment or remote state was touched. Phase 0/1 remain open and Phase 6A
remains gated.

Directive agreement continuation (2026-09-10): the sealed `aiDirective` now
agrees with the approval decision above. It previously instructed every eligible
launch to "compose the immersive layer only from @/unison/ui/experience", so an
AI edit that obeyed the sealed brief was rejected by the runtime preflight at
save time. The immersive sentence is emitted only when a registered
implementation enables the layer; otherwise the directive states that the layer
is not approved and must not be imported.

`experienceBudget`, `experienceRecipes` and the resolved envelope are
deliberately unchanged. They remain the business model's candidate/eligibility
plan, and collapsing them to `none` would later be read as a user WebGL opt-out
through the legacy `disallowWebgl` migration path — an authority collapse, not a
fix. Approval, eligibility and the candidate plan stay three separate facts.
Recompile still prefers the snapshot's stored brief, so existing immersive
projects keep their sealed directive; only a fresh launch authors a new one. The
Edge function's hand-maintained prose mirror was intentionally not edited, so
this batch introduces no undeployed remote drift.

Continuation validation: 1,255 tests across 155 files pass, including two new
regressions asserting a fresh ecommerce launch seals a directive that forbids
the immersive layer while retaining its `immersive` budget, `product-stage`
recipe and non-`ineligible` envelope. Typecheck, all four architecture lints,
recipe freshness and the production build pass.

### Phase 5 foundation - measured vocabulary executability

The recorded gap "design vocabulary is richer than the set of compiler-executable
recipes" is now machine-checked instead of prose. `SectionVariant` carries an
optional `vocabulary` reference (`category` + `id`, because vocabulary ids are
unique per category only) naming the pattern that variant already executes.
`designImplementationRegistry` derives the reverse index and exposes
`listImplementationsForVocabulary`, `isExecutableVocabulary` and
`vocabularyExecutabilityReport`. No new registry is introduced: the variant
owns the claim, the vocabulary owns the pattern, and the projection is derived
from both. `designRegistrySignature` remains unchanged.

Seven entries are executable today, mapped only where a registered variant
matches the entry's stated mechanism rather than merely its mood:
`hero:split-cinematic` (`hero:split-image`), `content:horizontal-scroll`
(`testimonials:rail`), `content:split-feature` (`services:alternating`),
`content:comparison` (`pricing:comparison`), `media:masonry`
(`gallery:masonry`), `media:lightbox` (`gallery:lightbox-grid`) and
`navigation:split` (`navbar:centered-logo`). Everything else in the vocabulary
is reported as unimplemented. A regression pins the exact partition, so Phase 5
progress must shrink `unimplemented` by registering implementations - trimming
the vocabulary to make the test pass would be a contract break, not a closure.

The sealed directive now leads with executable vocabulary only. It previously
named `envelope.heroCandidates[0]` unconditionally, so a launch could be told to
lead with a pattern (for example `kinetic-type` or `immersive-product`) that no
registered implementation renders - an implicit invitation to hand-author page
source. Each of the hero, content and navigation clauses now selects the first
*executable* candidate in seeded order, and the clause is omitted when a
category has none. The envelope itself is unchanged and still version `1.0`:
candidate eligibility, executability and approval remain three separate facts.

Validation: 1,267 tests across 156 files pass, including a per-variant check
that every vocabulary claim resolves to a real entry, a guard against two
section families claiming one entry, the pinned executable/unimplemented
partition, and a two-launch assertion that the sealed directive names only
buildable patterns. Typecheck, all four architecture lints, recipe freshness and
the production build pass. Phase 5 resolution of seeded vocabulary into
registered recipes remains open; this batch only makes the gap measurable and
stops the brief from advertising across it.

#### Directive supersession - describe the resolved composition

Naming an executable vocabulary lead was still not truthful: `activeVariants`
is resolved by seeded rotation from the template's layout baseline and has no
relationship to `envelope.heroCandidates`, so the brief named a buildable
pattern the launch had not selected. The directive now names the registered
implementations the launch actually resolved, and states their design language
only through the vocabulary those implementations claim. This supersedes the
executable-lead clause from the previous batch.

Wiring the envelope into variant selection was investigated and deliberately not
implemented. `candidatesFor` already returns the whole capability-eligible
category, and none of the seven mapped entries is ever ruled ineligible by the
current `isAllowed` rules, so eligibility filtering would be a no-op today.
Preferring an envelope lead instead of filtering would pin `services` to
`services:alternating` on every seed and destroy the tested per-seed structural
variety. Selection wiring therefore waits until the registered inventory makes
eligibility subtraction meaningful; it is not a prerequisite that was skipped.

#### Full lint gate closed

`npm run lint` now exits clean: 0 errors, 46 pre-existing warnings. The ten
errors were `no-useless-escape` in five regexes, `no-control-regex` in two
sanitizers where matching control characters is the entire purpose (now
disabled inline with a reason), one unused ternary expression in
`AIGatewayOptions`, and one `react-hooks/refs` report in `InteractiveIcon`
where the ref is only forwarded to a `ref={}` prop and never read during
render. The regex edits were proved equivalent for the secret-detection and
workflow-reference patterns; the class-attribute pattern is covered by the
passing pipeline suite.

Two of those files, `supabase/functions/_shared/validate.ts` and
`supabase/functions/ai-code-assistant/safetyRules.ts`, are part of the deployed
`ai-code-assistant` bundle. The repository no longer byte-matches remote version
341 and a redeploy is required before that match is re-asserted. Nothing was
deployed in this batch.

Validation: 1,268 tests across 156 files, `npm run lint`, both typecheck
projects, all four architecture lints, recipe freshness and the production build
pass. The six Supabase edge tests were not re-run: `vitest.config.ts` includes
only `src/**`, so they need a separate config that this batch did not add.

Hardening validation (2026-09-08): 1,227 tests across 153 files pass, including
representative golden Wizard fixtures and a real compiler/finalizer round trip
with mocked persistence that retains explicit `[]` through reload. Application
types, targeted lint, production build, recipe freshness and all three
architecture guards pass. Existing full-lint failures and build warnings remain.
No browser 3D rendering or remote persistence was exercised in this batch; no
schema, deployment, git commit or remote state changed. Phase 0/1 remain open.

The revised guidebook's Section 16 and Chapters 22-23 supersede the older phase
numbering. Protect established ownership rather than reopening orchestration.
Existing save/reload defects remain release blockers, not a reason to introduce
another compiler or writer. Initial portable expansion precedes installed-UI
classification and primitive contracts; external ingestion waits for that
foundation. Runtime, editing and import/export closure must precede scaling.

| Phase | Objective |
| --- | --- |
| 0 | Protect the canonical milestone and preserve existing regression gates |
| 1 | Compiler/registry convergence |
| 1B | Single-file compiler becomes a multi-file projection |
| 1C | Explicit installed-component classification; unclassified = 0 |
| 1D | Deterministic primitive/interaction recipes in contracts and runtime |
| 2 | Registry/editor and emitted renderer parity |
| 3 | Close all 17 semantic section families |
| 3B | One authorized external 21st section through full closure |
| 4 | Scale premium inventory only after closure |
| 5 | Executable design vocabulary |
| 6 | Industry families and page archetypes |
| 6A | Live 3D and advanced animation after registered primitive/component and cross-industry expansion acceptance |
| 7 | Artifact/editor closure |
| 8 | Persisted Playground identity round trip |
| 9 | Actual export/import symmetry with explicit export modes |
| 10 | Multi-seed visual-quality certification |
| 11 | Optional structured AI enrichment after prerequisite gates |
| 12 | Business-runtime scale |

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

**Save finalization continuation (2026-09-08):** Non-Wizard `commitMutation`
now sends the recompiled candidate through `buildCanonicalLaunchArtifacts`
before acceptance-only preflight. The existing finalizer emits the published
runtime and generated manifest, repairs source and applies Stage 4b before
sealing. Runtime reconciliation consumes the finalized manifest, checks its
site identity against the canonical project and never rewrites sealed files.
`sealSnapshot` projects the router from final runtime bytes. A redundant UI
foundation pass after sealing was removed: the real regression test caught it
reintroducing literal material colors and breaking runtime-VFS equality.

`playgroundCommitFinalization.test.ts` exercises the real compiler, finalizer,
preflight, commit service and revision loader with mocked database/readiness
services. Its in-memory persistence boundary enforces runtime-VFS/snapshot
equality. A structured Gallery title edit survives JSON serialization/reload
with page identity, route, bindings, resolved implementation IDs and portable
recipe bytes intact; runtime imports resolve and the prior snapshot is unchanged.
This is local recovery proof, not a remote database or rendered Preview proof.

All 1,182 tests across 147 files passed; the final removal of reconciliation's
manifest-generation fallback then passed all 24 focused commit/ledger tests.
Type-check, targeted lint and three architecture guards passed. Production
build passed before that final fallback removal, with existing chunk/Tailwind
warnings. A browser verification attempt stopped at `/auth/v1/user` returning
401 for the expired session; no saved project was read or modified and no
revision was created.

**Save blockers at that checkpoint (superseded by the authenticated continuation below):**
Authenticated persisted save/reload had not verified the live equality guard.
Reloaded Builder identity adoption was locally tested, but remote autosave was unverified.
The earlier failed Save-to-Projects attempt created a
verification-copy identity shell, not a verified saved revision. Booking remains
preview-only with production readiness blockers. Persisted legacy restoration
and browser Playground round-trip closure are still required.
**Phase 0 DoD is not satisfied.**

**Save outcome continuation (2026-09-08):** `WebBuilder` now checks both
`saveTemplate` and `updateTemplate` outcomes before reporting Save-to-Projects
success, dismissing its dialog or clearing the recovery draft. Its panel-save
callback rejects when the hook returns no saved draft, allowing existing panel
error handling to retain the form. The save callback also tracks the correct
payload-builder dependency. Actual callback execution tests cover failed create,
failed update, confirmed success and retry; hook tests verify a rejected
canonical commit emits no saved event. All 11 focused save/finalization tests,
type-check and targeted lint pass. This fixes the documented false-success path
locally; it is not mounted UI or live persistence proof. Browser authentication
still returned 401, so authenticated save/reload remains blocked. Identity shells
created before failed content commits are not deleted by this change.

**Autosave identity continuation (2026-09-08):** Revision hydration now adopts
the persisted revision's exact `draftId` and real `projectId` into the Builder's
local and `useTemplateFiles` identity state before autosave can run. The shared
`resolvePersistedEditorIdentity` helper is also used when building the durable
`ProjectRuntimeEnvelope`, keeping reload, editor and autosave identity aligned.
Focused tests cover draft-projected recovery, route-state-free editor identity,
isolated production Builder effect execution, canonical commit/reload and save
failure/retry; 27 tests across six files, type-check and targeted lint pass. This is local identity recovery proof. It
does not demonstrate an authenticated browser reload or durable remote autosave,
which remains blocked by the expired browser session.

**Revision lifecycle continuation:** Executable React tests replace the source-only
setter assertion. Six effect cases cover identity adoption, stable hook-wrapper
rerenders, stale projection resolution/rejection after a project switch, revision
advancement and absent hydration. The upstream loader test exposed a draft cache
key that ignored revision changes; the key now includes the revision ID while
retaining the durable draft-projection loader. A same-draft commit therefore
refreshes hydration. These are isolated production-effect tests, not a mounted
Builder or authenticated persistence journey. Phase 0 and Phase 1 remain open.

**Authenticated restoration and Preview continuation (2026-09-08 UTC):**
Authentication recovered. The same verification project/draft was reopened,
edited through Playground navigation visibility, saved through the UI and
cold-reloaded. This supersedes the earlier current-session authentication blocker;
the preceding no-write statements describe only those earlier attempts.

Mounted verification exposed restore-triggered presentation commits, autosave
churn, inferred duplicate pages/funnels and lost runtime context. Builder now
adopts committed byte baselines, compares multi-file VFS rather than selected-page
code for dirty state, and preserves persisted project/workspace/site context
through preliminary finalization. Canonical Playground hydration adopts the exact
snapshot state without inference or dirtying. Business name and industry inherit
from the snapshot when canonical commit options omit them. Explicit variant
actions remain transactional; restore no longer replays parsed variant choices.

Unintended autosave revisions reached `9aefde9d-b6a4-40a0-aa6d-77a79688d0af`
with 16 pages/59 funnels. Canonical restoration
`aed1839a-9a8c-43c7-b656-62a7e286f9c1` recovered the original eight pages/one
funnel. UI visibility saves and runtime-identity recovery followed; UI revision
`df4767b4-537b-4aa8-875a-232551aa6dd5` retained the business name and workspace.
Opening the ledger later exposed another write-on-observation path, producing
system restores `1610617b-afe6-4c19-b6ad-17f5f8ba73b6` and
`2ebd0381-90d7-4880-9464-3541504568b0`. Automatic ledger restore now defaults
off; mounted tests prove drift observation/refresh does not write and explicit
Restore still works. No revisions were deleted, no schema changed and no function
was deployed in this continuation. The latest restore preserves the saved
Playground/bindings and exact Gallery recipe bytes from the restoration baseline;
runtime files equal the persisted snapshot. It remains publish-blocked.

Real persisted Preview exposed behavior-breaking Radix shims: Dialog lacked
modal behavior and Accordion lacked Header. Preview now retains actual Accordion,
Dialog and Slot packages; their pinned dependencies compile and execute. All eight
routes rendered with their expected heading and no horizontal overflow at the
tested Canvas width. FAQ pointer opening and keyboard closing pass. Gallery
Masonry's outer/inner variant IDs agree; pointer opening, arrow navigation, Tab
wrapping, Escape and settled focus restoration pass, including at 375px. Sandpack
now honors device widths (375px/768px/available desktop width); previously only
Docker honored them. A persisted mobile screenshot was captured. This does not
certify every variant or every route at every breakpoint.

Validation: full suite 1,207 tests/150 files passed before the final ledger
default change; its two mounted tests and focused lint then passed. Application
type-check, focused continuation lint, recipe freshness, production build and
canonical-writer/pipeline/single-source guards passed. Build retains existing
chunk/circularity/Tailwind warnings. Full lint fails with 10 existing errors and
46 warnings; it is not a passing Phase 0 gate. The Gallery 21st review has no
errors and one existing hover-scale warning.

Remaining: fresh v2 authority propagation; full legacy authority migration proof;
host toolbar pointer reliability; Gallery failed-image/content resilience,
performance budgets and export/import proof; all-variant persisted identity and
visual closure; then Testimonials convergence (runtime still shows selected
`testimonials:rail` versus inner `testimonials:carousel`). Reconciliation returns
non-2xx and five intent bindings block publish. None of those gaps is waived by
the successful save/reload or route checks. Phase 0 and Phase 1 remain open.

**Work:**

**Gallery media and saved-state continuation (2026-09-08 UTC):** The shared
Gallery image renderer now replaces failed or empty sources with a themed,
accessible unavailable state and resets on source changes. The portable recipe
was rebuilt; all five emitted variants cover thumbnail errors, lightbox errors,
navigation recovery and close behavior. Direct and emitted media suites pass
33 tests; compiler/commit parity passed 32 tests before the added media cases.

Normal UI Update persisted revision `a8e603cd-c81d-4f9a-8e0a-e36cf750b1cc`
at 23:52:42 UTC for the fresh verification draft above. Read-only database checks
confirm Gallery fallback bytes and v2 canonical-compiler authority. Runtime files
match the snapshot; the raw revision map additionally contains `/.unison/*`
sidecars, which are intentionally absent from the snapshot runtime map. A fresh
tab reopened this revision and rendered Gallery. The known Unsplash failure
produced `Brow sculpting: image unavailable` in the lightbox and the thumbnail;
ArrowRight reached Keratin treatment. The durable pointer remained unchanged.

The dirty indicator and Back action now ignore page-source changes when the
committed multi-file VFS is unchanged, using saved source only for code-only
drafts. Regression tests exercise clean navigation without prompts/writes and
retain the confirmation for actual VFS edits. Manual Save also now requests the
existing durable revision hydration after success; previously Preview retained
the old recipe until cold reload. Failed saves do not request hydration. The
save/adoption suites pass 20 tests, with application types and targeted lint clean.
The post-save refresh change still needs a fresh browser save verification.

Final local validation for this continuation: 1,222 tests across 153 files,
application type-check, targeted lint, production build, recipe freshness and
all three architecture guards pass. Existing Tailwind/chunk build warnings and
the previously recorded full-lint failures are not resolved by this batch.

Remote history also contains unrequested `playground-edit` revision
`92d85144-e46c-4552-862d-42885b962a35` at 23:48:05 UTC during this continuation;
its initiating path is not yet proven. It is preserved. An unrelated "Add smooth
scroll animations" chat entry appeared amid unreliable browser targeting; no
revision newer than the intentional 23:52 save was present at the final pointer
check. Do not count this session as a clean no-write startup proof.

Browser DOM actions work, but screenshots remain stale (an old Update dialog or
loading screen), and the Mobile action ended on About instead of Gallery.
Desktop/mobile visual sizing, focus restoration for the fallback, and the fresh
post-save refresh remain unverified. Foreground, stable browser execution is
required before visual closure. Startup autosave, content quality, performance,
export/import, all-variant persistence, Testimonials and the existing full-lint
and publish-readiness blockers remain open. No schema, deployment, commit or
history deletion occurred. Phase 0 and Phase 1 remain open.

**V2 authority propagation continuation (2026-09-08 UTC):** The production
orchestrator omitted `stage4b.pipelineResult.compileArtifact` even though the
golden fixture supplied it. Forwarding that artifact makes the existing sealer
validate the v2 proof on real launch. Canonical recompiles now also forward their
compiler artifact (with the stamped candidate baseline) and validate its proof;
previously the first save dropped authority fields. Legacy v1 read behavior is
unchanged; old revisions are not relabeled in place.

Fresh Salon Premium / Editorial launch created project
`68dc9b3b-75c0-4725-a2f4-aa7a1c4d27c3`, draft
`a3f494e1-7e07-4287-854e-058ad124c675`, launch revision
`554d818f-4f25-4aad-8748-3ea88b283e35` with v2 canonical-compiler authority.
Startup autosave produced `090f85a5-7432-4b32-ad25-1237579b0a63` before the
recompile fix, exposing the authority loss. After the fix, normal UI Update
persisted `2adbfb40-6cbe-4d86-865b-f62f6d8e6d85` with v2 authority, all eight
registered paths, Salon industry and the business name preserved; runtime files
exactly match the snapshot. Opening the draft URL in a new tab with no route
state recovered that same revision. Home and Gallery rendered; Gallery's outer
and inner IDs both equal `gallery:feature-split`. Passive reopen and page switching
left the revision pointer unchanged. This verifies fresh v2 launch/save/reopen
propagation, not complete all-variant or legacy migration closure.

Validation: 153 focused tests, full suite 1,210 tests/151 files, application
type-check, targeted lint, pipeline and canonical-writer guards, recipe freshness
and production build pass. Existing build warnings and full-lint failures remain.
No schema, deployment, commit or history deletion occurred. Startup handoff still
causes an unsolicited save and its dirty-state guard needs separate follow-up;
the failed Gallery image, content quality, export/performance and Testimonials
gates remain open. Phase 0 and Phase 1 are not closed.

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

**Gallery batch (2026-09-08):** The five existing Gallery entries declare
`vfs.mode = portable-recipe`. The recipe build discovers those entries and their
component imports from the existing registry AST, bundles the actual React
sources and rejects undeclared external dependencies. The generated artifact is
build output, not another registry. The compiler emits
`/src/components/recipes/Gallery.ts`, consumed by the existing Gallery adapter;
explicit VariantId wins over a legacy layout. Four generic visual branches are
retired, with reel/default compatibility retained. No new variants or artifacts
are added. `renderJSX` remains a legacy swap adapter, not certified round-trip
authority.

Stage 4b's color normalizer was incorrectly rewriting `hsl`/`hsla` JavaScript
theme helpers as raw CSS, causing recipe quarantine. It now matches numeric CSS
colors and preserves semantic helper calls. Theme values still come from the
emitted semantic THEME adapter and Stage 4b stylesheet; no palette owner changed.

Validation: 159 tests across convergence, renderer parity, composition,
normalization, golden launch, canonical handoff, zero-bypass and existing
StyleX recipes pass. Type-check, recipe freshness, production build and the
canonical-writer/pipeline/single-source guards pass. The build reports chunk
size/circularity and Tailwind warnings. Targeted lint is clean except two
pre-existing unnecessary escapes in the normalizer's class-string regex,
confirmed by linting HEAD; no unrelated cleanup was applied.
Exact recipe bytes survive the sealed
snapshot and in-memory Playground recompilation; Sandpack preparation preserves
the component map. All five emitted variants execute with registry-identical DOM,
filtering, lightbox navigation/Escape, empty content and legacy layout behavior.

Changed implementation files: `scripts/build-stylex-recipes.mjs`,
`src/sections/recipes/stylexRecipes.generated.json`,
`src/sections/variants/types.ts`, `src/sections/variants/registry.ts`,
`src/sections/compositionToFileSet.ts`, and
`src/utils/wizardThemeTokenNormalizer.ts`. Tests added:
`src/test/variantCompilerConvergence.test.ts` and
`src/test/variantRendererParity.test.tsx`. Tests extended:
`src/test/goldenIndustryPipeline.test.ts` and
`src/test/wizardThemeTokenNormalizer.test.ts`. This execution plan and
`roadmap.md` record the revised ordering and batch evidence.

Browser evidence is an isolated compiler-output fixture, not a persisted Launcher
Preview: all five variants rendered at 1440px and 390px without horizontal
overflow. A mobile screenshot captured a blocked template image and mismatched
sample imagery. A later browser pointer check could not run after a reload
cleared the isolated fixture; DOM event tests are not pointer proof.
Fixed column counts at mobile, lightbox focus trapping, media
fallbacks, performance, actual persisted edit/recommit/reload and export/import
remain unverified or need improvement. Playground's canonical identity hydration
is unchanged; an in-memory recompilation is not durable round-trip proof.
**Phase 1 DoD remains unsatisfied.**

**Gallery accessibility continuation (2026-09-08):** The shared
`GalleryLightbox.tsx` now uses Radix Dialog rather than a role-only overlay and
a global keyboard listener. It provides initial focus, trapped Tab navigation,
background isolation, Escape dismissal and restoration to the image trigger.
Arrow navigation is scoped to the active dialog. Close/previous/next use Lucide
icons with accessible names, visible focus styles and 44px control classes.
Stage 4b still supplies the colors; no new visual variants or artifacts exist.

All five Gallery entries declare `radixPrimitives: ['dialog']`. The existing
recipe build derives those declarations and normalizes package imports to the
canonical `/src/unison/ui/radix/dialog` and icon facades, keeping undeclared
external dependencies rejected. The generated artifact, registry metadata,
shared lightbox, recipe build and `variantRendererParity.test.tsx` changed.
No VFS writer, snapshot owner, Preview owner or Playground hydrator changed.

The focused suites pass 166 tests: 23 renderer/accessibility checks plus 143
compiler, theme, golden-launch, handoff and zero-bypass checks. Coverage includes
all five variants' focus wrapping/restoration, background isolation, release
when live items disappear, and canonical dependency facade resolution. Sealed
recipe preservation and in-memory Playground recompilation remain green.
Type-check, targeted lint, recipe freshness, canonical writer/pipeline guards
and the deterministic 21st review pass.

Browser evidence remains limited: the emitted module mounted in an isolated
fixture at localhost:8080, but the shared browser reports hidden visibility even
after bringing it forward. Playwright's pointer stability check timed out before
keyboard testing. A desktop screenshot is not pointer/focus proof; the existing
blocked template image remains. Do not mark real-browser accessibility or
persisted Preview/Playground edit/reload complete. Legacy reel/default and
`renderJSX` swap compatibility remain uncertified. This continuation does not
close Phase 1 or authorize the next family.

**Gallery responsive continuation (2026-09-08):** `GalleryMasonry.tsx`,
`GalleryCinematicGrid.tsx` and `GalleryLightboxGrid.tsx` now use one mobile
column, two columns from the existing `sm` breakpoint, and the selected 2/3/4
columns from `lg`. Static Tailwind classes replace inline column counts in
the shared registered components; the existing recipe build regenerates
`stylexRecipes.generated.json`. `variantRendererParity.test.tsx` adds coverage
for every supported desktop count. No registry identities, artifacts, bindings,
compiler ownership, theme authority or canonical mutation paths changed.

All 169 focused tests pass, including DOM parity, modal accessibility, exact
sealed recipe preservation, Playground recompilation and Preview preparation.
Type-check, targeted lint, recipe freshness and canonical writer/pipeline guards
pass. The 21st review has no errors and retains its pre-existing GalleryFrame
hover-scale warning; that motion recommendation was not changed in this batch.

Browser verification used actual emitted modules with Salon content and the
Stage 4b Editorial stylesheet. All 27 settled layout cases (three variants,
three desktop column choices, widths 390/768/1440) matched expected columns
without horizontal overflow. Immediate Masonry readings captured an active
column-count transition; the measurement fixture explicitly finished layout
transitions before asserting final counts. This is not animation-quality proof.
Desktop and mobile screenshots were captured. The previously blocked keyboard
check now passes in the visible browser: real click, initial focus, Shift+Tab/Tab
wrapping, ArrowRight navigation, Escape and trigger-focus restoration at 1440px
and 390px on the emitted Lightbox Grid implementation.

These are isolated generated-runtime checks, not a persisted Launcher Preview
or a saved Playground edit. The blocked template image, mismatched sample
imagery, performance, broader accessibility review and durable edit/reload
remain open. This supersedes the earlier fixed-mobile-columns finding and
hidden-browser limitation for the checks above, but **Phase 1 remains open**.

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

### Phase 3 - Close all 17 section families

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

### Phase 4 - Expand premium inventory and primitives

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

### Phase 5 - Make design vocabulary executable

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

### Phase 6 - Expand industry families and page archetypes

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

### Phase 6A - Implement Live 3D And Advanced Animation

**Entry gate:** Complete the preceding primitive/component registry expansion
and cross-industry acceptance in Phases 1-6. Existing Gallery-first closure and
family sequencing still apply. Runtime compatibility hardening may proceed
earlier, but it does not authorize new live immersive or advanced-motion recipes.
Existing working animations and persisted experience sites remain supported;
this sequencing decision is not a retroactive feature removal.

**Work:**

- Implement live Three.js/R3F/Drei product stages, model viewers, immersive heroes
  and depth galleries through existing registered implementations and the
  snapshot-owned experience foundation, starting with one complete recipe.
- Implement advanced animation as declared registered motion recipes with
  reduced-motion behavior, deterministic configuration and bounded runtime cost.
- Use industry/page-role eligibility and real media or models. Operational pages
  need not receive immersive visuals; ordinary sites must not install unused 3D.
- Keep renderer profiles, approved dependencies and versioned performance budgets
  compatible. Do not replace snapshot runtime declarations implicitly.
- Preserve Stage 4b theme/material ownership, canonical intent bindings and
  semantic editor targets; never add an alternate scene/page authoring pipeline.

**Acceptance:** Each recipe requires desktop/mobile screenshots and nonblank
canvas-pixel checks, real pointer/keyboard interaction, reduced-motion and
no-WebGL fallbacks, asset-failure recovery, measured performance, and persisted
edit/recommit/reopen proof. Validate generated Preview and export behavior, not
only host React rendering. Phases 7-10 complete broader editor and release
certification; no new live recipe is rollout-ready on registry counts alone.

### Phase 7 - Complete artifact and editor closure

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

### Phase 8 - Prove Playground design round trips

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

### Phase 9 - Certify import/export symmetry

Test actual export API -> ZIP bytes -> importer -> canonical restoration.
Portable source export intentionally omits private metadata; Unison round-trip
export includes the snapshot, runtime manifest, contracts, resolved composition
and required provenance. Do not substitute a manually assembled import fixture.
This gate remains open, and AI enrichment cannot bypass it.

### Phase 10 - Certify rendered visual quality

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

### Phase 11 - Add optional structured AI augmentation

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

### Phase 12 - Scale business runtime verticals

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