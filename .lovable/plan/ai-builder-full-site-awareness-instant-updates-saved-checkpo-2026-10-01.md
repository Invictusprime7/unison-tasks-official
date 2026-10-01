# AI Builder: full site awareness, instant updates, saved checkpoints, undo

## What you'll get
1. **The AI Builder sees the whole site as rendered**, not just the page you're on: every page's visible sections, headings, buttons and their links, the menu, colours and fonts in use, and any preview errors.
2. **Each AI change shows up right away** in the Live Preview with a quick refresh of just the changed parts — no full page reload, no lost scroll position.
3. **Each AI change is saved permanently** to this project only, as its own checkpoint (e.g. "AI: changed Home heading", with the time).
4. **A Checkpoints list** in the AI Builder panel: see every AI change, preview what it changed, and restore any earlier one. Restoring also makes a new checkpoint, so nothing is ever lost.
5. **Undo button** in the top bar: one click returns to the previous saved checkpoint (saved, not just on screen). A Redo appears right after an undo.

## How it behaves
- If the AI's change is rejected or fails to save, nothing changes on screen and no checkpoint is made; you get a clear message.
- Undo/restore is always by checkpoint, so it works the same after a reload or on another device.
- Manual edits (typing in code, toolbar edits) keep their own auto-save and appear in the list as "Manual edit" groups.

## Technical details
- **Context:** extend the existing `previewSnapshot` in `AIBuilderPanel` into a site-wide rendered digest: crawl every PageRegistry route via the preview bridge (hidden route render, DOM summary: sections, headings, CTAs + `data-ut-intent` targets, nav items, computed theme tokens, runtime errors). Cache per route by VFS signature; refresh only changed routes. Size-budgeted through `builderPayloadBudget`.
- **Instant preview:** after `runBuilderAiMutation` succeeds, mirror only changed paths into the Sandpack VFS (HMR update) instead of `importFiles` on the whole map; keep route + scroll.
- **Save + checkpoints:** every AI mutation already produces one `site_revisions` row via `commitMutation`. Tag it with a label (prompt summary) and `source='ai-builder'` in `patch_json`; no new table. Checkpoint list = `listRecentRevisionsForProject` (summary columns only), rendered in a new `AICheckpointsPanel` reusing `RevisionLedgerStatus` restore logic.
- **Undo/Redo:** top-bar Undo calls `restoreRevision(parentRevisionId)`; redo keeps an in-memory stack of undone revision ids for the session. The local `vfsSnapshotManager` undo in the code editor stays for unsaved typing only.
- **Tests:** checkpoint labelling, undo → restores parent revision, failed commit → no checkpoint, changed-path-only preview mirror.
