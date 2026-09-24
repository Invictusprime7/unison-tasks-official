import { describe, it, expect } from 'vitest';
import { readSealedArtDirection, projectResolvedArtDirection } from '@/sections/variants/resolvedArtDirection';
import { resolveBuilderRegistryContext } from '@/services/builderRegistryContext';

describe('sealed art direction reader (Phase E)', () => {
  it('returns the sealed record when consistent', () => {
    const sealed = projectResolvedArtDirection({ themePresetId: 'editorial', artDirectionPackId: 'noir-atelier' })!;
    expect(readSealedArtDirection({ artDirection: sealed, artDirectionPackId: 'noir-atelier' })).toBe(sealed);
  });
  it('re-projects a stale record that disagrees with the sealed pack', () => {
    const stale = projectResolvedArtDirection({ themePresetId: 'editorial', artDirectionPackId: 'noir-atelier' })!;
    const out = readSealedArtDirection({ artDirection: stale, artDirectionPackId: 'swiss-grid', themePresetId: 'minimalist' });
    expect(out?.storagePackId).toBe('swiss-grid');
    expect(out?.familyId).toBe('minimalist');
  });
  it('projects legacy revisions without meta.artDirection', () => {
    expect(readSealedArtDirection({ artDirectionPackId: 'editorial-noir', themePresetId: 'editorial' })?.packId).toMatch(/^editorial\./);
    expect(readSealedArtDirection({})).toBeNull();
  });
  it('AI Builder context carries the sealed family', () => {
    const snap = { meta: { artDirectionPackId: 'noir-atelier', themePresetId: 'editorial' } };
    const ctx = resolveBuilderRegistryContext({
      vfsFiles: { '/.unison/site-bundle-snapshot.json': JSON.stringify(snap) },
      industry: 'salon', templateId: 'salon', themePresetId: 'editorial',
    });
    expect(ctx?.artDirection?.familyId).toBe('editorial');
    expect(ctx?.artDirection?.storagePackId).toBe('noir-atelier');
  });
});
