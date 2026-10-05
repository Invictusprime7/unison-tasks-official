# Unison Agentic IDE + Full-Stack Authority

One pipeline, end to end: the Wizard, the AI Builder chat, and a new command menu all send the same typed operations through one agent runtime, which builds one change set, validates it, previews it, and saves it as one checkpoint. Nothing new becomes a second source of truth.

## What you'll get (in order)

1. **Reliable simple edits first** — fix the timed-out save so theme, font, image, layout and section edits apply and save every time.
2. **The Builder sees everything** — on every message it reads the live preview (pages, sections, menu, buttons, colours, fonts, photos, errors), the site's code, and the site's saved data (products, bookings, leads) for this project only.
3. **Live activity feed** — instead of "Thinking...", the chat shows clear steps: Understanding → Found → Plan → Editing files (+/- lines) → Checking (code, preview, buttons still go to the same place) → Saved as checkpoint #N, with Stop and Inspect.
4. **Command menu (Ctrl/Cmd+K)** — Change theme, Change font, Swap image, Add page, Repair current error, Restore checkpoint, Ask Unison… Each command runs the exact same operation the AI uses.
5. **Click to target** — selecting something in the preview, a file, a page, or an error tells the AI exactly what "this" means.
6. **Site map view** — a read-only picture of pages → sections → buttons → where each button goes (page, form, booking, checkout, database). Click a node to target it.
7. **Products and catalog editing** through the same path, with button destinations kept fixed regardless of design changes.

Normal view stays simple: **AI | Preview | Pages**. Code, Site map, Data, Changes and Activity open only when asked (progressive disclosure).

## Accessibility (built into every step)
- Full keyboard use: command menu, tabs, site map nodes, activity feed; visible focus everywhere.
- Activity feed announces progress to screen readers (polite live region); errors announced assertively.
- Proper labels/roles on panels, dialogs and tabs; reduced-motion respected; colour never the only status signal (icons + text).

## Guard rails
- Database changes from the AI are **proposals that you approve** (reusing the existing approval flow), never silent writes. Content edits (product name, price, image) are scoped to this project's rows and go through normal access rules.
- Button destinations (intents) are checked before every save; a change that breaks one is refused with a clear message.
- The site map and activity feed are views of saved state, never their own copy.

## Technical details

**Phase 0 — save reliability.** Profile the black & gold timeout in `vfsCommitService` / `commit_canonical_site_revision_v2` (payload size, the AccessExclusiveLock on `builder_drafts`, 60s statement timeout); send only changed paths in style-only edits; keep the circuit breaker.

**Phase 1 — Agent Runtime (one tool protocol).** New `src/services/agent-runtime/` registry of typed operations wrapping what already exists — no new writers:
- inspect: `inspect_file`, `inspect_route`, `inspect_preview` (preview bridge DOM digest), `inspect_errors`, `inspect_data` (project-scoped reads of products/menu_items/services/bookings/crm_leads via RLS client), `inspect_intents`.
- mutate: `write_file`/`delete_file`, `set_theme_tokens`, `set_font`, `swap_image`, `modify_topology` (existing `pageTopologyOrchestrator`), `bind_intent`, `update_record` (catalog rows), `propose_migration` (existing `ai_builder_proposals`).
- verify/commit: existing preflight + `pageStructureGate` + new intent-invariant check → `commitMutation` (sole writer) → `restoreRevision`.
AI Builder (`builderMutationService`, `openCompositionTools`), and later the Wizard's App Builder stages, call this registry.

**Phase 2 — SystemGraph projection.** `buildSystemGraph(snapshot, playgroundState, vfs, dataSummary)` — pure, memoised by `renderHash`/revision id; Page → Section → Element → Intent → Capability → Backend action → Table. Serialised (budgeted) into the AI context each turn.

**Phase 3 — ChangeSet + event stream.** Extend `AICandidateChangeSet` with `topology`, `data`, `migrationProposals` buckets. Typed `AgentEvent` (`understanding | discovery | plan | tool_call | file_change | data_change | verification | error | rollback | commit`) emitted on `vfsEventBus`; edge `ai-code-assistant` streams the same event shape. Unify `AIChatStream` + AIBuilderPanel cascade into one `AgentActivityFeed` (aria-live).

**Phase 4 — UI surfaces.** `CommandPalette` (existing shadcn `Command`) dispatching registry ops; unified selection context (preview element / file / graph node / error → `AgentTarget`); `SystemGraphView` (read-only, keyboard-navigable tree/graph); Changes tab bound to `CheckpointsPopover`/`RevisionLedgerStatus`.

**Phase 5 — remove competing authority.** After a ChangeSet commits, legacy repair/sync/recompile paths may not overwrite it (enforced in `vfsCommitService` + lint in `scripts/lint-single-source-of-truth.mjs`).

**Tests:** registry op parity (palette vs AI), graph is pure projection, intent invariant blocks a broken destination, failed verification → no checkpoint, event order, a11y (axe on palette/feed/graph). AGENTS.md gets one rule per new module.

**Delivery:** Phases 0–1 + activity feed in the first pass (fixes your failing edits and gives full live read); Phases 2–5 follow in sequence.
