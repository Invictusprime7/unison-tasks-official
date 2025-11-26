#!/bin/bash

# Script to add OpenAI API key to Supabase Edge Function secrets

set -e

PROJECT_REF="nfrdomdvyrbwuokathtw"

echo "=========================================="
echo "Add OpenAI API Key to Supabase"
echo "=========================================="
echo ""

# Check if logged in
if ! supabase projects list &> /dev/null; then
  echo "Not logged in. Please login first..."
  echo ""
  echo "Get your access token from: https://supabase.com/dashboard/account/tokens"
  echo ""
  read -p "Enter your access token: " ACCESS_TOKEN
  
  if [ -z "$ACCESS_TOKEN" ]; then
    echo "Error: Access token is required"
    exit 1
  fi
  
  echo "$ACCESS_TOKEN" | supabase login
  echo ""
fi

# Link project if not linked
if ! supabase status &> /dev/null; then
  echo "Linking to project $PROJECT_REF..."
  supabase link --project-ref "$PROJECT_REF"
  echo ""
fi

# Prompt for OpenAI API key
echo "Enter your OpenAI API key:"
echo "(Get it from: https://platform.openai.com/api-keys)"
echo ""
read -s -p "OpenAI API Key (starts with sk-): " OPENAI_KEY
echo ""

if [ -z "$OPENAI_KEY" ]; then
  echo "Error: OpenAI API key is required"
  exit 1
fi

if [[ ! "$OPENAI_KEY" =~ ^sk- ]]; then
  echo "Warning: OpenAI API key should start with 'sk-'"
  read -p "Continue anyway? (y/n): " CONTINUE
  if [ "$CONTINUE" != "y" ]; then
    exit 1
  fi
fi

# Set the secret
echo ""
echo "Adding OPENAI_API_KEY to Supabase secrets..."
supabase secrets set OPENAI_API_KEY="$OPENAI_KEY"

echo ""
echo "✓ OpenAI API key added successfully!"
echo ""
echo "Next steps:"
echo "1. Deploy your edge function: supabase functions deploy ai-code-assistant --no-verify-jwt"
echo "2. Or run full setup: ./supabase-setup.sh"
echo ""
