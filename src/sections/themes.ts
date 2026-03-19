/**
 * Theme Presets — Full deterministic design tokens for all aesthetics
 *
 * Each preset maps 1-to-1 with the ThemePreset ids in themePresets.ts so the
 * System Launcher can resolve a structured ThemeTokens object without any AI
 * rewrite pass.  The `getTheme()` helper resolves by preset id.
 */

import type { ThemeTokens } from './types';

// ============================================================================
// Minimal-light (legacy baseline — kept for backward compat, no longer default)
// ============================================================================

export const THEME_MINIMAL_LIGHT: ThemeTokens = {
  colors: {
    primary: '220 14% 20%',
    primaryForeground: '0 0% 100%',
    secondary: '220 10% 40%',
    secondaryForeground: '0 0% 100%',
    accent: '220 14% 20%',
    accentForeground: '0 0% 100%',
    background: '0 0% 99%',
    foreground: '220 14% 10%',
    muted: '220 5% 96%',
    mutedForeground: '220 5% 46%',
    card: '0 0% 100%',
    cardForeground: '220 14% 10%',
    border: '220 5% 90%',
  },
  typography: {
    headingFont: "'Inter', sans-serif",
    bodyFont: "'Inter', sans-serif",
    headingWeight: '600',
    bodyWeight: '400',
  },
  radius: '0.5rem',
  sectionPadding: '5rem 1.5rem',
  containerWidth: '1100px',
};

// ============================================================================
// Modern — vibrant gradients, contemporary energy
// ============================================================================

export const THEME_MODERN: ThemeTokens = {
  colors: {
    primary: '217 91% 60%',           // #3B82F6
    primaryForeground: '210 40% 98%',
    secondary: '258 90% 66%',         // #8B5CF6
    secondaryForeground: '210 40% 98%',
    accent: '217 91% 60%',
    accentForeground: '210 40% 98%',
    background: '222 47% 11%',        // #0F172A
    foreground: '210 40% 98%',        // #F8FAFC
    muted: '217 33% 17%',
    mutedForeground: '215 20% 65%',
    card: '222 47% 15%',
    cardForeground: '210 40% 98%',
    border: '217 33% 25%',
  },
  typography: {
    headingFont: "'Inter', sans-serif",
    bodyFont: "'DM Sans', sans-serif",
    headingWeight: '700',
    bodyWeight: '400',
  },
  radius: '0.75rem',
  sectionPadding: '5rem 1.5rem',
  containerWidth: '1200px',
};

// ============================================================================
// Editorial — refined serifs, magazine feel
// ============================================================================

export const THEME_EDITORIAL: ThemeTokens = {
  colors: {
    primary: '33 30% 44%',            // #8B7355
    primaryForeground: '0 0% 100%',
    secondary: '33 30% 64%',          // #C4A882
    secondaryForeground: '0 0% 100%',
    accent: '33 30% 44%',
    accentForeground: '0 0% 100%',
    background: '40 33% 98%',         // #FDFCFA
    foreground: '0 0% 10%',           // #1A1A1A
    muted: '40 20% 95%',
    mutedForeground: '0 0% 40%',
    card: '0 0% 100%',
    cardForeground: '0 0% 10%',
    border: '40 15% 88%',
  },
  typography: {
    headingFont: "'Playfair Display', serif",
    bodyFont: "'Source Serif 4', serif",
    headingWeight: '700',
    bodyWeight: '400',
  },
  radius: '0.25rem',
  sectionPadding: '5rem 1.5rem',
  containerWidth: '1100px',
};

// ============================================================================
// Futuristic — neon glow, dark panels, sci-fi atmosphere
// ============================================================================

export const THEME_FUTURISTIC: ThemeTokens = {
  colors: {
    primary: '183 100% 50%',          // #00F0FF cyan
    primaryForeground: '240 20% 6%',
    secondary: '300 100% 50%',        // #FF00FF magenta
    secondaryForeground: '0 0% 100%',
    accent: '183 100% 50%',
    accentForeground: '240 20% 6%',
    background: '240 33% 6%',         // #0A0A14
    foreground: '240 100% 94%',       // #E0E0FF
    muted: '240 20% 12%',
    mutedForeground: '240 20% 60%',
    card: '240 25% 10%',
    cardForeground: '240 100% 94%',
    border: '240 20% 20%',
  },
  typography: {
    headingFont: "'Space Grotesk', sans-serif",
    bodyFont: "'JetBrains Mono', monospace",
    headingWeight: '700',
    bodyWeight: '400',
  },
  radius: '0.5rem',
  sectionPadding: '5rem 1.5rem',
  containerWidth: '1200px',
};

// ============================================================================
// Minimalist — maximum whitespace, monochrome precision
// ============================================================================

