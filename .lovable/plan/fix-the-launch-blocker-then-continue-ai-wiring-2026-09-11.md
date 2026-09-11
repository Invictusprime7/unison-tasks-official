# Fix the launch blocker, then continue AI wiring

## Part A — Why every page is rejected at launch (confirmed)

The launcher stops at "Checking every page compiles" with `INCOMPLETE_HERO` on all nine pages. This is not a random failure — it is a contradiction between two parts of the system that both currently ship.

The quality checker (`src/services/visualQualityEvaluation.ts:113-145`) scores each page's opening screen out of five required parts and rejects anything under five:

1. headline
2. supporting sentence
3. eyebrow/badge
4. two actions carrying an intent
5. **a hero image OR a proof strip of at least three signals**

The page builder (`src/utils/topologyVFSScaffolder.ts:618-653`) reliably guarantees parts 1-4 for every page, but part 5 only by accident:

- Image archetypes (`immersive-full-bleed`, `editorial-split`, `anchored-portrait`, `centered-statement`) set an image **only if one already happens to exist** in the template composition or in a sibling section (`alternateHeroMedia`). When the chosen industry template ships no photography, no image is set.
- The `utility-intro-proof` archetype is explicitly `text-only` and its contract calls for "an inline proof strip of three signals" — but the builder **never writes a `stats` array**, so the promised proof strip does not exist.
- On the Home page (`topologyVFSScaffolder.ts:382`) the hero contract is applied **without** passing `alternateHeroMedia`, so Home cannot even borrow imagery from its own sibling sections.

Result: every hero lands on four of five parts, and the launcher correctly refuses to publish an unfinished site. The user sees a hard stop instead of their site.

### The fix

Make the builder guarantee the fifth hero part instead of hoping for it.

1. **Media archetypes always resolve imagery.** In `applyRouteHeroContract`, resolve hero media in a fixed order: existing `props.image`/`props.backgroundImage` → `alternateHeroMedia` from sibling sections → the art-direction pack / industry imagery pool. Pass `alternateHeroMedia` into the Home call site at line 382 so Home has the same chain as interior pages.
2. **Text-only archetypes always emit their proof strip.** For `mediaTreatment === 'text-only'`, write a `stats` array of exactly three factual signals derived from the business profile and industry (response time, location/service area, hours, credentials, years in business, guarantee). This is what the archetype's own contract already promises.
3. **Fail loudly, not silently.** If neither media nor three proof signals can be resolved for a hero, throw a specific `PreviewPipelineError` naming the page and the missing part, so the cause is visible instead of surfacing as a generic acceptance failure nine times over.
4. **Lock it with tests.** Extend `src/test/wizardHeroComposition.test.ts` to assert that, for every industry and every page role, the compiled hero scores five of five — no page reaches acceptance with four parts. This makes the class of bug impossible to reintroduce, not just this instance.

### Error-boundary behaviour during launch

The report also asks that these boundaries not be persistent. Two changes:

- `recoverableByRelaunch: true` is already set on this error, but the wizard currently ends the run on it. Since the missing part is now deterministically resolvable, the run will not reach that state; if it still does, the launcher records it as a **degradation** and continues rather than terminating, so the user lands in the builder with a working site and a visible note.
- The failure detail stays in the launch report for diagnosis, but is no longer a fatal stage for a recoverable finding.

## Part B — Continue the AI wiring

Picking up the previously agreed direction: AI is a constrained designer inside the canonical path, never a file writer.

### B1 — Launch Wizard design proposals

- Add `src/services/launch/wizardDesignProposal.ts`: an optional, bounded call that returns a **design proposal**, not code — palette tokens, typography pair, per-page section order, ranked registered variants, motion intensity, media direction, copy voice.
- Validate every field against the existing authorities: `designImplementationRegistry.ts` (variants and families must exist), `industryMatrix.ts` (section legal for this industry and page role), `artDirectionPacks.ts` (palette/motion/media within the selected pack). Anything unrecognised is dropped; gaps fall back to the deterministic rule engine in `wizardDesignIntervention.ts`.
- Add a `design-proposal` stage to `launchOrchestrator.ts` before `seed`. Failure or timeout records a degradation and the launch proceeds deterministically. The compiler stays the only author of page files.
- Use the existing but currently dormant `laneBBatchPlanner.ts` / `wizardLaneBVfsPayload.ts` to split proposal generation across batches for large topologies, so those modules stop being orphaned code.

### B2 — In-builder AI edits

- Extend `aiPatchScopeGuard.ts` allowed surfaces to cover the recipe modules Stage 4b now emits alongside the style bridge.
- Add typed presentation and binding operations so the builder AI can propose a section swap, variant swap, token change, or intent binding as a structured patch rather than a raw file diff, still routed through `commitMutation`.

### Naming

Production code uses "Stage 4b" for the deterministic launch compile and reserves "Lane B" for post-launch editor turns. The new wizard-time work is a **design proposal stage**, not a second Lane B compiler. Tests and comments will say so explicitly.

## Order of work

1. Hero part guarantee + Home media chain + tests (unblocks launch).
2. Recoverable findings become degradations rather than fatal stops.
3. Design proposal type, validation, and orchestrator stage behind a flag.
4. Batch planner wired for multi-page proposals.
5. B2 presentation/binding operations.
6. Full certification run, then remove anything left dormant.
