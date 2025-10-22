# Setup OpenAI for AI Assistant Panel
# This script helps configure OpenAI API key and deploy the AI assistant function

Write-Host "🤖 Setting up OpenAI for AI Assistant Panel" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Check if user has OpenAI API key
$openaiKey = Read-Host -Prompt "`nEnter your OpenAI API key (get it from https://platform.openai.com/api-keys)"

if ([string]::IsNullOrWhiteSpace($openaiKey)) {
    Write-Host "❌ No API key provided. Exiting..." -ForegroundColor Red
    exit 1
}

# Validate API key format
if (-not $openaiKey.StartsWith("sk-")) {
    Write-Host "⚠️  Warning: OpenAI API keys usually start with 'sk-'. Please verify your key." -ForegroundColor Yellow
}

Write-Host "`n📋 Next steps to configure your AI Assistant:" -ForegroundColor Green
Write-Host "1. Set the OpenAI API key in your Supabase project"
Write-Host "2. Deploy the updated AI assistant function"
Write-Host "3. Test the AI assistant panel"

Write-Host "`n🔧 Manual configuration steps:" -ForegroundColor Yellow
Write-Host "If you have Supabase CLI installed, run:"
Write-Host "   supabase login" -ForegroundColor Gray
Write-Host "   supabase link --project-ref oruwtgdjurstvhgqcvbv" -ForegroundColor Gray
Write-Host "   supabase secrets set OPENAI_API_KEY=\"$openaiKey\"" -ForegroundColor Gray
Write-Host "   supabase functions deploy ai-code-assistant" -ForegroundColor Gray

Write-Host "`n🌐 Alternative - Supabase Dashboard:" -ForegroundColor Yellow
Write-Host "1. Go to https://supabase.com/dashboard/project/oruwtgdjurstvhgqcvbv/settings/environment-variables"
Write-Host "2. Add new secret: OPENAI_API_KEY = $openaiKey"
Write-Host "3. Go to Edge Functions and redeploy ai-code-assistant"

Write-Host "`n💡 Your OpenAI API key: $openaiKey" -ForegroundColor Cyan
Write-Host "Keep this safe! You can also set it later in Supabase Dashboard." -ForegroundColor Gray

Write-Host "`n✅ AI Assistant will now use OpenAI (gpt-4o-mini model)" -ForegroundColor Green
Write-Host "Cost: ~$0.15 per 1M input tokens, $0.60 per 1M output tokens" -ForegroundColor Gray

# Create a simple test script
@"
// Test your AI Assistant after configuration
// Use this in your browser console on your app

fetch('/api/ai-assistant', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Create a simple hello world component' }],
    mode: 'code'
  })
})
.then(response => response.json())
.then(data => console.log('AI Response:', data))
.catch(error => console.error('Error:', error));
"@ | Out-File -FilePath "test-ai-assistant.js" -Encoding UTF8

Write-Host "`n📝 Created test-ai-assistant.js for testing" -ForegroundColor Green
Write-Host "`nSetup complete! Configure the API key in Supabase and your AI Assistant will be ready! 🚀" -ForegroundColor Green
# Setup OpenAI for AI Assistant Panel
# This script helps configure OpenAI API key and deploy the AI assistant function

Write-Host "🤖 Setting up OpenAI for AI Assistant Panel" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Check if user has OpenAI API key
$openaiKey = Read-Host -Prompt "`nEnter your OpenAI API key (get it from https://platform.openai.com/api-keys)"

if ([string]::IsNullOrWhiteSpace($openaiKey)) {
    Write-Host "❌ No API key provided. Exiting..." -ForegroundColor Red
    exit 1
}

# Validate API key format
if (-not $openaiKey.StartsWith("sk-")) {
    Write-Host "⚠️  Warning: OpenAI API keys usually start with 'sk-'. Please verify your key." -ForegroundColor Yellow
}

Write-Host "`n📋 Next steps to configure your AI Assistant:" -ForegroundColor Green
Write-Host "1. Set the OpenAI API key in your Supabase project"
Write-Host "2. Deploy the updated AI assistant function"
Write-Host "3. Test the AI assistant panel"

Write-Host "`n🔧 Manual configuration steps:" -ForegroundColor Yellow
Write-Host "If you have Supabase CLI installed, run:"
Write-Host "   supabase login" -ForegroundColor Gray
Write-Host "   supabase link --project-ref oruwtgdjurstvhgqcvbv" -ForegroundColor Gray
Write-Host "   supabase secrets set OPENAI_API_KEY=`"$openaiKey`"" -ForegroundColor Gray
Write-Host "   supabase functions deploy ai-code-assistant" -ForegroundColor Gray

Write-Host "`n🌐 Alternative - Supabase Dashboard:" -ForegroundColor Yellow
Write-Host "1. Go to https://supabase.com/dashboard/project/oruwtgdjurstvhgqcvbv/settings/environment-variables"
Write-Host "2. Add new secret: OPENAI_API_KEY = $openaiKey"
Write-Host "3. Go to Edge Functions and redeploy ai-code-assistant"

Write-Host "`n💡 Your OpenAI API key: $openaiKey" -ForegroundColor Cyan
Write-Host "Keep this safe! You can also set it later in Supabase Dashboard." -ForegroundColor Gray

Write-Host "`n✅ AI Assistant will now use OpenAI (gpt-4o-mini model)" -ForegroundColor Green
Write-Host "Cost: ~$0.15 per 1M input tokens, $0.60 per 1M output tokens" -ForegroundColor Gray

# Create a simple test script
@"
// Test your AI Assistant after configuration
// Use this in your browser console on your app

fetch('/api/ai-assistant', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Create a simple hello world component' }],
    mode: 'code'
  })
})
.then(response => response.json())
.then(data => console.log('AI Response:', data))
.catch(error => console.error('Error:', error));
"@ | Out-File -FilePath "test-ai-assistant.js" -Encoding UTF8

Write-Host "`n📝 Created test-ai-assistant.js for testing" -ForegroundColor Green
Write-Host "`nSetup complete! Configure the API key in Supabase and your AI Assistant will be ready! 🚀" -ForegroundColor Green