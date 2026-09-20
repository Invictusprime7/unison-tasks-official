import { getVariantsForSection, getGenerationVariantsForSection } from '@/sections/variants';
import type { SectionType } from '@/sections/types';
const roles = ['home','about','services','shop','gallery','contact','pricing','blog','booking','faq','testimonials','team','careers'];
const types = new Set<string>();
for (const t of ['hero','about','services','features','gallery','footer','team','logo-cloud','blog-preview','before-after','pricing','testimonials','faq','cta','navbar','stats','contact','product-cards'] ) types.add(t);
for (const t of types) {
  for (const r of roles) {
    const n = getGenerationVariantsForSection(t as SectionType, undefined, r).length;
    if (!n) {
      const any = getVariantsForSection(t as SectionType).length;
      const agn = getGenerationVariantsForSection(t as SectionType).length;
      console.log(`GAP ${r}:${t} roleFiltered=0 roleAgnosticEligible=${agn} registered=${any}`);
    }
  }
}
import { it } from 'vitest'; it('cov',()=>{});
