# Saved project source recovery — 2026-10-06

## Observed live state

Supabase project: `nfrdomdvyrbwuokathtw`.

The reported builder URL identifies draft `e83c4b7b-671c-463b-934d-8e04218a9406`, project `91e25fc8-2b8d-42d3-9489-76c7a7f851d5`, and site `0073214d-501c-4177-af44-01714969667a`.

The draft was created at `2026-10-03 02:34:24 UTC` and last updated at `2026-10-04 20:07:54 UTC`. Live `code` and `editor_code` are empty, `vfs_files` is `{}`, and `last_revision_id` is null. Metadata still references build `90bea3cc-7a77-46af-a94d-0c2b8d1ac5c5` and bundle `c5a0228c-d8ee-4051-a978-75d90f850e2c`. The build exists, is pending, and identifies portfolio-photography / bold. The referenced bundle is absent.

Read-only checks found no matching authored source in canonical site revisions, project files, site bundles, publish artifacts, legacy project revisions, AI builder proposals, project events, or Storage object names matching the draft/project/site. This does **not** establish that the site was never generated, or when source disappeared. Browser recovery is scoped to this draft and can only be checked in the user's browser.

## Recovery checkpoints

The CLI reports completed physical database backups:

| Backup time (UTC) | Backup ID | Purpose |
| --- | --- | --- |
| 2026-10-03 07:48:15.839 | 1856099278 | First available checkpoint after this draft was created |
| 2026-10-04 07:56:57.195 | 1865659022 | Checkpoint before its last live update |
| 2026-10-05 07:53:45.453 | 1875067966 | Later checkpoint for comparison |

These backups have not been inspected and may or may not contain the original files. PITR is disabled. Do not run an in-place production restore: that would overwrite newer user work.

Use Supabase Dashboard → Database → Backups → **Restore to a New Project**, initially selecting October 3. Review the displayed compute/disk cost before creating the independent recovery project. Supabase's physical backups are not directly downloadable; the installed CLI offers an in-place restore, not the dashboard's historical clone workflow.

Official workflow: https://supabase.com/docs/guides/platform/clone-project

After the clone is available:

1. Inspect the exact draft, its metadata snapshots, referenced bundles, project files and revisions. If absent, inspect October 4 in a separate recovery checkpoint.
2. Export only recoverable project source and its original identity/metadata; keep source bytes unchanged.
3. Validate that source's entry point, dependencies, providers and initial state in Live Preview.
4. Hydrate existing accepted revisions without regeneration. For source recovered from a pre-revision draft, promote an accepted candidate through `commitMutation`; never write canonical VFS columns with ad hoc SQL.
5. Confirm original content renders in the authenticated builder before declaring recovery complete.

## Prevention and compatibility changes

Existing-draft save now preserves prior metadata, does not blank legacy source during a VFS or metadata save, rejects failed identity lookups, and keeps source-projection keys out of identity writes. Full candidate VFS is journaled by exact draft ID before its canonical commit, including linkage failures. Canonical acceptance remains exclusively through `commitMutation`.

Legacy hydration prefers surviving authored browser VFS over deterministic projection of an old plan, while accepted revision pointers remain authoritative. Prior fixes preserve saved bootstrap providers and App props, resolve missing legacy platform modules, and avoid premature preview restarts.

Regression verification: 38 focused recovery/save tests passed; TypeScript check passed. Saved-provider and legacy-plan preview fixtures rendered in the builder during the preceding investigation. The reported project's original cloud source has **not** yet been recovered or rendered.
