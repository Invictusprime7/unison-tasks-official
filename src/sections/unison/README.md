# Unison authoring toolkit

This entry point builds on the existing section registry, canonical compiler,
page contracts and generation seed. It does not add a separate AI authoring
or persistence pipeline.

`compileUnisonDesignContext` seals the selected art-direction pack and chooses
deterministic variants. The public `getGenerationVariantsForSection` export
and seeded choices preserve the existing registry and compiler selection rules;
the toolkit adds no certification whitelist. Audit metadata guides selection
without vetoing freestyle generation or deliberate page-local variation.
Project-authored sections remain available through `validateOpenComposition`
when their artifact records satisfy the required contracts.

Auth forms and data tables use the existing portable recipes and canonical
file-set compiler. Starter data tables are empty rather than populated with
invented business records. Preview thumbnails live in `public/variants`.

## Maintenance

Run from the repository root:

```sh
npm run unison -- audit
npm run unison -- audit hero:centered
npm run unison -- certify hero:centered --consumer
npm run unison -- certify --all --consumer
npm run unison -- repair hero:centered
npm run unison -- promote hero:centered
npm run unison -- retire hero:centered "Reason for retirement"
```

Certification writes evidence and exits nonzero for an unknown implementation,
render failure, or broken dependency closure. Other static checks are advisory.
Review the output and commit the
evidence alongside source changes. Promotion refuses missing/stale evidence
and audit blockers. Repair only performs the documented mechanical changes;
it does not certify accessibility or visual behavior.

The audit also reports authored metadata and public availability as guidance.
Audit status is not permission to generate. The established registry still owns
default recommendations; explicitly selected registered designs and newly
authored project components are validated for implementation and hard contract
constraints rather than forced into a fixed catalog or matching page composition.
Certification is static markup and import validation, not browser interaction
or visual-accessibility certification. Re-run it whenever components change.
