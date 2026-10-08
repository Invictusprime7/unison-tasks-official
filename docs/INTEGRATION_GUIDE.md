# Unison integration contracts

Current integration checklist, source-reviewed 2026-10-08. This replaces the historical launcher-context-owned file-writing instructions.

## Extend the existing authorities

| Integration | Required boundary |
| --- | --- |
| New launch UI | Collect selections, synchronize via `chatLaunchPlan`, invoke existing orchestration; never author VFS files |
| Application authoring | App Builder isolated candidate → validation/closure → `commitMutation` |
| Saved Builder entry | Hydrate `ProjectRuntimeEnvelope` from accepted revision before controller consumption |
| New file edit surface | Propose operations → coordinator/mutation service → canonical commit |
| Terminal operation | `onPatch` FileOps/RouteOps → `runExclusive('terminal')` → `commitBuilderFiles` |
| AI or command-menu action | Compose/register `agentOperations`; do not introduce a parallel agent/writer |
| Catalog changes | `agentOperations` → catalog adapter → shared Resource Runtime |
| Content/profile changes | Resource definitions + existing adapters/permission-checked commands |
| Preview UI | Existing VFSPreview/preparation; observe, do not regenerate pages |
| Browser verification | BrowserVerifier/BrowserProbeProvider adapter outside client Playwright |
| Design components | Attached local library and canonical toolkit contracts; do not modify managed source |

## Identity, routes and behavior

Use persisted revision identity before route/browser hints. Topology owns page identity; composition owns section presence and content. Generated App.tsx is the deterministic PageRegistry router. Labels are presentation; slots/bindings/resource refs identify behavior and storage.

Source appearance changes preserve destinations. Intent changes require canonical binding operations. Record changes identify a real saved record; do not resolve by nearby label text or assume every old page is already marked.

## Data versus source

Resource operations have their own validation, permissions and adapter storage. A database write is not an accepted VFS revision. Compatibility source updates after a record save still use canonical acceptance. No universal cross-storage transaction or persistent record undo journal is implemented.

Content lifecycle stays draft/review/published/archived. Profile cardinality is single-record; it is not a new table or a product-facing “singleton”.

## Verify the seam

Add focused tests for the existing boundary and run them. For a live flow, authenticate, load the real site, perform the operation and read its result back through the UI. Distinguish source saved, preview loaded and visitor action succeeded. Default probes are current-route read-only checks, not a hosted interactive browser.

Do not rewrite historically accepted source during documentation or integration updates. See [Architecture](ARCHITECTURE.md), [Agentic IDE](AGENTIC_IDE.md), [Resource Runtime](RESOURCE_RUNTIME.md) and the controller directory README. Outstanding hosted/live gates remain in `roadmap.md`.
