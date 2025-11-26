import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { AIGeneratedTemplate, AITemplatePrompt } from '@/types/template';
import type { GenerationCandidate } from '@/types/designSystem';
import UnifiedAIWebBuilderService from '@/services/unifiedAIWebBuilder';
import { toast } from 'sonner';

/**
 * AI Template Hook - Now uses Unified AI Web Builder
 * @deprecated Use useUnifiedAIWebBuilder for better design thinking and evaluation
 */
export const useAITemplate = () => {
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState<AIGeneratedTemplate | null>(null);
  const [candidates, setCandidates] = useState<GenerationCandidate[]>([]);
  const [htmlCode, setHtmlCode] = useState<string>('');

  /**
   * Generate template using Unified AI Web Builder
   */
  const generateTemplate = async (prompt: AITemplatePrompt): Promise<AIGeneratedTemplate | null> => {
    setLoading(true);
    try {
      toast.info('🚀 Generating with Unified AI Web Builder...');

      // Use unified service with design thinking
      const result = await UnifiedAIWebBuilderService.generateOptimalWebsite(prompt, {
        count: 3,
        diversity: 'high',
        parallel: true,
        evaluateAll: true,
      });

      if (!result) {
        toast.error('Failed to generate template');
        return null;
      }

      // Store results
      setTemplate(result.template);
      setHtmlCode(result.htmlCode);
      setCandidates(result.candidates);

      toast.success(`✨ Generated! Score: ${result.bestScore}/100`);

      return result.template;
    } catch (error) {
      console.error('Error generating template:', error);
      toast.error('Failed to generate template');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generate elite website (legacy compatibility)
   */
  const generateEliteWebsite = async (prompt: AITemplatePrompt) => {
    setLoading(true);
    try {
      const result = await UnifiedAIWebBuilderService.generateOptimalWebsite(prompt, {
        count: 1,
        diversity: 'medium',
        parallel: false,
        evaluateAll: true,
      });

      if (!result) return null;

      setHtmlCode(result.htmlCode);
      setTemplate(result.template);

      return {
        html: result.htmlCode,
        sections: result.template.sections,
      };
    } catch (error) {
      console.error('Error generating elite website:', error);
      toast.error('Failed to generate website');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generate image using AI
   */
  const generateImage = async (prompt: string, style?: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-template-image', {
        body: { prompt, style }
      });

      if (error) {
        if (error.message.includes('429')) {
          toast.error('Rate limit exceeded. Please try again later.');
        } else if (error.message.includes('402')) {
          toast.error('Payment required. Please add credits to your workspace.');
        } else {
          toast.error('Failed to generate image: ' + error.message);
        }
        return null;
      }

      return data.imageUrl;
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Failed to generate image');
      return null;
    }
  };

  return {
    loading,
    template,
    candidates,
    htmlCode,
    generateTemplate,
    generateEliteWebsite,
    generateImage,
  };
};
