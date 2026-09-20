# Unison Roadmap

The authoritative implementation sequence is
[`docs/DETERMINISTIC_AI_DESIGN_EXECUTION_PLAN.md`](docs/DETERMINISTIC_AI_DESIGN_EXECUTION_PLAN.md).
This file is the concise status index. A phase moves to **complete** only after
its registry-to-runtime closure tests and required runtime evidence pass.

## Protected Architecture

```text
LauncherWizard
	-> runLaunchPipeline
	-> bounded contextual AI composition
	-> deterministic resolution and canonical compiler
	-> Stage 4b
	-> commitMutation / VFSCommitService
	-> SiteBundleSnapshot and revision
	-> Live Preview and Playground
```

- Launcher compilation is always deterministic: Stage 4b is mandatory. An accepted bounded AI composition plan refines the layout when available; missing or invalid composition degrades with a visible note and the deterministic Design Intervention launches instead.
- Before Stage 4b, the 21st generation coverage gate
  (`src/services/launch/twentyFirstCoverageGate.ts`) verifies every visual
  section resolves to a certified, portable, artifact-bindable,
  state-documented 21st implementation. Incomplete coverage degrades with a
  visible note and is loud in development; it never substitutes generic UI.
  All art direction packs pass the gate
  (`src/test/artDirectionPackCoverage.test.ts`), and the gate runs as a
  dedicated blocking CI step.
- Component states are first-class: `src/sections/variants/componentStates.ts`
  owns the derived state/interaction/responsive contract exposed to both AI
  layers through the wizard registry context.
- Both AI layers consume one canonical registry projection: the Wizard
  composer and Lane B receive it directly, and the in-Builder assistant
  resolves it through `src/services/builderRegistryContext.ts` (sealed
  `/.unison/wizard-registry-context.json` first, aggregated rebuild otherwise)
  and sends it as `registryContext`, rendered into the prompt by
  `buildRegistryContextBlock`. Bounded: registry vocabulary only, never source
  files or credentials (`src/test/builderRegistryContext.test.ts`).
- Lane B enrichment is bound to the certified runtime dependency allow-list:
  a proposed page importing any package the launcher did not install is
  rejected before merge (`src/test/wizardLaneBEnrichment.test.ts`).
- Stage 4b is the only global theme authority.
- `commitMutation` is the only accepted mutation boundary.
- Preview and Playground consume committed canonical artifacts.
- New inventory is incomplete until it survives the full canonical round trip.
- AI may propose structured, registry-aware enrichment operations. It may not
	author Launcher pages, write VFS directly, change topology, or create an
	alternate snapshot or preview authority.

## Design-Source Program (21st-First, V2)

The canonical design-source program is
[`docs/UNISON_21ST_FIRST_REGISTRY_CANONICAL_LAUNCH_PLAN_V2.md`](docs/UNISON_21ST_FIRST_REGISTRY_CANONICAL_LAUNCH_PLAN_V2.md).
It supersedes
[`docs/UNISON_REGISTRY_VISUAL_COMPOSITION_CANONICAL_LAUNCH_PLAN.md`](docs/UNISON_REGISTRY_VISUAL_COMPOSITION_CANONICAL_LAUNCH_PLAN.md),
which is retained for provenance only. It does not replace the deterministic
execution plan; it constrains where visual inventory may come from.

Rule: **21st.dev is the sole external design-source ecosystem, used at intake
time only. Unison keeps runtime, semantic, business, artifact, registry,
compilation, persistence and canonical VFS authority.** No 21st runtime
registry, template engine, VFS writer, theme engine, motion engine or artifact
model may be introduced, and generated sites carry no live 21st dependency.

Milestone index (status tracked against the phases below):

- [x] M1 Canonical variant -> VFS parity. Fourteen families now resolve
	registered variants first through the portable-recipe path: navbar, hero,
	services, features, pricing, gallery, testimonials, CTA, contact, footer and
	— new in this batch — about, faq, stats and team. Their twelve registered
	implementations are marked `vfs: { mode: 'portable-recipe' }`, certified by
	`scripts/build-stylex-recipes.mjs`, emitted as
	`/src/components/recipes/{About,FAQ,Stats,Team}.ts`, and the previous
	hard-coded modules are demoted to `Legacy*` fallbacks inside
	`src/sections/compositionToFileSet.ts` (FAQ falls back to `faq:accordion`
	rather than a legacy module). `src/test/narrativeFamilyCompilerConvergence.test.ts`
	proves registry metadata, recipe bytes and emitted identity for all twelve.
	logo-cloud, blog-preview and before-after are now first-class families too:
	nine registered implementations (`logo-cloud:{grid,marquee,brand-lockup}`,
	`blog-preview:{editorial,featured-grid,horizontal-rail}`,
	`before-after:{slider,grid,case-study}`), portable recipes emitted as
	`/src/components/recipes/{LogoCloud,BlogPreview,BeforeAfter}.ts`, legacy
	modules demoted to `Legacy*` fallbacks, and the cross-semantic placeholders
	in `src/sections/registry.ts` / `PageRenderer.tsx` replaced with dedicated
	components. `src/test/firstClassFamilyCompilerConvergence.test.ts` proves
	registry metadata, recipe bytes, emitted identity and no borrowed semantics.
	Runtime evidence is now recorded: `src/test/firstClassFamilyRendererParity.test.tsx`
	renders every registered implementation of all seven new families
	(about, faq, stats, team, logo-cloud, blog-preview, before-after) against the
	emitted `/src/components/*.tsx` and asserts byte-identical markup, so
	registry implementation = canonical VFS implementation = preview/published
	runtime implementation. The FAQ emitter was missing its React import and is
	fixed. Remaining: capture the same evidence from a persisted publish run.

