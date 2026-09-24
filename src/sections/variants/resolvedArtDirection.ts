/**
 * ResolvedArtDirection — the single sealed answer to "what is this site's
 * art direction". Derived from registered facts (family → pack → variants →
 * profiles) plus the Wizard's deterministic design intervention; never
 * authored by Preview, Builder, Playground or AI surfaces.
 */
import { getArtDirectionPack } from './artDirectionPacks';
import {
  ART_DIRECTION_FAMILY_VERSION,
  familyIdFromThemePreset,
  familyOfPack,
  qualifiedPackRef,
  type ArtDirectionFamilyId,
} from './artDirectionFamilies';

export const RESOLVED_ART_DIRECTION_VERSION = '1.0' as const;

export interface ResolvedArtDirection {
  version: typeof RESOLVED_ART_DIRECTION_VERSION;
  familyVersion: typeof ART_DIRECTION_FAMILY_VERSION;
  familyId: ArtDirectionFamilyId;
  /** Canonical qualified id, e.g. `editorial.noir`. */
  packId: string;
  /** Storage id sealed as `meta.artDirectionPackId` (compatibility). */
  storagePackId: string;
  packVersion: string;
  compositionRecipeIds: string[];
  activeVariants: Record<string, string>;
  portableRecipeIds: string[];
  motionProfileId: string;
  mediaProfileId: string;
  interactionProfileId: string;
  tokenProfileId: string;
  aiDirective: string;
}

/** Minimal projection input — structurally satisfied by WizardDesignIntervention. */
export interface ArtDirectionProjectionSource {
  themePresetId?: string | null;
  artDirectionPackId: string;
  layoutRecipe?: string | null;
  sectionVariants?: readonly string[] | null;
  motionRecipes?: readonly string[] | null;
  interactionRecipes?: readonly string[] | null;
  activeVariants?: Record<string, string> | null;
  aiDirective?: string | null;
}

export function projectResolvedArtDirection(source: ArtDirectionProjectionSource): ResolvedArtDirection | null {
  const pack = getArtDirectionPack(source.artDirectionPackId);
  if (!pack) return null;
  const familyId = familyIdFromThemePreset(source.themePresetId) ?? familyOfPack(pack.id) ?? 'modern';
  const refEntry = qualifiedPackRef(pack.id, familyId);
  const activeVariants = { ...(source.activeVariants ?? {}) };
  return {
    version: RESOLVED_ART_DIRECTION_VERSION,
    familyVersion: ART_DIRECTION_FAMILY_VERSION,
    familyId,
    packId: refEntry?.qualifiedId ?? `${familyId}.${pack.id}`,
    storagePackId: pack.id,
    packVersion: refEntry?.packVersion ?? '1.0',
    compositionRecipeIds: [
      ...(source.layoutRecipe ? [source.layoutRecipe] : []),
      ...(source.sectionVariants ?? []),
    ],
    activeVariants,
    portableRecipeIds: [...new Set(Object.values(activeVariants))].sort(),
    motionProfileId: pack.motionProfile,
    mediaProfileId: pack.design.mediaTreatment,
    interactionProfileId: pack.interactionProfile,
    tokenProfileId: `${familyId}:${pack.id}`,
    aiDirective: source.aiDirective ?? '',
  };
}

export function describeResolvedArtDirection(resolved: ResolvedArtDirection): string {
  return [
    `Art Direction Family: ${resolved.familyId}. Pack: ${resolved.packId}@${resolved.packVersion}.`,
    `Compose creatively inside this grammar only; never switch family.`,
    `Motion profile ${resolved.motionProfileId}, media ${resolved.mediaProfileId}, interaction ${resolved.interactionProfileId}.`,
  ].join(' ');
}

/** Snapshot-meta shape the reader accepts (structural, avoids a pipeline import). */
export interface SealedArtDirectionMeta {
  artDirection?: ResolvedArtDirection | null;
  artDirectionPackId?: string | null;
  themePresetId?: string | null;
  designIntervention?: Partial<ArtDirectionProjectionSource> | null;
}

/**
 * readSealedArtDirection — the one reader every consumer (Preview, Builder,
 * Playground, AI Builder, autosave, recompile, publish) uses. Prefers the
 * sealed `meta.artDirection`; falls back to projecting from the legacy sealed
 * fields for revisions saved before Phase D. Never re-derives from a seed.
 */
export function readSealedArtDirection(meta: SealedArtDirectionMeta | null | undefined): ResolvedArtDirection | null {
  if (!meta) return null;
  const sealed = meta.artDirection;
  const packId = meta.artDirectionPackId ?? meta.designIntervention?.artDirectionPackId ?? null;
  if (sealed && sealed.version === RESOLVED_ART_DIRECTION_VERSION && getArtDirectionPack(sealed.storagePackId)) {
    // A sealed record that disagrees with the sealed pack id is stale; re-project.
    if (!packId || getArtDirectionPack(packId)?.id === sealed.storagePackId) return sealed;
  }
  if (!packId) return null;
  return projectResolvedArtDirection({
    ...(meta.designIntervention ?? {}),
    themePresetId: meta.themePresetId ?? meta.designIntervention?.themePresetId ?? null,
    artDirectionPackId: packId,
  });
}
