import { describe, it } from 'vitest';
import { ART_DIRECTION_PACKS } from '@/sections/variants/artDirectionPacks';
import { getGenerationVariantsForSection } from '@/sections/variants';
describe('probe', () => { it('shop coverage', () => {
  for (const pack of Object.values(ART_DIRECTION_PACKS) as any[]) {
    const out: string[] = [];
    for (const t of ['hero','stats','pricing','services','features','gallery','testimonials','cta','contact','footer','navbar'] as any[]) {
      const n = getGenerationVariantsForSection(t, pack, 'shop').length;
      if (!n) out.push(t);
    }
    if (out.length) console.log(pack.id, 'EMPTY:', out.join(','));
  }
}); });
