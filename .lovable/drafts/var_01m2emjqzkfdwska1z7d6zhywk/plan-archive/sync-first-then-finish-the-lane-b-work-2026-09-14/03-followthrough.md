## Step 3 — Follow through on the three fixes from the notes

**Model names.** You asked to match the notes: the AI helpers switch to `gpt-4o`, `gpt-4o-mini` and `gemini-2.5-flash`, including the model choices shown in the builder's AI options. One caveat I want on the record before I do it: some of these calls run through Lovable's managed AI, where `gpt-4o` is not an accepted name and will be rejected. So I will switch every call that goes to OpenAI directly with your own key, and for any call that goes through the managed route I will use its nearest accepted equivalent and tell you exactly which ones those were. No call is left pointing at a name its provider rejects.

**Provider fallback.** The gemini-only guard is loosened so that when OpenAI keys are configured, OpenAI can serve requests and act as fallback, and Gemini can fall back to OpenAI in turn.

**Session eviction.** The abrupt local sign-out on a transient token refresh timeout is removed, so a slow refresh mid-generation no longer dumps the signed-in session.

## Step 4 — Verify and redeploy

- run the type check, the architecture lints, and the test suites
- redeploy the affected backend functions
- send one real request through each AI path that changed and read the response, rather than trusting the model name swap on faith

## Technical details

- Verification commands: `npm run type-check`, `npm run lint:pipeline-bypass`, `npm run lint:single-source-of-truth`, plus any lint scripts that arrive with the sync, and the vitest suites under `src/test/`.
- Model routing lives in the AI code assistant function's provider layer and in `AIGatewayOptions.tsx`; the managed-gateway caveat applies wherever the request targets `ai.gateway.lovable.dev`.
- Session handling change is in `src/services/builderBrainClient.ts`.
- The notes' `npx supabase functions deploy` steps run from your machine against your own project; deploys from here go through this project's own backend, so I will name which functions I redeploy.

## Out of scope

- Rewriting the Lane B enrichment from scratch here — it arrives with the sync.
- Any schema change; none of the above needs one.
