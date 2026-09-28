/** node scripts/unison.mjs retire <id> "<reason>" — retire in canonical source; removes public export. */
import { readFileSync, writeFileSync } from 'node:fs';
import { PUBLIC, REGISTRY, registryEntryRange } from './unison-lib';

const [id, reason] = process.argv.slice(2);
if (!id || !reason) { console.error('usage: unison-retire <id> "<reason>"'); process.exit(1); }
let src = readFileSync(REGISTRY, 'utf8');
const [s, e] = registryEntryRange(src, id);
let entry = src.slice(s, e).replace(/\n\s*generationStatus: '\w+',/, '').replace(/\n\s*retiredReason: (?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'),/, '').replace(/\n\s*isDefault: true,/, '');
entry = entry.replace(/(vfs: \{[^}]+\},)/, (_, vfs) => `${vfs}\n      generationStatus: 'retired',\n      retiredReason: ${JSON.stringify(reason)},`);
writeFileSync(REGISTRY, src.slice(0, s) + entry + src.slice(e));
const pub = readFileSync(PUBLIC, 'utf8').replace(new RegExp(`\\n  '${id}': \\w+,`), '');
writeFileSync(PUBLIC, pub);
console.log(`RETIRED ${id}: ${reason}`);
