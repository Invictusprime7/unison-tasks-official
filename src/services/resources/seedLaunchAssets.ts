/**
 * Launch asset seeding — after the first accepted revision, save the products,
 * services and business details the launch already planned, so a fresh site
 * opens with live, editable assets. Idempotent: never overwrites, never
 * duplicates by name. Writes only through the shared catalog operations and
 * the business profile service.
 */
import { createCatalogItem, listCatalog } from '@/services/agent-runtime/catalogOps';
import { loadBusinessProfile, saveBusinessProfile, type BusinessProfilePatch } from '@/services/businessProfileService';
import { createContentRecord, listContentRecords, listContentTypes, mutateContentRecord } from '@/services/cmsRecordService';
import type { CreatorData } from '@/types/creatorData';

/** Content types a fresh launch can seed, mapped from CreatorData collections. */
const SEED_CONTENT_TYPES: Record<string, { displayName: string; fields: { key: string; label: string; type: string }[] }> = {
  faq: { displayName: 'FAQs', fields: [
    { key: 'question', label: 'Question', type: 'text' },
    { key: 'answer', label: 'Answer', type: 'textarea' },
    { key: 'category', label: 'Category', type: 'text' },
  ] },
  team: { displayName: 'Team', fields: [
    { key: 'role', label: 'Role', type: 'text' },
    { key: 'bio', label: 'Bio', type: 'textarea' },
  ] },
  gallery: { displayName: 'Gallery', fields: [
    { key: 'caption', label: 'Caption', type: 'text' },
    { key: 'category', label: 'Category', type: 'text' },
  ] },
};

export interface SeedLaunchAssetsResult { created: number; profileFields: string[] }

export async function seedLaunchAssets(input: { businessId: string; creatorData?: CreatorData | null }): Promise<SeedLaunchAssetsResult> {
  const data = input.creatorData;
  const result: SeedLaunchAssetsResult = { created: 0, profileFields: [] };
  if (!data) return result;
  const existing = await listCatalog(input.businessId, ['products', 'services', 'testimonials']).catch(() => []);
  const have = new Set(existing.map((i) => `${i.surfaceId}:${i.name.trim().toLowerCase()}`));
  const plans: { surface: string; name: string; description?: string; price?: number | null; extra?: Record<string, unknown> }[] = [
    ...Object.values(data.products ?? {}).map((p) => ({ surface: 'products', name: p.name, description: p.description, price: p.price })),
    ...Object.values(data.services ?? {}).map((s) => ({ surface: 'services', name: s.name, description: s.description, price: s.price ?? null })),
    ...Object.values(data.testimonials ?? {}).filter((t) => t.content?.trim()).map((t) => ({
      surface: 'testimonials', name: t.author, description: t.content,
      extra: { author_role: [t.role, t.company].filter(Boolean).join(', ') || undefined, rating: t.rating, sort_order: t.sortOrder },
    })),
  ];
  for (const p of plans) {
    const name = String(p.name ?? '').trim();
    const isTestimonial = p.surface === 'testimonials';
    if (!name || have.has(`${p.surface}:${name.toLowerCase()}`)) continue;
    await createCatalogItem(input.businessId, p.surface, isTestimonial
      ? { name, description: p.description ?? null, ...(p.extra ?? {}) }
      : { name, description: p.description ?? null, price: p.price ?? null, active: true });
    have.add(`${p.surface}:${name.toLowerCase()}`);
    result.created += 1;
  }
  const info = data.businessInfo;
  const profile = await loadBusinessProfile(input.businessId).catch(() => null);
  if (info && profile) {
    const patch: Record<string, unknown> = {};
    const cur = profile as unknown as Record<string, unknown>;
    for (const [k, v] of [['tagline', info.tagline], ['description', info.description], ['phone', info.phone], ['email', info.email], ['notificationEmail', info.notificationEmail]] as const) {
      if (v && !cur[k]) patch[k] = v;
    }
    // Brand and contact details: only fill fields the business has not set.
    if (info.brandProfile?.primaryColor && !cur.brandColor) patch.brandColor = info.brandProfile.primaryColor;
    if (info.socialLinks && Object.keys(info.socialLinks).length && !Object.keys((cur.socialLinks as Record<string, unknown>) ?? {}).length) {
      patch.socialLinks = info.socialLinks;
    }
    if (info.hours?.length && !(cur.hours as unknown[])?.length) patch.hours = info.hours;
    if (info.address && !Object.keys((cur.address as Record<string, unknown>) ?? {}).length) {
      patch.address = { line1: info.address };
    }
    if (Object.keys(patch).length) {
      await saveBusinessProfile(input.businessId, patch as BusinessProfilePatch);
      result.profileFields = Object.keys(patch);
    }
  }

  // Seed FAQs, team members and gallery items as content entries. Content
  // types are created on demand per business; entries are deduped by title.
  const contentPlans: { type: string; title: string; data: Record<string, unknown> }[] = [
    ...Object.values(data.faqs ?? {}).filter((f) => f.question?.trim()).map((f) => ({
      type: 'faq', title: f.question,
      data: { question: f.question, answer: f.answer, category: f.category, sort_order: f.sortOrder },
    })),
    ...Object.values(data.team ?? {}).filter((m) => m.name?.trim()).map((m) => ({
      type: 'team', title: m.name,
      data: { role: m.role, bio: m.bio, sort_order: m.sortOrder },
    })),
    ...Object.values(data.gallery ?? {}).filter((g) => g.caption?.trim() || g.assetId).map((g) => ({
      type: 'gallery', title: g.caption?.trim() || 'Gallery item',
      data: { caption: g.caption, category: g.category, sort_order: g.sortOrder },
    })),
  ];
  if (contentPlans.length) {
    const types = await listContentTypes({ businessId: input.businessId }).catch(() => [] as Array<Record<string, unknown>>);
    const typeIdByKey = new Map<string, string>();
    for (const t of types) {
      const key = String(t.api_key ?? '').trim();
      if (key && t.id) typeIdByKey.set(key, String(t.id));
    }
    for (const [key, def] of Object.entries(SEED_CONTENT_TYPES)) {
      if (typeIdByKey.has(key) || !contentPlans.some((p) => p.type === key)) continue;
      const created = await mutateContentRecord({
        action: 'content-type-create', businessId: input.businessId,
        values: { apiKey: key, displayName: def.displayName, fieldSchema: { fields: def.fields } },
      }).catch(() => null);
      const id = created?.record?.id;
      if (id) typeIdByKey.set(key, String(id));
    }
    for (const plan of contentPlans) {
      const typeId = typeIdByKey.get(plan.type);
      if (!typeId) continue;
      const existingEntries = await listContentRecords({ businessId: input.businessId, contentTypeId: typeId }).catch(() => [] as Array<Record<string, unknown>>);
      const titles = new Set(existingEntries.map((e) => String(e.title ?? '').trim().toLowerCase()));
      if (titles.has(plan.title.toLowerCase())) continue;
      await createContentRecord({
        businessId: input.businessId, contentTypeId: typeId, status: 'published',
        values: { title: plan.title, data: plan.data },
      });
      result.created += 1;
    }
  }
  return result;
}
