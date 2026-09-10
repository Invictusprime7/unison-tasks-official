# Getting variants into the preview first, AI back in after

## Direct answer on AI

Not yet. The guidebook puts optional AI enrichment last (Phase 11) and its entry
condition is that the earlier phases are complete: the site must already be
premium, executable, committed, previewed and editable **without** AI. Right now
the first of those phases — the one where every section family compiles into the
preview — is still open. Only the gallery family is closed; the other sixteen are
not. Bringing AI back before that is how the pipeline became fragmented last
time: AI would be papering over a compiler that cannot yet render what the design
system chose.

So the order is: close the compiler gap, prove the site is complete with AI
switched off, then reintroduce AI as a constrained proposer.

## What is actually broken today

- Stylesheet writes: correct. The themed stylesheet and the shared style bridge
  are written and enforced. One real bug — the final compile step wiping the file
  set in place — is already fixed this session.
- Section variants: only the **gallery** family is compiled into the preview.
  Five gallery layouts are marked portable; hero, services, features, about,
  testimonials, pricing, cta, contact, footer, faq, stats, team and navbar each
  ship one hand-written component that ignores the chosen variant.
- Result: the style pack picks `hero:full-bleed` or `about:story-panel`, the
  choice is recorded in the page data, and the preview still renders one generic
  hero. That is exactly what your three screenshots show.

## Step 1 — Close the compiler gap (unblocks everything else)

The gallery path is already the correct pattern. Extend it, no new authority.

1. Mark the remaining registered variants portable with the same marker gallery
   uses.
2. Regenerate the recipe bundle with the existing build script — it already walks
   the registry generically and certifies every dependency.
3. Emit one recipe module per family present on a page, instead of gallery only.
4. Each emitted family component resolves the chosen variant and falls back to
   today's generic layout if one is unavailable, so nothing can go blank.
5. Guard it: for every page, each section's chosen variant must resolve to a real
   module in the written files, and the themed stylesheet plus style bridge must
   survive to the end of compilation. Unresolved variants fail the build.
6. Extend the industry composition tests so two pages of one site never resolve
   to the same hero variant.

## Step 2 — Certify the site with AI switched off

Generate across several seeds and industries with no model in the loop and
confirm every route renders complete: no blank canvas, no placeholder, no missing
import, no fallback authoring, coherent on mobile. This is the gate the guidebook
requires before AI may re-enter.

## Step 3 — Reintroduce AI, constrained

AI comes back as a proposer, never an author:

- Allowed: copy, media choices, SEO, ranking among already-legal variants,
  supported layout props.
- Denied: writing files, replacing page source, changing site structure,
  overriding theme tokens, inventing components.
- Placement: after the deterministic site is built, before the final save — a
  proposal that is validated, applied to structured state, recompiled, and only
  then committed.
- Failure is harmless: if the model times out or proposes anything invalid, the
  proposal is discarded and the deterministic site ships unchanged.

## Technical notes

- Step 1 files: `src/sections/variants/registry.ts` (portability markers),
  `src/sections/recipes/stylexRecipes.generated.json` (regenerated via
  `scripts/build-stylex-recipes.mjs`), `src/sections/compositionToFileSet.ts`
  (per-family emission plus variant-aware family components), tests.
- Certification in the recipe builder is strict — only React, the approved icon
  module and approved Radix primitives. Some variants may need small import
  adjustments to pass; any variant that cannot be certified stays on the current
  generic renderer and is reported rather than force-shipped.
- Step 3 maps to the guidebook's enrichment envelope, its permission model and
  its validator chain; no AI route is connected to the launcher until that chain
  exists.

## Expected outcome

Each generated page renders the layout its style pack actually chose, interior
pages stop cloning the home hero, and AI returns later on top of a system that is
already correct without it.
