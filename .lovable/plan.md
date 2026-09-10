# Make art-pack variants and their styles reach the live preview

Yes — your instinct is right, and I found the exact gap. Right now the design
choices a style pack makes are decided during generation, but most of them never
get written into the files the preview actually runs, so every page falls back to
one generic look. That is why About, Services and Contact all render the same
hero.

## What is actually wired today

- Stylesheet writes: correct. The themed stylesheet plus the shared style bridge
  are written and enforced. (One real bug was that the final compile step could
  wipe the whole file set in place — already fixed this session.)
- Section variants: only the **gallery** family is compiled into the preview.
  Five gallery layouts are marked portable; every other family (hero, services,
  features, about, testimonials, pricing, cta, contact, footer, faq, stats, team,
  navbar) ships a single hand-written component that ignores the chosen variant.
- Result: the pack picks `hero:full-bleed` or `about:story-panel`, the choice is
  recorded in the page data, and the preview still renders the one generic hero.

## The fix, in the systems already in place

No new authority, no parallel pipeline. The gallery path is already the correct
pattern — extend it to the rest.

1. **Mark the remaining registered variants portable.** Each variant entry in the
   variant registry gains the same `vfs: { mode: 'portable-recipe' }` marker
   gallery already uses.
2. **Compile them with the existing recipe builder.** The build script already
   walks the registry generically, bundles each family, and certifies that every
   dependency is an approved preview module. Regenerating produces one recipe
   module per family instead of only gallery.
3. **Emit one recipe module per family used by a page.** The compiler already
   does this for gallery; make it loop over the families present on the page.
4. **Resolve by variant id in every family component.** Each emitted family
   component looks up the chosen variant and falls back to today's generic
   layout if a variant is unavailable — same shape as the gallery component, so
   nothing can regress into a blank section.
5. **Prove it.** A compile guard asserts that for every page, each section's
   chosen variant resolves to a real module in the written file set, and that the
   themed stylesheet plus style bridge survive to the end of compilation. Any
   unresolved variant fails the build instead of silently downgrading.
6. **Cross-page check.** Extend the existing industry composition tests so two
   pages of the same generated site never resolve to the same hero variant.

## Technical notes

- Files touched: `src/sections/variants/registry.ts` (markers),
  `scripts/build-stylex-recipes.mjs` (only if per-family certification needs
  widening), `src/sections/recipes/stylexRecipes.generated.json` (regenerated),
  `src/sections/compositionToFileSet.ts` (per-family emission + variant-aware
  family components), plus tests.
- Certification is strict: the builder throws on any dependency outside React,
  the approved icon module and approved Radix primitives. Some variants may need
  small import adjustments to pass — those are the only component edits.
- Any variant that cannot be certified stays on the current generic renderer and
  is reported, rather than being force-shipped.

## Expected outcome

Each generated page renders the layout its style pack actually chose, interior
pages stop cloning the home hero, and the preview shows the same composition the
snapshot recorded.
