# Canonical page-composition recovery

## Goal

Make every Wizard-generated route feel intentionally designed: complete page-specific heroes, rich industry-aware section narratives, consistent spacing, useful imagery, correct interaction wiring, and no scaffold-quality pages reaching the Builder.

## Confirmed gaps

1. **The launch path currently bypasses creative page authorship.** `launchOrchestrator` marks AI page authorship as retired and compiles deterministic template slices. The existing Lane B Design Director receives the rich generation brief only in later AI-builder contexts, not during Wizard page construction.
2. **The richest contract is created after composition.** `wizardGenerationBrief` declares page-specific hero archetypes, section order, depth, rhythm, and media framing only after `compilePlayground` has already emitted the pages. The compiler therefore cannot obey that contract.
3. **Topology loses composition intent.** `PageRouteNode` carries route identity but not the industry page specification’s expected sections or a resolved per-page composition contract.
4. **The scaffolder remains a second composition authority.** `topologyVFSScaffolder` filters the selected template through generic role pools and supplements from that template’s available sections. This can neither realize the semantic order in the generation brief nor create missing industry-specific sections.
5. **Template coverage is uneven.** Only part of the template inventory defines explicit `pageCompositions`; most inner pages are synthesized from home-page content. Several page families therefore inherit generic copy, media, and layout.
6. **Hero contracts and executable heroes disagree.** The brief defines five archetypes, while emitted pages primarily resolve to centered, split, full-bleed, page-title, or editorial-banner variants. `HeroPageIntro` still renders a fixed `16/5` cropped image band, directly contradicting the current media-framing rule.
7. **The quality pass does not protect acceptance.** Visual quality is explicitly advisory, the launcher invokes canonical artifact assembly with `strictPreflight: false`, and weak composition can be sealed if it compiles.
8. **Registry breadth exceeds implementation fidelity.** The registry advertises substantial vocabulary, but some semantic families still resolve through generic/placeholder implementations and route-specific hero identity is not guaranteed to survive variant clamping.
9. **Spacing has competing owners.** Stage 4b emits canonical spacing and hero tokens, while emitted shared component modules still contain local responsive CSS and literal spacing rules. This creates inconsistent margins and hero behavior between preview paths.
10. **Legacy fallback-shaped APIs remain.** Canonical launch still exposes `allowCanonicalPageFallback`, compatibility fallback language, and permissive repair/quarantine behavior even though page-authoring fallbacks are architecturally forbidden.

## Recovery plan

### 1. Move the page composition contract before compilation

Extend the existing `SiteConfiguration`, topology, generation brief, and Design Contract V2 flow so each selected route has one signed contract before VFS emission:

- route role, purpose, conversion stage, and required capability;
- exact ordered semantic sections and minimum depth;
- required enrichment and proof/media beats;
- hero archetype, required hero parts, focal direction, and media treatment;
- spacing rhythm, density, surface alternation, and CTA emphasis;
- registered implementation identity for every section.

Thread this contract through `launchOrchestrator → canonicalPipeline → compilePlayground → topologyVFSScaffolder`. Persist the identical resolved contract in `SiteBundleSnapshot.meta` and the existing resolved-composition sidecars. Do not create a new registry or parallel recipe system.

### 2. Restore the intended guidebook ownership line

Re-establish the existing target flow without replacing its authorities:

```text
LauncherWizard
  → Lane A / industry + topology + capabilities
  → Experience Capability Resolver
  → WizardDesignIntervention
  → per-page Creative Composer
  → Stage 4b token/material skin
  → technical + visual acceptance
  → SiteBundleSnapshot
  → VFS / Builder preview
```

- Lane A/topology owns which pages exist and what each page must accomplish.
- The per-page composer owns hierarchy, section sequence, geometry, media, and content realization.
- Stage 4b owns only palette, typography, spacing tokens, surfaces, materials, and motion treatment.
- Snapshot/VFS projection remains downstream-only.

Use the existing AI Design Director for the creative-composer turn. Generate pages with bounded concurrency, preserve sibling-page context, and allow one targeted repair per rejected page. Deterministic template composition remains the explicit structural input to the composer, not a silent substitute for failed authorship.

### 3. Make industry topology genuinely rich

Strengthen the existing `industryMatrix` and `resolvedComposition` authorities for every first-class industry:

