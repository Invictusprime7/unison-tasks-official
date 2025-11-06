/**
 * Professional Design System - Main Export
 * Central export point for all design system utilities and components
 */

// Color Theory Engine
export {
  hexToRgb,
  rgbToHex,
  hexToLab,
  labToHex,
  rgbToHsl,
  hslToRgb,
  calculateColorDifference,
  getRelativeLuminance,
  getContrastRatio,
  meetsWCAG_AAA,
  adjustForContrast,
  generateColorScale,
  generateColorHarmony,
  getBrandPersonalityColor,
  generateSemanticColors,
  generateSurfaceColors,
  type RGBColor,
  type LABColor,
  type HSLColor,
  type ColorScale,
  type ColorHarmonyType,
  type BrandPersonality,
  type SemanticColors,
  type SurfaceColors,
} from './design-system/colorTheory';

// Design Tokens
export {
  generateFluidTypography,
  generateFontFamilies,
  generateFontWeights,
  generateLineHeights,
  generateModularScale,
  generateSemanticSpacing,
  generateElevationSystem,
  generateFocusStates,
  generateColoredShadows,
  generateBrandColors,
  createProfessionalDesignSystem,
  designTokensToCSS,
  type FluidTypographyScale,
  type FontFamilySystem,
  type FontWeightScale,
  type LineHeightScale,
  type ModularScale,
  type SemanticSpacing,
  type ElevationSystem,
  type FocusStates,
  type ColoredShadows,
  type BrandColors,
  type ProfessionalDesignSystem,
} from './design-system/designTokens';

// Professional Template Schema
export {
  professionalTemplateSchema,
  templateSchema,
  professionalAIPromptSchema,
  frameSchema,
  layerSchema,
  designTokensSchema,
  validateTemplate,
  validateTemplateWithErrors,
  migrateTemplate,
  partialTemplateSchema,
  type ProfessionalTemplate,
  type ProfessionalAIPrompt,
  type Frame,
  type Layer,
  type TextLayer,
  type ImageLayer,
  type ShapeLayer,
  type ComponentLayer,
  type GroupLayer,
  type DesignTokens,
  type DesignStyle,
  type TargetEmotion,
  type IndustryContext,
  type TemplateCategory,
  type PartialTemplate,
} from '../schemas/professionalTemplateSchema';

// AI Generation Engine
export {
  ProfessionalAIEngine,
  professionalAIEngine,
  type IndustryDesignPatterns,
} from './ai/professionalAIEngine';

// Version info
export const PROFESSIONAL_DESIGN_SYSTEM_VERSION = '2.0.0';

// Feature flags
export const FEATURES = {
  CIELAB_COLOR_SPACE: true,
  WCAG_AAA_COMPLIANCE: true,
  GOLDEN_RATIO_SPACING: true,
  FLUID_TYPOGRAPHY: true,
  MATERIAL_DESIGN_3: true,
  INDUSTRY_PATTERNS: true,
  GLASSMORPHISM: true,
  NEUMORPHISM: true,
  BRUTALIST: true,
  COLOR_HARMONY: true,
  BRAND_PSYCHOLOGY: true,
  QUALITY_METRICS: true,
  DESIGN_TOKENS: true,
} as const;

/**
 * Quick start helper for creating a complete design system
 */
export function quickStartDesignSystem(options: {
  brandPersonality: BrandPersonality;
  colorHarmony?: ColorHarmonyType;
  background?: string;
}) {
  const system = createProfessionalDesignSystem(
    options.brandPersonality,
    options.background || '#FFFFFF'
  );

  if (options.colorHarmony) {
    const harmonyColors = generateColorHarmony(
      system.colors.brand.primary,
      options.colorHarmony
    );
    console.log('Generated harmony palette:', harmonyColors);
  }

  return {
    system,
    css: designTokensToCSS(system),
  };
}

/**
 * Utility to check if all required features are available
 */
export function checkSystemCompatibility(): {
  compatible: boolean;
  missingFeatures: string[];
} {
  const requiredFeatures = [
    'CIELAB_COLOR_SPACE',
    'WCAG_AAA_COMPLIANCE',
    'DESIGN_TOKENS',
  ] as const;

  const missingFeatures = requiredFeatures.filter(
    (feature) => !FEATURES[feature]
  );

  return {
    compatible: missingFeatures.length === 0,
    missingFeatures,
  };
}
