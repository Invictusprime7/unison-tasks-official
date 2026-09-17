/**
 * Canonical Design Prompt Context (M2)
 *
 * Single authority for the design/section/intent context injected into the
 * in-Builder AI. It is derived from the canonical variant registry
 * (`src/sections/variants/registry.ts`) and the canonical intent registry
 * (`src/platform/core/intentSurfaceRegistry.ts`) — NOT from the legacy
 * `src/data/siteElementsLibrary/*` element catalogue, which is retired as an
 * AI authority.
 *
 * Rules enforced by this context:
 * - Registered variant IDs are the only legal section implementations.
 * - Certified (`vfs: { mode: 'portable-recipe' }`) variants are preferred.
 * - Only canonical `user-action` intents may be stamped as `data-ut-intent`.
 * - Industry profiles decide required / primary / forbidden intents.
 */

import { VARIANT_REGISTRY } from '../variants/registry';
import type { SectionVariant } from '../variants/types';
import type { SectionType } from '../types';
import { INTENT_REGISTRY } from '@/platform/core/intentSurfaceRegistry';
import { getIndustryIntentProfile } from '@/platform/core/industryIntentProfiles';

/** Maps a Builder business system type onto a canonical industry profile key. */
const SYSTEM_TYPE_TO_INDUSTRY: Record<string, string> = {
  booking: 'salon',
  salon: 'salon',
  restaurant: 'restaurant',
  store: 'ecommerce',
  ecommerce: 'ecommerce',
  agency: 'agency',
  saas: 'agency',
  portfolio: 'portfolio',
  content: 'portfolio',
  nonprofit: 'nonprofit',
  coaching: 'coaching',
  'local-service': 'contractor',
  contractor: 'contractor',
};

export function resolveIndustryKey(systemType?: string | null): string | undefined {
  if (!systemType) return undefined;
  return SYSTEM_TYPE_TO_INDUSTRY[systemType] ?? (getIndustryIntentProfile(systemType) ? systemType : undefined);
}

const isCertified = (variant: SectionVariant): boolean => variant.vfs?.mode === 'portable-recipe';

/** Relevance score used to keep the prompt inside its token budget. */
function scoreSection(sectionType: SectionType, prompt: string): number {
  const needle = sectionType.replace(/-/g, ' ');
  return prompt.toLowerCase().includes(needle) ? 1 : 0;
}

function variantLine(variant: SectionVariant): string {
  const flags = [
    isCertified(variant) ? 'certified' : 'legacy-jsx',
    variant.isDefault ? 'default' : null,
    variant.tags?.length ? variant.tags.slice(0, 3).join('/') : null,
  ].filter(Boolean).join(', ');
  return `  - ${variant.id} — ${variant.description || variant.name} (${flags})`;
}

export interface CanonicalDesignPromptOptions {
  systemType?: string | null;
  userPrompt?: string;
  /** Max section families listed in full detail. */
  maxSections?: number;
}

/**
 * Builds the canonical design + intent context block for the AI Builder.
 */
export function generateCanonicalDesignPrompt(options: CanonicalDesignPromptOptions = {}): string {
  const { systemType, userPrompt = '', maxSections = 12 } = options;

  const families = (Object.keys(VARIANT_REGISTRY) as SectionType[])
    .filter((sectionType) => (VARIANT_REGISTRY[sectionType] || []).length > 0)
    .sort((a, b) => scoreSection(b, userPrompt) - scoreSection(a, userPrompt) || a.localeCompare(b));

  const detailed = families.slice(0, maxSections);
  const remaining = families.slice(maxSections);

  const lines: string[] = [];
  lines.push('## CANONICAL SECTION REGISTRY (single source of truth)');
  lines.push('Only these registered variant IDs may be used. Never invent a section id.');
  lines.push('Prefer "certified" variants — they compile to portable recipes that render');
  lines.push('identically in Preview and in the published site.');
  lines.push('');

  for (const sectionType of detailed) {
    const variants = VARIANT_REGISTRY[sectionType] || [];
    const certifiedCount = variants.filter(isCertified).length;
    lines.push(`### ${sectionType} (${variants.length} variants, ${certifiedCount} certified)`);
    for (const variant of variants) lines.push(variantLine(variant));
    lines.push('');
  }

  if (remaining.length) {
    lines.push(`Other registered families: ${remaining.join(', ')}.`);
    lines.push('');
  }

  // ── Canonical intent vocabulary ────────────────────────────────────────
  const userActionIntents = Object.values(INTENT_REGISTRY)
    .filter((intent) => intent.triggerType === 'user-action' && intent.status !== 'deprecated');

  const industry = resolveIndustryKey(systemType);
  const profile = industry ? getIndustryIntentProfile(industry) : undefined;

  lines.push('## CANONICAL INTENT VOCABULARY (data-ut-intent)');
  lines.push('Interactive elements are wired ONLY with `data-ut-intent="<name>"` using');
  lines.push('these canonical names. Legacy names (nav.goto_page, calendar.open,');
  lines.push('form.open, popup.open, checkout.start, external.open) are forbidden.');
  lines.push('');

  const prioritized = profile
    ? [...new Set([...profile.required, ...profile.primary, ...profile.secondary])]
    : [];
  const priority = new Set(prioritized);
  const forbidden = new Set(profile?.forbidden ?? []);

  const listed = userActionIntents
    .filter((intent) => !forbidden.has(intent.name))
    .sort((a, b) => Number(priority.has(b.name)) - Number(priority.has(a.name)) || a.name.localeCompare(b.name))
    .slice(0, 40);

  for (const intent of listed) {
    const marks = [
      profile?.required.includes(intent.name) ? 'REQUIRED' : null,
      profile?.primary.includes(intent.name) ? 'primary' : null,
      intent.requiredCapabilities?.length ? `needs: ${intent.requiredCapabilities.join('+')}` : null,
    ].filter(Boolean).join(', ');
    lines.push(`- ${intent.name}${marks ? ` [${marks}]` : ''} — ${intent.description}`);
  }
  lines.push('');

  if (profile) {
    lines.push(`## INDUSTRY PROFILE: ${profile.industry}`);
    if (profile.required.length) lines.push(`Required intents (must exist on the site): ${profile.required.join(', ')}`);
    if (profile.primary.length) lines.push(`Primary conversion intents: ${profile.primary.join(', ')}`);
    if (profile.forbidden.length) lines.push(`Forbidden for this industry: ${profile.forbidden.join(', ')}`);
    lines.push('');
  }

  return lines.join('\n');
}

export default generateCanonicalDesignPrompt;
