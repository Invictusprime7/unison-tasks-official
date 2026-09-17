import { it } from 'vitest';
import { compositionToReactFileSet } from '@/sections/compositionToFileSet';
import { getCompositionById } from '@/sections/templates';
import { getVariantsForSection } from '@/sections/variants';
import fs from 'node:fs';
const fams=['about','faq','stats','team','logo-cloud','blog-preview','before-after'];
it('dump', () => {
  const t = getCompositionById('salon-premium')!;
  const anchor = t.sections[1];
  const out:any = {};
  for (const f of fams) {
    const v = getVariantsForSection(f as any);
    out[f] = v.map(x=>x.id);
    const files = compositionToReactFileSet({...t, sections: t.sections.map(s=> s===anchor? {...s, type: f as any, variantId: v[0].id}: s)} as any, '/src/pages/Home.tsx');
    out[f+'_files'] = Object.keys(files).filter(k=>k.includes('components'));
  }
  fs.writeFileSync('/tmp/out.json', JSON.stringify(out,null,2));
});
