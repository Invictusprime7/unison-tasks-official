/**
 * One universal planner for every industry. Allocates hero pattern and geometry
 * across pages so no two pages share the same topology, deterministically from
 * the design seed. Industry behaviour comes only from registry data.
 */
import { hashSeed } from '@/platform/core/generationSeed';
import { normalizePageRole, resolvePageCompositionProfile } from './industryCompositionRegistry';
import type { HeroPattern, LayoutGeometry, PlannedPage, SiteCompositionPlan } from './types';

export interface PlannerPageInput { pageId: string; role: string }

function rotate<T>(list: T[], seed: string): T[] {
  if (list.length < 2) return list;
  const k = hashSeed(seed) % list.length;
  return [...list.slice(k), ...list.slice(0, k)];
}

export function planSiteComposition(industryId: string, pages: PlannerPageInput[], seed: string): SiteCompositionPlan {
  const heroUsed = new Map<HeroPattern, number>();
  const pairUsed = new Set<string>();
  const planned: PlannedPage[] = [];

  // Home first, then remaining pages in input order — stable and seed-driven.
  const ordered = [...pages].sort((a, b) => (normalizePageRole(a.role) === 'home' ? -1 : normalizePageRole(b.role) === 'home' ? 1 : 0));
  for (const page of ordered) {
    const profile = resolvePageCompositionProfile(industryId, page.role);
    const heroes = profile.heroCandidates.length > 1 && profile.pageRole !== 'home'
      ? rotate(profile.heroCandidates, `${seed}:${page.pageId}:hero`)
      : profile.heroCandidates;
    const geometries = rotate(profile.geometryCandidates, `${seed}:${page.pageId}:geo`);

    let best: { hero: HeroPattern; geometry: LayoutGeometry; cost: number } | null = null;
    heroes.forEach((hero, hi) => geometries.forEach((geometry, gi) => {
      const reuse = hero === 'none' || hero === 'utility-header' ? 0 : (heroUsed.get(hero) ?? 0);
      const cost = reuse * 10 + (pairUsed.has(`${hero}|${geometry}`) ? 5 : 0) + hi + gi * 0.5;
      if (!best || cost < best.cost) best = { hero, geometry, cost };
    }));
    const pick = best ?? { hero: 'none' as HeroPattern, geometry: 'centered' as LayoutGeometry, cost: 0 };
    heroUsed.set(pick.hero, (heroUsed.get(pick.hero) ?? 0) + 1);
    pairUsed.add(`${pick.hero}|${pick.geometry}`);
    planned.push({
      pageId: page.pageId,
      role: page.role,
      profile,
      target: {
        hero: pick.hero,
        geometry: pick.geometry,
        density: profile.compositionCharacter.density,
        sectionOrder: profile.preferredFamilies,
      },
    });
  }
  // Restore caller order.
  const byId = new Map(planned.map((p) => [p.pageId, p]));
  return { industryId, seed, pages: pages.map((p) => byId.get(p.pageId)!) };
}
