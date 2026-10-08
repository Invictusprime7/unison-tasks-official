# Unison AI setup and diagnosis

Active guide, reviewed 2026-10-08. Managed Lovable AI is supported without asking users to supply a personal provider key. Existing direct text/image integrations can require separate funded credentials; their presence is not evidence they are usable.

## Configure the correct surface

- App Builder page authoring/repair and Builder source edits use `ai-code-assistant` and the shared task-specific provider router.
- Image generation uses the existing `generate-image` function and its image-provider/storage path.
- The floating toolbar sends AI source requests through AI Builder rather than owning a separate provider configuration.
- Public frontend connection values come from the intended backend configuration; privileged/provider keys remain server-side.

See [AI providers](ai-providers.md) for hybrid launch lead, direct Gemini editing, mode overrides, model source defaults and quota cooldown. Do not apply historical OpenAI-primary or 50/50 instructions as a universal current policy.

## Diagnose by failure class

| Symptom | Inspect |
| --- | --- |
| Failed to send request | Function reachability, CORS preflight/origin/client headers, network and session |
| Provider timed out / `ai_unavailable` | Actual task deadline, planned providers, server logs and usable fallback budget |
| Provider quota/billing response | Funded provider availability; a configured key alone is insufficient |
| Unauthorized/refused edit | Session, resource/business permissions and operation validation |
| Missing item | Provenance, registered resource, business scope and successful read response |
| Saved but preview unchanged | Accepted revision, projection, displayed route, preview load signal and live record binding |

Shared CORS allows supported Lovable preview origins and platform/runtime client headers. A transport error is not proof that a saved record does not exist.

## Managed versus local operation

Use Lovable Cloud secret/deployment controls for this managed project. Do not use outdated guides containing an old backend URL or request unavailable managed database passwords/service-role keys. Local or independently hosted functions require their own server-only configuration; inspect existing scripts before use, because historical setup scripts are not a statement of current managed settings.

## Verification

A model identifier, configured credential, passing unit test or increased timeout does not prove a live launch. Verify a full authenticated site creation through preview opening and revision reload. For edits, load the real site, select the intended item, apply the request and read back the saved result. Record editing additionally needs save/preview/Undo verification.

This documentation update did not change secrets, deploy functions or rerun a full generation. Hosted browser verification remains outstanding. Track evidence and blockers in [roadmap](../roadmap.md).
