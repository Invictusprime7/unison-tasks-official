/** node scripts/unison.mjs audit [id]  — print the derived audit (one id) or the status totals. */
import { auditAll, auditImplementation } from '../src/sections/unison/runtime/promotion-audit';

const id = process.argv[2];
if (id) {
  const a = auditImplementation(id as any);
  if (!a) { console.error(`unknown ${id}`); process.exit(1); }
  console.log(`${a.id}  [${a.status.toUpperCase()}]  registry: ${JSON.stringify(a.registryState)}`);
  for (const g of a.gates) console.log(`  ${g.result === 'pass' ? '✓' : g.result === 'fail' ? '✗' : '?'} ${g.label.padEnd(32)} ${g.detail}${g.safeRepair ? '  [safe repair]' : ''}`);
  console.log(`  blockers: ${a.blockers.length}`);
  console.log(`  advisories: ${a.advisories.length} (do not block freestyle generation)`);
} else {
  const all = auditAll(); const t: Record<string, number> = {};
  for (const a of all) t[a.status] = (t[a.status] ?? 0) + 1;
  console.log(t);
}
