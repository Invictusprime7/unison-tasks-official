/**
 * Design Token Presets
 * Curated design tokens following design system best practices
 * Reference: designsystem.digital.gov
 */

import type { DesignTheme, ColorToken, TypographyToken, SpacingToken, RadiusToken, ShadowToken } from '@/types/designSystem';

// ==================== COLOR PALETTES ====================

const neutralColors: ColorToken[] = [
  { name: 'neutral', value: '#FAFAFA', shade: 50 },
  { name: 'neutral', value: '#F5F5F5', shade: 100 },
  { name: 'neutral', value: '#E5E5E5', shade: 200 },
  { name: 'neutral', value: '#D4D4D4', shade: 300 },
  { name: 'neutral', value: '#A3A3A3', shade: 400 },
  { name: 'neutral', value: '#737373', shade: 500 },
  { name: 'neutral', value: '#525252', shade: 600 },
  { name: 'neutral', value: '#404040', shade: 700 },
  { name: 'neutral', value: '#262626', shade: 800 },
  { name: 'neutral', value: '#171717', shade: 900 },
];

const primaryBlue: ColorToken[] = [
  { name: 'primary', value: '#EFF6FF', shade: 50 },
  { name: 'primary', value: '#DBEAFE', shade: 100 },
  { name: 'primary', value: '#BFDBFE', shade: 200 },
  { name: 'primary', value: '#93C5FD', shade: 300 },
  { name: 'primary', value: '#60A5FA', shade: 400 },
  { name: 'primary', value: '#3B82F6', shade: 500 },
  { name: 'primary', value: '#2563EB', shade: 600 },
  { name: 'primary', value: '#1D4ED8', shade: 700 },
  { name: 'primary', value: '#1E40AF', shade: 800 },
  { name: 'primary', value: '#1E3A8A', shade: 900 },
];

const primaryPurple: ColorToken[] = [
  { name: 'primary', value: '#FAF5FF', shade: 50 },
  { name: 'primary', value: '#F3E8FF', shade: 100 },
  { name: 'primary', value: '#E9D5FF', shade: 200 },
  { name: 'primary', value: '#D8B4FE', shade: 300 },
  { name: 'primary', value: '#C084FC', shade: 400 },
  { name: 'primary', value: '#A855F7', shade: 500 },
  { name: 'primary', value: '#9333EA', shade: 600 },
  { name: 'primary', value: '#7E22CE', shade: 700 },
  { name: 'primary', value: '#6B21A8', shade: 800 },
  { name: 'primary', value: '#581C87', shade: 900 },
];

const secondaryTeal: ColorToken[] = [
  { name: 'secondary', value: '#F0FDFA', shade: 50 },
  { name: 'secondary', value: '#CCFBF1', shade: 100 },
  { name: 'secondary', value: '#99F6E4', shade: 200 },
  { name: 'secondary', value: '#5EEAD4', shade: 300 },
  { name: 'secondary', value: '#2DD4BF', shade: 400 },
  { name: 'secondary', value: '#14B8A6', shade: 500 },
  { name: 'secondary', value: '#0D9488', shade: 600 },
  { name: 'secondary', value: '#0F766E', shade: 700 },
  { name: 'secondary', value: '#115E59', shade: 800 },
  { name: 'secondary', value: '#134E4A', shade: 900 },
];

const successGreen: ColorToken[] = [
  { name: 'success', value: '#F0FDF4', shade: 50 },
  { name: 'success', value: '#DCFCE7', shade: 100 },
  { name: 'success', value: '#BBF7D0', shade: 200 },
  { name: 'success', value: '#86EFAC', shade: 300 },
  { name: 'success', value: '#4ADE80', shade: 400 },
  { name: 'success', value: '#22C55E', shade: 500 },
  { name: 'success', value: '#16A34A', shade: 600 },
  { name: 'success', value: '#15803D', shade: 700 },
  { name: 'success', value: '#166534', shade: 800 },
  { name: 'success', value: '#14532D', shade: 900 },
];

const warningYellow: ColorToken[] = [
  { name: 'warning', value: '#FEFCE8', shade: 50 },
  { name: 'warning', value: '#FEF9C3', shade: 100 },
  { name: 'warning', value: '#FEF08A', shade: 200 },
  { name: 'warning', value: '#FDE047', shade: 300 },
  { name: 'warning', value: '#FACC15', shade: 400 },
  { name: 'warning', value: '#EAB308', shade: 500 },
  { name: 'warning', value: '#CA8A04', shade: 600 },
  { name: 'warning', value: '#A16207', shade: 700 },
  { name: 'warning', value: '#854D0E', shade: 800 },
  { name: 'warning', value: '#713F12', shade: 900 },
];

