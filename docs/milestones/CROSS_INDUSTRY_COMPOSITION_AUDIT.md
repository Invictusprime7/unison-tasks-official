# Cross-Industry Page Composition — Audit & Slice 1

## A. Current architecture
- Industries: `sections/templates/industryCreativeVocabulary`, `sections/references/industryContext`, `platform/core/uiIntentProfiles/*` (11 industries).
- Page Archetypes: `sections/pageArchetypeContract.ts` + `resolve-page-vocabulary.ts` (required/preferred/discouraged families per role).
- Variant selection: `variants/registry`, `resolve-legal-implementations.ts`, per-implementation `visualSignature`.
- Site-level planning: `services/launch/siteDesignContract.ts` (sealed pack, affinity invariants, per-role rhythm/density), `compositionAffinity.ts`.
- AI authoring: `siteAuthoringOrchestrator` → `aiRepairLoop` → `persistAiCommit`; Home establishes the visual language.
- Redundancy controls before this slice: none at the topology level — pages could share hero + section order.

## B. Gap report
| Industry | Profiles | Risk |
|---|---|---|
| salon, restaurant | dedicated (Slice 1) | low |
| saas, contractor, local-service, real-estate, ecommerce, portfolio, coaching, agency, nonprofit | generic role jobs | missing domain vocabulary (e.g. SaaS pricing tiers, contractor project proof, listings) |

## C. Contract mapping
- `IndustryPageCompositionProfile` → `services/composition/types.ts`, data in `industryCompositionRegistry.ts` (extends Page Archetype families).
- `CompositionSignature` → structural fingerprint (hero, geometry, density, section order); complements `visualSignature`.
- `SiteCompositionPlan` → `planSiteComposition` (one planner, seeded by the design-contract fingerprint).
- `SiteVisualMemory` → signatures of committed pages during a launch.
- `PageAuthoringBrief` → `renderCompositionBrief`, appended to the existing page brief.

## D. Integration
Plan is built once in `authorSitePages`; each page brief carries its job, target topology and already-used topologies. After an AI candidate passes the existing gates, `findRedundancy` checks it against memory; one targeted recomposition runs when it repeats another page. No new endpoint, no second acceptance point; topology, SiteBundleSnapshot and commit are unchanged.

## E. Next
Dedicated profiles for the remaining 9 industries, coverage-driven registry work, Control Room.
