import { describe, it, expect } from 'vitest';
import {
  listAllowedArtDirectionPacks,
  resolveIndustryArtDirectionPackId,
  listImplementationsForIndustry,
  industryImplementationGaps,
} from '@/services/designImplementationRegistry';
import { INDUSTRY_MATRIX, getAllIndustries } from '@/platform/core/industryMatrix';
import { ART_DIRECTION_PACK_IDS } from '@/sections/variants/artDirectionPacks';

describe('design registry industry wiring', () => {
  it('narrows art direction to the packs an industry allows', () => {
    for (const profile of getAllIndustries()) {
      const allowed = listAllowedArtDirectionPacks(profile.industry);
      expect(allowed.length).toBeGreaterThan(0);
      if (profile.allowedArtDirectionPacks?.length) {
        expect(allowed).toEqual(profile.allowedArtDirectionPacks);
      }
      const resolved = resolveIndustryArtDirectionPackId({
        industry: profile.industry,
        themePresetId: 'obsidian',
        seed: 'seed-1',
      });
      expect(allowed).toContain(resolved);
    }
  });

  it('falls back to the full catalogue for unknown industries', () => {
    expect(listAllowedArtDirectionPacks('not-an-industry')).toEqual([...ART_DIRECTION_PACK_IDS]);
  });

  it('resolves deterministically for identical inputs', () => {
    const a = resolveIndustryArtDirectionPackId({ industry: 'salon', themePresetId: 'obsidian', seed: 's' });
    const b = resolveIndustryArtDirectionPackId({ industry: 'salon', themePresetId: 'obsidian', seed: 's' });
    expect(a).toBe(b);
  });

  it('exposes renderable implementations for every industry page contract', () => {
    for (const key of Object.keys(INDUSTRY_MATRIX)) {
      expect(listImplementationsForIndustry(key).length).toBeGreaterThan(0);
    }
  });

  it('reports industry sections with no renderable implementation', () => {
    const gaps = Object.keys(INDUSTRY_MATRIX).flatMap((key) =>
      industryImplementationGaps(key).map((section) => `${key}:${section}`),
    );
    expect(gaps).toEqual([]);
  });
});
