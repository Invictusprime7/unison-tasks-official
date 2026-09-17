# Registry and visual composition implementation design

Source: `UNISON_REGISTRY_VISUAL_COMPOSITION_CANONICAL_LAUNCH_PLAN.md`, supplied September 15, 2026. This design maps that proposal to the current working tree. It does not adopt the document's embedded execution prompt as a new repository policy.

## Outcome and boundaries

The redesigned Wizard remains the selection surface. `launchOrchestrator` coordinates the existing compiler, enrichment, validation, and commit stages. A registered capability must retain its identity through generated files, sealing, Preview, editing, and reload before being described as fully wired.

The implementation proceeds in reviewable batches. Start with registry integrity, then make a complete deterministic tech hero, then expand composition families. Keep the recent Wizard UI changes intact.

There is an unresolved policy conflict: the supplied plan and the current orchestrator permit validated Lane B candidate page bodies, while `copilot-instructions.md`, `roadmap.md`, and portions of the execution plan prohibit AI-authored Launcher page replacement. This batch changes neither policy nor candidate acceptance. Resolve those documents against the intended product policy in a dedicated change before expanding AI authority. Registry discovery can proceed independently.

## Verified audit and migration table

| Current file / surface | Finding | Disposition and implementation |
| --- | --- | --- |
| `src/platform/core/generatedUiFoundation.ts` | Emits twelve motion components; prompt prose and validator disagree about expanded exports. | KEEP owner. Export the actual component inventory here. In a following gate batch, derive prompt and validation names from snapshot-compatible capabilities. |
| `src/services/launch/wizardRegistryAggregation.ts` | Restates twelve motion names. Includes sections, artifacts, catalogs, profiles and signature, but no full implementation, asset or vocabulary projection. | MIGRATE duplicate list to foundation-owned inventory now; design context v2 below. |
| `src/sections/variants/types.ts` | Only one `vocabulary` reference is supported. | KEEP shorthand; add optional readonly `vocabularyRefs`. |
| `src/services/designImplementationRegistry.ts` | Reverse index consumes only the shorthand. Signature covers ID, category and default flag. | MIGRATE index to category-qualified, deduplicated union. Keep persisted signature semantics in this batch; version capability fingerprints separately before broadening them. |
| `src/services/wizardDesignIntervention.ts` | Resolved design-language prose reads only `implementation.vocabulary.id`. | MIGRATE to normalized multi-reference projection in the next consumer batch; continue describing selected implementations, not every global capability. |
| `src/services/launch/launchOrchestrator.ts` | Reads `.vocabulary` from active variant values, although values are string IDs. Already stamps registry context into seed/snapshot/VFS. | MIGRATE the broken report to `vocabularyExecutabilityReport()`, then a launch-eligible projection. Test the actual enrichment request and existing handoff. Do not introduce another writer. |
| `src/services/wizardLaneBEnrichment.ts` | Has a vocabulary report but no explicit bounded aggregate context. | KEEP validation/merge boundary; add a typed context projection after integrity and compatibility gates pass. |
| `src/sections/variants/artDirectionPacks.ts` | Canonical pack owner already exists. Tests already verify pack IDs against variants. | KEEP. Also prove IDs resolve through the implementation registry; expand existing packs only after recipes work. |
| `src/services/assetRegistry.ts` | Used by Design Studio and scene hooks; not aggregated by Launcher. | KEEP existing owner. Audit business/project scoping and persistence before exposing a read-only media projection. Never send an unscoped browser cache to AI. |
| `src/platform/core/artifactRegistry.ts` and `catalogSurfaceRegistry.ts` | Already aggregated. Decoration and persisted business rows have distinct contracts. | KEEP separation. Add metadata only alongside an inspector/compiler consumer. Add catalog surfaces only with storage, editor and hydration support. |
| `src/platform/core/experiencePrimitives.ts` and `generatedRuntimeCapabilities.ts` | Existing capability and runtime owners. | KEEP. Context v2 derives availability from the snapshot's approved capability set, not package installation or vocabulary presence. |
| `src/services/componentIntelligenceRegistry.ts` | Consumed by section registry and canonical pipeline. | KEEP; this is not an orphan merely because it is absent from the aggregate. Audit relevant metadata before projecting it. |
| `src/services/canonicalComponentRegistry.ts` and `unisonCanonicalRegistry.ts` | Used by Builder, Playground hydration, preview artifacts and protected-file handling. | KEEP active semantics; do not replace with the visual implementation index. |
| `src/services/builderBrainClient.ts` / `runBuilderTurn` | Production orchestrator still calls this client. | KEEP active transport; not evidence of an orphan by itself. |
| `interactionManifest` across compiler, seal and commit | Actively carried through canonical pipeline and VFS commit. | KEEP; reuse for interaction recipes and budgets. |
| `src/services/aiSitePreflightRepair.ts` | Still used by canonical launch and preview preparation. | KEEP pending behavioral audit; legacy comments do not justify deleting active code. |
| `src/components/onboarding/WizardTopAction.tsx` | Explicitly deprecated; sampled references are its tests. | COMPATIBILITY-ONLY pending a complete import/export census. Do not reconnect it to Launcher. |
| Old `SystemLauncher` references in comments and type documentation | Several refer to an obsolete caller, while their modules remain active. | MIGRATE documentation separately. No deletion based on string matches alone. |

