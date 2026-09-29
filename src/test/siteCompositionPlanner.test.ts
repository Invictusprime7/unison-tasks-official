import { describe, expect, it } from 'vitest';
import {
  compositionSimilarity,
  extractCompositionSignature,
  findRedundancy,
  listIndustryProfiles,
  planSiteComposition,
  renderCompositionBrief,
} from '@/services/composition';

const roles = ['home', 'services', 'gallery', 'about', 'booking', 'contact'];
const pages = roles.map((role) => ({ pageId: `p-${role}`, role }));
const key = (t: { hero: string; geometry: string; sectionOrder: string[] }) => `${t.hero}|${t.geometry}|${t.sectionOrder.join('>')}`;

describe('siteCompositionPlanner', () => {
  it('gives every salon page a distinct composition job', () => {
    const plan = planSiteComposition('salon', pages, 'seed-a');
    expect(plan.pages).toHaveLength(6);
    expect(new Set(plan.pages.map((p) => key(p.target))).size).toBe(6);
    expect(plan.pages.every((p) => p.profile.industryId === 'salon')).toBe(true);
    const immersive = plan.pages.filter((p) => p.target.hero === 'immersive-media');
    expect(immersive.length).toBeLessThanOrEqual(1);
  });

  it('plans a restaurant with the same planner and data only', () => {
    const plan = planSiteComposition('restaurant', [...pages, { pageId: 'p-menu', role: 'menu' }], 'seed-a');
    expect(plan.pages.find((p) => p.role === 'menu')?.profile.industryId).toBe('restaurant');
    expect(new Set(plan.pages.map((p) => key(p.target))).size).toBe(plan.pages.length);
    expect(listIndustryProfiles('restaurant').length).toBeGreaterThanOrEqual(6);
  });

  it('is deterministic for the same seed', () => {
    expect(planSiteComposition('salon', pages, 'x')).toEqual(planSiteComposition('salon', pages, 'x'));
  });

  it('keeps page jobs regardless of art direction seed', () => {
    const a = planSiteComposition('salon', pages, 'pack-editorial');
    const b = planSiteComposition('salon', pages, 'pack-bold');
    expect(a.pages.map((p) => p.profile.narrativeGoals)).toEqual(b.pages.map((p) => p.profile.narrativeGoals));
  });

  it('falls back to generic role jobs for other industries and aliases', () => {
    const plan = planSiteComposition('agency', [{ pageId: 'h', role: 'home' }, { pageId: 'b', role: 'Book Now' }], 's');
    expect(plan.pages[1].profile.pageRole).toBe('booking');
  });
});

describe('redundancy detection', () => {
  const src = `<section data-ut-section="hero" className="min-h-screen"><img/></section><section data-ut-section="services"/><section data-ut-section="cta"/>`;
  it('flags near-identical topology and feeds the repair brief', () => {
    const sig = extractCompositionSignature(src);
    expect(sig.sectionOrder).toEqual(['hero', 'services', 'cta']);
    expect(compositionSimilarity(sig, sig)).toBe(1);
    const issue = findRedundancy('b', sig, [{ pageId: 'a', role: 'home', signature: sig }]);
    expect(issue?.conflictsWith).toBe('a');
    const plan = planSiteComposition('salon', pages, 's');
    expect(renderCompositionBrief(plan.pages[1], [], issue)).toContain('REDUNDANCY REPAIR');
  });
});
