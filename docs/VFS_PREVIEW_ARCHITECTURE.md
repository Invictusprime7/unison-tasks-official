# VFS preview architecture

Current reference, reviewed 2026-10-08. The previous ECS/Docker-first diagram and static fallback instructions are retired for the active website Builder.

The project VFS uses canonical source paths including `/src/main.tsx`, `/src/index.css` and deterministic `/src/App.tsx`. Accepted revision/snapshot ownership and live coordinated edits feed `snapshotProjector` and the shared `prepareSandpackFiles` path. Sandpack receives an adapted overlay; that overlay is not a competing persisted file system.

Canvas and Split use the same React project. The Split workspace includes the full code interface and resizable preview. Terminal emits operations for coordinated canonical saves; preview/runtime projection is not a direct writer.

See [Preview runtime](PREVIEW_RUNTIME_ARCHITECTURE.md) for signals, post-commit probes, local Playwright and limitations; [Architecture](ARCHITECTURE.md) for accepted revision identity, routing and persistence; and [Agentic IDE](AGENTIC_IDE.md) for code/terminal/toolbar integration.

Legacy `/api/preview` Docker/session tooling may remain in the repository. Its existence is not evidence that the active Builder launches containers, accepts static fallback sites or uses a second source authority.
