/**
 * Theme Presets — Design token presets for template themes
 */

import type { ThemeTokens } from './types';

// ============================================================================
// Base Themes
// ============================================================================

export const THEME_DARK_LUXURY: ThemeTokens = {
  colors: {
    primary: '330 80% 60%',       // Pink
    primaryForeground: '0 0% 100%',
    secondary: '270 60% 60%',     // Purple
    secondaryForeground: '0 0% 100%',
    accent: '330 70% 70%',
    accentForeground: '0 0% 100%',
    background: '220 20% 6%',     // Near-black
    foreground: '210 10% 93%',    // Light gray
    muted: '220 15% 15%',
    mutedForeground: '215 15% 60%',
    card: '220 15% 10%',
    cardForeground: '210 10% 93%',
    border: '220 15% 18%',
  },
  typography: {
    headingFont: "'Playfair Display', serif",
    bodyFont: "'Inter', sans-serif",
    headingWeight: '700',
    bodyWeight: '400',
  },
  radius: '0.75rem',
  sectionPadding: '5rem 1rem',
  containerWidth: '1200px',
};

export const THEME_LIGHT_WELLNESS: ThemeTokens = {
  colors: {
    primary: '330 60% 55%',
    primaryForeground: '0 0% 100%',
    secondary: '25 70% 60%',
    secondaryForeground: '0 0% 100%',
    accent: '330 50% 65%',
    accentForeground: '20 15% 20%',
    background: '20 30% 98%',
    foreground: '20 20% 20%',
    muted: '20 20% 94%',
    mutedForeground: '20 10% 45%',
    card: '0 0% 100%',
    cardForeground: '20 20% 20%',
    border: '20 20% 90%',
  },
  typography: {
    headingFont: "'Cormorant Garamond', serif",
    bodyFont: "'Lora', serif",
    headingWeight: '600',
    bodyWeight: '400',
  },
  radius: '1rem',
  sectionPadding: '5rem 1rem',
  containerWidth: '1200px',
};

export const THEME_BOLD_EDITORIAL: ThemeTokens = {
  colors: {
    primary: '350 90% 55%',
    primaryForeground: '0 0% 100%',
    secondary: '45 100% 55%',
    secondaryForeground: '0 0% 10%',
    accent: '350 80% 60%',
    accentForeground: '0 0% 100%',
    background: '0 0% 4%',
    foreground: '0 0% 96%',
    muted: '0 0% 12%',
    mutedForeground: '0 0% 55%',
    card: '0 0% 8%',
    cardForeground: '0 0% 96%',
    border: '0 0% 16%',
  },
  typography: {
    headingFont: "'Bebas Neue', sans-serif",
    bodyFont: "'Inter', sans-serif",
    headingWeight: '400',
    bodyWeight: '400',
  },
  radius: '0.25rem',
  sectionPadding: '6rem 1rem',
  containerWidth: '1200px',
};

export const THEME_RESTAURANT_WARM: ThemeTokens = {
  colors: {
    primary: '25 80% 50%',       // Warm amber
    primaryForeground: '0 0% 100%',
    secondary: '45 70% 50%',
    secondaryForeground: '0 0% 10%',
    accent: '15 90% 55%',
    accentForeground: '0 0% 100%',
    background: '30 15% 6%',
    foreground: '35 15% 90%',
    muted: '30 10% 12%',
    mutedForeground: '30 10% 55%',
    card: '30 10% 10%',
    cardForeground: '35 15% 90%',
    border: '30 10% 18%',
  },
  typography: {
    headingFont: "'Playfair Display', serif",
    bodyFont: "'Inter', sans-serif",
    headingWeight: '700',
    bodyWeight: '400',
  },
  radius: '0.5rem',
  sectionPadding: '5rem 1rem',
  containerWidth: '1200px',
};

export const THEME_CONTRACTOR_PRO: ThemeTokens = {
  colors: {
    primary: '200 90% 45%',      // Blue
    primaryForeground: '0 0% 100%',
    secondary: '160 60% 45%',    // Teal
    secondaryForeground: '0 0% 100%',
    accent: '45 90% 55%',        // Yellow accent
    accentForeground: '0 0% 10%',
    background: '210 15% 7%',
    foreground: '210 10% 92%',
    muted: '210 10% 14%',
    mutedForeground: '210 8% 55%',
    card: '210 10% 11%',
    cardForeground: '210 10% 92%',
    border: '210 10% 20%',
  },
  typography: {
    headingFont: "'Inter', sans-serif",
    bodyFont: "'Inter', sans-serif",
    headingWeight: '800',
    bodyWeight: '400',
  },
  radius: '0.5rem',
  sectionPadding: '5rem 1rem',
  containerWidth: '1200px',
};

export const THEME_PORTFOLIO_MINIMAL: ThemeTokens = {
  colors: {
    primary: '0 0% 10%',
    primaryForeground: '0 0% 98%',
    secondary: '0 0% 40%',
    secondaryForeground: '0 0% 100%',
    accent: '45 80% 55%',
    accentForeground: '0 0% 10%',
    background: '0 0% 98%',
    foreground: '0 0% 10%',
    muted: '0 0% 94%',
    mutedForeground: '0 0% 45%',
    card: '0 0% 100%',
    cardForeground: '0 0% 10%',
    border: '0 0% 90%',
  },
  typography: {
    headingFont: "'Space Grotesk', sans-serif",
    bodyFont: "'Inter', sans-serif",
    headingWeight: '700',
    bodyWeight: '400',
  },
  radius: '0.5rem',
  sectionPadding: '6rem 1.5rem',
  containerWidth: '1100px',
};

export const THEME_ECOMMERCE_MODERN: ThemeTokens = {
  colors: {
    primary: '160 70% 40%',       // Emerald
    primaryForeground: '0 0% 100%',
    secondary: '220 60% 50%',
    secondaryForeground: '0 0% 100%',
    accent: '45 90% 55%',
    accentForeground: '0 0% 10%',
    background: '0 0% 100%',
    foreground: '220 15% 15%',
    muted: '220 10% 95%',
    mutedForeground: '220 10% 45%',
    card: '0 0% 100%',
    cardForeground: '220 15% 15%',
    border: '220 10% 90%',
  },
  typography: {
    headingFont: "'Inter', sans-serif",
    bodyFont: "'Inter', sans-serif",
    headingWeight: '700',
    bodyWeight: '400',
  },
  radius: '0.75rem',
  sectionPadding: '4rem 1rem',
  containerWidth: '1280px',
};

// ============================================================================
// Theme Lookup
// ============================================================================

export const THEME_REGISTRY: Record<string, ThemeTokens> = {
  'dark-luxury': THEME_DARK_LUXURY,
  'light-wellness': THEME_LIGHT_WELLNESS,
  'bold-editorial': THEME_BOLD_EDITORIAL,
  'restaurant-warm': THEME_RESTAURANT_WARM,
  'contractor-pro': THEME_CONTRACTOR_PRO,
  'portfolio-minimal': THEME_PORTFOLIO_MINIMAL,
  'ecommerce-modern': THEME_ECOMMERCE_MODERN,
};

export const getTheme = (id: string): ThemeTokens => {
  return THEME_REGISTRY[id] || THEME_DARK_LUXURY;
};
