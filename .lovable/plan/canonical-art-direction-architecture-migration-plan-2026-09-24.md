# Canonical Art Direction Architecture — Migration Plan

The six style choices (Modern, Bold, Editorial, Minimalist, Futuristic, Organic) become Art Direction Families, each owning several versioned packs. The rule is saved to project memory. Migration is additive; nothing legacy is removed until the Erasure Gate passes.

## Where we are today
- Wizard Style Card writes `themePresetId` (6 values); Stage 4b turns it into tokens.
- 15 flat art-direction packs exist (`editorial-noir`, `noir-atelier`, `swiss-grid`…), loosely tied to presets through a signature lookup — not parented to a family.
- `WizardDesignIntervention` independently picks layout recipe, variants, motion, interactions and AI directive.
- `themePresetId` is read in ~111 files — no rename.

## Phase A — Families and pack hierarchy (steps 1–4)
- New `artDirectionFamilies.ts`: six families with broad tendencies (typography character, contrast, spacing, geometry, media, motion, surface, density) — references only.
- Pack ids become `family.slug` + `packVersion`. The 15 existing packs are re-parented as children (e.g. `editorial-noir` → `editorial.noir`, `noir-atelier` → `editorial.atelier` or `bold.atelier`, `swiss-grid` → `minimalist.swiss`, `neon-grid` → `futuristic.neon`, `organic-studio` → `organic.studio`). Old ids kept as aliases so saved sites still open.
- Every family gets at least two packs; missing ones are filled from existing certified variants only.
- Docs, Wizard labels and Unison Docs stop calling them "presets".

## Phase B — Resolver (step 5)
- `resolveArtDirection(selections, registry)` → `ResolvedArtDirection` {version, familyId, packId, packVersion, compositionRecipeIds, activeVariants, portableRecipeIds, motion/media/interaction/tokenProfileId, aiDirective}.
- Deterministic from family, industry, model, template, goals, capabilities, pages, registry availability and the design seed (never wizardSeedId). Optional explicit pack pin for advanced users.
- `WizardDesignIntervention` becomes a derived projection of this object (no separate decision logic).

## Phase C — Pack Completeness gate (steps 6–8)
- Validator: every applicable surface (navbar, hero, proof, services/features, gallery, products, testimonials, pricing, faq, form, cta, footer) resolves to a variant proven for registry, export/import, VFS, preview, responsive, WYSIWYG address, AI edit scope, portable recipe, a11y, snapshot, rehydration.
- Incomplete packs are non-canonical and never chosen; CI test fails if any canonical pack regresses.
- Continues Wave 1–3 certification so every family reaches completeness.

## Phase D — Pipeline injection and sealing (steps 9–10)
- Order enforced: capability contract → family → pack → vocabulary → Lane A → Lane B → convergence → Stage 4b → seal.
- Lane B brief (client + wizard-site-composer + ai-code-assistant, byte-identical) receives the resolved art direction; Lane B cannot change family.
- Stage 4b projects tokens from the family/tokenProfile; `meta.artDirection` sealed in SiteBundleSnapshot and included in renderHash.

## Phase E — Consumer migration and parity (steps 11–12)
- Preview, Builder, Playground, Property Inspector, AI Builder, autosave, recompile, publish read `meta.artDirection` only.
- End-to-end parity tests per family across all consumers.

## Phase F — Legacy erasure (steps 13–14)
- Only after the Erasure Gate: delete flat-pack selection, preset-signature lookup and any parallel design-selection path; aliases retained for saved revisions only.

## Technical notes
- No new registry/VFS writer/theme engine — extends `artDirectionPacks.ts`, `wizardDesignIntervention.ts`, `canonicalPipeline.ts`, `siteDesignContract.ts`.
- Edge mirrors redeployed after Phase D.
- README and Unison Docs refreshed per the readme rule once Phase B lands.

Suggested first delivery: Phases A + B in one pass.
