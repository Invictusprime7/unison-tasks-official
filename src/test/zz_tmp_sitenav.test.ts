import { it } from 'vitest';
import { readFileSync, writeFileSync } from 'node:fs';
import ts from 'typescript';
import { runFullPreflight } from '@/services/runFullPreflight';
import { prepareAICandidate } from '@/services/builder/aiCandidateGates';
const snapshot: any = JSON.parse(readFileSync('/tmp/snap.json', 'utf8'));
it('sitenav', async () => {
  const path = '/src/project-components/site/SiteNav.tsx';
  const base = { ...(snapshot.vfsFiles ?? {}), [path]: readFileSync('/tmp/nav_base.tsx', 'utf8') };
  for (const n of ['2', '5']) {
    const src = readFileSync(`/tmp/sitenav_${n}.tsx`, 'utf8');
    const pf = (c: any) => runFullPreflight(c, { siteBundleSnapshot: snapshot, industry: snapshot.industry, allowQuarantine: false, closeRequiredIntents: false }).files;
    const out = pf({ [path]: src });
    writeFileSync(`/tmp/sitenav_after_${n}.tsx`, out[path]);
    const sf = ts.createSourceFile('x.tsx', out[path], ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    console.log('DIAG', n, JSON.stringify((sf as any).parseDiagnostics.map((d: any) => [d.start, ts.flattenDiagnosticMessageText(d.messageText, ' ')])));
    const r = await prepareAICandidate({ aiFiles: { [path]: src }, baseFiles: base, preflight: pf });
    console.log('OK', n, r.ok, JSON.stringify(r.errors).slice(0, 1500));
  }
}, 60000);