This is an initial affected-path census, not certification that every legacy module or duplicate registry has been removed. No module is classified DELETE without consumer and persisted-restore evidence.

## Batch 1A — inventory and vocabulary integrity

Implemented in this change:

- Foundation owns `GENERATED_MOTION_PRIMITIVES`; Wizard derives its list with a defensive copy. Existing serialized context shape and component order remain unchanged.
- `SectionVariant.vocabularyRefs` is additive. `vocabulary` remains available to legacy consumers.
- `getImplementationVocabularyRefs()` returns the deduplicated union, keyed by `category:id`, with copied entries. The derived implementation index and reverse vocabulary index use that union.
- Tests execute the transpiled emitted motion module to compare real function exports with the advertised inventory. They also verify shorthand compatibility, multiple references, duplicate removal, category separation, report partition updates and pack-to-implementation resolution.

This batch does not claim the motion components are behaviorally certified. It does not add new vocabulary claims to real variants or change selected output, theme tokens, persisted snapshot versions, AI import acceptance, or registry signatures.

## Batch 1B — complete consumer and gate agreement

1. Make foundation prompt requirements and import validation consume one capability contract. Separate runtime component exports from type exports such as `MotionRecipe` and prop interfaces.
2. Determine supported exports from the snapshot-owned foundation version/manifest. Older snapshots must not be told that newly added primitives exist. Add a read adapter when a new manifest field is introduced; test older manifests and protected-file preservation.
3. Fix the orchestrator report using the canonical vocabulary report. Preserve category prefixes. Distinguish **globally implemented**, **eligible for this launch**, and **selected in this snapshot**; those are three different sets.
4. Update Design Intervention's selected-language projection to consume normalized references. Do not mark an entry executable just because a primitive exists or an experience declaration says `declared`.
5. Add a capability fingerprint separate from legacy `designRegistrySignature`. Include normalized references, VFS mode, declared dependencies and eligibility inputs; canonicalize ordering. Prove unchanged existing snapshots remain readable.
6. Check each additional vocabulary claim against emitted recipe behavior. Multi-reference support alone must not increase the advertised visual quality of a recipe.

Exit evidence: current and legacy foundation fixtures agree with their respective prompts/validators; actual launch request contains the expected bounded vocabulary; rejected candidates preserve deterministic files; signatures and sidecars survive canonical commit/reload fixtures.

## Batch 2 — a complete deterministic tech composition

Build one coherent page composition before adding a large inventory:

`navbar:floating-tech` → `hero:kinetic-tech` → restrained proof band → feature narrative → conversion band → existing footer.

The hero uses large, left-aligned multiline typography with one semantic h1, a short lead, one primary action and one secondary action. Orbital linework and a restrained glow create depth behind the content. On narrow screens, retain the content order, allow natural line wrapping and simplify decoration. No fixed hero height or negative-margin overlap is required. Internal pages retain their existing page-intro rules; they must not receive a marketing hero merely because the foundation prompt says every page starts with one.

