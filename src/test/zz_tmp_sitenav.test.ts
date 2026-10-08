import { it } from 'vitest';
import { readFileSync, writeFileSync } from 'node:fs';
import { runFullPreflight } from '@/services/runFullPreflight';
import { prepareAICandidate } from '@/services/builder/aiCandidateGates';
it('sitenav', async () => {
  const src = readFileSync('/tmp/sitenav_5.tsx', 'utf8');
  const path = '/src/project-components/site/SiteNav.tsx';
  const out = runFullPreflight({ [path]: src }, { industry: 'ecommerce', allowQuarantine: false, closeRequiredIntents: false }).files;
  writeFileSync('/tmp/sitenav_after.tsx', out[path]);
  const base = { [path]: src.replace("'@/unison/ui/icons'", "'lucide-react'"), '/src/unison/ui/icons.ts': "export * from 'lucide-react';" };
  const r = await prepareAICandidate({ aiFiles: { [path]: src }, baseFiles: base, preflight: (c) => runFullPreflight(c, { industry: 'ecommerce', allowQuarantine: false, closeRequiredIntents: false }).files });
  console.log('OK', r.ok, JSON.stringify(r.errors));
}, 60000);
