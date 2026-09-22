/**
 * Compiled site design contract (governing plan, Phase 7 / P1 item 8).
 *
 * The Wizard selection, the industry creative profile, the page archetype, the
 * art direction pack and the experience preference are AUTHORING INPUTS. They
 * are compiled here, once, into a single `SiteDesignContract` — the authority
 * every downstream surface reads after the boundary.
 *
 * Invariant K: this module introduces no registry, no VFS writer, no theme
 * engine, no runtime and no second authority. It is a pure projection of
 * values that already exist in the sealed pack, the page archetype table and
 * the industry dialect, arranged so a consumer never has to ask three tables
 * the same question and get three answers.
 */

import type { SectionType } from '@/sections/types';
import type { VariantId } from '@/sections/variants/types';
import {
  ART_DIRECTION_PACKS,
  DEFAULT_ART_DIRECTION_PACK_ID,
  shiftDensity,
  shiftRhythm,
  type ArtDirectionPackId,
  type DensityId,
  type RhythmId,
} from '@/sections/variants/artDirectionPacks';
import { getGenerationVariantsForSection } from '@/sections/variants/registry';
import {
  COMPILER_OWNED_FAMILIES,
  resolvePageArchetype,
} from '@/sections/pageArchetypeContract';
import { industryCreativeProfile } from '@/sections/templates/industryCreativeVocabulary';
import { normalizeIndustryKey } from '@/platform/core/industryMatrix';
import type {
  WizardDesignSelectionMode,
  WizardExperiencePreference,
} from '@/services/wizardDesignSelection';

export const SITE_DESIGN_CONTRACT_VERSION = '1.0' as const;

/** Whether a family is native, tolerated or off-language for this site. */
export type CreativeFamilyAffinity = 'preferred' | 'neutral' | 'discouraged';

/** Per-page compiled creative profile: rhythm, density budget and required roles. */
export interface PageCreativeProfile {
  role: string;
  purpose: string;
  /** Resolved spacing cadence for this page (pack rhythm + page shift). */
  rhythm: RhythmId;
  /** Resolved spacing density for this page (pack density + page shift). */
  density: DensityId;
  /** Families the page must carry to do its job (archetype ∪ industry dialect). */
  requiredFamilies: readonly SectionType[];
  recommendedFamilies: readonly SectionType[];
  /** Advisory in Guided/Custom, enforced in Auto (see `negativeVocabularyEnforced`). */
  discouragedFamilies: readonly SectionType[];
  discouragedTags: readonly string[];
  /** Body-section budget: never fewer than the required roles, never over the ceiling. */
  densityBudget: { min: number; target: number; max: number };
}

export interface SiteDesignContract {
  version: typeof SITE_DESIGN_CONTRACT_VERSION;
  industry: string;
  mode: WizardDesignSelectionMode;
  experience: WizardExperiencePreference;
  artDirectionPackId: ArtDirectionPackId;
  /** Families the compiler owns on every page — identical site-wide. */
  chromeFamilies: readonly SectionType[];
  typography: {
    displayStack: string;
    bodyStack: string;
    displayWeight: number;
    bodyWeight: number;
    scaleRatio: number;
    headingTracking: string;
    headingTransform: 'none' | 'uppercase';
    measure: string;
  };
  geometry: { radius: string; borderWeight: string; surface: string; pill: string };
  spacing: { rhythm: RhythmId; density: DensityId };
  media: { treatment: string; gradient: string; accentPolicy: string };
  motion: {
    profile: string;
    interaction: string;
    entrance: string;
    duration: string;
    ease: string;
    distance: string;
    /** Compiled performance budget for immersive/motion features. */
    budget: 'static' | 'motion' | 'immersive';
  };
  /** Site-wide family affinity — the industry dialect, compiled. */
  familyAffinity: Readonly<Partial<Record<SectionType, CreativeFamilyAffinity>>>;
  /** Certified implementations this contract permits, per family. */
  allowedImplementations: Readonly<Partial<Record<SectionType, readonly VariantId[]>>>;
  /** Chrome identities, which every page inherits unchanged. */
  chromeImplementations: { navbar: readonly VariantId[]; footer: readonly VariantId[] };
  /** Per-page creative profile keyed by composition role. */
  pages: Readonly<Record<string, PageCreativeProfile>>;
  /**
   * Negative vocabulary is advisory by default so Guided/Custom can take a
   * deliberate exception; Auto mode has no author to take one, so it is
   * enforced there.
   */
  negativeVocabularyEnforced: boolean;
  inheritance: {
    /** Properties a site-wide edit mutates once, for every page. */
    siteWide: readonly string[];
    /** Properties a single page may legitimately override. */
    pageLocal: readonly string[];
  };
}

