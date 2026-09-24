/**
 * Canonical Art Direction Families.
 *
 * modern / bold / editorial / minimalist / futuristic / organic are Unison's
 * six Art Direction Families — broad visual philosophies, NOT theme presets
 * or CSS skins. Each family owns several versioned Art Direction Packs.
 *
 * This file is a REFERENCE registry only: it names tendencies and child pack
 * ids. It never restates pack contents, variants, components or tokens —
 * those stay owned by `artDirectionPacks.ts` and the variant registry.
 *
 * Migration: `themePresetId` remains the stored field and MEANS familyId.
 * Qualified pack ids (`family.slug`) alias the storage ids already sealed in
 * saved snapshots, so nothing previously saved changes meaning.
 */
import type { ArtDirectionPackId } from './artDirectionPacks';

export const ART_DIRECTION_FAMILY_IDS = [
  'modern',
  'bold',
  'editorial',
  'minimalist',
  'futuristic',
  'organic',
] as const;

export type ArtDirectionFamilyId = (typeof ART_DIRECTION_FAMILY_IDS)[number];

export const ART_DIRECTION_FAMILY_VERSION = '1.0' as const;

export interface ArtDirectionFamilyTendencies {
  typography: string;
  contrast: string;
  spacing: string;
  geometry: string;
  media: string;
  layoutTension: string;
  motion: string;
  surface: string;
  density: string;
}

export interface ArtDirectionFamilyPackRef {
  /** Canonical qualified id: `${familyId}.${slug}`. */
  qualifiedId: string;
  /** Storage id of the pack in ART_DIRECTION_PACKS (sealed in snapshots). */
  packId: ArtDirectionPackId;
  packVersion: string;
}

export interface ArtDirectionFamily {
  id: ArtDirectionFamilyId;
  label: string;
  philosophy: string;
  tendencies: ArtDirectionFamilyTendencies;
  /** Ordered child packs — the head is the family's primary grammar. */
  packs: readonly ArtDirectionFamilyPackRef[];
}

const ref = (family: ArtDirectionFamilyId, slug: string, packId: ArtDirectionPackId): ArtDirectionFamilyPackRef => ({
  qualifiedId: `${family}.${slug}`,
  packId,
  packVersion: '1.0',
});

