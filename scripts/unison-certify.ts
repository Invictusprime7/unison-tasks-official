/**
 * node scripts/unison.mjs certify <id|--all> [--consumer]
 * Renders each implementation, collects executable evidence, writes certification/evidence.json.
 * --consumer additionally renders through the public barrel (src/index.ts) only.
 */
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import pkg from '../package.json';
import { getSectionTypesWithVariants, getVariantById, getVariantsForSection } from '../src/sections/variants/registry';
import { CERTIFICATION_FIXTURES, CERTIFICATION_THEME } from '../src/sections/unison/certification/fixtures';
import { componentFiles, hashFiles, importClosure, readEvidence, writeEvidence } from './unison-lib';

const BANNED = ['@supabase', '@tanstack', 'react-router', 'react-router-dom', 'inngest', '@vercel', 'three', '@react-three', '@codemirror', '@monaco-editor', '@codesandbox'];
const args = process.argv.slice(2);
const consumer = args.includes('--consumer');
const target = args.find((a) => !a.startsWith('--'));
const ids = args.includes('--all') ? getSectionTypesWithVariants().flatMap((f) => getVariantsForSection(f).map((v) => v.id)) : target ? [target] : [];
if (!ids.length) { console.error('usage: unison-certify <id|--all> [--consumer]'); process.exit(1); }

const files = componentFiles();
const deps = { ...pkg.dependencies } as Record<string, string>;
const evidence = readEvidence();
const publicApi = consumer ? await import('../src/sections/variants/public') : undefined;

const MOTION = /@keyframes|animate-|transition-(all|transform)|hover:-?translate|hover:scale|motion\.|framer-motion/;
const REDUCED = /motion-reduce:|motion-safe:|prefers-reduced-motion|useReducedMotion/;
let hasFailures = false;

for (const id of ids) {
  const v = getVariantById(id as any);
  if (!v) { console.error(`Unknown implementation: ${id}`); hasFailures = true; continue; }
  const file = files[(v.component as any).name];
  const closure = file ? importClosure(file) : { local: [], external: [], escapes: ['component file not found from registry imports'] };
  const source = closure.local.map((f) => { try { return readFileSync(f, 'utf8'); } catch { return ''; } }).join('\n');
  const section = { id: 'cert', type: v.sectionType, variantId: v.id, props: CERTIFICATION_FIXTURES[v.sectionType] } as any;
  let html = ''; let renderErr = '';
  try { html = renderToStaticMarkup(createElement(v.component, { section, theme: CERTIFICATION_THEME })); } catch (e) { renderErr = String((e as Error).message ?? e).slice(0, 200); }
  const checks: Record<string, { pass: boolean; detail: string }> = {};
  checks.render = renderErr ? { pass: false, detail: `SSR render threw: ${renderErr}` } : html.length > 50 ? { pass: true, detail: `rendered ${html.length} chars` } : { pass: false, detail: 'rendered empty markup' };

  const slots = [...new Set([...html.matchAll(/data-ut-slot="([^"]+)"/g)].map((m) => m[1]))];
  checks.slots = slots.length ? { pass: true, detail: `${slots.length} slots: ${slots.slice(0, 6).join(', ')}${slots.length > 6 ? '…' : ''}` } : { pass: false, detail: 'No data-ut-slot markers in rendered output — content is not editable/bindable' };

  const actionable = (html.match(/<(a|button)\b/g) ?? []).length;
  const intents = (html.match(/data-ut-intent="/g) ?? []).length;
  checks.intents = actionable === 0 ? { pass: true, detail: 'No interactive actions; intents not applicable' }
    : intents ? { pass: true, detail: `${intents} intent bindings across ${actionable} actions` }
    : { pass: false, detail: `${actionable} actions without data-ut-intent` };

  const a11y: string[] = [];
  for (const m of html.matchAll(/<img\b[^>]*>/g)) if (!/\balt=/.test(m[0])) a11y.push('img without alt');
  for (const m of html.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/g)) if (!/aria-label=/.test(m[0]) && !m[1].replace(/<[^>]+>/g, '').trim()) a11y.push('button without accessible name');
  for (const m of html.matchAll(/<a\b[^>]*>/g)) if (!/\bhref=/.test(m[0])) a11y.push('anchor without href');
  if (/<div\b[^>]*role="button"/.test(html)) a11y.push('div acting as button');
  if (!/<h[1-3]\b/.test(html) && !['navbar', 'footer', 'logo-cloud'].includes(v.sectionType)) a11y.push('no heading');
  checks.accessibility = a11y.length ? { pass: false, detail: [...new Set(a11y)].join('; ') } : { pass: true, detail: 'alt text, named buttons, real links, heading structure (static markup)' };

  const responsive = /\b(sm|md|lg|xl):/.test(html) || /@media\s*\(min-width/.test(source);
  checks.responsive = responsive ? { pass: true, detail: 'breakpoint rules present in rendered output' } : { pass: false, detail: 'No breakpoint rules — mobile composition unproven' };

  const moves = MOTION.test(source) || MOTION.test(html);
  checks['reduced-motion'] = !moves ? { pass: true, detail: 'No motion in the implementation' }
    : REDUCED.test(source) || REDUCED.test(html) ? { pass: true, detail: 'Motion guarded by reduced-motion rules' }
    : { pass: false, detail: 'Motion (animation/transform transitions) without a reduced-motion guard' };

  const missing = closure.external.filter((d) => d !== 'react' && d !== 'react-dom' && !deps[d]);
  const banned = closure.external.filter((d) => BANNED.some((b) => d === b || d.startsWith(b + '/')));
  const depIssues = [...closure.escapes, ...missing.map((d) => `undeclared dependency ${d}`), ...banned.map((d) => `application dependency ${d}`)];
  checks.dependencies = depIssues.length ? { pass: false, detail: depIssues.join('; ') } : { pass: true, detail: `${closure.local.length} local files; packages: ${closure.external.join(', ') || 'none'}` };

  const prev = evidence[id] ?? {};
  const entry: any = { certifiedAt: new Date().toISOString(), sourceHash: hashFiles(closure.local), checks, consumer: prev.consumer };
  if (consumer) {
    const C = (publicApi as any).PUBLIC_IMPLEMENTATIONS?.[id];
    if (!C) entry.consumer = { pass: false, detail: 'Not exported through the public barrel', at: entry.certifiedAt };
    else {
      try { const out = renderToStaticMarkup(createElement(C, { section, theme: CERTIFICATION_THEME })); entry.consumer = { pass: out.length > 50, detail: `Rendered via public barrel (${out.length} chars)`, at: entry.certifiedAt }; }
      catch (e) { entry.consumer = { pass: false, detail: `Public render threw: ${String(e).slice(0, 160)}`, at: entry.certifiedAt }; }
    }
  } else if (prev.sourceHash && prev.sourceHash !== entry.sourceHash) entry.consumer = undefined; // stale
  evidence[id] = entry;
  const failed = Object.entries(checks).filter(([, c]) => !c.pass).map(([k, c]) => `${k}: ${c.detail}`);
  // Static quality heuristics are advice, not a freestyle-generation veto.
  hasFailures ||= !checks.render.pass || !checks.dependencies.pass;
  console.log(`${failed.length ? '✗' : '✓'} ${id}${failed.length ? '\n    ' + failed.join('\n    ') : ''}${consumer ? `\n    consumer: ${entry.consumer.pass ? 'pass' : 'FAIL'} — ${entry.consumer.detail}` : ''}`);
}
writeEvidence(evidence);
if (hasFailures) process.exitCode = 1;
