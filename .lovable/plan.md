# V5 Wizard Design Selection and Render Integrity

## Goal
Expose Unison’s existing certified 21st design inventory as coherent, deterministic Wizard choices while preventing invalid component imports from reaching Preview. Keep Variant Registry, Art Direction Packs, Experience capabilities, Stage 4b, SiteBundleSnapshot, and `commitMutation` as the existing authorities.

## Current-state reconciliation
- Preserve completed foundations: certified portable recipes, component-state contracts, bounded Wizard Registry Context, artifact/asset-slot projection, homepage-first inheritance, immersive capability gates, Property Inspector, runtime package allow-list, and persisted publish parity.
- Close the verified remaining defects first: pack resolution currently falls back globally, `buildActiveVariants()` still uses richest-only scoring, and the Art Direction coverage test resolves a fallback pack instead of testing the iterated pack.
- Add the missing Wizard-facing design contract and renderable import validation without adding a registry, VFS writer, theme engine, or preview fallback.

## Phase 1 — Strict certified Art Direction resolution
1. Make fresh-generation variant lookup return only certified, preferred, portable 21st implementations declared by the selected pack.
2. Remove generic visual IDs from active fresh-generation pack pools while retaining registered legacy IDs for saved-project compatibility.
3. Remove pack-to-global fallback. Treat missing required family coverage as an explicit incomplete-pack result.
4. Repair coverage tests to validate each actual pack across required page roles and section families.
5. In Auto mode only, deterministically choose another complete compatible pack; an explicitly selected unavailable direction remains unavailable rather than silently changing.

## Phase 2 — Deterministic diversity and precedence
1. Replace Radix-count/richest-only filtering with deterministic selection using pack, page role, section type, experience preference, state requirements, available assets, adjacency diversity, and seed.
2. Add the canonical `WizardDesignSelection` value:
   - mode: auto, guided, or custom
   - optional Art Direction Pack
   - standard, motion-rich, or immersive experience
   - optional page-role/section/variant pins
3. Enforce one precedence policy everywhere: user pin > selected direction > accepted AI choice > seeded deterministic choice.
4. Persist the exact selection through Wizard selections, seed, Design Intervention, orchestrator input, snapshot metadata, Builder hydration, recommit, and publish.

## Phase 3 — Registry-derived Wizard Design stage
1. Upgrade the current Style step to Theme, Visual Direction, Experience, and optional Customize Sections controls.
2. Derive direction cards, thumbnails, certified counts, motion/media/type posture, capability status, and availability from existing registries and topology coverage.
3. Derive section choices from the selected pack, page role, experience preference, and certified registry entries; never hard-code a parallel catalog.
4. Hide or disable directions that cannot cover the selected topology and explain availability in user-facing terms.

## Phase 4 — AI context and constraint parity
1. Derive visual signatures from certified implementation metadata: geometry, media dominance, typography scale, density, motion, composition, and experience level.
2. Project signatures, component states, artifact/slot contracts, assets, selected direction, experience preference, and pins through the existing Wizard Registry Context.
3. Give the same bounded selection contract to wizard-site-composer and Lane B.
4. Normalize or reject AI output that changes a pin, leaves the selected pack, chooses a legacy/unapproved implementation, or requests an unapproved capability/dependency.

## Phase 5 — Renderable Component Import Gate
1. Extend canonical preflight with TSX import/export binding validation before any Lane B page replaces its Stage 4b page.
2. Validate named, default, namespace/member-expression, generated UI facade, local companion-module, and approved package imports against the exact candidate VFS and generated manifest.
3. Ignore lowercase intrinsic elements and return structured file/symbol/import diagnostics.
4. On failure, reject only the affected candidate page, retain its deterministic Stage 4b source, continue launch with a visible degradation note, and never enable the runtime React monkey patch.

## Phase 6 — Verification and rollout
1. Add the V5 matrix: strict pack coverage, no generic/global fallback, Auto/Guided/Custom, pinned Hero/Services, experience filtering, deterministic replay and legal seed diversity, AI pin/pack enforcement, and import/export mismatch rejection.
2. Add snapshot/reload tests proving selected direction, experience, pins, implementation IDs, and seed survive Builder continuation and publish.
3. Run the relevant launch, registry, composition, Lane B, preflight, VFS commit, preview, and publish suites; then run the repository test command and inspect preview diagnostics.
4. Perform authenticated Wizard launches for representative service, commerce, editorial, and immersive sites; verify all routes in desktop and mobile Preview, including reduced-motion and no-WebGL fallbacks.

## Technical constraints
- No new registry or parallel design state.
- Theme controls tokens through Stage 4b; Art Direction controls certified implementation pools; Experience controls runtime capability posture.
- Page Registry and topology remain route authorities; `/src/App.tsx` remains deterministic.
- AI never writes canonical VFS directly and cannot replace user-pinned implementations.
- Saved legacy implementations remain readable but are excluded from fresh generation.
- A failed AI composition or enrichment never makes launch unavailable; the validated deterministic page remains authoritative.

## Completion criteria
- A designer can choose a theme, a topology-compatible visual direction, an experience level, and optional section implementations from real registry thumbnails.
- The same selections and seed reproduce the same legal implementation identities; alternate seeds create meaningful legal variation.
- Every automatic section stays within the selected certified pack, and every user pin survives AI, compile, snapshot, Builder edits, reload, Preview, and publish.
- No candidate with an unresolved or mismatched JSX component export can enter canonical VFS or crash Preview.
