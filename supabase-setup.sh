#!/bin/bash

# Supabase Project Setup Script
# This script will help you deploy edge functions and run migrations

set -e

PROJECT_REF="nfrdomdvyrbwuokathtw"
PROJECT_URL="https://nfrdomdvyrbwuokathtw.supabase.co"

echo "=========================================="
echo "Supabase Project Setup"
echo "=========================================="
echo ""
echo "Project: $PROJECT_REF"
echo "URL: $PROJECT_URL"
echo ""

# Step 1: Login
echo "Step 1: Logging in to Supabase..."
echo ""
echo "Please provide your Supabase Access Token"
echo "Generate one at: https://supabase.com/dashboard/account/tokens"
echo ""
read -p "Enter your access token: " ACCESS_TOKEN

if [ -z "$ACCESS_TOKEN" ]; then
  echo "Error: Access token is required"
  exit 1
fi

# Login with access token
echo "$ACCESS_TOKEN" | supabase login

echo ""
echo "✓ Logged in successfully"
echo ""

# Step 2: Link project
echo "Step 2: Linking to project..."
supabase link --project-ref "$PROJECT_REF"
echo ""
echo "✓ Project linked successfully"
echo ""

# Step 3: Check for OpenAI API key
echo "Step 3: OpenAI API Key Setup"
echo ""
echo "⚠️  IMPORTANT: You need to add your OpenAI API key to Supabase secrets"
echo ""
echo "Do this manually in the Supabase Dashboard:"
echo "1. Go to: https://supabase.com/dashboard/project/$PROJECT_REF/settings/functions"
echo "2. Click 'Edge Functions' in the sidebar"
echo "3. Add a new secret:"
echo "   - Name: OPENAI_API_KEY"
echo "   - Value: your-openai-api-key (starts with sk-)"
echo ""
read -p "Press Enter after you've added the OPENAI_API_KEY secret..."

# Step 4: Run migrations
echo ""
echo "Step 4: Running database migrations..."
supabase db push
echo ""
echo "✓ Migrations applied successfully"
echo ""

# Step 5: Deploy edge function
echo "Step 5: Deploying ai-code-assistant edge function..."
supabase functions deploy ai-code-assistant --no-verify-jwt
echo ""
echo "✓ Edge function deployed successfully"
echo ""

# Step 6: Test the deployment
echo "Step 6: Testing edge function..."
echo ""

ANON_KEY=$(grep VITE_SUPABASE_PUBLISHABLE_KEY .env | cut -d '=' -f2 | tr -d '"')

curl -s "$PROJECT_URL/functions/v1/ai-code-assistant" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"test"}],"mode":"code"}' \
  | head -100

echo ""
echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Start your dev server: pnpm run dev"
echo "2. Test AI Code Assistant in the app"
echo "3. Check edge function logs: supabase functions logs ai-code-assistant"
echo ""
