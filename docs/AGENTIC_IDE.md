# Unison Agentic IDE

Status: implemented slices with outstanding live verification. Reviewed against source on 2026-10-08.

## Shared authority

AI Builder, the floating toolbar, command menu and terminal work against the same project. `agentOperations` in `src/services/agent-runtime/operations.ts` provides typed inspections and proposals. `AgentContext` supplies files and optional business/project identity, revision, snapshot, runtime manifest, schema, backend actions, diagnostics and preview errors. Missing context is not proof that a remote capability or table is absent.

`SystemGraph` is a read-only projection, not a second registry or database. It describes pages, sections, files, dependencies, actions and available schema information. Inspections rebuild it from the supplied canonical state.

| Operation group | Current surface |
| --- | --- |
| Source and errors | `inspect_file`, `inspect_routes`, `inspect_errors`, `inspect_preview` |
| Graph and ownership | `inspect_system_graph`, `inspect_graph_node`, `inspect_graph_edges`, `inspect_editable_entity`, `inspect_route`, `inspect_dependencies` |
| Business infrastructure | `inspect_intents`, `inspect_capabilities`, `inspect_schema`, `inspect_table`, `inspect_policies`, `inspect_backend_actions` |
| File proposals | `set_theme_tokens`, `set_font`, `swap_image`, `propose_section_action` |
| Behavior proposal | `propose_bind_intent` returns canonical binding operations, not a source rewrite |
| Catalog | `inspect_catalog`, `create_catalog_item`, `update_catalog_item`, `hide_catalog_item`, `delete_catalog_item` |
| Resources | `list_resources`, `read_resource`, `update_resource_field` |

File proposals go through the existing candidate and mutation flow. Catalog/resource operations perform permission-checked record writes through their adapters; these are not source checkpoints. A compatibility catalog update can additionally propose source changes for unbound markup, but those file changes still require canonical acceptance.

## Canonical source saves

`builderMutationCoordinator.ts` serializes Builder mutations, pauses background autosave during exclusive work and supports safe rebasing of non-overlapping candidates. `aiApplyGate` rejects candidates when the relevant base changed. `runBuilderAiMutation` and `commitBuilderFiles` feed `commitMutation`; terminal and toolbar code must not create competing VFS writers.

Before AI saves, intent-retarget checks protect existing destinations. Scoped checks detect unrelated copy and side effects. Auto mode does not pause for the approval prompts that Review/Mixed would present; it does not grant permission to bypass canonical save validation, authorization or protected-file rules.

## Node addresses and section actions

`nodeAddress.ts` resolves the shared address vocabulary over `SystemGraph`:

```text
page:/about
section:/about#hero
button:/about#Contact
component:SiteNav
file:/src/pages/About.tsx
```

`sectionActions.ts` implements remove, move up/down, class-based restyle and variant swap. `propose_section_action` exposes those same helpers to AI and command-menu callers. Moving markup retains its content and destinations. Variant swaps are restricted to supported designs in the same group and retain content/bindings. Unknown targets and unsupported replacements are refused, not silently substituted. Restyling a code-defined appearance can require a scoped AI edit rather than a deterministic class operation.

## Terminal and Split workspace

The Builder Split tab uses the full `VFSCodeView`: files, editor tabs, terminal, review controls, undo/redo and a resizable preview pane. Preview selection and page controls remain available.

Terminal file commands emit `FileOps` to `onPatch`; the host calls `commitBuilderFiles` inside `runExclusive('terminal')`. File creation, copy/move/rename/delete and staged work never write the VFS directly. Route operations use the same canonical save path. A route move that cannot preserve existing destinations is refused rather than silently rewiring links.

Natural-language matching lives in `src/services/terminal/naturalLanguage.ts`:

| Input | Behavior |
| --- | --- |
| `show pages` | Runs `routes` immediately |
| `show the site map` | Runs `graph` immediately |
| `where do the buttons go` | Runs `intents` immediately |
| `check the site` | Runs `diagnose` immediately |
| `check that the page says "Contact"` | Runs a read-only live text probe |
| `rename the about page to "Our studio"` | Shows the exact mutating command for confirmation |
| Unrecognized request | Hands the request to AI Builder; terminal itself never calls AI |

Matched mutations require Enter to confirm; Escape cancels. Loose-name matching is a convenience, not proof of semantic ownership: review the resolved command/address before confirmation. AI Auto mode is separate from terminal command confirmation.

## Floating toolbar and record editing

The toolbar is an extension of AI Builder, not an independent AI author. It forwards the selected route, element scope, source ownership and resource provenance to the shared panel. Source edits use the coordinated save path and revert optimistic presentation when refused. Behavior changes must use canonical binding operations.

For `data-ut-resource` selections, `RecordFieldsEditor.tsx` loads the saved item and exposes schema-declared editable fields. Saves and the toast's Undo action call `applyResourceOp`; neither operation rewrites the page. JSON fields are not shown by this editor. Undo restores the captured previous values through another record update; it is not a source-revision restore or conflict-aware history system.

Image generation uses the existing `generate-image` function and image workflow. Generated regular/background images still save via the appropriate source or record lane. Generation can fail because of provider limits; integration does not establish a successful generation in every account.

## Chat, approvals and file activity

- `builder_chat_history` is the durable per-draft conversation store; browser storage is a fast cache.
- Apply, review-required and capability prompts use quiet inline text actions near the input, not prominent boxed notices.
- `ai-chat/FileActivityRibbon.tsx` subscribes to `vfsEventBus` `agent:event` above the input. It shows emitted stages, touched files/diffs and preview status; clicking a file opens it in Split view.
- The ribbon displays actual emitted events, not the model's private reasoning or a guaranteed exhaustive stream of every file read.
- `previewVerification.ts` emits pending/running/error signals. “Preview updated” means the preview reported loading the update; it is not evidence that every page, interaction or saved record was tested.
- Checkpoint descriptions show the request and committed file/route changes; internal metadata is grouped rather than presented as an AI candidate identifier.

## Browser authority and remaining work

See [Preview runtime](PREVIEW_RUNTIME_ARCHITECTURE.md). In-preview probes are read-only current-route checks. `BrowserVerifier` is provider-agnostic; the local Playwright script is available, while hosted worker/candidate-preview infrastructure remains outstanding. No client code imports Playwright.

`roadmap.md` tracks broader change-set support, shared edge activity streaming, hosted browser approval and real-site click/record/save/undo verification. Source and focused tests demonstrate implemented seams; they do not establish authenticated end-to-end success for those remaining flows.