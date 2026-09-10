# Page-by-page composition and hero quality upgrade

Goal: every generated page arrives as a complete, well-ordered page — a full hero with uncut imagery, a narrative section order that fits the industry, and enough enrichment that no page reads as a two-block stub.

## What's wrong today

1. **All pages share the home page's hero shape.** The generation brief copies one `homeHeroGeometry` onto every route, so inner pages get a hero designed for a different job — hence the "disoriented" Contact/About pages.
2. **Hero media is cropped by fixed bands.** Hero imagery renders inside a fixed-height block with a fixed aspect ratio, so tall/wide photos get sliced and the hero visually ends mid-image.
3. **Section order is generic.** Section pools are keyed only by page role, ignoring the industry journey already defined in the industry matrix, so ordering has no narrative logic.
4. **Quality checks don't look at heroes.** The quality pass counts sections, media and CTAs but never asks "is this hero complete?" or "does the page follow its planned order?", so weak pages pass.

## The work

### 1. Per-page hero architecture (`src/services/wizardGenerationBrief.ts`)

Replace the single shared geometry with a per-route hero contract:

- A small set of hero archetypes (immersive full-bleed, editorial split, anchored portrait, centered statement, utility intro-with-proof) chosen deterministically from page role + industry + generation seed.
- Each route's hero declares required parts: eyebrow, headline, supporting lead, primary + secondary action, and one media or proof element — so no hero can ship as a bare title.
- Home keeps the template-derived geometry; inner pages get archetypes that must differ from home and from each other where the seed allows.
- Media direction per hero: subject framing, focal position, and whether the image is full-bleed, framed, or edge-anchored.

### 2. Uncropped hero media (`src/components/onboarding/themePresetToIndexCss.ts`)

- Hero media containers switch from a hard aspect ratio to a min-height + intrinsic ratio pair, so the image scales instead of being sliced.
- Add focal-point control (`object-position` token) and a full-bleed hero variant where the image is the section background with a legibility scrim, rather than a band above the text.
- Hero min-height accounts for the nav block so the first screen never opens with content jammed under the header.

### 3. Industry-aware section narrative (`wizardGenerationBrief.ts` + `src/platform/core/industryMatrix.ts`)

- Derive each page's section order from the industry conversion journey already stored in the matrix, mapped onto the page role, instead of a flat per-role pool.
- Enforce a narrative arc: open → orient → prove → deepen → answer objections → convert.
- Forbid two adjacent sections of the same family (no three stacked card grids), and require at least one enrichment section per page (proof, story, process, gallery, or FAQ depending on role).

### 4. Hero + order enforcement (`src/services/visualQualityEvaluation.ts`, `src/services/wizardPageQuality.ts`)

- New findings: incomplete hero, cropped/missing hero media, and section order drift from the planned order.
- These feed the existing single targeted refinement turn, so a weak page is regenerated once with a precise directive rather than shipped.

### 5. Directive updates (`supabase/functions/ai-code-assistant/prompts/designDirector.ts`)

- Add a hero completeness contract and media framing rules to the design director directive, plus explicit anti-patterns (title-only hero, image band above text, three identical grids in a row).

## Technical notes

- No new authorities or files: all changes extend `wizardGenerationBrief`, `industryMatrix`, the theme CSS emitter, the two quality evaluators, and the existing prompt directive.
- Hero archetype and section-order selection stay deterministic off the existing generation seed, so identical wizard answers still reproduce identical sites.
- Existing composition guards (Stage 4b reduction guard, presentation guard) are untouched and continue to apply.
- Verification: existing test suites for parity/brief/quality, plus new cases for hero archetype distinctness and section-order rules.
