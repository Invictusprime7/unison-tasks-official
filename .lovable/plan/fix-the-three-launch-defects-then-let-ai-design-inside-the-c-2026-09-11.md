# Fix the three launch defects, then let AI design inside the canonical pipeline

## Part A — Fix what is broken today

### 1. "Your site is ready with a few steps skipped"

Confirmed cause. The launch saves the site's form settings with an upsert keyed on
`business_id, project_id, site_id, external_id`, but the `form_definitions` table
has no unique index on those columns (only the primary key on `id`). The database
rejects that write on every launch, so every site reports the same skipped step —
nothing else about the site is actually incomplete.

Fix:

- Add a unique index on `(business_id, project_id, site_id, external_id)` so the
upsert resolves and re-launching a site updates its forms instead of duplicating.
- Keep the degradation path, but carry the real database error code in its detail
line so a future failure is diagnosable rather than generic.
- Test that a launch's planned form definitions persist with no degradation.

### 2. Sections glued to the left edge (e.g. Booking)

Two different things are mixed together in that report.

- "No centered container anywhere on this page" is a blind spot in the layout
audit, not proof of a broken page. `classNamesOnLine` in
`src/services/layoutSnapshotAudit.ts` reads only literal `className="..."`
strings, while generated pages apply their centered shell through an expression
(`className={shellClass + ' ...'}`), so real containers are invisible to it.
- "Flex row has no gap utility" is read from a literal class list and is a real
spacing defect on that row.

Fix:

- Teach the audit extractor to resolve `className={ident}` and
`className={ident + ' literal'}` against top-level string constants in the file.
- Re-run the audit across all nine industries and fix every remaining genuine hit
at the emitter (`src/sections/compositionToFileSet.ts`): every multi-track row
carries a gap token and every section body sits inside the shell.
- Test that no `uncontained-section` or `grid-without-gap` finding survives on
deterministically generated pages for any industry.

### 3. "Duplicate declaration Instagram"

Confirmed and reproduced. The preview compiler's missing-icon injector in
`src/utils/sandpackFilePrep.ts` decides "is this icon already declared?" with an
ad-hoc regex that recognises only `import`, `const`, `function` and `class`. Any
other existing binding of the same name (reproduced with `let Instagram = ...`)
is missed, a second top-level `const Instagram` is emitted, and Babel fails the
whole page.

Fix:

- Make the existing `collectTopLevelBindingNames()` helper (already handles
`let`/`var`, namespace and aliased imports) the single authority for that check.
- Add a final safety pass that drops any repeated top-level
`const X = __LucideIcons[...] || __LucideFallback;` line, so no combination of
passes can emit the same binding twice.
- Regression tests: `let`-bound, aliased, already-injected names, repeated passes.

## Part B — Bring AI back as a designer, not a writer

Two AI surfaces, one canonical pipeline. Neither ever writes VFS files directly.

### B1. Launch Wizard — AI design direction (powerful, upstream)

AI runs before the deterministic compiler and returns a **design proposal**, not  
code: industry-aware token choices (palette, type scale, rhythm, radius, elevation, typography),  
section ordering and emphasis per page, variant ranking among already-registered  
variants, motion intensity, and copy/media direction.

- The proposal is validated against the registries: every variant must already
exist, every token must be a declared token, every section must be legal for
that page role and industry.
- Anything invalid is dropped; the deterministic design plan fills the gap.
- The compiler then runs exactly as it does today — Stage 4b, preflight, seal,
`commitMutation`. AI never bypasses a stage and never authors a page body.
- If the model is slow, fails, or is switched off, the launch still ships the
deterministic site unchanged.

### B2. In-builder AI — surgical and behavioral edits

Every in-builder edit becomes a validated `PatchPlan` (the shape the commit
service already accepts), never a raw file write:

- Surgical/visual: `presentationOps` (variant swap), token edits, section reorder,
copy and media changes — all applied to snapshot state, then recompiled.
- Behavioral: `bindingOps` and `backendOps` — wiring an element to a canonical
intent, requiring a capability — never hand-written runtime code.
- Escape hatch: a genuine code edit is allowed only as a scoped `fileOps` patch on
a page body, run through the same syntax gate, preflight and seal as a launch,
with the prior revision kept for one-click rollback.
- Everything lands through `commitMutation`, so Live Preview, the snapshot and the
saved revision can never diverge — the preview stays a projection of the sealed
site, never a separate truth.
- Rejected by contract: writing `/src/App.tsx`, the router, `index.css` outside
token ops, inventing components or intents, changing site topology silently.

### Rollout order

1. Part A fixes (they are blocking every launch today).
2. B2 in-builder patch contract — smallest surface, immediate designer value.
3. B1 wizard design proposal — the richer, industry-aware design intelligence.

## Technical notes

- Files touched in Part A: a migration for the unique index,
`src/services/launchFormDefinitionPersistence.ts`,
`src/services/layoutSnapshotAudit.ts`, `src/sections/compositionToFileSet.ts`,
`src/utils/sandpackFilePrep.ts`, plus tests under `src/test/`.
- Part B reuses existing authorities: `PatchPlan`/`VFSCommitService` for writes,
`designImplementationRegistry` + `artDirectionPacks` + `industryMatrix` for what
AI is allowed to choose, and the existing preflight/seal gates for acceptance.
- No new parallel pipeline, no new registry, no AI-authored VFS writes.