export interface CompileSiteDesignContractInput {
  industry?: string | null;
  roles: readonly string[];
  artDirectionPackId?: ArtDirectionPackId | null;
  experience?: WizardExperiencePreference;
  mode?: WizardDesignSelectionMode;
}

const DENSITY_TARGET_FLOOR = 3;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

function motionBudget(experience: WizardExperiencePreference): SiteDesignContract['motion']['budget'] {
  if (experience === 'immersive') return 'immersive';
  if (experience === 'motion-rich') return 'motion';
  return 'static';
}

/**
 * Compile every creative input into the one contract downstream reads.
 * Pure and deterministic: identical inputs always yield an identical contract.
 */
export function compileSiteDesignContract(
  input: CompileSiteDesignContractInput,
): SiteDesignContract {
  const industry = normalizeIndustryKey(input.industry ?? '');
  const profile = industryCreativeProfile(industry);
  const packId = input.artDirectionPackId
    && ART_DIRECTION_PACKS[input.artDirectionPackId]
    ? input.artDirectionPackId
    : profile?.preferredArtDirections[0] ?? DEFAULT_ART_DIRECTION_PACK_ID;
  const pack = ART_DIRECTION_PACKS[packId];
  const experience = input.experience ?? 'standard';
  const mode = input.mode ?? 'auto';

  const roles = Array.from(new Set(input.roles.length ? input.roles : ['home']));

  const pages: Record<string, PageCreativeProfile> = {};
  const families = new Set<SectionType>();

  for (const role of roles) {
    const archetype = resolvePageArchetype(role, industry);
    const required = archetype.requiredFamilies;
    const min = Math.max(1, required.length);
    const max = Math.max(min, archetype.maxBodySections);
    pages[role] = {
      role,
      purpose: archetype.purpose,
      rhythm: shiftRhythm(pack.design.rhythm, archetype.rhythmShift),
      density: shiftDensity(pack.signature.density, archetype.densityShift),
      requiredFamilies: required,
      recommendedFamilies: archetype.recommendedFamilies,
      discouragedFamilies: archetype.forbiddenFamilies,
      discouragedTags: archetype.forbiddenTags,
      densityBudget: { min, target: clamp(DENSITY_TARGET_FLOOR, min, max), max },
    };
    for (const family of [...required, ...archetype.recommendedFamilies]) families.add(family);
  }
  for (const family of COMPILER_OWNED_FAMILIES) families.add(family);

  const familyAffinity: Partial<Record<SectionType, CreativeFamilyAffinity>> = {};
  for (const family of families) {
    familyAffinity[family] = profile?.preferredFamilies.includes(family)
      ? 'preferred'
      : profile?.discouragedFamilies.includes(family)
        ? 'discouraged'
        : 'neutral';
  }

  const allowedImplementations: Partial<Record<SectionType, readonly VariantId[]>> = {};
  for (const family of families) {
    const ids = getGenerationVariantsForSection(family, pack).map(variant => variant.id);
    if (ids.length) allowedImplementations[family] = ids;
  }

  return {
    version: SITE_DESIGN_CONTRACT_VERSION,
    industry,
    mode,
    experience,
    artDirectionPackId: packId,
    chromeFamilies: COMPILER_OWNED_FAMILIES,
    typography: {
      displayStack: pack.signature.typography.displayStack,
      bodyStack: pack.signature.typography.bodyStack,
      displayWeight: pack.signature.typography.displayWeight,
      bodyWeight: pack.signature.typography.bodyWeight,
      scaleRatio: pack.design.typeScaleRatio,
      headingTracking: pack.design.headingTracking,
      headingTransform: pack.design.headingTransform,
      measure: pack.design.measure,
    },
    geometry: {
      radius: pack.design.radius,
      borderWeight: pack.design.borderWeight,
      surface: pack.design.surface,
      pill: pack.signature.pill,
    },
    spacing: { rhythm: pack.design.rhythm, density: pack.signature.density },
    media: {
      treatment: pack.design.mediaTreatment,
      gradient: pack.signature.gradient,
      accentPolicy: pack.design.accentPolicy,
    },
    motion: {
      profile: pack.motionProfile,
      interaction: pack.interactionProfile,
      entrance: pack.signature.entrance,
      duration: pack.design.motionDuration,
      ease: pack.design.motionEase,
      distance: pack.design.motionDistance,
      budget: motionBudget(experience),
    },
    familyAffinity,
    allowedImplementations,
    chromeImplementations: { navbar: pack.navbarFamily, footer: pack.footerFamily },
    pages,
    negativeVocabularyEnforced: mode === 'auto',
    inheritance: {
      siteWide: [
        'artDirectionPackId', 'typography', 'geometry', 'spacing.rhythm', 'spacing.density',
        'media', 'motion', 'chromeImplementations',
      ],
      pageLocal: ['pages.*.rhythm', 'pages.*.density', 'pages.*.sectionOrder', 'pages.*.copy'],
    },
  };
}

