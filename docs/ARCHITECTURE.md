# Unison — current architecture

Source-reviewed 2026-10-08. This is the current architecture map, not a claim that all release or live verification gates have passed. Older plans and incident reports preserve their dated evidence; start with [docs index](README.md).

## Authority hierarchy

```text
Canonical contracts → schemas → accepted SiteBundleSnapshot
  → runtime projections → UI / preview / publish
```

| Concern | Authority |
| --- | --- |
| Launch choices | Chat/Wizard shared plan, finalized selections |
| Launch orchestration | `src/services/launch/launchOrchestrator.ts` |
| Fresh application source | `src/services/app-builder/UnisonAppBuilder.ts` isolated candidate |
| Topology and routes | Canonical page identity + Playground PageRegistry |
| Section presence/content/layout | SiteBundle composition; not topology or style variation |
| Tokens and Art Direction | Stage 4b, sealed SiteDesignContract and design-system contracts |
| Source acceptance | `src/services/vfsCommitService.ts` `commitMutation` |
| Saved identity | Accepted revision + `ProjectRuntimeEnvelope` |
| Catalog operation authority | `agentOperations` → `catalogOps` → `cms-records`; Resource Runtime catalog adapter shares that gateway |
| Resource storage semantics | Resource registry + catalog/content/profile adapters |
| Runtime actions | Canonical intents, bindings, manifest and permission-checked executors |
| Preview | Projection of accepted/current source, never an independent author |

## Runtime baseline

The manifest declares React/ReactDOM 19.2, TypeScript 5.9, Vite 7.3, React Router 7, Sandpack 2.20, Fabric 7.2 and Playwright 1.56.1. `main.tsx` uses `createRoot`, the application mounts React Router `BrowserRouter`, and app CSS uses Tailwind 3 directives. Additional installed TanStack/Tailwind packages do not establish a migrated active runtime. Generated-site preview routing is a separate canonical HashRouter concern.

## Shared launch plan and application authorship

`chatLaunchPlan.ts` synchronizes the homepage chat brief and Wizard. `buildSyncedVisionBrief` gives final selections precedence; page briefs lead with their own composition targets and design contracts rather than unrelated global content.

```text
LauncherWizard (selections only)
  → runLaunchPipeline / launchOrchestrator
  → canonical planning and contracts
  → app-build: UnisonAppBuilder
      → page authorship inside one isolated application candidate
      → candidate validation / bounded repair / site-wide closure
  → protected infrastructure and canonical promotion
  → commitMutation → accepted revision → Builder handoff
```

Fresh-launch authorship occurs in `app-build`; deprecated page-author callbacks are not a second downstream author stage. Intermediate page/repair progress is not a canonical revision. Canonical planning supplies topology, capabilities, intents, bindings, tokens, Art Direction and protected foundation; it must not recompose competing page bodies after App Builder acceptance. Failed fresh generation is reported, not silently replaced by a generic deterministic site.

Launch provisioning links business, site, project, draft, build and runtime setup through the existing authenticated provisioner. Source acceptance and launch provisioning have their own boundaries; do not describe all storage/backend side effects as one universal atomic transaction.

## Design authority

Unison resolves Industry × Theme Family × Art Direction Pack × Page Archetype × Experience × Brand × Intent × Content × Seed. Families classify packs; resolved packs remain sealed. Brand overrides must not replace the pack or topology. Page-local hero/alignment/rhythm/variants may differ while shared chrome and legal vocabulary remain coherent.

The attached library is `src/design-system/unison-x-loveable-design-d5be96/`. The application loads its tokens after base CSS, uses `src/styles/unison-theme.css` for app-only roles and loads library font links in `main.tsx`. Managed library files are not consumer-editable. `src/sections/unison/` is the existing authoring/toolkit integration, not a competing canonical registry.

A stable seed makes deterministic planning reproducible. AI-produced page bytes are not guaranteed identical across new calls. The curated registry is the preferred executable vocabulary; contract-valid local authored artifacts are allowed. Provenance, legality, accessibility and dependency requirements still apply. See [Affinity](UNISON_AFFINITY.md) and toolkit references.

## Saved-project spine and recovery

`BuilderSessionProvider` carries `ProjectRuntimeEnvelope`, assembled from a persisted revision and its canonical snapshot. Authority is persisted envelope → legacy compatibility → route/browser hints. Navigation hints cannot overwrite identity. A revision adoption advances the envelope before downstream controllers consume its snapshot.

`PageTopologyController`, `PlaygroundSyncController` and `PreviewRuntimeController` wrap existing services. Their directory README distinguishes delivered controllers from still-pending extraction; no new custom hook files are introduced.

Saved projects hydrate accepted files without regeneration. `builder_drafts` is the draft association/cache and revision pointer; canonical revisions and their snapshot are durable authority. Recovery journals preserve interrupted local work but are not permission to overwrite a newer accepted remote revision. Legacy conversion can reconstruct from explicit saved selections, with reconstruction labeled rather than misrepresented as recovered original source.

