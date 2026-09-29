# Cross-Industry Page Composition Intelligence — Slice 1

Goal: every page in every generated site gets its own business and narrative job. The Theme Family, Art Direction, Brand and AI-authored page pipeline stay the same. One planner serves every industry. There are no per-industry engines and no rigid templates.

## Step A — Audit (a short written report in `docs/milestones/`)
Map what already exists and reuse it:
- Industry definitions: `sections/templates/industryCreativeVocabulary`, `references/industryContext`, `uiIntentProfiles/*`
- Page Archetypes and allowed families per role: `sections/pageArchetypeContract.ts`, `resolve-page-vocabulary.ts`
- Variant choice and visual signatures: `variants/registry`, `contracts/visual-signature.ts`, `resolve-legal-implementations.ts`
- Site-level coherence: `services/launch/siteDesignContract.ts`, `compositionAffinity.ts`, `compositionCanonicalContract.ts`
- AI page authoring: `siteAuthoringOrchestrator` → `aiRepairLoop` → `persistAiCommit`, plus the brief built in `aiPageComposition.ts`
- Current checks for repeated layouts (expected to be minimal)

## Step B — Gap report
For each of the 11 industries (salon, restaurant, saas, contractor, local-service, real-estate, ecommerce, portfolio, coaching, agency, nonprofit), list each page's job, the current component coverage, where pages risk repeating each other, and the domain vocabulary that's missing.

## Step C — Contract mapping (extend existing types, don't duplicate them)
| New concept | Built on |
|---|---|
| IndustryPageCompositionProfile | Page Archetype contract + industry creative vocabulary |
| CompositionSignature | existing `visualSignature` (geometry, media, type scale, density) + a hero/section-order fingerprint |
| SiteCompositionPlan | a new section of `SiteDesignContract` (it stays the single site-level authority) |
| SiteVisualMemory | built from signatures of pages already authored during the launch |
| PageAuthoringBrief | the existing per-page AI Composer brief, enriched |

## Step D — Where it fits in the pipeline
Wizard → CreativeIntent → Theme Family / sealed pack → Industry + page roles → **profiles → SiteCompositionPlanner → visual memory → PageAuthoringBrief** → existing AI author stage → existing gates + **new redundancy check** (repair through the existing repair loop) → canonical commit → SiteBundleSnapshot → Preview/Builder/Publish. The design seed decides between equally valid options, so results stay deterministic. No new endpoint, and no replacement for topology or the snapshot.

## Step E — First implementation (Salon, then Restaurant as proof)
New modules under `src/services/composition/`:
- `industryCompositionRegistry.ts` — Salon profiles (Home, Services, Gallery, About, Booking, Contact) and Restaurant profiles, stored as data only
- `siteCompositionPlanner.ts` — one generic planner that spreads hero type, layout geometry and density across pages, seeded by the design seed
- `siteVisualMemory.ts`, `compositionSimilarity.ts`, `redundancyValidator.ts`
- `pageAuthoringBrief.ts` — feeds the plan and memory into the existing composer lane

Wiring: the orchestrator's `author` stage builds the plan once and gives each page its brief. After Home is authored, its signature goes into memory. When a page repeats another page's layout, it goes through one targeted repair.

Tests: Salon plan gives 6 distinct signatures. The Restaurant plan comes from the same planner with no code changes. The same seed gives the same plan. Swapping the Art Direction pack changes only the visual expression, not the page jobs.

Later phases (not in this slice): roll out to the other 9 industries, fill coverage gaps in the component registry, and add the Control Room view.

## Technical notes
- Record the planner/registry location rule in `AGENTS.md`.
- The redundancy check runs inside the existing gate step; it doesn't add a second acceptance point.
