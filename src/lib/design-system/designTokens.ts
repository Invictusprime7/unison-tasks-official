/**
 * Modern Design Tokens Architecture
 * Professional design system with fluid typography, modular spacing, and elevation
 */

import {
  ColorScale,
  SemanticColors,
  SurfaceColors,
  generateColorScale,
  generateSemanticColors,
  generateSurfaceColors,
  getBrandPersonalityColor,
  type BrandPersonality,
} from './colorTheory';

/**
 * Fluid Typography Scale with responsive sizing
 */
export interface FluidTypographyScale {
  xs: { min: number; max: number; clamp: string };
  sm: { min: number; max: number; clamp: string };
  base: { min: number; max: number; clamp: string };
  lg: { min: number; max: number; clamp: string };
  xl: { min: number; max: number; clamp: string };
  '2xl': { min: number; max: number; clamp: string };
  '3xl': { min: number; max: number; clamp: string };
  '4xl': { min: number; max: number; clamp: string };
  '5xl': { min: number; max: number; clamp: string };
  '6xl': { min: number; max: number; clamp: string };
  '7xl': { min: number; max: number; clamp: string };
  '8xl': { min: number; max: number; clamp: string };
  '9xl': { min: number; max: number; clamp: string };
}

/**
 * Font Family System with proper fallbacks
 */
export interface FontFamilySystem {
  heading: string;
  body: string;
  mono: string;
  serif: string;
}

/**
 * Font Weight Scale with semantic names
 */
export interface FontWeightScale {
  thin: number;
  extralight: number;
  light: number;
  normal: number;
  medium: number;
  semibold: number;
  bold: number;
  extrabold: number;
  black: number;
}

/**
 * Line Height Scale optimized for readability
 */
export interface LineHeightScale {
  none: number;
  tight: number;
  snug: number;
  normal: number;
  relaxed: number;
  loose: number;
}

/**
 * Modular Scale based on golden ratio (1.618)
 */
export interface ModularScale {
  '3xs': number;
  '2xs': number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
  '4xl': number;
  '5xl': number;
  '6xl': number;
}

/**
 * Semantic Spacing with consistent ratios
 */
export interface SemanticSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
}

/**
 * Material Design 3.0 Elevation System
 */
export interface ElevationSystem {
  none: string;
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
}

/**
 * Focus States for accessibility
 */
export interface FocusStates {
  default: string;
  primary: string;
  error: string;
  success: string;
}

/**
 * Colored Shadows with brand awareness
 */
export interface ColoredShadows {
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
}

/**
 * Brand Colors generated from personality
 */
export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
  muted: string;
}

/**
 * Complete Professional Design System
 */
export interface ProfessionalDesignSystem {
  colors: {
    primary: ColorScale;
    semantic: SemanticColors;
    surface: SurfaceColors;
    brand: BrandColors;
  };
  typography: {
    scales: FluidTypographyScale;
    families: FontFamilySystem;
    weights: FontWeightScale;
    lineHeights: LineHeightScale;
  };
  spacing: {
    scale: ModularScale;
    semantic: SemanticSpacing;
  };
  shadows: {
    elevation: ElevationSystem;
    focused: FocusStates;
    colored: ColoredShadows;
  };
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    full: string;
  };
  animation: {
    duration: {
      fast: string;
      normal: string;
      slow: string;
    };
    easing: {
      default: string;
      in: string;
      out: string;
      inOut: string;
    };
  };
}

/**
 * Generate fluid typography scale with responsive sizing
 */
export function generateFluidTypography(): FluidTypographyScale {
  const createFluidSize = (minSize: number, maxSize: number, minVw = 320, maxVw = 1280) => {
    const slope = (maxSize - minSize) / (maxVw - minVw);
    const yAxisIntersection = -minVw * slope + minSize;
    const clamp = `clamp(${minSize}px, ${yAxisIntersection.toFixed(4)}px + ${(slope * 100).toFixed(4)}vw, ${maxSize}px)`;
    return { min: minSize, max: maxSize, clamp };
  };

  return {
    xs: createFluidSize(10, 12),
    sm: createFluidSize(12, 14),
    base: createFluidSize(14, 16),
    lg: createFluidSize(16, 18),
    xl: createFluidSize(18, 20),
    '2xl': createFluidSize(20, 24),
    '3xl': createFluidSize(24, 30),
    '4xl': createFluidSize(30, 36),
    '5xl': createFluidSize(36, 48),
    '6xl': createFluidSize(48, 60),
    '7xl': createFluidSize(60, 72),
    '8xl': createFluidSize(72, 96),
    '9xl': createFluidSize(96, 128),
  };
}

/**
 * Generate font family system with proper fallbacks
 */
export function generateFontFamilies(): FontFamilySystem {
  return {
    heading: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"Fira Code", "SF Mono", Monaco, Inconsolata, "Roboto Mono", "Source Code Pro", monospace',
    serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
  };
}

/**
 * Generate font weight scale
 */
export function generateFontWeights(): FontWeightScale {
  return {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  };
}

/**
 * Generate line height scale
 */
export function generateLineHeights(): LineHeightScale {
  return {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  };
}

/**
 * Generate modular scale based on golden ratio
 */
