# Roadmap

## Open
- [ ] M7 — end-to-end wizard generation walk. Needs one real Wizard launch to confirm every registered route renders in the builder preview with no scaffold or fallback leak.

## Landed
- Wizard rebuild (guidebook): `LauncherWizard` is a selection-only four-step UI (industry → goals → template → launch) with a live stage timeline and design-contract inspector; `src/services/launch/launchOrchestrator.ts` is the single deterministic pipeline (plan → seed → enrich → preflight → commit → handoff) running every stage through `launchRun`. AI page authorship retired from the wizard, the 5,285-line `SystemLauncher.tsx` deleted, and its Lane-B-only invariant tests removed or retargeted at the orchestrator.
- Phase 4 premium React inventory: about/faq/stats/team promoted from single generic renderers to three registered premium variants each (12 new token-driven components + JSX source renderers), art-direction packs now declare those families, and `premiumInventoryCoverage.test.ts` certifies every implementation has a real component + JSX emitter, three choices per premium family, exactly one default, and pack references that all resolve.

- Phase 3 registry consolidation: `designImplementationRegistry.ts` is now the single derived index over section families + variants; design contracts resolve `implementationId` through it, snapshot metadata stamps a `registrySignature`, and a drift test proves the index can never diverge from the rendering registries.
- Consolidation sweep: visual quality evaluation now runs inside the canonical launch seal, travels on `CanonicalLaunchArtifacts.visualQuality`, is written to `/.unison/visual-quality.json`, and its single refinement directive is recorded as a launch degradation (never blocking, never a rewrite). Generated-site React pins (preview session, preview service, source-export package.json) unified on `GENERATED_RUNTIME_PROFILE` (React 19 / r3f 9). No parallel body-authoring paths remain; suite green (1063 tests) and typecheck clean.
- Phase 2 design intelligence: design vocabulary registry, experience capability resolver, v2.0 art-direction brief in the Lane B prompt, visual quality evaluation gate, Stage 4b composition guard
- Preview typecheck errors cleared (design-intervention Omit keys, `pack.design.mediaTreatment`, resolver lead predicate)
- M1–M6, M8 (canonical ownership, Stage 4b theming, compiler gate, UI/binding closure, snapshot continuity, telemetry)
- Quarantine scaffolds decommissioned (diagnostic surface only)
