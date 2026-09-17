import { describe, it, expect } from 'vitest';
import { THEME_PRESETS } from '@/components/onboarding/themePresets';
import { themePresetToThemeTokens } from '@/components/onboarding/themePresetToTokens';
import { buildThemedIndexCss } from '@/components/onboarding/themePresetToIndexCss';
import { resolveArtDirectionPackId } from '@/sections/variants/artDirectionPacks';
import { prepareThemeCorrection } from '@/services/theme/themeEdit';
import { buildThemeContractFiles } from '@/platform/core/themeContract';
import type { SiteBundleSnapshot } from '@/platform/core/canonicalPipeline';

describe('Selected preset authority', () => {
  it.each(THEME_PRESETS)('$id preserves preset palette and weight across incompatible industries', preset => {
    const tokens = themePresetToThemeTokens(preset);
    for (const industry of ['salon', 'saas', 'portfolio', 'store', 'restaurant', 'nonprofit']) {
      const css = buildThemedIndexCss(preset, { industry, seed: 'same' });
      expect(css).toContain('--background: ' + tokens.colors.background);
      expect(css).toContain('--ut-weight-display: ' + preset.typography.headingWeight);
      expect(css).toContain('--ut-radius-base: ' + tokens.radius);
      const pack = resolveArtDirectionPackId({ themePresetId: preset.id, industry, seed: 'same' });
      expect(pack).toBe(resolveArtDirectionPackId({ themePresetId: preset.id, industry, seed: 'same' }));
    }
  });
  it('never escapes the selected family when an industry has no matching pack', () => {
    for (let seed = 0; seed < 30; seed++) {
      expect(['bold-commercial', 'brutalist-poster']).toContain(resolveArtDirectionPackId({ themePresetId: 'bold', industry: 'portfolio', seed: String(seed) }));
      expect(['editorial-noir', 'print-serif']).toContain(resolveArtDirectionPackId({ themePresetId: 'editorial', industry: 'saas', seed: String(seed) }));
    }
  });
  it('corrects legacy style once without losing overrides or mutating history', () => {
    const snapshot = { snapshotId: 'old', meta: { themePresetId: 'bold', artDirectionPackId: 'swiss-grid' }, themeTokens: themePresetToThemeTokens(THEME_PRESETS[0]) } as SiteBundleSnapshot;
    const files = { ...buildThemeContractFiles({ artDirectionPackId: 'swiss-grid', themePresetId: 'bold' }), '/.unison/theme-overrides.json': JSON.stringify({ version: '1.0', tokens: { '--primary': '120 40% 30%' } }), '/src/pages/Home.tsx': 'unchanged content' };
    const before = JSON.stringify(snapshot);
    const result = prepareThemeCorrection(files, snapshot, 'revision');
    expect(JSON.stringify(snapshot)).toBe(before);
    expect(result.snapshot.meta.themeStyleVersion).toBe('2.0');
    expect(result.snapshot.themeTokens!.colors.background).toBe('0 0% 0%');
    expect(result.files['/.unison/theme-overrides.json']).toContain('120 40% 30%');
    expect(result.files['/src/pages/Home.tsx']).toBe('unchanged content');
    expect(prepareThemeCorrection(result.files, result.snapshot, 'revision').snapshot).toBe(result.snapshot);
  });
});