- [x] M2 Registry authority cleanup. The legacy `src/data/siteElementsLibrary/*`
	catalogue is **deleted**. The in-Builder AI receives
	`src/sections/promptContext/canonicalDesignPrompt.ts`, derived from
	`VARIANT_REGISTRY` (registered variant IDs, certified portable-recipe flags,
	defaults, tags) plus `INTENT_REGISTRY` user-action intents filtered by the
	industry intent profile (required / primary / forbidden).
	`componentIntelligenceRegistry.ts` is demoted to structural validation
	metadata only (prop schemas, composition rules, suitability hints); it is
	never a design/variant authority and never enters AI design context.
	`src/test/canonicalDesignPromptAuthority.test.ts` fails the build if the
	retired library reappears or if prompt context imports component
	intelligence. Double-authored variants are tracked under M4.
- [x] M3 21st intake / certification infrastructure. `src/design/21st-intake/`
	is the development-time quarantine and adaptation area — never a runtime
	registry: `provenance.ts` (`TwentyFirstComponentRecord`, `VisualSourceMetadata`),
	`dependencyResolver.ts` (baseline allowlist, Radix scope, 3D capability gate,
	rejected Next/second-animation/second-carousel/duplicate-icon stacks),
	`compatibilityAudit.ts` (Next-only imports, server-only APIs, Tailwind-v4-only
	syntax, foreign color literals, reduced motion, responsive, canonical
	identity, alt contract), `tokenAdapter.ts` (Stage 4b semantic normalization),
	`sourceNormalizer.ts` (import normalization + canonical identity stamping),
	`componentIntake.ts` (`runIntake` steps 3-8 and `planPromotion` steps 9-10),
	`manifest.ts` and `imported/`. `SectionVariant` gains additive
	`source`, `vfs.certification` and `generationStatus` fields.
	`src/test/twentyFirstIntake.test.ts` covers provenance, disallowed
	dependencies, Tailwind v3 compatibility, token normalization, reduced motion,
	canonical identity, certification refusal, no active duplicate after
	promotion, and that no runtime code imports intake modules.
- [x] M4 Replace weak preferred implementations with certified families.
      Legacy inline section modules are removed from `compositionToFileSet`; every
      family now emits through `SECTION_FAMILY_EMIT` and resolves only registered,
      certified variants (no legacy renderer fallback). Added the certified
      `gallery:horizontal-reel` variant. Full suite: 200 files / 1643 tests green.
- [ ] M5 Generated UI Foundation expansion.
- [ ] M6 Artifact / catalog / asset wiring.
- [x] M7 Wizard Registry Context v2. Executable pack-filtered implementation
      metadata, source provenance, certification, page roles and Radix requirements
      reach composition and Lane B. Compiled descriptors determine selected
      vocabulary and bound implementation context. All 17 portable families are
      first-class. Business/project-scoped assets, dependency versions, primitive
      families, capabilities and artifact/slot contracts are bounded projections
      of existing authorities; no parallel registry was added.
- [x] M8 Lane B 21st-aware creative enrichment. Enrichment receives the
      pack-filtered implementation context, the certified runtime dependency
      allow-list and the design vocabulary report, and its validator now
      enforces the 21st identity contract: a proposed page may not declare a
      `data-ut-variant` outside the certified vocabulary and may not drop the
      canonical `data-ut-section-id` values Stage 4b compiled. Legacy requests
      without vocabulary or current sources remain unaffected
      (`src/test/wizardLaneBEnrichment.test.ts`).
- [ ] M9 Visual selection / property inspector.
- [ ] M10 Immersive / 3D expansion (gated behind Phase 6A acceptance).

M1 exit condition is unchanged: Wizard preview implementation = canonical VFS
implementation = Builder Preview implementation = published runtime
implementation. No implementation may exist only as registry metadata.



## September 17: Services, forms and route-design expansion

Twelve additional portable variants are implemented in the existing Variant Registry:

- Services: bento spotlight, editorial rows, expandable service details.
- FAQ: editorial disclosures and searchable questions/answers.
- Contact/forms: editorial inquiry, map studio, checkout support with canonical cart handoff.
- About: image story. Stats: proof grid. Pricing: spotlight. Gallery: case-study rows.

Interior routes derive editorial/showcase choices from certified registry metadata and
an explicit seed. Home, authored page alternatives, section payloads, route presence,
Stage 4b and canonical commit ownership remain authoritative. Maps are opt-in contact
surfaces; stats remain section content; neither creates a new route type. Checkout
support delegates to the existing cart runtime and does not process payments itself.

21st MCP initialization and tools/list succeeded. Services (4192), searchable FAQ
(24932), FAQ 3 (684), contact (4741), checkout (7053) and about (6289) sources were
retrieved for inspection. Provenance distinguishes visual-reference implementations
from source-code adaptations; no upstream license is inferred. The VS Code connection
uses a password input, never a repository-stored key.

Validation covers portable renderer parity, FAQ search, form labels/validation,
map opt-in behavior, gallery dialog/filtering, deterministic route selection, and
canonical recipe persistence. Browser fixtures at 1440px and 390px show no mobile
overflow; FAQ search and reduced-motion behavior were verified. Production build
passes. Final suite: 202 files, 1,753 tests passed, one skipped; type-check, changed-file
ESLint, all four architecture lints and recipe source verification pass. Live
authenticated publishing and delivery of form/payment requests are
not claimed by these checks.