| Deliverable | Canonical implementation | Required behavior |
| --- | --- | --- |
| Background facade | Extend `generatedUiFoundation.ts` to emit `/src/unison/ui/background.tsx`; declare paths, imports and persistence contract there. | Decorative wrapper is `aria-hidden`, ignores pointer events and does not own parent layout or business content. Colors consume semantic tokens. |
| `OrbitalBackdrop` | SVG rings with bounded density, focal point and motion choices. | Stable IDs where needed; static fallback; motion off under reduced motion. |
| `GlowField`, `AnimatedGrid` | Layered CSS/SVG using approved theme variables. | Clip inside the decoration layer; never obstruct controls; no hard-coded palette. |
| `NoiseField`, `GradientOrbs` | Follow only after the first three are certified. | Deterministic texture/geometry and motion budget; no random values on render. |
| Hero typography | Extend `buildArtDirectionTokens()` in `artDirectionPacks.ts`; add `hero` to Heading in generated foundation and its directive. | Stage 4b emits `--ut-type-hero`; responsive clamp and line height derive from pack scale. Legacy documents retain existing display sizing through a versioned fallback. |
| Tech hero | New `src/sections/variants/hero/HeroKineticTech.tsx`, registration in `variants/registry.ts`, existing portable emission path in `compositionToFileSet.ts`. | Same semantic props, slots and intent bindings in renderer and generated output. Preserve `data-ut-section-id`, artifact and implementation identity. |
| Floating tech navigation | New variant in the existing navbar family using the generated `FloatingNavbar` behavior. | Mobile dialog keyboard/focus behavior; no second menu implementation; existing URL/intent binding. |
| Brand lockup | Authored logo-cloud variant and artifact slots, with explicit image/name data. | No invented partner endorsements; no new catalog table solely for visual decoration. |
| Pack activation | Existing compatible tech packs only, after deterministic eligibility tests. | Theme selection remains authoritative. Missing IDs fail integrity checks, not silent fallback. |

Accept the composition only after compiler output, desktop/mobile rendering, keyboard behavior, reduced motion, long headings, missing media, theme switching, canonical commit, Playground edit and reload all pass. A component demo is intermediate evidence only.

## Batch 3 — richer section families

Prioritize three composition directions using canonical section names:

| Direction | Hero / narrative | Proof / media | Conversion |
| --- | --- | --- | --- |
| Technical product | Kinetic hero, asymmetric features, horizontal service rail | Logo-cloud lockup, filmstrip | Split-media CTA |
| Editorial service | Oversized editorial hero, alternating service narrative | Lookbook, spotlight quote | Oversized statement CTA |
| Portfolio / story | Cinematic split hero, asymmetric story | Masonry or stacked gallery, editorial quotes | Quiet floating-panel CTA |

These are proposed additions, not declarations of existing IDs. Reconcile each name against the current registry before registering. Use `logo-cloud:*` rather than introducing a parallel `logos:*` family. Promote logo-cloud, blog-preview and before-after from their current placeholder status only when their own renderer, artifact slots and VFS recipes exist.

Interaction treatments resolve through `wizardInteractionEnrichment.ts` and Design Intervention. Motion recipes refer to existing primitive/implementation identities. Before expanding marquee use, test the current primitive's actual pause behavior and duplicate-content accessibility; CSS `animationPlayState` alone does not establish that a motion-library animation pauses.

## Batch 4 — registry context v2, assets and business semantics

Keep a full deterministic snapshot context and derive a smaller AI projection from it. Do not create another manually maintained registry.

Proposed context fields: current selection/profile fields; implementation summaries; category-qualified executable/unimplemented vocabulary; primitive families; scoped asset summaries; approved capability IDs. Preserve v1 parsing and `motionPrimitives` compatibility until persisted recovery proves retirement is safe.

Projection order: selected page roles → template/industry eligibility → pack compatibility → approved runtime capabilities → selected and legal sibling implementations → relevant artifacts/catalog surfaces → referenced or approved assets. Sort before serialization. Omit source code and storage credentials. Use explicit truncation metadata and deterministic item/byte limits; never silently omit a required selected implementation to satisfy a context budget.

Asset summaries carry stable ID, kind, dimensions and approved descriptive metadata. Resolve URLs through existing approved runtime access. Do not treat arbitrary cached media as business-authorized. Catalog additions require real storage, field contracts, editor, readiness, hydration, intent and auto-binding evidence.

## Batches 5–7 — enrichment, editing and experience

