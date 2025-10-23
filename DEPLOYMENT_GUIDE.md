# Production Deployment Guide - Lovable AI Compatible

## ✅ Pre-Deployment Checklist

### 1. Environment Variables
The following environment variables are **automatically configured** in Lovable Cloud:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Your Supabase anon/public key
- `VITE_SUPABASE_PROJECT_ID` - Your Supabase project ID

### 2. Supabase Edge Functions
All AI-powered edge functions are configured in `supabase/config.toml`:
- ✅ `ai-code-assistant` - Main AI coding assistant
- ✅ `ai-web-assistant` - Web design AI helper
- ✅ `ai-design-assistant` - Design generation AI
- ✅ `web-builder-ai` - Web builder AI features
- ✅ `generate-ai-template` - Template generation
- ✅ `generate-template` - Legacy template generation
- ✅ `generate-template-image` - AI image generation for templates
- ✅ `generate-image` - General AI image generation
- ✅ `generate-page` - Page schema generation
- ✅ `copy-rewrite` - Copy rewriting AI

All functions are configured with `verify_jwt = false` for public access.

### 3. Lovable AI Integration
This project uses **Lovable AI Gateway** for all AI features:
- ✅ No API keys required from users
- ✅ `LOVABLE_API_KEY` is auto-provisioned in Supabase
- ✅ Uses `google/gemini-2.5-flash` as default model
- ✅ Proper rate limiting and error handling

## 🚀 Deployment Steps

### For Lovable Platform (Recommended)
1. Click the **Publish** button in the Lovable editor
2. Your app will be automatically deployed with all configurations
3. Environment variables are automatically injected
4. Edge functions are automatically deployed

### For External Platforms (Vercel/Netlify)

#### Vercel
1. Connect your GitHub repository to Vercel
2. Set Framework Preset to **Vite**
3. Add these environment variables in Vercel dashboard:
   ```
   VITE_SUPABASE_URL=https://oruwtgdjurstvhgqcvbv.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=<your-key>
   VITE_SUPABASE_PROJECT_ID=oruwtgdjurstvhgqcvbv
   ```
4. Deploy!

#### Netlify
1. Connect your GitHub repository to Netlify
2. Build settings are pre-configured in `netlify.toml`
3. Add environment variables in Netlify dashboard (same as above)
4. Deploy!

## 🔧 Troubleshooting

### AI Assistant Not Loading
**Symptoms:**
- Console errors about missing environment variables
- AI features showing "unavailable" messages

**Solutions:**
1. **In Lovable Preview:** Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
2. **Check Console:** Open DevTools and verify env vars are loaded
3. **Rebuild:** Trigger a new build to refresh environment
4. **Verify .env:** Ensure `.env` file exists with correct values

### Environment Variables Not Loading
**Root Cause:** Vite needs a restart/rebuild to pick up `.env` changes

**Fix:**
```bash
# For local development
npm run dev

# For production build
npm run build
```

### Edge Functions Failing
**Check:**
1. All functions are listed in `supabase/config.toml`
2. `LOVABLE_API_KEY` is configured in Supabase secrets
3. Functions are deployed (automatic in Lovable Cloud)

**Test Edge Functions:**
```bash
# Check function deployment
curl https://oruwtgdjurstvhgqcvbv.supabase.co/functions/v1/ai-code-assistant \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"hello"}]}'
```

### Rate Limiting (429 Error)
- Lovable AI has rate limits per workspace
- Upgrade your Lovable plan for higher limits
- Add time delays between AI requests

### Payment Required (402 Error)
- You've exhausted free AI credits
- Add credits in Lovable Settings → Workspace → Usage

## 📊 Performance Optimization

### Code Splitting
The project uses advanced code splitting in `vite.config.ts`:
- Core libraries bundled separately
- Heavy tools (Monaco, Fabric.js) lazy-loaded
- UI components in separate chunks
- Optimal for production performance

### Build Commands
```bash
# Standard production build
npm run build

# Development build (faster, no minification)
npm run build:dev

# Analyze bundle size
npm run build:analyze
```

## 🔐 Security

### CORS Configuration
All edge functions have proper CORS headers:
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

### Content Security Policy
Configured in `public/_headers` and deployment configs.

### Authentication
- Supabase Auth integrated
- JWT tokens handled automatically
- Public functions don't require auth (as configured)

## 📱 Testing Deployment

1. **Local Testing:**
   ```bash
   npm run build
   npm run preview
   ```

2. **Production Check:**
   - Visit your deployed URL
   - Open DevTools Console
   - Verify no environment variable errors
   - Test AI assistant panel
   - Test all AI features

## 🆘 Support

If issues persist:
1. Check Lovable documentation: https://docs.lovable.dev
2. Review edge function logs in Supabase dashboard
3. Contact support: support@lovable.dev

## ✨ Features Ready for Production

✅ Full AI assistant integration
✅ Web builder with AI
✅ Design studio with AI
✅ Code editor with AI completion
✅ Template generation
✅ Image generation
✅ Copy rewriting
✅ Real-time collaboration ready
✅ Responsive design
✅ Production-optimized builds
✅ Security headers configured
✅ Performance optimized

---

**Last Updated:** 2025-10-23
**Lovable AI Version:** google/gemini-2.5-flash
**Supabase Project:** oruwtgdjurstvhgqcvbv
