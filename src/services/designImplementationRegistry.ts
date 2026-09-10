/**
 * Canonical Design Implementation Registry (Phase 3 — registry consolidation)
 *
 * One index over every renderable design implementation in the platform.
 * Section families come from the Section Registry, visual variants come from
 * the Variant Registry, . Nothing here declares its own list — this module is a derived
 * view, so it can never drift from the registries the compiler renders with.
 *
 * Every downstream authority (design contract, Lane B prompt vocabulary,
 * drift detection, swap UI) must resolve implementation identity through
 * `resolveImplementationId` instead of assembling id strings by hand.
 */

import { getAllSections } from '@/sections/registry';
import { VARIANT_REGISTRY } from '@/sections/variants';
import type { VariantId } from '@/sections/variants';
import type { SectionVariant, VocabularyRef } from '@/sections/variants/types';
import type { SectionType, SectionRegistryEntry } from '@/sections/types';
import { DESIGN_VOCABULARY } from '@/platform/core/designVocabulary';
import { hashSeed } from '@/platform/core/generationSeed';
import { getIndustryProfile } from '@/platform/core/industryMatrix';
import {
  ART_DIRECTION_PACKS,
  ART_DIRECTION_PACK_IDS,
  resolveArtDirectionPackId,
  type ArtDirectionPackId,
} from '@/sections/variants/artDirectionPacks';

/** Identity used everywhere a design implementation is referenced. */
export type ImplementationId = `${string}:${string}`;

/** The generic implementation slug used when a family has no variants. */
export const GENERIC_IMPLEMENTATION_SLUG = 'generic';

export interface DesignImplementation {
  /** Stable identity: `${sectionType}:${variantSlug}` (or `:generic`). */
  implementationId: ImplementationId;
  sectionType: SectionType;
  /** Registered variant id, when this implementation is a real variant. */
  variantId?: VariantId;
  /** Variant slug, or `generic` for the family default renderer. */
  slug: string;
  name: string;
  description: string;
  category: SectionRegistryEntry['category'];
  tags: string[];
  isDefault: boolean;
  thumbnail?: string;
  /** True when the family exposes variant-level implementations. */
  hasVariants: boolean;
  vfs?: SectionVariant['vfs'];
  radixPrimitives?: SectionVariant['radixPrimitives'];
  vocabulary?: SectionVariant['vocabulary'];
  experience?: SectionVariant['experience'];
}

let cachedIndex: Map<string, DesignImplementation> | null = null;
let cachedVocabularyIndex: Map<string, DesignImplementation[]> | null = null;

/** Vocabulary ids are unique per category only, so both parts are the key. */
export function vocabularyKey(ref: VocabularyRef): string {
  return `${ref.category}:${ref.id}`;
}

function buildIndex(): Map<string, DesignImplementation> {
  const index = new Map<string, DesignImplementation>();
  const sections = getAllSections();

  for (const [type, entry] of Object.entries(sections) as Array<[SectionType, SectionRegistryEntry]>) {
    const variants = VARIANT_REGISTRY[type] ?? [];

    if (variants.length === 0) {
      const implementationId = `${type}:${GENERIC_IMPLEMENTATION_SLUG}` as ImplementationId;
      index.set(implementationId, {
        implementationId,
        sectionType: type,
        slug: GENERIC_IMPLEMENTATION_SLUG,
        name: entry.label,
        description: entry.description ?? '',
        category: entry.category,
        tags: [],
        isDefault: true,
        hasVariants: false,
      });
      continue;
    }

    for (const variant of variants) {
      const implementationId = variant.id as ImplementationId;
      index.set(implementationId, {
        implementationId,
        sectionType: type,
        variantId: variant.id,
        slug: variant.slug,
        name: variant.name,
        description: variant.description,
        category: entry.category,
        tags: variant.tags ?? [],
        isDefault: Boolean(variant.isDefault),
        thumbnail: variant.thumbnail,
        hasVariants: true,
        vfs: variant.vfs ? { ...variant.vfs } : undefined,
        radixPrimitives: variant.radixPrimitives ? [...variant.radixPrimitives] : undefined,
        vocabulary: variant.vocabulary ? { ...variant.vocabulary } : undefined,
        experience: variant.experience
          ? { ...variant.experience, vocabulary: { ...variant.experience.vocabulary } }
          : undefined,
      });
    }
  }

  return index;
}

function index(): Map<string, DesignImplementation> {
  if (!cachedIndex) cachedIndex = buildIndex();
  return cachedIndex;
}

/** Test-only: drop the memoized view (registries are static at runtime). */
export function resetDesignImplementationIndex(): void {
  cachedIndex = null;
  cachedVocabularyIndex = null;
}

export function listDesignImplementations(): DesignImplementation[] {
  return [...index().values()].sort((a, b) =>
    a.implementationId.localeCompare(b.implementationId));
}

export function getDesignImplementation(id: string): DesignImplementation | undefined {
  return index().get(id);
}

export function isRegisteredImplementation(id: string): boolean {
  return index().has(id);
}

export function listImplementationsForSection(type: SectionType): DesignImplementation[] {
  return listDesignImplementations().filter((impl) => impl.sectionType === type);
}

function vocabularyIndex(): Map<string, DesignImplementation[]> {
  if (cachedVocabularyIndex) return cachedVocabularyIndex;
  const built = new Map<string, DesignImplementation[]>();
  for (const implementation of listDesignImplementations()) {
    if (!implementation.vocabulary) continue;
    const key = vocabularyKey(implementation.vocabulary);
    const bucket = built.get(key);
    if (bucket) bucket.push(implementation);
    else built.set(key, [implementation]);
  }
  cachedVocabularyIndex = built;
  return built;
}

