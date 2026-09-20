import { describe, it } from 'vitest';
import { ART_DIRECTION_PACKS } from '@/sections/variants/artDirectionPacks';
import { validateTwentyFirstGenerationCoverage } from '@/services/launch/twentyFirstCoverageGate';
import { VARIANT_REGISTRY } from '@/sections/variants/registry';

describe('sweep', () => {
  it('reports', () => {
    const sectionTypes = Object.keys(VARIANT_REGISTRY) as any[];
    const roles = ['home','about','services','contact','pricing','gallery','blog','immersive','generic'];
    const packs: any[] = Object.values(ART_DIRECTION_PACKS as any);
    const issues = new Set<string>();
    for (const pack of packs) {
      const r = validateTwentyFirstGenerationCoverage({ pages: roles.map(role => ({ role, sectionTypes })), artDirectionPack: pack });
      r.issues.forEach(i => issues.add(`${(pack as any).id}|${i}`));
    }
    console.log('TOTAL ISSUES', issues.size);
    console.log([...issues].slice(0,60).join('\n'));
  });
});
