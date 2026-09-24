# Business vertical coverage execution

Target: working domain flows for salons/spas/studios, restaurants/cafes,
retail/e-commerce, contractors/home services, coaches/consultants,
nonprofits/foundations, creative/digital agencies, and local services.

## Wave 1: visual proof readiness

The five requested gallery/comparison variants already exist as portable
recipes. They are not yet approved for generation. Approval requires reviewed
source provenance, license evidence and interaction/render verification; adding
an approval flag alone does not establish equivalence.

Implemented in the first batch:

- Gallery category selection recovers when content removes the selected
  category or filtering is disabled. Switching categories closes the lightbox.
- Gallery captions appear on keyboard focus as well as hover.
- Comparison slider supports pointer dragging, a visible keyboard range input,
  percentage announcements and selection between supplied projects.
- Incomplete image pairs are excluded from the slider.
- Interaction tests cover all three requested gallery variants, filtered
  lightbox selection, changed content and comparison project selection.
- Portable recipes rebuilt from their component owners.

Still required: source/license review for all five variants, certification,
pack wiring, and deterministic generation journeys. Existing gallery source records include an editorial
reference; the existing reveal-panel reference explicitly does not assert a
copied-source license. Neither is sufficient to invent verified licenses for
these five variants.

## Remaining sequence

1. Complete Wave 1 verification and promotion.
2. Restaurant menu: categorized courses, dietary tags and currency-aware prices.
3. Booking: service/duration selection, availability and conflict-safe creation;
   include restaurant party size and coaching free/paid session distinctions.
4. Donations: amounts, currency, recurring frequency and real payment handoff.
5. Contractor quotes: structured service scope, size, budget and contact fields.
6. Retail: catalog filters, persisted cart, drawer and checkout closure.
7. Agency case study inspection and proposal capture; local services operating
   hours, map and dispatch contact. These verticals need explicit acceptance
   journeys even though the supplied coverage matrix omits local services.
8. Remaining common variants: review and promote features, testimonials, team,
   pricing and about variants against the live equivalence ledger.
9. Pack/dialect wiring and all eight industry compile/render/intent journeys.

## Ownership and acceptance

- `src/sections/variants/registry.ts` owns source and certification metadata.
  `resolvedImplementationContract.ts` derives it; do not add another registry.
- Keep theme tokens, deterministic design seeds and portable recipe generation.
- Business actions use existing canonical intent owners. Gallery inspection and
  comparison controls remain local presentation state, without fabricated
  booking, donation or contact actions.
- No standalone hook files or runtime source-provider dependencies.
- Do not describe metadata counts as completed business flows. Each vertical
  needs its actual action, error handling and runtime integration verified.
- Preserve the pre-pull stash; this work starts from `db4192c7`.

## First-batch validation

TypeScript build checking and targeted ESLint passed. The full suite reported
2,225 passing tests, one skipped and one failing source-review hash test before
the additional pointer-drag regression test was added. All nine reviewed source
files match their stored hashes after CRLF-to-LF normalization; raw Windows
checkout bytes fail the existing hash assertion. No review hashes or
certification rules were changed in that batch.

## Browser verification and follow-up fixes

- Added an opt-in fixture exporter that renders the actual portable recipes and
  generated UI facades, plus a repeatable browser verification script.
- Corrected the shared alpha-color helper to use CSS slash syntax with the
  space-separated HSL theme tokens. Previously the browser ignored these
  backgrounds and borders, including the lightbox backdrop.
- Gallery captions now have an opaque theme surface on focus/hover; lightboxes
  expose the category and announce the current image position.
- The before/after grid excludes incomplete pairs, matching the slider.
- Added `.gitattributes` to preserve LF component bytes across operating
  systems. All nine reviewed component hashes match unchanged. No certification
  assertions or stored hashes were relaxed.
- Full suite: 2,231 passed, 2 skipped. TypeScript and targeted ESLint pass.
- Browser verification: all 38 checks passed across the five exported variants
  at desktop/mobile sizes, including gallery focus restoration, navigation,
  category filters, portrait fitting, slider keyboard control and reduced motion.

Reproduce the portable browser fixtures and checks in separate terminals:

```powershell
npm run recipes:build
$env:VISUAL_PROOF_ARTIFACTS = '1'
npx vitest run src/test/visualProofFixture.test.ts
npx vite --config scripts/composition-browser.config.mjs
```

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/verify-visual-proof-browser.ps1
```

Screenshots and the per-interaction report are written under
`.artifacts/composition/visual-proof/`. Fixtures use local SVG test images so
network availability does not mask layout or interaction failures. This checks
the exported recipes directly; it does not claim the currently ineligible
variants are selected by the production generation pipeline.

The comparison source and author registry response are quarantined under
`src/design/21st-intake/quarantine/visual-proof-compare/`, with a source hash and
explicit pending review steps. No candidate was promoted solely by attaching
source metadata. The remaining work is source adaptation/certification followed
by pack eligibility and industry compilation checks.
