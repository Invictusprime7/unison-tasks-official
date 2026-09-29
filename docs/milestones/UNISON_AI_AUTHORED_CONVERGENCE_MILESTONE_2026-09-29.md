# Unison milestone: AI-authored convergence and design knowledge

**Status:** implementation plan, grounded in the September 28 repository ZIP.  
**Revision:** September 29, 2026 — integrates design knowledge and a release-blocking compiler/VFS source preservation contract.  
**Outcome:** Wizard and AI Builder use shared, versioned design knowledge to freely compose proven Unison registries and original project-local components into distinctive, executable React/TSX pages. Every accepted edit becomes one canonical, reproducible VFS revision used by Preview and Publish, with explicit evidence of which elements support visual editing.

This revision extends the milestone in place. The September 27 `UNISON_LOVABLE_CREATIVE_INTENT_OPEN_COMPOSITION.md` supplies the guiding principle: the canonical registry is a quality floor and preferred vocabulary, not a creative ceiling or strict whitelist. The strategy below is proposed implementation; repository observations do not establish production readiness.

## Decision

AI is a first-class **source author** in both initial Wizard generation and subsequent AI Builder edits. It may choose layout, hierarchy, section order, composition, copy, interactions, local TSX modules, and supported styling. Registries supply reusable capabilities and context, not a fixed sequence of permitted page layouts. AI may create wrappers and page-specific components around proven primitives. A novel presentation does not require prior registration; a new business capability still needs a valid runtime contract.

The compiler supplies topology, route identity, business capabilities, theme tokens, runtime bindings, and a baseline. It checks and seals authored output, but must not replace valid AI page bodies with its baseline. `SiteBundleSnapshot` remains the authority for **accepted revisions**, not the exclusive author of source. The same user intent, source hash, model/configuration, dependency manifest, and resolved asset IDs must be recorded for replay; AI generation itself need not be byte deterministic.

**Highest-priority prerequisite:** compiler reconciliation and VFS synchronization must never silently overwrite, regenerate, drop, or resurrect accepted AI/user source. Source preservation is enforced by the commit boundary and revision identity, not by a best-effort prompt or an optional caller flag. Complete M0 below before enabling expanded authoring by default.

## Current integration points

| Repository surface | Observed behavior | Required change |
|---|---|---|
| `src/platform/core/commitToPipeline.ts` | Wizard compiles through `executeCanonicalPipeline`; AI Builder recompile accepts existing VFS and `preservePageSources`. | Add an explicit candidate-authoring/revision commit input rather than treating AI source as incidental existing files. Preserve valid authored bodies across recompiles. |
| `src/services/canonicalLaunchVfs.ts` | Generated registered page bodies can win byte for byte; router, theme, UI foundation and metadata are protected. It writes authority proof as `canonical-compiler` even when generated pages win. | Make authority proof per file (`ai-authored`, `compiler-baseline`, `user-edited`) with hashes; keep compiler ownership of protected contracts. Validate before seal. |
| `src/platform/core/snapshotSeal.ts` | Seal requires router, CSS and registered pages, then stores converged VFS. | Assert provenance and validated file hashes; persist authored source and dependency/runtime evidence. Do not rewrite source after validation. |
| `src/services/vfsCommitService.ts` | AI edits pass through a commit service, with special composition-upgrade handling. | Give ordinary AI Builder edits the same candidate validation and revision semantics as Wizard; eliminate any bypass that makes Preview and persisted snapshot diverge. |
| `supabase/functions/ai-code-assistant/orchestrator.ts` | `wizard_seed_generation` is present; page authoring is already a distinct task. | Supply actual registry/component contracts, page roles, business bindings and error feedback; accept multi-file source patches as candidates. |
| `src/platform/core/canonicalPipeline.ts` | Recompile may preserve registered page sources. | Make source preservation default for accepted AI/user revisions; only regenerate an explicitly requested page or affected compiler-owned artifact. |
| `src/services/builder/sourceKnowledgeContext.ts` | `selectSourceKnowledge` selects target files, CSS, package information and project components, traverses local imports, and enforces a transport budget. | Retain source selection and add explicit completeness/missing-context reporting; supplement with versioned design guidance and callable source lookup. |
| `src/services/launch/siteAuthoringOrchestrator.ts` | Builds page briefs with design contracts, preferred vocabulary, creative authority, page variation and homepage inheritance. | Consume the shared context package; preserve page-specific creative intent across generation and repair. |
| `supabase/functions/ai-code-assistant/contextBuilders.ts` | Emits registry rules, supported states, visual signatures and allowed dependencies. | Distinguish real registry identifiers from freely authored local components; remove prompt interpretations that force every new composition into an existing variant. |

