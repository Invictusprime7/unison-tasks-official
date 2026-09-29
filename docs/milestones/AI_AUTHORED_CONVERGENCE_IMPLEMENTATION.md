# AI-authored convergence implementation ledger

Started 2026-09-29 against repository commit `10a6df19`. Requirements: [original milestone](UNISON_AI_AUTHORED_CONVERGENCE_MILESTONE_2026-09-29.md). All milestone acceptance gates remain open; the rows below distinguish implemented primitives from production evidence.

## Preserved decisions

Original TSX, page-local variants and project-local components remain allowed. Registry recommendations and certification metadata are not a whitelist. Real parsing/import/runtime, declared sealed design, topology and revision constraints remain enforced. Keep the existing author/repair/candidate/single-writer pipeline, mirrored Composer contract and universal composition planner. Never promote timestamps or author identity above revision lineage.

## Work and acceptance sequence

| Gate | Implemented in this slice | Remaining implementation and acceptance |
| --- | --- | --- |
| M0 preservation | Expected-versus-final VFS verifier; reviewed Wizard/composition/restore commits assert all source before backend effects and persistence; plain Builder AI source edits reject undeclared compiler/preflight rewrites at early and final boundaries; Builder projection records revision-scoped creates/replaces/deletes and acknowledges only complete candidate operations | Broaden final source verification to presentation/theme/playground/binding edits after converting their transforms to explicit patches; remove compiler caller-flag dependency; no-op detection; conservative legacy preservation; durable recovery journal; stale project/base/candidate/sequence rejection and CAS/ack evidence; publish exact accepted revision |
| M1 authority | Preservation verifier accepts explicit compiler ownership, without marker heuristics. Seals now carry an exact per-runtime-file source fingerprint and sealing origin; canonical commits restamp that ledger only after finalization, and committed-runtime reopening verifies it before projection. | Replace remaining aggregate compiler-page proof; add richer per-file user/AI provenance and end-to-end seal/reopen evidence across all revision origins |
| M2 shared candidate | Existing candidate/gate/repair/single-writer chain traced | Unify Wizard/Builder candidate provenance, base revision, dependency/asset/intent and knowledge metadata; explicit deletes/renames; validate exact finalized source before acceptance |
| M3a knowledge | Versioned package, status filtering, deterministic retrieval, SHA-256 manifest, CLI synthesis; ARIA source and desktop/mobile views inspected, local exports documented, limited interactions checked, uninspected placeholder superseded | Audit historical policy conflicts; curate canonical registry APIs/props/imports/runtime contracts; broaden reference evidence and runtime checks |
| M3b context | Mandatory policy is appended in existing Wizard page-author and Builder-repair Composer requests; deterministic budget rejection and omission reports; backward-compatible source selector | Add Builder's initial-turn context; assemble/persist full five-layer manifest with exact revision, design, registry/runtime and asset identities; expose required-source omissions in UI/candidate metadata |
| M3c tools | Retrieval API and path-safe verifier primitives | Add scoped searchDesignKnowledge/getRegistryComponent/readProjectFiles/validateCandidate operations to existing protocol; validate project/base access; exact export lookup; local original-component and invented-import cases |
| M3d salon proof | Salon intent guidance is curated, not certified output | Author distinct Home/Services/Booking/About; inspect visuals and source; verify real service/appointment behavior and theme preservation |
| M4 convergence | Gaps identified in projection and authority | Add-page/shared-component flow across nav/editor/VFS/snapshot/reopen/publish; stable or explicitly remapped selections; truthful source/visual editability |
| M5 evidence | No success rates claimed | Record repeated salon, contractor, restaurant, commerce, portfolio and lead-capture runs; quality, runtime, repair, reopen and publish results with measured rates |

## M0 writer and projection trace

