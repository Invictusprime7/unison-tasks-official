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
10. Delete the quarantine duplicate.

## Usage

```ts
const result = runIntake({ record, source, identity: { implementation: 'hero:kinetic-tech' } });
if (result.certified) {
  const plan = planPromotion(result, { sectionType: 'hero', slug: 'kinetic-tech', componentName: 'HeroKineticTech' });
}
```

Certification is refused when provenance is incomplete or the compatibility
audit reports any error.
