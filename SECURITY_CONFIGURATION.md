# 🔐 Security Configuration Guide

This document outlines the proper usage of API keys and secrets in the Unison Tasks application.

## 🟢 CLIENT-SIDE KEYS (Safe for Browser Exposure)

These keys are prefixed with `VITE_` and are safe to expose to the browser:

### ✅ Supabase Publishable Keys
```bash
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJ..." # Anonymous/Public key - safe for browser
```

**Why it's safe:**
- Supabase publishable keys (also called "anon" keys) are designed for client-side use
- They only allow operations permitted by Row Level Security (RLS) policies
- Cannot access sensitive database operations without proper authentication

### ✅ Configuration Flags
```bash
VITE_AI_ENABLED=true
VITE_AI_PROVIDER=lovable
VITE_VERCEL_OIDC_TOKEN="..." # Deploy token - scoped to specific project
```

## 🔴 SERVER-SIDE SECRETS (Never Expose to Browser)

These keys must ONLY be set in Supabase Edge Functions secrets:

### ❌ AI API Keys (Server-only)
```bash
# Set these using Supabase CLI - NEVER in .env files
supabase secrets set LOVABLE_API_KEY="your_lovable_api_key"
supabase secrets set OPENAI_API_KEY="sk-your_openai_key"
```

**Why they're secret:**
- Direct access to AI providers with usage costs
- Can be used to access AI services on your behalf
- Should only be accessible from authenticated server functions

### ❌ Database Service Role Keys (Server-only)
```bash
# These bypass RLS and should never be client-accessible
SUPABASE_SERVICE_ROLE_KEY="..." # Never expose this
DATABASE_URL="..." # Connection strings with credentials
```

## 📁 File Security Status

### ✅ Safe Files (Can be committed)
- `.env.example` - Template with placeholder values
- Client configuration in source code using `VITE_*` variables

### ❌ Secret Files (Must be gitignored)
- `.env` - Contains actual keys
- `.env.local` - Local development overrides
- `.env.production` - Production secrets
- Any file with actual API keys or tokens

## 🛡️ Security Best Practices

### 1. Environment Variable Naming
```bash
# ✅ Client-safe (VITE_ prefix)
VITE_SUPABASE_PUBLISHABLE_KEY="..."
VITE_API_BASE_URL="..."

# ❌ Server-only (no VITE_ prefix)
LOVABLE_API_KEY="..."
DATABASE_PASSWORD="..."
```

### 2. Supabase Edge Functions
```typescript
// ✅ Proper secret handling in Edge Functions
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
if (!LOVABLE_API_KEY) {
  return new Response("AI not configured", { status: 503 });
}
```

### 3. Client-Side Configuration
```typescript
// ✅ Safe client configuration
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY // Safe for browser
);
```

## 🔍 How to Verify Your Setup

### Check Environment Variables
```bash
# ✅ Should see only VITE_ prefixed variables in browser
console.log(import.meta.env);

# ✅ Should NOT see server secrets in browser console
```

### Validate Key Types
1. **Supabase Publishable Key**: Should have `"role": "anon"` in JWT payload
2. **AI Keys**: Should start with known prefixes (`sk-` for OpenAI, `lovable_` for Lovable)
3. **No Service Role Keys**: Should never see `"role": "service_role"` in client

### Test Security
```bash
# ✅ This should work (publishable key)
curl -H "apikey: YOUR_PUBLISHABLE_KEY" https://your-project.supabase.co/rest/v1/

# ❌ This should fail from client (service role would bypass security)
```

## 🚨 Security Checklist

- [ ] All client variables use `VITE_` prefix
- [ ] No server secrets in `.env` files that get committed
- [ ] Supabase RLS policies are properly configured
- [ ] AI keys are only in Supabase Edge Functions secrets
- [ ] `.env*` files are properly gitignored
- [ ] No sensitive keys in documentation or README files
- [ ] Deploy tokens are scoped to specific projects/environments

## 📞 Emergency Response

If you accidentally expose a secret:

1. **Immediately rotate** the compromised key
2. **Update** all deployment environments
3. **Check git history** for any commits containing the key
4. **Review logs** for potential unauthorized usage
5. **Update documentation** to reflect new keys

---

✅ **Current Status**: All secrets are properly configured with publishable keys for client-side use and secure server-side secret management.