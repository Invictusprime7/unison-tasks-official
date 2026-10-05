/**
 * Theme Family registry — the canonical classification layer above Art
 * Direction Packs. Theme Family CLASSIFIES; Art Direction Pack EXECUTES.
 *
 * A family is a user-facing creative language, never a fixed palette. The
 * `fallbackPalette` is an example only; client brand owns real colour values.
 * This module only imports types, so art-direction.ts can depend on it.
 */
import type { ArtDirectionPackId } from './art-direction';
import type { WizardExperiencePreference } from './selection';

export const THEME_FAMILY_IDS = ['modern', 'editorial', 'futuristic', 'minimalist', 'bold', 'organic'] as const;
export type ThemeFamilyId = (typeof THEME_FAMILY_IDS)[number];
/** Compatibility alias for existing Unison consumers. */
export type ThemePresetId = ThemeFamilyId;

export interface ThemeFamilyDefinition {
  id: ThemeFamilyId;
  name: string;
  description: string;
  /** Example colours only — brand overrides always win. */
  fallbackPalette: { background: string; foreground: string; primary: string; accent: string };
}

export const THEME_FAMILIES: Record<ThemeFamilyId, ThemeFamilyDefinition> = {
  modern: { id: 'modern', name: 'Modern', description: 'Clean contemporary product language, confident surfaces and crisp motion.', fallbackPalette: { background: '220 20% 98%', foreground: '222 30% 10%', primary: '221 83% 53%', accent: '190 90% 50%' } },
  editorial: { id: 'editorial', name: 'Editorial', description: 'Magazine-grade typography, narrative pacing and considered imagery.', fallbackPalette: { background: '36 25% 97%', foreground: '20 15% 10%', primary: '7 72% 51%', accent: '47 91% 57%' } },
  futuristic: { id: 'futuristic', name: 'Futuristic', description: 'Luminous, technical, depth-forward language with expressive motion.', fallbackPalette: { background: '240 20% 6%', foreground: '210 40% 96%', primary: '265 90% 65%', accent: '180 100% 50%' } },
  minimalist: { id: 'minimalist', name: 'Minimalist', description: 'Restraint, generous space, precise grids and quiet surfaces.', fallbackPalette: { background: '0 0% 99%', foreground: '0 0% 8%', primary: '0 0% 12%', accent: '30 10% 60%' } },
  bold: { id: 'bold', name: 'Bold', description: 'Loud commercial energy, big type, hard contrast and direct calls to action.', fallbackPalette: { background: '48 100% 97%', foreground: '0 0% 5%', primary: '350 90% 52%', accent: '48 100% 55%' } },
  organic: { id: 'organic', name: 'Organic', description: 'Warm, tactile and human — soft shapes, natural rhythm and crafted detail.', fallbackPalette: { background: '40 33% 96%', foreground: '25 20% 15%', primary: '140 25% 35%', accent: '25 60% 55%' } },
};

export interface ArtDirectionFamilyEntry {
  primaryFamily: ThemeFamilyId;
  secondaryFamilies: readonly ThemeFamilyId[];
  experiences: readonly WizardExperiencePreference[];
}

const STD: readonly WizardExperiencePreference[] = ['standard', 'motion-rich'];
const ALL: readonly WizardExperiencePreference[] = ['standard', 'motion-rich', 'immersive'];

/** Every released pack declares its family membership exactly once. */
export const ART_DIRECTION_FAMILY_REGISTRY: Record<ArtDirectionPackId, ArtDirectionFamilyEntry> = {
  'editorial-noir': { primaryFamily: 'editorial', secondaryFamilies: ['minimalist'], experiences: ALL },
  'noir-atelier': { primaryFamily: 'editorial', secondaryFamilies: ['minimalist'], experiences: STD },
  'cinematic-portfolio': { primaryFamily: 'editorial', secondaryFamilies: ['bold'], experiences: ALL },
  'luxury-minimal': { primaryFamily: 'minimalist', secondaryFamilies: ['editorial'], experiences: STD },
  'soft-editorial': { primaryFamily: 'editorial', secondaryFamilies: ['modern', 'organic'], experiences: STD },
  'bold-commercial': { primaryFamily: 'bold', secondaryFamilies: ['modern'], experiences: STD },
  'glass-tech': { primaryFamily: 'modern', secondaryFamilies: ['futuristic'], experiences: ALL },
  'organic-studio': { primaryFamily: 'organic', secondaryFamilies: [], experiences: STD },
  'commerce-editorial': { primaryFamily: 'modern', secondaryFamilies: ['editorial'], experiences: ALL },
  'swiss-grid': { primaryFamily: 'minimalist', secondaryFamilies: ['modern'], experiences: STD },
  'print-serif': { primaryFamily: 'editorial', secondaryFamilies: [], experiences: STD },
  'neon-grid': { primaryFamily: 'futuristic', secondaryFamilies: ['bold'], experiences: ALL },
  'mono-terminal': { primaryFamily: 'futuristic', secondaryFamilies: ['minimalist'], experiences: STD },
  'brutalist-poster': { primaryFamily: 'bold', secondaryFamilies: [], experiences: STD },
  'warm-craft': { primaryFamily: 'organic', secondaryFamilies: ['editorial'], experiences: STD },
};

