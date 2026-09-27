# Architecture decisions

- AI page authoring runs only through `launchOrchestrator` stage `author` → `siteAuthoringOrchestrator` → `aiRepairLoop` → `prepareAICandidate` → `persistAiCommit`; why: one transaction (candidate → gates → repair → single writer) for Wizard launch and Builder edits.
- The AI Composer response contract lives in `supabase/functions/_shared/aiComposerContract.ts`, byte-mirrored at `src/contracts/aiComposerContract.ts` (test-enforced); why: client and edge must validate the same shape.
- AI Composer edge modes (`site-page-author`, `site-page-repair`, `builder-source-edit`) live in the existing `ai-code-assistant` function (`composerLane.ts`), not a new endpoint; why: the milestone forbids parallel pipelines.