M1 persisted-publish evidence is now closed: `src/test/publishedRuntimeParity.test.ts`
drives the real publish path (`deployToProvider` with a `projectId`, which loads the
durable publish-ready revision from the ledger) for salon-premium, store-premium,
store-minimal and store-boutique. It proves byte parity between the canonical VFS and
the payload handed to the deploy provider (index.html attribution aside), that no
non-canonical file is published, that the sealed composition record keeps identical
`sectionId`/`variantId` identity after publish, that the published fingerprint equals
the canonical VFS fingerprint, and that publishing is refused outright when no
publish-ready revision exists. Stale in-memory caller state is never shipped.

Review locally at /tools/section-variants.html (development only).

## Active Sequence

- [ ] **Phase 0 - Protect and truthfully version the canonical spine.**
	Local authority migration, fixture repairs, and architecture instructions are
	verified, and the reviewed Edge correction is deployed. Still prove persisted
	legacy snapshot restoration and the browser round trip.
- [ ] **Phase 1 - Compiler and Variant Registry convergence.**
	Make registered variant emitters the actual source of generated VFS, starting
	with Gallery, Testimonials, Hero, Services, Features, Pricing, CTA, Footer,
	Contact, and Navbar. Gallery, the three Testimonials variants, all five Hero variants,
	and the three Services, Features, Pricing, CTA, Footer, Contact, and Navbar variants now emit
	portable registry recipes; explicit IDs beat legacy layout aliases.
	The unused legacy JSX swap writer is removed. Sealed projects reject direct
	legacy overwrites of compiler-owned module, router, and page-body paths.
	Retire remaining duplicate compiler visual branches only after convergence
	tests prove equivalent canonical output and Preview/Playground recommit/reload
	evidence.
- [ ] **Phase 1B - Collapse dual compiler authority.**
	Make the single-file compiler a projection of canonical multi-file output.
- [ ] **Phase 1C - Canonicalize the installed 21st foundation.**
	Classify every installed component as generated-primitive, generated-recipe,
	or builder-only; require zero unclassified entries without adding a registry.
- [ ] **Phase 1D - Primitive-recipe contract.**
	Resolve seeded primitive and interaction recipes into contracts and runtime.
- [ ] **Phase 2 - Renderer parity certification.**
	Prove shared structure, semantic tokens, interactions and responsive behavior.
- [x] **Phase 3 - Close all 17 section families.**
	logo-cloud, blog-preview, and before-after now ship dedicated components,
	three variants each, portable recipes, compiler emitters, registry/runtime
	identities and convergence tests. Runtime publish evidence still pending.

- [ ] **Phase 3B - Certified external 21st section ingestion.**
	After foundation closure, certify one authorized Hero through export/import
	and canonical editing before scaling. Enforce dependency/distribution policy.
- [ ] **Phase 4 - Expand premium inventory and primitives.**
	Grow in tested family-sized batches toward 100+ implementations. Every item
	must declare semantic tokens, primitive dependencies, runtime cost, and
	editor identity before it counts.
- [ ] **Phase 5 - Make design vocabulary executable.**
	Resolve Launcher-used vocabulary into registered implementation and primitive
	recipes. The seeded compiler makes final choices; descriptive AI-only
	candidate semantics are retired.
- [ ] **Phase 6 - Expand industry families and page archetypes.**
	Add booking, contractor, SaaS, agency, portfolio, store, and content depth
	without changing topology ownership or adding a generator.
- [ ] **Phase 7 - Complete artifact and editor closure.**
	Cover every runtime surface with stable artifacts, editable slots, intents,
	bindings, data sources, capabilities, and toolbar contracts.
- [ ] **Phase 8 - Prove Playground design round trips.**
	Hydrate artifact and implementation identity, apply structured design
	operations through canonical commit, reload, and recover the same identity.
- [ ] **Phase 9 - Certify import/export symmetry.**
	Test actual round-trip ZIP export/import separately from portable source export.
- [ ] **Phase 10 - Certify rendered visual quality.**
	Run a multi-seed, multi-industry browser matrix across responsive routes,
	interactions, Preview, refresh/reopen, and export-relevant runtime behavior.
- [ ] **Phase 11 - Add optional structured AI augmentation.**
	Introduce `AIEnrichmentEnvelope` and `AIEnrichmentPlan` only after deterministic
	output is premium and round-trippable. AI failure must discard enrichment and
	launch the deterministic base site.
- [ ] **Phase 12 - Scale business runtime verticals.**
	Prove booking first, then commerce, restaurant, and contractor behavior using
	the same artifacts, compiler, commit service, Preview, and Playground.

## Verified Foundations

- `LauncherWizard` is a selection surface and `launchOrchestrator` is the single
	Launcher pipeline owner.
- Generation seed, Template Design Contract V2, derived design implementation
	identity, canonical commit, mutation ledger, and committed handoff exist.
- AI page replacement has been removed from the local Launcher path.
- Stage 4b output is again the preflight input.
- Fourteen section families have at least three registered variants.
- Topology, Wizard context, generated UI foundation, and Radix coverage have
	active local improvements awaiting Phase 0 closure.
- New launch authority proofs use version 2.0 and `canonical-compiler`;
	fixture tests preserve truthful version 1.0 provenance through the read adapter.
- The salon golden fixture uses canonical compiler output and checks final
	sealed snapshot pages; the stale stats assertion is repaired.
