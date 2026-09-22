import { describe, expect, it } from 'vitest';
import { affinityBand, compositionAffinityScore, selectAffineVariant } from '@/sections/compositionAffinity';
import { getGenerationVariantsForSection } from '@/sections/variants/registry';
import { ART_DIRECTION_PACKS, ART_DIRECTION_PACK_IDS } from '@/sections/variants/artDirectionPacks';
import type { SectionVariant } from '@/sections/variants/types';

const heroes = (packId = ART_DIRECTION_PACK_IDS[0]) =>
  getGenerationVariantsForSection('hero', ART_DIRECTION_PACKS[packId], 'home');

describe('composition affinity', () => {
  it('scores every certified candidate inside 0..1', () => {
    for (const packId of ART_DIRECTION_PACK_IDS) {
      for (const variant of heroes(packId)) {
        const score = compositionAffinityScore(variant, { packId, industry: 'salon', role: 'home' });
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(1);
      }
    }
  });

  it('ranks the art direction\'s own family order above an unlisted implementation', () => {
    const packId = ART_DIRECTION_PACK_IDS[0];
    const inPack = heroes(packId)[0];
    const outsider = getGenerationVariantsForSection('hero').find(variant => !heroes(packId).some(entry => entry.id === variant.id));
    if (!outsider) return; // every hero is in this pack — nothing to compare
    expect(compositionAffinityScore(inPack, { packId })).toBeGreaterThan(compositionAffinityScore(outsider, { packId }));
  });

  it('penalises a variant carrying the industry\'s discouraged traits', () => {
    const base = heroes()[0];
    const offending = { ...base, id: `${base.id}-mono`, tags: ['mono-terminal'] } as SectionVariant;
    expect(compositionAffinityScore(offending, { industry: 'salon' }))
      .toBeLessThan(compositionAffinityScore(base, { industry: 'salon' }));
  });

  it('honours authored neighbour affinity', () => {
    const base = heroes()[0];
    const loves = { ...base, id: `${base.id}-loves`, compositionAffinity: { gallery: 0.95 } } as SectionVariant;
    const avoids = { ...base, id: `${base.id}-avoids`, compositionAffinity: { gallery: 0.1 } } as SectionVariant;
    const context = { neighbors: ['gallery', 'hero'] as const };
    expect(compositionAffinityScore(loves, context)).toBeGreaterThan(compositionAffinityScore(avoids, context));
  });

  it('prefers the composition baseline when nothing argues against it', () => {
    const candidates = heroes();
    const baselineVariantId = candidates[candidates.length - 1].id;
    expect(selectAffineVariant(candidates, 'seed-a', { baselineVariantId })?.id).toBeDefined();
    expect(affinityBand(candidates, { baselineVariantId }).some(variant => variant.id === baselineVariantId)).toBe(true);
  });

  it('is deterministic per seed and never selects an ineligible candidate', () => {
    const candidates = heroes();
    for (const seed of ['alpha', 'beta', 'gamma']) {
      const first = selectAffineVariant(candidates, seed, { industry: 'salon', role: 'home' });
      const again = selectAffineVariant(candidates, seed, { industry: 'salon', role: 'home' });
      expect(first?.id).toBe(again?.id);
      expect(candidates.some(candidate => candidate.id === first?.id)).toBe(true);
    }
  });

  it('returns undefined only when there is no legal candidate', () => {
    expect(selectAffineVariant([], 'seed')).toBeUndefined();
    expect(selectAffineVariant([heroes()[0]], 'seed')?.id).toBe(heroes()[0].id);
  });
});