Do a fresh trace before editing: inspect `SystemLauncher` call sites, `wizardStage4bRuntime`, `canonicalLaunchVfs`, the VFS commit service, snapshot projection, preview hydration and publish source selection. This table records observed seams, not proof that every path is already wired.

## M0 prerequisite: compiler and VFS must preserve authored source

### Observed risk points requiring verification

The following were inspected in the September 28 ZIP. They identify mechanisms to test; they do not establish the complete runtime cause of a particular lost edit.

| Location | Observed risk | Required treatment |
|---|---|---|
| `canonicalPipeline.ts`, recompile near lines 648–670 | Calls `compilePlayground` before a conditional `preservePageSources` block. That block explicitly restores registered pages, composition metadata and `/src/components/` files; broader authored paths are not explicitly covered by that block. | Preserve every existing authored file by ownership manifest. Verify local hooks, project components, utility modules, CSS, assets and new files survive all downstream stages. |
| `canonicalPipeline.ts`, near lines 666–704 | Theme normalization occurs before `preStage4bFiles` is captured. The later Stage 4b preservation assertion therefore cannot detect earlier source loss by itself. | Compare the final candidate against the incoming revision plus authorized patch, starting before compile or normalization. |
| `WebBuilder.tsx`, `buildSavePayload` region near line 4128 | Calls `commitToPipeline` as `playground-edit` without `preservePageSources`, then feeds current files into a later merge. | Trace the complete save result. Saving must persist current accepted/candidate source without depending on a later merge to restore overwritten content. |
| `vfsCommitService.ts`, near line 441 | Enables preservation for AI Builder, theme edits and selected cases; callers still differ. | Enforce preservation centrally for every source and operation. A missing caller option cannot surrender authored files. |
| `snapshotProjector.ts`, `projectSnapshotVfsFiles` | Projects snapshot runtime with an exception for an in-memory `liveEditedPaths` set. | Replace or extend that exception with project/revision-scoped pending operations and deletion records. Memory-only path flags cannot be the durability or concurrency contract. |
| `useSitePreview.ts` / `useSiteBuilder.ts` | A separate page sync hook generates HTML and writes through VFS methods. | Determine whether it is reachable for canonical Wizard drafts. If so, isolate that legacy generator from canonical projects; if not, document its actual scope. Do not delete unrelated functionality based on filenames alone. |

### Preservation invariant

For an accepted revision R and an authorized candidate operation O:

```text
Expected authored files = apply O's explicit creates/updates/deletes/renames to R
Actual authored files   = authored portion of the fully finalized candidate
Required equality      = same paths, same bytes, same intentional deletions
```

Check this across all authored artifacts, including shared/local components, hooks, utilities, CSS and asset references. Do not narrow it to `/src/pages/*` or a naming convention. Normalize path identities once, reject collisions, and hash file contents without altering the accepted bytes. A deletion must remain deleted; an orphan cleanup cannot discard a valid file merely because dependency discovery missed a dynamic reference.

An AI or user edit is allowed to change its declared target set. An explicit regeneration request may replace specified pages and affected modules through a new candidate revision. Reopening, hydration, navigation, autosave, preview refresh, publish and routine compiler reconciliation do not authorize source regeneration. Theme changes update compiler-owned tokens; additional changes to authored source require an explicit transformation scope and validation as a new revision.

Do not globally adopt “AI always wins” merge order: a late AI response must not overwrite newer user work. Resolve writes by base revision, explicit patch scope and accepted transaction order. Source author identity determines provenance, not priority over a newer revision.

### Compiler behavior after authoring