- Local validation passed: 141 Vitest files / 1,119 tests, type-check, targeted
	ESLint, all four architecture lints, and the production build. Edge tests
	passed 24/24, including the explicit compact-context compatibility assertion.
- Remote `ai-code-assistant` version 341 is ACTIVE. All 39 fetched source files
	exactly match the reviewed bundle: only `taskClassifier.ts` and
	`orchestrator.ts` changed from v340; the other 37 files are unchanged.
	`contextBuilders.ts` already matched production. The tested
	`shouldUseCompactContext: true` policy and existing custom authentication are
	preserved; an unauthenticated live POST returned 401. Authenticated model
	execution was not exercised by this deployment smoke test.
- Signed-in Salon Premium / Editorial verification committed eight routes
	(Home, About, Services, Pricing, Gallery, Booking, Contact, FAQ). Home
	rendered and reappeared after reload; this is not full durable restore proof.
- Save now forwards canonical Playground state into `commitMutation`.
	Both preview gate passes now reject explicit runtime incompatibility.
	The focused save/commit suites passed 20 tests, type-check and targeted
	ESLint passed, and the canonical VFS writer guard passed. A fresh-module
	browser dry-run confirmed rejection of the broken edit output without a
	revision write. The earlier full-suite result predates these fixes.

## Current Blockers

- Edge deployment drift (opened 2026-09-10, redeployed 2026-09-17): closing the
	full-lint gate edited `supabase/functions/_shared/validate.ts` (inline
	`no-control-regex` disable) and `ai-code-assistant/safetyRules.ts` (redundant
	regex escape removed, proved semantically identical), so the repository stopped
	byte-matching remote `ai-code-assistant` version 341. The follow-up build
	corrections to `ai-builder-propose` (shared CORS import), `ghl-mcp`
	(`mcp-lite@0.10.0` tool/transport API) and `site-runtime-read` (Supabase client
	typing) were also repository-only. All four functions — `ai-code-assistant`,
	`ai-builder-propose`, `ghl-mcp` and `site-runtime-read` — are now deployed from
	the current repository state, so the drift is closed at the source level.
	Remaining open: a fresh remote source fetch has not re-asserted byte equality,
	authenticated model execution was not exercised, and the six Supabase edge
	tests were still not re-run because `vitest.config.ts` includes only `src/**`
	and no separate edge config exists yet.

- Canonical recovery guard: saved snapshot hydration no longer adopts a pending
	local journal, and canonical hydration defers autosave/forced flushes until a
	revision loads. Legacy recovery remains supported; journals are preserved.
	Seven new regressions and 81 focused tests pass, along with types, targeted
	lint and three architecture guards. Hidden-browser Preview and remote pointer
	stability remain unverified; this does not close Phase 0/1 or Gallery.

- Sequencing update: expand and verify shared primitives and component registries
	across industries before new live 3D and advanced animation. Phase 6A now owns
	that implementation after Phases 1-6 acceptance; existing animations and
	persisted sites remain supported. Compatibility hardening does not authorize
	early immersive rollout. The derived registry now exposes variant-owned emitter
	and Radix requirements, with Gallery compiler checks across all five existing
	Gallery-bearing templates. This does not close Gallery's runtime/visual gates
	or permit skipping to another family. See the execution plan for acceptance.

- Experience capability foundations are integrated into the existing guidebook
	phases, without granting AI canonical VFS ownership. Explicit empty visual
	approval now denies 3D; Launcher approval is separate from business capabilities
	and survives canonical sealing/recompile/reload. Legacy manifest reads no longer
	grant undeclared 3D or invent a React 19 profile. Registered variants can now
	*declare* an experience dependency against a design vocabulary entry without
	enabling it, launch approval is requirement-derived (eligibility alone no longer
	grants the 3D capability), and the sealed AI directive no longer instructs
	composing an immersive layer the launch would reject at save time. Vocabulary
	executability is now measured: seven entries are backed by registered
	implementations, the rest are reported unimplemented, and the directive names
	the implementations the launch actually resolved. 1,268 tests, `npm run lint`
	(now 0 errors), both typechecks, four architecture lints, recipe freshness and
	the production build pass. Legacy execution/migrations,
	recompile profile preservation, exact renderer pins, versioned budgets and
	registered 3D visual/editor closure remain open. See the execution plan's
	Experience Capability Integration section. Phase 0 and Phase 1 remain open.

- Gallery failed-media behavior now survives UI save and cold reopen in revision
	`a8e603cd-c81d-4f9a-8e0a-e36cf750b1cc`, retaining v2 authority and exact runtime
	bytes (excluding revision-only sidecars). Thumbnail/lightbox fallbacks and
	ArrowRight recovery were observed in the persisted DOM. Stale browser captures
	and an unexpected route change leave desktop/mobile visual verification open.
	Dirty-state/Back checks now use saved VFS; successful manual Save requests
	durable rehydration so recompiled recipes reach Preview without reload.
	Tests, types and targeted lint pass; that refresh still needs browser proof.
	Final validation: 1,222 tests/153 files, production build, recipe freshness
	and all three architecture guards pass; existing full-lint blockers remain.
	Unrequested revision `92d85144-e46c-4552-862d-42885b962a35` is preserved and
	startup/autosave closure remains open. See the execution plan for the ledger
	and browser-targeting caveats. Phase 0 and Phase 1 remain open.

