/**
 * Launch asset seeding — after the first accepted revision, save the products,
 * services and business details the launch already planned, so a fresh site
 * opens with live, editable assets. Idempotent: never overwrites, never
 * duplicates by name. Writes only through the shared catalog operations and
 * the business profile service.
 */
import { createCatalogItem, listCatalog } from '@/services/agent-runtime/catalogOps';
import { loadBusinessProfile, saveBusinessProfile, type BusinessProfilePatch } from '@/services/businessProfileService';
import type { CreatorData } from '@/types/creatorData';

export interface SeedLaunchAssetsResult { created: number; profileFields: string[] }

export async function seedLaunchAssets(input: { businessId: string; creatorData?: CreatorData | null }): Promise<SeedLaunchAssetsResult> {
  const data = input.creatorData;
  const result: SeedLaunchAssetsResult = { created: 0, profileFields: [] };
  if (!data) return result;
  const existing = await listCatalog(input.businessId, ['products', 'services']).catch(() => []);
  const have = new Set(existing.map((i) => `${i.surfaceId}:${i.name.trim().toLowerCase()}`));
  const plans: { surface: string; name: string; description?: string; price?: number | null }[] = [
    ...Object.values(data.products ?? {}).map((p) => ({ surface: 'products', name: p.name, description: p.description, price: p.price })),
    ...Object.values(data.services ?? {}).map((s) => ({ surface: 'services', name: s.name, description: s.description, price: s.price ?? null })),
  ];
  for (const p of plans) {
    const name = String(p.name ?? '').trim();
    if (!name || have.has(`${p.surface}:${name.toLowerCase()}`)) continue;
    await createCatalogItem(input.businessId, p.surface, { name, description: p.description ?? null, price: p.price ?? null, active: true });
    have.add(`${p.surface}:${name.toLowerCase()}`);
    result.created += 1;
  }
  const info = data.businessInfo;
  const profile = await loadBusinessProfile(input.businessId).catch(() => null);
  if (info && profile) {
    const patch: Record<string, unknown> = {};
    const cur = profile as unknown as Record<string, unknown>;
    for (const [k, v] of [['tagline', info.tagline], ['description', info.description], ['phone', info.phone], ['email', info.email]] as const) {
      if (v && !cur[k]) patch[k] = v;
    }
    if (Object.keys(patch).length) {
      await saveBusinessProfile(input.businessId, patch as BusinessProfilePatch);
      result.profileFields = Object.keys(patch);
    }
  }
  return result;
}