/** Registered implementations that already execute a vocabulary entry. */
export function listImplementationsForVocabulary(ref: VocabularyRef): DesignImplementation[] {
  return vocabularyIndex().get(vocabularyKey(ref)) ?? [];
}

/** True when the compiler can actually build this vocabulary entry today. */
export function isExecutableVocabulary(ref: VocabularyRef): boolean {
  return vocabularyIndex().has(vocabularyKey(ref));
}

export interface VocabularyExecutability {
  /** Entries backed by at least one registered implementation. */
  executable: string[];
  /** Entries the vocabulary offers that nothing can render yet. */
  unimplemented: string[];
}

/**
 * The measured version of "design vocabulary is richer than the set of
 * compiler-executable recipes". Phase 5 closes this gap by moving entries from
 * `unimplemented` to `executable`, never by widening the vocabulary.
 */
export function vocabularyExecutabilityReport(): VocabularyExecutability {
  const executable: string[] = [];
  const unimplemented: string[] = [];
  for (const entry of DESIGN_VOCABULARY) {
    const key = vocabularyKey({ category: entry.category, id: entry.id });
    (vocabularyIndex().has(key) ? executable : unimplemented).push(key);
  }
  return { executable, unimplemented };
}

/**
 * The single sanctioned way to derive an implementation identity.
 * Falls back to the family's generic identity so unregistered variants stay
 * addressable (and visible to drift detection) rather than silently dropped.
 */
export function resolveImplementationId(
  sectionType: string,
  variantId?: string | null,
): ImplementationId {
  if (variantId && index().has(variantId)) return variantId as ImplementationId;
  const generic = `${sectionType}:${GENERIC_IMPLEMENTATION_SLUG}` as ImplementationId;
  if (index().has(generic)) return generic;
  const family = listImplementationsForSection(sectionType as SectionType);
  const fallback = family.find((impl) => impl.isDefault) ?? family[0];
  return fallback?.implementationId ?? generic;
}

/**
 * Deterministic fingerprint of the whole design inventory. Snapshot metadata
 * stamps this so a rebuild can prove it rendered the same implementation set.
 */
export function designRegistrySignature(): string {
  const payload = listDesignImplementations()
    .map((impl) => `${impl.implementationId}|${impl.category}|${impl.isDefault ? 'default' : '-'}`)
    .join('\n');
  return `dr_${hashSeed(payload)}`;
}

// ============================================================================
// Industry + art-direction lookups (derived, never a second catalogue)
// ============================================================================

/**
 * The art direction packs an industry is allowed to render with, read from the
 * industry matrix. Returns every registered pack when the industry declares no
 * allow-list, so this can never narrow behaviour by accident.
 */
export function listAllowedArtDirectionPacks(industry: string | null | undefined): ArtDirectionPackId[] {
  const profile = industry ? getIndustryProfile(industry) : undefined;
  const allowed = profile?.allowedArtDirectionPacks;
  return allowed && allowed.length > 0 ? [...allowed] : [...ART_DIRECTION_PACK_IDS];
}

/**
 * Single resolution point for art direction. Callers must not call
 * `resolveArtDirectionPackId` with an ad-hoc allow-list — this facade derives
 * the industry constraint from the matrix so the registry stays authoritative.
 */
export function resolveIndustryArtDirectionPackId(input: {
  industry?: string | null;
  themePresetId?: string | null;
  seed?: string | number | null;
  templateId?: string | null;
  sealedPackId?: string | null;
}): ArtDirectionPackId {
  return resolveArtDirectionPackId({
    ...input,
    industry: input.industry ?? undefined,
    allowedPackIds: listAllowedArtDirectionPacks(input.industry),
  } as Parameters<typeof resolveArtDirectionPackId>[0]);
}

export function resolveIndustryArtDirectionPack(input: Parameters<typeof resolveIndustryArtDirectionPackId>[0]) {
  return ART_DIRECTION_PACKS[resolveIndustryArtDirectionPackId(input)];
}

/**
 * Every design implementation an industry's default page map can render,
 * derived from the industry matrix `expectedSections` contract. Used by the
 * launcher and Lane B vocabulary so page recipes and the registry cannot drift.
 */
export function listImplementationsForIndustry(industry: string | null | undefined): DesignImplementation[] {
  const profile = industry ? getIndustryProfile(industry) : undefined;
  if (!profile) return listDesignImplementations();
  const sectionTypes = new Set<string>();
  for (const page of profile.defaultPages) {
    for (const section of page.expectedSections) sectionTypes.add(section);
  }
  return listDesignImplementations().filter((impl) => sectionTypes.has(impl.sectionType));
}

/**
 * Semantic sections an industry expects that have no renderable implementation.
 * A non-empty result is a wiring gap between the industry matrix and the
 * section/variant registries, not a runtime fallback opportunity.
 */
export function industryImplementationGaps(industry: string): string[] {
  const profile = getIndustryProfile(industry);
  if (!profile) return [];
  const missing = new Set<string>();
  for (const page of profile.defaultPages) {
    for (const section of page.expectedSections) {
      if (listImplementationsForSection(section as SectionType).length === 0) missing.add(section);
    }
  }
  return [...missing].sort();
}