- V2 authority launch/save/reopen is now verified. Production Launcher and
	canonical recompile forward their compiler artifact into proof validation.
	Fresh verification draft `a3f494e1-7e07-4287-854e-058ad124c675` recovered
	revision `2adbfb40-6cbe-4d86-865b-f62f6d8e6d85` without route state, retaining
	v2 authority for eight pages and exact runtime/snapshot equality. Home and
	Gallery rendered; `gallery:feature-split` wrapper/implementation IDs agree.
	Reopen/page switching did not advance the pointer. Full suite: 1,210 tests;
	types, targeted lint, build and writer/pipeline guards pass. Startup handoff
	still triggers an unsolicited save; full lint, legacy migration, Gallery
	media/export/performance and Testimonials convergence remain blockers.

- Authenticated continuation (2026-09-08): persisted Playground visibility edits,
	UI save and cold reload now work for the eight-page verification draft.
	Restore-driven variant commits, duplicate hydration, autosave byte baselines,
	runtime identity loss and business-context inheritance were corrected.
	Unintended autosave history was preserved; canonical restoration recovered
	eight pages/one funnel. Two later automatic ledger restores were also preserved;
	ledger drift observation is now read-only by default, with explicit Restore
	covered by mounted tests. Latest checked revision
	`2ebd0381-90d7-4880-9464-3541504568b0` preserves Playground, bindings, exact
	Gallery recipe bytes and runtime/snapshot equality. See the execution plan
	for the remote write ledger. No schema or deployment changed in this batch.
	Real Dialog/Slot/Accordion now execute in Preview; all eight routes render,
	FAQ toggles, and Gallery dialog pointer/keyboard/focus checks pass at 375px.
	Sandpack device sizing is wired and a mobile screenshot was captured.
	Full suite passed 1,207 tests before the final two passing ledger tests;
	types, focused lint, production build and three architecture guards pass.
	Full lint still fails with ten existing errors. Fresh v2 authority proof,
	Gallery media/performance/export closure, toolbar pointer reliability and
	Testimonials convergence remain open. Runtime reconciliation and five intent
	bindings still block publish. Phase 0 and Phase 1 are not closed.

- Gallery responsive continuation: Masonry, Cinematic Grid and Lightbox Grid
	now scale from one mobile column to two tablet columns and the selected
	desktop count. All 169 focused tests pass. Browser checks verified 27 settled
	layout cases at 390/768/1440px without horizontal overflow; the emitted
	Lightbox Grid also passed real click, focus wrapping, arrow navigation,
	Escape and focus restoration at desktop/mobile widths. This supersedes the
	earlier fixed-column and hidden-browser findings for those checks only.
	Screenshots are isolated generated-runtime evidence, not persisted Preview
	or Playground edit/reload closure. Existing image/content and performance
	gaps remain; Phase 1 is not complete.

- Gallery accessibility continuation: all five registered variants now share
	a Radix Dialog lightbox with scoped arrow navigation, trapped/restored focus,
	background isolation and canonical Dialog/icon facade imports. The 166
	focused tests, type-check, targeted lint, recipe freshness and writer/pipeline
	guards pass. The 21st review is clean. Real browser pointer/keyboard checks
	are blocked by the shared tab's hidden visibility; persisted editing and
	full visual/accessibility certification remain open. No new variant or
	authority was introduced.

- Phase 1 Gallery batch (2026-09-08): all five existing registered components
	now compile from their shared React sources into a generated portable family
	module. Four duplicate visual branches are removed; layout-only aliases and
	legacy reel/default compatibility remain. Stage 4b now preserves semantic
	JavaScript color helper calls instead of rewriting them into invalid source.
	159 focused tests pass, including exact recipe bytes through sealing and
	Playground recompilation, Preview preparation, DOM parity and interactions.
	Isolated browser fixtures rendered all five variants at 1440px and 390px
	without horizontal overflow. One template image failed to load; some imagery
	does not match its labels. Persisted Preview/Playground editing, focus-trap
	accessibility, full responsive quality and export/import remain uncertified.
	No assets were added and no phase is declared complete.

- All generated-site recipe expansion now uses the eight-dimension acceptance
	matrix in `docs/DETERMINISTIC_AI_DESIGN_EXECUTION_PLAN.md`: composition,
	visual design, interactions, accessibility, content resilience, deterministic
	eligibility, performance and persisted round-trip proof. Radix supplies
	behavior; StyleX styles are precompiled into portable assets consumed through
	the existing compiler and Stage 4b bridge. Generated FAQ variants and all
	three navbar layouts now consume compiled recipes; mobile navigation uses
	Radix Dialog with registry dependency metadata. The 118 recipe, variant and
	golden-launch tests pass, including menu focus/dismissal and breakpoint
	cleanup. Types, targeted integration lint and architecture guards pass.
	Browser interaction/resize verification is incomplete because the diagnostic
	tab remained hidden; persisted closure and performance budgets are still
	open. Production builds check compiled recipe freshness. This is not an
	all-industry rollout certification.

- Hero registry now includes compact `hero:page-title` and wide-image
	`hero:editorial-banner` implementations, emitted from their shared React
	source. Subpage role defaults select split for About/Services, full-bleed for
	Gallery/Shop, page-title for Pricing/FAQ/Checkout/Thank You, and editorial
	banner for Booking/Contact/Blog/custom. Home retains its selected composition;
	explicit page-local overrides win over role defaults. Inherited Home hero
	overrides no longer flatten subpages. 124 focused tests, type-check and the
	pipeline guard pass. Desktop/mobile component DOM checks found no horizontal
	overflow and loaded banner media; screenshot capture was unsuccessful.
	Persisted Wizard/Playground round-trip verification remains open. These are
	deterministic role defaults; Salon Pricing/FAQ now additionally select seeded
	page alternatives as described below.
