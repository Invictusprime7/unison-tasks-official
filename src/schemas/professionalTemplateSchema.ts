/**
 * Unified Professional Template Schema
 * Merges and enhances templateSchema.ts and template.ts with strict validation
 * and comprehensive type safety
 */

import { z } from 'zod';
import type { BrandPersonality, ColorHarmonyType } from '../design-system/colorTheory';

// ============================================================================
// Design Style Types
// ============================================================================

export type DesignStyle = 
  | 'minimalist'
  | 'maximalist'
  | 'brutalist'
  | 'glassmorphism'
  | 'neumorphism'
  | 'modern'
  | 'classic';

export type TargetEmotion = 
  | 'calm'
  | 'energetic'
  | 'confident'
  | 'creative'
  | 'professional';

export type IndustryContext = 
  | 'e-commerce'
  | 'saas'
  | 'education'
  | 'healthcare'
  | 'finance'
  | 'entertainment'
  | 'portfolio'
  | 'blog'
  | 'documentation';

export type TemplateCategory =
  | 'executive-dashboard'
  | 'saas-landing'
  | 'e-commerce'
  | 'portfolio'
  | 'blog'
  | 'documentation'
  | 'general';

// ============================================================================
// Professional AI Prompt Schema
// ============================================================================

export const professionalAIPromptSchema = z.object({
  designStyle: z.enum([
    'minimalist',
    'maximalist',
    'brutalist',
    'glassmorphism',
    'neumorphism',
    'modern',
    'classic',
  ]).default('modern'),
  
  colorHarmony: z.enum([
    'monochromatic',
    'analogous',
    'complementary',
    'triadic',
    'split-complementary',
    'tetradic',
  ]).default('complementary'),
  
  brandPersonality: z.enum([
    'trustworthy',
    'innovative',
    'luxurious',
    'playful',
    'authoritative',
    'energetic',
    'calm',
  ]).default('trustworthy'),
  
  targetEmotion: z.enum([
    'calm',
    'energetic',
    'confident',
    'creative',
    'professional',
  ]).default('professional'),
  
  industryContext: z.enum([
    'e-commerce',
    'saas',
    'education',
    'healthcare',
    'finance',
    'entertainment',
    'portfolio',
    'blog',
    'documentation',
  ]),
  
  contentHierarchy: z.object({
    primaryFocus: z.string(),
    secondaryElements: z.array(z.string()).default([]),
    visualWeight: z.enum(['hero-focused', 'balanced', 'content-heavy']).default('balanced'),
  }).optional(),
  
  motionPreferences: z.object({
    enableAnimations: z.boolean().default(true),
    animationIntensity: z.enum(['subtle', 'moderate', 'pronounced']).default('moderate'),
    transitionSpeed: z.enum(['fast', 'normal', 'slow']).default('normal'),
  }).optional(),
  
  accessibilityLevel: z.enum(['AA', 'AAA']).default('AAA'),
  
  // Additional context
  targetAudience: z.string().optional(),
  keyMessages: z.array(z.string()).default([]),
  customRequirements: z.string().optional(),
});

export type ProfessionalAIPrompt = z.infer<typeof professionalAIPromptSchema>;

// ============================================================================
// Enhanced Color Schema
// ============================================================================

const colorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').default('#000000');

const gradientSchema = z.object({
  type: z.enum(['linear', 'radial', 'conic']).default('linear'),
  angle: z.number().min(0).max(360).default(0),
  colors: z.array(z.object({
    color: colorSchema,
    stop: z.number().min(0).max(100),
  })).min(2),
  blendMode: z.enum(['normal', 'multiply', 'screen', 'overlay']).optional(),
}).optional();

// ============================================================================
// Modern Design Tokens
// ============================================================================

export const designTokensSchema = z.object({
  colors: z.object({
    primary: z.record(z.string(), colorSchema),
    semantic: z.object({
      success: z.object({
        light: colorSchema,
        base: colorSchema,
        dark: colorSchema,
        contrast: colorSchema,
      }),
      warning: z.object({
        light: colorSchema,
        base: colorSchema,
        dark: colorSchema,
        contrast: colorSchema,
      }),
      error: z.object({
        light: colorSchema,
        base: colorSchema,
        dark: colorSchema,
        contrast: colorSchema,
      }),
      info: z.object({
        light: colorSchema,
        base: colorSchema,
        dark: colorSchema,
        contrast: colorSchema,
      }),
    }),
    surface: z.object({
      background: colorSchema,
      card: colorSchema,
      overlay: colorSchema,
      popover: colorSchema,
      hover: colorSchema,
    }),
    brand: z.object({
      primary: colorSchema,
      secondary: colorSchema,
      accent: colorSchema,
      muted: colorSchema,
    }),
  }),
  
  typography: z.object({
    families: z.object({
      heading: z.string(),
      body: z.string(),
      mono: z.string(),
    }),
    scales: z.record(z.string(), z.object({
      min: z.number(),
      max: z.number(),
      clamp: z.string(),
    })),
  }),
  
  spacing: z.record(z.string(), z.union([z.string(), z.number()])),
  
  shadows: z.object({
    elevation: z.record(z.string(), z.string()),
    focused: z.record(z.string(), z.string()),
    colored: z.record(z.string(), z.string()).optional(),
  }),
  
  borderRadius: z.record(z.string(), z.string()),
  
  animation: z.object({
    duration: z.record(z.string(), z.string()),
    easing: z.record(z.string(), z.string()),
  }).optional(),
});

