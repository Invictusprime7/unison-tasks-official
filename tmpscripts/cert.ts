import { SECTION_FAMILY_EMIT } from '../src/sections/resolveSectionLayout';
import { getVariantsForSection } from '../src/sections/variants/registry';
for (const [name, fam] of Object.entries(SECTION_FAMILY_EMIT)) {
  const all = getVariantsForSection(fam.sectionType as never);
  const cert = all.filter(v => v.vfs?.mode === 'portable-recipe' && v.vfs?.certification === 'approved');
  console.log(name, fam.sectionType, 'total', all.length, 'certified', cert.length, '|', cert.slice(0,3).map(v=>v.id).join(','));
}
