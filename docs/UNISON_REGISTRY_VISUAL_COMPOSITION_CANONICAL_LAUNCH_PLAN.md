# UNISON — Registry Reunification, Visual Composition & Canonical Launch Expansion Plan

**Status:** Implementation plan / VS Code AI coding prompt  
**Target branch reviewed:** `unison-tasks-official-feat-richer-industry-compositions`  
**Primary objective:** Make the current Launch Wizard the single integration point for Unison's design registries, artifacts, catalog surfaces, primitives, business data, and Lane B creative enrichment—without reintroducing parallel generation authority.

---

## 0. Executive Directive

Unison must stop treating "high-quality generation" as a prompting problem.

The current codebase already contains much of the architecture needed for high-end generated sites:

- canonical Launch Wizard orchestration
- deterministic Stage 4b compilation
- `SiteBundleSnapshot`
- section registry
- variant registry
- Art Direction Packs
- design vocabulary
- Design Implementation Registry
- Artifact Registry
- Catalog Surface Registry
- generated UI foundation
- curated motion primitives
- experience capability resolver
- Lane B candidate VFS enrichment
- canonical VFS merge
- `commitMutation()` as final write authority
- Preview / Playground / publish handoff

The next milestone is to make those systems **fully executable, mutually discoverable, and traceable from Launch Wizard selection to rendered VFS**.

The architectural rule is:

> **The Launch Wizard owns generation orchestration. Registries own available capabilities. Stage 4b owns deterministic baseline and theme contracts. Lane B may author candidate page-body VFS enrichments. Canonical validation and commit are the only processes allowed to promote those candidates into canonical VFS.**

Do not introduce a new template engine, new AI page authority, new motion framework, or second registry hierarchy.

---

# 1. Current Architecture Assessment

The reviewed branch is already significantly more mature than the earlier System Launcher architecture.

## 1.1 Existing canonical chain

The intended path is already visible in the current implementation:

```text
Launch Wizard selections
        ↓
generation seed
        ↓
registered template composition
        ↓
template design contract
        ↓
Wizard Registry Aggregation
        ↓
Stage 4b canonical compile
        ↓
SiteBundleSnapshot
        ↓
Lane B candidate enrichment
        ↓
Lane B validation
        ↓
canonical merge
        ↓
strict preflight
        ↓
buildCanonicalLaunchArtifactsAsync()
        ↓
commitMutation()
        ↓
canonical VFS revision
        ↓
Preview / Playground / Publish
```

Preserve this path.

## 1.2 Verified current owners

The following current files should remain authoritative:

```text
src/services/launch/launchOrchestrator.ts
src/services/launch/wizardRegistryAggregation.ts

src/platform/core/artifactRegistry.ts
src/platform/core/catalogSurfaceRegistry.ts
src/platform/core/designVocabulary.ts
src/platform/core/generatedUiFoundation.ts

src/sections/registry.ts
src/sections/variants/*
src/sections/variants/artDirectionPacks.ts
src/sections/templates/*

src/services/designImplementationRegistry.ts
src/services/wizardLaneBEnrichment.ts
src/services/wizardInteractionEnrichment.ts
src/services/laneBBatchPlanner.ts

src/services/canonicalLaunchVfs.ts
src/services/vfsCommitService.ts
```

Do not duplicate responsibilities from these modules elsewhere.

---

# 2. What Must Be Fixed Before More AI Expansion

High-quality output is currently constrained by **execution gaps and registry drift**, not simply by model capability.

The required work is divided into six programs:

1. Registry reunification
2. Executable visual primitive expansion
3. Artifact + catalog surface expansion
4. Launch Wizard full wiring
5. Orphan-system migration
6. Lane B creative enrichment hardening

These programs must happen in that order.

---

# 3. Program A — Registry Reunification

## Goal

Every active design capability must be discoverable through one aggregated Launch Wizard context.

A capability is considered "wired" only if it can be traced through:

```text
definition
→ registry
→ Wizard registry context
→ Wizard seed / snapshot
→ canonical compiler or Lane B
→ VFS
→ Preview
→ Playground
```

Anything that stops before VFS is incomplete.

---

## 3.1 Remove manually maintained registry copies

### Current issue

`wizardRegistryAggregation.ts` currently contains a hard-coded list:

```ts
const UI_FOUNDATION_MOTION_PRIMITIVES = [
  'Reveal',
  'RevealGroup',
  'Stagger',
  'StaggerGroup',
  'StaggerItem',
  'MarqueeBand',
  'HorizontalRail',
  'HoverDepth',
  'ImageReveal',
  'ParallaxMedia',
  'MaskReveal',
  'MotionImage',
];
```

