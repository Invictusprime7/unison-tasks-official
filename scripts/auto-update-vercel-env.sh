#!/bin/bash

# ==============================================================================
# Automated Vercel Environment Variables Update
# ==============================================================================
# This script uses Vercel CLI to automatically update environment variables

set -e

echo "🚀 Automated Vercel Environment Variables Update"
echo "=================================================="
echo ""

# Load project info
cd /workspaces/unison-tasks-24334-81331

# Check if linked
if [ ! -f ".vercel/project.json" ]; then
    echo "❌ Project not linked. Run: vercel link"
    exit 1
fi

# Extract project ID
PROJECT_ID=$(cat .vercel/project.json | grep -o '"projectId":"[^"]*"' | cut -d'"' -f4)
TEAM_ID=$(cat .vercel/project.json | grep -o '"orgId":"[^"]*"' | cut -d'"' -f4)

echo "📋 Project ID: $PROJECT_ID"
echo "📋 Team ID: $TEAM_ID"
echo ""

# Environment variables from .env.development
SUPABASE_URL="https://oruwtgdjurstvhgqcvbv.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ydXd0Z2RqdXJzdHZoZ3FjdmJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyOTE5NzIsImV4cCI6MjA3NTg2Nzk3Mn0.aOV9uab2niXhszfqCg81yzDRDg1-15XS9BL3-2bhhYM"
SUPABASE_PROJECT_ID="oruwtgdjurstvhgqcvbv"

echo "🔄 Removing old environment variables..."
echo ""

# Function to safely remove env var
remove_env() {
    local name=$1
    echo "  Removing $name from all environments..."
    echo "yes" | vercel env rm "$name" production preview development 2>/dev/null || echo "    (already removed or doesn't exist)"
}

# Remove old variables
remove_env "VITE_SUPABASE_URL"
remove_env "VITE_SUPABASE_PUBLISHABLE_KEY"
remove_env "VITE_SUPABASE_PROJECT_ID"

echo ""
echo "✅ Old variables removed"
echo ""
echo "➕ Adding new environment variables..."
echo ""

# Function to add env variable to specific environment
add_env_to_environment() {
    local name=$1
    local value=$2
    local env=$3
    
    echo "  Adding $name to $env..."
    echo "$value" | vercel env add "$name" "$env" 2>&1 | grep -v "^Vercel CLI" || true
}

# Add VITE_SUPABASE_URL
echo "📦 Adding VITE_SUPABASE_URL..."
add_env_to_environment "VITE_SUPABASE_URL" "$SUPABASE_URL" "production"
add_env_to_environment "VITE_SUPABASE_URL" "$SUPABASE_URL" "preview"
add_env_to_environment "VITE_SUPABASE_URL" "$SUPABASE_URL" "development"
echo "  ✅ VITE_SUPABASE_URL added to all environments"
echo ""

# Add VITE_SUPABASE_PUBLISHABLE_KEY
echo "📦 Adding VITE_SUPABASE_PUBLISHABLE_KEY..."
add_env_to_environment "VITE_SUPABASE_PUBLISHABLE_KEY" "$SUPABASE_KEY" "production"
add_env_to_environment "VITE_SUPABASE_PUBLISHABLE_KEY" "$SUPABASE_KEY" "preview"
add_env_to_environment "VITE_SUPABASE_PUBLISHABLE_KEY" "$SUPABASE_KEY" "development"
echo "  ✅ VITE_SUPABASE_PUBLISHABLE_KEY added to all environments"
echo ""

# Add VITE_SUPABASE_PROJECT_ID
echo "📦 Adding VITE_SUPABASE_PROJECT_ID..."
add_env_to_environment "VITE_SUPABASE_PROJECT_ID" "$SUPABASE_PROJECT_ID" "production"
add_env_to_environment "VITE_SUPABASE_PROJECT_ID" "$SUPABASE_PROJECT_ID" "preview"
add_env_to_environment "VITE_SUPABASE_PROJECT_ID" "$SUPABASE_PROJECT_ID" "development"
echo "  ✅ VITE_SUPABASE_PROJECT_ID added to all environments"
echo ""

echo "🎉 All environment variables updated successfully!"
echo ""
echo "📋 Verification:"
vercel env ls
echo ""
echo "🚀 Ready to deploy! Run: vercel --prod"
echo ""
