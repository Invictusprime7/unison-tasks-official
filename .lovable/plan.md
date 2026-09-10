# UNISON — Industry Web Engineering foundation (additive)

Goal: layer a commercially usable, recipe-driven product surface on top of the
existing canonical pipeline **without removing anything that already works**.
Everything below extends current systems; no launcher, compiler, or preview
authority is replaced.

## What already exists (reused, not rebuilt)

- `LauncherWizard.tsx` (selection-only) + `launchOrchestrator.ts` — the only
  launch path. Keep both; extend the step model.
- `WizardSelections` in `platform/core/playground.ts` — already the typed
  selection contract. Extend, don't fork.
- `INDUSTRY_MATRIX`, `industryIntentProfiles`, `capabilityRegistry`,
  `coreIntents`, `designImplementationRegistry`, section + variant registries,
  `themePresets` — these already are the recipe substrate.
- Supabase tables `businesses`, `projects`, `builder_drafts`, `site_revisions`,
  `site_bundles`, `pages`, `site_capabilities`, `user_subscriptions`.
- Route table in `src/routes/routeConfig.tsx`.

## 1. Recipe architecture (new, curated, no AI in the resolve path)

New folder `src/recipes/`:

- `types.ts` — `IndustryDefinition`, `DesignRecipe`, `PageRecipe`,
  `CapabilityDefinition`, `SiteConfiguration`.
- `industries/beauty.ts`, `contractor.ts`, `professional.ts` — each declares
  default pages, recommended capabilities, allowed design directions,
  conversion journey, and business-specific profile fields.
- `designRecipes.ts` — editorial / structured / immersive / typographic
  directions, each declaring *compatible variant ids per section type* pulled
  from the existing variant registry (no random selection, no new renderers).
- `resolveSiteConfiguration.ts` — pure function:
  `(WizardSelections) -> SiteConfiguration`. Deterministic, curated-first.
  This is the seam where the full Unison compiler later plugs in.

`IndustryDefinition` registry is a map, so a new industry is one file.

## 2. Data model (additive migrations only)

New tables, all RLS-scoped through the existing `is_business_member` /
`is_project_member` security-definer functions:

- `wizard_selections` — `project_id`, `business_id`, `step`, `selections jsonb`,
  `version`. One durable row per project; the launcher upserts on every step so
  selections survive refresh.
- `site_configs` — `project_id`, `config jsonb` (the resolved
  `SiteConfiguration`), `recipe_version`, `industry_key`, `design_recipe_id`.
- `industry_recipes` / `design_recipes` — read-mostly catalog rows (public read
  for signed-in users) so recipes can be tuned without a deploy. Code registry
  stays the fallback source.
- `integrations` — `business_id`, `provider`, `capability`, `status`, `config
  jsonb` (secrets stay in the secret store, never in this table).

Existing `pages` and `site_capabilities` are reused as-is.

## 3. Launcher: 4 steps → 8 steps

Extend `wizardCatalog.ts` `STEP_ORDER` to
`industry → profile → goals → pages → capabilities → visual → review → launch`.
Existing steps map forward: `industry` stays, `questions` splits into
profile/goals, `templates`+`aesthetic` become `visual`, `review`/`launch` wrap
the existing `LaunchStageTimeline`.

- Every step writes through a new `wizardSelectionStore.ts` →
  `wizard_selections` (debounced upsert) and back into `WizardSelections`.
- Reload rehydrates from Supabase, so no launcher state lives only in React.
- `launchOrchestrator.plan()` gains one call: resolve the `SiteConfiguration`
  and persist it to `site_configs` alongside the existing provisioning. The
  rest of the launch stages are untouched.

## 4. Renderer

No new renderer app. `SiteConfiguration` is projected into the existing
composition path: it selects section types + variant ids per page, feeding
`resolvedComposition.ts` and Stage 4b exactly as today. Industry-specific
composition comes from differing section *sets and variants*, not colour
swaps — enforced by a recipe lint that fails when two industries resolve to an
identical section/variant signature.

## 5. Design system

Extend the existing section variant families with the named compositional
variants (hero: editorial/split/immersive/typographic; services:
editorial-list/media-grid/spotlight/alternating; testimonials:
featured/minimal/story; cta: booking/lead/editorial), registering any missing
ones in `designImplementationRegistry`. All token-driven — no hardcoded colour
literals, per existing guards.

## 6. Integration boundary

`src/integrations/capabilities/` — capability ids (`lead.capture`,
`appointment.create`, `quote.request`, `review.request`, `payment.checkout`)
mapped to provider adapters (GoHighLevel, Stripe, calendar, email). Pages bind
to the capability id only; the adapter is resolved at runtime from the
`integrations` table. Existing `coreIntents` remain the DOM-level vocabulary.

## 7. Public + app surface

Additive routes in `routeConfig.tsx`:
public `/features`, `/industries`, `/industries/:key`, `/case-studies`
(`/` and `/pricing` already exist); authenticated `/app` shell with
`/app/projects`, `/app/business-profile`, `/app/launch`, `/app/integrations`
(existing `/dashboard`, `/settings`, `/web-builder` keep working and are linked
from the shell). Each industry page gets its own art direction inside one
product family.

## 8. Subscriptions

Reuse `user_subscriptions`; add a plan/entitlement resolver
(`free` / `professional` / `managed`) consumed by UI gating only. Project
ownership logic stays independent of pricing.

## Sequencing

1. Recipe types + three industries + design recipes + resolver (pure, tested).
2. Migrations for the four new tables + RLS + grants.
3. Selection persistence and the 8-step launcher.
4. `SiteConfiguration` persistence wired into `launchOrchestrator.plan`.
5. Variant coverage + recipe distinctiveness lint.
6. Integration abstraction.
7. Public marketing pages and `/app` shell.
8. Entitlements.

## Technical notes

- No parallel source of truth: wizard selections → `SiteConfiguration` →
  existing `SiteBundleSnapshot`. The snapshot remains canonical for preview.
- All new SQL follows create → grant → enable RLS → policy.
- Nothing in `launchOrchestrator`, `canonicalPipeline`, `VFSCommitService`, or
  the wizard's deterministic contract is removed; the recipe resolver sits
  *before* them as an input producer.