This creates drift because the registry aggregator becomes another registry.

### Required change

Export actual inventories from `generatedUiFoundation.ts`.

Example:

```ts
export const GENERATED_MOTION_PRIMITIVES = [
  'Reveal',
  'RevealGroup',
  'Stagger',
  'StaggerGroup',
  'StaggerItem',
  'MarqueeBand',
  'HorizontalRail',
  'HoverDepth',
  'ImageReveal',
  'ParallaxMedia',
  'MaskReveal',
  'MotionImage',
] as const;

export const GENERATED_BACKGROUND_PRIMITIVES = [
  'OrbitalBackdrop',
  'GlowField',
  'AnimatedGrid',
  'NoiseField',
  'GradientOrbs',
  'MediaCanvas',
] as const;

export const GENERATED_NAVIGATION_PRIMITIVES = [
  'FloatingNavbar',
  'StandardNavbar',
  // actual exported primitives only
] as const;
```

Then aggregate from those exported constants.

### Rule

> Registry aggregation derives from canonical owners. It never declares capabilities itself.

---

## 3.2 Expand `DesignImplementation`

Current `DesignImplementation` supports one `vocabulary` reference.

A visually sophisticated implementation can execute several vocabulary concepts simultaneously.

### Add additive multi-reference support

```ts
export interface SectionVariant {
  // existing fields remain
  vocabulary?: VocabularyRef;

  /** Complete executable visual language implemented by this variant. */
  vocabularyRefs?: readonly VocabularyRef[];
}
```

Update:

```text
src/services/designImplementationRegistry.ts
```

to index both:

```ts
variant.vocabulary
variant.vocabularyRefs
```

### Example

```ts
{
  id: 'hero:kinetic-tech',

  vocabularyRefs: [
    { category: 'hero', id: 'kinetic-type' },
    { category: 'background', id: 'animated-grid' },
    { category: 'background', id: 'glow-field' },
    { category: 'motion', id: 'mask-reveal' },
  ]
}
```

Do not remove `vocabulary` immediately. Keep it as backward-compatible shorthand.

---

## 3.3 Fix Lane B vocabulary reporting

### Current issue

`launchOrchestrator.ts` attempts to derive vocabulary from:

```ts
siteBundleSnapshot.meta.designIntervention?.activeVariants
```

but active variant values are implementation / variant identifiers, not objects carrying a `.vocabulary` property.

### Required fix

Use the existing canonical registry function:

```ts
import {
  vocabularyExecutabilityReport,
} from '@/services/designImplementationRegistry';

const report = vocabularyExecutabilityReport();

const designVocabularyReport = {
  executableIds: report.executable,
  unimplementedIds: report.unimplemented,
};
```

### Result

Lane B receives the real distinction between:

- vocabulary Unison can execute now
- vocabulary that remains conceptual only

Lane B must never be prompted to rely on unimplemented vocabulary.

---

# 4. Program B — Expand the Generated UI Foundation

The next quality jump should come from reusable canonical primitives, not page-specific animation hacks.

No additional animation framework is required at this milestone.

Keep:

```text
React
Tailwind
Framer Motion
Radix
Lucide
Embla
CVA / clsx / tailwind-merge
Sandpack
```

Keep optional immersive rendering behind existing Experience capability facades.

Do not add GSAP / Anime.js / Lottie / Lenis as baseline dependencies.

---

# 5. Background Composition Primitive Family

The design vocabulary already contains concepts such as:

```text
animated-grid
glow-field
noise-field
gradient-orbs
particle-field
mesh-gradient
media-canvas
3d-scene
```

Several of these need first-class executable DOM-level implementations.

## 5.1 Add canonical background facade

Recommended generated path:

```text
/src/unison/ui/background.tsx
```

Expose a curated API:

```ts
OrbitalBackdrop
GlowField
AnimatedGrid
NoiseField
GradientOrbs
MediaCanvas
```

### `OrbitalBackdrop`

Purpose:

- technical concentric orbital rings
- subtle animated SVG paths
- abstract line work
- reference-image style hero depth
- no business meaning
- reduced-motion aware

Suggested public API:

```tsx
<OrbitalBackdrop
  density="sparse|balanced|dense"
  motion="off|slow|normal"
  focalPoint="center|top|left|right"
/>
```

### `GlowField`

```tsx
<GlowField
  intensity="subtle|medium|strong"
  placement="center|top|left|right|distributed"
/>
```

