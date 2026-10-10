# Milestone: Direct WYSIWYG + Project-Isolated Backend

Goal: every site's saved items (services, menus, articles, images, bookings, leads, business details) belong to that one site and can never show up on another site, and every way of editing (clicking text, the floating toolbar, the inspector, the AI) goes through one editing path.

The guidebook has 11 phases. Phases 0–2 and 4–5 can be built now. Phase 3 (creating a separate database per site automatically) needs a Supabase account connection that only you can provide, so it is split out at the end.

## Slice 1 — Stop sites mixing data (Phase 0)
- Add a project link to every shared item table (products, services, menu items, pricing, offers, testimonials, portfolio, availability, content types/entries, media records), defaulting older rows to their business's single project where unambiguous.
- Make names/slugs unique per site, not per business.
- Item loading and saving (`cms-records`, `site-runtime-read`) refuse requests without a site, and only return that site's rows.
- Access rules check site membership (`is_project_member`), not just business membership.
- Tests: two sites under one business never see each other's items.

## Slice 2 — Site vs. account business details (§15)
- Account business identity stays on the business.
- New per-site business profile (name shown, hours, phone, address override), falling back to the account values. Resource Runtime reads/writes the site level.

## Slice 3 — One editing path (Phase 1)
- `EditorCommandService` with typed commands: set text, set saved field, replace image, restyle, move/remove section, relink button.
- Ownership resolver decides per property: saved item → Resource Runtime; page code → `commitMutation`; button → BindingOps.
- Floating toolbar, inline edit, inspector and simple AI edits all call it; it returns one result shape (what changed, where saved, undo handle).

## Slice 4 — Per-site backend binding (Phase 2)
- Evolve `connected_supabase_projects` into `project_backend_bindings`: one active backend per site (not per business), mode `unison-managed` | `connected`, lifecycle status, runtime identity check.
- `ProjectBackendResolver`: the only place that decides which backend a site uses. Today every site resolves to Unison-managed with site scoping from Slice 1.

## Slice 5 — Server gateway (Phases 4–5)
- `project-backend-gateway` function: signed-in check, site membership, resolve binding, verify identity, run the item/asset command, write an audit row.
- Catalog, Content and Business Profile adapters go through it. No backend keys in the browser.

## Later — needs you (Phases 3, 6–10)
- Automatic dedicated database per site requires a Supabase Management OAuth app (client ID/secret) and a billing decision, since each database costs money. I'll ask for these when we reach it.
- Then: per-site file storage, published site reading from its own backend, Vercel per-site settings, export manifest (`unison.runtime.json`), migrating existing sites one by one.

## Technical details
- Migrations are additive (nullable `project_id`, backfill, then NOT NULL in a later migration); no drops.
- Rule recorded in `AGENTS.md`: backend choice only via `ProjectBackendResolver`; site data always carries `project_id`.
- Existing UI components are untouched; adapters map data into them.