const errorRed: ColorToken[] = [
  { name: 'error', value: '#FEF2F2', shade: 50 },
  { name: 'error', value: '#FEE2E2', shade: 100 },
  { name: 'error', value: '#FECACA', shade: 200 },
  { name: 'error', value: '#FCA5A5', shade: 300 },
  { name: 'error', value: '#F87171', shade: 400 },
  { name: 'error', value: '#EF4444', shade: 500 },
  { name: 'error', value: '#DC2626', shade: 600 },
  { name: 'error', value: '#B91C1C', shade: 700 },
  { name: 'error', value: '#991B1B', shade: 800 },
  { name: 'error', value: '#7F1D1D', shade: 900 },
];

// ==================== TYPOGRAPHY TOKENS ====================

const typographyPresets: Record<string, TypographyToken> = {
  heading: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 48,
    weight: 700,
    lineHeight: 1.2,
    letterSpacing: -0.02,
  },
  subheading: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 32,
    weight: 600,
    lineHeight: 1.3,
    letterSpacing: -0.01,
  },
  body: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 16,
    weight: 400,
    lineHeight: 1.6,
    letterSpacing: 0,
  },
  caption: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 14,
    weight: 400,
    lineHeight: 1.5,
    letterSpacing: 0,
  },
};

// ==================== SPACING TOKENS ====================

const spacingPresets: Record<string, SpacingToken> = {
  xs: { value: 0.5, unit: 'rem' },
  sm: { value: 1, unit: 'rem' },
  md: { value: 2, unit: 'rem' },
  lg: { value: 4, unit: 'rem' },
  xl: { value: 6, unit: 'rem' },
};

// ==================== RADIUS TOKENS ====================

const radiusPresets: Record<string, RadiusToken> = {
  none: { value: 0, unit: 'px' },
  sm: { value: 4, unit: 'px' },
  md: { value: 8, unit: 'px' },
  lg: { value: 12, unit: 'px' },
  full: { value: 'full', unit: 'px' },
};

// ==================== SHADOW TOKENS ====================

