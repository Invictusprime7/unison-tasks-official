# Milestone: Direct WYSIWYG + Project-Isolated Backend (guidebook 2026-10-09)

Built exactly to the guidebook's phases, names and file layout. Goal: each site's saved items belong only to that site, and every way of editing (click-to-edit, floating toolbar, inspector, AI, command menu) uses one set of editing commands.

## Phase 0 — Stop new cross-project mixing (§11–14, §77)
Separate small migrations, not one big one (§77):
1. `project_id` (+ `site_id` where it fits) on products, services, menu_items, pricing_plans, featured_offers, testimonials, portfolio_projects, catalog_collections, availability_slots, form_definitions. Backfill from the business's only project; rows that can't be placed stay null and are hidden from site reads.
2. `project_id` on content_types, content_entries, content_entry_revisions, content_publish_events.
3. Project-aware unique slugs (project + slug).
4. Project-aware access rules using `is_project_member`.
- `cms-records`: every read/create/update/delete filters `business_id` + `project_id` and writes both (§12).
- `site-runtime-read`: catalog queries use both values (§13).
- Tests: two sites under the same business never see each other's items (§81).

## Phase 1 — Editor command layer (§20–26)
- New `src/services/editor/`: `editorCommandTypes.ts` (the 16 commands from §22: SetText, SetStyle, SetAttribute, SetLink, ReplaceAsset, Resize, Move, SetVisibility, Duplicate, Delete, UpdateResourceField, InsertComponent, CreateComponent, CreatePage, CreateOverlay, BindIntent), `editorCommandService.ts`, `editorCapabilities.ts`, `propertyOwnerResolver.ts`, `executors/`.
- Property-level ownership by extending the existing `EditableEntity.owners` (§23); `editableOwnershipResolver.ts` reads `data-ut-resource` directly via `parseResourceProvenance` (§24).
- Floating toolbar becomes UI only and sends commands (§25); `commitMutation` stays the only page-code writer (§26); one command result shape (§44); AI and command menu use the same commands (§45).

## Phase 2 — Project backend binding (§4–6, §9, §64)
- Evolve `connected_supabase_projects` (no new table): drop the per-business active index, add `site_id`, unique active backend per `unison_project_id` and per `site_id` (§5), add `mode` (`unison-managed` | `connected-supabase`) and the §6 lifecycle statuses.
- `src/services/project-backend/`: `projectBackendTypes.ts` (`ProjectBackendBinding`, `ProjectBackendDescriptor`), `projectBackendResolver.ts` (`resolve(projectId)` → `shared-legacy` | `dedicated`), `projectBackendHealth.ts`. No backend choice in UI components (§65).
- `unison_runtime_identity` single-row table definition in the runtime schema bundle (§9).

## Phase 4–5 — Gateway + Resource Runtime migration (§27–29, §41–43)
- `api/project-backend.ts` (plus `projectBackendGateway.ts`, `projectBackendClient.ts`): authenticate, check project membership, resolve binding, decrypt secret (dedicated only), verify runtime identity, run the resource/asset command, audit.
- Catalog, Content and Business Profile adapters go through the gateway; `ResourceContext.projectId` becomes required. Business Profile splits into account identity + site profile (§15, §43). Invalidation carries `projectId`.

## Blocked — needs you (Phases 3, 6–10)
- Phase 3 `create-project` route (§8) needs Supabase Management API OAuth credentials (`SUPABASE_OAUTH_CLIENT_ID/SECRET`, `OAUTH_STATE_SECRET`, `CONNECTED_PROJECT_TOKEN_ENCRYPTION_KEY`) set on Vercel, and a decision on who pays for each per-site database. Until then every site resolves to `shared-legacy` with Phase 0 scoping.
- Phases 6–10 (asset runtime, published runtime, Vercel binding, `unison.runtime.json` export, existing-project migration) follow after Phase 3.

## Technical details
- Migrations are additive; the business-index drop is the only removal and is an index, not data.
- `AGENTS.md` rules: backend chosen only by `ProjectBackendResolver`; site data always carries `project_id`; all editing surfaces emit `EditorCommand`s.
