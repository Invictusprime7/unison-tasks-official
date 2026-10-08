# Vercel frontend configuration

Active configuration guidance, reviewed 2026-10-08. Old hardcoded backend identifiers and undocumented feature-flag recommendations have been removed.

## Public frontend settings

Use `.env.example` and `src/integrations/supabase/env.ts` as the configuration reference for the intended backend. Browser settings include `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`; names are infrastructure compatibility identifiers, not instructions to copy values from another deployment.

Configure the same backend and account when two Unison copies must show the same saved projects. Different backends do not live-sync automatically. Frontend redeployment does not migrate project records or deploy server functions.

## Private settings

AI/provider credentials belong in backend function secrets, never frontend `VITE_*` values. Managed Lovable Cloud service-role/database credentials are unavailable to users. Separately hosted server endpoints have their own secret requirements; never expose those in the browser.

## Verify a deployment

Use the repository Vercel configuration and build scripts. Check sign-in redirects for the actual public origin, same-origin preview assets, function CORS and authenticated project reopening. A successful frontend deployment alone does not establish working AI, checkout, data permissions or resource editing.

See [AI setup](AI_SETUP_GUIDE.md), [Preview runtime](PREVIEW_RUNTIME_ARCHITECTURE.md), [Architecture](ARCHITECTURE.md) and [documentation index](README.md). Historical setup guides are references, not current managed-hosting instructions.
