/**
 * resolvedImplementationContract — M6 artifact / slot / prop closure.
 *
 * ONE derived crosswalk between the four registries that already own the
 * truth:
 *
 *   - Variant Registry (`sections/variants/registry.ts`) → implementations
 *   - Artifact Registry (`artifactRegistry.ts`)            → slots, intents, data source, edit scope
 *   - Catalog Surface Registry                             → catalog surface identity
 *   - Design Vocabulary + Generated UI Foundation          → primitive/runtime dependencies
 *
 * Nothing here is hand-maintained: every field is derived. Launcher, Lane B,
 * Preview element selection, the Property Inspector and the AI Builder all
 * read the same `data-ut-slot` identity from this projection, so a slot id
 * means exactly one thing everywhere.
 *
 * Hard rules (mirrors artifactRegistry):
 *   1. Never restate a slot list — derive it from the artifact owner.
 *   2. Never restate an intent string — pass through the artifact's bindings,
 *      filtered to what the intent registry knows.
 *   3. Unknown implementations resolve to `null` for readers. Phase 8.2 adds
 *      `resolveLegalImplementation()`: fresh generation and AI edits may only
 *      use certified, non-legacy implementations; saved revisions stay
 *      readable; migration resolves through an explicit alias map.
 */

import type { SectionType } from '@/sections/types';
import type { SectionVariant, VariantId } from '@/sections/variants/types';
import { VARIANT_REGISTRY, getVariantById } from '@/sections/variants/registry';
import { resolveArtifact, type ResolvedArtifact } from './artifactRegistry';
import { getCatalogSurface } from './catalogSurfaceRegistry';
import { getIntentDef } from './intentSurfaceRegistry';
import { primitivesForVocabulary } from './designVocabulary';
import { EXPERIENCE_RUNTIME_PACKAGES } from './experiencePrimitives';
import {
  getDesignImplementation,
  getImplementationVocabularyRefs,
  listDesignImplementations,
} from '@/services/designImplementationRegistry';
import {
  ART_DIRECTION_PACKS,
  ART_DIRECTION_PACK_IDS,
  type ArtDirectionPackId,
} from '@/sections/variants/artDirectionPacks';
import {
  INDUSTRY_CREATIVE_PROFILES,
  industryCreativeProfile,
} from '@/sections/templates/industryCreativeVocabulary';
import {
  deriveImplementationVisualSignature,
  type ImplementationVisualSignature,
} from '@/services/implementationVisualSignature';


// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ImplementationSlotKind =
  | 'text'
  | 'rich-text'
  | 'asset'
  | 'list'
  | 'action'
  | 'catalog'
  | 'number'
  | 'boolean';

export interface ResolvedImplementationSlot {
  /** Canonical `data-ut-slot` value, e.g. `hero.headline`. */
  id: string;
  kind: ImplementationSlotKind;
  required: boolean;
  editable: boolean;
}

export interface ResolvedImplementationContract {
  implementationId: string;
  sectionType: SectionType;
  /** Null when the section type has no registered artifact owner. */
  artifactId: string | null;

  slots: readonly ResolvedImplementationSlot[];
  /** Canonical intent bindings, filtered to the intent registry's vocabulary. */
  intents: readonly string[];
  /** Present when the owning artifact hydrates from a catalog surface. */
  catalogSurfaceId?: string;

  /** Radix facades + vocabulary experience primitives the implementation needs. */
  primitiveDependencies: readonly string[];
  /** npm packages the generated runtime must install for this implementation. */
  runtimeDependencies: readonly string[];

  generationStatus: 'preferred' | 'supported' | 'legacy';
  source?: SectionVariant['source'];

  /** Phase 8.1 — derived creative affinity; never hand-maintained. */
  creativeAffinity: {
    /** Industries whose profile reaches for this family or trait. */
    industries: readonly string[];
    /** Industries whose negative vocabulary rejects this family or trait. */
    discouragedIndustries: readonly string[];
    /** Art direction packs that list this implementation for its family. */
    artDirections: readonly ArtDirectionPackId[];
    /** Page roles the implementation declares itself suited to. */
    pageIntents: readonly string[];
    /** Interaction / motion traits derived from the certified metadata. */
    interactionTags: readonly string[];
  };
  /** Derived visual signature — geometry, density, media, motion, experience. */
  visualSignature: ImplementationVisualSignature | null;
  /** Certified for fresh generation: portable recipe + approved certification. */
  certified: boolean;
}


// ─────────────────────────────────────────────────────────────────────────────
// Slot kind derivation — one deterministic convention, no restated lists
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Slot ids follow `<artifact>.<part>`; the part suffix decides the kind.
 * Collection parts (`list`/`grid`/`links`/`socials`) are `catalog` when the
 * owning artifact hydrates from a catalog surface, `list` otherwise.
 */
