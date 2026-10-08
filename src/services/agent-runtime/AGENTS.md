# Directory rules
- `agentOperations` (`src/services/agent-runtime/catalogOps.ts`, registry-mapped, written via `cms-records`) is the sole client catalog writer for AI, command menu and Catalog panel; lint blocks other writers. Why: one context-aware catalog path.
- Site parts are named with node addresses (`page:/x`, `section:/x#id`, `button:/x#label`, `component:Name`, `file:/path`) resolved read-only by `agent-runtime/nodeAddress.ts` over `buildSystemGraph`. Why: AI, terminal and command menu must agree on which file owns a part.
- `propose_section_action` delegates to `sectionActions.ts` and returns source proposals, never commits directly; why: AI, command menu and terminal must share section semantics and acceptance.
- Browser verifier/probe providers are observers; Playwright stays outside the client bundle; why: verification must not become a competing writer or runtime.

Current operations/context and limitations: `docs/AGENTIC_IDE.md`. Resource storage and invalidation: `docs/RESOURCE_RUNTIME.md`.
