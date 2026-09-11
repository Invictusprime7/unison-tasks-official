# Complete industry coverage, then unlock 3D and motion

## What the audit found

The registries disagree about how many industries the product actually ships, so anything downstream (recipes, art packs, AI enrichment) is aligning to an incomplete set.

- The industry matrix describes **11** industries: saas, salon, local-service, contractor, coaching, restaurant, ecommerce, agency, nonprofit, portfolio, real-estate.
- The parity assertion (`industryParity.ts`) only enforces **9** — `local-service` and `real-estate` are never checked, so they can silently degrade.
- Intent profiles cover all 11.
- Page recipes are keyed to a different vocabulary (`salon_spa`, `local_service`, `creator_portfolio`, `real_estate`, `other`) and are bridged by a hand-written map; saas, agency and contractor all borrow another industry's recipe set.
- Template compositions exist for 9 industry strings, but they are the wrong 9: `fitness` and `photography` exist while `local-service`, `real-estate`, `contractor` and `portfolio` have none.

This mismatch is why AI fortification drifts: the AI is handed art-pack and recipe direction for an industry that has no first-class composition or recipe of its own.

The guidebook is explicit that 3D and advanced motion (Phase 6A) may not start until the industry/page-archetype expansion (Phase 6) is complete and accepted cross-industry. So the order below is not optional.

## Plan

### Step 1 — One industry list, enforced

Make the matrix the single list of shipped industries and derive the parity list from it instead of hand-maintaining a second array. `local-service` and `real-estate` join the enforced set, and the parity test fails the build if any industry lacks an anchor capability, conversion journey, profile fields, intent profile, recipe mapping, or at least three allowed art packs.

### Step 2 — Close the per-industry gaps the parity check exposes

For each industry now failing parity, fill in the missing pieces inside the existing authorities — no new files:

- complete page contracts (which pages, their purpose, their expected sections),
- capability set and anchor capability, with the conversion journey steps all declared in the intent profile,
- allowed art-direction packs (minimum three, all registered).

### Step 3 — Recipes speak one vocabulary

Extend the page-recipe set so every shipped industry has its own entry rather than borrowing (`saas`, `agency`, `contractor`, `portfolio` today resolve to someone else's recipes). Keep the bridge map only where an industry genuinely shares a journey, and assert in the parity check that no two industries resolve to an identical recipe + journey signature.

### Step 4 — Compositions per industry

Add template compositions for the industries that have none (local-service, real-estate, contractor, portfolio) and re-key `fitness`/`photography` as variations under coaching and portfolio. Each industry gets distinct home + interior page archetypes so interior pages stop mirroring home.

### Step 5 — Cross-industry certification

Extend the existing AI-off certification walk to all 11 industries × allowed art packs: complete routes, distinct heroes, no duplicate sections, materialized variants, themed CSS present, no placeholder leakage. This is the Phase 6 acceptance gate.

### Step 6 — Only then, 3D and motion primitives (Phase 6A)

With Step 5 green, implement one complete immersive recipe end-to-end before any others — registered as a normal variant in the existing registry, with reduced-motion and no-WebGL fallbacks, asset-failure recovery, and eligibility limited by industry and page role so ordinary sites never install unused 3D. Advanced motion follows the same route: declared motion recipes with deterministic configuration and a bounded runtime budget. Screenshot, interaction, and persisted edit/reopen proof required per recipe.

## Technical notes

- Authorities stay as-is: `industryMatrix.ts` (industries and page contracts), `industryIntentProfiles.ts` (intents), `pageRecipes.ts` (recipes), `artDirectionPacks.ts` (art direction), `designImplementationRegistry.ts` (derived facade). No new parallel registry is introduced.
- `SHIPPED_INDUSTRIES` becomes derived from `INDUSTRY_MATRIX` keys; `INDUSTRY_RECIPE_KEY` shrinks as recipes gain first-class entries.
- Parity gains distinctness assertions so two industries can never compile to the same experience.
- 3D/motion recipes register through the existing variant registry and snapshot-owned experience foundation; no alternate scene authoring pipeline.
