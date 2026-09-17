/**
 * WizardMergeContext — the single typed carrier threaded through deterministic
 * Launcher generation:
 *
 *   selections → canonical compiler → Stage 4b → commitMutation
 *
 * Post-launch tools may consume the same context, but they do not participate
 * in Launcher page authorship.
 */

import type { TemplateLayoutContract } from './templateLayoutContract';
import type { ThemeTokens } from '@/sections/types';
import type { IndustryOverlay } from '@/types/playground';
import type { BusinessProfileDTO } from '@/types/businessProfile';

export interface PublicBusinessContext {
  name: string;
  industry?: string | null;
  tagline?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  brandColor?: string | null;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  timezone: string;
  address: BusinessProfileDTO['address'];
  hours: BusinessProfileDTO['hours'];
  socialLinks: BusinessProfileDTO['socialLinks'];
}

export function buildPublicBusinessContext(profile: BusinessProfileDTO): PublicBusinessContext {
  return {
    name: profile.name,
    industry: profile.industry,
    tagline: profile.tagline,
    description: profile.description,
    logoUrl: profile.logoUrl,
    brandColor: profile.brandColor,
    website: profile.website,
    phone: profile.phone,
    email: profile.email,
    timezone: profile.timezone,
    address: { ...profile.address },
    hours: profile.hours.map((entry) => ({ ...entry })),
    socialLinks: { ...profile.socialLinks },
  };
}

const INDUSTRY_OVERLAY_ALIASES: Record<string, IndustryOverlay> = {
  'local-service': 'local-service',
  local_service: 'local-service',
  realestate: 'real_estate',
  'real-estate': 'real_estate',
  store: 'ecommerce',
  content: 'nonprofit',
  landing: 'agency',
  saved: 'general',
  universal: 'general',
};

const INDUSTRY_OVERLAYS = new Set<IndustryOverlay>([
  'salon', 'barber', 'medspa', 'wellness', 'dental', 'fitness',
  'photographer', 'coaching', 'local-service', 'contractor', 'hvac', 'cleaning',
  'landscaping', 'auto_detailing', 'moving', 'legal', 'real_estate',
  'restaurant', 'cafe', 'bakery', 'ecommerce', 'creator', 'agency',
  'nonprofit', 'saas', 'portfolio', 'general',
]);

/**
 * Resolve the one industry value shared by WizardSelections and the immutable
 * merge context. A selected template is more specific than its broad system
 * category (for example a restaurant template inside the booking system).
 */
export function resolveWizardIndustryOverlay(input: {
  templateIndustry?: string | null;
  generationIndustry?: string | null;
  systemIndustry?: IndustryOverlay | null;
}): IndustryOverlay {
  for (const candidate of [input.templateIndustry, input.generationIndustry, input.systemIndustry]) {
    const normalized = candidate?.trim().toLowerCase();
    if (!normalized) continue;
    const aliased = INDUSTRY_OVERLAY_ALIASES[normalized];
    if (aliased) return aliased;
    if (INDUSTRY_OVERLAYS.has(normalized as IndustryOverlay)) {
      return normalized as IndustryOverlay;
    }
  }
  return 'general';
}

export interface WizardMergeContext {
  version: '1.0';
  /** Wizard-selected industry (overlay wins over base industry). */
  industry: string;
  /** Wizard-selected template composition id. */
  templateId: string | null;
  /** Wizard-selected style card id — the Stage 4b theme seed. */
  themePresetId: string;
  /** Resolved semantic HSL payload for the selected style card. */
  themeTokens?: ThemeTokens;
  /** Locked geometry/section contract for the selected template. */
  templateLayoutContract: TemplateLayoutContract | null;
  /** Optional experience contract id threaded from the wizard selections. */
  experienceContractId?: string | null;
  /** Stable seed id stamped into snapshot.meta.wizardSeedId. */
  wizardSeedId?: string | null;
}

export function createWizardMergeContext(input: {
  industry?: string | null;
  templateId?: string | null;
  themePresetId: string;
  themeTokens?: ThemeTokens;
  templateLayoutContract?: TemplateLayoutContract | null;
  experienceContractId?: string | null;
  wizardSeedId?: string | null;
}): WizardMergeContext {
  if (!input.themePresetId) {
    throw new Error('[wizardMergeContext] themePresetId is required — Stage 4b cannot run without the style seed.');
  }
  return {
    version: '1.0',
    industry: input.industry || 'general',
    templateId: input.templateId ?? null,
    themePresetId: input.themePresetId,
    themeTokens: input.themeTokens,
    templateLayoutContract: input.templateLayoutContract ?? null,
    experienceContractId: input.experienceContractId ?? null,
    wizardSeedId: input.wizardSeedId ?? null,
  };
}

export function assertWizardMergeContextMatchesSelections(
  context: WizardMergeContext,
  selections: {
    industryOverlay?: string | null;
    industry?: string | null;
    templateId?: string | null;
    themePresetId?: string | null;
    wizardSeedId?: string | null;
  },
): void {
  const selectedIndustry = selections.industryOverlay || selections.industry || 'general';
  const mismatches = [
    context.industry !== selectedIndustry ? `industry (${context.industry} !== ${selectedIndustry})` : '',
    context.templateId !== (selections.templateId ?? null) ? `templateId (${context.templateId} !== ${selections.templateId ?? null})` : '',
    context.themePresetId !== selections.themePresetId ? `themePresetId (${context.themePresetId} !== ${selections.themePresetId ?? null})` : '',
    context.wizardSeedId !== (selections.wizardSeedId ?? null) ? `wizardSeedId (${context.wizardSeedId ?? null} !== ${selections.wizardSeedId ?? null})` : '',
  ].filter(Boolean);
  if (mismatches.length > 0) {
    throw new Error(`[wizardMergeContext] Selection drift detected: ${mismatches.join(', ')}.`);
  }
}