- Wizard section-loss correction: Home now retains all selected template
	sections instead of applying the subpage role filter. Unbound catalog
	hydration no longer hides authored sections; explicit binding hide policies
	are preserved. The 114 focused tests, type-check, targeted lint, pipeline
	bypass and single-source guards pass. Browser compile of Salon/Editorial
	emits Home 10, About 7, Services 6, Pricing 6, Gallery 6, Booking 7,
	Contact 6, FAQ 6, with exact sealed-page parity. These counts include chrome.
	Existing persisted six-section Home revisions are not rewritten. The shared
	old preview now renders Services and Testimonials again. Fresh-launch DOM
	closure remains unverified. The earlier Pricing/FAQ content gap is addressed
	by the explicit compositions below; the counts above predate that change.
- Salon Premium now owns page-only Pricing and FAQ source inventory and four
	explicit ordered alternatives. Home remains 10 sections. Pricing alternatives
	have 5 or 7 sections; FAQ has 5 or 6, including chrome. Counts derive from
	ordered section references. Template, role, theme and sealed seed select an
	alternative independently of random page IDs. Source and instance identities,
	hero choices and composition IDs survive canonical Playground recompilation.
	Malformed references, duplicate identities and unknown hero variants reject.
	An isolated browser mount of finalized generated modules rendered the
	7-section Pricing and 6-section FAQ variants at desktop/mobile widths; FAQ
	interaction and banner image loading passed, with screenshots captured.
	This was not a persisted Preview session. A long business name overlaps the
	existing centered navbar on mobile. Capability eligibility, all-alternative
	browser coverage and structured edit/recommit/reload closure remain open.
- Save finalization now precedes sealing for non-Wizard commits through the
	existing canonical finalizer. Runtime modules are emitted before preflight;
	reconciliation no longer rewrites sealed files. Router projection is aligned
	with final VFS, and duplicate post-seal foundation injection was removed.
	A real compiler/commit/reload test enforces database-style runtime equality
	and preserves Gallery identity/bindings through a structured title edit.
	All 1,182 tests passed; the final manifest-fallback removal passed 24 focused
	tests. At that earlier checkpoint the browser returned 401 before project
	access and no remote revision changed. Authenticated evidence above supersedes
	that checkpoint; no schema changed. See the
	execution plan for evidence boundaries; Phase 0 and Phase 1 remain open.
- Reloaded Builder autosave identity adoption is locally fixed: revision
	hydration now adopts its persisted draft/project identity
	into Builder and hook state before autosave. Save-to-Projects guards failed create/update outcomes before
	success, dialog dismissal or recovery-draft deletion; panel-save failures
	also reject correctly. Executable React effect tests exposed and fixed a
	draft hydration cache key that ignored revision changes. Same-draft commits
	now refresh the durable projection; stale project responses are ignored.
	All 27 focused save/finalization/hydration tests, type-check and targeted lint
	pass. Effects are tested in isolation, not through a mounted Builder journey.
	The earlier 401 blocker is superseded by the authenticated continuation above.
	The earlier verification-copy identity shell remains unchanged.
- The original browser verification revision lacks v2 authority fields; the
	new draft above proves v2 launch/save/reopen without relabeling old history.
- Version 1.0 compatibility is fixture-tested and the original persisted page
	structure was restored; complete legacy authority migration remains uncertified.
- The authenticated journey proves eight rendered routes and a visibility edit,
	save/reload and clean hydration. Every-route reopen, all-variant identity,
	full responsive/visual quality and export/import closure remain uncertified.


## 2026-09-17 - 21st-derived variants across Launcher industries

- Fresh launches prefer certified 21st-derived variants within all 14 style packs
  and the Home role envelope, across all 10 visible Wizard industries.
- Explicit interior-page choices survive inherited Home overrides; checkout
  support stays confined to checkout routes. Existing stored designs are preserved.
- Registry Context v2 now carries executable implementation provenance and
  compatibility to Lane B. See the continuation entries in both execution plans
  for implementation evidence and remaining milestone limits.
- Local industry preview: /tools/industry-launch-variants.html. This is a component
  review fixture, not evidence of a persisted or published launch.


## 2026-09-17 ? structured composition and popular-source intake

Implemented the first structured AI composition pass before canonical compilation. AI selects existing section-family order and eligible local variant IDs, preferring suitable 21st sources. Strict validation checks the pack, page role, family and portable implementation. The compiler retains every business section and owns navigation, hero/footer placement, themes, intents and files. Historical behavior (superseded): accepted choices skipped refinement. Accepted plans now reach validated Lane B refinement. Historical behavior (superseded): invalid or unavailable responses used a starter path. New launches now require a valid AI composition.

This phase does not remove templates: they remain semantic content baselines and fallback. Arbitrary section insertion/removal and replacing the Wizard template-selection step remain follow-up work. The new wizard-composition backend mode is implemented locally and requires deployment for live use.

Retrieved eight React prototypes through the 21st MCP: Scroll Expansion Hero, Container Scroll Animation, Spline Scene, Spotlight Card, Radial Orbital Timeline, Bento Grid, Scroll Morph Hero and Testimonials Columns. Popularity was observed from the public catalog and creator pages on the intake date; MCP component search is relevance-ranked, not a verified popularity sort. Original sources and metadata are quarantined under src/design/21st-intake/quarantine/popular-2026-09-17. Source licenses were not supplied by MCP and are not assumed. Local spotlight cards and testimonial columns are visual-reference implementations with portable compiler parity coverage. Unsupported heavy prototypes remain references.

