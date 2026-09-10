/**
 * Industry parity assertion.
 *
 * Every industry the product ships must be fully described across all four
 * canonical registries — matrix, intent profiles, page recipes, and art
 * direction. Without this, an industry silently degrades into a generic
 * (usually booking-shaped) site. Parity failures are build failures.
 *
 * This adds no new registry: it only cross-checks the existing ones.
 */

import { INDUSTRY_MATRIX, normalizeIndustryKey, type IndustryProfile } from './industryMatrix';
import { INDUSTRY_INTENT_PROFILES } from './industryIntentProfiles';
import { industryRecipes } from '@/data/pageRecipes';
import { ART_DIRECTION_PACKS } from '@/sections/variants/artDirectionPacks';
import type { Industry } from '@/schemas/BusinessBlueprint';

/** Industries the product ships as first-class verticals. */
export const SHIPPED_INDUSTRIES = [
  'saas',
  'salon',
  'contractor',
  'restaurant',
  'coaching',
  'ecommerce',
  'portfolio',
  'nonprofit',
  'agency',
] as const;

export type ShippedIndustry = (typeof SHIPPED_INDUSTRIES)[number];

/** Matrix key -> blueprint recipe vocabulary (`pageRecipes`). */
export const INDUSTRY_RECIPE_KEY: Record<ShippedIndustry, Industry> = {
  saas: 'other',
  salon: 'salon_spa',
  contractor: 'local_service',
  restaurant: 'restaurant',
  coaching: 'coaching_consulting',
  ecommerce: 'ecommerce',
  portfolio: 'creator_portfolio',
  nonprofit: 'nonprofit',
  agency: 'coaching_consulting',
};

export interface IndustryParityIssue {
  industry: string;
  registry: 'matrix' | 'intents' | 'recipes' | 'artDirection';
  message: string;
}

export function getShippedIndustryProfile(industry: ShippedIndustry): IndustryProfile | undefined {
  return INDUSTRY_MATRIX[normalizeIndustryKey(industry)];
}

export function checkIndustryParity(): IndustryParityIssue[] {
  const issues: IndustryParityIssue[] = [];

  for (const industry of SHIPPED_INDUSTRIES) {
    const profile = getShippedIndustryProfile(industry);

    if (!profile) {
      issues.push({ industry, registry: 'matrix', message: 'missing from INDUSTRY_MATRIX' });
      continue;
    }

    if (!profile.anchorCapability) {
      issues.push({ industry, registry: 'matrix', message: 'no anchorCapability declared' });
    }
    if (!profile.conversionJourney?.length) {
      issues.push({ industry, registry: 'matrix', message: 'no conversionJourney declared' });
    }
    if (!profile.profileFields?.length) {
      issues.push({ industry, registry: 'matrix', message: 'no profileFields declared' });
    }
    if (!profile.defaultCapabilities.includes(profile.anchorCapability as never)) {
      issues.push({
        industry,
        registry: 'matrix',
        message: `anchorCapability "${profile.anchorCapability}" is not in defaultCapabilities`,
      });
    }

    const intents = INDUSTRY_INTENT_PROFILES[industry];
    if (!intents) {
      issues.push({ industry, registry: 'intents', message: 'missing from INDUSTRY_INTENT_PROFILES' });
    } else {
      const declared = new Set([...intents.required, ...intents.primary, ...intents.secondary, ...intents.optional]);
      for (const step of profile.conversionJourney ?? []) {
        if (step.startsWith('nav.')) continue;
        if (!declared.has(step)) {
          issues.push({
            industry,
            registry: 'intents',
            message: `conversion step "${step}" is not declared in the intent profile`,
          });
        }
        if (intents.forbidden.includes(step)) {
          issues.push({
            industry,
            registry: 'intents',
            message: `conversion step "${step}" is forbidden by the intent profile`,
          });
        }
      }
    }

    const recipeKey = INDUSTRY_RECIPE_KEY[industry];
    if (!recipeKey || !industryRecipes[recipeKey]) {
      issues.push({ industry, registry: 'recipes', message: 'no page recipe set mapped' });
    }

    const packs = profile.allowedArtDirectionPacks ?? [];
    if (packs.length < 3) {
      issues.push({
        industry,
        registry: 'artDirection',
        message: 'fewer than three allowed art direction packs',
      });
    }
    for (const packId of packs) {
      if (!ART_DIRECTION_PACKS[packId]) {
        issues.push({ industry, registry: 'artDirection', message: `unknown art direction pack "${packId}"` });
      }
    }
  }

  return issues;
}

/** Throws when any shipped industry is incompletely described. */
export function assertIndustryParity(): void {
  const issues = checkIndustryParity();
  if (issues.length > 0) {
    throw new Error(
      `Industry parity failed:\n${issues.map(i => `  - [${i.industry}/${i.registry}] ${i.message}`).join('\n')}`,
    );
  }
}

/**
 * Two industries must never resolve to the same experience. Compares the
 * anchor capability + conversion journey + default page purposes.
 */
export function industryDistinctnessSignature(industry: ShippedIndustry): string {
  const profile = getShippedIndustryProfile(industry);
  if (!profile) return `${industry}:missing`;
  return [
    profile.anchorCapability ?? 'none',
    (profile.conversionJourney ?? []).join('>'),
    profile.defaultPages.map(p => `${p.purpose}:${p.expectedSections.join('+')}`).join('|'),
  ].join('::');
}
