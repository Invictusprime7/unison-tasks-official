/**
 * Professional AI Template System - Usage Examples
 * Demonstrates how to use the new professional design system
 */

import {
  // Color Theory
  generateColorHarmony,
  generateColorScale,
  getBrandPersonalityColor,
  getContrastRatio,
  adjustForContrast,
  meetsWCAG_AAA,
  
  // Design Tokens
  createProfessionalDesignSystem,
  designTokensToCSS,
  
  // AI Engine
  professionalAIEngine,
  
  // Schema
  validateTemplate,
  migrateTemplate,
  
  // Utilities
  quickStartDesignSystem,
} from '@/lib';

// ============================================================================
// Example 1: Generate a Complete Design System
// ============================================================================

export async function example1_CreateDesignSystem() {
  console.log('=== Example 1: Create Design System ===');
  
  // Quick start with a brand personality
  const { system, css } = quickStartDesignSystem({
    brandPersonality: 'innovative',
    colorHarmony: 'complementary',
    background: '#FFFFFF',
  });
  
  console.log('Primary Colors:', system.colors.primary);
  console.log('Brand Colors:', system.colors.brand);
  console.log('Typography:', system.typography.families);
  console.log('CSS Variables:\n', css);
  
  return system;
}

// ============================================================================
// Example 2: Generate Color Harmonies
// ============================================================================

export function example2_ColorHarmony() {
  console.log('=== Example 2: Color Harmony ===');
  
  const baseColor = '#3B82F6'; // Blue
  
  // Generate different harmony types
  const complementary = generateColorHarmony(baseColor, 'complementary');
  const triadic = generateColorHarmony(baseColor, 'triadic');
  const analogous = generateColorHarmony(baseColor, 'analogous');
  
  console.log('Complementary:', complementary);
  console.log('Triadic:', triadic);
  console.log('Analogous:', analogous);
  
  return { complementary, triadic, analogous };
}

// ============================================================================
// Example 3: Ensure WCAG AAA Compliance
// ============================================================================

export function example3_WCAGCompliance() {
  console.log('=== Example 3: WCAG AAA Compliance ===');
  
  const foreground = '#666666';
  const background = '#FFFFFF';
  
  // Check current contrast
  const currentRatio = getContrastRatio(foreground, background);
  console.log('Current contrast ratio:', currentRatio);
  
  // Check if it meets AAA
  const isCompliant = meetsWCAG_AAA(foreground, background);
  console.log('Meets WCAG AAA:', isCompliant);
  
  // If not compliant, adjust the color
  if (!isCompliant) {
    const adjusted = adjustForContrast(foreground, background, 7);
    const newRatio = getContrastRatio(adjusted, background);
    
    console.log('Adjusted color:', adjusted);
    console.log('New contrast ratio:', newRatio);
    console.log('Now compliant:', meetsWCAG_AAA(adjusted, background));
    
    return adjusted;
  }
  
  return foreground;
}

// ============================================================================
// Example 4: Generate Professional Template with AI
// ============================================================================

export async function example4_AITemplateGeneration() {
  console.log('=== Example 4: AI Template Generation ===');
  
  const template = await professionalAIEngine.generateTemplate({
    designStyle: 'modern',
    colorHarmony: 'complementary',
    brandPersonality: 'trustworthy',
    targetEmotion: 'professional',
    industryContext: 'saas',
    targetAudience: 'Enterprise teams',
    keyMessages: ['Fast', 'Secure', 'Scalable'],
    accessibilityLevel: 'AAA',
  });
  
  console.log('Generated Template:');
  console.log('- Name:', template.name);
  console.log('- Category:', template.category);
  console.log('- Frames:', template.frames.length);
  console.log('- Quality Score:', template.qualityMetrics?.designScore);
  console.log('- Accessibility:', template.qualityMetrics?.wcagCompliance);
  
  return template;
}

// ============================================================================
// Example 5: Generate Color Scale
// ============================================================================

export function example5_ColorScale() {
  console.log('=== Example 5: Color Scale Generation ===');
  
  const brandColor = getBrandPersonalityColor('innovative'); // Purple
  const scale = generateColorScale(brandColor);
  
  console.log('Brand Color:', brandColor);
  console.log('Color Scale:');
  Object.entries(scale).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });
  
  return scale;
}

// ============================================================================
// Example 6: Migrate Old Template to New Schema
// ============================================================================

export function example6_TemplateMigration() {
  console.log('=== Example 6: Template Migration ===');
  
  // Simulate old template structure
  const oldTemplate = {
    id: 'old-123',
    name: 'Legacy Template',
    description: 'An old template',
    category: 'general',
    frames: [
      {
        name: 'Frame 1',
        width: 1080,
        height: 1080,
        background: '#ffffff',
        layers: [],
        layout: 'free' as const,
        gap: 0,
        padding: 0,
      },
    ],
  };
  
  // Migrate to new professional schema
  const migratedTemplate = migrateTemplate(oldTemplate);
  
  console.log('Migrated Template:');
  console.log('- Version:', migratedTemplate.version);
  console.log('- Has Design Metadata:', !!migratedTemplate.designMetadata);
  console.log('- Style:', migratedTemplate.designMetadata?.style);
  
  // Validate the migrated template
  const validated = validateTemplate(migratedTemplate);
  console.log('- Validation: Passed');
  
  return validated;
}

// ============================================================================
// Example 7: Export Design System as CSS
// ============================================================================

export function example7_ExportCSS() {
  console.log('=== Example 7: Export as CSS ===');
  
  const system = createProfessionalDesignSystem('trustworthy', '#FFFFFF');
  const css = designTokensToCSS(system);
  
  console.log('Generated CSS Custom Properties:');
  console.log(css);
  
  // You can inject this into your document
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    console.log('CSS injected into document head');
  }
  
  return css;
}

// ============================================================================
// Example 8: Brand Personality Colors
// ============================================================================

export function example8_BrandPersonalities() {
  console.log('=== Example 8: Brand Personality Colors ===');
  
  const personalities = [
    'trustworthy',
    'innovative',
    'luxurious',
    'playful',
    'authoritative',
    'energetic',
    'calm',
  ] as const;
  
  const colors: Record<string, string> = {};
  
  personalities.forEach((personality) => {
    const color = getBrandPersonalityColor(personality);
    colors[personality] = color;
    console.log(`${personality}: ${color}`);
  });
  
  return colors;
}

// ============================================================================
// Run All Examples
// ============================================================================

export async function runAllExamples() {
  console.log('\n🎨 Professional AI Template System - Examples\n');
  
  try {
    await example1_CreateDesignSystem();
    console.log('\n');
    
    example2_ColorHarmony();
    console.log('\n');
    
    example3_WCAGCompliance();
    console.log('\n');
    
    await example4_AITemplateGeneration();
    console.log('\n');
    
    example5_ColorScale();
    console.log('\n');
    
    example6_TemplateMigration();
    console.log('\n');
    
    example7_ExportCSS();
    console.log('\n');
    
    example8_BrandPersonalities();
    console.log('\n');
    
    console.log('✅ All examples completed successfully!');
  } catch (error) {
    console.error('❌ Error running examples:', error);
  }
}

// Export for use in other files
export default {
  example1_CreateDesignSystem,
  example2_ColorHarmony,
  example3_WCAGCompliance,
  example4_AITemplateGeneration,
  example5_ColorScale,
  example6_TemplateMigration,
  example7_ExportCSS,
  example8_BrandPersonalities,
  runAllExamples,
};
