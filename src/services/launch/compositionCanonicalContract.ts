/**
 * Wizard composition canonical contract — the single source of truth shared by
 * the wizard-site-composer AI prompt and the composition validators (edge
 * `compositionCatalogIssues` and client `validateAIPageComposition`).
 *
 * Guidebook rule: AI design/layout composition must follow Unison's canonical
 * validations byte-for-byte. The prompt is therefore never a hand-written prose
 * copy of the rules; it is rendered from the same brief projection the
 * validators read, so the two can never drift.
 *
 * Two mechanisms live here:
 *   1. renderCompositionCanonicalContract — the machine-readable rule block
 *      handed to the model, listing the exact roles, families, per-role eligible
 *      variant IDs and copy/shape limits the validators will assert.
 *   2. normalizeCompositionResponse — deterministic repair of mechanical
 *      envelope defects (compiler-owned variant selections, duplicate families
 *      or roles, unrequested pages, copy/variants aimed at families outside the
 *      section order) that are not design decisions and must never cost a
 *      launch its composition.
 */

import { describePageArchetypes, normalizePageSectionOrder } from '@/sections/pageArchetypeContract';
import type { SiteDesignContractProjection } from '@/services/launch/siteDesignContract';

export interface CompositionContractBrief {
  roles: readonly string[];
  variants: ReadonlyArray<{ id: string; family: string; pageRoles: readonly string[] }>;
  experiencePreference?: string;
  pinnedVariants?: Readonly<Record<string, string>>;
  /** Industry dialect key — modulates the page archetypes (Phase 7). */
  industry?: string;
  /** The compiled site design contract, projected for transport (Phase 7 / P1.8). */
  designContract?: SiteDesignContractProjection;
}


const COMPILER_OWNED_FAMILIES = new Set(['navbar', 'footer']);

const list = (values: readonly string[]): string => (values.length ? values.join(', ') : 'none');

interface CompositionPlanPage {
  role: string;
  sectionOrder: string[];
  copy?: Record<string, unknown>;
  variants: Record<string, string>;
}
interface CompositionPlanValue {
  version: '1.0';
  pages: CompositionPlanPage[];
}

/**
 * Render the exact canonical rule set for this composition request. Everything
 * the validators will assert is stated here with the concrete allowed values,
 * so a compliant model response cannot fail validation for a rule it never saw.
 */
