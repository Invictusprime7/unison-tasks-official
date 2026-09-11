# Fix the three launch defects: skipped-steps notice, left-glued sections, duplicate icon crash

## 1. "Your site is ready with a few steps skipped"

Confirmed cause. The launch saves the site's form settings with an upsert that
keys on `business_id, project_id, site_id, external_id`, but the `form_definitions`
table has no unique index on those columns (only the primary key on `id`). The
database rejects that write every single time, so every launch reports the same
skipped step — nothing else is actually wrong with the site.

Fix:
- Add a unique index on `(business_id, project_id, site_id, external_id)` in
  `public.form_definitions` via migration, so the upsert resolves and re-launching
  the same site updates rather than duplicates its forms.
- Keep the degradation path, but make its detail line carry the real database
  error code so a future failure is diagnosable instead of generic.
- Add a test that the planned form definitions persist without degradation.

## 2. Sections glued to the left edge (e.g. Booking)

Two separate things are mixed together here.

- The "No centered container anywhere on this page" finding is a blind spot in
  the layout audit, not proof of a broken page. `classNamesOnLine` in
  `src/services/layoutSnapshotAudit.ts` only reads literal `className="..."`
  strings, while the generated pages apply their centered shell through an
  expression (`className={shellClass + ' ...'}`). So real containers are invisible
  to the audit and get reported as missing.
- The "Flex row has no gap utility" finding is read from a literal class list and
  is a real spacing defect on that row.

Fix:
- Teach the audit extractor to resolve `className={ident}` and
  `className={ident + ' literal'}` by looking up top-level string constants in the
  same file, so container and gap detection see the full class list.
- Re-run the audit across all nine industries and fix every remaining genuine hit
  at the emitter (`src/sections/compositionToFileSet.ts`) — every multi-track flex
  or grid row gets a gap token and every section body sits inside the shell.
- Add a test asserting no `uncontained-section` or `grid-without-gap` findings on
  deterministically generated pages for every industry.

## 3. "Duplicate declaration Instagram"

Confirmed and reproduced. The preview compiler's missing-icon injector in
`src/utils/sandpackFilePrep.ts` decides whether an icon is already declared with
an ad-hoc regex that only recognises `import`, `const`, `function` and `class`.
Any other existing binding of the same name (for example `let Instagram = ...`)
is missed, so it emits a second top-level `const Instagram = ...` and Babel fails
the whole page with "Duplicate declaration".

Fix:
- Use the existing `collectTopLevelBindingNames()` helper (which already handles
  `let`/`var`, namespace and aliased imports) as the single authority for the
  injector's "already declared" check.
- Add a final safety pass that drops any repeated top-level
  `const X = __LucideIcons[...] || __LucideFallback;` line, so no combination of
  passes can ever emit the same binding twice.
- Regression tests covering `let`-bound, aliased, and already-injected icon names,
  plus repeated preparation passes over the same file.

## Technical notes

- Files touched: a new Supabase migration for the unique index,
  `src/services/launchFormDefinitionPersistence.ts` (error detail),
  `src/services/layoutSnapshotAudit.ts` (class extraction),
  `src/sections/compositionToFileSet.ts` (only rows with real spacing gaps),
  `src/utils/sandpackFilePrep.ts` (icon binding authority + dedupe pass), and
  tests under `src/test/`.
- No change to the canonical path: LauncherWizard → launchOrchestrator →
  canonical compiler → Stage 4b → preflight → sealed snapshot → commitMutation.
- No AI is added to the pipeline by this work.
