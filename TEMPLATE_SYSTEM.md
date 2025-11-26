# Enhanced Template System Architecture

## Overview
The template system now supports sophisticated, data-binding ready website generation with multi-format support and professional layout constraints.

## Core Template Types

### 1. AIGeneratedTemplate (Primary)
**Location**: `src/types/template.ts`

The main template format for AI-generated websites with full feature support:

```typescript
interface AIGeneratedTemplate {
  id: string;
  name: string;
  description: string;
  industry?: string;
  brandKit: TemplateBrandKit;
  sections: TemplateSection[];
  variants: TemplateVariant[];
  data: TemplateData;
  createdAt: string;
  updatedAt: string;
}
```

**Key Features**:
- Multi-format support (web, Instagram, Facebook, email, presentation)
- Data binding for dynamic content
- Layout constraint system (fixed, hug, fill modes)
- Brand kit integration
- Section-based architecture

### 2. Template (Zod Schema)
**Location**: `src/schemas/templateSchema.ts`

Fabric.js compatible format for canvas-based editing:

```typescript
interface Template {
  id: string;
  name: string;
  width: number;
  height: number;
  backgroundColor: string;
  layers: Layer[];
  metadata?: {...};
}
```

**Purpose**: Canvas rendering, layer manipulation, visual editing

### 3. DesignSystemTemplate (Legacy)
**Location**: `src/types/designSystem.ts`

Organism-based template format for atomic design patterns:

```typescript
interface DesignSystemTemplate {
  organisms: Organism[];
  layout: GridLayout;
  tokens: Tokens;
  theme: DesignTheme;
}
```

**Purpose**: Legacy support, atomic design workflows

## Layout Constraint System

### Width/Height Modes
- **Fixed**: Explicit pixel values (`w-64`, `w-[500px]`)
- **Hug**: Content-determined (`w-auto`, `w-fit`)
- **Fill**: 100% of container (`w-full`, `h-full`)

### Flexbox Properties
- **Direction**: `row` | `column`
- **Align Items**: `flex-start` | `center` | `flex-end` | `stretch`
- **Justify Content**: `flex-start` | `center` | `flex-end` | `space-between` | `space-around`

### Spacing
- **Padding**: Individual (top, right, bottom, left) or uniform
- **Margin**: Individual or uniform
- **Gap**: Spacing between flex/grid children

## Component Types

### Container Components
Hold child components with layout constraints:
```html
<section class="w-full min-h-screen flex flex-col justify-center items-center gap-12 p-8">
  <!-- Children -->
</section>
```

### Text Components
Typography with data binding:
```html
<h1 class="text-5xl font-bold" data-bind="title">Headline</h1>
```

### Image Components
With filters and object-fit:
```html
<img class="w-full h-auto object-cover rounded-2xl brightness-110" 
     data-bind="imageUrl" src="placeholder.jpg">
```

### Shape Components
Decorative elements:
```html
<div class="w-64 h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full"></div>
```

### Button Components
Interactive CTAs:
```html
<button class="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all">
  Action
</button>
```

## Data Binding

Components support data binding for dynamic content:

```html
<!-- Text binding -->
<h1 data-bind="title">Default Title</h1>

<!-- Image binding -->
<img data-bind="imageUrl" src="placeholder.jpg">

<!-- Price/Number binding -->
<span data-bind="price" data-format="$${0.00}">$99.00</span>

<!-- Color binding -->
<div data-bind="primaryColor" style="background-color: #3b82f6"></div>
```

## Template Variants (Multi-Format)

### Supported Formats
1. **Web**: 1920x1080, responsive down to mobile
2. **Instagram Story**: 1080x1920 (9:16 vertical)
3. **Instagram Post**: 1080x1080 (1:1 square)
4. **Facebook Post**: 1200x630
5. **Twitter**: 1200x675
6. **Presentation**: 1920x1080 (16:9)
7. **Email**: 600px width, flexible height

