import { describe, expect, test } from 'vitest';
import {
  ART_DIRECTION_PACK_IDS, ART_DIRECTION_PACKS, ART_DIRECTION_FAMILY_REGISTRY, THEME_FAMILY_IDS, INDUSTRY_PACK_CAPABILITY,
  packsForThemeFamily, themeFamiliesForPack, resolveUnisonArtDirection, orphanedArtDirectionPacks,
  compileUnisonDesignContext, validateComposition, applyPostCompositionTheme, applyBrandTokens,
  getGenerationVariantsForSection, isCanonicalImplementation, getSectionTypesWithVariants,
} from '../sections/unison';

const brief = { projectName: 'Northline', industry: 'restaurant', audience: ['locals'], goals: ['bookings'], pageRoles: ['home', 'contact'] };

describe('Theme Family → Art Direction Pack invariants', () => {
  test('every released pack belongs to at least one Theme Family', () => {
    expect(orphanedArtDirectionPacks()).toEqual([]);
    for (const id of ART_DIRECTION_PACK_IDS) expect(themeFamiliesForPack(id).length).toBeGreaterThan(0);
  });
  test('every referenced pack exists', () => {
    const refs = [...Object.keys(ART_DIRECTION_FAMILY_REGISTRY), ...THEME_FAMILY_IDS.flatMap(packsForThemeFamily), ...Object.values(INDUSTRY_PACK_CAPABILITY).flat()];
    for (const id of refs) expect(ART_DIRECTION_PACKS[id as keyof typeof ART_DIRECTION_PACKS]).toBeDefined();
  });
  test('every released pack resolves only certified implementations', () => {
    for (const id of ART_DIRECTION_PACK_IDS) for (const family of getSectionTypesWithVariants())
      for (const v of getGenerationVariantsForSection(family, ART_DIRECTION_PACKS[id])) expect(isCanonicalImplementation(v.id)).toBe(true);
  });
  test('explicit and sealed pack selections remain sealed', () => {
    for (const id of ART_DIRECTION_PACK_IDS) {
      expect(resolveUnisonArtDirection({ artDirectionPackId: id, themeFamilyId: 'bold', industry: 'saas' }).packId).toBe(id);
      expect(resolveUnisonArtDirection({ sealedPackId: id, artDirectionPackId: 'neon-grid' }).packId).toBe(id);
      expect(compileUnisonDesignContext({ ...brief, artDirectionPackId: id }).contract.artDirectionPackId).toBe(id);
    }
  });
  test('same seed + same inputs produce the same resolution', () => {
    const a = compileUnisonDesignContext({ ...brief, themeFamilyId: 'editorial', designSeed: 'seed-1' });
    const b = compileUnisonDesignContext({ ...brief, themeFamilyId: 'editorial', designSeed: 'seed-1' });
    expect(a.resolution.packId).toBe(b.resolution.packId);
    expect(a.seededChoices).toEqual(b.seededChoices);
  });
  test('industry cannot silently replace an explicitly chosen Theme Family', () => {
    for (const family of THEME_FAMILY_IDS) for (const industry of Object.keys(INDUSTRY_PACK_CAPABILITY)) for (const seed of ['a', 'b', 'c']) {
      const r = resolveUnisonArtDirection({ themeFamilyId: family, industry, designSeed: seed });
      expect(packsForThemeFamily(family)).toContain(r.packId);
      expect(r.themeFamilyId).toBe(family);
    }
  });
  test('brand changes cannot alter Art Direction Pack identity', () => {
    const plain = compileUnisonDesignContext({ ...brief, themeFamilyId: 'organic', designSeed: 's' });
    const branded = compileUnisonDesignContext({ ...brief, themeFamilyId: 'organic', designSeed: 's', brand: { colors: { primary: '200 80% 40%' }, fonts: { display: 'Fraunces' } } });
    expect(branded.resolution.packId).toBe(plain.resolution.packId);
    const tokens = applyBrandTokens(plain.resolution.packId, { colors: { primary: '200 80% 40%' } });
    expect(tokens.artDirectionPackId).toBe(plain.resolution.packId);
    expect(tokens.tokens['--primary']).toBe('200 80% 40%');
  });
  test('page composition cannot select implementations outside the resolved vocabulary', () => {
    const ctx = compileUnisonDesignContext({ ...brief, themeFamilyId: 'editorial', designSeed: 's' });
    const legal = Object.entries(ctx.seededChoices).map(([key, id]) => ({ family: key.split(':')[1] as never, variantId: id as never }));
    expect(validateComposition(ctx, { pages: { home: legal } })).toEqual([]);
    expect(validateComposition(ctx, { pages: { home: [{ family: 'hero', variantId: 'hero:not-real' as never }] } }).length).toBe(1);
  });
  test('post-composition theme application cannot change variant identities', () => {
    const ctx = compileUnisonDesignContext({ ...brief, themeFamilyId: 'bold', designSeed: 's' });
    const composition = { pages: { home: Object.entries(ctx.seededChoices).map(([k, id]) => ({ family: k.split(':')[1] as never, variantId: id as never })) } };
    const snapshot = JSON.stringify(composition);
    const themed = applyPostCompositionTheme(ctx, composition, { colors: { primary: '0 0% 0%' } });
    expect(JSON.stringify(themed.composition)).toBe(snapshot);
    expect(themed.artDirectionPackId).toBe(ctx.resolution.packId);
  });
});
