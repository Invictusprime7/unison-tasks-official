/**
 * Enhanced AI Template Hook with Professional AI Engine Integration
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { professionalAIEngine } from '@/lib/ai/professionalAIEngine';
import type {
  ProfessionalAIPrompt,
  ProfessionalTemplate,
} from '@/schemas/professionalTemplateSchema';

export interface GenerationOptions {
  useLocalEngine?: boolean; // Use local AI engine instead of Supabase function
  saveToDatabase?: boolean; // Save generated template to database
}

export const useProfessionalAITemplate = () => {
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState<ProfessionalTemplate | null>(null);
  const [progress, setProgress] = useState(0);

  /**
   * Generate a professional template using the advanced AI engine
   */
  const generateTemplate = async (
    prompt: ProfessionalAIPrompt,
    options: GenerationOptions = { useLocalEngine: true, saveToDatabase: false }
  ): Promise<ProfessionalTemplate | null> => {
    setLoading(true);
    setProgress(0);

    try {
      // Step 1: Initialize design system (20%)
      setProgress(20);
      toast.info('Analyzing brand personality...');

      // Step 2: Generate color palette (40%)
      setProgress(40);
      toast.info('Creating color harmony palette...');

      // Step 3: Generate template structure (60%)
      setProgress(60);
      toast.info('Building template structure...');

      // Generate template using professional AI engine
      const generatedTemplate = await professionalAIEngine.generateTemplate(prompt);

      // Step 4: Apply design tokens (80%)
      setProgress(80);
      toast.info('Applying design tokens...');

      // Step 5: Finalize (100%)
      setProgress(100);

      setTemplate(generatedTemplate);
      toast.success('Professional template generated successfully!', {
        description: `Quality Score: ${generatedTemplate.qualityMetrics?.designScore}/100`,
      });

      return generatedTemplate;
    } catch (error) {
      console.error('Error generating professional template:', error);
      toast.error('Failed to generate template', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  /**
   * Regenerate specific aspects of a template
   */
  const regenerateAspect = async (
    currentTemplate: ProfessionalTemplate,
    aspect: 'colors' | 'layout' | 'typography'
  ): Promise<ProfessionalTemplate | null> => {
    if (!currentTemplate.designMetadata) {
      toast.error('Template missing design metadata');
      return null;
    }

    setLoading(true);
    try {
      toast.info(`Regenerating ${aspect}...`);

      // Recreate prompt from existing template
      const industry = currentTemplate.designMetadata.industry;
      const validIndustries = ['e-commerce', 'saas', 'education', 'healthcare', 'finance', 'entertainment', 'portfolio', 'blog', 'documentation'] as const;
      const industryContext = validIndustries.includes(industry as any) ? industry as any : 'saas';
      
      const prompt: ProfessionalAIPrompt = {
        designStyle: currentTemplate.designMetadata.style,
        colorHarmony: currentTemplate.designMetadata.colorHarmony,
        brandPersonality: currentTemplate.designMetadata.brandPersonality,
        targetEmotion: currentTemplate.designMetadata.targetEmotion,
        industryContext,
      };

      // Generate new template
      const newTemplate = await professionalAIEngine.generateTemplate(prompt);

      // Merge only the regenerated aspect
      let updatedTemplate = { ...currentTemplate };
      if (aspect === 'colors' && newTemplate.designTokens && currentTemplate.designTokens) {
        updatedTemplate.designTokens = {
          ...currentTemplate.designTokens,
          colors: newTemplate.designTokens.colors,
        };
      } else if (aspect === 'layout') {
        updatedTemplate.frames = newTemplate.frames;
      } else if (aspect === 'typography' && newTemplate.designTokens && currentTemplate.designTokens) {
        updatedTemplate.designTokens = {
          ...currentTemplate.designTokens,
          typography: newTemplate.designTokens.typography,
        };
      }

      updatedTemplate.updatedAt = new Date().toISOString();
      setTemplate(updatedTemplate);
      toast.success(`${aspect} regenerated successfully!`);

      return updatedTemplate;
    } catch (error) {
      console.error(`Error regenerating ${aspect}:`, error);
      toast.error(`Failed to regenerate ${aspect}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Export template as CSS custom properties
   */
  const exportAsCSS = (template: ProfessionalTemplate): string => {
    if (!template.designTokens) {
      return '';
    }

    const cssVars: string[] = [':root {'];

    // Export colors
    if (template.designTokens.colors?.primary) {
      Object.entries(template.designTokens.colors.primary).forEach(([key, value]) => {
        cssVars.push(`  --color-primary-${key}: ${value};`);
      });
    }

    // Export spacing
    if (template.designTokens.spacing) {
      Object.entries(template.designTokens.spacing).forEach(([key, value]) => {
        cssVars.push(`  --spacing-${key}: ${value};`);
      });
    }

    // Export shadows
    if (template.designTokens.shadows?.elevation) {
      Object.entries(template.designTokens.shadows.elevation).forEach(([key, value]) => {
        cssVars.push(`  --shadow-${key}: ${value};`);
      });
    }

    cssVars.push('}');
    return cssVars.join('\n');
  };

  /**
   * Validate template quality
   */
  const validateQuality = (template: ProfessionalTemplate): {
    valid: boolean;
    issues: string[];
    score: number;
  } => {
    const issues: string[] = [];
    let score = 100;

    // Check for design tokens
    if (!template.designTokens) {
      issues.push('Missing design tokens');
      score -= 30;
    }

    // Check for frames
    if (!template.frames || template.frames.length === 0) {
      issues.push('No frames defined');
      score -= 40;
    }

    // Check for quality metrics
    if (!template.qualityMetrics) {
      issues.push('Missing quality metrics');
      score -= 10;
    } else {
      if ((template.qualityMetrics.designScore || 0) < 70) {
        issues.push('Low design quality score');
        score -= 10;
      }
      if ((template.qualityMetrics.accessibilityScore || 0) < 90) {
        issues.push('Accessibility score below AAA standard');
        score -= 10;
      }
    }

    return {
      valid: issues.length === 0,
      issues,
      score: Math.max(0, score),
    };
  };

  return {
    loading,
    progress,
    template,
    generateTemplate,
    regenerateAspect,
    exportAsCSS,
    validateQuality,
  };
};
