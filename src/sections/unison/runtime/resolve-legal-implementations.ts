import type { ArtDirectionPack } from '../../variants/artDirectionPacks';
import type { SectionType } from '../../types';
import { getGenerationVariantsForSection } from '../../variants/registry';
import type { SectionVariant, VariantId } from '../../variants/types';
import { childSeed, seededPick } from '../../../platform/core/generationSeed';
import { deriveStatus } from './promotion-audit';

export function listLegalImplementations(family: SectionType, pack?: ArtDirectionPack, pageRole?: string): SectionVariant[] {
  return getGenerationVariantsForSection(family, pack, pageRole).filter(v => isCanonicalImplementation(v.id));
}

export function resolveLegalImplementation(input: { family: SectionType; pack?: ArtDirectionPack; pageRole?: string; designSeed: string }): SectionVariant | undefined {
  const legal = listLegalImplementations(input.family, input.pack, input.pageRole);
  if (!legal.length) return undefined;
  return seededPick(childSeed(input.designSeed, input.pageRole ?? 'page', input.family), legal);
}

/** Canonical only when the derived promotion audit reports zero blockers. */
export function isCanonicalImplementation(id: VariantId): boolean {
  return deriveStatus(id) === 'canonical';
}
