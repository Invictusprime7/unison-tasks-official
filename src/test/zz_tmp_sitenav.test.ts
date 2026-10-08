import { it } from 'vitest';
import { readFileSync, writeFileSync } from 'node:fs';
import ts from 'typescript';
import { runFullPreflight } from '@/services/runFullPreflight';
import { prepareAICandidate } from '@/services/builder/aiCandidateGates';
const pages: any = {};
for (const [id, path, title, isHome] of [['home','/','Home',true],['shop','/shop','Shop',false],['about','/about','Our Story',false],['blog','/blog','Journal',false],['faq','/faq','Help',false],['checkout','/checkout','Checkout',false]] as any) pages[id] = { pageId: id, path, title, isHome, filePath: `/src/pages/${title.replace(' ','')}.tsx` };
const snapshot: any = { pageRegistry: { pages }, industry: 'ecommerce', meta: {} };
it('sitenav', async () => {
  const src = readFileSync('/tmp/sitenav_2.tsx', 'utf8');
  const path = '/src/project-components/site/SiteNav.tsx';
  const pf = (c: any) => runFullPreflight(c, { siteBundleSnapshot: snapshot, industry: 'ecommerce', allowQuarantine: false, closeRequiredIntents: false }).files;
  const out = pf({ [path]: src });
  writeFileSync('/tmp/sitenav_after.tsx', out[path]);
  const sf = ts.createSourceFile('x.tsx', out[path], ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  console.log('DIAG', JSON.stringify((sf as any).parseDiagnostics.map((d: any) => [d.start, ts.flattenDiagnosticMessageText(d.messageText, ' ')])));
  const r = await prepareAICandidate({ aiFiles: { [path]: src }, baseFiles: { [path]: src }, preflight: pf });
  console.log('OK', r.ok, JSON.stringify(r.errors));
}, 60000);
