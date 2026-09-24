# Unison Affinity — the deterministic design compiler

**Status:** canonical. **Audience:** internal maintainers only. This document is the authority
on how Unison turns a business brief into a reproducible site, and on how a newly registered
implementation reaches a real launch.

Unison Affinity is not a generator. It is a **compiler**: the same business answers against the
same codebase compile to the same site, byte for byte, on every launch. Variation comes from the
answers and from an explicit regeneration request — never from ambient randomness.

---

## 1. The two identities

Every launch carries two separate identifiers. Conflating them is the classic regression.

| Identifier          | Owns                                                                      | May influence design |
| ------------------- | ------------------------------------------------------------------------- | -------------------- |
| `wizardSeedId`      | Launch identity: telemetry, run correlation, draft/run records            | **Never**            |
| `regenerationNonce` | The user's explicit "regenerate the look" request                          | Yes — the only nonce |

`src/platform/core/generationSeed.ts` exposes `deriveDesignSeed(input)`. It folds only meaningful
business inputs into the design seed:

```
businessName, businessModel, industry, templateId, themePresetId,
primaryGoal, secondaryGoals, requestedPages, projectId, regenerationNonce
```

List-shaped answers are order-insensitive (the seed is computed over a stable, sorted
serialisation), so reordering goal or page selections does not silently produce a different site.
`deriveDesignSeed` wraps `deriveGenerationSeed` with `launchNonce = regenerationNonce ?? null`.

**Invariant:** no call site may pass `wizardSeedId` as a launch nonce, and
`src/utils/designVariation.ts` may never call `Math.random()`. Both are guarded by
`src/test/designSeedDeterminism.test.ts` and `src/test/renderHashAndSeedStability.test.ts`.

Consumers: `wizardDesignIntervention.ts` (active variants, card/form geometry),
`launchOrchestrator.ts` (experience envelope seed), `canonicalPipeline.ts` (snapshot assembly).

---

## 2. The render fingerprint

`computeRenderHash(parts)` returns `rh_<8 hex>` (FNV-1a over a stable, sorted serialisation).
`canonicalPipeline.ts` stamps it into `SiteBundleSnapshot.meta.renderHash` from:

```
seed, industry, templateId, themePresetId, artDirectionPackId,
layoutRecipe, motionRecipes, experienceBudget, activeVariants,
pages (id:slug:role, sorted), routes (sorted)
```

The hash is key-order independent. It answers three operational questions without re-running a
launch: *did this revision actually change the design?*, *is the published revision the accepted
one?*, and *did two launches with the same answers really converge?* It is a fingerprint, not a
security primitive — pair it with the revision id, never with authorisation.

`designPlanSignature` (from `src/utils/designVariation.ts`) is stamped alongside it and describes
the plan; `renderHash` describes the compiled result. Keep both.

---

## 3. How a new implementation reaches a launch

Determinism must not mean a frozen catalogue. A newly adapted implementation becomes reachable
through four ordered tiers. Each tier is a real gate — skipping one means the implementation is
invisible to fresh compiles regardless of how good it is.

### Tier 1 — Registration and certification

Registered in `src/sections/variants/registry.ts` and resolvable through
`src/platform/core/resolvedImplementationContract.ts` with: section family, eligible page roles,
provenance (source, author, licence, adaptation record), interaction tags, dependencies, and a
portable recipe. `isCertifiedImplementation` requires a portable recipe **and**
`certification: 'approved'`.

`resolveLegalImplementation(id, usage)` is the only legal resolver:

- `fresh-generation` / `ai-edit` — certified, non-legacy ids only; anything else is refused with a reason.
- `saved-revision` — historical ids stay readable so old projects reopen.
- `migration` — resolves through `LEGACY_IMPLEMENTATION_ALIASES` (empty until a replacement is proven).

Uncertified work is therefore inert, not dangerous.

### Tier 2 — Art direction pack membership

