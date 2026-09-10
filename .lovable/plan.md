# UNISON — Industry Web Engineering foundation (additive)

Goal: layer a commercially usable, recipe-driven product surface on top of the
existing canonical pipeline **without removing anything that already works**.
Everything below extends current systems; no launcher, compiler, or preview
authority is replaced, and no parallel recipe layer is introduced.

## What already exists (extended, not rebuilt)

- `LauncherWizard.tsx` (selection-only) + `launchOrchestrator.ts` — the only
  launch path. Keep both; extend the step model.
- `WizardSelections` in `platform/core/playground.ts` — already the typed
  selection contract. Extend, don't fork.
- `INDUSTRY_MATRIX` (`platform/core/industryMatrix.ts`) — already the
  `IndustryDefinition`: default pages, default capabilities, primary intent,
  CRM pipeline, automation pack, seed keys.
- `INDUSTRY_INTENT_PROFILES` — required/primary/forbidden intents per industry.
- `src/data/pageRecipes.ts` + `schemas/SiteGraph.ts` — already
  `PageRecipe` / `SectionRecipe` / `IndustryRecipeSet`.
- `capabilityRegistry.ts` / `coreIntents.ts` — already `CapabilityDefinition`.
- `designImplementationRegistry.ts`, section + variant registries,
  `themePresets` — already the design vocabulary.
- Supabase: `businesses`, `projects`, `builder_drafts`, `site_revisions`,
  `site_bundles`, `pages`, `site_capabilities`, `user_subscriptions`.

## 1. Recipe architecture — align, don't duplicate

**No `src/recipes/` folder.** Instead:

- **Industry keys stay canonical — and all nine are first-class.** The product
  covers `saas`, `salon`, `contractor`, `restaurant`, `coaching`, `ecommerce`,
  `portfolio`, `nonprofit`, `agency`. Marketing names (Unison Beauty /
  Contractor / Professional) are display labels in
  `wizardCatalog.INDUSTRY_DISPLAY` over `salon` / `contractor` / `coaching`,
  not new keys — and they are the launch set, not the whole system.
- **No booking bias.** Each industry gets its own primary journey and its
  design/capability set is built around that journey, not retrofitted from
  appointments:

  | Industry | Primary journey | Anchor capability |
  |---|---|---|
  | salon | book a service | booking |
  | contractor | request a quote | quoting |
  | coaching | book a discovery call / enroll | booking + lead-capture |
  | agency | qualified lead + case-study proof | lead-capture |
  | saas | trial / demo signup | auth + lead-capture |
  | ecommerce | browse → cart → checkout | commerce + payments |
  | restaurant | menu → reserve / order | booking + commerce |
  | portfolio | showcase → contact | contact |
  | nonprofit | donate / volunteer | donation |

- **Close the real gaps**: `contractor` exists in `INDUSTRY_INTENT_PROFILES` but
  is missing from `INDUSTRY_MATRIX` — add it. Then add a parity assertion that
  every industry appears in the matrix, the intent profiles, `pageRecipes`, and
  the design-recipe map, with the anchor capability above actually present.
  Any industry failing parity fails CI, so none can silently stay booking-shaped.

- **Extend `IndustryProfile` in place** with the fields the product needs:
  `designDirections: DesignRecipeId[]`, `conversionJourney: CoreIntent[]`,
  `profileFields: BusinessProfileFieldSpec[]`. Optional, so existing entries
  keep compiling.
- **Design recipes** live next to the design vocabulary as
  `platform/core/designRecipes.ts` — the one genuinely new file, because no
  current module maps a named art direction to allowed variant ids. Each
  `DesignRecipe` declares compatible variant ids per section type, drawn from
  `designImplementationRegistry` (validated against it, no new renderers).
- **Resolver**: extend the existing seed/composition path rather than adding a
  second one — `resolveSiteConfiguration()` added to
  `platform/core/resolvedComposition.ts`, consuming `WizardSelections` +
  `INDUSTRY_MATRIX` + `pageRecipes` + `designRecipes` and emitting the
  `SiteConfiguration` that already feeds Stage 4b. Curated and deterministic;
  this is the seam the fuller Unison compiler later replaces.

## 2. Data model (additive migrations only)

New tables, RLS via existing `is_business_member` / `is_project_member`:

- `wizard_selections` — `project_id`, `business_id`, `selections jsonb`,
  `step`, `version`. One durable row per project, upserted per step so
  selections survive refresh.
