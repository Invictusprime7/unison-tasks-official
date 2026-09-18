# UNISON — Guidebook + 21st Canonical Convergence & De-Fragmentation Plan
## Current Wizard AI policy ? user clarification, 2026-09-17

Contextual AI composition is required for new Wizard generation. A missing, invalid or incomplete composition stops before Stage 4b and reports the specific failure. Do not replace it with an AI-disabled launch. The template-free Wizard remains unchanged.

Stage 4b compiles and validates the accepted AI plan using canonical registered implementations. A successful plan does not skip Lane B. Lane B receives that plan as bounded context and may propose registered page-body TSX; only validation, canonical merge, preflight and commitMutation may promote it. Rejected or unavailable refinements preserve the already validated AI-composed pages. Global theme, routes, protected foundation files, intents and commit ownership stay canonical.

This user clarification overrides V3 sections 3/5/24/28 where they propose optional composition or deterministic launch without AI. V3 is retained as a reference plan; its embedded execution prompt is not an independent instruction. Refinement can be disabled through the launch-service policy for diagnostics; composition cannot.

## Implementation checkpoint ? license-review prerequisite

Batch 3 is in progress. Explicit license review is enforced by source certification and rechecked by promotion planning. Intake defaults to unverified and the CLI no longer assumes MIT or reports dependency-only approval as promotion readiness. Existing promotion records still require evidence reconciliation; the atomic promotion transaction and closure audit are not yet implemented. Required AI composition remains the user-directed policy above.

**Version:** 3.0  
**Status:** Canonical implementation addendum / VS Code AI execution plan  
**Reviewed repository:** `unison-tasks-official-main (3)` — September 17, 2026  
**Companion authorities:**
- `docs/DETERMINISTIC_AI_DESIGN_EXECUTION_PLAN.md`
- `docs/UNISON_21ST_FIRST_REGISTRY_CANONICAL_LAUNCH_PLAN_V2.md`
- `roadmap.md`

---

# 0. Purpose

This document does **not** create a new Unison architecture.

It reconciles the current repository against:

1. the Deterministic AI Design Guidebook,
2. the 21st-first canonical registry plan,
3. the current Launch Wizard / Lane B implementation,
4. the actual remaining legacy and orphaned systems.

Its purpose is to finish convergence.

The current repository is no longer primarily suffering from an absent canonical pipeline. The core path now exists and is substantially stronger:

```text
LauncherWizard
    ↓
launchOrchestrator
    ↓
registered composition + Design Intervention
    ↓
Stage 4b compiler
    ↓
SiteBundleSnapshot
    ↓
candidate AI enrichment
    ↓
canonical merge / preflight
    ↓
commitMutation()
    ↓
canonical revision
    ↓
Preview / Playground / Publish
```

The remaining work is to remove contradictory policy, duplicated truth, incomplete AI/context wiring, half-promoted 21st state, incomplete artifact/asset/prop closure, and dead System Launcher-era files.

The governing principle is:

> **No new system should be introduced to solve remaining fragmentation. Every fix must converge an existing subsystem onto an already-declared canonical owner.**

---

# 1. Authority Hierarchy

Use the following document precedence.

## 1.1 Runtime / canonical execution authority

```text
docs/DETERMINISTIC_AI_DESIGN_EXECUTION_PLAN.md
```

This remains the highest-level runtime architecture guide.

It owns:

- canonical topology
- Stage 4b
- canonical compiler
- UI Foundation
- snapshot authority
- VFS authority
- commit boundary
- Preview / Playground continuity
- deterministic fallback
- closure testing

## 1.2 External design-source authority

```text
docs/UNISON_21ST_FIRST_REGISTRY_CANONICAL_LAUNCH_PLAN_V2.md
```

This remains authoritative for the design-source policy:

> **21st.dev is the sole external design-source ecosystem.**

It does not supersede runtime architecture.

It governs:

- 21st intake
- provenance
- compatibility review
- normalization
- promotion into Unison
- replacement of weak visual implementations
- no live 21st runtime dependency

## 1.3 This V3 document

This document is the **convergence / repair addendum**.

It resolves current source-level contradictions between those two plans and maps the next implementation order onto the current repository.

## 1.4 `roadmap.md`

`roadmap.md` remains a concise status index.

It should not introduce policy independently.

After each batch in this document is accepted, update the roadmap status rather than duplicating the implementation plan there.

---

# 2. Canonical AI Policy — Resolve the Current Contradiction

The existing Guidebook currently contains two incompatible interpretations:

1. Lane B is described as capable of high-fidelity page-body TSX enrichment.
2. Other sections say AI must only propose structured registry-aware edits and must not author Launcher pages.

The current repository also contains both systems:

```text
requestAIPageComposition()
```

and:

```text
WizardLaneBEnrichmentProposal.fileOps[]
```

This ambiguity must end.

## 2.1 Adopt this single rule

> **AI may author candidate page-body TSX, but AI never owns canonical VFS.**

The authority model is:

```text
AI authoring
    ↓
candidate mutation only
    ↓
canonical identity validation
    ↓
import/theme/intent/binding validation
    ↓
canonical merge
    ↓
strict preflight
    ↓
commitMutation()
    ↓
canonical VFS
```

AI may not directly own:

```text
App.tsx
index.css
/.unison/**
/src/unison/**
page topology
page registry
routes
global Stage 4b tokens
capability truth
artifact truth
catalog truth
snapshot identity
revision persistence
```

This preserves creative freedom without restoring System Launcher-era VFS authority.

## 2.2 Structured AI and code AI are separate roles

Use two clearly separated AI roles.

### AI Composition Planner — before Stage 4b

May return only:

```text
registered variant choices
section order within legal topology
business-specific copy
page posture
```

It may not return source code.

### Lane B Canonical Enrichment — after Stage 4b

May return:

```text
candidate page-body TSX replacements
```

