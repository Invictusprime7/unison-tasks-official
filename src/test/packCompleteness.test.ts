import { describe, expect, it } from 'vitest';
import { listPackCompleteness, isCanonicalPack } from '@/sections/variants/packCompleteness';
import { ART_DIRECTION_FAMILIES } from '@/sections/variants/artDirectionFamilies';

describe('Pack Completeness Invariant', () => {
  it('every family has at least one canonical (complete) pack', () => {
    for (const f of Object.values(ART_DIRECTION_FAMILIES)) {
      expect(f.packs.some(p => isCanonicalPack(p.packId)), f.id).toBe(true);
    }
  });
  it('CI gate: every registered pack is complete', () => {
    const broken = listPackCompleteness().filter(r => !r.complete).map(r => `${r.packId}: ${r.missingSurfaces.join(',')}`);
    expect(broken).toEqual([]);
  });
});
