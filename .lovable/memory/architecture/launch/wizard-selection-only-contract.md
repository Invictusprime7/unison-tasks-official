---
name: Wizard is selection-only; launch is deterministic
description: LauncherWizard gathers selections only; launchOrchestrator owns every launch stage; AI never authors wizard page bodies.
type: feature
---

`src/components/onboarding/wizard/LauncherWizard.tsx` is the ONLY launcher UI
(the 5,285-line `SystemLauncher.tsx` is deleted). It gathers selections and
renders awareness surfaces — nothing else. It never writes VFS, never calls a
model, never authors a page.

`src/services/launch/launchOrchestrator.ts` is the ONLY launch pipeline:
`plan → seed → enrich → preflight → commit → handoff`, every stage driven
through `launchRun` so the timeline is honest.

Rules:
- **AI page authorship is retired from the wizard.** The `enrich` stage is
  marked done without a model call; page bodies come only from the canonical
  compiler (Stage 4b). Lane B services still exist for the in-builder AI, not
  for launch.
- Static wizard vocabulary lives in `wizard/wizardCatalog.ts`. Every template
  card must resolve to a registered `TemplateComposition` — no synthetic cards.
- Awareness UI: `LaunchStageTimeline.tsx` (live stages + degradations) and
  `DesignContractInspector.tsx` (seed, plan/contract signatures, resolved
  implementation ids). Both are read-only projections.
- Theme tokens and the router stay compiler-owned; the orchestrator repairs
  `/src/index.css` from the preset rather than shipping un-themed tokens.
