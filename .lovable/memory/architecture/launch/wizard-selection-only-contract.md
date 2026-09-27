---
name: Wizard UI selection-only; AI authors pages in the launch "author" stage
description: LauncherWizard gathers selections only; launchOrchestrator owns every stage; AI authors pages only via the "author" stage and the shared candidate transaction (AI Composer milestone).
type: feature
---

`src/components/onboarding/wizard/LauncherWizard.tsx` is the ONLY launcher UI.
It gathers selections and renders awareness surfaces. It never writes VFS,
never calls a model, never authors a page.

`src/services/launch/launchOrchestrator.ts` is the ONLY launch pipeline:
`plan → seed → enrich → preflight → commit → author → handoff`.

Rules (user direction 2026-09-27: "AI must exist primarily in the Wizard infrastructure"):
- Stage 4b produces the deterministic substrate; `commit` saves it as the
  never-fail baseline revision.
- `author` runs the AI Composer page-by-page (Home first): ResolvedSiteDesignContext
  → edge `site-page-author` → candidate + blocking gates → repair (max 3,
  `site-page-repair`) → canonical commit per page. A failed page keeps its
  baseline. The stage degrades, never fails the launch. 402/403 pause the rest.
- Builder AI edits use the same candidate/gates/repair loop (`builder-source-edit`).
- Static wizard vocabulary lives in `wizard/wizardCatalog.ts`.
- Theme tokens and the router stay compiler-owned; AI never edits App.tsx,
  main.tsx, index.css, package.json, .unison/**, src/unison/**.
