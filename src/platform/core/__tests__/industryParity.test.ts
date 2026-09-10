import { describe, it, expect } from 'vitest';
import {
  SHIPPED_INDUSTRIES,
  checkIndustryParity,
  assertIndustryParity,
  industryDistinctnessSignature,
  getShippedIndustryProfile,
} from '../industryParity';

describe('industry parity', () => {
  it('describes every shipped industry across all registries', () => {
    expect(checkIndustryParity()).toEqual([]);
    expect(() => assertIndustryParity()).not.toThrow();
  });

  it('gives every industry a distinct experience signature', () => {
    const seen = new Map<string, string>();
    for (const industry of SHIPPED_INDUSTRIES) {
      const signature = industryDistinctnessSignature(industry);
      const clash = seen.get(signature);
      expect(clash, `${industry} is identical to ${clash}`).toBeUndefined();
      seen.set(signature, industry);
    }
  });

  it('does not make every industry booking-shaped', () => {
    const anchors = SHIPPED_INDUSTRIES.map(i => getShippedIndustryProfile(i)?.anchorCapability);
    expect(new Set(anchors).size).toBeGreaterThan(3);
    expect(anchors.filter(a => a === 'booking').length).toBeLessThan(SHIPPED_INDUSTRIES.length / 2);
  });
});
