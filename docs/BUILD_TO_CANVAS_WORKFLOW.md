# Builder Canvas and Split workflow

Active website Builder guidance, reviewed 2026-10-08. Earlier Fabric template-to-HTML instructions do not describe the current source-backed website editor.

## Launch and edit

1. Homepage chat and the Wizard gather synchronized selections.
2. App Builder authors one isolated application candidate; canonical acceptance saves the approved revision.
3. Builder Canvas displays the React source in Sandpack.
4. Selecting a preview element identifies its displayed route, source scope and any saved-record provenance.
5. Toolbar AI forwards the request to the shared AI Builder panel; source changes use the mutation coordinator and canonical commit.
6. A marked saved-record field can instead use the Resource Runtime, preserving page source.
7. The preview reports compile/load state separately from save acceptance.

## Split workspace

Split mounts the entire VFS code interface: explorer, tabs, code editors, terminal, review controls, undo/redo, status and a resizable preview pane. File links in the AI activity ribbon open the relevant editor tab in Split. Canvas and Split are views of one project, not separate authoring systems.

Checkpoint restore restores accepted source through normal validation. A record editor's Undo restores captured database field values; it is not a source restore. Publish readiness remains stricter than editing or restore.

Fabric remains available to graphic/design tooling. Do not route website edits through a template-schema → Fabric → exported HTML loop or add new custom hook files to revive that architecture.

See [Agentic IDE](AGENTIC_IDE.md), [Resource Runtime](RESOURCE_RUNTIME.md) and [Preview runtime](PREVIEW_RUNTIME_ARCHITECTURE.md). Authenticated click/save/read-back/undo verification is still tracked in `roadmap.md`.