1. Read the current accepted snapshot and its authored file manifest.
2. Apply the requested patch to an isolated candidate; include explicit deletes and renames.
3. Generate or reconcile only compiler-owned outputs: route source, runtime metadata, foundation exports and theme token payloads within declared scope.
4. Never recompose an existing authored page from section registries during save or reconciliation. Registry composition may seed an explicitly new page or an explicitly requested regeneration.
5. Any normalizer, import healer, navigation/binding injector or syntax repair that modifies authored source must return an explicit candidate patch. Validate that changed candidate again. No hidden post-validation rewrite is permitted.
6. Compare finalized authored files with the expected file set and hashes. On an undeclared change, reject the candidate and retain the last good revision; report the offending stage and paths.
7. Seal and persist only the exact validated candidate. Reopening and publishing project that stored revision without a generation pass.

The optional `preservePageSources` switch may remain temporarily for compatibility, but cannot disable this invariant on accepted AI/user source. Rework its callers after the centralized rule is proven. Preserve validation: source preservation must not become a reason to skip import, binding or runtime checks.

### VFS synchronization and concurrency

Use the existing commit service and snapshot as the durable authority. Treat editor, Sandpack and other VFS views as projections of a specific revision. Any live working state must be an explicitly identified candidate based on that revision.

- Tag updates with project ID, base revision ID, candidate/transaction ID, origin and sequence. Ignore events for another project or obsolete revision.
- Track pending creates, edits, deletes and renames separately from snapshot projections. A dirty buffer is not permission for an old snapshot to overwrite it.
- Acknowledge and clear only the pending operations included in a successful commit. Matching contents alone must not clear a newer edit or unrelated pending operation.
- Keep pending edits across refresh/recovery using the application's existing draft mechanism or a scoped recovery journal. Restoring a pending candidate does not make it published or validated.
- Hydrate the accepted snapshot, then restore compatible pending operations against their known base. On divergence, perform an explicit rebase/conflict flow; never use wall-clock timestamps as last-write-wins evidence.
- Prevent sync echo loops using origin/transaction identity. Applying a snapshot projection must not trigger another compiler save.
- Cancel or discard late generation, preview and autosave results when their base revision is stale. Multi-tab commits need a server-side compare-and-swap guard on the project head or equivalent transactional revision check.
- Publish an explicit accepted revision ID. Pending work may first be committed through validation, but publish must not silently reconstruct source from older page metadata.

Compiler metadata and project composition descriptors must reflect the accepted source. If arbitrary source cannot be represented by a registered composition descriptor, record partial/source-only comprehension rather than rebuilding the source to match old metadata.

### Existing-project migration

For older revisions without ownership metadata, start from the actual persisted, last accepted source. Inventory compiler-owned paths using confirmed contracts; conservatively preserve remaining project source. Do not classify authorship from an AI comment marker alone. Backfill versioned ownership metadata, retain revision history and provide rollback. If VFS, draft and snapshot disagree, retain the conflicting content for recovery and resolve against known revision lineage before overwriting anything.

### Release-blocking regression scenarios

Use a rich AI-authored fixture with a registered page, a new page, a project-local component, a hook, a shared utility and local CSS. Include intentional deletions and a rename. Verify:

1. Launch → seal → preview → save → close/reopen preserves every accepted authored file hash and deletion.
2. AI edit → autosave → recompile preserves the new accepted bytes; omitted preservation options cannot cause regression.
3. Theme-token change and route-only change preserve authored bodies unless the operation explicitly requests a scoped source transformation.
4. A deliberately injected compiler overwrite before Stage 4b, or normalizer rewrite after compile, is detected at the final commit boundary.
5. A stale snapshot projection cannot remove a new local component, resurrect a deleted file, or replace a dirty editor buffer.
6. Two concurrent edits based on the same revision cannot silently overwrite each other. Late AI completion and reordered autosave responses are rejected or explicitly rebased.
7. Snapshot projection does not recursively trigger compilation/save; page navigation does not regenerate accepted pages.
8. Preview and published source correspond to the same accepted revision; publish cannot silently use a baseline.
9. Repeated no-op reconciliation preserves the authored file set and contents; only documented metadata may change.
10. Recovery from a failed commit or refresh preserves pending work and the last good accepted revision independently.