- define complete role-specific narrative arcs instead of navbar/hero/footer-heavy section lists;
- require an industry anchor capability on the appropriate action page;
- require at least one proof, one enrichment, and one conversion section per applicable route;
- exclude navigation and footer from body-depth calculations;
- prohibit adjacent sections from the same structural family;
- carry `expectedSections` into topology instead of dropping them in generic role specs.

Use the existing industry parity suite to prove every supported industry has distinct journeys, valid intents, supported sections, and executable implementations.

### 4. Close the executable section and hero inventory

Extend existing section types, registry entries, variant implementations, and emitters only where a contract cannot currently execute:

- implement first-class variants for semantic families currently represented by generic substitutes;
- make the five hero archetypes executable and role-aware;
- preserve route-selected hero identity through recipe resolution and art-direction-pack clamping;
- ensure every hero can render eyebrow, one H1, supporting lead, two canonical actions, and media or proof;
- remove the cropped editorial image-band implementation;
- use intrinsic media framing, focal anchors, and full-bleed scrims from existing Stage 4b tokens;
- require useful alt text and prohibit invented business claims or fake statistics.

Do not add duplicate component registries or another recipes directory.

### 5. Consolidate spacing and geometry ownership

Make existing Stage 4b variables the only spacing/geometry source for generated pages:

- section block spacing, content measure, grid gaps, nav clearance, hero minimum height, media block size, and focal position all resolve through `--ut-*` tokens;
- generated page/component modules consume token classes and stop emitting competing local spacing CSS;
- distinguish outer section rhythm from inner component spacing;
- enforce stable mobile/desktop constraints and prevent content overlap;
- retain hard values only inside the canonical token generator, never in generated page bodies.

### 6. Turn visual quality into a real acceptance gate

Upgrade the existing quality/preflight path rather than adding another evaluator:

- validate each emitted page against its signed composition contract;
- compare exact semantic section order and registered implementation IDs through resolved-composition sidecars, not regex counts alone;
- block incomplete heroes, missing media/proof, repeated hero archetypes, shallow pages, adjacent repeated families, spacing-token violations, cropped hero bands, duplicate chrome, and unresolved role content;
- require route-specific quality floors for composition, hierarchy, diversity, media, and CTA visibility;
- run one focused composer repair that preserves topology, content facts, bindings, and capabilities;
- if repair still fails, stop launch with page-specific diagnostics—never quarantine or substitute a scaffold.

Set the Wizard launch path to strict acceptance. Keep reports persisted in the existing visual-quality and gate-verdict metadata.

### 7. Remove residual co-authority and fallback surfaces

After the contract-driven path is working:

- remove the unused `allowCanonicalPageFallback` launch option and stale fallback comments;
- make `resolveSiteConfiguration` failures fatal instead of silently storing `null`;
- remove generic industry/template fallback selection from Wizard composition resolution;
- preserve worker execution recovery only as an execution mechanism, never as alternative page authorship;
- ensure router, registry, snapshot, resolved composition, and VFS all share the same page IDs, paths, section identities, and revision identity.

### 8. Certify the full launch journey

Add focused tests and one rendered multi-page launch walk:

- contract is created before compilation and consumed by every route;
- every first-class industry produces complete home and inner-page compositions;
- heroes differ by route and satisfy completeness/media rules;
- resolved sidecars exactly match emitted section order and variants;
- Stage 4b cannot alter composition;
- visual failures trigger one repair and then block if unresolved;
- no minimal/template fallback or quarantine page is persisted;
- all routes render in Builder preview at desktop and mobile widths with no duplicate chrome, cropping, overflow, or large empty gaps;
- canonical commit preserves exact Snapshot/VFS equality.

## Implementation order

1. Pre-compile contract threading and strict configuration failure.
2. Industry topology enrichment and parity rules.
3. Contract-aware scaffolder/composer integration.
4. Hero and semantic-section implementation closure.
5. Token-only spacing/media consolidation.
6. Blocking visual acceptance plus one targeted repair.
7. Fallback/co-authority removal.
8. Full Wizard → Builder multi-page certification.

## Constraints

- Preserve the single `LauncherWizard → launchOrchestrator → SiteBundleSnapshot/VFS` path.
- Extend existing files and registries; create no overlapping authorities.
- Do not weaken existing capability, intent, security, runtime, composition-preservation, or commit guards.
- Do not remove deterministic reproducibility: identical selections and seed must resolve the same contract.
- Do not let Stage 4b author or reorder sections.
