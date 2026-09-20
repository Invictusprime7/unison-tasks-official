import { describe, it } from 'vitest';
import { ART_DIRECTION_PACKS, getGenerationVariantsForSection } from '@/sections/variants';
const TYPES = ['navbar','hero','services','features','pricing','testimonials','team','gallery','faq','cta','contact','footer','stats','about','logo-cloud','blog-preview','before-after'] as const;
describe('probe', () => { it('all types', () => {
  for (const pack of Object.values(ART_DIRECTION_PACKS) as any[]) {
    const empty = TYPES.filter(t => !getGenerationVariantsForSection(t as any, pack, 'shop').length);
    console.log(pack.id, 'EMPTY:', empty.join(',') || 'none');
  }
}); });