It receives the deterministic Stage 4b page as its starting source and may improve:

```text
hierarchy
geometry
media treatment
motion composition
responsive layout
copy treatment
registered primitive usage
```

Only the canonical commit pipeline promotes it.

---

# 3. Critical Source-Level Sequencing Bug

This is the highest-priority current contradiction.

In:

```text
src/services/launch/launchOrchestrator.ts
```

the seed stage currently calls:

```ts
const compositionPlan =
  await requestAIPageComposition(...);

if (compositionPlan)
  plan.selections.compositionPlan = compositionPlan;
else
  throw new LaunchFatalError(...);
```

This makes the AI site composer a **hard dependency** of Launch Wizard success.

That directly contradicts the Guidebook rule:

> Launcher must remain fully functional with AI disabled or unavailable.

Then the later enrichment stage contains:

```ts
if (plan.selections.compositionPlan) return;
```

Since a successful launch currently requires `compositionPlan`, the normal successful path immediately skips post-Stage-4b Lane B enrichment.

The practical current behavior is therefore:

```text
AI composition planner succeeds
      ↓
Stage 4b
      ↓
enrich stage sees compositionPlan
      ↓
RETURN
      ↓
no candidate page-body Lane B enrichment
```

This means the sophisticated candidate-VFS Lane B architecture exists, but normal successful Wizard launches do not use it.

## Required repair

Change the pipeline to:

```text
Wizard selections
      ↓
OPTIONAL composition planner
      │
      ├── succeeds → legal registered composition plan
      └── fails    → deterministic design intervention remains valid
      ↓
Stage 4b ALWAYS compiles a complete site
      ↓
OPTIONAL Lane B page-body enrichment
      ↓
validation
      ↓
canonical merge
      ↓
commit
```

Do not skip Lane B merely because a composition plan exists.

Instead use the composition plan as **additional bounded context** for Lane B.

## Acceptance

1. AI composition endpoint unavailable → Launch still succeeds deterministically.
2. Composition planner succeeds → Stage 4b uses legal registered choices.
3. Lane B disabled → deterministic site still launches.
4. Lane B enabled + valid proposal → accepted page bodies reach canonical VFS.
5. Lane B invalid → only affected pages retain deterministic Stage 4b source.
6. No branch can bypass Stage 4b.

---

# 4. Current Accomplishments That Must Be Preserved

The current repository has already completed major consolidation work.

Do not reopen these unless a regression is proven.

## 4.1 Visual implementation convergence

The repository now has first-class portable recipe families covering the major section system.

`compositionToFileSet.ts` and generated recipes now support registered families rather than relying primarily on generic hard-coded module output.

Current first-class families include:

```text
navbar
hero
about
services
features
pricing
gallery
logo-cloud
blog-preview
before-after
testimonials
stats
team
faq
cta
contact
footer
```

Preserve this.

## 4.2 Old Site Elements design authority is removed

The old:

```text
src/data/siteElementsLibrary/*
```

is gone.

Keep it gone.

The Builder's design prompt now derives from canonical registries.

## 4.3 21st intake infrastructure exists

Current:

```text
src/design/21st-intake/
```

already contains:

```text
compatibilityAudit.ts
componentIntake.ts
dependencyResolver.ts
tokenAdapter.ts
sourceNormalizer.ts
provenance.ts
manifest.ts
imported/
quarantine/
promotions/
references/
```

This is the correct general architecture.

Extend it; do not create a second intake path.

## 4.4 21st-derived preferred implementations exist

The current Variant Registry contains many preferred 21st-derived implementations with:

```text
source.origin = 21st
vfs.mode = portable-recipe
vfs.certification = approved
generationStatus = preferred
```

Keep these first-class.

## 4.5 Generation status is partially wired

Current code already respects non-legacy variants in important places including:

```text
src/sections/aiPageComposition.ts
src/services/requestAIPageComposition.ts
src/services/wizardDesignIntervention.ts
src/services/launch/wizardRegistryAggregation.ts
```

Do not rebuild this mechanism.

Complete it where AI Builder and visual editing context still present all variants without enough status/source information.

## 4.6 Wizard Registry Context is already v2

Current:

```text
src/services/launch/wizardRegistryAggregation.ts
```

already declares:

```ts
WIZARD_REGISTRY_CONTEXT_VERSION = '2.0'
```

and includes:

```text
sections
implementations
source provenance
vocabularyRefs
Radix primitives
artifacts
catalog surfaces
motion primitives
design registry signature
design capability fingerprint
```

This is a strong foundation.

M7 is not "build v2 from scratch."

M7 is now:

> **finish v2 closure.**

## 4.7 Lane B has the correct candidate-VFS security shape

Current:

```text
src/services/wizardLaneBEnrichment.ts
```

already provides:

```text
WizardLaneBEnrichmentProposal
replace-only page fileOps
protected paths
identity matching
registry signature matching
intent preservation
canonical merge
```

Keep this architecture.

Modernize the validator rather than replacing Lane B.

---

# 5. P0 — Make AI Optional and Actually Wire Both AI Layers

This should happen before more design-source expansion.

## Files

```text
src/services/launch/launchOrchestrator.ts
src/services/requestAIPageComposition.ts
src/services/wizardLaneBEnrichment.ts
src/services/laneBBatchPlanner.ts
src/test/launchOrchestratorCanonicalHandoff.test.ts
src/test/wizardLaneBEnrichment.test.ts
```

## Changes

### 5.1 Composition planner must degrade, not kill launch

Current:

```text
AI plan failure
→ LaunchFatalError
```

Target:

```text
AI plan failure
→ launch degradation record
→ deterministic registered composition
→ continue Stage 4b
```

The deterministic path is not a "fallback page."

It is the canonical baseline.

### 5.2 Remove the `compositionPlan` early-return from enrichment

