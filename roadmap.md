# Unison Roadmap

The authoritative implementation sequence is
[`docs/DETERMINISTIC_AI_DESIGN_EXECUTION_PLAN.md`](docs/DETERMINISTIC_AI_DESIGN_EXECUTION_PLAN.md).
This file is the concise status index. A phase moves to **complete** only after
its registry-to-runtime closure tests and required runtime evidence pass.

## Protected Architecture

```text
LauncherWizard
	-> runLaunchPipeline
	-> deterministic resolution and canonical compiler
	-> Stage 4b
	-> commitMutation / VFSCommitService
	-> SiteBundleSnapshot and revision
	-> Live Preview and Playground
```

- Launcher is deterministic and must remain fully launchable without AI.
- Stage 4b is the only global theme authority.
- `commitMutation` is the only accepted mutation boundary.
- Preview and Playground consume committed canonical artifacts.
- New inventory is incomplete until it survives the full canonical round trip.
- AI may propose structured, registry-aware enrichment operations. It may not
	author Launcher pages, write VFS directly, change topology, or create an
	alternate snapshot or preview authority.

## Active Sequence

- [ ] **Phase 0 - Protect and truthfully version the canonical spine.**
	Local authority migration, fixture repairs, and architecture instructions are
	verified, and the reviewed Edge correction is deployed. Still prove persisted
	legacy snapshot restoration and the browser round trip.
- [ ] **Phase 1 - Compiler and Variant Registry convergence.**
	Make registered variant emitters the actual source of generated VFS, starting
	with Gallery and Testimonials. Retire duplicate compiler visual branches only
	after convergence tests prove equivalent canonical output.
- [ ] **Phase 2 - Close all 17 section families.**
	Replace logo-cloud, blog-preview, and before-after placeholders with dedicated
	components, variants, artifacts, emitters, identities, and round-trip tests.
- [ ] **Phase 3 - Expand premium inventory and primitives.**
	Grow in tested family-sized batches toward 100+ implementations. Every item
	must declare semantic tokens, primitive dependencies, runtime cost, and
	editor identity before it counts.
- [ ] **Phase 4 - Make design vocabulary executable.**
	Resolve Launcher-used vocabulary into registered implementation and primitive
	recipes. The seeded compiler makes final choices; descriptive AI-only
	candidate semantics are retired.
- [ ] **Phase 5 - Expand industry families and page archetypes.**
	Add booking, contractor, SaaS, agency, portfolio, store, and content depth
	without changing topology ownership or adding a generator.
- [ ] **Phase 6 - Complete artifact and editor closure.**
	Cover every runtime surface with stable artifacts, editable slots, intents,
	bindings, data sources, capabilities, and toolbar contracts.
- [ ] **Phase 7 - Prove Playground design round trips.**
	Hydrate artifact and implementation identity, apply structured design
	operations through canonical commit, reload, and recover the same identity.
- [ ] **Phase 8 - Certify rendered visual quality.**
	Run a multi-seed, multi-industry browser matrix across responsive routes,
	interactions, Preview, refresh/reopen, and export-relevant runtime behavior.
- [ ] **Phase 9 - Add optional structured AI augmentation.**
	Introduce `AIEnrichmentEnvelope` and `AIEnrichmentPlan` only after deterministic
	output is premium and round-trippable. AI failure must discard enrichment and
	launch the deterministic base site.
- [ ] **Phase 10 - Scale business runtime verticals.**
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
- Non-Wizard recompilation omits the runtime modules emitted by canonical
	launch finalization. Preflight also changes Contact and Booking page bytes
	without updating the candidate snapshot, causing the database's runtime
	VFS/snapshot equality guard to reject persistence. Finalization must precede
	sealing; do not weaken the guard or copy stale runtime bindings.
- Reloaded Builder autosave skips because canonical project identity is not
	hydrated. Save-to-Projects can report success and dismiss the dialog after
	the content commit fails; one verification-copy identity shell was created.
- The browser verification revision's seal lacks v2 authority fields; new
	launch authority propagation is not yet certified end to end.
- Version 1.0 compatibility is fixture-tested; persisted legacy snapshot
	restoration has not yet been certified.
- No browser journey yet proves every selected route renders, refreshes, and
	reopens from the committed revision without fallback output, including
	Playground hydration, edit, recommit, and reload.
