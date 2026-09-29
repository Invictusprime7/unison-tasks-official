This is read-only knowledge curation for the implementation effort. No files were modified, tests run, agents invoked, or deployment attempted. **M0 remains unproven.**

The [September 29 milestone](C:/Users/emman/Downloads/UNISON_AI_AUTHORED_CONVERGENCE_MILESTONE_2026-09-29.md) supplies requirements and historical observations; it does not override your task constraints. Repository findings below come from the inspected commit, compiler, candidate, seal, and projection seams.

**Mandatory policy to carry into authoring and repair**

- **Preserve freestyle source authoring.** Wizard and Builder may author complete React/TSX pages, original local components, wrappers, interactions, and supported styles. Registries provide reliable vocabulary and recommendations. Neither registry membership, certification, nor audit metadata may become a whitelist for valid original work.
- **Validate functional contracts.** Imports must resolve; business bindings, topology, dependencies, selected theme, and runtime behavior must remain valid. A fabricated registry identifier is an error; an original local component is not.
- **Preserve accepted source centrally.** For accepted revision R and authorized operation O, finalized authored paths and bytes must equal `apply(O, R)`, including explicit deletions and renames. Cover components, hooks, utilities, styles, and assets—not just registered pages. Routine save, hydration, navigation, theme reconciliation, or publish does not authorize regeneration.
- **Commit only the validated candidate.** Any source-changing repair or normalization creates changed candidate bytes requiring validation. Reject undeclared changes and stale-base writes; retain the last good revision. Author identity records provenance, not priority over newer edits.
- **Keep compiler ownership explicit.** Canonical topology, router, platform facade, metadata, and theme-token contracts remain protected. Theme ownership must still allow supported authored style extensions.
- **Keep one architecture.** [AGENTS.md](C:/Users/emman/unison-tasks-official-main/AGENTS.md:1) requires the existing authoring/repair/commit route, mirrored Composer contract, existing edge modes, and one composition planner with data-only industry profiles. Page-local composition and variation remain permitted within sealed site invariants.
- **Report capability honestly.** Unknown components can remain source-editable without full visual controls. Failed AI authoring must be reported as degraded baseline recovery, never successful original authoring.

**Curated knowledge package — desired structure**

Begin with versioned Markdown/JSON and deterministic selection; semantic retrieval is optional later. Every request should assemble five distinguishable layers:

| Layer | Required treatment |
|---|---|
| Core policy | Always include ownership, preservation, creative permissions, runtime constraints, and explicit brand decisions—even when retrieval returns nothing. |
| Design guidance | Retrieve relevant intent, typography, spatial rhythm, motion, industry, and page-role guidance; examples remain optional compositions. |
| Executable vocabulary | Supply verified imports, exports, props, states, dependencies, and bindings through exact lookup. |
| Project state | Resolve current base revision, relevant source, topology, business facts, theme, and approved decisions. |
| Creative references | Pair actual source with inspected visuals when available; report absent evidence. |

Each entry needs ID, version, content hash, active/superseded/draft status, scope, source, compatibility, tags, and supersession links. Retain generation context identities for audit. These describe what informed a candidate; they must not restrict which original components may be accepted.

Extend the existing source-selection mechanism rather than introducing another pipeline. Report included and omitted paths with reasons; provide exact follow-up reads. Budget pressure should remove optional references or split work, never silently truncate mandatory policy or required executable source. Proposed lookup/retrieval operations in the milestone are requirements, not verified installed tools.

**Distinct acceptance gates**

| Slice | Required evidence before claiming completion |
|---|---|
| **M0 — Preservation and synchronization** | No undeclared authored-file change reaches persistence **or editor/Preview projection**. Exercise create/update/delete/rename, pre-Stage-4b overwrite detection, no-op reconciliation, theme/route changes, stale projections, concurrent edits, late AI/autosave responses, recovery, and preview/publish revision parity. Check consuming UI behavior as well as hashes. |
| **M1 — Truthful authority** | Generated registered page bytes survive seal and reopen; per-file proof records actual author and hash. Aggregate compiler authority is insufficient. |
| **M2 — Shared candidate commit** | Wizard and Builder validate isolated multi-file candidates and accept the same revision format. Invalid candidates leave the accepted snapshot unchanged; stale bases cannot silently commit. |
| **M3 — Knowledge and open composition** | **M3a:** active, versioned package excludes content-only Wizard policy and references real exports. **M3b:** shared context preserves mandatory rules under empty retrieval/budget pressure and exposes omissions. **M3c:** valid original local components pass; invented registry imports fail actionably. **M3d:** distinct salon Home/Services/Booking/About compositions pass visual review and functional booking checks without theme reconciliation replacing source. |
| **M4 — Edit/topology convergence** | Adding a page and editing a shared component produces consistent navigation, editor, VFS, snapshot, reopen, and publish; selection identities survive or are explicitly remapped. |
| **M5 — Production evidence** | Recorded repeated runs across salon, contractor, restaurant, commerce, portfolio, and lead capture demonstrate distinct functional multi-page sites through preview/edit/reopen/publish. Numerical success claims require measured runs. |

