import { describe, expect, it } from 'vitest';
import {
  ART_DIRECTION_FAMILIES, ART_DIRECTION_FAMILY_IDS, familyIdFromThemePreset, resolvePackAlias,
} from '@/sections/variants/artDirectionFamilies';
import { ART_DIRECTION_PACK_IDS, getArtDirectionPack, resolveArtDirectionPackId } from '@/sections/variants/artDirectionPacks';
import { projectResolvedArtDirection } from '@/sections/variants/resolvedArtDirection';
import { buildWizardDesignIntervention } from '@/services/wizardDesignIntervention';

describe('Canonical Art Direction Families', () => {
  it('six families, each owning at least two registered packs', () => {
    expect([...ART_DIRECTION_FAMILY_IDS].sort()).toEqual(['bold','editorial','futuristic','minimalist','modern','organic']);
    for (const f of Object.values(ART_DIRECTION_FAMILIES)) {
      expect(f.packs.length).toBeGreaterThanOrEqual(2);
      for (const p of f.packs) {
        expect(p.qualifiedId.startsWith(`${f.id}.`)).toBe(true);
        expect(getArtDirectionPack(p.packId)).toBeDefined();
      }
    }
  });
  it('every registered pack has a family parent', () => {
    const owned = new Set(Object.values(ART_DIRECTION_FAMILIES).flatMap(f => f.packs.map(p => p.packId)));
    for (const id of ART_DIRECTION_PACK_IDS) expect(owned.has(id)).toBe(true);
  });
  it('themePresetId is the family id; qualified ids alias storage ids', () => {
    expect(familyIdFromThemePreset('Bold')).toBe('bold');
    expect(resolvePackAlias('bold.poster')).toBe('brutalist-poster');
    expect(resolveArtDirectionPackId({ sealedPackId: 'editorial.noir' })).toBe('editorial-noir');
  });
  it('family choice keeps the resolved pack inside that family', () => {
    for (const f of ART_DIRECTION_FAMILY_IDS) {
      const id = resolveArtDirectionPackId({ themePresetId: f, seed: 'x' });
      expect(ART_DIRECTION_FAMILIES[f].packs.map(p => p.packId)).toContain(id);
    }
  });
  it('projects a deterministic ResolvedArtDirection from the intervention', () => {
    const input = { businessName: 'N', businessModel: 'appointment_service' as const, industryOverlay: 'salon' as const, templateId: 'salon-premium', themePresetId: 'organic', wizardSeedId: 'a' };
    const a = projectResolvedArtDirection(buildWizardDesignIntervention(input));
    const b = projectResolvedArtDirection(buildWizardDesignIntervention({ ...input, wizardSeedId: 'b' }));
    expect(a).toEqual(b);
    expect(a?.familyId).toBe('organic');
    expect(a?.packId.startsWith('organic.')).toBe(true);
    expect(buildWizardDesignIntervention(input).aiDirective).toContain('never switch family');
  });
});