For all scenarios, check behavior at the consuming UI boundary as well as source hashes. Existing tests that only assert a preservation flag or search for a function name are insufficient evidence. Capture write origin, base/result revision, changed paths and unexpected hash differences in diagnostics without logging private source content.

**M0 passes only when an unauthorized authored-file change cannot reach persistence or silently appear in editor/Preview through synchronization.** A failure blocks rollout of the new authoring mode; it does not erase or downgrade the existing accepted project.

## Ownership contract

| Artifact | Owner of accepted revision | AI freedom |
|---|---|---|
| Page TSX and page-local components | Author who last committed it; recorded per file | Full composition and supported styling, including new wrappers and layouts |
| Shared generated components | AI or user, with dependency/use tracking | Create and edit within supported runtime; update affected imports safely |
| Route IDs, page registry, navigation | Canonical topology service | Propose changes; canonical transaction updates registry, router and links together |
| `/src/App.tsx`, `/.unison/*` proof, platform UI facade | Compiler | Read and reference; topology changes go through typed operations |
| `/src/index.css` preset tokens | Stage 4b/theming | Add scoped authored styles or overrides via supported extension point; retain selected preset authority |
| Business actions and data bindings | Capability/runtime contracts | Compose UI around valid bindings; request new capability through contract extension |

“Unrestrained” means no rigid hero/section recipe or arbitrary stylistic quota. Runtime compatibility, valid TSX, safe imports, route consistency, binding correctness and a user-selected theme are acceptance conditions. Do not silently sanitize away meaningful design. If a proposed design cannot pass, return precise diagnostics to the author and retry only the affected files.

## One candidate-to-revision protocol

```text
Wizard intent or AI Builder request
→ canonical context (topology, capabilities, registries, theme, current VFS)
→ shared knowledge assembly (mandatory rules + retrieved design guidance + source examples)
→ AI multi-file candidate patch
→ materialize complete candidate VFS in isolation
→ stage 4b token reconciliation without replacing authored page bodies
→ parse/type/import/runtime + route/binding checks
→ repair only failed files against exact diagnostics
→ repeat reconciliation and validation for any repaired candidate
→ visual/runtime preview of the candidate
→ atomic commit and snapshot seal
→ Preview, reopen, editor, publish from that exact revision
```

The baseline supports fallback and rollback. If AI fails, surface the baseline explicitly as a degraded outcome; never claim an AI-authored launch succeeded when it did not. An invalid candidate cannot mutate the last good revision.

Define a typed `AuthoredCandidate` (or extend the existing patch contract) with `baseRevisionId`, changed files, deleted files, proposed topology operations, model/prompt version, registry context version, dependency additions, asset references, and intent. Reject stale-base commits or rebase them with explicit conflict handling. On acceptance, store changed-file hashes, author provenance, validation results, and final snapshot revision ID. Concurrent edit and autosave paths use the same revision guard.

## Context that makes free composition credible

Build a compact, versioned context bundle from **actual importable code**, not only names: component signatures, required props, slots, example compositions, 21st adaptations, tokens, motion and interaction recipes, visual affordances, runtime support, import paths, and known constraints. Retrieve by industry, page role, conversion goal, art direction, and available capabilities. Show the AI the current page and neighboring pages so it can vary layouts coherently. Permit ordinary React layout code and supported local modules beyond registered recipes. Generated imports must resolve against the VFS or pinned runtime dependency manifest.

At Wizard time, author a site-level creative brief plus page-specific plans, then compose pages in batches with shared navigation, imagery and typographic direction. At AI Builder time, send the current snapshot and a small relevant slice of context; preserve unaffected files and user edits. For both, reconcile business facts and capability bindings against the same canonical contract.

## Shared design knowledge strategy

### 1. What the knowledge base does

Store Unison's design system and source references once, then assemble the relevant context for every authoring, editing and repair request. Uploading documents does not permanently train an API model or transfer a Lovable conversation. The application must provide instructions and retrieved evidence to the selected model. Knowledge guides choices; executable validators enforce canonical compatibility. Fine-tuning is optional future work and is not a prerequisite for this milestone.