Remove behavior equivalent to:

```ts
if (plan.selections.compositionPlan) return;
```

Lane B should run based on an explicit launch setting / availability policy, not based on whether the composition planner succeeded.

### 5.3 Add the composition plan to Lane B context

Add a bounded field:

```ts
compositionPlan?: AIPageCompositionPlan;
```

Lane B then knows:

```text
which registered implementations were chosen
which section order was approved
what copy posture the planner established
```

It may improve the page body without changing topology.

### 5.4 Preserve deterministic fail-open behavior

If Lane B:

```text
times out
returns invalid JSON
fails validation
uses a forbidden import
breaks an intent
```

the deterministic page remains untouched.

## Acceptance

Add tests for all four combinations:

```text
composition AI ON  + Lane B ON
composition AI ON  + Lane B OFF
composition AI OFF + Lane B ON
composition AI OFF + Lane B OFF
```

All four must produce a valid Launch.

---

# 6. P0 — Atomic 21st Certification and Promotion

The intake architecture exists, but current repository records reveal incomplete lifecycle convergence.

Several files under:

```text
src/design/21st-intake/imported/*/record.json
```

claim a promoted or late lifecycle state while still containing combinations such as:

```text
implementationId: missing
portableRecipeCertified: false
```

Meanwhile promotion manifests under:

```text
src/design/21st-intake/promotions/*.json
```

already describe preferred canonical implementations.

This creates two truths.

## 6.1 One promotion transaction

Add one development-time promotion command/service.

Suggested owner:

```text
src/design/21st-intake/promote.ts
```

or extend:

```text
componentIntake.ts
```

The atomic operation must:

1. validate provenance
2. validate license review
3. run compatibility audit
4. normalize imports
5. normalize Stage 4b theme usage
6. stamp canonical identity
7. verify reduced motion / responsive behavior
8. generate / verify portable recipe
9. write canonical variant metadata
10. write the final `implementationId`
11. set `portableRecipeCertified = true`
12. mark lifecycle step 9/10
13. write promotion manifest
14. remove or archive active intake duplicate

If any step fails, do not mark the source promoted.

## 6.2 Explicit license review state

Current provenance checks only require a non-empty license string.

Replace that weak condition with:

```ts
licenseReview: {
  status:
    | 'unverified'
    | 'verified'
    | 'rejected';

  license?: string;
  source?: string;
  verifiedAt?: string;
  notes?: string;
}
```

### Source adaptation

For:

```text
derivation = source-adaptation
```

require:

```text
licenseReview.status === verified
```

before promotion.

### Visual-reference implementation

For:

```text
derivation = visual-reference
```

record provenance accurately but do not falsely assert copied-source licensing.

## Acceptance

No preferred canonical 21st-derived variant may point to an intake record that still reports uncertified or unpromoted state.

Add:

```text
twentyFirstPromotionClosure.test.ts
```

---

# 7. P0 — Modernize Lane B Validation

Current:

```text
src/services/wizardLaneBEnrichment.ts
```

still uses some string-based heuristics that are too fragile for sophisticated modern React.

## 7.1 Remove mandatory `React` import heuristic

Current logic effectively rejects TSX unless content contains:

```text
import
React
```

Modern JSX runtime does not require:

```ts
import React from 'react';
```

Replace this with the same parser/preflight technology already used elsewhere in Unison.

Validation should answer:

```text
Does the TSX parse?
Are imports resolvable?
Are protected paths untouched?
```

not:

```text
Does the string contain "React"?
```

## 7.2 Replace raw geometry string rejection

Current theme compliance rejects matches such as:

```text
12px
1rem
70vh
10vw
#fff
```

The color restriction is useful.

The generic geometry restriction is too coarse.

A certified component may legitimately contain reviewed geometry.

Adopt:

> **Registry implementations may contain certified bounded geometry. Lane B may compose them. Lane B may not introduce a competing global theme system.**

Validate:

```text
foreign global tokens
raw palette overrides
font-family replacement
unsafe global CSS
unsupported CSS imports
```

instead of banning every unit string.

## 7.3 Use actual TSX parse/preflight

Reuse:

```text
aiSitePreflightRepair
TypeScript/Babel parser infrastructure
generated UI import contract
```

rather than maintaining a second syntax heuristic.

## Acceptance

Add fixtures proving valid modern TSX passes without a React import and malformed JSX still fails.

---

# 8. P1 — Finish Wizard Registry Context v2

The current v2 context is useful but incomplete.

Current v2 already contains:

```text
sections
implementations
source provenance
certification
page roles
vocabulary refs
Radix primitives
artifacts
catalog surfaces
motion primitives
design signature/fingerprint
```

Remaining closure:

```text
project/business asset inventory
approved runtime dependency context
implementation prop/slot contract
capability requirements
background/navigation/experience primitive families
```

## 8.1 Add asset projection

Use the existing:

```text
src/services/assetRegistry.ts
src/types/asset.ts
```

Do not create another asset registry.

Add a bounded projection such as:

```ts
interface WizardRegistryAssetSummary {
  assetId: string;
  kind: string;
  url?: string;
  tags: readonly string[];
  width?: number;
  height?: number;
  aspectRatio?: string;
  dominantColors?: readonly string[];
}
```

Filter by the active business/project.

Do not send every user asset globally.

## 8.2 Add approved dependency context

Each implementation should expose derived runtime requirements.

Example:

```ts
runtimeDependencies: readonly string[];
experienceCapabilities: readonly string[];
```

These should be derived from canonical implementation / UI foundation declarations.

Do not create a second hand-maintained npm registry.

## 8.3 Add primitive family inventory

Context should expose the generated foundation as categories:

```ts
primitives: {
  composition: string[];
  motion: string[];
  background: string[];
  navigation: string[];
  experience: string[];
}
```

Derive from:

```text
generatedUiFoundation.ts
```