const shadowPresets: Record<string, ShadowToken> = {
  none: { name: 'none', value: 'none' },
  sm: { name: 'sm', value: '0 1px 2px 0 rgb(0 0 0 / 0.05)' },
  md: { name: 'md', value: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' },
  lg: { name: 'lg', value: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' },
  xl: { name: 'xl', value: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' },
};

// ==================== THEME PRESETS ====================

export const modernLightTheme: DesignTheme = {
  name: 'Modern Light',
  description: 'Clean, professional design with blue accent',
  tokens: {
    colors: {
      primary: primaryBlue,
      secondary: secondaryTeal,
      neutral: neutralColors,
      success: successGreen,
      warning: warningYellow,
      error: errorRed,
    },
    typography: {
      heading: typographyPresets.heading,
      subheading: typographyPresets.subheading,
      body: typographyPresets.body,
      caption: typographyPresets.caption,
    },
    spacing: {
      xs: spacingPresets.xs,
      sm: spacingPresets.sm,
      md: spacingPresets.md,
      lg: spacingPresets.lg,
      xl: spacingPresets.xl,
    },
    radius: {
      none: radiusPresets.none,
      sm: radiusPresets.sm,
      md: radiusPresets.md,
      lg: radiusPresets.lg,
      full: radiusPresets.full,
    },
    shadows: {
      none: shadowPresets.none,
      sm: shadowPresets.sm,
      md: shadowPresets.md,
      lg: shadowPresets.lg,
      xl: shadowPresets.xl,
    },
  },
  mood: 'corporate',
  colorScheme: 'light',
};

export const creativePurpleTheme: DesignTheme = {
  name: 'Creative Purple',
  description: 'Bold, creative design with purple gradient',
  tokens: {
    colors: {
      primary: primaryPurple,
      secondary: primaryBlue,
      neutral: neutralColors,
      success: successGreen,
      warning: warningYellow,
      error: errorRed,
    },
    typography: {
      heading: {
        ...typographyPresets.heading,
        fontSize: 56,
        weight: 800,
      },
      subheading: typographyPresets.subheading,
      body: typographyPresets.body,
      caption: typographyPresets.caption,
    },
    spacing: {
      xs: spacingPresets.xs,
      sm: spacingPresets.sm,
      md: spacingPresets.md,
      lg: { value: 6, unit: 'rem' },
      xl: { value: 10, unit: 'rem' },
    },
    radius: {
      none: radiusPresets.none,
      sm: radiusPresets.sm,
      md: { value: 12, unit: 'px' },
      lg: { value: 16, unit: 'px' },
      full: radiusPresets.full,
    },
    shadows: {
      none: shadowPresets.none,
      sm: shadowPresets.sm,
      md: shadowPresets.md,
      lg: { name: 'lg', value: '0 20px 40px -12px rgb(0 0 0 / 0.25)' },
      xl: { name: 'xl', value: '0 30px 60px -15px rgb(0 0 0 / 0.3)' },
    },
  },
  mood: 'bold',
  colorScheme: 'light',
};

export const minimalDarkTheme: DesignTheme = {
  name: 'Minimal Dark',
  description: 'Elegant, minimal design with dark background',
  tokens: {
    colors: {
      primary: primaryBlue,
      secondary: secondaryTeal,
      neutral: [
        { name: 'neutral', value: '#171717', shade: 50 },
        { name: 'neutral', value: '#262626', shade: 100 },
        { name: 'neutral', value: '#404040', shade: 200 },
        { name: 'neutral', value: '#525252', shade: 300 },
        { name: 'neutral', value: '#737373', shade: 400 },
        { name: 'neutral', value: '#A3A3A3', shade: 500 },
        { name: 'neutral', value: '#D4D4D4', shade: 600 },
        { name: 'neutral', value: '#E5E5E5', shade: 700 },
        { name: 'neutral', value: '#F5F5F5', shade: 800 },
        { name: 'neutral', value: '#FAFAFA', shade: 900 },
      ],
      success: successGreen,
      warning: warningYellow,
      error: errorRed,
    },
    typography: {
      heading: {
        ...typographyPresets.heading,
        fontSize: 40,
        weight: 600,
        letterSpacing: -0.03,
      },
      subheading: typographyPresets.subheading,
      body: typographyPresets.body,
      caption: typographyPresets.caption,
    },
    spacing: {
      xs: spacingPresets.xs,
      sm: spacingPresets.sm,
      md: spacingPresets.md,
      lg: spacingPresets.lg,
      xl: spacingPresets.xl,
    },
    radius: {
      none: { value: 0, unit: 'px' },
      sm: { value: 2, unit: 'px' },
      md: { value: 4, unit: 'px' },
      lg: { value: 6, unit: 'px' },
      full: { value: 'full', unit: 'px' },
    },
    shadows: {
      none: shadowPresets.none,
      sm: shadowPresets.sm,
      md: { name: 'md', value: '0 4px 6px -1px rgb(0 0 0 / 0.5), 0 2px 4px -2px rgb(0 0 0 / 0.4)' },
      lg: { name: 'lg', value: '0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.4)' },
      xl: shadowPresets.xl,
    },
  },
  mood: 'minimal',
  colorScheme: 'dark',
};

export const elegantSerifTheme: DesignTheme = {
  name: 'Elegant Serif',
  description: 'Sophisticated design with serif typography',
  tokens: {
    colors: {
      primary: neutralColors,
      secondary: primaryBlue,
      neutral: neutralColors,
      success: successGreen,
      warning: warningYellow,
      error: errorRed,
    },
    typography: {
      heading: {
        fontFamily: 'Playfair Display, Georgia, serif',
        fontSize: 52,
        weight: 700,
        lineHeight: 1.2,
        letterSpacing: -0.01,
      },
      subheading: {
        fontFamily: 'Playfair Display, Georgia, serif',
        fontSize: 36,
        weight: 600,
        lineHeight: 1.3,
        letterSpacing: 0,
      },
      body: {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 17,
        weight: 400,
        lineHeight: 1.7,
        letterSpacing: 0,
      },
      caption: {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 14,
        weight: 500,
        lineHeight: 1.5,
        letterSpacing: 0.02,
      },
    },
    spacing: {
      xs: spacingPresets.xs,
      sm: spacingPresets.sm,
      md: { value: 3, unit: 'rem' },
      lg: { value: 5, unit: 'rem' },
      xl: { value: 8, unit: 'rem' },
    },
    radius: {
      none: radiusPresets.none,
      sm: radiusPresets.sm,
      md: radiusPresets.md,
      lg: radiusPresets.lg,
      full: radiusPresets.full,
    },
    shadows: {
      none: shadowPresets.none,
      sm: shadowPresets.sm,
      md: { name: 'md', value: '0 4px 12px 0 rgb(0 0 0 / 0.08)' },
      lg: { name: 'lg', value: '0 8px 24px 0 rgb(0 0 0 / 0.12)' },
      xl: shadowPresets.xl,
    },
  },
  mood: 'elegant',
  colorScheme: 'light',
};

export const playfulBrightTheme: DesignTheme = {
  name: 'Playful Bright',
  description: 'Vibrant, energetic design with bright colors',
  tokens: {
    colors: {
      primary: [
        { name: 'primary', value: '#FFF7ED', shade: 50 },
        { name: 'primary', value: '#FFEDD5', shade: 100 },
        { name: 'primary', value: '#FED7AA', shade: 200 },
        { name: 'primary', value: '#FDBA74', shade: 300 },
        { name: 'primary', value: '#FB923C', shade: 400 },
        { name: 'primary', value: '#F97316', shade: 500 },
        { name: 'primary', value: '#EA580C', shade: 600 },
        { name: 'primary', value: '#C2410C', shade: 700 },
        { name: 'primary', value: '#9A3412', shade: 800 },
        { name: 'primary', value: '#7C2D12', shade: 900 },
      ],
      secondary: [
        { name: 'secondary', value: '#FDF4FF', shade: 50 },
        { name: 'secondary', value: '#FAE8FF', shade: 100 },
        { name: 'secondary', value: '#F5D0FE', shade: 200 },
        { name: 'secondary', value: '#F0ABFC', shade: 300 },
        { name: 'secondary', value: '#E879F9', shade: 400 },
        { name: 'secondary', value: '#D946EF', shade: 500 },
        { name: 'secondary', value: '#C026D3', shade: 600 },
        { name: 'secondary', value: '#A21CAF', shade: 700 },
        { name: 'secondary', value: '#86198F', shade: 800 },
        { name: 'secondary', value: '#701A75', shade: 900 },
      ],
      neutral: neutralColors,
      success: successGreen,
      warning: warningYellow,
      error: errorRed,
    },
    typography: {
      heading: {
        fontFamily: 'Poppins, system-ui, sans-serif',
        fontSize: 52,
        weight: 800,
        lineHeight: 1.1,
        letterSpacing: -0.02,
      },
      subheading: {
        fontFamily: 'Poppins, system-ui, sans-serif',
        fontSize: 32,
        weight: 700,
        lineHeight: 1.2,
        letterSpacing: -0.01,
      },
      body: {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 16,
        weight: 400,
        lineHeight: 1.6,
        letterSpacing: 0,
      },
      caption: {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 14,
        weight: 500,
        lineHeight: 1.5,
        letterSpacing: 0.01,
      },
    },
    spacing: {
      xs: spacingPresets.xs,
      sm: spacingPresets.sm,
      md: spacingPresets.md,
      lg: spacingPresets.lg,
      xl: spacingPresets.xl,
    },
    radius: {
      none: { value: 0, unit: 'px' },
      sm: { value: 8, unit: 'px' },
      md: { value: 16, unit: 'px' },
      lg: { value: 24, unit: 'px' },
      full: { value: 'full', unit: 'px' },
    },
    shadows: {
      none: shadowPresets.none,
      sm: shadowPresets.sm,
      md: { name: 'md', value: '0 4px 6px -1px rgb(0 0 0 / 0.15), 0 2px 4px -2px rgb(0 0 0 / 0.1)' },
      lg: { name: 'lg', value: '0 10px 15px -3px rgb(0 0 0 / 0.2), 0 4px 6px -4px rgb(0 0 0 / 0.15)' },
      xl: { name: 'xl', value: '0 20px 25px -5px rgb(0 0 0 / 0.25), 0 8px 10px -6px rgb(0 0 0 / 0.2)' },
    },
  },
  mood: 'playful',
  colorScheme: 'light',
};

// ==================== THEME REGISTRY ====================

export const themeRegistry: Record<string, DesignTheme> = {
  'modern-light': modernLightTheme,
  'creative-purple': creativePurpleTheme,
  'minimal-dark': minimalDarkTheme,
  'elegant-serif': elegantSerifTheme,
  'playful-bright': playfulBrightTheme,
};

export const getThemeByMood = (mood: DesignTheme['mood']): DesignTheme => {
  const moodMap: Record<DesignTheme['mood'], DesignTheme> = {
    corporate: modernLightTheme,
    bold: creativePurpleTheme,
    minimal: minimalDarkTheme,
    elegant: elegantSerifTheme,
    playful: playfulBrightTheme,
  };
  return moodMap[mood] || modernLightTheme;
};

export const getThemeByName = (name: string): DesignTheme => {
  return themeRegistry[name] || modernLightTheme;
};
