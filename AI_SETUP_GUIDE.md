# AI Functionality Setup Guide

This guide will help you set up the AI features in your application, including the AI Code Assistant.

## 📋 Prerequisites

1. **Supabase Account** - You already have this configured
2. **OpenAI API Key** - Required for AI code generation

## 🔑 Getting Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (it starts with `sk-proj-` or `sk-`)
5. **Important**: Save it somewhere safe - you won't be able to see it again!

## ⚙️ Environment Setup

### Step 1: Configure Local Environment

The main `.env` file is already set up with Supabase variables. The AI features will work through Supabase Edge Functions.

Your current `.env` includes:
```bash
VITE_SUPABASE_URL="https://oruwtgdjurstvhgqcvbv.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_ENABLE_AI_ASSISTANT=true
```

### Step 2: Configure Supabase Edge Function

For the AI Code Assistant to work, you need to set the OpenAI API key in Supabase:

#### Option A: Using Supabase Dashboard (Recommended)
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard/project/oruwtgdjurstvhgqcvbv)
2. Navigate to **Settings** → **Edge Functions** → **Secrets**
3. Add a new secret:
   - Name: `OPENAI_API_KEY`
   - Value: Your OpenAI API key (sk-proj-...)
4. Click **Save**

#### Option B: Using Supabase CLI
```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref oruwtgdjurstvhgqcvbv

# Set the OpenAI API key
supabase secrets set OPENAI_API_KEY=sk-proj-your-key-here
```

### Step 3: Local Development (Optional)

If you want to test Edge Functions locally:

1. Edit `supabase/.env.local` and add your OpenAI key:
   ```bash
   OPENAI_API_KEY=sk-proj-your-key-here
   ```

2. Serve functions locally:
   ```bash
   supabase functions serve ai-code-assistant --env-file supabase/.env.local
   ```

## 🚀 Using the AI Features

### AI Code Assistant

The AI Code Assistant appears at the bottom of the Web Builder page:

1. **Open Web Builder** - Navigate to the Creatives section
2. **Click the AI bar** - Purple/blue bar at the bottom that says "AI Code Assistant"
3. **Choose a mode**:
   - **Generate Code** - Create HTML/JavaScript components
   - **Design Tips** - Get design recommendations
   - **Code Review** - Review and improve existing code

### Example Prompts

**Generate Code:**
- "Create a modern hero section with gradient background"
- "Build a pricing card with three tiers"
- "Generate a contact form with validation"

**Design Tips:**
- "Review my color scheme"
- "Suggest improvements for this layout"
- "Make this design more modern"

**Code Review:**
- "Review this React component"
- "Check for performance issues"
- "Suggest accessibility improvements"

## 🔧 Troubleshooting

### AI Assistant Not Responding

1. **Check Supabase Edge Function**:
   - Go to Supabase Dashboard → Edge Functions
   - Verify `ai-code-assistant` function is deployed
   - Check function logs for errors

2. **Verify OpenAI API Key**:
   - Check Supabase Dashboard → Settings → Edge Functions → Secrets
   - Ensure `OPENAI_API_KEY` is set correctly
   - Try regenerating the key if issues persist

3. **Check Console for Errors**:
   - Open browser Developer Tools (F12)
   - Look for errors in the Console tab
   - Common issues:
     - 402: No credits on OpenAI account
     - 429: Rate limit exceeded
     - 401: Invalid API key

### Rate Limits

- Free tier OpenAI accounts have rate limits
- Consider upgrading to a paid plan for production use
- The Edge Function implements rate limiting (10 requests/minute per user)

## 💰 OpenAI Pricing

- **GPT-4**: ~$0.03 per 1K prompt tokens, ~$0.06 per 1K completion tokens
- **GPT-3.5 Turbo**: ~$0.0015 per 1K prompt tokens, ~$0.002 per 1K completion tokens

For most use cases, the cost is minimal (usually < $0.10 per conversation).

## 📊 Monitoring Usage

1. **OpenAI Dashboard**:
   - Go to [OpenAI Usage](https://platform.openai.com/usage)
   - Monitor API usage and costs

2. **Supabase Logs**:
   - Supabase Dashboard → Edge Functions → Logs
   - View function invocations and errors

## 🔐 Security Best Practices

1. **Never commit API keys** to version control
2. **Use Supabase Secrets** for production Edge Functions
3. **Implement rate limiting** (already configured)
4. **Monitor usage** to avoid unexpected costs
5. **Rotate keys regularly** for security

## 📚 Additional Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Supabase Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Supabase Secrets Management](https://supabase.com/docs/guides/functions/secrets)

## 🆘 Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Review Supabase Edge Function logs
3. Verify your OpenAI API key is valid and has credits
4. Check that all environment variables are set correctly

---

**Status**: 
- ✅ Supabase configured
- ✅ AI Code Assistant component integrated
- ✅ Environment variables documented
- ⏳ OpenAI API key needs to be added to Supabase Secrets
