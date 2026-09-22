import { describe, expect, it } from 'vitest';
import {
  listLegalImplementations,
  resolveImplementationContract,
  resolveLegalImplementation,
} from '@/platform/core/resolvedImplementationContract';
import { ART_DIRECTION_PACKS, ART_DIRECTION_PACK_IDS } from '@/sections/variants/artDirectionPacks';
import { getGenerationVariantsForSection } from '@/sections/variants/registry';

const packId = ART_DIRECTION_PACK_IDS[0];
const hero = getGenerationVariantsForSection('hero', ART_DIRECTION_PACKS[packId], 'home')[0];

describe('Phase 8 — one resolved catalog, no legacy fallback authority', () => {
  it('derives creative affinity and a visual signature for a certified design', () => {
    const contract = resolveImplementationContract(hero.id);
    expect(contract).not.toBeNull();
    expect(contract!.certified).toBe(true);
    expect(contract!.visualSignature).not.toBeNull();
    expect(contract!.creativeAffinity.artDirections).toContain(packId);
  });

  it('accepts a certified design for fresh generation and AI edits', () => {
    for (const usage of ['fresh-generation', 'ai-edit'] as const) {
      expect(resolveLegalImplementation(hero.id, usage).legal).toBe(true);
    }
  });

  it('rejects an unknown implementation instead of falling back', () => {
    const result = resolveLegalImplementation('hero:not-a-real-design', 'fresh-generation');
    expect(result.legal).toBe(false);
    expect(result.legal === false && result.reason).toMatch(/not a registered design/);
  });

  it('keeps a saved revision readable even when it is no longer generation-legal', () => {
    const saved = resolveLegalImplementation('hero:not-a-real-design', 'saved-revision');
    expect(saved.legal).toBe(false); // unknown stays unknown
    const known = resolveLegalImplementation(hero.id, 'saved-revision');
    expect(known.legal).toBe(true);
  });

  it('lists only legal implementations for a family, narrowed by art direction', () => {
    const all = listLegalImplementations('hero');
    expect(all.length).toBeGreaterThan(0);
    expect(all.every(contract => contract.certified && contract.generationStatus !== 'legacy')).toBe(true);
    const inPack = listLegalImplementations('hero', { packId });
    expect(inPack.length).toBeGreaterThan(0);
    expect(inPack.every(contract => contract.creativeAffinity.artDirections.includes(packId))).toBe(true);
    expect(inPack.length).toBeLessThanOrEqual(all.length);
  });

  it('never returns a design the industry rejects', () => {
    const contracts = listLegalImplementations('hero', { industry: 'salon' });
    expect(contracts.every(contract => !contract.creativeAffinity.discouragedIndustries.includes('salon'))).toBe(true);
  });
});
