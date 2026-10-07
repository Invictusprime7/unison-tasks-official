# Roadmap — Agentic IDE milestone
- [x] Phase 1 (slice): agent-runtime operations registry, intent-destination check before every AI save, live activity feed in AI chat
- [x] Phase 0: save step — applied the never-deployed changed-files-only save + timeout recovery (confirmed by user)
- [x] Phase 2: SystemGraph projection fed into AI context
- [ ] Phase 3: extend change sets (topology/data/migrations); edge function streams same events
- [x] Phase 4 (slice): Ctrl/Cmd+K command menu with site map + fonts
- [x] click-to-target from preview
- [x] Phase 4 rest: site map + session Changes list in command menu
- [x] Phase 5: automatic sync saves (binding, GHL, republish) refused when based on a version older than a saved AI change
- [x] Chat no longer says "not applied" after a real checkpoint save
- [ ] Verify click-to-target with a real AI edit (label confirmed; full edit needs the user)
- [x] Product/catalog edits (price, image) write the real database record (command menu)
- [x] Conversational backend setup: AI asks inline questions in chat (saved with the conversation), user answers inline, AI wires backend + authors UI
- [x] Catalog panel (products/services) on the canonical catalog writer; preview reads live data
- [x] agentOperations is the sole catalog read/write surface (registry-aware); retire catalogOperations row ops and migrate their callers
- [x] Move remaining catalog writers (crm-managers, TemplateRuntimeProvider, backendOpExecutor) onto agentOperations

## Milestone: canonical terminal, node mutations, browser verification (2026-10-07)
- [x] Phase 1: mutation coordinator (queue, autosave pause, safe rebase of stale AI edits, plain stale message)
- [ ] Phase 2: terminal writes through the canonical writer; touch/mv/cp/rm/rename; staged mode; revision/graph commands
- [ ] Phase 3: node addressing + typed page/section/component actions
- [ ] Phase 4A: in-preview browser probe + verification recipes (4B hosted Playwright needs your approval)
- [ ] Phase 5: tests + zero-bypass lint
