import { z } from 'zod';

// Page Layout Type Schema
export const pageLayoutTypeSchema = z.enum([
  'dashboard',
  'project_detail',
  'task_detail',
  'design_studio',
  'file_manager',
  'user_profile',
  'team_management',
  'analytics',
  'settings',
  'auth',
  'landing',
  'pricing',
  'documentation',
  'custom'
]);

// Layout Component Type Schema
export const layoutComponentTypeSchema = z.enum([
  'header',
  'sidebar',
  'main_content',
  'footer',
  'modal',
  'drawer',
  'panel',
  'card',
  'list',
  'grid',
  'table',
  'form',
  'chart',
  'toolbar',
  'breadcrumb',
  'navigation',
  'hero',
  'feature',
  'testimonial',
  'cta',
  'custom'
]);

// Layout Responsive Breakpoint Schema
export const layoutBreakpointSchema = z.object({
  xs: z.object({
    minWidth: z.number().default(0),
    maxWidth: z.number().default(575),
    columns: z.number().default(1),
    spacing: z.number().default(16),
  }),
  sm: z.object({
    minWidth: z.number().default(576),
    maxWidth: z.number().default(767),
    columns: z.number().default(2),
    spacing: z.number().default(20),
  }),
  md: z.object({
    minWidth: z.number().default(768),
    maxWidth: z.number().default(991),
    columns: z.number().default(3),
    spacing: z.number().default(24),
  }),
  lg: z.object({
    minWidth: z.number().default(992),
    maxWidth: z.number().default(1199),
    columns: z.number().default(4),
    spacing: z.number().default(32),
  }),
  xl: z.object({
    minWidth: z.number().default(1200),
    maxWidth: z.number().optional(),
    columns: z.number().default(6),
    spacing: z.number().default(40),
  }),
});

// Layout Component Schema
export const layoutComponentSchema = z.object({
  id: z.string(),
  type: layoutComponentTypeSchema,
  name: z.string(),
  
  // Positioning
  position: z.object({
    x: z.number().default(0),
    y: z.number().default(0),
    width: z.number().optional(),
    height: z.number().optional(),
    zIndex: z.number().default(0),
  }),
  
  // Responsive positioning
  responsive: z.object({
    xs: z.object({
      x: z.number().optional(),
      y: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      hidden: z.boolean().default(false),
    }).optional(),
    sm: z.object({
      x: z.number().optional(),
      y: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      hidden: z.boolean().default(false),
    }).optional(),
    md: z.object({
      x: z.number().optional(),
      y: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      hidden: z.boolean().default(false),
    }).optional(),
    lg: z.object({
      x: z.number().optional(),
      y: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      hidden: z.boolean().default(false),
    }).optional(),
    xl: z.object({
      x: z.number().optional(),
      y: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      hidden: z.boolean().default(false),
    }).optional(),
  }).default({}),
  
  // Styling
  styles: z.object({
    backgroundColor: z.string().optional(),
    padding: z.object({
      top: z.number().default(0),
      right: z.number().default(0),
      bottom: z.number().default(0),
      left: z.number().default(0),
    }).optional(),
    margin: z.object({
      top: z.number().default(0),
      right: z.number().default(0),
      bottom: z.number().default(0),
      left: z.number().default(0),
    }).optional(),
    borderRadius: z.number().default(0),
    boxShadow: z.string().optional(),
    border: z.string().optional(),
  }).optional(),
  
  // Content and Configuration
  config: z.record(z.string(), z.unknown()).default({}),
  content: z.unknown().optional(),
  
  // Nested components
  children: z.lazy(() => z.array(layoutComponentSchema)).default([]),
  
  // Behavior
  isVisible: z.boolean().default(true),
  isLocked: z.boolean().default(false),
  isResizable: z.boolean().default(true),
  isDraggable: z.boolean().default(true),
  
  // Metadata
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

// Page Layout Schema
export const pageLayoutSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Layout name is required'),
  description: z.string().optional(),
  
  // Layout type and category
  type: pageLayoutTypeSchema,
  category: z.string().optional(),
  
  // Layout structure
  components: z.array(layoutComponentSchema).default([]),
  
  // Global layout settings
  settings: z.object({
    // Grid system
    grid: z.object({
      enabled: z.boolean().default(true),
      columns: z.number().default(12),
      gutter: z.number().default(24),
      margin: z.number().default(24),
    }),
    
    // Container settings
    container: z.object({
      maxWidth: z.number().default(1200),
      centered: z.boolean().default(true),
      fluid: z.boolean().default(false),
    }),
    
    // Responsive settings
    responsive: layoutBreakpointSchema.optional(),
    
    // Theme settings
    theme: z.object({
      colors: z.object({
        primary: z.string().default('#3b82f6'),
        secondary: z.string().default('#64748b'),
        success: z.string().default('#10b981'),
        warning: z.string().default('#f59e0b'),
        error: z.string().default('#ef4444'),
        background: z.string().default('#ffffff'),
        surface: z.string().default('#f8fafc'),
        text: z.string().default('#1e293b'),
      }),
      typography: z.object({
        fontFamily: z.string().default('Inter, sans-serif'),
        fontSize: z.number().default(14),
        lineHeight: z.number().default(1.5),
        fontWeight: z.number().default(400),
      }),
      spacing: z.object({
        unit: z.number().default(8),
        scale: z.array(z.number()).default([0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64]),
      }),
    }),
    
    // Animation settings
    animations: z.object({
      enabled: z.boolean().default(true),
      duration: z.number().default(300),
      easing: z.string().default('ease-in-out'),
    }),
  }).optional(),
  
  // Layout metadata
  metadata: z.object({
    version: z.string().default('1.0.0'),
    author: z.string().optional(),
    createdWith: z.string().optional(),
    tags: z.array(z.string()).default([]),
    
    // SEO metadata for public pages
    seo: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).default([]),
      ogImage: z.string().url().optional(),
    }).optional(),
  }).optional(),
  
  // Access control
  visibility: z.enum(['private', 'team', 'organization', 'public']).default('private'),
  permissions: z.object({
    canView: z.array(z.string()).default([]),
    canEdit: z.array(z.string()).default([]),
    canDelete: z.array(z.string()).default([]),
  }).optional(),
  
  // Timestamps and ownership
  ownerId: z.string(),
  projectId: z.string().optional(),
  templateId: z.string().optional(),
  
  // Status
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
  isTemplate: z.boolean().default(false),
  isFavorite: z.boolean().default(false),
  
  // Usage analytics
  analytics: z.object({
    views: z.number().default(0),
    uses: z.number().default(0),
    likes: z.number().default(0),
    lastUsedAt: z.string().datetime().optional(),
  }).optional(),
  
  // Timestamps
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