Never restate arrays in `wizardRegistryAggregation.ts`.

## 8.4 Pass the bounded context directly to Lane B

Current Lane B receives an `implementationContext`, which is good.

Extend the request so it also receives only the relevant bounded pieces from Registry Context v2:

```text
assets
dependency context
primitive families
artifact/slot contracts
```

Do not send the entire global registry unfiltered.

---

# 9. P1 — Canonical Props and Slots

Unison now has strong:

```text
SectionVariant
ArtifactDef
CatalogSurface
```

but the prop/slot boundary is still not consistently explicit enough for:

```text
AI
Preview selection
Property Inspector
artifact binding
variant switching
```

## 9.1 Create one derived implementation contract

Do not hand-maintain a fourth registry.

Build a derived projection.

Suggested:

```ts
interface ResolvedImplementationContract {
  implementationId: string;
  sectionType: SectionType;
  artifactId: string | null;

  slots: Array<{
    id: string;
    kind:
      | 'text'
      | 'rich-text'
      | 'asset'
      | 'list'
      | 'action'
      | 'catalog'
      | 'number'
      | 'boolean';

    required: boolean;
    editable: boolean;
  }>;

  intents: readonly string[];
  catalogSurfaceId?: string;

  primitiveDependencies: readonly string[];
  runtimeDependencies: readonly string[];

  generationStatus: string;
  source?: VisualSourceMetadata;
}
```

Derive it from:

```text
Artifact Registry
Variant Registry
Design Implementation Registry
Catalog Surface Registry
Intent Surface Registry
Generated UI Foundation
```

## 9.2 Keep one canonical slot identity

Generated DOM/VFS should use:

```text
data-ut-section-id
data-ut-artifact
data-ut-implementation
data-ut-slot
data-ut-intent
```

The same slot ID must be understood by:

```text
Launcher
Lane B
Preview
Element selection
Property Inspector
AI Builder
```

## Acceptance

Add:

```text
resolvedImplementationContract.test.ts
```

Every preferred implementation must resolve a coherent artifact + slot contract.

---

# 10. P1 — Migrate Builder AI Away From System Launcher Truth

The old System Launcher component is gone.

However, its context model remains alive in current Builder code.

Current live consumers of:

```text
SystemsBuildContext
```

include:

```text
src/components/creatives/WebBuilder.tsx
src/components/creatives/web-builder/AIBuilderPanel.tsx
src/components/creatives/web-builder/ElementFloatingToolbar.tsx
src/hooks/useCompiledContract.ts
src/services/builderBrainClient.ts
src/services/builderPayloadBudget.ts
src/types/launchState.ts
```

This is now a legacy compatibility layer.

## 10.1 New context precedence

For new Launch Wizard projects:

```text
SiteBundleSnapshot
      ↓
WizardSeed
      ↓
Wizard Registry Context
      ↓
Design Intervention
      ↓
Resolved Implementation Contracts
```

Only if those are absent should old projects read:

```text
SystemsBuildContext
```

## 10.2 Create a canonical Builder context projection

Suggested new owner:

```text
src/services/buildCanonicalBuilderContext.ts
```

It should derive:

```text
industry
business identity
theme
template
art direction pack
available design implementations
assets
intents
capabilities
current pages
```

from current canonical sources.

Then migrate:

```text
AIBuilderPanel
ElementFloatingToolbar
useCompiledContract
```

to use it.

## 10.3 Rename stale payload terminology

Current Builder payload still carries:

```text
siteElementsLibraryContext
```

even though the old Site Elements Library is gone.

Rename to:

```text
canonicalDesignContext
```

across:

```text
AIBuilderPanel.tsx
builderBrainClient.ts
builderPayloadBudget.ts
edge request schema where applicable
```

Keep a temporary decoder alias only if old remote payload compatibility requires it.

## Acceptance

A new Wizard project must never need `SystemsBuildContext` to resolve its industry/theme/design truth.

---

# 11. P1 — Remove LaunchState Dual Truth

Current:

```text
src/types/launchState.ts
```

still carries:

```text
LaunchBlueprint
systemsBuildContext
```

and `createLaunchState()` can synthesize:

```text
industry: universal
```

inside a fallback blueprint.

This can disagree with the real top-level/snapshot industry.

## Target

For new launches, `LaunchState` becomes a handoff projection rather than a second business blueprint.

Canonical identity comes from:

```text
siteBundleSnapshot
wizardSeed
wizardSelections
```

## Migration

### Keep temporarily for historical projects

```text
LaunchBlueprint
SystemsBuildContext
```

must remain readable until historical drafts/revisions are migrated or compatibility-tested.

### Stop creating new fallback truth

Do not synthesize a fake universal blueprint for current Wizard launches.

### Mark legacy fields

```ts
/** @deprecated legacy read compatibility only */
blueprint?: LaunchBlueprint;

/** @deprecated legacy System Launcher compatibility only */
systemsBuildContext?: SystemsBuildContext;
```

## Final deletion gate

Delete only after:

```text
WebBuilder
AIBuilderPanel
ElementFloatingToolbar
useCompiledContract
builder request payloads
historical fixtures
```

no longer require them for new projects.

---

# 12. P1 — Finish Intent Canonicalization

The only owner of canonical intent identity should be:

```text
src/platform/core/intentSurfaceRegistry.ts
```

Other registries should store canonical IDs.

Legacy aliases should be translated at read/migration boundaries only.

## Audit

Search:

```text
componentIntelligenceRegistry
catalogSurfaceRegistry
runtime aliases
old generated fixtures
```

for names such as:

```text
nav.goto_page
calendar.open
form.open
checkout.start
popup.open
external.open
```

Normalize new registry definitions to current canonical intent IDs.

Do not remove alias support needed to hydrate historical projects.

---

# 13. P1 — Remove Stale Component Intelligence Placeholders

