# Unified Resource Runtime

Status: implemented P0 slices; real-site verification remains open. Source reviewed 2026-10-08.

## One runtime, distinct business semantics

`src/services/resources/` is the shared read/write and editable-field surface for Catalog, Content and the Business Profile Resource. It does not collapse them into one table or lifecycle.

| Kind | Cardinality | Adapter | Semantics |
| --- | --- | --- | --- |
| Catalog | `collection` | `catalog` → `cms-records` | Existing surface-specific commerce, booking and pricing rules |
| Content | `collection` | `content` → `cms-records` | `draft`, `review`, `published`, `archived`; revisions and publish events |
| Business Profile Resource | `single-record` | `business-profile` → `businessProfileService` | Existing business record; permission-checked profile command |

`ResourceKind` describes semantics. `ResourceCardinality` describes structure. `ResourceStorageDefinition.adapter` selects storage; never infer storage solely from kind. “Single-record” is structural terminology, not a new product-facing name.

## Registry and API

`resourceRegistry.ts` wraps `catalogSurfaceRegistry`, rather than replacing it. Catalog resources and the business profile are static; content definitions are registered from `content_types` using `registerContentTypes`. An unregistered content key cannot be read or edited through the runtime.

`resourceTypes.ts` defines fields, capabilities, storage, lifecycle, context, record refs and operations. The schema describes editable fields; adapters and command gateways keep their existing validation and authorization responsibilities.

```text
queryResource / getResourceRecord
  → ResourceDefinition → storage adapter → existing read gateway

applyResourceOp
  → builder-mode check → editable-field validation
  → storage adapter → permission-checked command
  → resource invalidation + agent data-change event
```

`ResourceContext` carries business ID, optional project/site IDs and mode (`builder` or `published`). `applyResourceOp` refuses published-mode edits. Content published-mode reads filter to published entries; this client behavior does not replace server permissions or public runtime validation. Single-record resources cannot be created/deleted through the generic operation interface. Content has no generic delete adapter; archive uses the content lifecycle.

## Writer boundaries

- `agentOperations` is the sole client catalog-operation authority for AI, command menu, Catalog panel and migrated catalog callers. `catalogOps.ts` adapts these calls to the shared runtime.
- The floating record editor calls `applyResourceOp` for schema-driven edits to its identified record.
- Catalog/content gateways use `cms-records`; profile writes use `business_apply_profile_command` through the profile service.
- Database permissions remain server-enforced. Source changes still go through `commitMutation`; a record write is not a VFS revision and must not be described as one.
- Source and database updates are not one atomic cross-storage transaction. Do not promise that record undo is a site checkpoint restore.

## Saved-record provenance

`ResourceEntityRef` includes resource key, kind, record ID and optional field. Rendered elements encode the ref as:

```text
data-ut-resource="resource-key#record-id.field"
```

`parseResourceProvenance` checks the registered resource and `formatResourceProvenance` creates the mark. Preview selection carries provenance to ownership resolution, the toolbar and AI Builder. Labels remain presentation; they must not determine record identity.

New authored pages and live catalog renderers can carry these marks. Old hardcoded pages are not automatically record-backed. A source rewrite alone must not claim provenance unless it resolves to the real record.

`agentOperations.list_resources`, `read_resource` and `update_resource_field` provide the shared AI surface. Recognized simple record-value requests can use it directly; visual/tone/structural requests stay source proposals and preserve provenance.

## Live refresh

`invalidateResource` emits `resource:invalidated` on `vfsEventBus`. The preview message is `CATALOG_BINDINGS_CHANGED`, with an invalidation carrying `RESOURCE_INVALIDATED`, resource key, business, record IDs and optional source tables. Bound live sections can requery matching tables without remounting the entire preview.

This is invalidation, not replication. Rendering depends on a live binding and suitable table/resource mapping; unbound source text does not become live because an event was emitted. Content definitions may not have a physical `storage.table`, so verify their specific refresh path rather than promising every renderer refreshes.

## Floating editor and undo

`RecordFieldsEditor.tsx` loads the record only when expanded for a valid mark and business context. The clicked field appears first. JSON fields are omitted; text, multiline, numeric/money/rating, boolean, email and URL/image values use their corresponding inputs. Required/numeric checks run before saving changed fields.

Undo in the save toast sends captured old values through `applyResourceOp` and triggers invalidation again. It has no independent persistent undo journal or concurrency comparison. Load/save/undo errors are surfaced; failed record loading is not permission to fall back to editing unrelated page text.

## Transport and verification

Shared edge CORS accepts supported Lovable origins and client platform/runtime headers. A preflight rejection can look like “Failed to send a request”; diagnose transport, session, gateway and operation errors separately. Do not infer missing data from a blocked request.

Focused tests exist for runtime, resource agent operations and simple value-request parsing. The full authenticated sequence—select a live item, load fields, save, read back through preview, Undo and reload—remains open in `roadmap.md`. No database or service deployment is part of this documentation refresh.