### `AnimatedGrid`

```tsx
<AnimatedGrid
  density="wide|normal|tight"
  drift="off|slow"
/>
```

### Architecture rules

These primitives:

- use semantic theme variables
- may use the generated animation facade
- must respect `prefers-reduced-motion`
- must not emit arbitrary hard-coded palettes
- must not carry semantic content
- must not alter layout ownership
- must be snapshot-owned

---

# 6. Typography Expansion

The current design system needs a stronger display ceiling.

Add a semantic hero type size.

## 6.1 Heading API

Extend:

```ts
type HeadingSize =
  | 'hero'
  | 'display'
  | 'title'
  | 'subtitle';
```

Example:

```tsx
<Heading level={1} size="hero">
  <span>HEAR BETTER,</span>
  <span>CREATE BETTER,</span>
  <span className="text-primary">PLAY BETTER!</span>
</Heading>
```

The primitive should render one semantic `<h1>` even when visual lines are separate.

## 6.2 Stage 4b token

Add:

```css
--ut-type-hero
```

derived through the existing Art Direction / theme token pipeline.

Do not hard-code giant font classes into variants.

The typography scale remains Stage 4b-owned.

---

# 7. High-End Hero Family

Create a first-party portable hero family capable of rendering pages similar in sophistication to modern Figma/Framer marketing sites.

## 7.1 `hero:kinetic-tech`

Recommended source:

```text
src/sections/variants/hero/HeroKineticTech.tsx
```

Recommended registry identity:

```ts
{
  id: 'hero:kinetic-tech',
  sectionType: 'hero',
  slug: 'kinetic-tech',
  name: 'Kinetic Tech',
  description:
    'Monumental display type over animated technical ambience with restrained conversion actions.',
  vfs: {
    mode: 'portable-recipe',
  },
  vocabularyRefs: [
    { category: 'hero', id: 'kinetic-type' },
    { category: 'background', id: 'animated-grid' },
    { category: 'background', id: 'glow-field' },
  ],
  tags: [
    'tech',
    'immersive',
    'display',
    'motion',
    'premium',
  ],
}
```

### Compose with canonical primitives

```text
Section
Container
Stack
Heading
Lead
Badge / BrandLockup
Button
OrbitalBackdrop
GlowField
Reveal
MaskReveal
StaggerGroup
StaggerItem
```

Do not embed private hero-local implementations of these systems.

---

# 8. Brand Lockup / Partner Primitive

Introduce an authored artifact for partnership / trust lockups.

Example:

```tsx
<BrandLockup
  items={[
    { name: 'MSI', logo: ... },
    { name: 'SteelSeries', logo: ... },
  ]}
/>
```

Initial data source may remain authored.

Do not create a catalog table merely to support a visual badge.

If reusable partner / client management later becomes a Business Center feature, promote it to a real catalog surface backed by canonical storage.

---

# 9. Navigation Expansion

Create:

```text
navbar:floating-tech
```

Use the existing floating navigation primitive rather than duplicating its behavior.

Expected behavior:

- detached navigation frame
- backdrop blur / surface tokens
- desktop horizontal links
- high-contrast CTA
- collapse behavior through existing responsive rules
- tokenized radius and spacing
- optional transparent-to-solid transition if supported canonically

Add the implementation to relevant Art Direction Packs.

Recommended preference order for tech-forward packs:

```ts
navbarFamily: [
  'navbar:floating-tech',
  'navbar:minimal-dark',
  'navbar:standard',
]
```

---

# 10. Expand Art Direction Packs, Not the Architecture

Do not create a second style engine.

Improve existing packs such as:

```text
glass-tech
neon-grid
editorial
bold
futuristic
organic
```

so they choose richer implementation families.

Example:

```ts
'neon-grid': {
  navbarFamily: [
    'navbar:floating-tech',
    'navbar:minimal-dark',
  ],

  sectionFamilies: {
    hero: [
      'hero:kinetic-tech',
      'hero:full-bleed',
      'hero:split-cinematic',
    ],

    services: [
      'services:asymmetric-bento',
      'services:horizontal-rail',
      'services:editorial-list',
    ],

    gallery: [
      'gallery:filmstrip',
      'gallery:masonry',
      'gallery:stacked',
    ],

    testimonials: [
      'testimonials:marquee',
      'testimonials:spotlight',
      'testimonials:grid',
    ],
  },
}
```

Every identifier in an Art Direction Pack must resolve through the Design Implementation Registry.

Add a test:

```text
all ArtDirectionPack implementation IDs must resolve
```

No silent unknown variant fallback.

---

# 11. Visual Implementation Families to Add

Prioritize reusable families rather than dozens of nearly identical templates.

## Hero

```text
hero:kinetic-tech
hero:oversized-editorial
hero:editorial-collage
hero:split-cinematic
hero:layered-product
hero:marquee-media
hero:asymmetric-story
```

## Services / features

```text
services:asymmetric-bento
services:horizontal-rail
services:editorial-list
services:sticky-feature
```

## Gallery / portfolio

```text
gallery:masonry
gallery:lookbook
gallery:filmstrip
gallery:stacked
gallery:parallax
```

## Social proof

```text
testimonials:marquee
testimonials:spotlight
testimonials:editorial-quotes
logos:grid
logos:marquee
logos:brand-lockup
stats:kinetic-band
```

## Conversion

```text
cta:oversized-statement
cta:marquee-band
cta:split-media
cta:floating-panel
```

Each must:

- have a stable implementation ID
- declare vocabulary references
- declare allowed imports
- use Stage 4b tokens
- expose canonical slots
- preserve data and intent bindings
- support portable VFS generation

---

# 12. Make Placeholder Section Families Real

The current registry should not advertise a first-class capability while rendering another section under the hood.

Promote:

```text
logo-cloud
blog-preview
before-after
```

to real first-party section implementations.

Required first variants:

```text
logo-cloud:grid
logo-cloud:marquee
logo-cloud:brand-lockup

blog-preview:editorial
blog-preview:featured-grid
blog-preview:horizontal-rail

before-after:slider
before-after:grid
before-after:case-study
```

Do not mark them first-class until they have:

- real renderer
- VFS recipe
- artifact definition where appropriate
- tests
- canonical slots
- Preview compatibility

---

# 13. Program C — Artifact Registry Expansion

The Artifact Registry should become the semantic bridge between:

```text
section
data source
capabilities
slots
intents
toolbar
AI edit permission
```

Do not turn it into a design registry.

## 13.1 Add artifact metadata needed by the builder

Consider extending `ArtifactDef` additively with:

```ts
visualRoles?: readonly string[];
allowedImplementationIds?: readonly string[];
mediaSlots?: readonly {
  slotId: string;
  role: string;
  acceptedKinds: readonly string[];
}[];
```

Only add fields that have real downstream consumers.

## 13.2 Important separation

Keep these concepts separate:

```text
Catalog Surface Registry
    = persisted business row surfaces

Artifact Registry
    = semantic website artifact contract

Design Vocabulary
    = visual language

Design Implementation Registry
    = executable variants

Generated UI Foundation
    = primitive runtime

Asset Registry
    = media identity / metadata
```

Do not collapse these into one giant registry.

They should be aggregated, not merged.

---

# 14. Catalog Surface Expansion

The current catalog registry is already strongly typed around physical storage and hydration.

Preserve the rule:

> No catalog surface without a real canonical data source.

Existing surfaces cover important business rows such as:

```text
services
products
menu
pricing
offers
testimonials
portfolio
availability
```

Potential future additions should only be implemented when storage, editor, hydration, readiness and binding support all exist.

High-value candidates:

```text
team
faqs
partners / clients
articles / posts
brand media
business metrics
locations
events
```

For each new surface, require:

1. source table
2. field contract
3. Business Center editor
4. aliases
5. display mapping
6. intent support
7. readiness threshold
8. fallback mode
9. hydration support
10. auto-emitted site data binding

Do not create fake catalog mappings for decorative visual primitives.

---

# 15. Asset Registry → Launch Wizard Wiring

The Launcher needs canonical awareness of available media.

Add an asset summary to the Wizard registry context.

Suggested shape:

```ts
interface WizardRegistryAssetSummary {
  assetId: string;
  kind: string;
  tags: readonly string[];
  width?: number;
  height?: number;
  aspectRatio?: string;
  dominantColor?: string;
}
```

Lane B should prefer registered business assets over invented remote URLs.

The AI should receive identity and metadata—not unrestricted storage mutation authority.

The generated page should refer to media through the approved asset/runtime facade.

---

# 16. Expand `WizardAggregatedRegistryContext`

Current context already carries:

```text
sections
artifacts
catalogSurfaces
motionPrimitives
designRegistrySignature
artDirectionPackId
motionProfile
interactionProfile
```

Extend it so it reflects the full executable universe.

Recommended version bump:

```ts
WIZARD_REGISTRY_CONTEXT_VERSION = '2.0'
```