M3a curation can begin alongside M0 investigation. Expanded default authoring remains contingent on M0 evidence.

**Observed repository implementation**

- **Authoring chain exists.** [launchOrchestrator.ts:769](C:/Users/emman/unison-tasks-official-main/src/services/launch/launchOrchestrator.ts:769) calls `authorSitePages` in stage `author`, supplies a `persistAiCommit` callback, and reports retained baselines as degraded outcomes. [siteAuthoringOrchestrator.ts:183](C:/Users/emman/unison-tasks-official-main/src/services/launch/siteAuthoringOrchestrator.ts:183) invokes the repair loop; [aiRepairLoop.ts:123](C:/Users/emman/unison-tasks-official-main/src/services/builder/aiRepairLoop.ts:123) calls `prepareAICandidate`. [aiCandidateGates.ts:153](C:/Users/emman/unison-tasks-official-main/src/services/builder/aiCandidateGates.ts:153) constructs candidates, rebuilds after optional preflight, and runs gates.
- **Persistence uses the existing service.** [aiApplyGate.ts:164](C:/Users/emman/unison-tasks-official-main/src/services/aiApplyGate.ts:164) resolves identity, converts next files into a patch, and calls `commitMutation` with preview required. This establishes wiring, not complete deletion/rename or concurrency semantics.
- **Compiler preservation is conditional.** [commitToPipeline.ts:101](C:/Users/emman/unison-tasks-official-main/src/platform/core/commitToPipeline.ts:101) dispatches launch versus recompile and forwards `preservePageSources`. [canonicalPipeline.ts:648](C:/Users/emman/unison-tasks-official-main/src/platform/core/canonicalPipeline.ts:648) compiles first, conditionally restores registered pages, composition metadata, and components, then normalizes theme source. Its preservation baseline is captured afterward, so the later Stage 4b assertion alone cannot detect earlier loss.
- **Merge and proof disagree about authorship.** [canonicalLaunchVfs.ts:567](C:/Users/emman/unison-tasks-official-main/src/services/canonicalLaunchVfs.ts:567) copies generated registered pages at merge time while protecting compiler artifacts. At [line 708](C:/Users/emman/unison-tasks-official-main/src/services/canonicalLaunchVfs.ts:708), proof still labels page authority `canonical-compiler`. Later repair and normalization mean merge-time copying does not establish end-to-end byte preservation.
- **Seal checks are narrower than M0.** [snapshotSeal.ts:215](C:/Users/emman/unison-tasks-official-main/src/platform/core/snapshotSeal.ts:215) checks artifact/proof and router/CSS presence; missing registered pages can throw or be reported. This is not evidence of incoming-to-final authored-file equality.
- **Some stronger checks already exist.** [vfsCommitService.ts:441](C:/Users/emman/unison-tasks-official-main/src/services/vfsCommitService.ts:441) enables preservation for selected sources. Reviewed-composition and restore paths have specific hash checks. The [revision RPC call](C:/Users/emman/unison-tasks-official-main/src/services/vfsCommitService.ts:1410) sends parent revision and VFS hash; its server-side transaction guarantees were not inspected.
- **Projection remains memory-dependent.** [snapshotProjector.ts:407](C:/Users/emman/unison-tasks-official-main/src/services/snapshotProjector.ts:407) tracks live edits in a module-level path map. Projection clears protection on matching contents; the inspected mechanism has no revision-scoped deletion journal.

**Historical conflicts and unresolved evidence**

The milestone identifies historical content-only Wizard rules for retirement; their remaining locations were not audited. Compiler-preferred page authorship conflicts with accepted-source authority, and the current aggregate proof visibly retains that mismatch. Certified signatures should govern reuse of that implementation, not prohibit original siblings. Global “AI always wins” merging would conflict with revision ordering.

ARIA screenshots and source were **not inspected or certified**. Registry exports, prompt conflicts, shared knowledge delivery, contract mirror equality, database compare-and-swap behavior, full Builder call coverage, legacy sync reachability, preview/publish consumers, and migration/recovery behavior remain unverified within this bounded inspection. No runtime, visual, booking, or regression evidence was produced; none of M0–M5 is certified here.