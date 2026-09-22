/**
 * Canonical asset → slot binding (M6).
 *
 * Template compositions ship with stock media. When the business actually owns
 * images (uploaded through the Asset Registry, cloud- or locally-scoped), the
 * generated site must render *those* images instead of stock placeholders.
 *
 * Authority rules:
 *   • Binding never adds or removes props — it only substitutes the value of a
 *     media prop the template already declares. Section presence, count and
 *     shape stay owned by the composition (Composition Authority).
 *   • Binding is deterministic: the same seed + same library produces the same
 *     assignment on every recompile, preview and publish.
 *   • Binding never fabricates media. With an empty library the composition is
 *     returned unchanged (stock defaults remain).
 */

import type { SectionEntry, TemplateComposition } from '@/sections/types';
import {
  MEDIA_PROP_KEYS,
  MEDIA_COLLECTION_KEYS,
  buildResolvedArtifactCatalog,
  type ResolvedArtifactCatalog,
} from '@/platform/core/resolvedArtifactCatalog';

/** Bounded, serialisable projection of an Asset Registry record. */
export interface SeedMediaAsset {
  id: string;
  url: string;
  kind?: string;
  name?: string;
  alt?: string;
  tags?: readonly string[];
  width?: number;
  height?: number;
}

export interface AssetBindingReport {
  /** Number of media slots that received a real business asset. */
  bound: number;
  /** Section ids that received at least one real asset. */
  sections: string[];
}

/** Maximum assets projected into the wizard seed (keeps the seed bounded). */
export const SEED_MEDIA_LIBRARY_LIMIT = 40;

/**
 * Media prop discovery is owned by the Resolved Artifact Catalog — this module
 * never restates what "media" means, it only narrows the catalog's vocabulary
 * to what may be *substituted*: brand marks stay template-owned.
 */
const SINGLE_MEDIA_KEYS = MEDIA_PROP_KEYS.filter((key) => key !== 'logo');
const COLLECTION_KEYS = MEDIA_COLLECTION_KEYS.filter((key) => key !== 'logos');

function hash(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function isImageish(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Project Asset Registry records into the bounded seed media library.
 * Only images are eligible; ordering is stable so recompiles are reproducible.
 */
export function buildSeedMediaLibrary(
  assets: ReadonlyArray<Record<string, unknown>>,
  limit: number = SEED_MEDIA_LIBRARY_LIMIT,
): SeedMediaAsset[] {
  const seen = new Set<string>();
  const library: SeedMediaAsset[] = [];
  for (const asset of assets) {
    const url = typeof asset.url === 'string' ? asset.url.trim() : '';
    const kind = typeof asset.kind === 'string' ? asset.kind : '';
    if (!url || (kind && kind !== 'image')) continue;
    const id = typeof asset.id === 'string' && asset.id ? asset.id : url;
    if (seen.has(id)) continue;
    seen.add(id);
    library.push({
      id,
      url,
      kind: 'image',
      name: typeof asset.name === 'string' ? asset.name : undefined,
      alt: typeof asset.alt === 'string' ? asset.alt : undefined,
      tags: Array.isArray(asset.tags) ? asset.tags.filter((t): t is string => typeof t === 'string') : undefined,
      width: typeof asset.width === 'number' ? asset.width : undefined,
      height: typeof asset.height === 'number' ? asset.height : undefined,
    });
  }
  return library
    .sort((a, b) => a.id.localeCompare(b.id))
    .slice(0, Math.max(0, limit));
}

/** Deterministic, non-repeating-until-exhausted picker over the library. */
function createPicker(library: readonly SeedMediaAsset[], seedKey: string) {
  let cursor = library.length > 0 ? hash(seedKey) % library.length : 0;
  return () => {
    const asset = library[cursor % library.length];
    cursor += 1;
    return asset;
  };
}

function bindProps(
  props: Record<string, unknown>,
  next: () => SeedMediaAsset,
  onBound: () => void,
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...props };

  for (const key of SINGLE_MEDIA_KEYS) {
    if (!isImageish(out[key])) continue;
    const asset = next();
    out[key] = asset.url;
    onBound();
    if (key === 'image' && isImageish(out.alt) && asset.alt) out.alt = asset.alt;
  }

  for (const key of COLLECTION_KEYS) {
    const collection = out[key];
    if (!Array.isArray(collection)) continue;
    let changed = false;
    const mapped = collection.map((entry) => {
      if (!entry || typeof entry !== 'object') return entry;
      const item = { ...(entry as Record<string, unknown>) };
      for (const mediaKey of SINGLE_MEDIA_KEYS) {
        if (!isImageish(item[mediaKey])) continue;
        const asset = next();
        item[mediaKey] = asset.url;
        changed = true;
        onBound();
      }
      return item;
    });
    if (changed) out[key] = mapped;
  }

  return out;
}

/**
 * Substitute real business media into every media slot the composition already
 * declares. Returns the composition unchanged when the library is empty.
 */
export function bindMediaToComposition(
  composition: TemplateComposition,
  library: readonly SeedMediaAsset[],
  seedKey: string,
): { composition: TemplateComposition; report: AssetBindingReport } {
  const report: AssetBindingReport = { bound: 0, sections: [] };
  if (!library.length) return { composition, report };

  const next = createPicker(library, seedKey || composition.id);
  const sections = composition.sections.map((section) => {
    const props = (section.props as Record<string, unknown> | undefined) || {};
    let boundHere = 0;
    const nextProps = bindProps(props, next, () => {
      boundHere += 1;
      report.bound += 1;
    });
    if (boundHere === 0) return section;
    report.sections.push(section.id);
    return { ...section, props: nextProps } as SectionEntry;
  });

  return { composition: { ...composition, sections }, report };
}
