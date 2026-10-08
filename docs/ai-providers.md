# Unison AI provider configuration

Current source reference, reviewed 2026-10-08. Routing is task-, mode-, model- and configuration-dependent. This review did not read hosted secret values or confirm provider funding; defaults are not proof of a deployment's active settings.

## Canonical text/code endpoint

App Builder and Builder source editing use the existing `ai-code-assistant` function. Composer modes `site-page-author`, `site-page-repair` and `builder-source-edit` share `composerLane.ts` and the mirrored AI Composer response contract. Do not add a parallel generation endpoint.

Routing and transport live in `supabase/functions/_shared/providerRouter.ts`, `aiProviderLoop.ts` and `ai/providerClient.ts`. Rules are recorded in `_shared/AGENTS.md`.

| Task/configuration | Source behavior |
| --- | --- |
| Hybrid launch page author/repair | Managed Lovable gateway leads when its credential is configured and mode is not `gemini-primary`; funded direct Gemini is the intended backup |
| Builder source edit | Configured direct Gemini is prioritized; remaining configured providers/gateway provide fallback |
| `AI_PROVIDER_MODE=gemini-primary` | Disables the hybrid gateway lead for Composer launch tasks |
| Explicit supported model | Influences the planned model order; fallback policy/available credentials still matter |
| Other automatic tasks | Can use stable weighted direct-provider selection; not the universal Composer policy |
| Gemini-exclusive policy | Uses existing mode logic to restrict direct fallback availability |

`GEMINI_COMPOSER_MODEL` controls direct composition; `GEMINI_MODEL` is the unspecified-Gemini default. Source defaults currently name `gemini-3.8-flash`; model availability must be verified against the configured provider account. OpenAI plans include GPT-4.1; older retained GPT-5 menu choices are normalized in routing. These are source names, not an assertion that every gateway supports them.

`AI_PROVIDER_DISTRIBUTION` describes weighted eligible direct routing on paths that use it. It does not override the protected Composer hybrid lead or turn all requests into a 50/50 runtime.

## Deadlines and failures

Provider attempts share bounded request deadlines. Current gateway-first handling preserves most of the lead budget rather than equally splitting it across unusable backups. Direct providers reporting depleted billing/quota are skipped for 15 minutes in the running isolate; this is not a durable account-wide blacklist. Transient rate limits and transport timeouts are different failure classes.

App Builder page authoring has its own bounded budget/repair rules; final closure review can be skipped when too little deadline remains. Increasing a timeout does not fund a backup, guarantee a response or authorize accepting invalid source. Consult the current orchestrator and logs rather than treating old timeout incident notes as global settings.

If all eligible attempts fail, the endpoint surfaces `ai_unavailable`/provider failure. Inspect task, planned order, deadline, timeout, credit and authentication separately. A generic deterministic replacement site is not an allowed fresh-launch recovery.

## Images and other features

Toolbar image generation reuses the existing `generate-image` function and storage flow, not the text-provider loop. It requires the image provider's configured credentials/funding. Storage can return long-lived signed asset links; they expire and should not be described as permanent public URLs. Text fallback does not imply image fallback or retry behavior.

Legacy/task-specific chat, copy, automation and design functions can retain their own transports. Their presence does not change canonical App Builder source authorship.

## Secrets and operations

Managed credentials belong in Lovable Cloud server-side secrets. Never place provider keys in `VITE_*`, browser storage, source control or documentation. Managed database/service-role credentials are not obtainable from Lovable Cloud. Separate self-hosted/local environments use their own server configuration and deployment tooling; do not copy managed identifiers or ask users to retrieve unavailable credentials.

See [AI setup](AI_SETUP_GUIDE.md) for diagnosis and validation boundaries. No functions or credentials were changed as part of this documentation refresh.