export type DesignTokens = z.infer<typeof designTokensSchema>;

// ============================================================================
// Enhanced Layer Schemas with Design System Integration
// ============================================================================

const filterSchema = z.object({
  type: z.enum(['brightness', 'contrast', 'saturation', 'blur', 'grayscale', 'sepia', 'hue-rotate']),
  value: z.number(),
}).default({ type: 'brightness', value: 100 });

const baseLayerSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['text', 'image', 'shape', 'group', 'component']),
  name: z.string().default('Layer'),
  x: z.number().default(0),
  y: z.number().default(0),
  width: z.number().min(1).default(100),
  height: z.number().min(1).default(100),
  rotation: z.number().min(0).max(360).default(0),
  opacity: z.number().min(0).max(1).default(1),
  visible: z.boolean().default(true),
  locked: z.boolean().default(false),
  blendMode: z.enum(['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten']).default('normal'),
  
  // Design system integration
  designTokens: z.object({
    colorToken: z.string().optional(),
    spacingToken: z.string().optional(),
    shadowToken: z.string().optional(),
  }).optional(),
  
  // Data binding support
  dataBinding: z.object({
    field: z.string(),
    type: z.enum(['text', 'image', 'number', 'color', 'url']),
    defaultValue: z.any().optional(),
    format: z.string().optional(),
  }).optional(),
});

const textLayerSchema = baseLayerSchema.extend({
  type: z.literal('text'),
  content: z.string().default('Text'),
  fontFamily: z.string().default('Inter'),
  fontSize: z.number().min(8).max(500).default(16),
  fontWeight: z.union([
    z.enum(['normal', 'bold']),
    z.enum(['100', '200', '300', '400', '500', '600', '700', '800', '900']),
  ]).default('normal'),
  fontStyle: z.enum(['normal', 'italic', 'oblique']).default('normal'),
  textAlign: z.enum(['left', 'center', 'right', 'justify']).default('left'),
  textTransform: z.enum(['none', 'uppercase', 'lowercase', 'capitalize']).optional(),
  color: colorSchema,
  lineHeight: z.number().min(0.5).max(3).default(1.5),
  letterSpacing: z.number().min(-5).max(20).default(0),
  textDecoration: z.enum(['none', 'underline', 'line-through']).optional(),
  textShadow: z.string().optional(),
});

const imageLayerSchema = baseLayerSchema.extend({
  type: z.literal('image'),
  src: z.string().url().or(z.string().startsWith('data:')),
  alt: z.string().optional(),
  fit: z.enum(['cover', 'contain', 'fill', 'scale-down', 'none']).default('cover'),
  filters: z.array(filterSchema).default([]),
  borderRadius: z.number().min(0).max(500).default(0),
  objectPosition: z.string().optional(),
});

const shapeLayerSchema = baseLayerSchema.extend({
  type: z.literal('shape'),
  shape: z.enum(['rectangle', 'circle', 'ellipse', 'triangle', 'line', 'polygon']).default('rectangle'),
  fill: colorSchema.optional(),
  stroke: colorSchema.optional(),
  strokeWidth: z.number().min(0).max(50).default(0),
  strokeDasharray: z.string().optional(),
  borderRadius: z.number().min(0).max(500).default(0),
  gradient: gradientSchema,
});

const componentLayerSchema = baseLayerSchema.extend({
  type: z.literal('component'),
  componentType: z.enum(['button', 'card', 'input', 'container', 'hero', 'feature']),
  variant: z.string().optional(),
  props: z.record(z.string(), z.any()).optional(),
});

const groupLayerSchema = baseLayerSchema.extend({
  type: z.literal('group'),
  layers: z.lazy(() => z.array(layerSchema)).default([]),
  layout: z.object({
    type: z.enum(['free', 'flex', 'grid']).default('free'),
    direction: z.enum(['row', 'column']).optional(),
    gap: z.number().default(0),
    padding: z.number().default(0),
    alignItems: z.enum(['flex-start', 'center', 'flex-end', 'stretch']).optional(),
    justifyContent: z.enum(['flex-start', 'center', 'flex-end', 'space-between', 'space-around']).optional(),
  }).optional(),
});

export const layerSchema: z.ZodType<any> = z.union([
  textLayerSchema,
  imageLayerSchema,
  shapeLayerSchema,
  componentLayerSchema,
  groupLayerSchema,
]);

// ============================================================================
// Enhanced Frame Schema
// ============================================================================

