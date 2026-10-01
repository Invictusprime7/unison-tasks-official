# Architecture decisions

- `LauncherWizard` is selection-only: it captures intent and invokes launch orchestration, but never authors or mutates VFS source.
- `UnisonAppBuilder` is the sole fresh-launch application author. Fresh launch derives an `AppBuildContract`, generates and repairs one isolated application candidate, and promotes it only after site-wide closure.
- The canonical platform owns topology, routes, capabilities, intents, bindings, Theme/Stage 4b tokens, Art Direction, UI foundation, protected infrastructure and validation. It must not generate a competing fresh-launch page implementation after App Builder authorship.
- `commitMutation` remains the only legal canonical writer. Initial App Builder generation produces one accepted revision after the complete candidate passes; repair attempts and per-page generation checkpoints are not canonical revisions.
- Existing saved projects hydrate their accepted revision without regeneration. The legacy deterministic page-materialization path may remain temporarily for compatibility and rollback, but it is not the target fresh-launch authority.
- The AI Composer response contract lives in `supabase/functions/_shared/aiComposerContract.ts`, byte-mirrored at `src/contracts/aiComposerContract.ts` (test-enforced); why: client and edge must validate the same shape.
- AI Composer edge modes (`site-page-author`, `site-page-repair`, `builder-source-edit`) live in the existing `ai-code-assistant` function (`composerLane.ts`), not a new endpoint; why: the milestone forbids parallel pipelines.
- Site affinity is a graded projection of `SiteDesignContract`: sealed pack/chrome/legality are invariants, while hero, alignment, section order, density, legal variants, and local components remain page-local; why: coherence must not collapse page intent or creative range.
- Page composition intelligence lives in `src/services/composition/` (one universal planner + data-only industry profiles, consumed under App Builder orchestration); why: industries differ by data, never by engine.