`snapshotProjector` prefers live VFS bytes for snapshot-owned paths and live `/src/**` additions when parsing the live VFS, avoiding stale embedded snapshot copies. The launch-handoff importer has its own dedupe ref so revision adoption cannot re-import initial launch files.

## Canonical edits and checkpoints

`builderMutationCoordinator.ts` serializes exclusive mutations and pauses autosave. Fingerprint rebase permits non-overlapping candidate changes; `aiApplyGate` retains conflict checks. AI/toolbar/code/terminal proposals enter existing mutation services and `commitMutation` rather than directly persisting or importing a second file set.

User-driven `ai-builder`/`playground-edit` preflight disables quarantine and required-intent closure: invalid pages are refused, not replaced with stubs; style edits cannot inject unrelated required forms. AI intent-retarget checks run before acceptance. Scoped guards identify unrelated visible copy/side effects; Auto bypasses approval holds, not canonical validation/authorization.

Background saves do not overlap an in-flight persist. The per-draft circuit breaker backs off identical failed payloads. Recoverable write timeouts reconcile saved revisions before bounded idempotent retry. Automated binding/GHL/republish saves are refused if their base predates a newer committed AI edit.

Checkpoint labels show the request, saved files/routes and grouped internal settings, not candidate IDs. Restoring accepted source still uses canonical preview validation but sets `requireReadinessPass: false`; incomplete publish connections block publication, not ordinary Builder editing or restore.

## Agentic editing surfaces

See [Agentic IDE](AGENTIC_IDE.md) for typed inspections/proposals, node addresses, terminal behavior, Split workspace and activity signals. Toolbar AI is a front end to the same Builder panel and conversation. Click targeting carries route/element ownership and resource provenance; labels are not storage identity.

`builder_chat_history` stores per-draft conversations with owner access; browser storage is a fast cache. Inline approval notices remain minimal. Full Auto proceeds through ordinary approval categories while retaining save/permission checks; terminal command confirmation remains independent.

File activity uses `vfsEventBus` `agent:event`. `ai-chat/FileActivityRibbon.tsx` shows emitted stages and file diffs; file links open Split editor tabs. Preview loaded, source saved and behavior verified are distinct events, not interchangeable success claims.

## Business data and runtime actions

See [Resource Runtime](RESOURCE_RUNTIME.md). Catalog, Content and Business Profile share editing mechanics but retain separate adapters, tables, permissions and lifecycles. Catalog's sole client-operation surface is `agentOperations`; no legacy `catalogOperations` writer may be reintroduced. Record edits/undo are database operations, not site source revisions or an atomic source-plus-data transaction.

Rendered `data-ut-resource` refs identify real records/fields. Bound sections refresh on invalidation; unmarked hardcoded pages do not acquire record editing automatically. Public content reads retain published-only semantics.

See [Universal intents](UNIVERSAL_INTENT_SYSTEM.md). `data-ut-intent` carries canonical action vocabulary, slot/binding identity controls behavior, and intent definitions declare trigger type/capabilities. Source restyling cannot change destinations. Runtime execution and backend permissions remain authoritative.

## Preview and browser verification

`VFSPreview` uses the shared Sandpack preparation pipeline. Generated `/src/App.tsx` is the deterministic PageRegistry router, not AI-authored; pages own the required site chrome. Fabric is graphic-design tooling, not website state/render authority. Docker/static helpers do not define an accepted-site fallback.

`previewVerification` tracks compile/load state. Post-commit checks capture previously visible intents on the current route and compare after loading. Route changes, timeouts and unreachable probes report unconfirmed, not missing controls or unsaved work. Probes do not prove visitor handlers succeeded.

`BrowserVerifier`/`BrowserProbeProvider` are replaceable read-only observer seams. Local Playwright tooling runs outside the client bundle; the default in-preview adapter cannot click or genuinely extract arbitrary text. Hosted Playwright/candidate-preview support remains outstanding. See [Preview runtime](PREVIEW_RUNTIME_ARCHITECTURE.md).

## Backend and AI

Lovable Cloud supplies authenticated functions, Postgres access control, storage and realtime. Clients use the unified project integration. Public visitor endpoints and private editing commands have different authorization boundaries. CORS must allow supported preview origins and client platform/runtime headers; a failed preflight is transport failure, not an empty record.

Composer modes share the existing `ai-code-assistant` function. Response shape is defined in `_shared/aiComposerContract.ts` and byte-mirrored in `src/contracts/aiComposerContract.ts`. Provider order is task/mode/configuration-dependent, not a universal Gemini/OpenAI weighted primary. See [AI providers](ai-providers.md).

## Evidence and remaining work

This documentation refresh does not deploy functions, migrate data, rerun all suites or certify a live launch. `roadmap.md` keeps open: broader structured change sets/edge activity, hosted browser worker and candidate previews, and authenticated click-to-edit/resource save/read-back/undo verification. Previously reported route/button and provider-limit incidents need fresh site-specific verification; documentation is not evidence those incidents are resolved.