- **Enrichment:** retain existing protected paths, schema/import/theme/intent/binding checks and canonical commit. Test timeout, cancellation, malformed output, unavailable model, missing page and rejected candidates. Expand page-body authority only after the policy conflict above is resolved.
- **Quality report:** derive nonblocking warnings from resolved structure in existing page-quality services before adding a new report owner. Measure repeated geometry, competing focal points, media and motion usage. Do not turn a subjective score into a hard launch blocker.
- **Visual editing:** select stable section/artifact/slot IDs in Preview; inspect legal variants and bounded properties; write structured canonical mutations; recompile, commit and reload. Reuse Playground identity/hydration. Do not build a second canvas document model.
- **Experience:** expand the existing facade only after ordinary DOM/CSS recipes pass. Keep WebGL/reduced-motion fallbacks and existing capability budgets. Package availability does not imply launch eligibility.

## Validation and rollout

Each batch reports separately: registry integrity, emitted runtime, canonical commit/seal, browser interaction, persisted reload and editor round trip. Unverified gates stay unverified.

For Batch 1A, run the registry, vocabulary, aggregation and Art Direction suites plus generated-foundation and canonical snapshot/handoff regressions. Run application TypeScript, changed-file lint and architecture guards. No browser quality claim is needed for a batch that intentionally leaves generated source and UI behavior unchanged.

New hero/background activation follows the consumer-contract batch below; catalog expansion, unrestricted AI edits and 3D are not bundled into registry integrity work.

### Batch 1A verification result

Passed 110 tests across nine suites: registry integrity expansion, design implementation registry, vocabulary executability, Wizard aggregation, Art Direction packs, generated UI foundation, canonical launch VFS, snapshot sealing and orchestrator handoff. Application TypeScript, targeted ESLint, canonical-write guard, pipeline-bypass guard, single-source guard and whitespace checks passed. The final additional legacy/no-legacy vocabulary cases were rerun in the five-test integrity suite.

No new browser/persisted-project round trip was performed for this metadata-only batch. The existing canonical regression fixtures passed; they do not certify remote persistence or the future visual implementations. Changes remain local and uncommitted.

### Batch 1B implementation — September 16, 2026

- Foundation manifest 1.9 declares motion components separately from type exports. Prompt requirements and candidate validation consume that contract. The legacy read adapter intersects declarations with exports present in the snapshot's stored motion module; it does not modify stored files or infer installed exports from a normalized version number.
- Removed the contradictory narrow motion list and the instruction to put a marketing hero on every page. Composition examples are filtered when their motion components are absent.
- `buildWizardLaneBRegistryContext()` now builds the production request's foundation directive and vocabulary report from the snapshot and canonical registries. Missing foundation metadata aborts enrichment into the existing deterministic fallback. Global, pack-eligible and selected vocabulary are separate, category-qualified sets. This is not yet the future context-v2 page-role/asset/capability projection.
- Design Intervention consumes normalized multi-reference vocabulary for selected implementations. No new visual vocabulary claims were added to real variants.
- Added `dc_v1_*` capability metadata fingerprints to registry context, covering implementation identity, normalized vocabulary, VFS mode, Radix dependencies, page roles, tags, experience declarations, pack eligibility and selection inputs. Existing `dr_*` signature semantics are unchanged. The fingerprint is metadata, not a new candidate acceptance authority.
- Added legacy/current export-gate tests, production projection tests, type-only import tests, fingerprint stability/change tests and snapshot metadata serialization/reload tests. Registry sidecars remain outside sealed runtime VFS by design; metadata retains the context for canonical re-emission.

### Reported duplicate social icon failure

Reproduced the user's exact Babel `Duplicate declaration "Instagram"` error. The missing-icon injector overlooked multiline facade imports and introduced duplicate fallback declarations. Both icon passes now use the shared binding collector; it recognizes mixed default/named and indented imports. Stale generated lookup aliases yield to real bindings and repeated lookup declarations are removed without deleting authored components.

A complete `prepareSandpackFiles()` regression also exposed truncated-import repair deleting valid multi-name imports. That check now recognizes the complete multiline import, including a following statement after the semicolon. Regression cases exercise both direct normalization and actual Wizard preview preparation followed by Babel compilation. No authenticated user project or remote deployment was changed.

Final Batch 1B/icon verification: 215 tests passed across 15 suites; application TypeScript, targeted ESLint, architecture guards and production build passed. Build retains Tailwind ambiguity, circular-chunk and bundle-size warnings. The specific authenticated saved project was not reopened. No commit, push or deployment was performed.
