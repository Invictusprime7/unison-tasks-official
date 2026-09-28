/**
 * node scripts/unison.mjs repair <id>
 * Applies ONLY safe, mechanical repairs to canonical source:
 *  - recipe linkage (legacy renderJSX → portableRecipeOnly)
 *  - absolute @/ import normalization inside the design-system root
 * Never claims accessibility, responsiveness, motion, provenance, page fit or visual parity.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { relative, dirname, join } from 'node:path';
import { getVariantById } from '../src/sections/variants/registry';
import { DS, REGISTRY, componentFiles, importClosure, registryEntryRange } from './unison-lib';

const id = process.argv[2];
const v = id && getVariantById(id as any);
if (!v) { console.error('usage: unison-repair <id>'); process.exit(1); }
const applied: string[] = [];

let src = readFileSync(REGISTRY, 'utf8');
const [s, e] = registryEntryRange(src, id);
let entry = src.slice(s, e);
const legacy = entry.match(/renderJSX:\s*(\w+)/);
if (legacy && legacy[1] !== 'portableRecipeOnly' && /mode: 'portable-recipe'/.test(entry)) {
  entry = entry.replace(/renderJSX:\s*\w+/, 'renderJSX: portableRecipeOnly');
  applied.push(`recipe linkage: ${legacy[1]} → portableRecipeOnly`);
}
src = src.slice(0, s) + entry + src.slice(e);
writeFileSync(REGISTRY, src);

const file = componentFiles()[(v.component as any).name];
for (const f of importClosure(file).local) {
  let text: string; try { text = readFileSync(f, 'utf8'); } catch { continue; }
  const next = text.replace(/from '@\/design-system\/unison\/([^']+)'/g, (_, p) => {
    const rel = relative(dirname(f), join(DS, p)).replace(/\\/g, '/'); return `from '${rel.startsWith('.') ? rel : './' + rel}'`;
  });
  if (next !== text) { writeFileSync(f, next); applied.push(`import normalization in ${relative(DS, f)}`); }
}
console.log(applied.length ? applied.map((a) => `repaired: ${a}`).join('\n') : 'no safe repairs applicable');
console.log('Remaining blockers need authored fixes or evidence — re-run certification.');
