# Milestone: Canonical Terminal, Node Mutations and Browser Verification

Goal from your brief: the AI Builder, Code terminal, command menu, click-to-edit and future node graph all change the site through one save path, with browser-level checks that the requested change actually appeared. The "candidate base revision is stale" error in your screenshot stays as a safety check, but stops happening during normal use.

## Phase 1 — Stop the stale-edit error (P0.6, done first)
- Add one **mutation coordinator** that every editing surface (AI chat, toolbar AI, terminal, command menu, autosave, Catalog panel) goes through. It queues edits, so only one save runs at a time.
- An AI edit records which saved version it started from. If another save landed in between (often an autosave), the coordinator re-applies the AI's file changes on top of the newest version when they touch different files. It only asks the AI to regenerate when the same file changed.
- Autosaves pause while an AI edit is in progress.
- The terminal shows the reason in plain words: "Your site changed while the AI was working (autosave at 6:58). Re-applied on the latest version." The current bare error message goes away.

## Phase 2 — Make the terminal use the one save path (P0.5, P0.8, P0.10)
- `write` and `writeb64` no longer write files directly. They build the same change bundle the AI uses and save it through the same writer, including the button-destination check and checkpoint.
- New file commands: `touch`, `mv`, `cp`, `rm`, `rename`. Each runs as one checked save, and the router and site map rebuild afterwards.
- Staged mode: `begin` → several commands → `diff` → `commit` or `abort`, saved as one checkpoint.
- New diagnostic commands: `revision` (current, pending, who saved last), `graph`, `routes`, `intents`.
- A project check blocks any new direct-write path, matching the existing catalog rule.

## Phase 3 — Node addressing (P0.7, P0.9)
- A shared way to name parts of the site (page, section, component, button, file, catalog item, for example `page:/about`, `section:/about#hero`, `button:/home#cta-primary`), resolved to the file or record that actually owns it.
- Page/section/component actions (rename page, move section, swap variant, remove component) become typed actions in the existing shared action set. The AI, terminal and Ctrl+K all use them.
- The site map stays read-only and is rebuilt after each save.

## Phase 4 — Browser verification (P0.1–P0.4, P0.11, P0.12)
- **Constraint:** Playwright needs a real Chromium browser. It can't run inside your browser tab or in the backend functions. Options:
  - **A (recommended now):** an in-preview "probe" that reads the rendered page inside the existing live preview (find an element, read its text and style, click, check the route, collect console errors). It gives the AI eyes on the result for every edit, with no new service.
  - **B (later):** a hosted Playwright runner (for example a small external service) for full screenshots, responsive checks and traces. It needs an outside host and costs money.
- Verification recipes for content, icon, route, button destination, catalog item and cart/booking changes. After each save, the probe checks that the requested change is visible and the button still leads to the same place, then posts the result in the activity list.

## Phase 5 — Tests and protection (P0.13)
- Tests for: coordinator queueing and re-applying edits on the latest version, terminal commands saving through the writer, node resolution, and probe recipes.
- A check that blocks any direct file write outside the canonical writer.

## Technical details
- Coordinator: `src/services/builder/builderMutationCoordinator.ts`. It wraps `runBuilderAiMutation`/`commitMutation`, `aiApplyGate` keeps the strict check, and the coordinator rebases `candidate.baseRevisionId` when the file sets don't overlap.
- Terminal: `terminalCommands.ts` `onWriteFile` is replaced with an `onPatch(PatchPlan)` routed through the coordinator, and the `canonical-vfs-exempt` bypass in `VFSCodeView.tsx` is removed.
- Nodes: `resolveMutableNode()` in `src/services/agent-runtime/`, built on `editableOwnershipResolver` and `systemGraph`.
- Probe: a postMessage bridge in the Sandpack preview (`sandpackFilePrep` runtime), exposed as `browser.*` operations in `agent-runtime`. No new state store.
- No database changes in Phases 1–3 or 5.

Build order: 1 → 2 → 3 → 4A → 5. Phase 4B only if you approve an external host.