Suggested shape:

```ts
interface WizardAggregatedRegistryContext {
  version: '2.0';

  generatedAt: string;

  industry: string;
  templateId: string;
  themePresetId: string;
  artDirectionPackId?: string;

  designRegistrySignature: string;

  sections: WizardRegistrySectionSummary[];

  implementations: Array<{
    implementationId: string;
    sectionType: string;
    name: string;
    tags: readonly string[];
    vocabularyRefs: readonly string[];
    vfsMode?: string;
    radixPrimitives?: readonly string[];
  }>;

  artifacts: WizardRegistryArtifactSummary[];

  catalogSurfaces: WizardRegistryCatalogSurfaceSummary[];

  designVocabulary: {
    executable: string[];
    unimplemented: string[];
  };

  primitives: {
    composition: readonly string[];
    motion: readonly string[];
    background: readonly string[];
    navigation: readonly string[];
    experience: readonly string[];
  };

  assets: WizardRegistryAssetSummary[];

  approvedCapabilities: readonly string[];

  motionProfile?: string;
  interactionProfile?: string;
}
```

Keep payload size under control by filtering to:

- selected industry
- selected Art Direction Pack
- selected template
- relevant capabilities

Do not indiscriminately send the entire global registry to Lane B.

---

# 17. Pass Registry Context Directly Into Lane B

The Wizard Seed already carries `registryContext`.

The Lane B enrichment request should also carry the relevant bounded version explicitly.

Update:

```text
src/services/wizardLaneBEnrichment.ts
```

Add:

```ts
registryContext: WizardAggregatedRegistryContext;
```

or a bounded AI-safe projection:

```ts
registryContext: WizardLaneBRegistryContext;
```

Prefer the bounded form if the full structure becomes too large.

Lane B should not reconstruct registry facts from prose.

---

# 18. Lane B Must Use Real Executable Vocabulary

The AI instruction should be structurally explicit:

```text
You may compose freely inside registered page bodies.

You may:
- change DOM geometry
- compose approved UI foundation primitives
- choose executable design implementations
- use approved motion primitives
- vary responsive grid structure
- layer media
- create asymmetry
- create sticky storytelling
- use horizontal rails
- use marquees
- create hover depth
- use approved background primitives

You may not:
- change canonical routes
- change App.tsx
- change index.css
- write /.unison infrastructure
- redefine theme tokens
- invent package dependencies
- use unimplemented vocabulary
- remove required intents
- break canonical data bindings
```

Lane B candidate code becomes canonical only after:

```text
decode
→ schema validation
→ identity validation
→ protected path gate
→ import gate
→ TSX parse
→ theme gate
→ intent gate
→ binding gate
→ accessibility basics
→ canonical merge
→ final preflight
→ commitMutation()
```

---

# 19. Program D — Interaction Enrichment

Do not build another autonomous interaction engine.

Expand the existing:

```text
src/services/wizardInteractionEnrichment.ts
```

so it resolves interaction recipes against:

- Art Direction Pack
- section implementation
- motion budget
- interaction profile
- reduced-motion policy
- canonical primitive inventory

Recommended interaction vocabulary:

```text
hover-lift
hover-depth
hover-image-zoom
hover-border-reveal
hover-overlay-reveal
hover-media-shift
mask-reveal
stagger-reveal
parallax-subtle
sticky-step
continuous-marquee
horizontal-rail
```

The interaction enrichment object should resolve to implementation IDs / primitive recipes, not raw arbitrary script strings.

---

# 20. Program E — Orphan-System Migration

Before further expansion, perform a complete source census.

Search for:

```text
SystemLauncher
old launcher
legacy launcher
wizard_seed_generation
runBuilderTurn
interactionManifest
old composition maps
manual template category maps
old AI fast path
legacy design element registries
duplicate motion lists
direct generated page writes
old Stage 4b wrappers
old section registries
deprecated artifact maps
```

Classify every hit:

```text
KEEP
MIGRATE
DELETE
COMPATIBILITY-ONLY
```

A system is considered orphaned if:

- it is only consumed by removed System Launcher code
- it declares a registry no current Wizard consumer reads
- it writes page VFS outside canonical merge / commit
- it bypasses SiteBundleSnapshot
- it owns duplicated template/industry mapping
- it owns duplicated design vocabulary
- it injects motion without Design Intervention
- it resolves business data outside canonical binding contracts

After migration, old modules should not remain as hidden fallbacks.

---

# 21. Program F — Visual Quality Gate

Syntax correctness is not sufficient.

