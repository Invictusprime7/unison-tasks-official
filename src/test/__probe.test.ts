import { describe, it } from 'vitest';
import { validateTwentyFirstGenerationCoverage } from '@/services/launch/twentyFirstCoverageGate';
import { resolveArtDirectionPack } from '@/sections/variants';
import { ALL_COMPOSITIONS } from '@/sections/templates';
describe('probe', () => { it('shop launch', () => {
  const comp: any = ALL_COMPOSITIONS.find((c: any) => c.id.includes('store')) || ALL_COMPOSITIONS[0];
  const types = comp.sections.filter((s: any) => !s.hidden).map((s: any) => s.type);
  console.log('comp', comp.id, 'types', types.join(','));
  const pack = resolveArtDirectionPack({ industry: 'retail', themePresetId: 'modern', seed: 7 } as any);
  console.log('pack', pack?.id);
  const rep = validateTwentyFirstGenerationCoverage({ pages: [{ role: 'home', sectionTypes: types }, { role: 'shop', sectionTypes: types }], artDirectionPack: pack });
  console.log('ok', rep.ok); console.log(rep.issues.slice(0, 12).join('\n'));
}); });
