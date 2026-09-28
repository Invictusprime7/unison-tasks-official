/**
 * Creative intent — a customer's abstract brief (mood, adjectives, references)
 * translated into structured design intelligence. Customers never need to use
 * Unison terminology; the interpreter maps their words onto families and packs.
 */
import type { ArtDirectionPackId } from '../../variants/artDirectionPacks';
import type { ThemeFamilyId } from './theme-family';

export type CreativeResolutionMode = 'exact' | 'blended' | 'novel';

export interface CreativeIntentProfile {
  sourcePrompt: string;
  mood: string[];
  emotionalTraits: string[];
  typography: string[];
  colour: string[];
  layout: string[];
  media: string[];
  motion: 'still' | 'subtle' | 'expressive' | 'unspecified';
  references: string[];
  negativeVocabulary: string[];
  /** 0–1. Drives the resolution mode; never overrides hard limits. */
  confidence: number;
}

export interface AffinityScore<Id extends string = string> {
  id: Id;
  score: number;
  evidence: string[];
}

export interface CreativeAffinity {
  themeFamilies: AffinityScore<ThemeFamilyId>[];
  packs: AffinityScore<ArtDirectionPackId>[];
  excludedPacks: AffinityScore<ArtDirectionPackId>[];
}

export const CREATIVE_CONFIDENCE = { exact: 0.75, blended: 0.45 } as const;

export function resolutionModeFor(confidence: number): CreativeResolutionMode {
  if (confidence >= CREATIVE_CONFIDENCE.exact) return 'exact';
  if (confidence >= CREATIVE_CONFIDENCE.blended) return 'blended';
  return 'novel';
}
