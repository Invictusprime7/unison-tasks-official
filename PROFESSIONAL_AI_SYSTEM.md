# Professional AI Template System - Documentation

## Overview

This document describes the professional AI template generation system with advanced design theory, modern component architecture, and advanced color science.

## Key Features

### 1. Advanced Color Theory Engine (`colorTheory.ts`)

#### CIELAB Color Space
- Full support for CIELAB color space calculations
- Perceptual color difference using CIEDE2000 formula
- Accurate color transformations between RGB, HSL, and LAB

#### WCAG 2.1 AAA Compliance
- Automatic contrast ratio calculations
- `getContrastRatio(color1, color2)` - Calculate WCAG contrast ratio
- `meetsWCAG_AAA(foreground, background)` - Check AAA compliance
- `adjustForContrast(foreground, background, targetRatio)` - Auto-adjust for compliance

#### Color Harmony Generation
- **Monochromatic**: Same hue, different lightness/saturation
- **Analogous**: Adjacent hues within 30 degrees
- **Complementary**: Opposite colors on the color wheel (180°)
- **Triadic**: Three colors evenly spaced (120° apart)
- **Split-Complementary**: Base color + two adjacent to complement
- **Tetradic**: Four colors in rectangular arrangement

#### Brand Psychology
Maps brand personalities to appropriate colors:
- **Trustworthy**: Blue (#2563EB) - trust, stability
- **Innovative**: Purple (#8B5CF6) - creativity, innovation
- **Luxurious**: Dark gray (#1F2937) - sophistication
- **Playful**: Orange (#F59E0B) - energy, fun
- **Authoritative**: Navy (#1E293B) - authority, professionalism
- **Energetic**: Red (#EF4444) - passion, energy
- **Calm**: Green (#10B981) - nature, calm

#### Color Scale Generation
Generates perceptually uniform color scales (50-950) using CIELAB:
```typescript
const scale = generateColorScale('#3B82F6');
// Returns: { 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950 }
```

### 2. Modern Design Tokens (`designTokens.ts`)

#### Fluid Typography
Responsive typography using CSS clamp():
```typescript
const typography = generateFluidTypography();
// xs: clamp(10px, calc(...), 12px)
// base: clamp(14px, calc(...), 16px)
// 9xl: clamp(96px, calc(...), 128px)
```

#### Modular Spacing
Golden ratio-based spacing system (φ = 1.618):
```typescript
const spacing = generateModularScale(16);
// { 3xs, 2xs, xs, sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl }
```

#### Material Design 3.0 Elevation
Professional shadow system with multiple elevation levels:
```typescript
const shadows = generateElevationSystem();
// { none, xs, sm, md, lg, xl, 2xl, 3xl }
```

#### Design System Creation
```typescript
const system = createProfessionalDesignSystem('trustworthy', '#FFFFFF');
// Returns complete design system with colors, typography, spacing, shadows
```

### 3. Unified Template Schema (`professionalTemplateSchema.ts`)

#### Professional AI Prompt
```typescript
interface ProfessionalAIPrompt {
  designStyle: 'minimalist' | 'maximalist' | 'brutalist' | 'glassmorphism' | 'neumorphism' | 'modern' | 'classic';
  colorHarmony: 'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'split-complementary' | 'tetradic';
  brandPersonality: 'trustworthy' | 'innovative' | 'luxurious' | 'playful' | 'authoritative' | 'energetic' | 'calm';
  targetEmotion: 'calm' | 'energetic' | 'confident' | 'creative' | 'professional';
  industryContext: 'e-commerce' | 'saas' | 'education' | 'healthcare' | 'finance' | 'entertainment' | 'portfolio' | 'blog' | 'documentation';
  contentHierarchy?: { primaryFocus: string; secondaryElements: string[]; visualWeight: string };
  motionPreferences?: { enableAnimations: boolean; animationIntensity: string; transitionSpeed: string };
  accessibilityLevel: 'AA' | 'AAA';
}
```

#### Template Structure
```typescript
interface ProfessionalTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  designMetadata: DesignMetadata;
  designTokens: DesignTokens;
  frames: Frame[];
  qualityMetrics: QualityMetrics;
  version: string;
  tags: string[];
}
```

#### Validation
```typescript
import { validateTemplate, validateTemplateWithErrors } from '@/schemas/professionalTemplateSchema';

const template = validateTemplate(data); // Throws on error
const result = validateTemplateWithErrors(data); // Returns { success, data?, errors? }
```

#### Migration
```typescript
import { migrateTemplate } from '@/schemas/professionalTemplateSchema';

const newTemplate = migrateTemplate(oldTemplate);
// Automatically migrates from old schema to new professional schema
```

### 4. Professional AI Engine (`professionalAIEngine.ts`)

#### Template Generation
```typescript
import { professionalAIEngine } from '@/lib/ai/professionalAIEngine';

const template = await professionalAIEngine.generateTemplate({
  designStyle: 'modern',
  colorHarmony: 'complementary',
  brandPersonality: 'trustworthy',
  targetEmotion: 'professional',
  industryContext: 'saas',
});
```

#### Industry-Specific Patterns
Pre-configured design patterns for different industries:
- **E-commerce**: Red primary, grid layout, comfortable density
- **SaaS**: Blue primary, flex layout, spacious density
- **Healthcare**: Green primary, flex layout, comfortable density
- **Finance**: Navy primary, grid layout, compact density
- **Portfolio**: Dark gray primary, asymmetric layout, spacious density

#### Design Style Enhancements
- **Glassmorphism**: Backdrop blur with brand-aware transparency
- **Neumorphism**: Soft shadow systems with proper contrast
- **Brutalist**: Bold shadows and zero border radius

#### Quality Metrics
Automatic quality scoring:
```typescript
qualityMetrics: {
  designScore: 85-95,
  accessibilityScore: 90-98,
  performanceScore: 88-98,
  wcagCompliance: 'AAA'
}
```

### 5. React Integration

#### Hook: `useProfessionalAITemplate`
```typescript
import { useProfessionalAITemplate } from '@/hooks/useProfessionalAITemplate';

const { loading, progress, template, generateTemplate, regenerateAspect, exportAsCSS, validateQuality } = useProfessionalAITemplate();

// Generate template
const template = await generateTemplate(prompt, { useLocalEngine: true });

// Regenerate specific aspect
const updated = await regenerateAspect(template, 'colors');

// Export as CSS
const css = exportAsCSS(template);

// Validate quality
const validation = validateQuality(template);
```

#### Component: `ProfessionalAITemplateGenerator`
```typescript
import { ProfessionalAITemplateGenerator } from '@/components/creatives/ProfessionalAITemplateGenerator';

<ProfessionalAITemplateGenerator
  open={isOpen}
  onOpenChange={setIsOpen}
  onTemplateGenerated={(template) => console.log(template)}
/>
```

## Usage Examples

### Example 1: Generate a SaaS Landing Page
```typescript
import { professionalAIEngine } from '@/lib/ai/professionalAIEngine';

const template = await professionalAIEngine.generateTemplate({
  designStyle: 'modern',
  colorHarmony: 'complementary',
  brandPersonality: 'innovative',
  targetEmotion: 'confident',
  industryContext: 'saas',
  targetAudience: 'Enterprise teams',
  keyMessages: ['Fast', 'Secure', 'Scalable'],
});
```

### Example 2: Create Custom Design System
```typescript
import { createProfessionalDesignSystem, designTokensToCSS } from '@/lib';

const system = createProfessionalDesignSystem('trustworthy', '#FFFFFF');
const css = designTokensToCSS(system);

// Use in your app
document.head.appendChild(
  Object.assign(document.createElement('style'), { textContent: css })
);
```

### Example 3: Generate Color Harmony
```typescript
import { generateColorHarmony, generateColorScale } from '@/lib';

const baseColor = '#3B82F6';
const harmonyColors = generateColorHarmony(baseColor, 'complementary');
const primaryScale = generateColorScale(baseColor);

console.log('Harmony:', harmonyColors);
console.log('Scale:', primaryScale);
```

### Example 4: Ensure WCAG Compliance
```typescript
import { getContrastRatio, adjustForContrast, meetsWCAG_AAA } from '@/lib';

const foreground = '#666666';
const background = '#FFFFFF';

if (!meetsWCAG_AAA(foreground, background)) {
  const adjusted = adjustForContrast(foreground, background, 7);
  console.log('Adjusted color:', adjusted);
  console.log('New ratio:', getContrastRatio(adjusted, background));
}
```

## Performance Optimizations

1. **Efficient Color Calculations**: Optimized CIELAB transformations
2. **Tree-shaken Design Tokens**: Only include used tokens
3. **Lazy-loaded Components**: Dynamic imports for heavy components
4. **CSS Custom Properties**: Runtime theme switching without recompilation
5. **Memoized Calculations**: Cached color harmony and scale generation

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Modern mobile browsers

## TypeScript Support

Fully typed with comprehensive interfaces and branded types:
- Strict null checks
- Discriminated unions for layer types
- Generic type constraints
- Type guards for validation

## Accessibility Features

- WCAG 2.1 AAA compliance by default
- Automatic contrast ratio adjustments
- Focus state indicators
- Semantic color roles
- Screen reader friendly

## Migration Guide

### From Old Template Schema

```typescript
import { migrateTemplate } from '@/schemas/professionalTemplateSchema';

// Old template
const oldTemplate = {
  id: '123',
  name: 'My Template',
  frames: [...],
};

// Migrate to new schema
const newTemplate = migrateTemplate(oldTemplate);

// Validate
const validated = validateTemplate(newTemplate);
```

## API Reference

See individual file JSDoc comments for detailed API documentation.

## Future Enhancements

- [ ] Variable font support with font-variation-settings
- [ ] Advanced micro-interactions library
- [ ] More template categories (blog, documentation)
- [ ] AI-powered layout optimization
- [ ] Real-time collaboration features
- [ ] Export to popular design tools (Figma, Sketch)
