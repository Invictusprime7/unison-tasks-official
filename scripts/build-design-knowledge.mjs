// Run with: node --experimental-strip-types scripts/build-design-knowledge.mjs
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { DESIGN_KNOWLEDGE, DESIGN_KNOWLEDGE_VERSION } from '../src/services/knowledge/designKnowledge.ts';

const root = new URL('../', import.meta.url);
const source = 'docs/milestones/UNISON_AI_AUTHORED_CONVERGENCE_MILESTONE_2026-09-29.md';
const hash = value => createHash('sha256').update(value).digest('hex');
const referenceRoot = new URL('docs/knowledge/references/aria/', root);
const referenceBytes = await readFile(new URL('provenance.json', referenceRoot));
const reference = JSON.parse(referenceBytes.toString('utf8'));
for (const file of reference.files) {
  if (hash(await readFile(new URL(`source/${file.path}`, referenceRoot))) !== file.sha256) throw new Error(`Reference source drift: ${file.path}`);
}
for (const file of reference.screenshots) {
  if (hash(await readFile(new URL(file.path, referenceRoot))) !== file.sha256) throw new Error(`Reference screenshot drift: ${file.path}`);
}
const artifact = {
  packageVersion: DESIGN_KNOWLEDGE_VERSION,
  source: { path: source, sha256: hash(await readFile(new URL(source, root))) },
  references: [{ id: 'aria', manifest: 'docs/knowledge/references/aria/provenance.json', sha256: hash(referenceBytes) }],
  evidence: 'Curated requirements; M0-M5 acceptance is not certified. ARIA source and limited local browser evidence are recorded separately; not production certification.',
  entries: DESIGN_KNOWLEDGE.map(entry => ({ ...entry, contentHash: hash(entry.text) })),
};
const output = JSON.stringify(artifact, null, 2) + '\n';
const destination = new URL('docs/knowledge/design-knowledge.json', root);
if (process.argv.includes('--check')) {
  if (await readFile(destination, 'utf8') !== output) throw new Error('Design knowledge artifact is stale. Run build-design-knowledge.mjs.');
  console.log('Design knowledge artifact matches source.');
} else {
  await writeFile(destination, output, 'utf8');
  console.log('Wrote docs/knowledge/design-knowledge.json');
}