export function generateModularScale(base = 16): ModularScale {
  const ratio = 1.618; // Golden ratio
  
  return {
    '3xs': Math.round((base / Math.pow(ratio, 3)) * 100) / 100,
    '2xs': Math.round((base / Math.pow(ratio, 2)) * 100) / 100,
    xs: Math.round((base / ratio) * 100) / 100,
    sm: Math.round((base / 1.25) * 100) / 100,
    md: base,
    lg: Math.round((base * 1.25) * 100) / 100,
    xl: Math.round((base * ratio) * 100) / 100,
    '2xl': Math.round((base * Math.pow(ratio, 2)) * 100) / 100,
    '3xl': Math.round((base * Math.pow(ratio, 3)) * 100) / 100,
    '4xl': Math.round((base * Math.pow(ratio, 4)) * 100) / 100,
    '5xl': Math.round((base * Math.pow(ratio, 5)) * 100) / 100,
    '6xl': Math.round((base * Math.pow(ratio, 6)) * 100) / 100,
  };
}

/**
 * Generate semantic spacing
 */
export function generateSemanticSpacing(): SemanticSpacing {
  return {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '6rem',   // 96px
  };
}

/**
 * Generate Material Design 3.0 elevation system
 */
export function generateElevationSystem(): ElevationSystem {
  return {
    none: 'none',
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
  };
}

/**
 * Generate focus states for accessibility
 */
export function generateFocusStates(primaryColor: string): FocusStates {
  return {
    default: `0 0 0 3px ${primaryColor}40`,
    primary: `0 0 0 3px ${primaryColor}60`,
    error: '0 0 0 3px rgba(239, 68, 68, 0.4)',
    success: '0 0 0 3px rgba(16, 185, 129, 0.4)',
  };
}

/**
 * Generate colored shadows with brand awareness
 */
export function generateColoredShadows(primaryColor: string, accentColor: string): ColoredShadows {
  return {
    primary: `0 10px 40px -10px ${primaryColor}50`,
    secondary: `0 10px 40px -10px rgba(139, 92, 246, 0.3)`,
    accent: `0 10px 40px -10px ${accentColor}50`,
    glow: `0 0 20px ${primaryColor}30, 0 0 40px ${primaryColor}20`,
  };
}

/**
 * Generate brand colors from personality
 */
export function generateBrandColors(personality: BrandPersonality): BrandColors {
  const primary = getBrandPersonalityColor(personality);
  const scale = generateColorScale(primary);
  
  return {
    primary: scale[500],
    secondary: scale[600],
    accent: scale[400],
    muted: scale[200],
  };
}

/**
 * Create complete professional design system
 */
export function createProfessionalDesignSystem(
  brandPersonality: BrandPersonality,
  baseBackground = '#FFFFFF'
): ProfessionalDesignSystem {
  const brandColors = generateBrandColors(brandPersonality);
  const primaryScale = generateColorScale(brandColors.primary);
  const semanticColors = generateSemanticColors(baseBackground);
  const surfaceColors = generateSurfaceColors(baseBackground);

  return {
    colors: {
      primary: primaryScale,
      semantic: semanticColors,
      surface: surfaceColors,
      brand: brandColors,
    },
    typography: {
      scales: generateFluidTypography(),
      families: generateFontFamilies(),
      weights: generateFontWeights(),
      lineHeights: generateLineHeights(),
    },
    spacing: {
      scale: generateModularScale(),
      semantic: generateSemanticSpacing(),
    },
    shadows: {
      elevation: generateElevationSystem(),
      focused: generateFocusStates(brandColors.primary),
      colored: generateColoredShadows(brandColors.primary, brandColors.accent),
    },
    borderRadius: {
      none: '0',
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      '2xl': '1rem',
      '3xl': '1.5rem',
      full: '9999px',
    },
    animation: {
      duration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
      },
      easing: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        in: 'cubic-bezier(0.4, 0, 1, 1)',
        out: 'cubic-bezier(0, 0, 0.2, 1)',
        inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  };
}

/**
 * Convert design tokens to CSS custom properties
 */
export function designTokensToCSS(tokens: ProfessionalDesignSystem): string {
  const cssVars: string[] = [':root {'];

  // Colors
  Object.entries(tokens.colors.primary).forEach(([key, value]) => {
    cssVars.push(`  --color-primary-${key}: ${value};`);
  });

  // Semantic colors
  Object.entries(tokens.colors.semantic).forEach(([category, shades]) => {
    Object.entries(shades).forEach(([shade, value]) => {
      cssVars.push(`  --color-${category}-${shade}: ${value};`);
    });
  });

  // Surface colors
  Object.entries(tokens.colors.surface).forEach(([key, value]) => {
    cssVars.push(`  --color-surface-${key}: ${value};`);
  });

  // Typography
  cssVars.push(`  --font-heading: ${tokens.typography.families.heading};`);
  cssVars.push(`  --font-body: ${tokens.typography.families.body};`);
  cssVars.push(`  --font-mono: ${tokens.typography.families.mono};`);

  // Spacing
  Object.entries(tokens.spacing.semantic).forEach(([key, value]) => {
    cssVars.push(`  --spacing-${key}: ${value};`);
  });

  // Shadows
  Object.entries(tokens.shadows.elevation).forEach(([key, value]) => {
    cssVars.push(`  --shadow-${key}: ${value};`);
  });

  // Border radius
  Object.entries(tokens.borderRadius).forEach(([key, value]) => {
    cssVars.push(`  --radius-${key}: ${value};`);
  });

  cssVars.push('}');
  return cssVars.join('\n');
}