// Layout Template Schema (predefined layouts)
export const layoutTemplateSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  thumbnail: z.string().url().optional(),
  
  // Template metadata
  category: z.string(),
  tags: z.array(z.string()).default([]),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  
  // Layout definition
  layout: pageLayoutSchema,
  
  // Template settings
  isPremium: z.boolean().default(false),
  isPopular: z.boolean().default(false),
  isNew: z.boolean().default(false),
  
  // Usage stats
  downloads: z.number().default(0),
  rating: z.number().min(0).max(5).default(0),
  reviews: z.number().default(0),
  
  // Timestamps
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

// Layout Export Schema
export const layoutExportSchema = z.object({
  format: z.enum(['json', 'html', 'react', 'vue', 'angular']),
  options: z.object({
    includeStyles: z.boolean().default(true),
    includeAssets: z.boolean().default(true),
    minify: z.boolean().default(false),
    responsive: z.boolean().default(true),
    framework: z.string().optional(),
    cssFramework: z.enum(['tailwind', 'bootstrap', 'bulma', 'custom']).optional(),
  }).optional(),
});

// Layout Import Schema
export const layoutImportSchema = z.object({
  source: z.enum(['file', 'url', 'template', 'figma', 'sketch']),
  data: z.string(), // JSON string or file content
  options: z.object({
    preserveIds: z.boolean().default(false),
    mergeWithExisting: z.boolean().default(false),
    updateComponents: z.boolean().default(true),
  }).optional(),
});

export type PageLayout = z.infer<typeof pageLayoutSchema>;
export type LayoutComponent = z.infer<typeof layoutComponentSchema>;
export type LayoutTemplate = z.infer<typeof layoutTemplateSchema>;
export type LayoutExport = z.infer<typeof layoutExportSchema>;
export type LayoutImport = z.infer<typeof layoutImportSchema>;
export type LayoutBreakpoint = z.infer<typeof layoutBreakpointSchema>;