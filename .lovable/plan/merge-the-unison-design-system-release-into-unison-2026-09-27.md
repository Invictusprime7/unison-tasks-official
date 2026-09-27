# Merge the Unison Design System release into Unison

## What the upload is
The ZIP is not a copy of this project. It's the **Unison Design System** project, built on a different app setup (TanStack Start, Vite 8). Its own sync guide says it is a "portable release" that ships changes back here file by file, not as a full copy. So copying it in wholesale would replace this app's structure, which we won't do.

The expected update package (`unison-upstream-2026-09-26_v2.patch`) isn't in the ZIP, so the merge follows the file map in its sync guide.

## What changed there (measured)
- Design registry: 2,499 lines there vs 2,036 here, about 1,100 changed lines.
- Art-direction packs: about 400 changed lines. Page archetypes and shared types: small changes.
- Design seed: identical, so the deterministic compiler is unaffected.
- 175 design files: 24 new designs (17 wave-1 originals, background layer, sign-in, sign-up, data table, dashboard overview) and 81 repaired designs.
- Review wall, certification evidence and `unison-*` scripts, which only exist there.

## Merge steps
1. **Designs:** copy new and repaired design files from `design-system/unison/components/<family>/` into `src/sections/variants/<family>/`, rewriting import paths to this project's layout.
2. **Contracts:** merge the registry, art-direction packs, page archetypes, component states, industry vocabulary and types by combining both sides. Keep this project's recent work: design families, sealed art direction, pack completeness, render hash and exemption audit.
3. **Certification evidence:** bring in `evidence.json` and `variants/public.ts`.
4. **Keep out:** the separate app setup, including its routes, router, `styles.css`, `wrangler.jsonc`, `vite.config.ts`, `package.json`/lockfile, mockup plugin and showcase. These belong only to the design-system project.
5. **Policy check:** the release accepts Unison-authored designs as well as 21st-sourced ones. This conflicts with the current "21st equivalence" rule in project memory, so the plan keeps the 21st-only filter unless you approve the change.
6. **Verify:** typecheck, the full test suite, the pack-completeness check and one Wizard launch.

## Technical notes
- A merged-in design only becomes a Wizard choice if it's registered, certified and has a portable recipe. Unchanged seeds will still build the same sites until the new designs rank higher.
- If a design depends on a package this project doesn't have, the package gets added rather than the design being removed.
