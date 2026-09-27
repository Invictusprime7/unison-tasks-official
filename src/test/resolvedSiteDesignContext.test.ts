import { describe, it, expect } from 'vitest';
import { compileResolvedSiteDesignContext } from '@/services/launch/resolvedSiteDesignContext';

const input = {
  designSeed: 'salon:noir',
  businessModel: 'service_booking' as never,
  industry: 'salon',
  roles: ['home', 'services', 'contact'],
};

describe('ResolvedSiteDesignContext', () => {
  it('is deterministic for identical inputs', () => {
    const a = compileResolvedSiteDesignContext(input);
    const b = compileResolvedSiteDesignContext(input);
    expect(a.fingerprint).toBe(b.fingerprint);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it('changes fingerprint when the design seed changes', () => {
    const a = compileResolvedSiteDesignContext(input);
    const b = compileResolvedSiteDesignContext({ ...input, designSeed: 'other' });
    expect(a.fingerprint).not.toBe(b.fingerprint);
  });

  it('keeps recommendation and hard legality disjoint and permits local components', () => {
    const ctx = compileResolvedSiteDesignContext(input);
    expect(ctx.creativeRecommendation.localComponentsPermitted).toBe(true);
    for (const [family, ids] of Object.entries(ctx.creativeRecommendation.preferredImplementations)) {
      const banned = new Set(ctx.hardLegality.forbiddenImplementations[family as never] ?? []);
      for (const id of ids ?? []) expect(banned.has(id)).toBe(false);
    }
    expect(Object.keys(ctx.contract.pages)).toEqual(['home', 'services', 'contact']);
  });
});