/** The page profile for a role, falling back to the compiled custom/home profile. */
export function pageProfileFor(
  contract: SiteDesignContract | undefined,
  role: string,
): PageCreativeProfile | undefined {
  if (!contract) return undefined;
  return contract.pages[role] ?? contract.pages.custom ?? undefined;
}

/**
 * Whether a family may be ADDED to a page under this contract. A required or
 * recommended family is additive; a discouraged one is additive only when the
 * contract treats negative vocabulary as advisory (Guided/Custom).
 */
export function isAdditiveUnderContract(
  contract: SiteDesignContract | undefined,
  role: string,
  type: SectionType,
): boolean | undefined {
  const page = pageProfileFor(contract, role);
  if (!page) return undefined;
  if (contract!.chromeFamilies.includes(type) || type === 'hero') return false;
  if (page.requiredFamilies.includes(type) || page.recommendedFamilies.includes(type)) return true;
  if (page.discouragedFamilies.includes(type)) return false;
  return contract!.familyAffinity[type] === 'preferred' && !contract!.negativeVocabularyEnforced;
}

/** Density/required-role validation for one page against the compiled contract. */
export function pageDensityIssues(
  contract: SiteDesignContract | undefined,
  role: string,
  sectionOrder: readonly string[],
): string[] {
  const page = pageProfileFor(contract, role);
  if (!page) return [];
  const body = sectionOrder.filter(family => !contract!.chromeFamilies.includes(family as SectionType));
  const issues: string[] = [];
  for (const required of page.requiredFamilies) {
    if (!sectionOrder.includes(required)) {
      issues.push(`pages.${role}: a ${role} page must prove its ${required} role`);
    }
  }
  if (body.length < page.densityBudget.min) {
    issues.push(`pages.${role}: at least ${page.densityBudget.min} body sections`);
  }
  if (body.length > page.densityBudget.max) {
    issues.push(`pages.${role}: at most ${page.densityBudget.max} body sections`);
  }
  return issues;
}

/* ---------------------------------------------------------------------------
 * Wire projection
 *
 * The contract is compiled ONCE, on the client, at the canonical acceptance
 * point. Everything downstream — including the composition edge lane — reads a
 * serialisable projection of that single compilation instead of recompiling
 * against its own copy of the packs. Projection-only downstream: there is no
 * second authority to drift from.
 * ------------------------------------------------------------------------- */

export interface SiteDesignContractProjection {
  version: typeof SITE_DESIGN_CONTRACT_VERSION;
  industry: string;
  artDirectionPackId: string;
  negativeVocabularyEnforced: boolean;
  chromeFamilies: string[];
  /** The prompt block, rendered from the compiled contract. */
  summary: string;
  pages: Record<string, { required: string[]; min: number; max: number }>;
}

