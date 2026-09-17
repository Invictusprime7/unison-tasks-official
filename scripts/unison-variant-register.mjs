#!/usr/bin/env node
/**
 * Unison Variant Auto-Registration
 *
 * Every certified 21st.dev component is promoted through a declarative spec so
 * that it is written into ALL related Unison registries automatically:
 *
 *   1. src/sections/variants/registry.ts  — component import, jsxTemplates
 *      import, family entry (with 21st provenance) and layout alias
 *   2. public/variants/<thumb>.svg        — placeholder thumbnail if missing
 *   3. src/design/21st-intake/imported/<slug>/record.json — step 10 / promoted
 *
 * Specs live in src/design/21st-intake/promotions/*.json and re-running is
 * idempotent: anything already present is left untouched.
 *
 * Usage: node scripts/unison-variant-register.mjs [--check]
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const SPEC_DIR = path.join(ROOT, 'src/design/21st-intake/promotions');
const REGISTRY = path.join(ROOT, 'src/sections/variants/registry.ts');
const THUMB_DIR = path.join(ROOT, 'public/variants');
const IMPORTED_DIR = path.join(ROOT, 'src/design/21st-intake/imported');

const checkOnly = process.argv.includes('--check');
const changes = [];

function familyKey(sectionType) {
  return /^[a-zA-Z][a-zA-Z0-9]*$/.test(sectionType) ? sectionType : `'${sectionType}'`;
}

function entrySource(spec) {
  const src = spec.source;
  const tags = spec.tags.map((t) => `'${t}'`).join(', ');
  const roles = (spec.pageRoles || []).map((r) => `'${r}'`).join(', ');
  return `    {
      id: '${spec.id}',
      sectionType: '${spec.sectionType}',
      slug: '${spec.slug}',
      name: '${spec.name}',
      description: '${spec.description.replace(/'/g, "\\'")}',
      component: ${spec.componentName},
      vfs: { mode: 'portable-recipe' },
      source: {
        origin: '${src.origin}',
        sourceId: '${src.sourceId}',
        sourceUrl: '${src.sourceUrl}',
        author: '${src.author}',
        license: '${src.license}',
        adaptationVersion: '${src.adaptationVersion}',
      },
      generationStatus: '${spec.generationStatus || 'preferred'}',
      thumbnail: '${spec.thumbnail}',
      tags: [${tags}],${roles ? `\n      pageRoles: [${roles}],` : ''}
      renderJSX: ${spec.jsxFn},
    },
`;
}

function registerInRegistry(spec, text) {
  let out = text;

  // 1. jsxTemplates emitter import
  if (!new RegExp(`\\b${spec.jsxFn}\\b`).test(out)) {
    out = out.replace(
      /\n\} from '\.\/jsxTemplates';/,
      `\n  ${spec.jsxFn},\n} from './jsxTemplates';`,
    );
    changes.push(`${spec.id}: jsxTemplates import`);
  }

  // 2. component import
  const importLine = `import { ${spec.componentName} } from '${spec.componentPath}';`;
  if (!out.includes(importLine)) {
    out = out.replace(
      /\n\} from '\.\/jsxTemplates';\n/,
      `\n} from './jsxTemplates';\n\n// 21st.dev certified variant: ${spec.id}\n${importLine}\n`,
    );
    changes.push(`${spec.id}: component import`);
  }

  // 3. family entry
  if (!out.includes(`id: '${spec.id}'`)) {
    const key = familyKey(spec.sectionType);
    const marker = new RegExp(`\\n  ${key.replace(/[.*+?^$()|[\\]\\\\]/g, '\\\\$&')}: \\[\\n`);
    if (!marker.test(out)) throw new Error(`Family array not found for ${spec.sectionType}`);
    out = out.replace(marker, (m) => `${m}${entrySource(spec)}`);
    changes.push(`${spec.id}: registry entry`);
  }

  // 4. layout alias
  if (!out.includes(`'${spec.id}': [`)) {
    const aliases = (spec.aliases || [spec.slug]).map((a) => `'${a}'`).join(', ');
    out = out.replace(
      /const VARIANT_LAYOUT_ALIASES: Partial<Record<VariantId, readonly string\[\]>> = \{\n/,
      (m) => `${m}  '${spec.id}': [${aliases}],\n`,
    );
    changes.push(`${spec.id}: layout alias`);
  }

  return out;
}

function writeThumbnail(spec) {
  const file = path.join(ROOT, 'public', spec.thumbnail.replace(/^\//, ''));
  if (fs.existsSync(file)) return;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200" role="img" aria-label="${spec.name}">
  <rect width="320" height="200" fill="#f4f4f5"/>
  <rect x="20" y="24" width="140" height="14" rx="7" fill="#d4d4d8"/>
  <rect x="20" y="48" width="220" height="10" rx="5" fill="#e4e4e7"/>
  <rect x="20" y="82" width="86" height="94" rx="10" fill="#e4e4e7"/>
  <rect x="117" y="82" width="86" height="94" rx="10" fill="#d4d4d8"/>
  <rect x="214" y="82" width="86" height="94" rx="10" fill="#e4e4e7"/>
</svg>
`;
  if (!checkOnly) {
    fs.mkdirSync(THUMB_DIR, { recursive: true });
    fs.writeFileSync(file, svg);
  }
  changes.push(`${spec.id}: thumbnail`);
}

function updateRecord(spec) {
  if (!spec.recordSlug) return;
  const file = path.join(IMPORTED_DIR, spec.recordSlug, 'record.json');
  if (!fs.existsSync(file)) return;
  const record = JSON.parse(fs.readFileSync(file, 'utf8'));
  const promoted = new Set(record.promotedVariants || []);
  if (record.step === 10 && record.status === 'promoted' && promoted.has(spec.id)) return;
  promoted.add(spec.id);
  record.step = 10;
  record.status = 'promoted';
  record.promotedVariants = [...promoted];
  if (!checkOnly) fs.writeFileSync(file, `${JSON.stringify(record, null, 2)}\n`);
  changes.push(`${spec.id}: intake record`);
}

function main() {
  if (!fs.existsSync(SPEC_DIR)) {
    console.log('No promotion specs found.');
    return;
  }
  const specs = fs
    .readdirSync(SPEC_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(SPEC_DIR, f), 'utf8')));

  let registry = fs.readFileSync(REGISTRY, 'utf8');
  for (const spec of specs) {
    registry = registerInRegistry(spec, registry);
    writeThumbnail(spec);
    updateRecord(spec);
  }
  if (!checkOnly) fs.writeFileSync(REGISTRY, registry);

  if (!changes.length) {
    console.log(`✓ ${specs.length} variant spec(s) already registered.`);
    return;
  }
  console.log(`${checkOnly ? 'Pending' : 'Applied'} registrations:`);
  for (const c of changes) console.log(`  - ${c}`);
  if (checkOnly) process.exitCode = 1;
}

main();
