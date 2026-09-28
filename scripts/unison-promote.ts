import { spawnSync } from 'node:child_process';
/**
 * node scripts/unison.mjs promote <id>
 * Refuses unless the derived audit reports zero blockers other than the public
 * export itself (which promotion performs). Then edits canonical source:
 * registry certification + generationStatus, and the public barrel.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { relative, dirname } from 'node:path';
import { auditImplementation } from '../src/sections/unison/runtime/promotion-audit';
import { getVariantById } from '../src/sections/variants/registry';
import { PUBLIC, REGISTRY, ROOT, componentFiles, readEvidence, registryEntryRange, hashFiles, importClosure } from './unison-lib';

const id = process.argv[2];
const a = id && auditImplementation(id as any);
if (!a) { console.error('usage: unison-promote <id>'); process.exit(1); }
// Export + consumer test are performed by promotion itself, in that order.
const blocking = a.blockers.filter((g) => g.id !== 'artifact' && g.id !== 'consumer-build');
if (blocking.length) {
  console.error(`REFUSED: ${id} has ${blocking.length} blockers:\n` + blocking.map((g) => `  ✗ ${g.label}: ${g.detail}`).join('\n'));
  process.exit(1);
}

const v = getVariantById(id as any)!;
const name = (v.component as any).name as string;
const sourceFile = componentFiles()[name];
if (!sourceFile || readEvidence()[id]?.sourceHash !== hashFiles(importClosure(sourceFile).local)) {
  console.error('REFUSED: certification is stale. Run certify for this implementation before promotion.');
  process.exit(1);
}
let pub = readFileSync(PUBLIC, 'utf8');
if (!pub.includes(`'${id}':`)) {
  const rel = relative(dirname(PUBLIC), componentFiles()[name]).replace(/\\/g, '/').replace(/\.tsx?$/, '');
  if (!new RegExp(`import \\{ ${name} \\}`).test(pub)) pub = pub.replace("import type { BaseSectionProps } from '../types';", `import type { BaseSectionProps } from '../types';\nimport { ${name} } from '${rel.startsWith('.') ? rel : './' + rel}';`);
  pub = pub.replace(/\n\};\n\nexport \{\n/, `\n  '${id}': ${name},\n};\n\nexport {\n  ${name},\n`);
  writeFileSync(PUBLIC, pub);
}
const run = spawnSync(process.execPath, ['scripts/unison.mjs', 'certify', id, '--consumer'], { cwd: ROOT, stdio: 'inherit' });
if (run.status !== 0 || !readEvidence()[id]?.consumer?.pass) {
  console.error('REFUSED: consumer smoke test failed — public export left in place for inspection, registry unchanged');
  process.exit(1);
}
let src = readFileSync(REGISTRY, 'utf8');
const [s, e] = registryEntryRange(src, id);
let entry = src.slice(s, e)
  .replace(/vfs: \{ mode: 'portable-recipe'(, certification: '\w+')? \}/, "vfs: { mode: 'portable-recipe', certification: 'approved' }")
  .replace(/\n(\s*)generationStatus: '\w+',/, '');
entry = entry.replace(/(vfs: \{[^}]+\},)/, "$1\n      generationStatus: 'preferred',");
writeFileSync(REGISTRY, src.slice(0, s) + entry + src.slice(e));

console.log(`PROMOTED ${id}: registry approved+preferred, exported via PUBLIC_IMPLEMENTATIONS. Re-run certification --consumer to refresh evidence.`);