export const frameSchema = z.object({
  id: z.string().optional(),
  name: z.string().default('Frame'),
  width: z.number().min(1).max(10000).default(1920),
  height: z.number().min(1).max(10000).default(1080),
  background: colorSchema.or(z.object({
    type: z.enum(['solid', 'gradient', 'image']),
    value: z.union([colorSchema, gradientSchema, z.string()]),
  })),
  layers: z.array(layerSchema).default([]),
  layout: z.enum(['free', 'flex-column', 'flex-row', 'grid']).default('free'),
  gap: z.number().min(0).max(200).default(0),
  padding: z.number().min(0).max(200).default(0),
  
  // Responsive variants
  responsive: z.object({
    mobile: z.object({ width: z.number(), height: z.number() }).optional(),
    tablet: z.object({ width: z.number(), height: z.number() }).optional(),
    desktop: z.object({ width: z.number(), height: z.number() }).optional(),
  }).optional(),
});

// ============================================================================
// Professional Template Schema
// ============================================================================

export const professionalTemplateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Template name is required').default('Untitled Template'),
  description: z.string().default(''),
  category: z.enum([
    'executive-dashboard',
    'saas-landing',
    'e-commerce',
    'portfolio',
    'blog',
    'documentation',
    'general',
  ]).default('general'),
  
  // Design metadata
  designMetadata: z.object({
    style: z.enum(['minimalist', 'maximalist', 'brutalist', 'glassmorphism', 'neumorphism', 'modern', 'classic']),
    colorHarmony: z.enum(['monochromatic', 'analogous', 'complementary', 'triadic', 'split-complementary', 'tetradic']),
    brandPersonality: z.enum(['trustworthy', 'innovative', 'luxurious', 'playful', 'authoritative', 'energetic', 'calm']),
    targetEmotion: z.enum(['calm', 'energetic', 'confident', 'creative', 'professional']),
    industry: z.string().optional(),
  }).optional(),
  
  // Design system tokens
  designTokens: designTokensSchema.optional(),
  
  // Template frames
  frames: z.array(frameSchema).min(1).default([{
    name: 'Frame 1',
    width: 1920,
    height: 1080,
    background: '#ffffff',
    layers: [],
    layout: 'free',
    gap: 0,
    padding: 0,
  }]),
  
  // Quality metrics
  qualityMetrics: z.object({
    designScore: z.number().min(0).max(100).optional(),
    accessibilityScore: z.number().min(0).max(100).optional(),
    performanceScore: z.number().min(0).max(100).optional(),
    wcagCompliance: z.enum(['A', 'AA', 'AAA']).optional(),
  }).optional(),
  
  // Version and metadata
  version: z.string().default('2.0.0'),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  tags: z.array(z.string()).default([]),
  isPublic: z.boolean().default(false),
});

export type ProfessionalTemplate = z.infer<typeof professionalTemplateSchema>;
export type Frame = z.infer<typeof frameSchema>;
export type Layer = z.infer<typeof layerSchema>;
export type TextLayer = z.infer<typeof textLayerSchema>;
export type ImageLayer = z.infer<typeof imageLayerSchema>;
export type ShapeLayer = z.infer<typeof shapeLayerSchema>;
export type ComponentLayer = z.infer<typeof componentLayerSchema>;
export type GroupLayer = z.infer<typeof groupLayerSchema>;

// ============================================================================
// Template Validation Utilities
// ============================================================================

/**
 * Validate and sanitize a template
 */
export function validateTemplate(template: unknown): ProfessionalTemplate {
  return professionalTemplateSchema.parse(template);
}

/**
 * Validate template with detailed error reporting
 */
export function validateTemplateWithErrors(template: unknown): {
  success: boolean;
  data?: ProfessionalTemplate;
  errors?: z.ZodError;
} {
  const result = professionalTemplateSchema.safeParse(template);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

/**
 * Partial validation for template updates
 */
export const partialTemplateSchema = professionalTemplateSchema.partial();

export type PartialTemplate = z.infer<typeof partialTemplateSchema>;

// ============================================================================
// Migration Utilities (Backward Compatibility)
// ============================================================================

/**
 * Migrate from old template schema to new professional schema
 */
export function migrateTemplate(oldTemplate: any): ProfessionalTemplate {
  // Map old structure to new structure
  const migrated: any = {
    id: oldTemplate.id,
    name: oldTemplate.name || 'Untitled Template',
    description: oldTemplate.description || '',
    category: oldTemplate.category || 'general',
    frames: oldTemplate.frames || [],
    version: '2.0.0',
    createdAt: oldTemplate.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: oldTemplate.tags || [],
  };

  // Add default design metadata if not present
  if (!oldTemplate.designMetadata) {
    migrated.designMetadata = {
      style: 'modern',
      colorHarmony: 'complementary',
      brandPersonality: 'trustworthy',
      targetEmotion: 'professional',
    };
  }

  return validateTemplate(migrated);
}

// Export schema for external use
export { professionalTemplateSchema as templateSchema };
