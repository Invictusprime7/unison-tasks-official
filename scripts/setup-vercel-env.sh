#!/bin/bash

# ==============================================================================
# Vercel Environment Variables Setup Script
# ==============================================================================
# This script automatically adds Supabase environment variables to Vercel
# for all environments (production, preview, development)

set -e

echo "🚀 Setting up Vercel Environment Variables..."
echo ""

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Installing..."
    npm i -g vercel@latest
fi

# Check if logged in
echo "📋 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel. Please run: vercel login"
    exit 1
fi

echo "✅ Logged in to Vercel as: $(vercel whoami)"
echo ""

# Check if project is linked
if [ ! -d ".vercel" ]; then
    echo "🔗 Linking project to Vercel..."
    echo "⚠️  Please follow the prompts to link your project"
    vercel link
    echo ""
fi

# Environment variables from .env.development
SUPABASE_URL="https://oruwtgdjurstvhgqcvbv.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ydXd0Z2RqdXJzdHZoZ3FjdmJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyOTE5NzIsImV4cCI6MjA3NTg2Nzk3Mn0.aOV9uab2niXhszfqCg81yzDRDg1-15XS9BL3-2bhhYM"
SUPABASE_PROJECT_ID="oruwtgdjurstvhgqcvbv"

echo "📦 Adding environment variables to Vercel..."
echo ""

# Function to add env variable to all environments
add_env_var() {
    local name=$1
    local value=$2
    
    echo "➕ Adding $name..."
    
    # Add to production
    echo "$value" | vercel env add "$name" production 2>/dev/null || echo "  ⚠️  $name already exists in production (skipping)"
    
    # Add to preview
    echo "$value" | vercel env add "$name" preview 2>/dev/null || echo "  ⚠️  $name already exists in preview (skipping)"
    
    # Add to development
    echo "$value" | vercel env add "$name" development 2>/dev/null || echo "  ⚠️  $name already exists in development (skipping)"
    
    echo "  ✅ $name configured"
    echo ""
}

# Add all Supabase environment variables
add_env_var "VITE_SUPABASE_URL" "$SUPABASE_URL"
add_env_var "VITE_SUPABASE_PUBLISHABLE_KEY" "$SUPABASE_KEY"
add_env_var "VITE_SUPABASE_PROJECT_ID" "$SUPABASE_PROJECT_ID"

echo "🎉 All environment variables added successfully!"
echo ""
echo "📝 Next steps:"
echo "   1. Deploy to Vercel: vercel --prod"
echo "   2. Or let GitHub auto-deploy on push"
echo ""
echo "🌐 View your project: vercel ls"