`componentIntelligenceRegistry.ts` has already been demoted from design authority.

That is correct.

However, it still declares placeholder intelligence for:

```text
logo-cloud
blog-preview
before-after
```

even though the repository now contains first-class registered variants and recipes for those families.

Replace placeholder entries with real semantic intelligence or derive the semantic metadata from Artifact Registry / Section Registry where possible.

Do not let a first-class visual family remain "placeholder intelligence."

`componentIntelligenceRegistry` should remain limited to:

```text
semantic prop validation
composition rules
section-count/order constraints
industry suitability hints
responsive semantic requirements
```

It must not own:

```text
visual implementation choices
design vocabulary
canonical intent IDs independently
```

---

# 14. P2 — Complete Generated UI Foundation Expansion

M5 remains open.

Do not add another animation framework.

Continue to use:

```text
React
Tailwind
Framer Motion
Radix
Lucide
Embla
```

and capability-gated experience dependencies.

## Priority primitive families

### Background

Add / normalize:

```text
OrbitalBackdrop
GlowField
AnimatedGrid
NoiseField
GradientOrbs
MediaCanvas
```

### Motion

Preserve / certify:

```text
Reveal
RevealGroup
Stagger
StaggerGroup
StaggerItem
MarqueeBand
HorizontalRail
HoverDepth
ImageReveal
ParallaxMedia
MaskReveal
MotionImage
```

### Navigation

Expose canonical inventories from the UI Foundation rather than duplicate arrays elsewhere.

### Typography

Add:

```text
hero
display
title
subtitle
```

semantic tiers and:

```css
--ut-type-hero
```

through Stage 4b.

## Rule

21st-derived variants may contain certified local geometry.

Global visual system authority still belongs to Stage 4b.

---

# 15. P2 — Art Direction Packs as the Main Curation Layer

21st is the sole external source, but Unison still decides which components belong together.

Keep:

```text
src/sections/variants/artDirectionPacks.ts
```

as the cohesion layer.

Every pack should select only legal registered implementations.

Continue expanding packs around coherent families rather than random 21st imports.

## Pack acceptance

For every pack:

```text
all implementation IDs resolve
all selected variants are portable
all preferred sourced variants carry valid provenance
page-role constraints are respected
motion/experience budget remains legal
same seed reproduces same choices
```

Use existing `wizardTwentyFirstIndustries.test.ts` as a foundation.

---

# 16. P2 — Close Asset → Wizard → AI Wiring

Current Asset Registry is a real system but is not yet part of Wizard Registry Context.

Wire:

```text
Asset Registry
    ↓
Wizard Registry Context v2
    ↓
composition planner
    ↓
Lane B
    ↓
AI Builder
```

AI should prefer existing business/project media instead of inventing URLs.

## Asset selection policy

Prioritize:

```text
logo-tagged assets
hero-tagged landscape media
product/service imagery
portfolio media
business-specific uploads
```

Do not include:

```text
unrelated user assets
other business assets
unverified private URLs
```

---

# 17. P2 — Clarify Certified Geometry Policy

Current 21st-derived implementations legitimately contain advanced geometry such as:

```text
min-h-[70vh]
min-h-[82vh]
clamp(...)
inline layout values
local keyframes
```

Trying to remove every such value would flatten the designs.

Adopt this rule:

> **Stage 4b owns global theme identity. Certified implementations may own bounded local geometry and motion values when reviewed as part of their implementation contract.**

Normalize only values that should respond across style cards.

Good candidates to tokenize:

```text
hero display scale
site max width
major section spacing
global radius language
global motion duration/easing
global palette/font families
```

Do not force every implementation-specific offset into a global token.

---

# 18. P2 — Visual Quality Closed Loop

Current visual quality evaluation exists.

Do not replace it with a subjective "AI score."

Use it as a diagnostic and targeted refinement input.

Target flow:

```text
deterministic page
      ↓
optional Lane B candidate
      ↓
visual quality evaluation
      ↓
specific warnings
      ↓
optional focused correction pass
      ↓
same canonical validation
      ↓
commit
```

Example actionable warnings:

```text
repetitive equal card grids
all sections center-aligned
weak hero hierarchy
no media focal point
CTA buried
excessive continuous motion
mobile overflow
identical page rhythm
```

Do not use one opaque score as the only release gate.

---

# 19. Complete Deletion List — Delete After One Reference Check

The following current files appear to have no live consumers outside themselves/tests and belong to the removed System Launcher-era UI.

Delete them if the final import graph confirms no consumer.

```text
src/components/onboarding/WizardTopAction.tsx
src/components/onboarding/WizardTopAction.test.tsx

src/components/onboarding/ThemeLivePreview.tsx

src/hooks/useWizardAI.ts

src/components/onboarding/industryThemePresetMap.ts
```

Also delete:

```text
dead SystemLauncher comments
dead SystemLauncher terminology
obsolete import aliases
duplicate primitive inventories
```

once the owning canonical replacement is confirmed.

Keep:

```text
src/data/siteElementsLibrary/*
```

deleted.

Do not resurrect it.

---

# 20. Migrate Then Delete — Not Immediate

These systems still have live compatibility consumers.

## 20.1 `src/types/systemsBuildContext.ts`

Status:

```text
LEGACY COMPATIBILITY
```

Migrate consumers first.

Then delete.

## 20.2 `LaunchBlueprint` in `launchState.ts`

Stop creating it for new launches.

Keep read compatibility.

Delete after downstream migration.

## 20.3 `siteElementsLibraryContext` payload field name

Rename to:

```text
canonicalDesignContext
```

Keep a temporary decoder alias if remote compatibility needs it.

Then delete the old name.

## 20.4 `renderJSX` on `SectionVariant`

Current variants still require:

```ts
renderJSX
```

even though canonical portable recipes are now the real VFS path.

Current Registry largely uses:

```text
portableRecipeOnly
```

instead of separate hand-authored source, which is good.

Next step:

1. make `renderJSX` optional/deprecated
2. prove no runtime mutation path calls it
3. migrate remaining tests
4. remove it from the interface
5. delete `portableRecipeOnly`

The goal is one implementation source.

## 20.5 Legacy intent aliases

Keep read migration.

Stop writing aliases.

Delete only when persisted compatibility coverage proves safe.

---

# 21. Systems That Must NOT Be Deleted

These are now valuable canonical owners.

```text
src/components/onboarding/wizard/LauncherWizard.tsx

src/services/launch/launchOrchestrator.ts
src/services/launch/wizardRegistryAggregation.ts

src/platform/core/canonicalPipeline.ts
src/services/canonicalLaunchVfs.ts
src/services/vfsCommitService.ts

SiteBundleSnapshot

src/sections/variants/registry.ts
src/sections/variants/artDirectionPacks.ts
src/services/designImplementationRegistry.ts
src/platform/core/designVocabulary.ts

src/platform/core/generatedUiFoundation.ts

src/platform/core/artifactRegistry.ts
src/platform/core/catalogSurfaceRegistry.ts
src/platform/core/intentSurfaceRegistry.ts
src/platform/core/capabilityRegistry.ts

src/services/wizardDesignIntervention.ts

src/services/wizardLaneBEnrichment.ts
src/services/laneBBatchPlanner.ts

src/design/21st-intake/*

src/services/assetRegistry.ts

src/services/aiSitePreflightRepair.ts
```

Do not replace these with new systems.

---

# 22. Canonical Truth Matrix

Use this table as a permanent architectural guard.

| Question | Canonical owner |
|---|---|
| What pages exist? | SitePlan + `SiteBundleSnapshot.pageRegistry` |
| What route does a page use? | canonical topology/page registry |
| What industry is active? | WizardSeed + snapshot metadata |
| Which template was selected? | WizardSelections/WizardSeed + snapshot |
| Which style card/theme is active? | Stage 4b + snapshot theme metadata |
| Which visual implementation is selected? | Design Intervention / resolved composition |
| Which implementations exist? | Variant Registry |
| Which implementations are executable? | DesignImplementationRegistry |
| Which source informed an implementation? | 21st provenance metadata |
| Which external design source is legal? | 21st policy only |
| Which vocabulary exists? | `designVocabulary.ts` |
| Which vocabulary is executable? | DesignImplementationRegistry |
| What artifact is this? | Artifact Registry |
| What persistent data hydrates it? | Catalog Surface Registry |
| What user action does it perform? | Intent Surface Registry |
| What business/runtime capability is required? | Capability Registry |
| What media is available? | Asset Registry |
| What generated primitives exist? | Generated UI Foundation |
| What does AI know about legal design choices? | Wizard Registry Context |
| Can AI propose a page body? | Lane B policy |
| Does the AI result become canonical? | validator + canonical merge + `commitMutation()` |
| What files are final truth? | committed VFS revision / sealed snapshot projection |
| What does Preview render? | committed canonical files |
| What does Playground edit? | committed canonical identity |

Any other module claiming independent authority over one of these truths is a migration/deletion candidate.

---

# 23. Required Documentation Reconciliation

Update the Guidebook after P0 AI sequencing is implemented.

## Replace contradictory wording

Remove claims that:

```text
AI may never author page-body source
```

if they conflict with the accepted candidate-VFS model.

Replace with:

> Lane B may author candidate page-body TSX within registered page boundaries. AI output is never canonical on receipt. Only canonical validation, merge, preflight, and `commitMutation()` may promote candidate code into canonical VFS.

For Experience/3D:

> Lane B may compose approved snapshot-owned experience primitives inside candidate page bodies. It may not author or replace the Experience foundation itself, grant new runtime capabilities, alter global renderer configuration, or bypass experience budgets.

This reconciles the existing high-fidelity Lane B section with the Experience capability section.

## Update roadmap language

Where roadmap currently says:

```text
AI may not author Launcher pages
```

change to:

```text
AI may not directly own Launcher pages or canonical VFS.
AI may propose bounded candidate page-body replacements that become canonical
only through the approved validation and commit boundary.
```

---

# 24. Implementation Sequence

Do the following in order.

## Batch 0 — Documentation authority repair

Files:

```text
docs/DETERMINISTIC_AI_DESIGN_EXECUTION_PLAN.md
docs/UNISON_21ST_FIRST_REGISTRY_CANONICAL_LAUNCH_PLAN_V2.md
roadmap.md
```

Goal:

one AI authority rule.

No source behavior change yet.

---

## Batch 1 — AI sequencing repair

Files:

```text
launchOrchestrator.ts
requestAIPageComposition.ts
wizardLaneBEnrichment.ts
tests
```

Goal:

```text
composition AI optional
Stage 4b mandatory
Lane B optional
candidate VFS validated
deterministic path always viable
```

This is the highest-priority implementation batch.

---

## Batch 2 — Lane B validator modernization

Replace:

```text
React string heuristic
raw unit scanner
```

with real parser/preflight + targeted theme rules.

---

## Batch 3 — Atomic 21st promotion

Files:

```text
src/design/21st-intake/*
scripts/21st-intake.mjs
tests
```

Goal:

one promotion truth and explicit license verification.

---

## Batch 4 — Registry Context v2 closure

Add:

```text
assets
dependency context
primitive families
capabilities
resolved implementation contracts
```

Pass bounded context into:

```text
composition planner
Lane B
AI Builder
```

---

## Batch 5 — Builder canonical-context migration

Migrate:

```text
WebBuilder
AIBuilderPanel
ElementFloatingToolbar
useCompiledContract
builderBrainClient
builderPayloadBudget
```

away from new-launch reliance on:

```text
SystemsBuildContext
LaunchBlueprint
siteElementsLibraryContext
```

---

## Batch 6 — Artifact / slot / prop closure

Create the derived implementation-artifact crosswalk.

Prepare the foundation for WYSIWYG selection.

---

## Batch 7 — Asset-aware generation

Wire Asset Registry into Wizard/AI context.

Prove business isolation.

---

## Batch 8 — UI Foundation M5 expansion

Implement canonical background / hero typography / additional reusable 21st-derived primitive normalization.

---

## Batch 9 — Delete dead System Launcher-era files

Delete the immediate dead list.

Deprecate live legacy context types.

---

## Batch 10 — Persisted publish and Builder round-trip proof

Close M1 with real persisted publish evidence.

Then advance:

```text
M9 Property Inspector
Phase 7 artifact/editor closure
Phase 8 Playground round trips
Phase 9 import/export symmetry
Phase 10 visual runtime certification
```

---

# 25. Test Matrix

No phase closes on registry counts.

## AI sequencing

```text
composition planner unavailable
composition planner invalid
composition planner valid
Lane B unavailable
Lane B timeout
Lane B invalid proposal
Lane B valid proposal
mixed valid/invalid page batches
```

Every case must preserve a renderable canonical site.

## 21st closure

```text
source provenance
license verification
dependency audit
token normalization
responsive behavior
reduced motion
portable recipe
promotion manifest
implementationId synchronization
duplicate removal
```

## Registry context

Verify:

```text
implementation inventory
source provenance
generation status
vocabulary refs
Radix requirements
primitive dependencies
assets
artifact IDs
catalog surfaces
intent bindings
```

## Builder continuity

Launch:

```text
Wizard
→ persist
→ WebBuilder
→ AI edit
→ commit
→ reload
```

The same:

```text
industry
theme
art direction
implementation IDs
artifact IDs
assets
intents
```

must survive.

## Deletion safety

Before deleting every dead file:

```text
no runtime import
no lazy import
no test-only architecture dependency
no route entry
no dynamic string import
```

---

# 26. Definition of Fully Wired

A feature is not "wired" merely because a file exists.

Use this closure checklist:

```text
[ ] canonical owner exists
[ ] registry identity exists
[ ] source/provenance is correct
[ ] variant/implementation is executable
[ ] Art Direction may resolve it
[ ] Wizard Registry Context sees it
[ ] Stage 4b can compile it
[ ] Lane B knows its legal contract
[ ] artifact identity is preserved
[ ] prop/slot identity is preserved
[ ] intent identity is canonical
[ ] business data binding is preserved
[ ] asset references are canonical
[ ] VFS contains the actual implementation
[ ] snapshot contains matching identity
[ ] Preview renders it
[ ] Playground recognizes it
[ ] commit persists it
[ ] reload preserves it
[ ] export/import policy is defined
[ ] mobile/desktop proof exists
```

Anything missing from this list remains partially fragmented.

---

# 27. What "Done" Looks Like

The target pipeline is:

```text
21st.dev
   ↓ development-time intake
certified Unison implementation
   ↓
Variant Registry
   ↓
DesignImplementationRegistry
   ↓
ArtDirectionPack
   ↓
Launch Wizard
   ↓
optional registered AI composition plan
   ↓
deterministic Stage 4b site
   ↓
SiteBundleSnapshot
   ↓
optional Lane B candidate page-body enrichment
   ↓
canonical validation
   ↓
commitMutation()
   ↓
canonical revision
   ↓
Preview / Playground / Publish
```

And Builder continuation becomes:

```text
Committed Snapshot
    ↓
Canonical Builder Context
    ↓
Visual selection / AI editing
    ↓
structured or candidate code mutation
    ↓
same canonical validation
    ↓
commitMutation()
    ↓
reload-safe revision
```

There is no:

```text
System Launcher
second design library
second template engine
second VFS writer
second intent registry
second theme system
second AI design vocabulary
live 21st runtime dependency
```

---

# 28. VS Code AI Execution Prompt

Use this prompt to execute the plan:

> You are implementing the Unison Guidebook + 21st Canonical Convergence Plan V3 against the current repository.
>
> Do not create new architectural systems.
>
> Treat these as canonical:
>
> - `docs/DETERMINISTIC_AI_DESIGN_EXECUTION_PLAN.md`
> - `docs/UNISON_21ST_FIRST_REGISTRY_CANONICAL_LAUNCH_PLAN_V2.md`
> - this V3 convergence document
>
> The V3 document resolves current implementation contradictions.
>
> Begin with **Batch 0 and Batch 1 only**.
>
> First audit and prove the current source behavior in:
>
> ```text
> src/services/launch/launchOrchestrator.ts
> src/services/requestAIPageComposition.ts
> src/services/wizardLaneBEnrichment.ts
> ```
>
> Confirm these current issues before editing:
>
> 1. `requestAIPageComposition()` is currently required for successful Stage 4b entry.
> 2. a successful `compositionPlan` currently causes the post-Stage-4b enrich stage to return before Lane B candidate page-body enrichment.
> 3. this violates the Guidebook requirement that the deterministic Launcher remain viable when AI is unavailable.
>
> Then implement:
>
> ```text
> optional AI composition planning
> → mandatory deterministic Stage 4b baseline
> → optional Lane B candidate page enrichment
> → canonical validation
> → canonical merge
> → commitMutation
> ```
>
> Never let AI:
>
> ```text
> change topology
> change App.tsx
> change index.css
> write /.unison infrastructure
> write /src/unison infrastructure
> grant runtime dependencies
> replace global theme tokens
> bypass canonical intents
> bypass artifact/data bindings
> write directly to committed VFS
> ```
>
> AI may author candidate registered page-body TSX only.
>
> A candidate becomes canonical only after existing validation, merge, preflight and commit.
>
> Preserve the deterministic Stage 4b page whenever AI is unavailable or rejected.
>
> Add regression tests for all AI-on/off combinations before moving to Batch 2.
>
> Do not ingest additional 21st components during this batch.
>
> Do not modify the business data model during this batch.
>
> Do not build WYSIWYG controls during this batch.
>
> After Batch 1 passes, update `roadmap.md` and proceed to the Lane B validator modernization batch.

