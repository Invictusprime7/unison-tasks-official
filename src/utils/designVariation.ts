/**
 * Design Variation Generator — Canonical Theme-Aware
 *
 * Delegates to the canonical theme registry for deterministic design profiles.
 * When no theme is selected, falls back to the 'modern' profile.
 */

import { getCanonicalTheme, type DesignProfile } from '@/themes/canonical';

// Re-export the DesignProfile as DesignVariation for backward compat
export type DesignVariation = DesignProfile;

/**
 * Generate a design variation.
 * If a themeId is provided, returns the deterministic profile for that aesthetic.
 * Falls back to 'modern' for unknown/missing themes (no more random generation).
 */
export function generateDesignVariation(themeId?: string): DesignVariation {
  return getCanonicalTheme(themeId || 'modern').profile;
}

/**
 * Get CSS design system directive for a theme.
 * Returns the theme-specific CSS patterns + animation keyframes.
 */
export function getThemeCSSDirective(themeId: string): string {
  const theme = getCanonicalTheme(themeId);
  return `${theme.cssDirective}\n\n/* THEME ANIMATIONS */\n${theme.animations.keyframes}`;
}

/**
 * Pick a font pairing from the theme's canonical typography.
 */
export function randomFontPairing(currentHeading?: string): { heading: string; body: string } {
  // Use curated pairings that complement each theme
  const FONT_PAIRINGS = [
    { heading: 'Plus Jakarta Sans', body: 'Inter' },
    { heading: 'Space Grotesk', body: 'DM Sans' },
    { heading: 'Manrope', body: 'Inter' },
    { heading: 'Outfit', body: 'Nunito' },
    { heading: 'Sora', body: 'Inter' },
    { heading: 'Playfair Display', body: 'Source Sans 3' },
    { heading: 'Montserrat', body: 'Open Sans' },
    { heading: 'Raleway', body: 'Lato' },
  ];

  const candidates = currentHeading
    ? FONT_PAIRINGS.filter(p => p.heading !== currentHeading)
    : FONT_PAIRINGS;
  return candidates[Math.floor(Math.random() * candidates.length)] || FONT_PAIRINGS[0];
}
