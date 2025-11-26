/**
 * Unified AI Web Builder Hook
 * Single hook for all AI website generation with design thinking
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { AIGeneratedTemplate, AITemplatePrompt } from '@/types/template';
import type { GenerationCandidate } from '@/types/designSystem';
import UnifiedAIWebBuilderService from '@/services/unifiedAIWebBuilder';

interface DesignThinkingInsights {
  userNeeds: string[];
  problemStatement: string;
  solutions: string[];
  rationale: string;
  improvements: string[];
}

interface GenerationResult {
  template: AIGeneratedTemplate;
  htmlCode: string;
  candidates: GenerationCandidate[];
  bestScore: number;
  designThinking: DesignThinkingInsights;
  iterations: number;
}

interface GenerationStrategy {
  count?: number;
  diversity?: 'low' | 'medium' | 'high';
  parallel?: boolean;
  evaluateAll?: boolean;
}

export const useUnifiedAIWebBuilder = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<string>('');
  const [result, setResult] = useState<GenerationResult | null>(null);

  /**
   * Generate optimal website using design thinking
   */
  const generateWebsite = useCallback(
    async (
      prompt: AITemplatePrompt,
      strategy: GenerationStrategy = {}
    ): Promise<GenerationResult | null> => {
      setLoading(true);
      setProgress(0);
      setResult(null);

      try {
        // Phase 1: Empathize (16%)
        setCurrentPhase('Understanding your needs...');
        setProgress(16);
        toast.info('👂 Understanding your requirements');

        await new Promise((resolve) => setTimeout(resolve, 500));

        // Phase 2: Define (33%)
        setCurrentPhase('Defining requirements...');
        setProgress(33);
        toast.info('📋 Analyzing and validating requirements');

        await new Promise((resolve) => setTimeout(resolve, 500));

        // Phase 3: Ideate (50%)
        setCurrentPhase('Generating ideas...');
        setProgress(50);
        toast.info('💡 Creating multiple solution candidates');

        await new Promise((resolve) => setTimeout(resolve, 500));

        // Phase 4: Prototype (66%)
        setCurrentPhase('Creating prototypes...');
        setProgress(66);
        toast.info('🎨 Building template prototypes');

        await new Promise((resolve) => setTimeout(resolve, 500));

        // Phase 5: Test (83%)
        setCurrentPhase('Evaluating quality...');
        setProgress(83);
        toast.info('🧪 Testing all candidates simultaneously');

        // Generate with unified service
        const generationResult =
          await UnifiedAIWebBuilderService.generateOptimalWebsite(
            prompt,
            strategy
          );

        // Phase 6: Iterate (100%)
        setCurrentPhase('Finalizing...');
        setProgress(100);
        toast.success(
          `✨ Website generated! Score: ${generationResult.bestScore}/100`
        );

        // Show design thinking insights
        if (generationResult.designThinking) {
          toast.info(
            `💭 ${generationResult.designThinking.problemStatement}`,
            {
              duration: 5000,
            }
          );
        }

        setResult(generationResult);
        return generationResult;
      } catch (error) {
        console.error('Error generating website:', error);
        const errorMessage =
          error instanceof Error ? error.message : 'An unexpected error occurred';
        toast.error(`Failed to generate website: ${errorMessage}`);
        return null;
      } finally {
        setLoading(false);
        setCurrentPhase('');
      }
    },
    []
  );

  /**
   * Generate quick website (single candidate, fast)
   */
  const generateQuick = useCallback(
    async (prompt: AITemplatePrompt): Promise<GenerationResult | null> => {
      return generateWebsite(prompt, {
        count: 1,
        diversity: 'low',
        parallel: false,
        evaluateAll: true,
      });
    },
    [generateWebsite]
  );

  /**
   * Generate high-quality website (multiple candidates, thorough evaluation)
   */
  const generatePremium = useCallback(
    async (prompt: AITemplatePrompt): Promise<GenerationResult | null> => {
      return generateWebsite(prompt, {
        count: 5,
        diversity: 'high',
        parallel: true,
        evaluateAll: true,
      });
    },
    [generateWebsite]
  );

  /**
   * Reset the builder state
   */
  const reset = useCallback(() => {
    setLoading(false);
    setProgress(0);
    setCurrentPhase('');
    setResult(null);
  }, []);

  return {
    // State
    loading,
    progress,
    currentPhase,
    result,

    // Generation methods
    generateWebsite,
    generateQuick,
    generatePremium,
    
    // Utilities
    reset,

    // Convenience accessors
    template: result?.template || null,
    htmlCode: result?.htmlCode || null,
    candidates: result?.candidates || [],
    bestScore: result?.bestScore || 0,
    designThinking: result?.designThinking || null,
    iterations: result?.iterations || 0,
  };
};

export default useUnifiedAIWebBuilder;
