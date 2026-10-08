import { it } from 'vitest';
import { readFileSync, writeFileSync } from 'node:fs';
import ts from 'typescript';
import { sanitizeGeneratedFiles } from '@/utils/tsxSanitizer';
it('san', () => {
  for (const n of ['2','5']) {
    const path = '/src/project-components/site/SiteNav.tsx';
    const src = readFileSync(`/tmp/sitenav_${n}.tsx`, 'utf8');
    const r = sanitizeGeneratedFiles({ [path]: src });
    writeFileSync(`/tmp/san_${n}.tsx`, r.files[path] ?? '');
    const sf = ts.createSourceFile('x.tsx', r.files[path] ?? '', ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    console.log('SAN', n, JSON.stringify(r.invalidFiles), JSON.stringify((sf as any).parseDiagnostics.map((d: any) => [d.start, ts.flattenDiagnosticMessageText(d.messageText, ' ')])));
  }
});