The user-supplied PrismaHero is preserved verbatim under src/design/21st-intake/quarantine/user-prisma-2026-09-17, mapped to the existing hero:prisma-cinematic implementation. Its oversized type, asymmetric copy, media scrim and restrained word reveal inform the composer. Demo media URLs, placeholder navigation and hardcoded colors are not generation defaults. This is durable repository context, not a claim of external/personal AI memory. No runtime 21st API calls or credentials are introduced.


### 2026-09-17 ? Wizard composition wiring correction

Production source inspection confirmed the deployed ai-code-assistant lacked wizard_composition support. The first local implementation also inherited code-generation instructions and used a 20-second client timeout against 35-second provider attempts. Composition now dispatches directly to a JSON-only lane before the general builder pipeline; malformed source/file responses receive a 502 composition_contract error. The client allows 90 seconds, requires coverage of every requested role, and records provider/transport/invalid-response/incomplete-plan fallback reasons. Regression coverage round-trips the backend response through client validation and canonical snapshot compilation.

The corrected ai-code-assistant was deployed to the linked nfrdomdvyrbwuokathtw project. An unauthenticated production request returned 401, preserving the auth gate. Authenticated live generation remains unverified because the available browser session is signed out. Frontend changes remain local until published through the application deployment workflow.


## 2026-09-17 ? Dedicated Wizard site composer

The Launcher now has three steps: Idea, Goals/pages and Brand style. Removed template/layout cards, selected-template state, layout preview and template design inspector from this UI. The launch service resolves an internal industry content baseline for canonical topology and behaviors; users no longer choose it.

Wizard requests use wizard-site-composer through the existing authenticated/retrying transport. The dedicated function validates the brief, researches only the public industry category, reads the authenticated user's last three layout summaries, and asks for original page copy and registered local variants with a fresh launch seed. 21st-derived portable variants are preferred when suitable. No remote component code is imported at runtime.

Plans cover every requested page, carry section order, variant IDs and bounded plain-text copy (headlines, descriptions, service/feature items and FAQs). The compiler preserves existing section identities, actions, assets and business data; it can add eligible about/features/services/FAQ/contact/CTA sections with supplied copy. No arbitrary source code, routes, theme or dependencies are accepted. The baseline remains an internal semantic content source, not a selectable design preset. Full arbitrary content-model replacement is not implemented.

Invalid generation fails visibly with retry guidance; it no longer silently hands off a starter as an AI result. Accepted layout summaries are stored per authenticated user in the existing ai_learning_sessions table; no schema migration is required. Memory/research failures are nonfatal, and research is untrusted design context, never evidence for invented business claims. Fresh seeds and recent-layout context encourage diversity without guaranteeing uniqueness.

Verification: three-step browser flow and mobile review; backend brief-schema/client/compile regression tests; copy/section addition tests; full suite 1,788 passed, one skipped; TypeScript, Deno and architecture checks passed. Authenticated provider-to-live-preview verification remains pending an available signed-in session. Frontend changes still require application deployment.


### V3 convergence: sequencing repair (user-adjusted policy)

- Contextual AI composition remains required; generation failures remain explicit.
- Accepted plans now reach Lane B with the chosen order, variants and copy as context.
- Valid page candidates merge independently; rejected pages retain their AI-composed Stage 4b sources.
- Enrichment timeout preserves compiled pages without a false fatal launch status; cancellation still stops the run.
- Template cards remain removed. No extra design-source intake or business schema change in this batch.
- Lane B now uses the existing TSX parser, accepts modern JSX and local layout dimensions, and retains palette/global-theme ownership checks.
- Verification: 207 test files passed; 1,809 tests passed and one skipped. Type checking, production build, targeted ESLint, and all four architecture checks passed. Build retains large-chunk warnings. Authenticated provider-to-persisted-preview verification remains outstanding.
- Next: reconcile 21st promotion records and continue registry/asset convergence.

## V3 continuation: explicit source-license review

Implemented the license-review prerequisite of Batch 3. Source intake now defaults to unverified; certification requires a matching recorded license, evidence source and valid verification date. Promotion planning rechecks that evidence, including stale certification results. The intake CLI no longer invents a community-default license or treats dependency approval as promotion approval.

Existing source records and preferred variants have not been retroactively certified. Their license strings are not evidence of completed review. Atomic multi-file promotion, reconciliation of existing promotion manifests/records, and promotion-closure tests remain unfinished. No runtime registry eligibility changes were made in this prerequisite batch. AI composition remains required.

Verification: 17 intake tests passed, including missing/rejected/incomplete review and stale-certification cases; CLI syntax check passed.

### V3 continuation: guarded registration and rollback

The existing unison-variant-register command now shares the intake provenance gate, validates source identity, explicit adaptation certification, component/recipe presence and output paths before writing. It stages registry, thumbnail and lifecycle changes together and restores previous file bytes after a caught write failure. Registration records implementationId and lifecycle step 9; it no longer claims archival step 10. The Windows root-path conversion is corrected.

Verification: 21 focused intake/promotion tests passed, including check-only behavior, idempotency, no-write rejection and injected failure rollback. The repository check intentionally reports eight blocked existing specs with missing verified license reviews, mismatched source metadata and uncertified adaptations. Existing production registry entries were not changed or retroactively certified.

Batch 3 remains incomplete: process-crash recovery, running portable/visual certification within the transaction, archival and reconciliation of existing specs still require implementation/evidence. The current transaction rolls back caught write errors; it is not crash-atomic across files.

