/**
 * 21st Equivalence Ledger (Phase A — audit only)
 *
 * A read-only projection over the canonical design owners (Variant Registry and
 * Art Direction Packs). It introduces no registry of its own and never
 * influences resolution: it only reports, per registered design, whether that
 * design already meets the 21st equivalence bar, and what blocks it when it
 * does not.
 *
 * Equivalence bar (identical to `getGenerationVariantsForSection`):
 *   21st provenance + portable recipe + approved certification + preferred.
 */

import { getAllSections } from '@/sections/registry';
import type { SectionType } from '@/sections/types';
import {
  ART_DIRECTION_PACKS,
  VARIANT_REGISTRY,
  familyForSection,
  getVariantById,
} from '@/sections/variants';
import type { ArtDirectionPackId } from '@/sections/variants/artDirectionPacks';
import type { SectionVariant, VariantId } from '@/sections/variants/types';

export type EquivalenceBlocker =
  | 'missing-21st-source'
  | 'not-portable-recipe'
  | 'not-approved'
  | 'not-preferred';

export interface EquivalenceLedgerEntry {
  id: VariantId;
  sectionType: SectionType;
  /** Recorded design origin; `none` when the design carries no provenance yet. */
  origin: string;
  /** How the implementation relates to its source, when provenance exists. */
  derivation?: string;
  sourceId?: string;
  portableRecipe: boolean;
  approved: boolean;
  generationStatus: NonNullable<SectionVariant['generationStatus']> | 'unset';
  /** True when the design already meets the full equivalence bar. */
  eligible: boolean;
  blockers: EquivalenceBlocker[];
  /** Art direction packs that declare this design in a family. */
  packUsage: ArtDirectionPackId[];
}

export interface FamilyCoverageCell {
  packId: ArtDirectionPackId;
  sectionType: SectionType;
  /** Ids the pack declares for this family (registered ones only). */
  declared: VariantId[];
  /** Declared ids that already meet the equivalence bar. */
  eligible: VariantId[];
  /** Declared ids that would disappear if legacy designs were removed today. */
  atRisk: VariantId[];
  /** False when removing legacy today would leave this family with no design. */
  survivesLegacyRemoval: boolean;
}

export interface EquivalenceLedgerReport {
  entries: EquivalenceLedgerEntry[];
  matrix: FamilyCoverageCell[];
  totals: {
    designs: number;
    eligible: number;
    blocked: number;
    /** Registered section families with at least one eligible design. */
    familiesCovered: number;
    familiesTotal: number;
  };
  /** Pack/family cells that would break if legacy designs were deleted now. */
  removalBlockers: FamilyCoverageCell[];
  /** Blocked design ids grouped by section family, for Phase B sequencing. */
  blockedBySection: Record<string, VariantId[]>;
}

const PACK_IDS = Object.keys(ART_DIRECTION_PACKS) as ArtDirectionPackId[];

export function equivalenceBlockers(variant: SectionVariant): EquivalenceBlocker[] {
  const blockers: EquivalenceBlocker[] = [];
  if (variant.source?.origin !== '21st') blockers.push('missing-21st-source');
  if (variant.vfs?.mode !== 'portable-recipe') blockers.push('not-portable-recipe');
  if (variant.vfs?.certification !== 'approved') blockers.push('not-approved');
  if (variant.generationStatus !== 'preferred') blockers.push('not-preferred');
  return blockers;
}

export function isEquivalent(variant: SectionVariant): boolean {
  return equivalenceBlockers(variant).length === 0;
}

function packsDeclaring(id: VariantId, sectionType: SectionType): ArtDirectionPackId[] {
  return PACK_IDS.filter((packId) =>
    familyForSection(ART_DIRECTION_PACKS[packId], sectionType).includes(id));
}

export function buildEquivalenceLedger(): EquivalenceLedgerReport {
  const sectionTypes = Object.keys(getAllSections()) as SectionType[];
  const entries: EquivalenceLedgerEntry[] = [];

  for (const sectionType of sectionTypes) {
    for (const variant of VARIANT_REGISTRY[sectionType] ?? []) {
      const blockers = equivalenceBlockers(variant);
      entries.push({
        id: variant.id,
        sectionType,
        origin: variant.source?.origin ?? 'none',
        derivation: variant.source?.derivation,
        sourceId: variant.source?.sourceId,
        portableRecipe: variant.vfs?.mode === 'portable-recipe',
        approved: variant.vfs?.certification === 'approved',
        generationStatus: variant.generationStatus ?? 'unset',
        eligible: blockers.length === 0,
        blockers,
        packUsage: packsDeclaring(variant.id, sectionType),
      });
    }
  }

  const matrix: FamilyCoverageCell[] = [];
  for (const packId of PACK_IDS) {
    const pack = ART_DIRECTION_PACKS[packId];
    for (const sectionType of sectionTypes) {
      const declared = familyForSection(pack, sectionType);
      if (!declared.length) continue;
      const eligible = declared.filter((id) => {
        const variant = getVariantById(id);
        return variant ? isEquivalent(variant) : false;
      });
      matrix.push({
        packId,
        sectionType,
        declared,
        eligible,
        atRisk: declared.filter((id) => !eligible.includes(id)),
        survivesLegacyRemoval: eligible.length > 0,
      });
    }
  }

  const blockedBySection: Record<string, VariantId[]> = {};
  for (const entry of entries) {
    if (entry.eligible) continue;
    (blockedBySection[entry.sectionType] ??= []).push(entry.id);
  }

  const familiesWithEligible = new Set(
    entries.filter((entry) => entry.eligible).map((entry) => entry.sectionType));

  return {
    entries,
    matrix,
    totals: {
      designs: entries.length,
      eligible: entries.filter((entry) => entry.eligible).length,
      blocked: entries.filter((entry) => !entry.eligible).length,
      familiesCovered: familiesWithEligible.size,
      familiesTotal: sectionTypes.length,
    },
    removalBlockers: matrix.filter((cell) => !cell.survivesLegacyRemoval),
    blockedBySection,
  };
}

/** Eligible design count per section family — the Phase C removal safety metric. */
export function eligibleCountsBySection(report = buildEquivalenceLedger()): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const entry of report.entries) {
    counts[entry.sectionType] ??= 0;
    if (entry.eligible) counts[entry.sectionType] += 1;
  }
  return counts;
}

export function summarizeEquivalenceLedger(report = buildEquivalenceLedger()): string {
  const { designs, eligible, blocked, familiesCovered, familiesTotal } = report.totals;
  const removal = report.removalBlockers.length;
  return `21st equivalence: ${eligible}/${designs} designs certified, ${blocked} blocked; `
    + `${familiesCovered}/${familiesTotal} families covered; `
    + `${removal === 0 ? 'legacy removal safe' : `${removal} pack/family cell(s) block legacy removal`}`;
}
