import { isCanonicalPack } from '@/sections/variants/packCompleteness';
import { familyOfPack, familyPackIds } from '@/sections/variants/artDirectionFamilies';
/**
 * Wizard design availability — a projection, never a registry.
 *
 * V5 §25/§35: the Wizard's Visual Direction cards and section pickers must be
 * derived from the canonical owners (Art Direction Packs + Variant Registry +
 * the 21st coverage gate + the selected topology + the experience preference).
 * A direction that cannot fully cover the selected site under the selected
 * experience is reported unavailable instead of silently degrading into the
 * global variant pool.
 */

import {
  ART_DIRECTION_PACKS,
  type ArtDirectionPackId,
} from '@/sections/variants/artDirectionPacks';
import { getGenerationVariantsForSection } from '@/sections/variants';
import {
  validateTwentyFirstGenerationCoverage,
  summarizeCoverageReport,
} from '@/services/launch/twentyFirstCoverageGate';
import { deriveImplementationVisualSignature } from '@/services/implementationVisualSignature';
import { isImplementationExperienceCompatible } from '@/services/designCompatibilityGraph';
import type { WizardExperiencePreference } from '@/services/wizardDesignSelection';
import type { SectionType } from '@/sections/types';
import type { VariantId } from '@/sections/variants/types';

/** Section types every launch compiles, regardless of the selected pages. */
export const WIZARD_CORE_SECTION_TYPES: SectionType[] = [
  'navbar', 'hero', 'services', 'features', 'gallery', 'testimonials', 'cta', 'contact', 'footer',
] as SectionType[];

/** Extra section types a selected page introduces. */
const PAGE_SECTION_TYPES: Record<string, SectionType[]> = {
  pricing: ['pricing'] as SectionType[],
  faq: ['faq'] as SectionType[],
  about: ['team'] as SectionType[],
  blog: ['blog-preview'] as SectionType[],
  gallery: ['before-after'] as SectionType[],
  services: ['logo-cloud'] as SectionType[],
};

/** Section types the Wizard lets a user pin directly (§11 / §24). */
export const WIZARD_PINNABLE_SECTION_TYPES: SectionType[] = [
  'hero', 'services', 'gallery', 'features', 'testimonials', 'pricing', 'cta',
] as SectionType[];

export function sectionTypesForSelectedPages(pages: readonly string[] = []): SectionType[] {
  const types = new Set<SectionType>(WIZARD_CORE_SECTION_TYPES);
  for (const page of pages) {
    for (const type of PAGE_SECTION_TYPES[page] ?? []) types.add(type);
  }
  return [...types];
}

export interface WizardSectionOption {
  variantId: VariantId;
  name: string;
  description?: string;
  thumbnail?: string;
  experienceLevel: WizardExperiencePreference;
}

export interface WizardVisualDirectionOption {
  id: ArtDirectionPackId;
  name: string;
  description: string;
  available: boolean;
  /** Present only when unavailable — plain reason for the launch UI. */
  unavailableReason?: string;
}

export interface WizardDesignAvailabilityInput {
  /** PageChoice ids selected in the Wizard; home is always implied. */
  selectedPages?: readonly string[];
  experience: WizardExperiencePreference;
  role?: string;
}

/**
 * Certified, pack-scoped, role-preferred and experience-compatible options for
 * a single section type. Empty means the pack cannot dress that section under
 * the current experience.
 */
export function getWizardSectionOptions(
  sectionType: SectionType,
  packId: ArtDirectionPackId | null | undefined,
  experience: WizardExperiencePreference,
  role = 'home',
): WizardSectionOption[] {
  const pack = packId ? ART_DIRECTION_PACKS[packId] : undefined;
  return getGenerationVariantsForSection(sectionType, pack, role)
    .filter(variant =>
      isImplementationExperienceCompatible(deriveImplementationVisualSignature(variant), experience))
    .map(variant => ({
      variantId: variant.id,
      name: variant.name,
      description: variant.description,
      thumbnail: variant.thumbnail,
      experienceLevel: deriveImplementationVisualSignature(variant).experienceLevel,
    }));
}

