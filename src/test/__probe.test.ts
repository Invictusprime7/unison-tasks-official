import { describe, it } from 'vitest';
import { validateTwentyFirstGenerationCoverage } from '@/services/launch/twentyFirstCoverageGate';
import { resolveArtDirectionPack } from '@/sections/variants';
import { getCompositionById, SECTION_TEMPLATES } from '@/sections/templates';
describe('probe', () => { it('shop launch', () => {
  const ids = Object.keys(SECTION_TEMPLATES as any).slice(0, 5);
  console.log('compositions', ids);
  const comp: any = getCompositionById(ids.find(i => i.includes('store')) || ids[0]);
  const types = comp.sections.filter((s: any) => !s.hidden).map((s: any) => s.type);
  console.log('types', types.join(','));
  const pack = resolveArtDirectionPack({ industry: 'retail' as any, themePresetId: 'modern', seed: 7 } as any);
  console.log('pack', pack?.id);
  const rep = validateTwentyFirstGenerationCoverage({ pages: [{ role: 'home', sectionTypes: types }, { role: 'shop', sectionTypes: types }], artDirectionPack: pack });
  console.log('ok', rep.ok, rep.issues.slice(0, 10));
}); });
