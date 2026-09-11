# Restore page-level composition authority, complete industries, then unlock 3D and motion

## What the audit found

The registries disagree about how many industries the product actually ships, so anything downstream (recipes, art packs, AI enrichment) is aligning to an incomplete set.

- The industry matrix describes **11** industries: saas, salon, local-service, contractor, coaching, restaurant, ecommerce, agency, nonprofit, portfolio, real-estate.
- The parity assertion (`industryParity.ts`) only enforces **9** — `local-service` and `real-estate` are never checked, so they can silently degrade.
- Intent profiles cover all 11.
- Page recipes are keyed to a different vocabulary (`salon_spa`, `local_service`, `creator_portfolio`, `real_estate`, `other`) and are bridged by a hand-written map; saas, agency and contractor all borrow another industry's recipe set.
- Template compositions exist for 9 industry strings, but they are the wrong 9: `fitness` and `photography` exist while `local-service`, `real-estate`, `contractor` and `portfolio` have none.

This mismatch is why AI fortification drifts: the AI is handed art-pack and recipe direction for an industry that has no first-class composition or recipe of its own.

The repeated heroes have a second, confirmed cause in the active compiler path:

- `topologyVFSScaffolder.resolveActiveTemplate()` still falls through from the selected template to the **first industry composition**, then the first matching layout category/system type, and finally a fuzzy match. That is an active legacy substitution path, not merely dead code.
- Home preserves the selected template hero. Interior routes are then derived from that same template inventory and rewritten by `applyRouteHeroContract()`. Although a seeded hero variant is selected, every route is forced back through a small `WizardHeroContract` layout/archetype vocabulary and shared completion logic. This makes different pages structurally converge again.
- The generation brief still seals per-route `hero.geometry` and applies it during scaffolding. AI therefore cannot actually compose the hero; it can only decorate geometry already chosen upstream.
- The preview adapter does not re-normalize sealed Wizard drafts, so the recurring duplication is primarily being produced before the snapshot is sealed. However, launch assembly still contains compatibility/fallback branches that must be proven unreachable for Wizard drafts rather than trusted by comments.

So this is fragmentation: topology, template fallback, generation-brief geometry, role scaffolding, and Stage 4b all participate in hero authorship. The fix is to give them one contract and one acceptance point, not add another hero generator.

The guidebook is explicit that 3D and advanced motion (Phase 6A) may not start until the industry/page-archetype expansion (Phase 6) is complete and accepted cross-industry. So the order below is not optional.

## Plan

### Step 1 — Eliminate active legacy substitutions from the canonical launch

Trace every production-reachable branch from `LauncherWizard → launchOrchestrator → topology → composition → Stage 4b → snapshot → preview`. Remove the template/category/system/fuzzy substitutions used when a selected industry lacks a first-class composition. A missing registered composition becomes a named compile failure, never another industry's first template.

Remove or isolate every Wizard-reachable minimal/default scaffold, generic role pool, CSS injection, App derivation, page-body repair, and preview normalization path. Keep compatibility migration only for explicitly identified legacy/non-Wizard drafts behind one boundary. Add a zero-bypass test proving a sealed Wizard launch never enters any compatibility branch.

### Step 2 — One industry list, enforced

Make the matrix the single list of shipped industries and derive the parity list from it instead of hand-maintaining a second array. `local-service` and `real-estate` join the enforced set, and the parity test fails the build if any industry lacks an anchor capability, conversion journey, profile fields, intent profile, recipe mapping, or at least three allowed art packs.

### Step 3 — Close the per-industry gaps the parity check exposes

For each industry now failing parity, fill in the missing pieces inside the existing authorities — no new files:

- complete page contracts (which pages, their purpose, their expected sections),
- capability set and anchor capability, with the conversion journey steps all declared in the intent profile,
- allowed art-direction packs (minimum three, all registered).

### Step 4 — Recipes speak one vocabulary

