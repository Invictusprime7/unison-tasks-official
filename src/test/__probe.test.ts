import { describe, it } from 'vitest';
import { ART_DIRECTION_PACKS } from '@/sections/variants/artDirectionPacks';
import { getGenerationVariantsForSection, getAllVariants } from '@/sections/variants';
describe('probe', () => { it('all types', () => {
  const types = [...new Set(getAllVariants().map(v => v.sectionType))];
  for (const pack of Object.values(ART_DIRECTION_PACKS) as any[]) {
    const empty = types.filter(t => !getGenerationVariantsForSection(t as any, pack, 'shop').length);
    console.log(pack.id, 'EMPTY:', empty.join(',') || 'none');
  }
}); });
