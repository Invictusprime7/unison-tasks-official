# Legacy profile cloud conversion

Cloud Projects → **Restore older projects** converts the signed-in owner's legacy drafts sequentially. Opening a profile cloud project also performs the same validation before navigating to its accepted revision.

Accepted revisions are skipped. For a pre-revision draft, the migration reads original VFS, metadata snapshots, legacy single-file source, scoped browser recovery, or a saved site plan. It adds required runtime infrastructure, carries the original page registry and selected theme tokens, and accepts the complete candidate only through `commitMutation`. The old direct revision-RPC backfill has been removed. A failed candidate stays recoverable and appears in the batch report.

For a cloud project with a missing draft, recovery checks surviving site bundles first. If original files are unavailable, a compatibility composition can be built from the recorded launch template, theme and explicit requested pages. Such files carry `/.unison/legacy-recovery.json` with `originalSourceRecovered: false`. This is reconstruction from saved selections, not original-source recovery. Incomplete selections are reported rather than replaced with arbitrary default pages. Fresh launch authorship remains exclusively App Builder.

Stale builder links are redirected to the recovered draft after conversion. Ownership and project linkage must match; a draft from another project cannot be adopted. The batch uses paginated owner-scoped reads and one conversion at a time, continues after failures, and reports the outcome for each candidate. Conversion runs in the authenticated owner's application session, not with a privileged database rewrite.

Verification: 57 focused tests cover recovery, identity isolation, journal preservation, canonical-save rejection, accepted-revision skipping and batch continuation. Two browser checks exercised the real canonical pipeline in dry-run mode: a one-page portfolio and a six-page portfolio passed acceptance with no error diagnostics. The six-page candidate retained `/`, `/about`, `/work`, `/services`, `/contact` and `/booking`. No production project was committed during those checks.
