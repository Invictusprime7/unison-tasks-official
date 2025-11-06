#!/bin/bash

# ==============================================================================
# Force Update Vercel Environment Variables
# ==============================================================================
# This script forcefully removes and re-adds environment variables

set -e

echo "🔧 Force Updating Vercel Environment Variables"
echo "==============================================="
echo ""

cd /workspaces/unison-tasks-24334-81331

# Environment variables from .env.development
SUPABASE_URL="https://oruwtgdjurstvhgqcvbv.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ydXd0Z2RqdXJzdHZoZ3FjdmJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyOTE5NzIsImV4cCI6MjA3NTg2Nzk3Mn0.aOV9uab2niXhszfqCg81yzDRDg1-15XS9BL3-2bhhYM"
SUPABASE_PROJECT_ID="oruwtgdjurstvhgqcvbv"

echo "⚠️  This will REMOVE and RE-ADD all Supabase environment variables"
echo ""
echo "Variables to update:"
echo "  • VITE_SUPABASE_URL"
echo "  • VITE_SUPABASE_PUBLISHABLE_KEY"
echo "  • VITE_SUPABASE_PROJECT_ID"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Aborted"
    exit 1
fi

echo ""
echo "🗑️  Step 1: Removing old variables..."
echo ""

# Remove VITE_SUPABASE_URL
echo "Removing VITE_SUPABASE_URL..."
echo "yes" | vercel env rm VITE_SUPABASE_URL production preview development 2>&1 | tail -3

# Remove VITE_SUPABASE_PUBLISHABLE_KEY
echo "Removing VITE_SUPABASE_PUBLISHABLE_KEY..."
echo "yes" | vercel env rm VITE_SUPABASE_PUBLISHABLE_KEY production preview development 2>&1 | tail -3

# Remove VITE_SUPABASE_PROJECT_ID
echo "Removing VITE_SUPABASE_PROJECT_ID..."
echo "yes" | vercel env rm VITE_SUPABASE_PROJECT_ID production preview development 2>&1 | tail -3

echo ""
echo "✅ Old variables removed"
echo ""
echo "➕ Step 2: Adding new variables with correct values..."
echo ""

# Add VITE_SUPABASE_URL
echo "Adding VITE_SUPABASE_URL to production..."
echo "$SUPABASE_URL" | vercel env add VITE_SUPABASE_URL production 2>&1 | grep -v "^Vercel CLI" | tail -2

echo "Adding VITE_SUPABASE_URL to preview..."
echo "$SUPABASE_URL" | vercel env add VITE_SUPABASE_URL preview 2>&1 | grep -v "^Vercel CLI" | tail -2

echo "Adding VITE_SUPABASE_URL to development..."
echo "$SUPABASE_URL" | vercel env add VITE_SUPABASE_URL development 2>&1 | grep -v "^Vercel CLI" | tail -2

echo ""

# Add VITE_SUPABASE_PUBLISHABLE_KEY
echo "Adding VITE_SUPABASE_PUBLISHABLE_KEY to production..."
echo "$SUPABASE_KEY" | vercel env add VITE_SUPABASE_PUBLISHABLE_KEY production 2>&1 | grep -v "^Vercel CLI" | tail -2

echo "Adding VITE_SUPABASE_PUBLISHABLE_KEY to preview..."
echo "$SUPABASE_KEY" | vercel env add VITE_SUPABASE_PUBLISHABLE_KEY preview 2>&1 | grep -v "^Vercel CLI" | tail -2

echo "Adding VITE_SUPABASE_PUBLISHABLE_KEY to development..."
echo "$SUPABASE_KEY" | vercel env add VITE_SUPABASE_PUBLISHABLE_KEY development 2>&1 | grep -v "^Vercel CLI" | tail -2

echo ""

# Add VITE_SUPABASE_PROJECT_ID
echo "Adding VITE_SUPABASE_PROJECT_ID to production..."
echo "$SUPABASE_PROJECT_ID" | vercel env add VITE_SUPABASE_PROJECT_ID production 2>&1 | grep -v "^Vercel CLI" | tail -2

echo "Adding VITE_SUPABASE_PROJECT_ID to preview..."
echo "$SUPABASE_PROJECT_ID" | vercel env add VITE_SUPABASE_PROJECT_ID preview 2>&1 | grep -v "^Vercel CLI" | tail -2

echo "Adding VITE_SUPABASE_PROJECT_ID to development..."
echo "$SUPABASE_PROJECT_ID" | vercel env add VITE_SUPABASE_PROJECT_ID development 2>&1 | grep -v "^Vercel CLI" | tail -2

echo ""
echo "✅ All variables updated!"
echo ""
echo "📋 Verification:"
vercel env ls
echo ""
echo "🚀 Now you can deploy: vercel --prod"
echo ""
