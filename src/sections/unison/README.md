# Unison authoring toolkit

This entry point builds on the existing section registry, canonical compiler,
page contracts and generation seed. It does not add a separate AI authoring
or persistence pipeline.

`compileUnisonDesignContext` seals the selected art-direction pack and chooses
deterministic variants. The public `getGenerationVariantsForSection` export
and seeded choices exclude implementations with certification blockers.
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

Certification writes evidence and exits nonzero if rendering, static checks,
or the requested consumer smoke test fails. Review the output and commit the
evidence alongside source changes. Promotion refuses missing/stale evidence
and audit blockers. Repair only performs the documented mechanical changes;
it does not certify accessibility or visual behavior.

The audit also checks authored metadata and public availability, so a passing
render alone does not establish canonical status. Quarantined variants stay
registered for inspection but are excluded by this toolkit's legal selector.
Certification is static markup and import validation, not browser interaction
or visual-accessibility certification. Re-run it whenever components change.
