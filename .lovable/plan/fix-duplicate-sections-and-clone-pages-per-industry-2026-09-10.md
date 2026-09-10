# Fix duplicate sections and clone pages per industry

## What I found (yes, this is real fragmentation — and yes, these milestones fix it)

The art packs, registries and design contract work from last week **are** wired.
The breakage is one layer below them, in how a sub-page's section list is built.

Today, only the **salon** template declares real per-page compositions
(`pageCompositions`). Every other industry — portfolio included — falls into a
generic fallback in `src/utils/topologyVFSScaffolder.ts` → `buildRoleComposition`:

```text
Home template sections  ──filter by role-generic type pool──►  sub-page
                        ──append more of the same to hit a floor──►  duplicates
```

Three concrete defects follow from that:

1. **Duplicate sections.** The filter keeps *every* home section whose type is
   allowed, then the "minimum body sections" supplementer appends more from the
   same pool. A portfolio /work page ends up with gallery + gallery (+ gallery).
2. **Every page looks like Home.** Sub-pages reuse Home's section instances and
   Home's variants; only the hero copy is swapped to "Explore work from …".
3. **Industry blindness.** `DEFAULT_ROLE_SECTION_POOL` and
   `ROLE_SUPPLEMENT_PRIORITY` are keyed by page role only. The industry's own
   `expectedSections` (already in `industryMatrix.ts`) is used *only to sort*,
   never to select.

Variant choice is also site-wide: `applyDesignVariants` clamps each section type
to one pack-preferred variant for the whole site, so the same section type
renders identically on every page.

## Milestones

### M1 — Section selection becomes declarative, per page
- In `buildRoleComposition`, when a `SiteConfiguration` page entry exists, its
  `sections` array becomes the **selection authority**, not a sort key: emit one
  section per declared entry, in declared order.
- Map each declared type to a source section by rotating through the available
  sources of that type (page-seeded), so a repeated type never renders the same
  instance twice.
- Collapse accidental repeats: no two adjacent sections of the same type, and a
  hard cap of one instance per type per page unless the contract declares more.
- Only supplement to the depth floor from types **not already on the page**,
  drawn from the industry's role pool — never by re-adding an existing section.

### M2 — Industry-aware role pools and narrative orders
- Move role pools and supplement priorities out of the scaffolder and derive
  them from `industryMatrix.ts` (per industry × per page role), with the
  existing generic table kept only as the last-resort `custom` path.
- Give each of the nine first-class industries explicit sub-page section
  contracts (portfolio /work is a gallery-led narrative, not a home clone).

### M3 — Per-page variant diversification inside the art pack
- Extend the design intervention so variant resolution is seeded by
  `(wizardSeed, pageId, sectionType, occurrence)` instead of site-wide.
- Selection stays clamped to the sealed Art Direction Pack's compatible family,
  so pages differ from each other while the site stays visually cohesive.
- Add an anti-repetition pass: the same variant id may not lead two pages.

### M4 — Hero provisioning per page role
- Replace the "first variant whose `pageRoles` includes this role" lookup with a
  role + industry hero archetype resolution (home = full-bleed/statement,
  interior pages = page-intro / split / editorial), seeded per page.
- Drop the placeholder copy ("Explore work from …") in favour of the route
  brief's hero contract; if the page contract declares no hero, do not inject one.

### M5 — Expand the variant inventory
- Add variants where diversification currently has nothing to choose from:
  gallery already has 6; services (3), about, testimonials, cta, features, faq
  need 2–4 each so M3 has genuine range per industry.

### M6 — Guardrails so this cannot regress
- Composition validator: reject a compiled page with duplicate section types
  beyond its contract, or with a section set matching Home's by more than a
  threshold.
- Tests: portfolio (and each of the nine industries) generates pages whose
  section sets and hero variants are distinct from Home and from each other.

## Sequencing
M1 + M2 fix the reported portfolio breakage. M3 + M4 remove the "every page
looks the same" feel. M5 gives the system range. M6 locks it in.

## Technical notes
- Files touched: `src/utils/topologyVFSScaffolder.ts`,
  `src/platform/core/industryMatrix.ts`, `src/platform/core/resolvedComposition.ts`,
  `src/sections/compositionToFileSet.ts`, `src/services/wizardDesignIntervention.ts`,
  `src/sections/variants/*`, plus tests under `src/test/`.
- No new authorities: selection stays in `SiteConfiguration`, art direction stays
  in `artDirectionPacks.ts`, variant lookup stays behind
  `designImplementationRegistry.ts`.
- Everything remains deterministic from the wizard seed.