/** The Customize Sections picker model — pinnable types that have real choices. */
export function getWizardSectionPickers(
  packId: ArtDirectionPackId | null | undefined,
  experience: WizardExperiencePreference,
  role = 'home',
): Array<{ sectionType: SectionType; options: WizardSectionOption[] }> {
  return WIZARD_PINNABLE_SECTION_TYPES
    .map(sectionType => ({
      sectionType,
      options: getWizardSectionOptions(sectionType, packId, experience, role),
    }))
    .filter(picker => picker.options.length > 1);
}

/**
 * Visual Direction cards. A pack is selectable only when the coverage gate
 * passes for the selected topology AND every covered section still has at
 * least one implementation compatible with the selected experience.
 */
export function getWizardVisualDirections(
  input: WizardDesignAvailabilityInput,
): WizardVisualDirectionOption[] {
  const sectionTypes = sectionTypesForSelectedPages(input.selectedPages);
  const role = input.role ?? 'home';

  return (Object.values(ART_DIRECTION_PACKS) as Array<typeof ART_DIRECTION_PACKS[ArtDirectionPackId]>)
    .map(pack => {
      const report = validateTwentyFirstGenerationCoverage({
        pages: [{ role, sectionTypes }],
        artDirectionPack: pack,
      });
      if (!report.ok) {
        return {
          id: pack.id,
          name: pack.name,
          description: pack.description,
          available: false,
          unavailableReason: summarizeCoverageReport(report),
        };
      }
      const uncovered = sectionTypes.filter(sectionType =>
        getWizardSectionOptions(sectionType, pack.id, input.experience, role).length === 0);
      return {
        id: pack.id,
        name: pack.name,
        description: pack.description,
        available: uncovered.length === 0,
        unavailableReason: uncovered.length
          ? `Not available for the ${input.experience} experience: ${uncovered.join(', ')}`
          : undefined,
      };
    });
}

/**
 * Auto mode may deterministically pick another complete compatible pack, but it
 * may never degrade an explicitly selected direction.
 */
export function isWizardVisualDirectionAvailable(
  packId: ArtDirectionPackId,
  input: WizardDesignAvailabilityInput,
): boolean {
  return getWizardVisualDirections(input).some(option => option.id === packId && option.available);
}

/**
 * V5 §35 auto-mode resolution. When the deterministically preferred pack cannot
 * fully cover the selected topology under the selected experience, auto mode
 * moves to another complete compatible pack — chosen deterministically from the
 * same seed, never at random and never by degrading into the global pool. When
 * no pack is complete the preferred pack is returned unchanged so the launch
 * stays deterministic and the coverage gate reports the real gap.
 */
export function resolveAvailableAutoArtDirectionPackId(
  preferred: ArtDirectionPackId,
  input: WizardDesignAvailabilityInput & { seed?: string },
): ArtDirectionPackId {
  const options = getWizardVisualDirections(input);
  const eligible = (id: ArtDirectionPackId) => isCanonicalPack(id);
  if (eligible(preferred) && options.some(option => option.id === preferred && option.available)) return preferred;
  const allAvailable = options.filter(option => option.available && eligible(option.id)).map(option => option.id);
  // Stay inside the selected Art Direction Family whenever a sibling is complete.
  const familyId = familyOfPack(preferred);
  const siblings = familyId ? new Set(familyPackIds(familyId)) : null;
  const inFamily = siblings ? allAvailable.filter(id => siblings.has(id)) : [];
  const available = inFamily.length ? inFamily : allAvailable;
  if (!available.length) return preferred;
  const seed = `${input.seed ?? ''}:${preferred}`;
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  return available[hash % available.length];
}

