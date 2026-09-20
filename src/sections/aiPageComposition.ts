import { createIndustryStarterSection } from './templates/industryDefaultRegistry';
import { z } from 'zod';
import type { SectionType, TemplateComposition } from '@/sections/types';
import { getVariantById, getGenerationVariantsForSection } from '@/sections/variants/registry';
import { ART_DIRECTION_PACKS, type ArtDirectionPackId } from '@/sections/variants/artDirectionPacks';
import type { VariantId } from '@/sections/variants/types';

export const COMPOSITION_ROLES = ['home', 'services', 'pricing', 'about', 'contact', 'gallery', 'faq', 'booking', 'shop', 'checkout', 'thank_you', 'blog', 'immersive', 'custom'] as const;
const family = z.enum(['navbar', 'hero', 'about', 'services', 'features', 'gallery', 'pricing', 'logo-cloud', 'blog-preview', 'before-after', 'testimonials', 'cta', 'contact', 'footer', 'stats', 'team', 'faq']);
const sectionCopy = z.object({
  items: z.array(z.union([z.object({ title: z.string().max(140), description: z.string().max(600) }).strict(), z.object({ question: z.string().max(240), answer: z.string().max(1000) }).strict()])).min(1).max(8).optional(),
  headline: z.string().max(240).optional(),
  subheadline: z.string().max(700).optional(),
  description: z.string().max(1600).optional(),
}).strict();
const schema = z.object({
  version: z.literal('1.0'),
  pages: z.array(z.object({
    role: z.enum(COMPOSITION_ROLES),
    sectionOrder: z.array(family).min(1).max(17),
    copy: z.record(z.string(), sectionCopy).optional(),
    variants: z.record(z.string(), z.string().max(100)).refine(value => Object.keys(value).length <= 17),
  }).strict()).min(1).max(COMPOSITION_ROLES.length),
}).strict();
export type AIPageCompositionPlan = z.infer<typeof schema>;

/** No source code, theme overrides, props, routes or mutation commands are accepted. */
export function validateAIPageComposition(value: unknown, packId: ArtDirectionPackId, roles: readonly string[]) {
  if (typeof value === 'object' && value && 'content' in value) value = (value as { content: unknown }).content;
  if (typeof value === 'string') {
    if (value.length > 40000) return null;
    try { value = JSON.parse(value.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')); } catch { return null; }
  }
  const parsed = schema.safeParse(value);
  if (!parsed.success) return null;
  const plan = parsed.data;
  if (new Set(plan.pages.map(page => page.role)).size !== plan.pages.length) return null;
  for (const page of plan.pages) {
    if (!roles.includes(page.role) || new Set(page.sectionOrder).size !== page.sectionOrder.length) return null;
    if (Object.keys(page.copy ?? {}).some(type => !page.sectionOrder.includes(type as SectionType) || type === 'navbar' || type === 'footer')) return null;
    for (const [type, copy] of Object.entries(page.copy ?? {})) {
      if (copy.items && (!['services','features','faq'].includes(type) || copy.items.some(item => type === 'faq' ? !('question' in item) : !('title' in item)))) return null;
    }
    for (const [type, id] of Object.entries(page.variants)) {
      if (!page.sectionOrder.includes(type as SectionType)) return null;
      const variant = getVariantById(id as VariantId);
      if (!variant || variant.sectionType !== type || variant.vfs?.mode !== 'portable-recipe' || variant.generationStatus === 'legacy') return null;
      // Role eligibility is owned by getGenerationVariantsForSection below, which
      // treats pageRoles as a preference and falls back to the certified set.
      const allowed = getGenerationVariantsForSection(variant.sectionType, ART_DIRECTION_PACKS[packId], page.role).map(candidate => candidate.id);
      if (!allowed.includes(variant.id)) return null;
    }
  }
  return plan;
}

/** Reorders existing data-owned sections. Chrome and every business section survive. */
export function applyAIPageComposition(template: TemplateComposition, plan: AIPageCompositionPlan | undefined) {
  const page = plan?.pages.find(entry => entry.role === (template.pageRole || 'home'));
  if (!page) return template;
  const rank = (type: SectionType) => type === 'navbar' ? -2 : type === 'hero' ? -1 : type === 'footer' ? 100 :
    page.sectionOrder.includes(type) ? page.sectionOrder.indexOf(type) : 50;
  const sections = [...template.sections];
  const additive = new Set<SectionType>(['about', 'features', 'services', 'faq', 'contact', 'cta']);
  for (const type of page.sectionOrder) {
    if (!additive.has(type) || sections.some(section => section.type === type) || !page.variants[type] || !page.copy?.[type]) continue;
    const brand = template.sections.find(section => section.type === 'navbar')?.props as { brand?: string } | undefined;
    const section = createIndustryStarterSection(template.industry, type, { businessName: brand?.brand || template.name, idPrefix: template.id + '-ai' });
    if (section) sections.push(section);
  }
  return { ...template, sections: sections.map(section => {
    const copy = page.copy?.[section.type];
    const existing = (section.props as { items?: Record<string, unknown>[] }).items;
    const items = copy?.items?.map((item, index) => ({ ...existing?.[index], ...item }));
    return { ...section, props: { ...section.props, ...copy, ...(items ? { items } : {}) } } as typeof section;
  }).map((section, index) => ({ section, index }))
    .sort((a, b) => rank(a.section.type) - rank(b.section.type) || a.index - b.index)
    .map(({ section }) => section) };
}