/** Serialise the compiled contract for transport to a generation lane. */
export function projectSiteDesignContract(contract: SiteDesignContract): SiteDesignContractProjection {
  return {
    version: contract.version,
    industry: contract.industry,
    artDirectionPackId: contract.artDirectionPackId,
    negativeVocabularyEnforced: contract.negativeVocabularyEnforced,
    chromeFamilies: [...contract.chromeFamilies],
    summary: describeSiteDesignContract(contract),
    pages: Object.fromEntries(Object.entries(contract.pages).map(([role, page]) => [role, {
      required: [...page.requiredFamilies],
      min: page.densityBudget.min,
      max: page.densityBudget.max,
    }])),
  };
}

/**
 * Density and required-role validation against the transported projection.
 * Mirrored byte-for-byte at supabase/functions/_shared/siteDesignContractProjection.ts
 * and drift-tested; keep the two bodies identical.
 */
export function projectionDensityIssues(
  projection: SiteDesignContractProjection | undefined,
  role: string,
  sectionOrder: readonly string[],
): { hard: string[]; advisory: string[] } {
  const page = projection?.pages[role];
  if (!page) return { hard: [], advisory: [] };
  const chrome = new Set(projection!.chromeFamilies);
  const body = sectionOrder.filter(family => !chrome.has(family));
  const hard: string[] = [];
  const advisory: string[] = [];
  // The ceiling is hard (a padded page ships badly); the floor and the required
  // creative roles are advisory, because the compiler resolves certified
  // defaults for them and they must never cost a launch.
  if (body.length > page.max) hard.push(`pages.${role}: at most ${page.max} body sections`);
  if (body.length < page.min) advisory.push(`pages.${role}: at least ${page.min} body sections`);
  for (const required of page.required) {
    if (!sectionOrder.includes(required)) {
      advisory.push(`pages.${role}: a ${role} page must prove its ${required} role`);
    }
  }
  return { hard, advisory };
}

/** The contract block handed verbatim to a generation lane. */
export function describeSiteDesignContract(contract: SiteDesignContract): string {
  const list = (values: readonly string[]) => (values.length ? values.join(', ') : 'none');
  const preferred = Object.entries(contract.familyAffinity)
    .filter(([, affinity]) => affinity === 'preferred').map(([family]) => family);
  const discouraged = Object.entries(contract.familyAffinity)
    .filter(([, affinity]) => affinity === 'discouraged').map(([family]) => family);

  return [
    `SITE DESIGN CONTRACT (compiled, v${contract.version}) — one authority for the whole site:`,
    `  industry: ${contract.industry || 'unspecified'}; art direction: ${contract.artDirectionPackId}; experience: ${contract.experience} (motion budget: ${contract.motion.budget}).`,
    `  typography: display ${contract.typography.displayStack} / body ${contract.typography.bodyStack}, scale ${contract.typography.scaleRatio}, tracking ${contract.typography.headingTracking}, transform ${contract.typography.headingTransform}.`,
    `  geometry: radius ${contract.geometry.radius}, border ${contract.geometry.borderWeight}, surface ${contract.geometry.surface}, pill ${contract.geometry.pill}.`,
    `  spacing: site rhythm ${contract.spacing.rhythm}, density ${contract.spacing.density}. Pages modulate spacing only.`,
    `  media: ${contract.media.treatment}, gradient ${contract.media.gradient}, accent ${contract.media.accentPolicy}.`,
    `  motion: ${contract.motion.profile} / ${contract.motion.interaction}, entrance ${contract.motion.entrance}.`,
    `  site chrome is compiler-owned and identical on every page: ${list(contract.chromeFamilies)}.`,
    `  reach for: ${list(preferred)}; avoid: ${list(discouraged)} (${contract.negativeVocabularyEnforced ? 'enforced' : 'advisory — exceptions must be deliberate'}).`,
    ...Object.values(contract.pages).map(page => [
      `  page "${page.role}" — ${page.purpose}`,
      `    must prove: ${list(page.requiredFamilies)}`,
      `    fits well: ${list(page.recommendedFamilies)}`,
      `    never: ${list(page.discouragedFamilies)} | traits: ${list(page.discouragedTags)}`,
      `    body sections ${page.densityBudget.min}-${page.densityBudget.max}; rhythm ${page.rhythm}, density ${page.density}.`,
    ].join('\n')),
  ].join('\n');
}