---

# 29. Immediate Priority Summary

### P0

```text
AI sequencing / deterministic independence
Guidebook policy reconciliation
Lane B validator modernization
atomic 21st promotion + license truth
```

### P1

```text
Wizard Registry Context v2 closure
Asset Registry projection
props/slots/artifact crosswalk
Builder context migration
LaunchState/SystemBuild dual-truth removal
intent canonicalization
```

### P2

```text
UI Foundation expansion
Art Direction refinement
asset-aware AI composition
visual-quality refinement
```

### P3

```text
dead legacy deletion
property inspector
Playground round trip
import/export symmetry
immersive 3D expansion after gates
```

---

# 30. Final Architectural Rule

The next phase of Unison is not about creating more systems.

It is about making the existing systems agree.

The final rule is:

> **21st supplies approved visual source. Registries describe legal implementations. The Launch Wizard defines user intent. Stage 4b guarantees a complete deterministic site. Lane B may enrich registered page bodies as candidate code. Canonical validation and `commitMutation()` alone decide what becomes real. SiteBundleSnapshot, Preview and Playground consume that same committed truth.**

This is the convergence point to reach before adding significantly more design inventory.

### V3 continuation: guarded registration and rollback

The existing unison-variant-register command now shares the intake provenance gate, validates source identity, explicit adaptation certification, component/recipe presence and output paths before writing. It stages registry, thumbnail and lifecycle changes together and restores previous file bytes after a caught write failure. Registration records implementationId and lifecycle step 9; it no longer claims archival step 10. The Windows root-path conversion is corrected.

Verification: 21 focused intake/promotion tests passed, including check-only behavior, idempotency, no-write rejection and injected failure rollback. The repository check intentionally reports eight blocked existing specs with missing verified license reviews, mismatched source metadata and uncertified adaptations. Existing production registry entries were not changed or retroactively certified.

Batch 3 remains incomplete: process-crash recovery, running portable/visual certification within the transaction, archival and reconciliation of existing specs still require implementation/evidence. The current transaction rolls back caught write errors; it is not crash-atomic across files.

### V3 continuation: registry agreement and resolved artifact context

Promotion registration now parses registry TypeScript to verify that the unique entry, component and recipe imports, source metadata, portable approval and aliases match the spec before lifecycle changes. Duplicate specs are rejected. The read-only --audit command reports evidence and registry gaps together as JSON, returning a failing exit code while gaps remain. Current audit: eight specs, 32 findings; no source reviews or certification flags were fabricated.

Batch 4 has begun independently: eligible implementation summaries include artifactContract derived from the canonical artifact registry (slots, intents, data-source kind and AI edit scope). The production Lane B projection carries these contracts, and older snapshots without them remain supported. This is context for validation-aware generation, not a new contract owner or permission grant. Assets, broader dependency/primitive/capability context, composition-planner consumption and Builder migration remain open.

Continuation verification: 208 test files passed, 1,831 tests passed and one skipped. TypeScript, targeted ESLint, single-source-of-truth and catalog-contract checks passed. The promotion audit remains intentionally failing for the 32 recorded evidence/registry findings.


### 21st-only generation and promotion reconciliation (current checkpoint)

This checkpoint supersedes the earlier eight-blocked / 32-findings status. The read-only promotion audit now reports eight specs, five explicitly retired records and zero findings. Three original sources (footer:brand-social, testimonials:marquee and stats:metric-cards) have verified MIT evidence, reconciled registry metadata, component review hashes and archived intake sources. The other five remain unverified and are excluded from new generation; retirement resolves their registry disposition, not their licenses. Saved documents can still resolve their historical IDs.

New generation, AI plan validation, Wizard selection/context and Builder layout pickers share getGenerationVariantsForSection: only non-legacy 21st-derived implementations with approved portable recipes are eligible. Every semantic family has coverage across all art-direction packs. Seven new local variants fill coverage and quality gaps: hero:launch-showcase, navbar:catalog-bar, cta:inset-panel, team:profile-cards, blog-preview:four-columns, before-after:reveal-panel and logo-cloud:reveal-tiles. Source adaptations and original visual-reference implementations are explicitly distinguished; source receipts and archived retrievals preserve that distinction. No runtime MCP dependency or credential is added. Layout thumbnails now depict each new layout's structure.

AI contextual composition remains mandatory. Optional Lane B refinement retains accepted AI-composed pages if refinement fails. Legacy implementations remain available for saved-content compatibility, not as fresh Wizard alternatives.

Registration now journals original bytes before mutation and supports --recover after process interruption. Recovery refuses to overwrite edits made after the interrupted transaction. Tests terminate an actual child process between writes, recover and retry. This is crash recovery, not simultaneous multi-file visibility or a claim of power-loss durability. Step-10 source archives and the development-only intake manifest are reconciled.

Verification: 209 test files passed; 1,858 tests passed, one skipped. TypeScript, production build, all four architecture checks and the promotion audit passed. The build retains its existing large-chunk warning. Local desktop/mobile industry previews rendered without horizontal overflow or reported browser errors. These fixtures do not verify authenticated AI provider, persistence or publishing.

Remaining V3 scope is explicit: complete project-bounded asset projection, props/slots and dependency/primitive context, remaining Builder/context migration, launch-state and intent convergence, broader foundation work and authenticated persisted/published round trips. Promotion execution still consumes recorded adaptation reviews; portable/visual verification is performed separately rather than inside the write transaction. This checkpoint does not certify completion of every V3 batch.
