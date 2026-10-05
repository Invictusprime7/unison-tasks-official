# App Builder restoration — October 4, 2026

Restoration source: `d6c053ea68ada2b6ca4691d465fa33d5dbf0fc4d`, the latest October 2 snapshot (8:49 p.m. America/Chicago), titled **Wired auth and saved data**.

The application authoring contracts, generation context, design-source selection/materialization, candidate validator, page authoring and repair loops, launch integration, and Composer authoring lane were restored together. Their matching tests were restored as well. The experimental Wizard-intention module and its new validation rules were archived outside the repository.

The homepage chatbox Wizard, saved-project persistence, database migrations and current Supabase project were preserved. Funded Gemini remains primary, with configured OpenAI/Lovable hybrid fallbacks. The provider transport fixes remain; the Composer authoring branch and lane use the October 2 implementation. Homepage discovery and scoped Builder editing continue using their existing routes.

Verification:

- The historical snapshot passed 57 App Builder and launch tests in an isolated checkout.
- The restored working tree passed 78 targeted application tests, including the chatbox Wizard, and 29 provider routing/failover tests.
- A live authenticated `UnisonAppBuilder.generate` test used a real canonical four-page plan and the deployed Supabase function. Home, Gallery, Services and Contact were authored; Contact repaired an invalid import/prop through the normal repair loop.
- The complete application candidate returned `ready-for-commit`, `stopReason: complete`, `closure.ok: true`, and no rejection diagnostics in 100.5 seconds. No canonical revision or user site was persisted. The temporary test account was removed.
- The historical validator reported non-blocking shared-navigation advisories; this test does not assert that every generated navigation control is correct.
- Client TypeScript, edge TypeScript and the production build passed. The stale portable recipe artifact was regenerated locally from the preserved component sources before building.

The pre-restoration tracked patch, changed/untracked files, restoration manifest and full live-test candidate/report are backed up at:

`C:/Users/emman/.codex/backups/unison-before-oct2-restore-1791161788569/`

This restores a tested historical implementation; it does not establish that every possible AI generation or historical project was error-free.