function deriveSlotKind(slotId: string, artifact: ResolvedArtifact): ImplementationSlotKind {
  const part = slotId.slice(slotId.indexOf('.') + 1);
  if (/^(?:primary-cta|secondary-cta|cta|newsletter|form|cart)$/.test(part)) return 'action';
  if (/^(?:image|media|photo|logo|avatar)$/.test(part)) return 'asset';
  if (/^(?:list|grid|links|socials)$/.test(part)) {
    return artifact.dataSource.kind === 'catalog' ? 'catalog' : 'list';
  }
  if (/^(?:body|legal|hours)$/.test(part)) return 'rich-text';
  return 'text';
}

/** The slots a generated site is broken without: identity, collections, primary action. */
const REQUIRED_SLOT_PARTS = /^(?:headline|heading|brand|list|grid|form|primary-cta)$/;

function deriveSlot(slotId: string, artifact: ResolvedArtifact): ResolvedImplementationSlot {
  const part = slotId.slice(slotId.indexOf('.') + 1);
  return {
    id: slotId,
    kind: deriveSlotKind(slotId, artifact),
    required: REQUIRED_SLOT_PARTS.test(part),
    editable: artifact.aiEditScope !== 'locked',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Resolution
// ─────────────────────────────────────────────────────────────────────────────

/** Dependency-bearing shape shared by SectionVariant and DesignImplementation. */
type DependencySource = Pick<
  SectionVariant,
  'radixPrimitives' | 'vocabulary' | 'vocabularyRefs' | 'experience'
>;

function deriveDependencies(variant: DependencySource): {
  primitiveDependencies: string[];
  runtimeDependencies: string[];
} {
  const vocabularyRefs = getImplementationVocabularyRefs(variant);
  const primitives = new Set<string>(variant.radixPrimitives ?? []);
  for (const primitive of primitivesForVocabulary(vocabularyRefs)) primitives.add(primitive);

  const runtime = new Set<string>(
    (variant.radixPrimitives ?? []).map((id) => `@radix-ui/react-${id}`),
  );
  if (variant.experience?.status === 'enabled') {
    for (const pkg of EXPERIENCE_RUNTIME_PACKAGES) runtime.add(pkg);
  }
  return { primitiveDependencies: [...primitives], runtimeDependencies: [...runtime] };
}

/**
 * Resolve the full contract for one registered implementation.
 * Returns `null` for unknown variant ids — never throws, never invents.
 */
export function resolveImplementationContract(
  variantId: VariantId | string,
): ResolvedImplementationContract | null {
  if (!variantId) return null;
  // The implementation registry indexes every registered variant (plus generic
  // family defaults) keyed by `implementationId`; the variant registry is the
  // fallback for ids spelled like a variant but never indexed.
  const indexed = getDesignImplementation(variantId);
  const fallback = !indexed && variantId.includes(':')
    ? getVariantById(variantId as VariantId)
    : undefined;
  if (!indexed && !fallback) return null;

  const implementationId = indexed?.implementationId ?? fallback!.id;
  const sectionType = indexed?.sectionType ?? fallback!.sectionType;
  const dependencySource: DependencySource = indexed ?? fallback!;
  const generationStatus = (indexed?.generationStatus ?? fallback?.generationStatus) ?? 'preferred';
  const source = indexed?.source ?? fallback?.source;

  const artifact = resolveArtifact(sectionType);
  const { primitiveDependencies, runtimeDependencies } = deriveDependencies(dependencySource);

  const slots = artifact ? artifact.supportedSlots.map((slot) => deriveSlot(slot, artifact)) : [];
  const intents = artifact
    ? artifact.intentBindings.filter((intent) => getIntentDef(intent) !== null)
    : [];
  const catalogSurfaceId =
    artifact?.dataSource.kind === 'catalog' &&
    artifact.dataSource.surfaceId &&
    getCatalogSurface(artifact.dataSource.surfaceId)
      ? artifact.dataSource.surfaceId
      : undefined;

  const signatureSource = (indexed ?? fallback) as SectionVariant | undefined;

  return {
    implementationId,
    sectionType,
    artifactId: artifact?.artifactId ?? null,
    slots,
    intents,
    catalogSurfaceId,
    primitiveDependencies,
    runtimeDependencies,
    generationStatus,
    source,
    creativeAffinity: deriveCreativeAffinity(implementationId, sectionType, signatureSource),
    visualSignature: signatureSource ? deriveImplementationVisualSignature(signatureSource) : null,
    certified: isCertifiedSource(signatureSource) && generationStatus !== 'legacy',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase 8.1 — derived creative affinity
// ─────────────────────────────────────────────────────────────────────────────

function isCertifiedSource(variant: SectionVariant | undefined): boolean {
  return variant?.vfs?.mode === 'portable-recipe' && variant.vfs?.certification === 'approved';
}

function deriveCreativeAffinity(
  implementationId: string,
  sectionType: SectionType,
  variant: SectionVariant | undefined,
): ResolvedImplementationContract['creativeAffinity'] {
  const tags = (variant?.tags ?? []).map((tag) => String(tag));

  const artDirections = ART_DIRECTION_PACK_IDS.filter((packId) =>
    (ART_DIRECTION_PACKS[packId].sectionFamilies?.[sectionType] ?? []).includes(implementationId as VariantId),
  );

  const industries: string[] = [];
  const discouragedIndustries: string[] = [];
  for (const key of Object.keys(INDUSTRY_CREATIVE_PROFILES)) {
    const profile = industryCreativeProfile(key);
    if (!profile) continue;
    const rejectsTrait = profile.discouragedTags.some((tag) => tags.includes(tag));
    if (rejectsTrait || profile.discouragedFamilies.includes(sectionType)) {
      discouragedIndustries.push(profile.industry);
      continue;
    }
    const pageWants = Object.values(profile.pageProfiles).some((page) =>
      (page.requiredFamilies ?? []).includes(sectionType) || (page.preferredFamilies ?? []).includes(sectionType));
    if (profile.preferredFamilies.includes(sectionType) || pageWants
      || profile.preferredArtDirections.some((packId) => artDirections.includes(packId))) {
      industries.push(profile.industry);
    }
  }

  const interactionTags = tags.filter((tag) =>
    /(marquee|parallax|reveal|kinetic|carousel|hover|scroll|drag|stream|lightbox|accordion|toggle|tabs|slider)/.test(tag));

  return {
    industries,
    discouragedIndustries,
    artDirections,
    pageIntents: (variant?.pageRoles ?? []).map((role) => String(role)),
    interactionTags,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase 8.2 — legal implementation resolution (end of legacy fallback authority)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * How an implementation is being asked for. Fresh generation and AI edits are
 * production surfaces: legacy and uncertified ids are rejected there. A saved
 * revision must stay readable, and migration resolves an explicit alias.
 */
export type ImplementationUsage = 'fresh-generation' | 'ai-edit' | 'saved-revision' | 'migration';

/**
 * Explicit canonical replacements for retired ids (plan §8.3 step 3). An entry
 * is only added once the replacement is proven equivalent or an intentional
 * supersession; migration reads this, fresh generation never does.
 */
export const LEGACY_IMPLEMENTATION_ALIASES: Readonly<Record<string, string>> = {};

export type LegalImplementationResult =
  | { legal: true; contract: ResolvedImplementationContract; migratedFrom?: string }
  | { legal: false; reason: string; canonicalReplacement?: string };

/** Resolve an implementation for a specific usage, with legacy authority removed. */
export function resolveLegalImplementation(
  variantId: VariantId | string,
  usage: ImplementationUsage,
): LegalImplementationResult {
  const aliased = LEGACY_IMPLEMENTATION_ALIASES[variantId];
  const targetId = usage === 'migration' && aliased ? aliased : variantId;
  const contract = resolveImplementationContract(targetId);

  if (!contract) {
    return {
      legal: false,
      reason: `"${variantId}" is not a registered design.`,
      canonicalReplacement: aliased,
    };
  }

  if (usage === 'saved-revision' || usage === 'migration') {
    return { legal: true, contract, migratedFrom: targetId === variantId ? undefined : variantId };
  }

  if (contract.generationStatus === 'legacy') {
    return {
      legal: false,
      reason: `"${contract.implementationId}" is a retired design and cannot be used for new work.`,
      canonicalReplacement: aliased,
    };
  }
  if (!contract.certified) {
    return {
      legal: false,
      reason: `"${contract.implementationId}" is not a certified design.`,
      canonicalReplacement: aliased,
    };
  }
  return { legal: true, contract };
}

/**
 * Every implementation a production surface may legally choose from for a
 * family, optionally narrowed by art direction and industry affinity.
 */
export function listLegalImplementations(
  sectionType: SectionType,
  options?: { usage?: ImplementationUsage; packId?: ArtDirectionPackId; industry?: string },
): ResolvedImplementationContract[] {
  const usage = options?.usage ?? 'fresh-generation';
  return (VARIANT_REGISTRY[sectionType] ?? [])
    .map((variant) => resolveLegalImplementation(variant.id, usage))
    .filter((result): result is Extract<LegalImplementationResult, { legal: true }> => result.legal)
    .map((result) => result.contract)
    .filter((contract) => !options?.packId || contract.creativeAffinity.artDirections.includes(options.packId))
    .filter((contract) => {
      if (!options?.industry) return true;
      const profile = industryCreativeProfile(options.industry);
      return !profile || !contract.creativeAffinity.discouragedIndustries.includes(profile.industry);
    });
}


/** Contracts for every registered implementation, optionally generation-eligible only. */
export function listImplementationContracts(options?: {
  preferredOnly?: boolean;
}): ResolvedImplementationContract[] {
  const variants = listDesignImplementations();
  const contracts: ResolvedImplementationContract[] = [];
  for (const variant of variants) {
    if (options?.preferredOnly && (variant.generationStatus ?? 'preferred') !== 'preferred') {
      continue;
    }
    const contract = resolveImplementationContract(variant.implementationId);
    if (contract) contracts.push(contract);
  }
  return contracts;
}

/** Contracts for every implementation of one section type. */
export function implementationContractsForSection(
  sectionType: SectionType,
): ResolvedImplementationContract[] {
  return (VARIANT_REGISTRY[sectionType] ?? [])
    .map((variant) => resolveImplementationContract(variant.id))
    .filter((contract): contract is ResolvedImplementationContract => contract !== null);
}
