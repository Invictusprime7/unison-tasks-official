# V4 Convergence — Optional-AI Launch + 21st-Only Eligibility (P0 Slice)

Source authority: `UNISON_21ST_CANONICAL_MASTER_MILESTONE_PLAN_V4.md` (uploaded). This plan supersedes the V3-era "composition required / fatal before Stage 4b" rule. V4 Milestone 1 is explicit: AI improves launch quality but must never be an availability risk.

## Already satisfied (verified in repo, no work)
- **M2 eligibility**: `getGenerationVariantsForSection` (registry.ts:1855) already filters fresh generation to `source.origin === '21st'` + `generationStatus !== 'legacy'` + `vfs.mode === 'portable-recipe'` + `certification === 'approved'`; legacy IDs stay resolvable for old projects.
- **M1 Lane B half**: Lane B is optional (`input.ai?.laneB === false` skip), batched, receives the composition plan as context (launchOrchestrator.ts:627), and a failed batch preserves the deterministic Stage 4b page.
- **M3/M7/M8/M9**: atomic promotion transaction, Registry Context v2, bounded context to both AI layers, Lane B validator modernization — shipped in prior slices.

## Scope of this slice

1. **M0 delta — reconcile governing docs to V4**
   - `roadmap.md` and canonical plans must state: composition planner is OPTIONAL, Stage 4b is MANDATORY, launch always completes deterministically.
   - Remove V3-era statements that missing/invalid composition stops launch before Stage 4b.

2. **M1 — make composition failure non-fatal** (`src/services/launch/launchOrchestrator.ts`)
   - Replace the `LaunchFatalError` at the seed stage with `run.degrade('seed', 'composition.<reason>', message)` and continue into Stage 4b with `compositionPlan` unset.
   - Surface a launch build note: AI composition unavailable → deterministic Design Intervention used.
   - Keep: Stage 4b mandatory; composition plan forwarded to Lane B when present; Lane B failure preserves Stage 4b pages.

3. **Tests — prove all four launch modes**
   - composition ON + Lane B ON, ON + OFF, OFF + ON, OFF + OFF — all launch successfully.
   - Flip `launchOrchestratorCanonicalHandoff.test.ts` fatal-composition assertion to assert degraded-but-successful launch with the deterministic layout.
   - Assert composition failure still records degrade code/message and never throws.

## Constraints
- No new registry, launcher, VFS writer, or persistence authority.
- Deterministic fallback must be the selected industry layout / Design Intervention — never a minimal scaffold.
- 21st-only eligibility policy untouched; legacy variants remain resolvable for historical projects only.

## Verification
- Focused Vitest: launch orchestrator handoff + composition policy suites.
- `bunx tsgo --noEmit` clean; preview build green.
