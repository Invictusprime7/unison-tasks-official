param([string]$BaseUrl = 'http://127.0.0.1:4187')
$ErrorActionPreference = 'Stop'
$checks = [System.Collections.Generic.List[object]]::new()

function Browser([string[]]$BrowserArguments) {
  $raw = & npx --yes agent-browser --session composition-verification --json @BrowserArguments
  if ($LASTEXITCODE -ne 0) { throw ($raw -join "`n") }
  $result = ($raw -join "`n") | ConvertFrom-Json
  if (!$result.success) { throw $result.error }
  return $result.data
}
function Evaluate([string]$Script) {
  $encoded = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($Script))
  return (Browser -BrowserArguments @('eval', '-b', $encoded)).result
}
function Check([string]$Template, [string]$Interaction, [string]$Script) {
  $passed = Evaluate $Script
  $checks.Add(@{ templateId=$Template; pagePath='/src/pages/Home.tsx'; interaction=$Interaction; status=$(if ($passed) {'passed'} else {'failed'}); evidence=$Script })
  if (!$passed) { throw "$Template failed: $Interaction" }
  Write-Host "PASS $Template / $Interaction"
}
try {
  Browser -BrowserArguments @('set', 'viewport', '1280', '900') | Out-Null
  Browser -BrowserArguments @('open', "$BaseUrl/salon-premium/") | Out-Null
  Browser -BrowserArguments @('wait', 'h1') | Out-Null
  Check 'salon-premium' 'desktop layout and canonical action binding' "!!document.querySelector('h1') && document.documentElement.scrollWidth <= innerWidth && !!document.querySelector('[data-ut-intent]') && document.querySelectorAll('[data-ut-generated-intent]').length < 4"
  Browser -BrowserArguments @('find', 'role', 'tab', 'click', '--name', 'Photo gallery') | Out-Null
  Browser -BrowserArguments @('find', 'role', 'button', 'click', '--name', 'Balayage transformation') | Out-Null
  Check 'salon-premium' 'gallery dialog opens' "!!document.querySelector('[role=dialog]')"
  Browser -BrowserArguments @('press', 'ArrowRight') | Out-Null
  Check 'salon-premium' 'gallery keyboard navigation' "Array.from(document.querySelectorAll('[role=dialog] img')).some(image => image.alt === 'Precision haircut')"
  Browser -BrowserArguments @('press', 'Escape') | Out-Null
  Check 'salon-premium' 'gallery escape and focus restoration' "!document.querySelector('[role=dialog]') && document.activeElement.getAttribute('aria-label') === 'Balayage transformation'"
  Browser -BrowserArguments @('set', 'viewport', '390', '844') | Out-Null
  Browser -BrowserArguments @('scroll', 'top') | Out-Null
  Browser -BrowserArguments @('find', 'role', 'button', 'click', '--name', 'Open navigation') | Out-Null
  Check 'salon-premium' 'mobile navigation opens' "!!document.querySelector('[role=dialog] nav')"
  Browser -BrowserArguments @('press', 'Escape') | Out-Null
  Check 'salon-premium' 'mobile escape and focus restoration' "!document.querySelector('[role=dialog]') && document.activeElement.getAttribute('aria-label') === 'Open navigation' && document.documentElement.scrollWidth <= innerWidth"
  Browser -BrowserArguments @('open', "$BaseUrl/local-service-premium/") | Out-Null
  Browser -BrowserArguments @('find', 'role', 'button', 'click', '--name', 'Do you provide estimates before work begins?') | Out-Null
  Check 'local-service-premium' 'FAQ expansion' "document.activeElement.getAttribute('aria-expanded') === 'true'"
  Browser -BrowserArguments @('press', 'Enter') | Out-Null
  Check 'local-service-premium' 'FAQ keyboard collapse' "document.activeElement.getAttribute('aria-expanded') === 'false'"
  Browser -BrowserArguments @('open', "$BaseUrl/salon-premium/?noWebgl=1") | Out-Null
  Browser -BrowserArguments @('wait', 'h1') | Out-Null
  Check 'salon-premium' 'unavailable WebGL fallback' "document.querySelectorAll('canvas').length === 0 && !!document.querySelector('[data-ut-component=depth-gallery] img') && !!document.querySelector('h1')"
  Browser -BrowserArguments @('open', "$BaseUrl/fallbacks/") | Out-Null
  Evaluate "new Promise((resolve, reject) => { let attempts=0; const timer=setInterval(() => { const fallback=document.querySelector('[data-ut-component=model-viewer]'); if(fallback && !fallback.querySelector('canvas') && ++attempts>5){clearInterval(timer);resolve(true)}else if(++attempts>100){clearInterval(timer);reject(new Error('Model fallback did not appear'))} },100) })" | Out-Null
  Check 'fallbacks' 'missing model leaves usable DOM fallback' "performance.getEntriesByType('resource').some(entry => entry.name.includes('deliberately-missing.glb')) && !!document.querySelector('[data-ut-component=model-viewer]') && !document.querySelector('canvas') && document.querySelector('button').textContent === 'Page still works'"
  Browser -BrowserArguments @('set', 'media', 'reduced-motion', 'reduce') | Out-Null
  Browser -BrowserArguments @('open', "$BaseUrl/salon-premium/") | Out-Null
  Browser -BrowserArguments @('wait', 'h1') | Out-Null
  Check 'salon-premium' 'reduced motion fallback' "matchMedia('(prefers-reduced-motion: reduce)').matches && !document.querySelector('canvas') && !!document.querySelector('h1')"
  Browser -BrowserArguments @('screenshot', '--full', '--screenshot-dir', "$PWD/.artifacts/composition") | Out-Null
} finally {
  $checks | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath '.artifacts/composition/browser-checks.json' -Encoding utf8
}