Extend the page-recipe set so every shipped industry has its own entry rather than borrowing (`saas`, `agency`, `contractor`, `portfolio` today resolve to someone else's recipes). Keep the bridge map only where an industry genuinely shares a journey, and assert in the parity check that no two industries resolve to an identical recipe + journey signature.

### Step 5 — One page-composition contract per route

Add template compositions for the industries that have none (local-service, real-estate, contractor, portfolio) and re-key `fitness`/`photography` as variations under coaching and portfolio.

Replace the shared-home derivation pattern with a signed per-route composition contract. Each route receives its own eligible registered hero family, section narrative, media treatment, rhythm, conversion anchor, and anti-repetition signature. Topology owns page identity and purpose; the industry recipe supplies eligible structure; the art pack supplies visual vocabulary; registered primitives supply executable choices; Stage 4b materializes the accepted result exactly once.

Add compile-time assertions that sibling pages do not share the same hero implementation + layout recipe + media treatment signature unless explicitly allowed, and that no interior page silently clones Home's section sequence.

### Step 6 — Replace strict hero geometry with bounded AI composition

Remove `homeHeroGeometry` and per-route `hero.geometry` as authoring authorities. Keep only semantic and safety constraints: required content slots, valid intents, accessibility, media focal metadata, responsive bounds, and token-only styling.

Reintroduce AI at the guidebook's constrained augmentation seam. AI may choose and compose registered hero/section primitives, supported layout props, section ordering, motion recipes, and media treatments from the deterministic eligibility envelope for that industry, page role, art pack, and capability set. It may not invent component identities, change topology/capabilities, write routers/runtime files, bypass tokens, or write directly to VFS.

AI output is a typed page design proposal, not TSX authority. Validate it against the registries, reject duplicate sibling signatures, then feed it back into the canonical compiler. The compiler remains deterministic for a given accepted proposal; Stage 4b remains the sole materializer; launch retains a complete deterministic registered composition when AI is unavailable.

### Step 7 — Cross-industry and page-level certification

Extend the existing AI-off certification walk to all 11 industries × allowed art packs: complete routes, distinct hero signatures per sibling route, no duplicate sections, no Home-layout cloning, materialized variants, themed CSS present, no placeholder leakage, and no legacy branch activation. Then run the same matrix with AI proposals enabled and prove proposals remain inside the deterministic envelope. This is the Phase 6 acceptance gate.

### Step 8 — Only then, 3D and motion primitives (Phase 6A)

With Step 5 green, implement one complete immersive recipe end-to-end before any others — registered as a normal variant in the existing registry, with reduced-motion and no-WebGL fallbacks, asset-failure recovery, and eligibility limited by industry and page role so ordinary sites never install unused 3D. Advanced motion follows the same route: declared motion recipes with deterministic configuration and a bounded runtime budget. Screenshot, interaction, and persisted edit/reopen proof required per recipe.

## Technical notes

- Authorities stay as-is: `industryMatrix.ts` (industries and page contracts), `industryIntentProfiles.ts` (intents), `pageRecipes.ts` (recipes), `artDirectionPacks.ts` (art direction), `designImplementationRegistry.ts` (derived facade). No new parallel registry is introduced.
- `SHIPPED_INDUSTRIES` becomes derived from `INDUSTRY_MATRIX` keys; `INDUSTRY_RECIPE_KEY` shrinks as recipes gain first-class entries.
- Parity gains distinctness assertions so two industries can never compile to the same experience.
- The current `resolveActiveTemplate()` fallback ladder and `applyRouteHeroContract()` geometry rewrite are retired from Wizard authorship after their registered replacements are wired; they are not replaced with another free-standing resolver.
- “AI freely composes” means freedom inside the registered eligibility envelope, not arbitrary CSS/TSX generation. Semantic tokens still own spacing/materials, while the AI controls high-level composition and supported responsive layout props.
- 3D/motion recipes register through the existing variant registry and snapshot-owned experience foundation; no alternate scene authoring pipeline.
