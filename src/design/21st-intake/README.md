# 21st Intake (development-time only)

This directory is **not a runtime registry**. It is the quarantine and
adaptation area where an external 21st.dev source becomes a first-class Unison
implementation with 21st provenance.

Hard rules:

- No generated site may carry a live 21st dependency.
- Nothing here may be imported by runtime, compiler, preview or VFS code.
- `VARIANT_REGISTRY` stays the only runtime design authority.
- Stage 4b remains the only global theme authority.

## Lifecycle

1. Discover / preview and classify the source.
2. Quarantine under `imported/<slug>/` — do not register.
3. Dependency audit (`dependencyResolver.ts`).
4. Import normalization (`sourceNormalizer.ts`).
5. Theme normalization into Stage 4b tokens (`tokenAdapter.ts`).
6. Canonical identity attributes (`sourceNormalizer.ts`).
7. Accessibility / responsive audit (`compatibilityAudit.ts`).
8. Portable VFS certification (`componentIntake.ts` → `runIntake`).
9. Promote to a canonical family (`planPromotion`) and register it.
10. Archive the reviewed raw source outside executable imports and remove the active quarantine duplicate.

## Usage

```ts
const result = runIntake({ record, source, identity: { implementation: 'hero:kinetic-tech' } });
if (result.certified) {
  const plan = planPromotion(result, { sectionType: 'hero', slug: 'kinetic-tech', componentName: 'HeroKineticTech' });
}
```

Certification is refused when provenance is incomplete or the compatibility
audit reports any error.

Source certification requires an explicit licenseReview with status verified, a license matching the record, an evidence source and a valid verifiedAt timestamp. New intake records start unverified. A license label from a catalog is not a completed review. planPromotion rechecks this evidence; it still returns a plan and does not perform an atomic registry write. Existing records must be reviewed before passing this gate.

Registration: node scripts/unison-variant-register.mjs --check performs the same pre-write gates as registration. Missing review/certification fails without mutation. Writes are staged and journaled before mutation. Caught failures roll back prior bytes; interrupted processes require `node scripts/unison-variant-register.mjs --recover`. Recovery refuses to overwrite subsequent edits. Files are not visible atomically as a group. Registration uses step 9, leaving step 10 for archival. The eight original specs now resolve to three verified promotions and five explicit retirements, with zero audit findings. Retirement does not verify a license.

Use node scripts/unison-variant-register.mjs --audit for a read-only JSON report combining provenance, certification and parsed registry-agreement findings. Exit status is nonzero when findings remain. Existing entries must match their component/recipe imports, source metadata, portable approval and aliases before registration can mark intake lifecycle state.
