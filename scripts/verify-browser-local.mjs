#!/usr/bin/env node
/**
 * LocalPlaywrightProvider — implements the BrowserVerifier contract on your PC
 * (free). Usage: node scripts/verify-browser-local.mjs <url> [steps.json]
 * steps.json: [{"click":"text=Add to cart"},{"visible":"[data-cart-count]"},{"text":"h1"}]
 * Requires: npm i -D playwright && npx playwright install chromium
 */
const [url = 'http://localhost:8080', stepsFile] = process.argv.slice(2);
const { chromium } = await import('playwright');
const { readFileSync } = await import('node:fs');
const steps = stepsFile ? JSON.parse(readFileSync(stepsFile, 'utf8')) : [];
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 1800 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
const verifier = {
  id: 'local-playwright',
  open: (u) => page.goto(u, { waitUntil: 'networkidle' }),
  click: (t) => page.locator(t).first().click(),
  getText: (t) => page.locator(t).first().innerText(),
  assertVisible: async (t) => { if (!(await page.locator(t).first().isVisible())) throw new Error(`Not visible: ${t}`); },
  screenshot: () => page.screenshot({ path: 'browser-verify.png' }),
};
let failed = 0;
try {
  await verifier.open(url);
  for (const s of steps) {
    try {
      if (s.viewport) await page.setViewportSize(s.viewport);
      if (s.open) await verifier.open(s.open);
      if (s.click) await verifier.click(s.click);
      if (s.visible) await verifier.assertVisible(s.visible);
      if (s.text) console.log(`text ${s.text}: ${await verifier.getText(s.text)}`);
      console.log('✓', JSON.stringify(s));
    } catch (e) { failed++; console.log('✗', JSON.stringify(s), '—', e.message); }
  }
  await verifier.screenshot();
} finally { await browser.close(); }
if (errors.length) console.log('Console errors:\n' + errors.join('\n'));
process.exit(failed || errors.length ? 1 : 0);