Add a visual composition quality report that operates on deterministic metadata and generated structure.

Do not attempt subjective screenshot scoring as the first implementation.

Measure structural signals.

Example:

```ts
interface VisualCompositionQualityReport {
  pageId: string;

  sectionCount: number;
  implementationDiversity: number;
  geometryDiversity: number;

  hasHeroDisplayScale: boolean;
  hasVisualFocalPoint: boolean;
  hasMediaTreatment: boolean;
  hasInteractionTreatment: boolean;

  repeatedEqualGridPenalty: number;
  repeatedCenteredStackPenalty: number;
  excessiveCardPenalty: number;

  motionBudgetUsed: number;
  motionBudgetExceeded: boolean;

  warnings: string[];
}
```

Use the report as a warning / deterministic enrichment signal first.

Avoid turning taste into one hard blocking numeric score.

---

# 22. Visual Editing Is the Next Strategic Product Layer

After registry reunification and high-quality generation stabilize, the biggest gap is no longer generation.

It becomes **direct visual manipulation**.

The next major product program should introduce:

```text
Preview selection
→ canonical artifact / section identity
→ property inspector
→ layout controls
→ style controls
→ variant switcher
→ data binding inspector
→ intent inspector
→ AI contextual edit
→ canonical mutation
```

This should operate on the same artifact IDs and implementation IDs the Wizard uses.

Do not build a separate canvas data model.

The Builder must edit the same canonical state the Launcher created.

---

# 23. Recommended WYSIWYG Contract

Every generated section should expose stable identity:

```tsx
<section
  data-ut-section-id="..."
  data-ut-artifact="hero"
  data-ut-implementation="hero:kinetic-tech"
>
```

Editable child slots:

```tsx
data-ut-slot="hero.headline"
data-ut-slot="hero.subhead"
data-ut-slot="hero.primary-cta"
data-ut-slot="hero.image"
```

Then Preview click selection can resolve:

```text
DOM target
→ artifact identity
→ implementation registry
→ snapshot section
→ property inspector
```

This becomes the foundation of a Figma/Framer-like builder experience.

---

# 24. Design Property Inspector

After click selection is reliable, implement a bounded property inspector.

For a section:

```text
Variant
Layout
Spacing
Surface
Media treatment
Motion recipe
Interaction recipe
Visibility
Data source
Intent binding
```

For text:

```text
Content
Semantic level
Typography role
Alignment
Max width
Emphasis
```

For media:

```text
Asset
Crop
Aspect ratio
Fit
Position
Treatment
Motion
Alt text
```

These controls should write canonical mutation plans—not arbitrary DOM style patches.

---

# 25. AI + Canvas Round Trip

The target experience is:

```text
User selects section
        ↓
"Make this feel more cinematic"
        ↓
AI receives:
  selected artifact
  current implementation
  legal sibling implementations
  theme tokens
  registry context
  screenshot / preview context if available
        ↓
AI proposes canonical patch
        ↓
preview
        ↓
accept
        ↓
commitMutation()
```

This is much more valuable than giving AI unrestricted global source access for every visual edit.

---

# 26. What to Keep From the Current Framework

Do not rewrite these foundations merely to imitate competitors.

Keep:

### Canonical snapshot model

`SiteBundleSnapshot` is a strategic advantage.

It gives Unison a stable interchange model between:

```text
Wizard
AI
Preview
Playground
publish
reopen
```

### Business runtime contracts

Unison's industry/capability/binding model can become a differentiator versus purely visual site builders.

### Intent vocabulary

Keep canonical intents as semantic behavioral contracts.

### Artifact Registry

Continue using the artifact abstraction to bridge:

```text
visual component
business data
editing
AI scope
intent behavior
```

### Candidate VFS + canonical commit

Keep this architecture.

Lane B should be creative, but canonical commit should remain final authority.

### Stage 4b theme ownership

AI decides design composition.

Stage 4b remains the final semantic styling contract.

### Design Intervention

Extend it rather than inventing a new art-direction layer.

### Art Direction Packs

Expand implementation families and visual range rather than replacing them.

---

# 27. What I Would Revise

## 27.1 Move from "template first" to "design graph within template constraints"

Templates should define:

```text
page purposes
required sections
conversion hierarchy
industry expectations
```

They should not rigidly define all geometry.

The final page should derive from:

```text
template semantic contract
+
art direction pack
+
design intervention
+
available artifact/data surfaces
+
generation seed
+
Lane B creative enrichment
```

This increases uniqueness without losing reliability.

---

