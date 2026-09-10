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

## Active Recovery — Canonical page composition

- [x] Thread strict `SiteConfiguration` and per-route composition contracts into compilation before VFS emission.
- [x] Enforce route hero, section order, depth, and visual quality before sealing.
- [x] Preserve the sealed `SiteConfiguration` across `recompileFromPlayground` so recompiles reuse the launch contract instead of re-deriving one.
- [x] Make `designImplementationRegistry` the single lookup for industry-allowed art direction (`resolveIndustryArtDirectionPackId`) and industry section coverage; `wizardDesignIntervention` no longer calls the pack resolver directly.
- [x] Delete zero-importer legacy services (`aiIntegrationService`, `automationToggleService`, `businessSystemSnapshot`, `capabilityProvisioner`, `monacoVFSSync`, `systemsAI`).
- [x] Remove residual page-authoring fallback and source-repair APIs; syntax validation is immutable and canonical commits reject invalid authored output without substitution.
- [x] Certify Wizard → Builder rendering in a browser run: Salon Premium generated eight pages, sealed the canonical site, and navigated to `/web-builder` with the generated page tabs intact.

## Active Sequence

- [ ] **Phase 0 - Protect and truthfully version the canonical spine.**
	Local authority migration, fixture repairs, and architecture instructions are
	verified, and the reviewed Edge correction is deployed. Still prove persisted
	legacy snapshot restoration and the browser round trip.
- [ ] **Phase 1 - Compiler and Variant Registry convergence.**
	Make registered variant emitters the actual source of generated VFS, starting
	with Gallery and Testimonials. Retire duplicate compiler visual branches only
	after convergence tests prove equivalent canonical output.
- [ ] **Phase 1B - Collapse dual compiler authority.**
	Make the single-file compiler a projection of canonical multi-file output.
- [ ] **Phase 1C - Canonicalize the installed 21st foundation.**
	Classify every installed component as generated-primitive, generated-recipe,
	or builder-only; require zero unclassified entries without adding a registry.
- [ ] **Phase 1D - Primitive-recipe contract.**
	Resolve seeded primitive and interaction recipes into contracts and runtime.
- [ ] **Phase 2 - Renderer parity certification.**
	Prove shared structure, semantic tokens, interactions and responsive behavior.
- [ ] **Phase 3 - Close all 17 section families.**
	Replace logo-cloud, blog-preview, and before-after placeholders with dedicated
	components, variants, artifacts, emitters, identities, and round-trip tests.
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

- Edge deployment drift (2026-09-10): closing the full-lint gate edited
	`supabase/functions/_shared/validate.ts` (inline `no-control-regex` disable)
	and `ai-code-assistant/safetyRules.ts` (redundant regex escape removed, proved
	semantically identical). The repository no longer byte-matches remote version
	341; a redeploy is required before that match is re-asserted. Nothing was
	deployed. The six Supabase edge tests were not re-run because `vitest.config.ts`
	includes only `src/**` and no separate edge config exists yet.

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
	phases, without restoring AI page-source authorship. Explicit empty visual
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

## UNISON product foundation
Done:
- All nine industries aligned in INDUSTRY_MATRIX (anchor capability, conversion
  journey, profile fields, allowed art-direction packs); `contractor` is now a
  first-class entry and `industryParity.ts` fails the build on any gap.
- `resolveArtDirectionPackId` accepts an industry allow-list, so an industry can
  never be handed an art direction its journey does not support.
- `resolveSiteConfiguration()` in `resolvedComposition.ts` — one deterministic,
  signed answer to which pages/sections/capabilities/journey/art direction an
  industry gets. Stamped into `SiteBundleSnapshot.meta.siteConfiguration`.
- Launcher is now eight steps (industry, profile, goals, pages, capabilities,
  template, style, review). Profile answers, selected capabilities and social
  links persist through `WizardSelections` into draft metadata.
- Removed dead `WizardTopAction`.

Remaining:
- Journey sections + variant coverage + industry distinctiveness lint.
- `integrations` persistence + provider-adapter map (move GHL behind it).
- Public marketing routes and `/app` shell.
- Entitlement tiers on the existing `useEntitlements` hook.
