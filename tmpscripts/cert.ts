import { SECTION_FAMILY_EMIT } from '../src/sections/resolveSectionLayout';
import { getVariantsForSection } from '../src/sections/variants/registry';
for (const [name, fam] of Object.entries(SECTION_FAMILY_EMIT)) {
  const all = getVariantsForSection(fam.sectionType as never);
  const cert = all.filter(v => v.vfs?.mode === 'portable-recipe' && v.vfs?.certification === 'approved');
  console.log(name, fam.sectionType, 'total', all.length, 'certified', cert.length, '|', cert.slice(0,3).map(v=>v.id).join(','));
}
import { getVariantById } from '../src/sections/variants/registry';
for (const id of ['about:editorial-split','faq:accordion','team:portrait-grid','stats:row','logo-cloud:grid','blog-preview:editorial','before-after:slider','navbar:standard','hero:centered','services:card-grid','footer:columns']) {
  const v: any = getVariantById(id as never);
  console.log(id, JSON.stringify(v?.vfs), v?.source ? 'src:'+(v.source.provider||'?') : 'no-source');
}
