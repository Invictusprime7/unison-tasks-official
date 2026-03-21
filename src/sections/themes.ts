/**
 * Theme Tokens & Registry — DEPRECATED
 * Re-exports from the canonical theme system for backward compatibility.
 * New code should import from '@/themes' or '@/themes/canonical'.
 */

export type { ThemeTokens } from '@/themes/canonical';
import { CANONICAL_THEMES, getCanonicalTheme } from '@/themes/canonical';
import type { ThemeTokens } from '@/themes/canonical';

// Build backward-compatible registry from canonical themes
export const THEME_REGISTRY: Record<string, ThemeTokens> = Object.fromEntries(
  Object.entries(CANONICAL_THEMES).map(([id, t]) => [id, t.tokens])
);

// Legacy alias
export const THEME_MINIMAL_LIGHT = CANONICAL_THEMES.modern.tokens;
export const THEME_MODERN = CANONICAL_THEMES.modern.tokens;
export const THEME_EDITORIAL = CANONICAL_THEMES.editorial.tokens;
export const THEME_FUTURISTIC = CANONICAL_THEMES.futuristic.tokens;
export const THEME_MINIMALIST = CANONICAL_THEMES.minimalist.tokens;
export const THEME_BOLD = CANONICAL_THEMES.bold.tokens;
export const THEME_ORGANIC = CANONICAL_THEMES.organic.tokens;

/**
 * Resolve a ThemeTokens by preset id.
 */
export const getTheme = (id: string): ThemeTokens => {
  return getCanonicalTheme(id).tokens;
};

// REMOVED: randomizeThemeColors — deterministic themes only