export function renderCompositionCanonicalContract(brief: CompositionContractBrief): string {
  const families = Array.from(new Set(brief.variants.map(variant => variant.family)));
  const perRole = brief.roles.map(role => {
    const eligible = brief.variants.filter(variant => !variant.pageRoles.length || variant.pageRoles.includes(role));
    const byFamily = families
      .map(family => {
        const inFamily = brief.variants.filter(variant => variant.family === family);
        // pageRoles is a preference: when no certified variant of this family
        // declares the role, the whole certified family stays advertised.
        const matched = eligible.filter(variant => variant.family === family);
        const ids = (matched.length ? matched : inFamily).map(variant => variant.id);
        return ids.length ? `    ${family}: ${list(ids)}` : null;
      })
      .filter((line): line is string => Boolean(line))
      .join('\n');
    return `  role "${role}":\n${byFamily || '    (no eligible variants)'}`;
  }).join('\n');

  return [
    'CANONICAL VALIDATION CONTRACT (generated from the validator — every rule below is machine-checked; a violation discards the composition):',
    '1. Return ONLY JSON: {"version":"1.0","pages":[{"role","sectionOrder","variants","copy"?}]}. No markdown, comments, React, TSX, files, props, CSS, imports, routes or explanations.',
    `2. Include each requested role exactly once, at most 14 pages: ${list(brief.roles)}. Never return a role that was not requested.`,
    `3. sectionOrder lists section families in desired order, 1-17 entries, no duplicates. Known families: ${list(families)}.`,
    '4. variants maps a family to one eligible catalog ID listed below for that page role. Every variants family must appear in sectionOrder. Provide at least one variant selection per page.',
    '5. navbar and footer are compiler-owned: never select a variant ID for them and never target them with copy.',
    '6. copy is optional and may only target a body family present in sectionOrder. Keys: headline (max 240 chars), subheadline (max 700), description (max 1600). copy.items (1-8 entries) is allowed only for services/features (each item: title max 140, description max 600) and faq (each item: question max 240, answer max 1000). Never invent prices, credentials, metrics, reviews or business facts.',
    '7. Homepage-first: the "home" page establishes shared architecture and visual language, not a reusable body composition. Every non-home page must choose a role-appropriate section order and may choose different certified body variants. Navbar and footer remain compiler-owned and identical.',
    `8. Experience preference is "${brief.experiencePreference ?? 'standard'}". Every advertised ID is already compatibility-filtered; never invent or import a stronger runtime experience.`,
    `9. User-pinned family choices are final and override AI selection: ${Object.entries(brief.pinnedVariants ?? {}).map(([family, id]) => `${family}=${id}`).join(', ') || 'none'}. If selecting a pinned family, use exactly its pinned ID.`,
    '10. Page archetypes are machine-checked: each role below states the families it must include, the families and design traits it must never include (negative vocabulary) and its body-section ceiling. A page that borrows another role\'s composition is discarded.',
    'PAGE ARCHETYPES (page-specific purpose, required and forbidden vocabulary):',
    describePageArchetypes(brief.roles, brief.industry),
    'ELIGIBLE VARIANT IDS PER ROLE (choose only from these):',
    perRole || '  (none)',
  ].join('\n');
}

/**
 * Deterministically repair mechanical envelope defects before validation.
 *
 * Only non-design defects are repaired: a response wrapper or code fences
 * around the payload, pages for roles that were never requested, duplicate
 * pages for one role, duplicate families inside a section order, compiler-owned
 * (navbar/footer) variant selections, and copy or variant entries aimed at a
 * family outside the page's section order. Variant choices and copy text are
 * never rewritten here — that remains the model's responsibility and the
 * validator's judgement.
 */
export function normalizeCompositionResponse(value: unknown, brief: CompositionContractBrief): unknown {
  if (typeof value === 'object' && value && 'content' in value) value = (value as { content: unknown }).content;
  if (typeof value === 'string') {
    if (value.length > 40000) return value;
    try {
      value = JSON.parse(value.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, ''));
    } catch {
      return value;
    }
  }
  if (typeof value !== 'object' || !value || !Array.isArray((value as { pages?: unknown }).pages)) return value;

  const plan = value as CompositionPlanValue;
  const seenRoles = new Set<string>();
  const pages: CompositionPlanPage[] = [];
  for (const page of plan.pages) {
    if (!page || typeof page.role !== 'string' || !brief.roles.includes(page.role)) continue;
    if (seenRoles.has(page.role)) continue;
    seenRoles.add(page.role);
    const sectionOrder = normalizePageSectionOrder(page.role, Array.isArray(page.sectionOrder)
      ? page.sectionOrder.filter((family, index) => typeof family === 'string' && page.sectionOrder.indexOf(family) === index)
      : [], brief.industry);
    const inOrder = new Set(sectionOrder);
    const variants = Object.fromEntries(Object.entries(page.variants ?? {})
      .filter(([family]) => inOrder.has(family) && !COMPILER_OWNED_FAMILIES.has(family)));
    const copy = page.copy && typeof page.copy === 'object'
      ? Object.fromEntries(Object.entries(page.copy)
          .filter(([family]) => inOrder.has(family) && !COMPILER_OWNED_FAMILIES.has(family)))
      : undefined;
    pages.push({ ...page, sectionOrder, variants, ...(copy ? { copy } : {}) });
  }
  return { ...plan, version: '1.0', pages };
}
