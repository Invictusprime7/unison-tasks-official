# Directory rules
- `agentOperations` (`src/services/agent-runtime/catalogOps.ts`, registry-mapped, written via `cms-records`) is the sole client catalog writer for AI, command menu and Catalog panel; lint blocks other writers. Why: one context-aware catalog path.
