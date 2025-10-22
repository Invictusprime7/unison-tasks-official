#!/usr/bin/env bash
# Test script for Supabase Edge Function with Deno

#!/usr/bin/env bash
# Test script for Supabase Edge Function with Deno

echo "Testing Deno installation..."
deno --version

echo -e "\nChecking TypeScript compilation..."
cd "$(dirname "$0")/supabase/functions/ai-code-assistant"
deno check index.ts

echo -e "\nDeno setup complete! ✅"
echo "The AI assistant function is ready for deployment to Supabase Edge Functions."