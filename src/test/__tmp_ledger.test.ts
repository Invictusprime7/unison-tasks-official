import { it } from 'vitest';
import { buildEquivalenceLedger, summarizeEquivalenceLedger, eligibleCountsBySection } from '@/services/design/equivalenceLedger';
it('dump', () => {
  const r = buildEquivalenceLedger();
  console.log(summarizeEquivalenceLedger(r));
  console.log('counts', JSON.stringify(eligibleCountsBySection(r)));
  console.log('removalBlockers', JSON.stringify(r.removalBlockers.map(c=>`${c.packId}/${c.sectionType}`)));
  console.log('blocked', JSON.stringify(r.blockedBySection, null, 1));
});