- `site_configs` — `project_id`, `config jsonb` (resolved
  `SiteConfiguration`), `industry_key`, `design_recipe_id`, `recipe_version`.
- `integrations` — `business_id`, `provider`, `capability`, `status`,
  `config jsonb` (no secrets; those stay in the secret store).

No `industry_recipes` / `design_recipes` tables — the code registries above are
the source of truth, so a DB copy would be a parallel authority. Existing
`pages` and `site_capabilities` are reused as-is.

## 3. Launcher: 4 steps → 8 steps

Extend `wizardCatalog.ts` `STEP_ORDER` to
`industry → profile → goals → pages → capabilities → visual → review → launch`.
Existing steps map forward: `industry` stays, `questions` splits into
profile/goals, `templates`+`aesthetic` become `visual`, `review`/`launch` wrap
the existing `LaunchStageTimeline`.

- Steps write through a new `wizardSelectionStore.ts` → `wizard_selections`
  (debounced upsert) and back into `WizardSelections`; reload rehydrates from
  Supabase, so no launcher state lives only in React.
- `launchOrchestrator.plan()` gains one call: resolve the `SiteConfiguration`
  and persist it to `site_configs` alongside existing provisioning. All other
  launch stages untouched.

## 4. Renderer

No new renderer. `SiteConfiguration` selects section types + variant ids per
page and feeds `resolvedComposition` → Stage 4b exactly as today. Industry
difference comes from differing section sets and variants, not colour swaps —
enforced by a lint that fails when two industries resolve to an identical
section/variant signature.

## 5. Design system

Fill gaps in the existing variant families so each design recipe has real
choices: hero (editorial/split/immersive/typographic), services
(editorial-list/media-grid/spotlight/alternating), testimonials
(featured/minimal/story), cta (booking/lead/editorial). Register only missing
variants in the existing registry; all token-driven, no colour literals.

Journey-specific sections get the same treatment so non-booking industries are
not second class: quote/estimate blocks (contractor), menu and reservation
blocks (restaurant), product grid / cart / checkout summary (ecommerce),
pricing + trial CTA (saas), case-study and results blocks (agency), donation
and impact blocks (nonprofit), project/case gallery (portfolio). Each is CTA-
bound to that industry's anchor capability.

## 6. Integration boundary

`src/integrations/capabilities/` — capability ids covering every anchor
journey: `lead.capture`, `appointment.create`, `quote.request`,
`order.create`, `payment.checkout`, `donation.create`, `review.request`,
`subscription.start` — mapped to provider adapters (GoHighLevel, Stripe,
calendar, email). These reuse `capabilityRegistry` ids; pages bind to the
capability only, and the adapter is resolved at runtime from `integrations`.


## 7. Public + app surface

Additive routes in `routeConfig.tsx`: public `/features`, `/industries`,
`/industries/:key`, `/case-studies` (`/` and `/pricing` exist); authenticated
`/app` shell with `/app/projects`, `/app/business-profile`, `/app/launch`,
`/app/integrations`, linking the existing `/dashboard`, `/settings`,
`/web-builder` rather than replacing them. Each industry page gets its own art
direction inside one product family.

## 8. Subscriptions

Reuse `user_subscriptions`; add a plan/entitlement resolver (`free` /
`professional` / `managed`) consumed by UI gating only. Project ownership logic
stays independent of pricing UI.

## Sequencing

1. Industry alignment: add `contractor` to the matrix, extend `IndustryProfile`,
   add the matrix/intent-profile parity assertion.
2. `designRecipes.ts` + `resolveSiteConfiguration()` in `resolvedComposition`.
3. Migrations for `wizard_selections`, `site_configs`, `integrations`.
4. Selection persistence and the 8-step launcher.
5. `SiteConfiguration` persistence wired into `launchOrchestrator.plan`.
6. Variant coverage + industry distinctiveness lint.
7. Integration abstraction.
8. Public marketing pages and `/app` shell, then entitlements.

## Technical notes

- One source of truth: wizard selections → `SiteConfiguration` → existing
  `SiteBundleSnapshot`, which stays canonical for preview.
- New SQL follows create → grant → enable RLS → policy.
- Nothing in `launchOrchestrator`, `canonicalPipeline`, `VFSCommitService`, or
  the wizard's deterministic contract is removed; the resolver sits before them
  as an input producer.
