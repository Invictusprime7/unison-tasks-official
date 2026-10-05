/**
 * Client Brand contract — POST-COMPOSITION only.
 * Brand owns semantic colour values, compatible font families, logo, imagery
 * and content. It never owns composition, geometry, rhythm or variant choice,
 * so applying it can never change the sealed Art Direction Pack or a variant.
 */
import { ART_DIRECTION_PACKS, buildArtDirectionTokens, type ArtDirectionPackId } from './art-direction';

export type BrandColorRole = 'background' | 'foreground' | 'primary' | 'primaryForeground' | 'secondary' | 'accent' | 'muted' | 'border';

export interface UnisonBrandOverrides {
  /** HSL triplets, e.g. "7 72% 51%". */
  colors?: Partial<Record<BrandColorRole, string>>;
  fonts?: { display?: string; body?: string };
  logo?: { src: string; alt: string };
  imagery?: readonly string[];
}

const COLOR_VAR: Record<BrandColorRole, string> = {
  background: '--background', foreground: '--foreground', primary: '--primary', primaryForeground: '--primary-foreground',
  secondary: '--secondary', accent: '--accent', muted: '--muted', border: '--border',
};

export interface BrandedTokenSet {
  /** Echoed, never re-derived. */
  artDirectionPackId: ArtDirectionPackId;
  tokens: Record<string, string>;
}

/** Pack tokens + brand semantic tokens. Pack identity is passed through untouched. */
export function applyBrandTokens(packId: ArtDirectionPackId, brand?: UnisonBrandOverrides): BrandedTokenSet {
  const pack = ART_DIRECTION_PACKS[packId];
  const tokens = { ...buildArtDirectionTokens(pack) };
  for (const [role, value] of Object.entries(brand?.colors ?? {})) {
    if (value) tokens[COLOR_VAR[role as BrandColorRole]] = value;
  }
  // Brand fonts are accepted while the pack's stack stays as the fallback, so
  // typography behaviour (weight, scale, tracking) remains pack-owned.
  if (brand?.fonts?.display) tokens['--ut-font-display'] = `${brand.fonts.display}, ${pack.signature.typography.displayStack}`;
  if (brand?.fonts?.body) tokens['--ut-font-sans'] = `${brand.fonts.body}, ${pack.signature.typography.bodyStack}`;
  return { artDirectionPackId: packId, tokens };
}
