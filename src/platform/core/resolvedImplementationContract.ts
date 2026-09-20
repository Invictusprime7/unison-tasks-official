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
 *   3. Unknown implementations resolve to `null`; callers keep their legacy path.
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

  return {
    implementationId: variant.id,
    sectionType: variant.sectionType,
    artifactId: artifact?.artifactId ?? null,
    slots,
    intents,
    catalogSurfaceId,
    primitiveDependencies,
    runtimeDependencies,
    generationStatus: variant.generationStatus ?? 'preferred',
    source: variant.source,
  };
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
    const contract = resolveImplementationContract(variant.id);
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
