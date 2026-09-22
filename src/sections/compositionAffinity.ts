/**
 * Composition affinity (plan 2026-09-22 §7.5).
 *
 * Seeded variant selection used to rotate blindly through the certified pool:
 * every eligible implementation was equally likely, so a salon could land a
 * terminal-flavoured marquee next to an editorial hero purely because of a
 * seed. Affinity fixes the *selection*, never the eligibility: certification,
 * pack membership, role eligibility, dependencies and runtime safety remain
 * the only hard gates (rejection lives in the registry and the contracts).
 *
 * The score is DERIVED from metadata that already exists — art-direction pack
 * order, industry dialect, provenance, family affinity — plus an optional
 * authored `compositionAffinity` map on an implementation. Nothing here
 * invents a design decision; it only ranks legal ones so the same seed yields
 * the most coherent legal composition instead of an arbitrary one.
 */
import type { SectionType } from '@/sections/types';
import type { SectionVariant } from '@/sections/variants/types';
import { ART_DIRECTION_PACKS, type ArtDirectionPackId } from '@/sections/variants/artDirectionPacks';
import { familyForSection } from '@/sections/variants/registry';
import { industryCreativeProfile } from '@/sections/templates/industryCreativeVocabulary';

export interface CompositionAffinityContext {
  /** Selected art direction — its family order is the strongest derived signal. */
  packId?: ArtDirectionPackId | null;
  /** Industry dialect key (salon, restaurant, …). */
  industry?: string | null;
  /** Page role the section is being composed into. */
  role?: string | null;
  /** Families sharing the page — neighbours an authored affinity map can reward. */
  neighbors?: readonly SectionType[];
  /** The composition's own declared choice (template baseline or saved design). */
  baselineVariantId?: string | null;
}

const clamp = (value: number) => Math.min(1, Math.max(0, value));

/** Deterministic FNV-1a index — same seed in, same choice out, forever. */
function stableIndex(seed: string, size: number): number {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % size;
}

/**
 * Coherence score in 0..1 for one legal candidate. Never a gate — a candidate
 * scoring 0 is still selectable when it is the only legal implementation.
 */
export function compositionAffinityScore(
  variant: SectionVariant,
  context: CompositionAffinityContext = {},
): number {
  let score = 0.5;

  // 1. Art direction: the pack lists its family most-preferred first.
  const pack = context.packId ? ART_DIRECTION_PACKS[context.packId] : undefined;
  if (pack) {
    const family = familyForSection(pack, variant.sectionType);
    const rank = family.indexOf(variant.id);
    if (rank >= 0) score += 0.2 * (1 - rank / Math.max(1, family.length));
  }

  // 2. Industry dialect: family affinity and negative trait vocabulary.
  const profile = context.industry ? industryCreativeProfile(context.industry) : undefined;
  if (profile) {
    if (profile.preferredFamilies.includes(variant.sectionType)) score += 0.08;
    if (profile.discouragedFamilies.includes(variant.sectionType)) score -= 0.12;
    const tags = variant.tags ?? [];
    if (profile.discouragedTags.some(tag => tags.includes(tag))) score -= 0.25;
    const page = profile.pageProfiles[context.role ?? ''];
    if (page?.preferredFamilies?.includes(variant.sectionType)) score += 0.05;
    if (page?.discouragedFamilies?.includes(variant.sectionType)) score -= 0.1;
  }

  // 3. Page role: a variant that declares this role fits it by authorship.
  if (context.role && variant.pageRoles?.some(role => role === context.role)) score += 0.05;

  // 4. Provenance: a genuine 21st source adaptation over a visual reference.
  if (variant.source?.derivation === 'source-adaptation') score += 0.04;

  // 5. Authored neighbour affinity (optional metadata, averaged over the page).
  const authored = variant.compositionAffinity;
  if (authored && context.neighbors?.length) {
    const weights = context.neighbors
      .filter(neighbor => neighbor !== variant.sectionType)
      .map(neighbor => authored[neighbor])
      .filter((weight): weight is number => typeof weight === 'number');
    if (weights.length) {
      const mean = weights.reduce((total, weight) => total + weight, 0) / weights.length;
      score += 0.18 * (mean - 0.5);
    }
  }

  // 6. The composition's declared baseline stays the preferred reading unless
  //    the dialect actively argues against it.
  if (context.baselineVariantId && variant.id === context.baselineVariantId) score += 0.06;

  return clamp(score);
}

/**
 * Candidates within the top affinity band. The band is deliberately wide: two
 * sites in the same industry must still look like two sites, so affinity drops
 * the incoherent choices and leaves the comparable ones to the seed.
 */
export function affinityBand(
  candidates: readonly SectionVariant[],
  context: CompositionAffinityContext = {},
  tolerance = 0.12,
): SectionVariant[] {
  if (candidates.length < 2) return [...candidates];
  const scored = candidates
    .map(variant => ({ variant, score: compositionAffinityScore(variant, context) }))
    .sort((left, right) => right.score - left.score);
  const best = scored[0].score;
  const band = scored.filter(entry => entry.score >= best - tolerance);
  // Two sites in one industry must still read as two sites: the band always
  // keeps the runner-up so the wizard seed retains real choice, while every
  // lower-scoring (incoherent) implementation is dropped.
  const widened = band.length >= 2 ? band : scored.slice(0, 2);
  return widened.map(entry => entry.variant);
}

/**
 * Deterministic affinity-guided selection: rank by coherence, then let the
 * wizard seed decide among the implementations that are effectively tied.
 */
export function selectAffineVariant(
  candidates: readonly SectionVariant[],
  seed: string,
  context: CompositionAffinityContext = {},
): SectionVariant | undefined {
  if (!candidates.length) return undefined;
  const band = affinityBand(candidates, context);
  if (band.length === 1) return band[0];
  return band[stableIndex(seed, band.length)];
}
