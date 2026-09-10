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
  `allowedArtDirectionPacks: ArtDirectionPackId[]`, `conversionJourney: CoreIntent[]`,
  `profileFields: BusinessProfileFieldSpec[]`, `anchorCapability: CapabilityId`. Optional, so existing entries keep compiling.

- **Design recipes already exist as Art Direction Packs.** `src/sections/variants/artDirectionPacks.ts` already defines the full design system (allowed variant families per section type, surface, rhythm, media, motion, etc.) and `resolveArtDirectionPackId` is the only resolver. **No new `designRecipes.ts` file.** Instead, extend `ArtDirectionPack` with an optional `compatibleIndustries: string[]` and `recommendedForJourney: CoreIntent[]` so the wizard can filter packs by industry and anchor journey. The existing packs are the design vocabulary; we only need to map industries to allowed packs.
- **Resolver**: extend the existing seed/composition path rather than adding a
  second one — `resolveSiteConfiguration()` added to
  `platform/core/resolvedComposition.ts`, consuming `WizardSelections` +
  `INDUSTRY_MATRIX` + `pageRecipes` + `artDirectionPacks` and emitting the
  `SiteConfiguration` that already feeds Stage 4b. Curated and deterministic;
  this is the seam the fuller Unison compiler later replaces.


## 2. No-duplication audit (what NOT to create)

Every proposed addition was checked against what exists. Removed as redundant:

| Originally proposed | Already exists | Decision |
|---|---|---|
| `src/recipes/` folder | `INDUSTRY_MATRIX`, `pageRecipes.ts`, `SiteGraph` recipe schemas | Drop; extend those |
| `designRecipes.ts` | `sections/variants/artDirectionPacks.ts` (14 packs, variant families, surface/rhythm/media/motion, single resolver) | Drop; extend `ArtDirectionPack` |
| `wizard_selections` table | `builder_drafts.metadata.wizardSelections` is already the durable store (written via `canonicalLaunchVfs`) | Drop table; persist mid-wizard into the same metadata key |
| `wizardSelectionStore.ts` | `launcherHandoffPersistence.ts` + draft persistence | Drop; add a save/restore function there |
| `site_configs` table | Resolved config already lives in `SiteBundleSnapshot.meta`, the canonical record | Drop; stamp into snapshot meta |
| `industry_recipes` / `design_recipes` tables | Code registries are the source of truth | Drop |
| `src/integrations/capabilities/` new capability ids | `capabilityRegistry.CapabilityId` (booking, quoting, contact, newsletter, commerce, auth, lead-capture, donation) + `coreIntents` | Drop new ids; reuse existing ones |
| Entitlement resolver | `useEntitlements.ts` + `user_subscriptions` | Drop; extend existing hook with plan tiers |

Genuinely new, because nothing equivalent exists:

- `integrations` table — `business_id`, `capability_id`, `provider`, `status`,
  `config jsonb` (no secrets). Today provider wiring is hardcoded in
  `ghlIntentBridge.ts` / `ghlSkillPack.ts` with no per-business record.
- A provider-adapter map beside `capabilityRegistry.ts` that resolves
  `CapabilityId -> provider adapter` from that table.
- Public marketing pages and the `/app` shell routes.
- Missing section variants and journey sections (section 5).

## 3. Launcher: 4 steps → 8 steps

Extend `wizardCatalog.ts` `STEP_ORDER` to
`industry → profile → goals → pages → capabilities → visual → review → launch`.
Existing steps map forward: `industry` stays, `questions` splits into
profile/goals, `templates`+`aesthetic` become `visual`, `review`/`launch` wrap
the existing `LaunchStageTimeline`.

- Each step upserts `WizardSelections` into `builder_drafts.metadata.wizardSelections`
  through the existing draft persistence, so reload rehydrates and no launcher
  state lives only in React. (Pre-commit drafts may carry this metadata key; the
  canonical projection trigger only guards `vfs_files`, `siteBundleSnapshot`,
  `runtimeManifest`, and `activePagePath`.)
- `launchOrchestrator.plan()` resolves the `SiteConfiguration` and stamps it
  into snapshot meta alongside existing provisioning. All other stages untouched.

## 4. Renderer

No new renderer. `SiteConfiguration` selects section types + variant ids per
page and feeds `resolvedComposition` → Stage 4b exactly as today. Industry
difference comes from differing section sets and variants, not colour swaps —
enforced by a lint that fails when two industries resolve to an identical
section/variant signature.

## 5. Design system

Fill gaps in the existing variant families so each art-direction pack has real
choices per section type. Register only missing variants in the existing
registry; all token-driven, no colour literals.

Journey-specific sections get the same treatment so non-booking industries are
not second class: quote/estimate blocks (contractor), menu and reservation
blocks (restaurant), product grid / cart / checkout summary (ecommerce),
pricing + trial CTA (saas), case-study and results blocks (agency), donation
and impact blocks (nonprofit), project/case gallery (portfolio). Each is CTA-
bound to that industry's anchor capability.

## 6. Integration boundary

Reuse the existing `CapabilityId` set (booking, quoting, contact, newsletter,
commerce, auth, lead-capture, donation) and `coreIntents` — no new capability
vocabulary. Add the `integrations` table plus a provider-adapter map beside
`capabilityRegistry.ts` so GoHighLevel, Stripe, calendar, and email fulfil a
capability per business. Pages keep binding to intents only; `ghlIntentBridge`
becomes one adapter behind that map instead of the hardcoded path.

## 7. Public + app surface

Additive routes in `routeConfig.tsx`: public `/features`, `/industries`,
`/industries/:key`, `/case-studies` (`/` and `/pricing` exist); authenticated
`/app` shell with `/app/projects`, `/app/business-profile`, `/app/launch`,
`/app/integrations`, linking the existing `/dashboard`, `/settings`,
`/web-builder` rather than replacing them. Each industry page gets its own art
direction inside one product family.

## 8. Subscriptions

Extend the existing `useEntitlements` hook and `user_subscriptions` with the
`free` / `professional` / `managed` tiers, consumed by UI gating only. Project
ownership logic stays independent of pricing UI.


## Sequencing

1. Industry alignment across all nine: add `contractor` to the matrix, extend
   `IndustryProfile` (allowed art-direction packs, conversion journey, profile
   fields, anchor capability), add the parity assertion.
2. `resolveSiteConfiguration()` in `resolvedComposition`, consuming existing
   `artDirectionPacks`.
3. Wizard selection persistence into draft metadata + the 8-step launcher.
4. `SiteConfiguration` stamped into snapshot meta from `launchOrchestrator.plan`.
5. Journey sections + variant coverage + industry distinctiveness lint.
6. `integrations` migration + provider-adapter map; move GHL behind it.
7. Public marketing pages and `/app` shell.
8. Entitlement tiers on the existing hook.



## Technical notes

- One source of truth: wizard selections → `SiteConfiguration` → existing
  `SiteBundleSnapshot`, which stays canonical for preview.
- New SQL follows create → grant → enable RLS → policy.
- Nothing in `launchOrchestrator`, `canonicalPipeline`, `VFSCommitService`, or
  the wizard's deterministic contract is removed; the resolver sits before them
  as an input producer.
