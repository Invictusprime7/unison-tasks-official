#!/bin/bash

# ==============================================================================
# Update Vercel Environment Variables
# ==============================================================================
# This script removes old environment variables and adds the correct ones

set -e

echo "🔧 Updating Vercel Environment Variables..."
echo ""

# Correct Supabase values from .env.development
SUPABASE_URL="https://oruwtgdjurstvhgqcvbv.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ydXd0Z2RqdXJzdHZoZ3FjdmJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyOTE5NzIsImV4cCI6MjA3NTg2Nzk3Mn0.aOV9uab2niXhszfqCg81yzDRDg1-15XS9BL3-2bhhYM"
SUPABASE_PROJECT_ID="oruwtgdjurstvhgqcvbv"

echo "📋 Current values in .env.development:"
echo "   VITE_SUPABASE_URL=$SUPABASE_URL"
echo "   VITE_SUPABASE_PROJECT_ID=$SUPABASE_PROJECT_ID"
echo ""

echo "⚠️  You need to manually update these in the Vercel Dashboard:"
echo ""
echo "1. Go to: https://vercel.com/unrealdev02s-projects/unison--tasks/settings/environment-variables"
echo ""
echo "2. Update or add these environment variables for Production, Preview, and Development:"
echo ""
echo "   VITE_SUPABASE_URL"
echo "   Value: $SUPABASE_URL"
echo ""
echo "   VITE_SUPABASE_PUBLISHABLE_KEY"
echo "   Value: $SUPABASE_KEY"
echo ""
echo "   VITE_SUPABASE_PROJECT_ID"
echo "   Value: $SUPABASE_PROJECT_ID"
echo ""
echo "3. After updating, redeploy: vercel --prod"
echo ""
echo "📝 Opening Vercel dashboard in browser..."

# Open browser if available
if command -v xdg-open &> /dev/null; then
    xdg-open "https://vercel.com/unrealdev02s-projects/unison--tasks/settings/environment-variables"
elif command -v open &> /dev/null; then
    open "https://vercel.com/unrealdev02s-projects/unison--tasks/settings/environment-variables"
fi