## 27.2 Treat section implementations as a graph, not a flat list

Longer-term, represent implementation compatibility.

Example:

```text
hero:kinetic-tech
  works well with:
    services:horizontal-rail
    logos:marquee
    gallery:filmstrip

  avoid immediately following:
    cta:marquee-band
```

This gives the deterministic composer and AI better rhythm decisions.

Possible future object:

```ts
interface DesignCompatibility {
  implementationId: string;
  prefersBefore?: string[];
  prefersAfter?: string[];
  avoidAdjacent?: string[];
  compatiblePacks?: string[];
}
```

Do this only after the core registry wiring is stable.

---

## 27.3 Add page-level composition identity

A page should have an explicit composition strategy:

```text
editorial
cinematic
kinetic
product-led
conversion-dense
story-led
portfolio-led
```

This is broader than a section variant and helps prevent every section from independently competing for attention.

Store it in Design Intervention / snapshot metadata.

---

## 27.4 Add deterministic visual hierarchy budgets

A high-end page generally needs one dominant focal moment.

Add rules like:

```text
maximum 1 dominant hero
maximum 2 continuous animations in viewport
maximum 1 marquee per viewport region
maximum 1 heavy immersive experience above fold
limit simultaneous glow / glass / blur treatments
```

The goal is restraint, not maximal animation.

---

## 27.5 Introduce cross-page design memory

Generated About, Pricing, Projects and Contact pages should inherit a site-level visual grammar without cloning Home.

Persist:

```text
headline treatment
surface strategy
image treatment
grid language
navigation treatment
motion intensity
corner/radius language
section rhythm
```

Then each page expresses the grammar differently.

---

# 28. Recommended Implementation Order

## Milestone 1 — Registry integrity

Do first.

- derive primitive inventories from canonical modules
- implement `vocabularyRefs`
- fix `vocabularyExecutabilityReport` wiring
- remove contradictory prompt declarations
- add registry integrity tests
- inventory legacy/orphan systems

**Exit condition:** no duplicated registry declarations remain in Launcher path.

---

## Milestone 2 — Background + hero primitives

Implement:

```text
OrbitalBackdrop
GlowField
AnimatedGrid
NoiseField
GradientOrbs
BrandLockup
Heading hero scale
navbar:floating-tech
hero:kinetic-tech
```

**Exit condition:** deterministic Stage 4b generation can create a premium reference-quality hero without Lane B.

---

## Milestone 3 — Rich section families

Add:

```text
asymmetric bento
horizontal rail
filmstrip
lookbook
marquee proof
kinetic stats
split CTA
oversized CTA
```

**Exit condition:** at least 3 materially different composition paths per major industry page archetype.

---

## Milestone 4 — Artifact / catalog / asset wiring

- expand Artifact Registry metadata
- add real first-class placeholder sections
- wire Asset Registry to Wizard context
- add only real catalog surfaces with persistence support
- verify auto-binding across generated artifacts

**Exit condition:** Wizard, AI, Preview and Builder all reference identical artifact identity.

---

## Milestone 5 — Wizard Registry Context v2

- implementations
- executable vocabulary
- primitive families
- assets
- approved capabilities
- industry filtering
- context-size controls

Pass it directly to Lane B.

**Exit condition:** Lane B no longer reconstructs design capability from prose.

---

## Milestone 6 — Lane B creative enrichment

- enrich canonical page bodies
- preserve protected infrastructure
- use real executable registry vocabulary
- batch pages
- preserve deterministic fallback
- enforce visual + import + theme + binding gates

**Exit condition:** failed Lane B enrichment can never break a launch.

---

## Milestone 7 — WYSIWYG selection + property inspector

- DOM identity
- section selection
- slot selection
- variant switching
- layout controls
- data / intent inspector
- contextual AI edits

**Exit condition:** user can visually edit what Wizard generated without losing canonical identity.

---

## Milestone 8 — Experience primitives / 3D

Only now broaden:

```text
SceneBackground
ParticleField
FloatingMedia
ImmersiveHero
ProductStage
ModelViewer
DepthGallery
```

Do not allow 3D expansion to block the ordinary high-quality DOM/CSS/motion layer.

---

# 29. Testing Requirements

## Registry tests

Add / extend tests for:

```text
wizardRegistryAggregation.test.ts
designImplementationRegistry.test.ts
designVocabularyExecutability.test.ts
artifactRegistry.test.ts
generatedUiFoundation.test.ts
artDirectionPacks.test.ts
```

Assertions:

