import { describe, it, expect } from 'vitest';
import { resolveSiteConfiguration } from '../resolvedComposition';
import { SHIPPED_INDUSTRIES } from '../industryParity';

describe('resolveSiteConfiguration', () => {
  it('resolves a configuration for every shipped industry', () => {
    for (const industry of SHIPPED_INDUSTRIES) {
      const config = resolveSiteConfiguration({ industry, seed: 'seed-1' });
      expect(config.industry).toBe(industry);
      expect(config.anchorCapability).toBeTruthy();
      expect(config.capabilities).toContain(config.anchorCapability);
      expect(config.pages.length).toBeGreaterThan(0);
      expect(config.pages.some(p => p.role === 'home')).toBe(true);
      expect(config.artDirectionPackId).toBeTruthy();
    }
  });

  it('is deterministic for identical input', () => {
    const a = resolveSiteConfiguration({ industry: 'contractor', seed: 'abc', themePresetId: 'bold' });
    const b = resolveSiteConfiguration({ industry: 'contractor', seed: 'abc', themePresetId: 'bold' });
    expect(a.signature).toBe(b.signature);
  });

  it('gives different industries different configurations', () => {
    const signatures = SHIPPED_INDUSTRIES.map(
      i => resolveSiteConfiguration({ industry: i, seed: 'seed-1' }).signature,
    );
    expect(new Set(signatures).size).toBe(signatures.length);
  });

  it('never picks an art direction outside the industry allow list', () => {
    const config = resolveSiteConfiguration({
      industry: 'contractor',
      themePresetId: 'cinematic',
      seed: 'x',
    });
    expect(['bold-commercial', 'brutalist-poster', 'swiss-grid', 'warm-craft']).toContain(
      config.artDirectionPackId,
    );
  });

  it('honours selected pages while always keeping home', () => {
    const config = resolveSiteConfiguration({ industry: 'salon', requestedPages: ['services'] });
    expect(config.pages.map(p => p.role).sort()).toEqual(['home', 'services']);
  });

  it('rejects an unknown industry rather than falling back', () => {
    expect(() => resolveSiteConfiguration({ industry: 'not-a-real-industry' })).toThrow();
  });
});
