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
- [x] Phase 2: terminal writes through the canonical writer; touch/mv/cp/rm/rename; staged mode; revision/routes/intents commands (graph → Phase 3)
- [~] Phase 3: node addressing (resolver + terminal graph/node) done; typed page/section actions next
- [ ] Phase 4B: provider-agnostic BrowserVerifier — local Playwright done (scripts/verify-browser-local.mjs); hosted adapter only when remote AI verification is enabled
- [x] Phase 5: tests + zero-bypass guard (no client Playwright, terminal never writes directly)
- [x] Revised plan P0.12: post-commit browser check after terminal saves (provider-swappable probe)
- [x] Revised P0.9: `page rename` (typed route op through the canonical writer)
- [x] Revised P0.9: swap a section variant from the terminal (`section variant`)
- [ ] Revised P0.1–P0.3/P0.11: hosted Playwright worker + candidate preview (needs your approval of an outside host)

## Milestone: Unified Resource Runtime (2026-10-08)
- [x] P0.1–4: resource types, registry above catalogSurfaceRegistry, catalog/content/profile adapters, runtime reads/writes
- [x] P0.10–11, 13: ResourceEntityRef on EditableEntity, ResourceDataOp, RESOURCE_INVALIDATED (event bus + preview postMessage)
- [x] Content storage (FAQs, articles) added to the database with content permissions
- [x] P0.9 provenance: AI-written pages and product cards tag records; click reports the record
- [x] P0.5–8: live record rows carry their record tag (useSectionData is the shared connection; no new hook file per project rule)
- [x] P0.13 live rehydration: record saves now reach preview sections bound to that table
- [ ] P0.12, 14–18: profile writes via command gateway, verification, schema-driven WYSIWYG, AI tools on ResourceRuntime
