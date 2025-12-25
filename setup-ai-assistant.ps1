# Quick Setup for AI Code Assistant

Write-Host "
=== AI Code Assistant Configuration ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Current Configuration:" -ForegroundColor Yellow
Write-Host "  Supabase URL: https://oruwtgdjurstvhgqcvbv.supabase.co" -ForegroundColor Green
Write-Host "  Project ID: oruwtgdjurstvhgqcvbv" -ForegroundColor Green
Write-Host "  Publishable Key: Configured " -ForegroundColor Green
Write-Host ""
Write-Host "  ACTION REQUIRED:" -ForegroundColor Red
Write-Host "  You need to add your Supabase SERVICE ROLE KEY to .env file" -ForegroundColor Yellow
Write-Host ""
Write-Host "How to get your Service Role Key:" -ForegroundColor Cyan
Write-Host "  1. Go to: https://supabase.com/dashboard/project/oruwtgdjurstvhgqcvbv/settings/api" -ForegroundColor White
Write-Host "  2. Find 'service_role' key under 'Project API keys'" -ForegroundColor White
Write-Host "  3. Copy the key" -ForegroundColor White
Write-Host "  4. Update .env file line:" -ForegroundColor White
Write-Host "     SUPABASE_SERVICE_ROLE_KEY=your_actual_key_here" -ForegroundColor Gray
Write-Host ""
Write-Host "After adding the key:" -ForegroundColor Cyan
Write-Host "  1. Restart dev server: npm run dev" -ForegroundColor White
Write-Host "  2. Navigate to Web Builder or Creatives page" -ForegroundColor White
Write-Host "  3. Click the AI Code Assistant panel at the bottom" -ForegroundColor White
Write-Host "  4. Try: 'Create a purple button component'" -ForegroundColor White
Write-Host ""
Write-Host "Documentation: AI_CODE_ASSISTANT_CONFIGURED.md" -ForegroundColor Green
Write-Host ""