| Seam | Observation | Required follow-up |
| --- | --- | --- |
| `launchOrchestrator` → `siteAuthoringOrchestrator` → `aiRepairLoop` | Existing author stage calls candidate gates and the supplied canonical commit callback | Keep one route; trace base revision captured across parallel authoring and serialized commits |
| `canonicalPipeline.recompileProject` | Source restoration depends on `preservePageSources`; only selected paths restored before normalization | Establish expected authored bytes before any compiler stage, preserve all owned paths, reconcile only explicit compiler artifacts |
| `canonicalLaunchVfs` | Registered generated pages copied during merge; proof still declares compiler page authority | Preserve through later normalization; change proof only with per-file evidence |
| `vfsCommitService.commitMutation` | Applies file ops, sanitization, theme transforms, compilation, preflight and possible repair before backend operations and finalization | Compare expected versus actual at final boundary before backend effects and persistence; treat authorized repair as a new validated patch; handle reviewed composition and restore explicitly |
| `snapshotProjector` | Pending VFS operations are scoped by draft/project and contain base/candidate revision IDs, a monotonic local sequence, and explicit creates/replaces/deletes. The recovery journal persists them; a successful canonical transaction acknowledges only the operation IDs captured when it started and records its returned revision ID. Stale snapshots retain later operations. Autosave derives operations for direct editor, history, import and toolbar VFS changes from the last accepted file map. | Audit every topology/presentation origin and project-switch lifecycle; add server-returned operation acknowledgments if the RPC protocol is expanded beyond its current canonical revision ID response. |
| `snapshotSeal` | Existing integrity checks do not establish incoming-to-final equality | Add per-file authority and accepted-source hash evidence |
| SystemLauncher / wizardStage4bRuntime / preview hydration / publish | End-to-end writer/readers not yet fully audited | Trace every projection and publish path; forbid regeneration of accepted sources; prove revision parity |

The verifier is wired for exact reviewed-artifact acceptance. Plain AI source edits now use an explicit compiler runtime contract (`App`, main entry, generated UI/runtime paths and generated recipe/section modules); all other byte changes must be in the candidate. Presentation, theme, playground and binding transforms remain out of strict enforcement until they emit explicit transformed patches. `/src/index.css` remains mixed compiler/authored ownership. No registry, certification or directory-based authored-source whitelist was added.

## Required M0 evidence matrix

All ten end-to-end cases are pending; primitive tests do not substitute for them.

1. Launch → seal → preview → save → reopen preserves authored source.
2. Builder AI edit survives autosave and reload.
3. Theme and route changes preserve unrelated authored bytes.
4. Early compiler and late finalizer mutations both fail before persistence/projection.
5. Stale projection cannot resurrect deletions or overwrite newly dirty source.
6. Concurrent same-base candidates cannot both overwrite the accepted head.
7. Navigation/projection acknowledgments do not trigger regeneration or echo loops.
8. Preview and publish use the same explicit accepted revision.
9. No-op reconciliation produces no new source or revision churn.
10. Recovery retains independent pending operations and acknowledges only included operations.

## Verification commands for this slice

Results on 2026-09-29: all 12 focused tests passed; repository type check passed; generated knowledge artifact check passed; `git diff --check` passed (Git reported only configured LF/CRLF conversion warnings). Runtime used Node 24.21.0; repeat on the declared Node 22 environment before release. No live authoring or persistence rollout occurred.

`npx vitest run src/test/sourceKnowledgeContext.test.ts src/test/authoredSourcePreservation.test.ts src/test/designKnowledge.test.ts`

`node --experimental-strip-types scripts/build-design-knowledge.mjs --check`

`npm run type-check`

The second slice passed 35 preservation/commit tests and eight knowledge/context tests. Type checking passed after commit integration. ARIA reference evidence and environment adjustments are recorded in [its report](../knowledge/references/aria/REFERENCE.md). No provider-health, booking-backend, production deployment or complete milestone certification follows from these checks.

Follow-up regression coverage: the commit, customizer and theme suites passed 34 tests (31 overlap the commit tests above), for 46 distinct targeted tests across this slice. `lint:canonical-vfs-writes` and `lint:pipeline-bypass` passed. All retained ARIA source hashes were compared directly to ZIP entries; the portable knowledge build also verifies retained source and screenshot hashes. The isolated reference dev server and browser session were stopped after verification.

The projection and ordinary-AI slices passed 54 and 53 focused tests respectively, with type checking and both writer/bypass audits passing. New commit tests deliberately mutate an unrequested hook during canonical projection and preflight, proving both are rejected before persistence. These checks do not certify theme/presentation transforms, recovery after reload, server-side operation sequence handling, or publish parity.