export const ART_DIRECTION_FAMILIES: Record<ArtDirectionFamilyId, ArtDirectionFamily> = {
  modern: {
    id: 'modern',
    label: 'Modern',
    philosophy: 'Contemporary clarity: confident sans type, layered surfaces, energetic but controlled.',
    tendencies: {
      typography: 'geometric sans, strong weight contrast',
      contrast: 'medium-high with a vivid accent',
      spacing: 'generous, card-structured',
      geometry: 'medium radius',
      media: 'framed and layered',
      layoutTension: 'balanced grids with a focal break',
      motion: 'smooth lift and stagger',
      surface: 'elevated / glass',
      density: 'standard',
    },
    packs: [
      ref('modern', 'glass', 'glass-tech'),
      ref('modern', 'soft-editorial', 'soft-editorial'),
      ref('modern', 'commerce', 'commerce-editorial'),
    ],
  },
  bold: {
    id: 'bold',
    label: 'Bold',
    philosophy: 'Raw graphic power: oversized type, hard contrast, one loud accent.',
    tendencies: {
      typography: 'display-dominant, heavy weights, uppercase',
      contrast: 'maximum',
      spacing: 'tight blocks with dramatic breaks',
      geometry: 'square',
      media: 'full-bleed, cropped hard',
      layoutTension: 'high — grid breaking and poster scale',
      motion: 'snappy and decisive',
      surface: 'flat / offset',
      density: 'compact to standard',
    },
    packs: [
      ref('bold', 'commercial', 'bold-commercial'),
      ref('bold', 'poster', 'brutalist-poster'),
    ],
  },
  editorial: {
    id: 'editorial',
    label: 'Editorial',
    philosophy: 'Magazine intelligence: refined serif display, asymmetry, image-led storytelling.',
    tendencies: {
      typography: 'serif or high-contrast display, careful measure',
      contrast: 'quiet to dramatic',
      spacing: 'airy, rhythmic',
      geometry: 'near-square',
      media: 'full-bleed and mosaic',
      layoutTension: 'asymmetric columns, intentional overlap',
      motion: 'slow reveals and pans',
      surface: 'flat / bordered',
      density: 'roomy',
    },
    packs: [
      ref('editorial', 'noir', 'editorial-noir'),
      ref('editorial', 'print', 'print-serif'),
      ref('editorial', 'atelier', 'noir-atelier'),
      ref('editorial', 'cinematic', 'cinematic-portfolio'),
    ],
  },
  minimalist: {
    id: 'minimalist',
    label: 'Minimalist',
    philosophy: 'Precision through restraint: whitespace, monochrome, thin lines.',
    tendencies: {
      typography: 'light weights, tight system',
      contrast: 'two-tone',
      spacing: 'maximum whitespace',
      geometry: 'near-square',
      media: 'framed, sparse',
      layoutTension: 'low — strict grid',
      motion: 'subtle fades',
      surface: 'bordered',
      density: 'roomy',
    },
    packs: [
      ref('minimalist', 'luxury', 'luxury-minimal'),
      ref('minimalist', 'swiss', 'swiss-grid'),
    ],
  },
  futuristic: {
    id: 'futuristic',
    label: 'Futuristic',
    philosophy: 'Sci-fi atmosphere: dark panels, luminous accents, technical type.',
    tendencies: {
      typography: 'geometric or monospace',
      contrast: 'dark with neon accents',
      spacing: 'grid-disciplined',
      geometry: 'angular',
      media: 'masked, duotone',
      layoutTension: 'grid with glowing focal points',
      motion: 'scan, glow and blur-focus',
      surface: 'glass',
      density: 'standard',
    },
    packs: [
      ref('futuristic', 'glass', 'glass-tech'),
      ref('futuristic', 'neon', 'neon-grid'),
      ref('futuristic', 'terminal', 'mono-terminal'),
    ],
  },
  organic: {
    id: 'organic',
    label: 'Organic',
    philosophy: 'Natural warmth: earth tones, soft shapes, humanist type.',
    tendencies: {
      typography: 'humanist serif and rounded sans',
      contrast: 'soft',
      spacing: 'cozy and generous',
      geometry: 'soft radius',
      media: 'soft-mask',
      layoutTension: 'gentle curves and flowing rhythm',
      motion: 'gentle rise',
      surface: 'elevated, warm shadow',
      density: 'standard',
    },
    packs: [
      ref('organic', 'studio', 'organic-studio'),
      ref('organic', 'craft', 'warm-craft'),
    ],
  },
};

export function isArtDirectionFamilyId(id: string | null | undefined): id is ArtDirectionFamilyId {
  return Boolean(id && (ART_DIRECTION_FAMILY_IDS as readonly string[]).includes(id));
}

/** Compatibility: the stored `themePresetId` IS the family id. */
export function familyIdFromThemePreset(themePresetId: string | null | undefined): ArtDirectionFamilyId | null {
  const id = (themePresetId || '').trim().toLowerCase();
  return isArtDirectionFamilyId(id) ? id : null;
}

/** Child storage pack ids of a family, in family order. */
export function familyPackIds(familyId: ArtDirectionFamilyId): ArtDirectionPackId[] {
  return ART_DIRECTION_FAMILIES[familyId].packs.map((p) => p.packId);
}

/** Qualified `family.slug` id for a storage pack id (family-scoped when known). */
export function qualifiedPackRef(
  packId: string,
  familyId?: ArtDirectionFamilyId | null,
): ArtDirectionFamilyPackRef | null {
  const order = familyId
    ? [ART_DIRECTION_FAMILIES[familyId], ...Object.values(ART_DIRECTION_FAMILIES)]
    : Object.values(ART_DIRECTION_FAMILIES);
  for (const family of order) {
    const hit = family.packs.find((p) => p.packId === packId);
    if (hit) return hit;
  }
  return null;
}

/** Resolve a qualified (`bold.poster`) or storage id to the storage pack id. */
export function resolvePackAlias(id: string | null | undefined): ArtDirectionPackId | null {
  if (!id) return null;
  for (const family of Object.values(ART_DIRECTION_FAMILIES)) {
    const hit = family.packs.find((p) => p.qualifiedId === id || p.packId === id);
    if (hit) return hit.packId;
  }
  return null;
}

/** The family that primarily owns a storage pack (first declaring family). */
export function familyOfPack(packId: string): ArtDirectionFamilyId | null {
  return qualifiedPackRef(packId)?.qualifiedId.split('.')[0] as ArtDirectionFamilyId ?? null;
}
