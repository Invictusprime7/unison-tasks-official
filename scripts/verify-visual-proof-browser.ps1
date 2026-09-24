param([string]$BaseUrl = 'http://127.0.0.1:4187', [string[]]$Variants = @('gallery-cinematic-grid', 'gallery-masonry', 'gallery-lightbox-grid', 'before-after-slider', 'before-after-grid'))
$ErrorActionPreference = 'Stop'
$checks = [System.Collections.Generic.List[object]]::new()
$evidenceDirectory = Join-Path $PWD '.artifacts/composition/visual-proof'
New-Item -ItemType Directory -Force -Path $evidenceDirectory | Out-Null
function Browser([string[]]$BrowserArguments) {
  $raw = & npx --yes agent-browser --session visual-proof-check --json @BrowserArguments
  if ($LASTEXITCODE -ne 0) { throw ($raw -join "`n") }
  $result = ($raw -join "`n") | ConvertFrom-Json
  if (!$result.success) { throw $result.error }
  return $result.data
}
function Evaluate([string]$Script) {
  $encoded = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($Script))
  return (Browser -BrowserArguments @('eval', '-b', $encoded)).result
}
function Check([string]$Variant, [string]$Interaction, [string]$Script) {
  $passed = Evaluate $Script
  $checks.Add(@{ variant=$Variant; interaction=$Interaction; passed=$passed })
  if (!$passed) { throw "$Variant failed: $Interaction" }
  Write-Host "PASS $Variant / $Interaction"
}
try {
  foreach ($variant in $Variants) {
    Browser -BrowserArguments @('open', "$BaseUrl/$variant/") | Out-Null
    Browser -BrowserArguments @('set', 'viewport', '1280', '900') | Out-Null
    Browser -BrowserArguments @('wait', 'h2') | Out-Null
    Check $variant 'desktop render and no horizontal overflow' "!!document.querySelector('[data-ut-variant]') && !document.querySelector('vite-error-overlay') && document.documentElement.scrollWidth <= innerWidth"
    if ($variant.StartsWith('gallery-')) {
      Browser -BrowserArguments @('find', 'role', 'button', 'click', '--name', 'Kitchen result') | Out-Null
      Check $variant 'lightbox opens and contains focus' "!!document.querySelector('[role=dialog]') && document.querySelector('[role=dialog]').contains(document.activeElement)"
      Browser -BrowserArguments @('press', 'ArrowRight') | Out-Null
      Check $variant 'keyboard next image' "document.querySelector('[role=dialog] img').alt === 'Studio result'"
      Check $variant 'lightbox backdrop and position announcement' "getComputedStyle(document.querySelector('[role=dialog]')).backgroundColor !== 'rgba(0, 0, 0, 0)' && document.querySelector('[role=status]').textContent.includes('Image 2 of 3')"
      Browser -BrowserArguments @('press', 'Escape') | Out-Null
      Check $variant 'Escape restores thumbnail focus' "!document.querySelector('[role=dialog]') && document.activeElement.getAttribute('aria-label') === 'Kitchen result'"
      Check $variant 'focused caption has an opaque readable surface' "(() => {const c=document.activeElement.closest('figure').querySelector('figcaption'); return getComputedStyle(c).backgroundColor !== 'rgba(0, 0, 0, 0)' && getComputedStyle(c).color !== getComputedStyle(c).backgroundColor;})()"
      Browser -BrowserArguments @('find', 'role', 'button', 'click', '--name', 'Outdoors') | Out-Null
      Check $variant 'category filter' "document.querySelectorAll('section img').length === 1 && document.querySelector('section img').alt === 'Garden result'"
      Browser -BrowserArguments @('find', 'role', 'button', 'click', '--name', 'All', '--exact') | Out-Null
    }
    if ($variant -eq 'before-after-slider') {
      Evaluate "document.querySelector('input[type=range]').focus(); true" | Out-Null
      Browser -BrowserArguments @('press', 'ArrowRight') | Out-Null
      Check $variant 'keyboard reveal and announcement' "document.querySelector('input[type=range]').value === '51' && document.querySelector('input[type=range]').getAttribute('aria-valuetext') === '51% after'"
      Browser -BrowserArguments @('find', 'role', 'button', 'click', '--name', 'Garden', '--exact') | Out-Null
      Check $variant 'project switch resets reveal' "document.querySelector('input[type=range]').value === '50' && Array.from(document.querySelectorAll('img')).some(image => image.alt === 'Garden after')"
    }
    Browser -BrowserArguments @('screenshot', '--full', '--screenshot-dir', $evidenceDirectory) | Out-Null
    Browser -BrowserArguments @('set', 'viewport', '390', '844') | Out-Null
    Check $variant 'mobile layout' "document.documentElement.scrollWidth <= innerWidth && Array.from(document.querySelectorAll('section img')).every(image => image.getBoundingClientRect().width > 0)"
    if ($variant.StartsWith('gallery-')) {
      Browser -BrowserArguments @('find', 'role', 'button', 'click', '--name', 'Studio result') | Out-Null
      Check $variant 'mobile portrait lightbox fits viewport' "(() => {const r=document.querySelector('[role=dialog] img').getBoundingClientRect(); return r.left>=0 && r.right<=innerWidth && r.top>=0 && r.bottom<=innerHeight;})()"
      Browser -BrowserArguments @('press', 'Escape') | Out-Null
    }
    Browser -BrowserArguments @('set', 'media', 'reduced-motion', 'reduce') | Out-Null
    Check $variant 'reduced motion remains usable' "matchMedia('(prefers-reduced-motion: reduce)').matches && !!document.querySelector('[data-ut-variant]')"
    Browser -BrowserArguments @('screenshot', '--full', '--screenshot-dir', $evidenceDirectory) | Out-Null
    $errors = Browser -BrowserArguments @('errors')
    if ($errors.errors.Count -gt 0) { throw ($errors.errors | ConvertTo-Json -Depth 5) }
    Browser -BrowserArguments @('set', 'media', 'reduced-motion', 'no-preference') | Out-Null
  }
} finally {
  $checks | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $evidenceDirectory 'checks.json') -Encoding utf8
  Browser -BrowserArguments @('close') | Out-Null
}