Use the current backend and AI orchestration. Begin with versioned Markdown/JSON documents and deterministic metadata selection. Add semantic retrieval when the corpus needs it; a vector database is not required for the first working slice. Provider-managed file search or existing backend retrieval may supply results through the same application interface. Verify support in the actual gateway/provider before depending on provider-specific tools. Switching providers must preserve the canonical policy and context contract.

### 2. Five layers in every assembled request

| Layer | Contents | Loading policy |
|---|---|---|
| Core authoring policy | Source authority, commit protocol, runtime constraints, explicit creative permissions, selected brand requirements | Mandatory on every authoring and repair request; never dependent on search ranking |
| Design knowledge | Creative intent interpretation, theme families, art direction, page roles, industry conversion principles, motion and composition guidance | Retrieve active, relevant passages; include their version and source identity |
| Executable vocabulary | Real import paths, exports, props, component source, bindings, interaction states, dependency versions | Fetch exact entries by ID/path; load implementations as needed |
| Project state | Base revision, current VFS slice, routes, user changes, business facts, theme, shared chrome and established design decisions | Rebuild from the current canonical revision on each turn |
| Creative references | Relevant screenshots, source examples and explanations of their design decisions | Select for the task; pass images explicitly to a vision-capable model when needed |

Do not dump the complete repository or all historical guidebooks into each request. Reserve capacity for output and repair. Never silently omit mandatory rules, target source or required contracts to fit a context window; narrow optional references or split the authoring task.

### 3. Curate one active knowledge package

Suggested logical entries (names describe content, not a required new folder architecture):

- **Canonical authoring policy:** executable ownership and protected artifacts; explicit permission for source generation in both Wizard and Builder.
- **Creative intent interpretation:** translate natural language, references and mood into a resolved design brief. Theme and art-direction affinity are recommendations until user choices resolve them.
- **Theme and art direction:** token contracts plus typography, geometry, spacing, imagery and motion principles. Preserve explicit user choices; allow compatible local variations.
- **Registry API references:** generated from actual registry/code exports where possible, including props, imports, supported states and runtime contracts. Prose cannot invent an export.
- **Industry/page guidance:** intent, information hierarchy and functional requirements for each page role. Present layouts as examples, never mandatory section stacks.
- **Worked examples:** screenshot + relevant source + explanation of composition decisions + dependency/contract compatibility.
- **Failure and repair guidance:** reproducible errors and narrow fixes, without teaching the model to replace rich pages with generic fallback shells.

Each entry records a stable ID, version, content hash, status (`active`, `superseded`, `draft`), scope, source reference, compatible registry/runtime versions, tags and optional `supersedes` IDs. Only active compatible entries enter normal generation. Re-index when content or registry APIs change; invalidate cached context on those version changes. Store references/hashes with the generation record and retain the corresponding versions for audit.

Resolve conflicting historical instructions explicitly. Retire the former rule that initial Wizard AI can only return content data. Remove any automatic preference for compiler page bodies over accepted AI source. Keep actual capability, theme, dependency and revision requirements. Implementation work must audit prompts, skills used by the application, tests and merge policies for these contradictions, rather than only adding a new prompt above old rules.

### 4. Allow creative extensions explicitly

The core policy must state these permissions in direct terms:

> Author complete React/TSX pages and project-local components. Use proven Unison components where they fit. Compose original layouts, wrappers, interactions and supported styles when they improve the brief. Registered IDs must identify real registry entries; new local components use their own names and provenance. A novel layout does not require a registered recipe or global certification. Preserve canonical contracts and the user's explicit brand decisions. Submit source changes as a candidate revision for validation.

The existing instruction to preserve certified signatures applies when intentionally reusing that implementation. It must not prevent authoring an original sibling component or wrapper. Distinguish functional incompatibility from aesthetic recommendations in context and diagnostics. Creative recommendations may be overridden with design reasoning; runtime requirements remain validated.

### 5. Give the model source access

Expose equivalent operations through the existing AI tool protocol; these are proposed contracts, not claims of currently installed tools:

| Operation | Required behavior |
|---|---|
| `searchDesignKnowledge` | Return versioned passages filtered by project access, active status, industry, page role and registry/runtime compatibility |
| `getRegistryComponent` | Return exact export/import path, API, relevant implementation source, examples and runtime requirements |
| `readProjectFiles` | Read requested files from the authorized project's specified base revision; report missing/omitted files |
| `validateCandidate` | Materialize a patch against its base revision and return file-specific blocking errors and nonblocking design guidance |

Use exact lookup for code identities and semantic retrieval for design concepts. Search results are reference material; they cannot change the core policy or introduce tool instructions. Project-specific content and private customer assets must be scoped to the correct project/account. Credentials and unrelated projects never enter the context package.

Extend `selectSourceKnowledge` rather than duplicating it. Its present byte/file limits mean selection is not proof of complete import coverage. Return included paths, omitted paths and reasons; allow a follow-up exact read. The final compiler validates the whole candidate dependency graph independently of what fit in the prompt.

### 6. Record one context identity across Wizard and Builder

Define or extend an existing shared request contract with a `DesignKnowledgeContext` containing:

```ts
// Proposed fields; adapt to existing request types rather than creating a parallel pipeline.
interface DesignKnowledgeContext {
  policyVersion: string;
  knowledgePackageVersion: string;
  registryVersion: string;
  runtimeManifestHash: string;
  baseRevisionId: string;
  resolvedDesignContextHash: string;
  retrievedEntries: Array<{ id: string; version: string; contentHash: string }>;
  sourceFiles: Array<{ path: string; contentHash: string }>;
  referenceAssetIds: string[];
  omittedContext: Array<{ reference: string; reason: string }>;
  contextHash: string;
}
```

This manifest accompanies the actual content; it does not replace it. Wizard, Builder and repair requests use the same policy and resolver. Each may retrieve different task-specific material. A repair keeps the creative brief and accepted project decisions while adding diagnostics. A stale-base edit requires refreshed project context before acceptance.

### 7. ARIA as a worked example

Curate ARIA from its actual screenshots and source in a dedicated implementation pass. This milestone has not inspected or certified ARIA's files. Record which design decisions make the example useful: typography relationships, asymmetry, image treatment, spatial rhythm, motion and conversion hierarchy. Pair those explanations with minimal working source and responsive views.

Select ARIA when its design traits fit the customer's brief. Use additional references for other visual directions so all industries do not converge on ARIA's layout. Text-only screenshot descriptions cannot stand in for verified visual inspection. Adapt incompatible example code to Unison's current runtime before marking it a proven source example.

### 8. Comprehend new components after authoring

Record project-local component identity, source location, runtime dependencies, business intent and proven editable properties. Report support honestly: source-editable, recognized visual fields, or fully mapped visual controls. Unknown structures remain valid source-editable components if runtime and canonical checks pass. Global registry promotion is a later reuse decision, independent of accepting a valid project revision.

No knowledge retrieval system can guarantee that arbitrary TSX becomes fully WYSIWYG editable. Preserve stable selection identities where supported; remap or invalidate controls when a source edit changes structure.

## Implementation slices and gates

### M0 — Prevent compiler overwrite and stale VFS synchronization

Implement the prerequisite above first: enumerate reachable writers, enforce incoming-to-final authored source preservation, use revision-scoped synchronization, and prove the release-blocking regression scenarios. **Gate:** no undeclared source change is committed or projected; explicit edits and valid new components still work.

### M1 — Establish truthful source authority

Trace existing file merge order and revise authority proof, seal metadata and tests. Preserve authored bodies through launch, reopen and recompile. **Gate:** a generated registered page remains byte identical after sealing and reopening; proof identifies its actual author and hash.

### M2 — Shared candidate commit API

Route Wizard and AI Builder patches through one isolated candidate validator and atomic revision commit. Remove special-case bypasses only after equivalence is proven. **Gate:** both paths reject an invalid patch without changing the current snapshot; both accept a multi-file patch into the same revision format.

### M3 — Registry-aware creative authoring

Deliver M3 in these concrete increments:

1. **M3a — Active knowledge package:** curate current design rules, mark superseded instructions, generate code-grounded registry references, and record versions/hashes. Gate: no active context contains the old content-only Wizard policy; real exports resolve.
2. **M3b — Shared context assembly:** extend existing source knowledge and prompt builders for Wizard, Builder and repairs. Gate: mandatory rules survive a zero-result search and context-budget pressure; omitted source is visible and retrievable.
3. **M3c — Open composition tools:** allow exact source reads, contextual retrieval, new local modules and candidate validation. Gate: a valid original component outside registered recipes is accepted; a fabricated registry import is rejected with an actionable error.
4. **M3d — Visual and functional proof:** salon Home, Services, Booking and About use distinct hierarchy/layout with proven families and original composition where useful. Gate: booking binding works, visual review passes, and theme reconciliation never replaces accepted page bodies.

### M4 — Edit and topology convergence

Support AI edits to sections, local/shared components, new pages and routes using typed topology operations. Keep editor selection IDs stable or remap them explicitly when structure changes. **Gate:** AI adds a page and edits a shared component; navigation, editor, VFS, snapshot, reopen and publish all agree.

### M5 — Cross-industry production proof

Run salon/booking first, then contractor/quote, restaurant, commerce, portfolio and lead capture. Measure success over repeated varied prompts and presets. **Gate:** every supported industry produces multiple visually distinct, functional multi-page sites; each passes preview, edit, reopen and publish checks. No numeric success claim without recorded runs.

## Verification contract

Automated checks: parse and TSX typecheck each changed file in the same dependency/runtime matrix as preview; resolve all local imports; verify route/registry/nav parity, required intent bindings, supported asset references, selected theme token application, no missing page, no placeholder shell, no dropped user edits, and revision hash parity across snapshot/VFS/preview/publish. Use a real Sandpack smoke render for launch-critical examples. Verify booking end to end with a test runtime before calling the salon vertical complete. Add screenshot review for design coherence and variety; code validity alone cannot prove creative quality.

Knowledge-specific acceptance fixtures must cover:

- Identical task/revision inputs in Wizard and Builder resolve the same policy and compatible knowledge versions.
- An outdated document advocating data-only AI authoring is excluded from active retrieval.
- Search returning no results does not remove canonical rules or creative permissions.
- An exact component lookup returns real signatures; stale registry IDs are detected before commit.
- A novel project-local component passes without global certification when its contracts hold.
- A small context budget reports omissions and retrieves required source without truncating executable files mid-function.
- Repair preserves the design brief, approved source and current policy while fixing the diagnosed failure.
- Private project references never appear in another project's request.
- A referenced screenshot is actually supplied when visual understanding is claimed; absent assets are reported.
- Knowledge/generation provenance survives commit and reopen, while published output uses the same accepted source.

Compare a fixed evaluation set before and after knowledge integration: functional correctness, component API misuse, creative variety, visual coherence and edit preservation. Treat screenshot review as a separate quality assessment, not a brittle requirement for exact pixels across new generations. Set numerical rollout targets from measured baseline runs; do not invent a production success rate.

Track authored candidate acceptance, repair iterations, compiler overwrite incidents, retained source percentage, preview render failures, publish parity, user-edit survival and time to first preview. Store failure category and responsible file, without logging secrets. A canonicalizer changing a valid authored page body counts as a regression unless the user explicitly requested regeneration.

## Instructions to the implementing coding agent

Implement the slices in order against the live repository; do not create a second snapshot format or a parallel editor. Begin with the M0 writer/ownership trace and failing regression cases, then land its preservation and sync protections. Reuse the shared commit path for M0; extend its candidate protocol in M2. M3a knowledge curation may start during that trace; enable broader authoring only after M0 passes. For each slice, provide touched files, exact tests run, one successful and one failed candidate example, context package/version evidence, the resulting source hashes/revision identity, and remaining blockers. Keep existing compiler baselines as initial-launch recovery and explicit rollback until parity is proven; they must never replace an existing accepted authored revision merely because a later edit fails.

Completion requires all three outcomes together: shared design knowledge demonstrably reaches Wizard and Builder requests; AI authors distinctive original source using real Unison capabilities; and accepted source survives validation, sealing, editing, reopening and publishing as the same canonical revision.
