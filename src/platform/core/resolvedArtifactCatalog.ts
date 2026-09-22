/**
 * resolvedArtifactCatalog — P1.9.
 *
 * ONE consumer-facing runtime authority for every image/media reference a
 * generated site renders. Before this module, media discovery was re-implemented
 * per consumer (asset→slot binding walked its own key list, the preview picked
 * `src` attributes off the DOM, the inspector guessed). Each copy could disagree
 * about which props are media and which slot owns them.
 *
 * Authority rules:
 *   1. Derived only. The catalog restates nothing: sections and props come from
 *      the composition (Composition Authority), slot identity comes from
 *      `resolvedImplementationContract` (M6 artifact/slot closure).
 *   2. Enumeration lives here. Any consumer that needs "every media reference in
 *      this composition" must call `enumerateCompositionMedia` — never re-walk
 *      props with its own key list.
 *   3. Never fabricates media. A declared-but-empty media prop is reported as an
 *      `empty` entry, not filled with a stock URL.
 */

import type { SectionEntry, TemplateComposition } from '@/sections/types';
import { resolveImplementationContract } from './resolvedImplementationContract';

// ─────────────────────────────────────────────────────────────────────────────
// Media prop convention (the single declaration of what "media" means)
// ─────────────────────────────────────────────────────────────────────────────

/** Props that hold a single image reference. */
export const MEDIA_PROP_KEYS = [
  'image',
  'imageUrl',
  'backgroundImage',
  'src',
  'photo',
  'cover',
  'avatar',
  'logo',
] as const;

/** Array props whose entries may declare their own media prop. */
export const MEDIA_COLLECTION_KEYS = [
  'items',
  'cards',
  'products',
  'images',
  'slides',
  'gallery',
  'media',
  'tiles',
  'members',
  'logos',
] as const;

export type MediaPropKey = (typeof MEDIA_PROP_KEYS)[number];

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type AssetOrigin =
  /** Substituted from the business's own Asset Registry library. */
  | 'business-asset'
  /** Template/stock default shipped by the certified implementation. */
  | 'stock-default'
  /** Declared media prop with no usable value. */
  | 'empty';

export interface MediaReference {
  sectionId: string;
  sectionType: string;
  /** `props.image` or `props.items[2].image` — addressable within the section. */
  propPath: string;
  propKey: MediaPropKey;
  /** Index inside a collection prop, when the reference lives in one. */
  collectionIndex?: number;
  value: string;
}

export interface ResolvedAssetRef extends MediaReference {
  /** Canonical `data-ut-slot` id when the implementation declares an asset slot. */
  slotId: string | null;
  origin: AssetOrigin;
  alt?: string;
  /** Asset Registry id when the reference resolves to a business asset. */
  assetId?: string;
  /** True when the owning slot is required by the artifact contract. */
  required: boolean;
}

export interface ResolvedArtifactCatalog {
  entries: readonly ResolvedAssetRef[];
  businessAssetCount: number;
  stockDefaultCount: number;
  emptyCount: number;
}

/** Bounded record of which URLs came from the business library. */
export interface BusinessAssetIndex {
  /** url → asset id */
  byUrl: ReadonlyMap<string, string>;
  /** url → alt text */
  altByUrl?: ReadonlyMap<string, string>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Enumeration — the single traversal every consumer shares
// ─────────────────────────────────────────────────────────────────────────────

function isMediaValue(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function enumerateSectionMedia(section: SectionEntry): MediaReference[] {
  const props = (section.props as Record<string, unknown> | undefined) || {};
  const refs: MediaReference[] = [];

  for (const key of MEDIA_PROP_KEYS) {
    const value = props[key];
    if (typeof value !== 'string') continue;
    refs.push({
      sectionId: section.id,
      sectionType: String(section.type),
      propPath: `props.${key}`,
      propKey: key,
      value,
    });
  }

  for (const collectionKey of MEDIA_COLLECTION_KEYS) {
    const collection = props[collectionKey];
    if (!Array.isArray(collection)) continue;
    collection.forEach((entry, index) => {
      if (!entry || typeof entry !== 'object') return;
      const item = entry as Record<string, unknown>;
      for (const key of MEDIA_PROP_KEYS) {
        const value = item[key];
        if (typeof value !== 'string') continue;
        refs.push({
          sectionId: section.id,
          sectionType: String(section.type),
          propPath: `props.${collectionKey}[${index}].${key}`,
          propKey: key,
          collectionIndex: index,
          value,
        });
      }
    });
  }

  return refs;
}

/**
 * Every media reference declared by a composition, in deterministic order.
 * This is the only sanctioned way to discover media in canonical props.
 */
export function enumerateCompositionMedia(composition: TemplateComposition): MediaReference[] {
  return composition.sections.flatMap((section) => enumerateSectionMedia(section));
}

// ─────────────────────────────────────────────────────────────────────────────
// Slot identity — derived from the M6 implementation contract
// ─────────────────────────────────────────────────────────────────────────────

/** Asset slot ids the implementation declares, in contract order. */
function assetSlotsForSection(section: SectionEntry): { id: string; required: boolean }[] {
  if (!section.variantId) return [];
  const contract = resolveImplementationContract(section.variantId);
  if (!contract) return [];
  return contract.slots
    .filter((slot) => slot.kind === 'asset')
    .map((slot) => ({ id: slot.id, required: slot.required }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Catalog construction
// ─────────────────────────────────────────────────────────────────────────────

export function buildResolvedArtifactCatalog(
  composition: TemplateComposition,
  businessAssets?: BusinessAssetIndex,
): ResolvedArtifactCatalog {
  const entries: ResolvedAssetRef[] = [];

  for (const section of composition.sections) {
    const slots = assetSlotsForSection(section);
    const refs = enumerateSectionMedia(section);

    refs.forEach((ref, index) => {
      const slot = slots[index] ?? slots[0] ?? null;
      const assetId = businessAssets?.byUrl.get(ref.value);
      const origin: AssetOrigin = !isMediaValue(ref.value)
        ? 'empty'
        : assetId
          ? 'business-asset'
          : 'stock-default';

      entries.push({
        ...ref,
        slotId: slot ? slot.id : null,
        required: slot ? slot.required : false,
        origin,
        assetId,
        alt: businessAssets?.altByUrl?.get(ref.value),
      });
    });
  }

  return {
    entries,
    businessAssetCount: entries.filter((e) => e.origin === 'business-asset').length,
    stockDefaultCount: entries.filter((e) => e.origin === 'stock-default').length,
    emptyCount: entries.filter((e) => e.origin === 'empty').length,
  };
}

/** Resolve the media a given section/slot renders at runtime. */
export function resolveCatalogAsset(
  catalog: ResolvedArtifactCatalog,
  sectionId: string,
  slotId?: string | null,
): ResolvedAssetRef | null {
  const inSection = catalog.entries.filter((entry) => entry.sectionId === sectionId);
  if (!inSection.length) return null;
  if (!slotId) return inSection[0];
  return inSection.find((entry) => entry.slotId === slotId) ?? null;
}

/**
 * Closure check: every required asset slot the implementation declares must
 * render a usable reference. Returns readable violations (never throws), so
 * callers can log for tolerant paths and reject for strict ones.
 */
export function assertArtifactCatalogClosure(catalog: ResolvedArtifactCatalog): string[] {
  return catalog.entries
    .filter((entry) => entry.required && entry.origin === 'empty')
    .map(
      (entry) =>
        `Required media slot "${entry.slotId ?? entry.propKey}" in section "${entry.sectionId}" (${entry.sectionType}) has no image.`,
    );
}