Packs are children of six canonical **Art Direction Families** (modern, bold,
editorial, minimalist, futuristic, organic — `artDirectionFamilies.ts`).
`themePresetId` is a legacy alias equal to the family id. A pack is only legal
if it passes the completeness gate (`packCompleteness.ts`: every required
section kind has a certified, preview/builder/publish-ready variant). The
resolved family+pack is sealed into the snapshot (`snapshotSeal.ts`) and every
consumer reads it back via the sealed reader — never re-derived. Fallback
stays inside the family before leaving it.

`src/sections/variants/artDirectionPacks.ts` holds ordered per-family candidate arrays. Packs
state **order, not invention**: every entry must already be certified. Head position is the pack's
primary candidate. An implementation absent from every pack will never be chosen by a fresh
compile; it remains available to explicit compositions and inspector edits.

`ArtDirectionPackId` is a literal union enumerated across ~20 files — adding a pack is a
cross-file change. Prefer re-ordering or extending an existing pack.

### Tier 3 — Composition affinity

`src/sections/compositionAffinity.ts#selectAffineVariant` ranks the legal candidates by derived
coherence: art-direction rank, industry dialect families and discouraged traits, page-role
declaration, provenance quality, authored neighbour weights, and the composition baseline. It
keeps the top band (tolerance `0.12`, always retaining at least the runner-up so two seeds in one
industry still read as two sites) and lets the deterministic seed break the tie.

**Affinity guides selection only.** Certification, pack membership, role eligibility and
dependency satisfaction remain the sole hard gates. A better-scoring registered implementation
deterministically displaces the previous choice on the next compile — this is the intended
upgrade path, and it is exactly why the render hash exists.

### Tier 4 — Reaching the user

1. **Fresh compile** — highest-affinity legal candidate auto-selects.
2. **Wizard pins** — Guided/Custom picks override seeded defaults.
3. **Regenerate** — a new `regenerationNonce` shifts the seed within the top band.
4. **Builder** — `listLegalImplementations()` feeds the Property Inspector; `setVariant` and the
   site-wide `setFamilyVariant` op write the choice into the sealed snapshot.

---

## 4. Design authority chain

```
wizard answers
  → deriveDesignSeed
  → industry creative profile  (industryCreativeVocabulary.ts)
  → page archetype contract    (pageArchetypeContract.ts, mirrored at the edge)
  → art direction pack         (artDirectionPacks.ts)
  → compiled SiteDesignContract(siteDesignContract.ts)
  → composition affinity       (compositionAffinity.ts)
  → resolved implementations   (resolvedImplementationContract.ts)
  → snapshot + renderHash      (canonicalPipeline.ts)
```

Every edge mirror (`supabase/functions/_shared/*`) must stay byte-for-byte identical to its client
source; drift is caught by the mirror tests and shows up in production as a 400 from the
composition service.

---

## 5. Non-negotiables

- No new registry, VFS writer, theme engine, AI mutation path, router authority, snapshot type or
  preview runtime. Extend and close what exists.
- No `Math.random()`, `Date.now()` or environment entropy in any design decision path.
- No fabricated provenance. If no suitable source exists, adapt a genuinely similar registered
  source — never invent an attribution.
- Determinism is proven by tests, not by intention: any new design input must appear in the seed
  or in the render hash, and must arrive with a stability test.

## 6. Public communication boundary

This document, the scoring weights, the hashing internals, the prompt bodies, the negative
vocabulary dictionaries, the VFS exemption baseline and the database internals are **internal
only**.

Externally — README, marketing, decks — describe the *guarantees*, never the recipes, and refer to
the component catalogue as Unison's **curated, production-certified design registry**. Do not
name upstream registries as a branding claim: it invites a "thin wrapper" misreading, hands
competitors the curation map, and implies a partnership or endorsement that no subscription
grants. Exact provenance (source, author, licence, adaptation record) stays attached to each
implementation in code, which is what licence compliance actually requires.
