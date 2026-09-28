# Site Affinity Guard

## Goal
Make the first authored page establish a recognizable site-wide design grammar, then keep every later page visibly related without forcing identical heroes, alignments, section sets, or ordering.

## Implementation
1. **Compile an explicit affinity contract**
   - Extend `ResolvedSiteDesignContext` with two separate layers:
     - **Invariants:** sealed art-direction pack, typography character, geometry/surface language, spacing cadence, media treatment, motion character, and shared navigation/footer identity.
     - **Variants:** page-role rhythm and density, hero composition, alignment, section order, media dominance, compatible section implementations, and project-local compositions.
   - Add an explicit loose-fit rule: unknown or adjacent page intents inherit the invariants while receiving a broad, advisory variant envelope instead of being rejected.

2. **Carry the established visual grammar across pages**
   - After Home is accepted, derive a compact deterministic affinity reference from its authored source: imported primitives, recurring typography/layout classes, section treatment, alignment, and shared chrome usage.
   - Include that reference in every later page brief, alongside the page's own purpose and allowed variation.
   - Preserve page-specific narrative responsibility: an About page may use an editorial intro while still sharing the same typography, surfaces, spacing character, and chrome as Home.

3. **Add a graded, permissive guard**
   - Hard-block only real invariant violations: forbidden/retired implementations, replacement of sealed art direction, conflicting shared chrome, or loss of required accessibility/intent structure.
   - Report visual drift and weak affinity as advisory diagnostics, not rejection criteria.
   - Never require exact class matching, identical alignment, identical heroes, identical section order, or only pack-listed components. Legal variants and project-local components remain available.

4. **Feed guard feedback into the existing repair loop**
   - Attach actionable affinity diagnostics to the same candidate → gate → repair path; do not add another writer or generation pipeline.
   - Let loose-fit intents pass when they preserve invariants and explain their page-local variation.
   - Keep the current single canonical commit and ownership rules unchanged.

5. **Verify behavior**
   - Add tests for invariant/variant separation, loose-fit roles, deterministic Home affinity extraction, permissive variation, and blocking only genuine contradictions.
   - Test a multi-page fashion site where Home and Our Story differ in hero composition but clearly share one visual language.
   - Validate the live authoring flow and current project health after implementation.

## Technical Notes
- Keep `SiteDesignContract` as the authority; the new affinity layer is a projection, not a new registry.
- Preserve the selected/sealed Art Direction Pack and design seed.
- Record the guard policy in `AGENTS.md` because it is an architectural boundary.