/** Legacy preset → pack ordering, most preferred first (preserved from themePresets). */
const LEGACY_PRESET_ORDER: Record<ThemeFamilyId, ArtDirectionPackId[]> = {
  modern: ['glass-tech'],
  editorial: ['editorial-noir', 'print-serif'],
  futuristic: ['glass-tech', 'neon-grid', 'mono-terminal'],
  minimalist: ['luxury-minimal', 'swiss-grid'],
  bold: ['bold-commercial', 'brutalist-poster'],
  organic: ['organic-studio', 'warm-craft'],
};

/** Industry capability: packs whose families support what the site must DO. */
export const INDUSTRY_PACK_CAPABILITY: Record<string, ArtDirectionPackId[]> = {
  portfolio: ['cinematic-portfolio', 'print-serif', 'editorial-noir', 'luxury-minimal', 'warm-craft', 'swiss-grid'],
  photography: ['cinematic-portfolio', 'editorial-noir', 'print-serif', 'luxury-minimal', 'warm-craft'],
  content: ['editorial-noir', 'print-serif', 'swiss-grid', 'soft-editorial'],
  restaurant: ['editorial-noir', 'warm-craft', 'print-serif', 'organic-studio', 'cinematic-portfolio'],
  realestate: ['luxury-minimal', 'cinematic-portfolio', 'swiss-grid', 'soft-editorial'],
  salon: ['noir-atelier', 'organic-studio', 'warm-craft', 'luxury-minimal', 'soft-editorial'],
  coaching: ['organic-studio', 'warm-craft', 'soft-editorial', 'print-serif'],
  nonprofit: ['organic-studio', 'warm-craft', 'print-serif', 'soft-editorial'],
  agency: ['soft-editorial', 'swiss-grid', 'editorial-noir', 'glass-tech', 'brutalist-poster'],
  contractor: ['bold-commercial', 'brutalist-poster', 'soft-editorial', 'swiss-grid'],
  landing: ['bold-commercial', 'brutalist-poster', 'glass-tech', 'neon-grid', 'soft-editorial'],
  saas: ['glass-tech', 'neon-grid', 'mono-terminal', 'swiss-grid', 'soft-editorial'],
  store: ['commerce-editorial', 'bold-commercial', 'soft-editorial', 'swiss-grid', 'brutalist-poster'],
  ecommerce: ['commerce-editorial', 'bold-commercial', 'soft-editorial', 'swiss-grid'],
  saved: ['soft-editorial', 'swiss-grid'],
  general: ['soft-editorial', 'swiss-grid', 'glass-tech'],
};

const INDUSTRY_CAPABILITY_ALIASES: Record<string, string> = {
  'real-estate': 'realestate', real_estate: 'realestate', 'local-service': 'contractor',
};

export function industryPackCapability(industry: string | null | undefined): ArtDirectionPackId[] | undefined {
  const key = (industry ?? '').trim().toLowerCase();
  return INDUSTRY_PACK_CAPABILITY[INDUSTRY_CAPABILITY_ALIASES[key] ?? key];
}

export function isThemeFamilyId(id: string | null | undefined): id is ThemeFamilyId {
  return Boolean(id && (THEME_FAMILY_IDS as readonly string[]).includes(id));
}

/** Packs in a family: primary members in legacy order first, then secondary members. */
export function packsForThemeFamily(family: ThemeFamilyId): ArtDirectionPackId[] {
  const ids = Object.keys(ART_DIRECTION_FAMILY_REGISTRY) as ArtDirectionPackId[];
  const primary = ids.filter((id) => ART_DIRECTION_FAMILY_REGISTRY[id].primaryFamily === family);
  const secondary = ids.filter((id) => ART_DIRECTION_FAMILY_REGISTRY[id].secondaryFamilies.includes(family));
  const ordered = [...LEGACY_PRESET_ORDER[family], ...primary, ...secondary];
  return [...new Set(ordered)];
}

/** Families a pack belongs to (primary first). */
export function themeFamiliesForPack(id: ArtDirectionPackId): ThemeFamilyId[] {
  const entry = ART_DIRECTION_FAMILY_REGISTRY[id];
  return entry ? [entry.primaryFamily, ...entry.secondaryFamilies] : [];
}

/** Industries whose capability list includes this pack — derived, never duplicated. */
export function industryAffinitiesForPack(id: ArtDirectionPackId): string[] {
  return Object.entries(INDUSTRY_PACK_CAPABILITY).filter(([, packs]) => packs.includes(id)).map(([industry]) => industry);
}

export function familyDefaultPack(family: ThemeFamilyId): ArtDirectionPackId {
  return packsForThemeFamily(family)[0];
}