export const THEME_MINIMALIST: ThemeTokens = {
  colors: {
    primary: '0 0% 33%',              // #555555
    primaryForeground: '0 0% 100%',
    secondary: '0 0% 60%',            // #999999
    secondaryForeground: '0 0% 100%',
    accent: '0 0% 33%',
    accentForeground: '0 0% 100%',
    background: '0 0% 100%',          // #FFFFFF
    foreground: '0 0% 7%',            // #111111
    muted: '0 0% 97%',
    mutedForeground: '0 0% 45%',
    card: '0 0% 100%',
    cardForeground: '0 0% 7%',
    border: '0 0% 90%',
  },
  typography: {
    headingFont: "'Inter', sans-serif",
    bodyFont: "'Inter', sans-serif",
    headingWeight: '400',
    bodyWeight: '300',
  },
  radius: '0rem',
  sectionPadding: '6rem 1.5rem',
  containerWidth: '1000px',
};

// ============================================================================
// Bold — oversized type, high contrast, raw power
// ============================================================================

export const THEME_BOLD: ThemeTokens = {
  colors: {
    primary: '0 100% 60%',            // #FF3333
    primaryForeground: '0 0% 100%',
    secondary: '16 100% 60%',         // #FF6633
    secondaryForeground: '0 0% 100%',
    accent: '0 100% 60%',
    accentForeground: '0 0% 100%',
    background: '0 0% 0%',            // #000000
    foreground: '0 0% 100%',          // #FFFFFF
    muted: '0 0% 8%',
    mutedForeground: '0 0% 65%',
    card: '0 0% 6%',
    cardForeground: '0 0% 100%',
    border: '0 0% 18%',
  },
  typography: {
    headingFont: "'Space Grotesk', sans-serif",
    bodyFont: "'Inter', sans-serif",
    headingWeight: '900',
    bodyWeight: '400',
  },
  radius: '0rem',
  sectionPadding: '5rem 1.5rem',
  containerWidth: '1200px',
};

// ============================================================================
// Organic — warm earth tones, soft shapes, natural comfort
// ============================================================================

export const THEME_ORGANIC: ThemeTokens = {
  colors: {
    primary: '21 56% 51%',            // #C4703F terracotta
    primaryForeground: '0 0% 100%',
    secondary: '100 24% 49%',         // #7C9A5E sage
    secondaryForeground: '0 0% 100%',
    accent: '21 56% 51%',
    accentForeground: '0 0% 100%',
    background: '30 38% 95%',         // #FAF5F0 warm cream
    foreground: '30 25% 13%',         // #2D2418
    muted: '30 25% 91%',
    mutedForeground: '30 10% 40%',
    card: '0 0% 100%',
    cardForeground: '30 25% 13%',
    border: '30 15% 85%',
  },
  typography: {
    headingFont: "'Libre Baskerville', serif",
    bodyFont: "'Nunito', sans-serif",
    headingWeight: '700',
    bodyWeight: '400',
  },
  radius: '1rem',
  sectionPadding: '5rem 1.5rem',
  containerWidth: '1100px',
};

// ============================================================================
// Theme Registry — keyed by ThemePreset.id from themePresets.ts
// ============================================================================

export const THEME_REGISTRY: Record<string, ThemeTokens> = {
  'minimal-light': THEME_MINIMAL_LIGHT,
  'modern': THEME_MODERN,
  'editorial': THEME_EDITORIAL,
  'futuristic': THEME_FUTURISTIC,
  'minimalist': THEME_MINIMALIST,
  'bold': THEME_BOLD,
  'organic': THEME_ORGANIC,
};

/**
 * Resolve a ThemeTokens by preset id.
 * Returns the first non-minimal theme (modern) when id is unknown,
 * so the system never silently falls back to the old minimal default.
 */
export const getTheme = (id: string): ThemeTokens => {
  return THEME_REGISTRY[id] || THEME_MODERN;
};

/**
 * Randomize theme accent colors within the palette family.
 * Applies a consistent hue shift (±20°) and slight saturation jitter (±5%)
 * to primary / secondary / accent while keeping structural colors
 * (background, foreground, card, muted, border) stable. This ensures every
 * new generation feels fresh without breaking the theme's overall mood.
 */
export function randomizeThemeColors(base: ThemeTokens): ThemeTokens {
  const hueShift = Math.round((Math.random() - 0.5) * 40); // ±20°

  function shiftAccent(hsl: string): string {
    const m = hsl.match(/^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/);
    if (!m) return hsl;
    const h = ((parseFloat(m[1]) + hueShift) % 360 + 360) % 360;
    const s = Math.max(0, Math.min(100, parseFloat(m[2]) + (Math.random() - 0.5) * 10));
    return `${Math.round(h)} ${Math.round(s)}% ${m[3]}%`;
  }

  return {
    ...base,
    colors: {
      ...base.colors,
      primary: shiftAccent(base.colors.primary),
      secondary: shiftAccent(base.colors.secondary),
      accent: shiftAccent(base.colors.accent),
    },
  };
}
