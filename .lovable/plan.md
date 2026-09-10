# Remove legacy repair and fallback authorities

## Goal
Keep one generation path:

```text
LauncherWizard
  -> launchOrchestrator
  -> industry SiteConfiguration + registered Art Direction Pack
  -> canonical compiler
  -> Stage 4b
  -> validation-only preflight
  -> sealed SiteBundleSnapshot
  -> commitMutation
  -> Builder preview
```

Generated pages must come only from the signed industry-aware composition contract and registered implementations. No post-compile repair, quarantine page, canonical-page substitution, or permissive merge may author or alter page bodies.

## Implementation

1. **Make preflight validation-only**
   - Replace syntax “repair” use in the canonical launch and commit paths with parse diagnostics that preserve source bytes.
   - Keep structural, import, runtime, intent, experience, and visual checks, but fail the launch or commit when they detect defects.
   - Remove quarantine component generation and deterministic source-rewrite passes from active architecture.

2. **Remove fallback controls from canonical launch assembly**
   - Delete `allowCanonicalPageFallback` and `allowQuarantine` from production APIs.
   - Make registered-page closure unconditional for snapshot-backed launches.
   - Simplify generated/snapshot convergence so identical canonical pages are accepted and conflicting/missing bodies fail explicitly.

3. **Move canonical transformations before final Stage 4b**
   - Keep required intent closure, forbidden-intent enforcement, navigation binding, runtime modules, and experience metadata as canonical compiler inputs or deterministic projections.
   - Run Stage 4b once after the last permitted source transformation.
   - Run a final immutable acceptance pass before sealing.

4. **Complete industry-aware registry wiring**
   - Route remaining industry art-pack resolution through `designImplementationRegistry`.
   - Require every selected industry section and variant to resolve to a registered implementation before compilation.
   - Preserve `SiteConfiguration`, art-pack identity, implementation identity, and generation brief through rebuilds and commits.

5. **Retire proven legacy surfaces**
   - Remove dead repair/fallback exports, obsolete comments, tests that expect substitution, and callers that pass retired switches.
   - Preserve live compatibility readers only where persisted older drafts still require them; they may migrate metadata but cannot author page source.

6. **Certification**
   - Add regression tests proving malformed, missing, conflicting, or unregistered pages fail without mutation.
   - Add industry registry closure tests across all supported industries.
   - Run focused tests, architecture lints, type checks, production build, and a signed-in Wizard-to-Builder browser journey when authentication is available.

## Guardrails
- No new parallel registry, recipe folder, renderer, snapshot store, or launch path.
- Do not remove working capabilities, interactions, runtime modules, or persisted legacy read compatibility.
- `commitMutation` remains the only write boundary; `SiteBundleSnapshot` remains canonical.
