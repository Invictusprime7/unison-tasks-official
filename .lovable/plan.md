# Wizard Progressive Redesign

## Outcome
Transform the existing three-step launcher into a restrained, progressive modal that reveals one decision group at a time, gives style selection a large visual-preview treatment, and reduces launch progress to a concise cascading sequence.

## Build
- Preserve the current selection state, deterministic design contracts, preview approval, and `runLaunchPipeline` handoff.
- Replace the dense stepper and two-column form with a minimal modal header, compact progress indicator, and animated single-step content.
- Keep the Idea step focused on the prompt, with industry browsing and imports progressively disclosed.
- Recompose Goals as scannable selections with secondary page choices revealed after the primary goal.
- Recompose Style around a large selected-style preview, thumbnail rail/overlay controls, business name, visual direction, and progressively disclosed advanced controls.
- Replace the detailed launch panel with a compact vertical cascade that emphasizes the active process and quietly retains completed and pending stages; keep technical notes available only on demand.
- Preserve the generated-site review with clearer preview controls and launch action.

## Technical details
- Update `LauncherWizard.tsx`, `LaunchStageTimeline.tsx`, and the existing style preview component only; no launch orchestration or contract changes.
- Use existing semantic design tokens and Button controls, accessible labels/focus states, responsive desktop/mobile composition, and reduced-motion-safe transitions.
- Update focused Wizard tests for progressive disclosure and style selection behavior.
- Validate the focused tests, typecheck, build health, and the real Wizard flow in Chromium.
