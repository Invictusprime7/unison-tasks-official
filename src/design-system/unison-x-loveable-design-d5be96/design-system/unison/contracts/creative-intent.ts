/**
 * Creative intent — a customer's abstract brief (mood, adjectives, references)
 * translated into structured design intelligence. Customers never need to use
 * Unison terminology; the interpreter maps their words onto families and packs.
 * This is a semantic bridge, not a competing design system.
 */
import type { ArtDirectionPackId } from './art-direction';
import type { ThemeFamilyId } from './theme-family';

export type CreativeResolutionMode = 'exact' | 'blended' | 'novel';

export interface CreativeIntentProfile {
  sourcePrompt: string;
  mood: string[];
  emotionalTraits: string[];
  typography: {
    character: string[];
    expression?: 'restrained' | 'editorial' | 'expressive' | 'technical' | 'playful' | 'luxury';
    scale?: 'quiet' | 'balanced' | 'dramatic';
    contrast?: 'low' | 'medium' | 'high';
  };
  composition: {
    density?: 'low' | 'medium' | 'high';
    asymmetry?: number;
    whitespace?: number;
    layering?: number;
    modularity?: number;
    visualTension?: number;
  };
  geometry: { softness?: number; precision?: number; irregularity?: number };
  media: { dominance?: number; treatment: string[]; tactileQualities: string[] };
  motion: { intensity: 'low' | 'medium' | 'high' | 'unspecified'; character: string[] };
  surface: { character: string[]; texture: string[]; depth?: 'flat' | 'layered' | 'immersive' };
  referenceSignals: string[];
  negativeVocabulary: string[];
  explicitPreferences: string[];
  explicitAvoidances: string[];
  /** 0–1 each. `overall` drives the resolution mode; never overrides hard limits. */
  confidence: { overall: number; themeFamily: number; artDirectionPack: number };
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