### Format-Specific Generation
Each format has optimized layouts:
- **Web**: Multi-section with navigation
- **Instagram Story**: Vertical, full-bleed layout
- **Email**: Table-based, email-client safe
- **Presentation**: Centered content, large text

## Brand Kit Integration

Every template uses consistent branding:

```typescript
interface TemplateBrandKit {
  primaryColor: string;      // Main brand color
  secondaryColor: string;    // Supporting color
  accentColor: string;       // Highlights, CTAs
  fonts: {
    heading: string;         // Headlines
    body: string;           // Paragraphs
    accent: string;         // Special text
  };
  logoUrl?: string;
}
```

## Section Types

1. **Hero**: Full-height banner with CTA
2. **Content**: Text-heavy sections with media
3. **Gallery**: Image/video grids
4. **CTA**: Call-to-action focused
5. **Footer**: Contact, links, social
6. **Custom**: Specialized layouts

## AI Generation Instructions

The AI code assistant (`supabase/functions/ai-code-assistant/index.ts`) generates templates following:

1. **Layout Constraints**: Uses Tailwind classes to implement width/height modes
2. **Component Hierarchy**: Containers → Sections → Components
3. **Data Binding**: Adds data-bind attributes for dynamic content
4. **Brand Consistency**: Applies colors and fonts from brand kit
5. **Format Optimization**: Adjusts layout based on target format
6. **Responsive Design**: Mobile-first with breakpoints
7. **Interactivity**: Minimal vanilla JS for enhanced UX

## Helper Functions

### Template Conversion
```typescript
// Convert AIGeneratedTemplate to Fabric.js format
convertAITemplateToFabric(aiTemplate: AIGeneratedTemplate): Template

// Create default template
createDefaultTemplate(): Template

// Validate template
validateTemplate(data: unknown): { success: boolean; data?: Template; errors?: ZodError }
```

## Best Practices

1. **Use AIGeneratedTemplate** for new AI-generated content
2. **Use Template (Zod)** for canvas editing and layer manipulation
3. **Add data-bind attributes** for dynamic content
4. **Specify layout constraints** for proper component sizing
5. **Apply brand kit** for consistent visual identity
6. **Generate multiple variants** for cross-platform publishing
7. **Test responsiveness** across breakpoints
8. **Validate templates** before saving

## Migration Guide

### From Old Template Format
```typescript
// Old: Template with frames
const oldTemplate = {
  frames: [{ layers: [...] }]
};

// New: AIGeneratedTemplate with sections
const newTemplate: AIGeneratedTemplate = {
  sections: [{
    components: [...]
  }],
  variants: [{
    size: { width: 1920, height: 1080 },
    format: 'web'
  }]
};
```

### Type Safety
```typescript
// Always use proper types
import type { AIGeneratedTemplate } from '@/types/template';
import type { Template } from '@/schemas/templateSchema';
import type { DesignSystemTemplate } from '@/types/designSystem';

// Don't use generic "Template" - specify which one
```

## File Structure

```
src/
  types/
    template.ts              # AIGeneratedTemplate (primary)
    designSystem.ts          # DesignSystemTemplate (legacy)
  schemas/
    templateSchema.ts        # Template (Zod schema for Fabric.js)
  services/
    designSystemGeneratorService.ts  # Generates DesignSystemTemplate
    eliteAIDesignerService.ts       # HTML generation
    requirementsAnalysisService.ts   # Intent analysis
  hooks/
    useAITemplate.ts         # Template generation hook
    useTemplateState.ts      # Template state management
```

## Edge Function Integration

The AI code assistant (`ai-code-assistant` edge function) now:
- Understands layout constraint modes
- Generates data-binding ready HTML
- Creates format-specific templates
- Applies brand kit colors consistently
- Uses professional spacing and typography
- Implements responsive breakpoints
- Adds minimal vanilla JavaScript for interactivity

**Deployment Size**: 63.29kB (optimized from 79.66kB)