- no unknown implementation IDs
- no duplicate implementation IDs
- every executable vocabulary entry resolves to an implementation
- every Art Direction Pack reference resolves
- every generated primitive advertised to AI is actually exported
- Wizard registry context contains only real registry entries
- registry signature changes when implementation inventory changes

## Lane B tests

Extend:

```text
wizardLaneBEnrichment tests
launchOrchestratorCanonicalHandoff.test.ts
laneBBatchPlanner.test.ts
canonicalLaunchVfs.test.ts
vfsCommitService.golden.test.ts
```

Assertions:

- AI cannot modify protected files
- candidate page replacement can become canonical only through validation
- theme tokens survive AI replacement
- intents survive replacement
- bindings survive replacement
- router remains deterministic
- missing/failed enrichment preserves deterministic page
- snapshot metadata remains synchronized
- committed revision rehydrates identically

## Visual primitive tests

- reduced motion
- semantic heading
- no hard-coded color leakage
- responsive overflow
- marquee pause
- keyboard compatibility
- no unsupported imports

---

# 30. Definition of "Wired"

A new feature is not complete because a component exists.

Use this checklist:

```text
[ ] Registry definition exists
[ ] Implementation ID exists
[ ] Design vocabulary reference exists where applicable
[ ] Art Direction Pack may resolve it
[ ] Wizard Registry Aggregation includes it
[ ] Wizard seed / snapshot preserves it
[ ] Stage 4b or Lane B can select it
[ ] VFS recipe can materialize it
[ ] Preview renders it
[ ] Playground recognizes it
[ ] artifact / slot identity survives
[ ] business data binding survives
[ ] intent binding survives
[ ] canonical commit persists it
[ ] reopen / reload preserves it
[ ] tests prove the chain
```

If any box is missing, the capability is still partially orphaned.

---

# 31. Product Direction

Unison should not try to become a clone of Figma, Framer or Replit.

Its strongest opportunity is a different intersection:

```text
AI site composition
+
visual builder
+
industry-aware business OS
+
canonical live business data
+
behavior/intents
+
backend capability provisioning
+
portable React output
```

The visual editor should become comparable in fluidity to modern design-first tools, while the runtime model remains more business-semantic than a generic design canvas.

The architectural moat should be:

> **The same artifact that a creator visually designs is the artifact that understands its business data, conversion behavior, backend capability and publish-readiness contract.**

---

# 32. VS Code AI Execution Prompt

Use the following instruction at the beginning of implementation:

> Implement this plan incrementally against the current Unison repository. Do not create a parallel Launcher, registry, template engine, theme engine, VFS writer, artifact model, motion runtime, or AI generation path. Reuse the canonical owners identified in this document.
>
> Begin with **Milestone 1 only**.
>
> First audit the repository and produce a concrete file-by-file migration table for:
>
> 1. duplicated primitive inventories  
> 2. design vocabulary executability wiring  
> 3. `vocabulary` → additive `vocabularyRefs` support  
> 4. stale or contradictory AI foundation directives  
> 5. orphaned System Launcher / legacy generation systems  
> 6. registries not consumed by `buildWizardAggregatedRegistryContext()`  
>
> Do not connect new visual primitives or modify Lane B until registry integrity tests pass.
>
> Preserve:
>
> - Launch Wizard as entry point  
> - Stage 4b canonical compile  
> - SiteBundleSnapshot as canonical handoff  
> - Design Intervention  
> - Art Direction Packs  
> - Design Implementation Registry  
> - Artifact Registry  
> - Catalog Surface Registry  
> - generated UI foundation  
> - Lane B candidate VFS architecture  
> - canonical VFS merge  
> - `commitMutation()` as final VFS authority  
>
> Every change must include tests proving that the capability remains traceable from registry → Wizard → snapshot → VFS → Preview / Playground.
>
> Do not solve quality problems by inserting fallback page HTML or hard-coded JSX into the Launcher.

---

# 33. Final Target

The finished Launch Wizard should be able to take:

```text
Industry
+ business goals
+ template semantic contract
+ page selections
+ visual style
+ business data
+ available assets
```

and reliably produce:

- a multi-page canonical site
- visually sophisticated composition
- meaningful layout variation
- high-end typography
- motioned media
- hover behavior
- marquee / horizontal interactions
- editorial/asymmetric geometry
- live business data bindings
- working business intents
- canonical artifact identity
- editable Preview / Playground state
- publishable runtime
- stable persisted VFS revision

without relying on any removed System Launcher system or hidden parallel path.

That is the next architectural threshold for Unison.