### V3 continuation: registry agreement and resolved artifact context

Promotion registration now parses registry TypeScript to verify that the unique entry, component and recipe imports, source metadata, portable approval and aliases match the spec before lifecycle changes. Duplicate specs are rejected. The read-only --audit command reports evidence and registry gaps together as JSON, returning a failing exit code while gaps remain. Current audit: eight specs, 32 findings; no source reviews or certification flags were fabricated.

Batch 4 has begun independently: eligible implementation summaries include artifactContract derived from the canonical artifact registry (slots, intents, data-source kind and AI edit scope). The production Lane B projection carries these contracts, and older snapshots without them remain supported. This is context for validation-aware generation, not a new contract owner or permission grant. Assets, broader dependency/primitive/capability context, composition-planner consumption and Builder migration remain open.

Continuation verification: 208 test files passed, 1,831 tests passed and one skipped. TypeScript, targeted ESLint, single-source-of-truth and catalog-contract checks passed. The promotion audit remains intentionally failing for the 32 recorded evidence/registry findings.


### 21st-only generation and promotion reconciliation (current checkpoint)

This checkpoint supersedes the earlier eight-blocked / 32-findings status. The read-only promotion audit now reports eight specs, five explicitly retired records and zero findings. Three original sources (footer:brand-social, testimonials:marquee and stats:metric-cards) have verified MIT evidence, reconciled registry metadata, component review hashes and archived intake sources. The other five remain unverified and are excluded from new generation; retirement resolves their registry disposition, not their licenses. Saved documents can still resolve their historical IDs.

New generation, AI plan validation, Wizard selection/context and Builder layout pickers share getGenerationVariantsForSection: only non-legacy 21st-derived implementations with approved portable recipes are eligible. Every semantic family has coverage across all art-direction packs. Seven new local variants fill coverage and quality gaps: hero:launch-showcase, navbar:catalog-bar, cta:inset-panel, team:profile-cards, blog-preview:four-columns, before-after:reveal-panel and logo-cloud:reveal-tiles. Source adaptations and original visual-reference implementations are explicitly distinguished; source receipts and archived retrievals preserve that distinction. No runtime MCP dependency or credential is added. Layout thumbnails now depict each new layout's structure.

AI contextual composition remains mandatory. Optional Lane B refinement retains accepted AI-composed pages if refinement fails. Legacy implementations remain available for saved-content compatibility, not as fresh Wizard alternatives.

Registration now journals original bytes before mutation and supports --recover after process interruption. Recovery refuses to overwrite edits made after the interrupted transaction. Tests terminate an actual child process between writes, recover and retry. This is crash recovery, not simultaneous multi-file visibility or a claim of power-loss durability. Step-10 source archives and the development-only intake manifest are reconciled.

Verification: 209 test files passed; 1,858 tests passed, one skipped. TypeScript, production build, all four architecture checks and the promotion audit passed. The build retains its existing large-chunk warning. Local desktop/mobile industry previews rendered without horizontal overflow or reported browser errors. These fixtures do not verify authenticated AI provider, persistence or publishing.

Remaining V3 scope is explicit: remaining Builder/context migration, launch-state and intent convergence, broader foundation work and authenticated persisted/published round trips. Project/business asset projection, artifact/slot contracts and bounded dependency/primitive/capability context now reach composition and Lane B through Registry Context v2. Promotion execution still consumes recorded adaptation reviews; portable/visual verification is performed separately rather than inside the write transaction. This checkpoint does not certify completion of every V3 batch.

### Wizard composition rejection repair

The composer previously described copy as optional while rejecting pages without copy under composition_catalog. Copy is now required in the prompt and example. The endpoint validates requested page coverage, unique family order, role-eligible IDs and nonempty body copy before memory writes; one bounded AI repair receives explicit validation paths. Failure remains visible after that repair, with no starter substitute. The client advertises per-role IDs using the same generation eligibility function used by its validator. The accepted composition plan is now explicitly attached to the Wizard seed before Stage 4b and retained by the contextual seed in canonical persistence and handoff.

OpenAI configuration audit confirmed OPENAI_API_KEY exists in the linked project and AI_PROVIDER_MODE is hybrid. Values were not printed or copied. Secret presence does not verify current key validity, billing or a successful authenticated model call. Deployed the tested wizard-site-composer repair to nfrdomdvyrbwuokathtw. Frontend changes remain local. Focused repair, composition, failure and handoff tests: 45 passed; frontend and edge-function type checks and canonical-write/pipeline checks passed. The full run passed 208 files with one new test-scope error; correcting that test and rerunning the affected four files passed. Live authenticated provider-to-persisted-preview verification remains pending.

### Canonical enrichment transport and routing repair

Enrichment used a 60-second browser deadline despite a 105-second batch-planning budget. The client now allows 110 seconds; the direct enrichment dispatch bounds server work to 100 seconds. Canonical proposals bypass general Builder preprocessing/source normalization and retain their identity/fileOps envelope. The server checks registered paths, duplicate writes, source presence and request identity before returning candidates; the existing client TSX/import/intent/theme validation, preflight and commitMutation remain authoritative.

Failures now retain safe HTTP/error-type diagnostics instead of the generic unavailable message. Provider availability remains distinct from invalid proposals. Verification: 210 test files, 1,874 passed and one skipped; frontend/edge type checks and canonical-write/pipeline checks passed. Live authenticated success is not established by these tests; the available verification browser remains signed out.
