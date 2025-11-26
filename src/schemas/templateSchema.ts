import { z } from 'zod';
import type { AIGeneratedTemplate, TemplateComponent, TemplateSection } from '@/types/template';

// Color schema with defaults
const colorSchema = z.string().default('#000000').transform((val) => {
  if (!val || val === '') return '#000000';
  if (!/^#[0-9A-Fa-f]{6}$/.test(val)) return '#000000';
  return val;
});

// Filter schema with safe defaults
const filterSchema = z.object({
  type: z.enum(['brightness', 'contrast', 'saturation', 'blur', 'grayscale', 'sepia']).default('brightness'),
  value: z.number().min(0).max(200).default(100),
}).default({ type: 'brightness', value: 100 });

// Gradient schema
const gradientSchema = z.object({
  type: z.enum(['linear', 'radial']).default('linear'),
  angle: z.number().min(0).max(360).default(0),
  colors: z.array(colorSchema).min(2).default(['#000000', '#ffffff']),
}).optional();

// Base layer schema
const baseLayerSchema = z.object({
  id: z.string().optional(), // Will be generated if missing
  type: z.enum(['text', 'image', 'shape', 'group']),
  x: z.number().default(0),
  y: z.number().default(0),
  width: z.number().min(1).default(100),
  height: z.number().min(1).default(100),
  rotation: z.number().min(0).max(360).default(0),
  opacity: z.number().min(0).max(1).default(1),
  visible: z.boolean().default(true),
  locked: z.boolean().default(false),
});

// Text layer schema
const textLayerSchema = baseLayerSchema.extend({
  type: z.literal('text'),
  content: z.string().default('Text'),
  fontFamily: z.string().default('Inter'),
  fontSize: z.number().min(8).max(500).default(16),
  fontWeight: z.enum(['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900']).default('normal'),
  fontStyle: z.enum(['normal', 'italic']).default('normal'),
  textAlign: z.enum(['left', 'center', 'right', 'justify']).default('left'),
  color: colorSchema,
  lineHeight: z.number().min(0.5).max(3).default(1.2),
  letterSpacing: z.number().min(-5).max(20).default(0),
});

// Image layer schema
const imageLayerSchema = baseLayerSchema.extend({
  type: z.literal('image'),
  src: z.string().url().or(z.string().startsWith('data:')),
  fit: z.enum(['cover', 'contain', 'fill', 'scale-down']).default('cover'),
  filters: z.array(filterSchema).default([]),
  borderRadius: z.number().min(0).max(500).default(0),
});

// Shape layer schema
const shapeLayerSchema = baseLayerSchema.extend({
  type: z.literal('shape'),
  shape: z.enum(['rectangle', 'circle', 'ellipse', 'triangle', 'line']).default('rectangle'),
  fill: colorSchema,
  stroke: colorSchema.optional(),
  strokeWidth: z.number().min(0).max(50).default(0),
  borderRadius: z.number().min(0).max(500).default(0),
  gradient: gradientSchema,
});

// Group layer schema
const groupLayerSchema = baseLayerSchema.extend({
  type: z.literal('group'),
  children: z.array(z.lazy(() => layerSchema)).default([]),
});

// Union layer schema
const layerSchema: z.ZodType<any> = z.union([
  textLayerSchema,
  imageLayerSchema,
  shapeLayerSchema,
  groupLayerSchema,
]);

// Main template schema
export const templateSchema = z.object({
  id: z.string().optional(),
  name: z.string().default('Untitled Template'),
  description: z.string().optional(),
  width: z.number().min(1).max(10000).default(1920),
  height: z.number().min(1).max(10000).default(1080),
  backgroundColor: colorSchema,
  backgroundImage: z.string().url().optional(),
  layers: z.array(layerSchema).default([]),
  metadata: z.object({
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    author: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }).optional(),
  version: z.string().default('1.0.0'),
});

export type Template = z.infer<typeof templateSchema>;
export type Layer = z.infer<typeof layerSchema>;
export type TextLayer = z.infer<typeof textLayerSchema>;
export type ImageLayer = z.infer<typeof imageLayerSchema>;
export type ShapeLayer = z.infer<typeof shapeLayerSchema>;
export type GroupLayer = z.infer<typeof groupLayerSchema>;

// Validation helper
export const validateTemplate = (data: unknown): { success: boolean; data?: Template; errors?: z.ZodError } => {
  const result = templateSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
};

// Default template generator
export const createDefaultTemplate = (): Template => {
  return templateSchema.parse({
    id: `template-${Date.now()}`,
    name: 'New Template',
    width: 1920,
    height: 1080,
    backgroundColor: '#ffffff',
    layers: [],
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  });
};

// Helper to convert AIGeneratedTemplate to Fabric.js compatible format
export const convertAITemplateToFabric = (aiTemplate: AIGeneratedTemplate): Template => {
  // Get first variant or use default dimensions
  const variant = aiTemplate.variants[0];
  const width = variant?.size.width || 1920;
  const height = variant?.size.height || 1080;
  
  return {
    id: aiTemplate.id,
    name: aiTemplate.name,
    description: aiTemplate.description,
    width,
    height,
    backgroundColor: aiTemplate.brandKit.primaryColor,
    layers: [],
    metadata: {
      createdAt: aiTemplate.createdAt,
      updatedAt: aiTemplate.updatedAt,
      author: 'AI Generated',
      tags: aiTemplate.industry ? [aiTemplate.industry] : [],
    },
    version: '1.0.0',
  };
};
