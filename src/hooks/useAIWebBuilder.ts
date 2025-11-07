import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { layoutPlanningService } from '@/services/ai/planLayout';
import { themeSynthesisService } from '@/services/ai/synthesizeTheme';
import type { 
  AIProjectRequest, 
  AILayoutPlan,
  AIComponentKey
} from '@/types/aiWebBuilder';

// Import component and animation libraries
import componentLibrary from '@/services/ai/data/components.json';
import animationPresets from '@/services/ai/data/animationPresets.json';

export interface AIWebBuilderResponse {
  layoutPlan: AILayoutPlan;
  code?: {
    html: string;
    css: string;
    javascript: string;
  };
  explanation: string;
  confidence: number;
}

export interface UseAIWebBuilderOptions {
  onLayoutGenerated?: (layout: AILayoutPlan) => void;
  onCodeGenerated?: (code: { html: string; css: string; javascript: string }) => void;
}

/**
 * New unified AI Web Builder hook using the new architecture
 * Replaces: useWebBuilderAI, useWebBuilder, usePageGenerator
 */
export const useAIWebBuilder = (options?: UseAIWebBuilderOptions) => {
  const [loading, setLoading] = useState(false);
  const [currentLayout, setCurrentLayout] = useState<AILayoutPlan | null>(null);
  const [generatedCode, setGeneratedCode] = useState<AIWebBuilderResponse['code'] | null>(null);

  /**
   * Parse user prompt into AIProjectRequest
   */
  const parsePrompt = (prompt: string): AIProjectRequest => {
    const lowerPrompt = prompt.toLowerCase();

    // Detect industry
    let industry: string = 'general';
    if (/\b(restaurant|food|dining|cafe|bistro|menu)\b/i.test(lowerPrompt)) industry = 'restaurant';
    else if (/\b(portfolio|resume|cv|showcase|creative|designer|developer)\b/i.test(lowerPrompt)) industry = 'portfolio';
    else if (/\b(contractor|contracting|construction|builder|home|repair)\b/i.test(lowerPrompt)) industry = 'contracting';
    else if (/\b(creator|content|influencer|youtube|streamer|artist)\b/i.test(lowerPrompt)) industry = 'creator';
    else if (/\b(campaign|ad|marketing|promo|launch)\b/i.test(lowerPrompt)) industry = 'ad_campaign';
    else if (/\b(saas|software|platform|app|subscription)\b/i.test(lowerPrompt)) industry = 'saas';
    else if (/\b(ecommerce|shop|store|product|retail)\b/i.test(lowerPrompt)) industry = 'ecommerce';
    else if (/\b(agency|consulting|services|professional)\b/i.test(lowerPrompt)) industry = 'agency';

    // Detect tone
    let tone: AIProjectRequest['brand']['tone'] = 'professional';
    if (/\b(minimal|clean|simple|modern)\b/i.test(lowerPrompt)) tone = 'minimal';
    else if (/\b(luxury|premium|elegant|sophisticated)\b/i.test(lowerPrompt)) tone = 'luxury';
    else if (/\b(energetic|vibrant|bold|dynamic)\b/i.test(lowerPrompt)) tone = 'energetic';
    else if (/\b(playful|fun|creative|quirky)\b/i.test(lowerPrompt)) tone = 'playful';
    else if (/\b(techy|technical|digital|innovative)\b/i.test(lowerPrompt)) tone = 'techy';

    // Detect animation level
    let animationLevel: AIProjectRequest['animationLevel'] = 'subtle';
    if (/\b(no animation|static|simple)\b/i.test(lowerPrompt)) animationLevel = 'none';
    else if (/\b(immersive|dynamic|animated|interactive)\b/i.test(lowerPrompt)) animationLevel = 'immersive';

    // Extract goals (default to common goals)
    const goals: string[] = [];
    if (/\b(convert|sales|lead|signup|action)\b/i.test(lowerPrompt)) goals.push('increase_conversions');
    if (/\b(brand|identity|recognition|awareness)\b/i.test(lowerPrompt)) goals.push('build_brand');
    if (/\b(showcase|display|present|highlight)\b/i.test(lowerPrompt)) goals.push('showcase_work');
    if (/\b(engage|interact|experience)\b/i.test(lowerPrompt)) goals.push('engage_users');
    if (goals.length === 0) goals.push('inform');

    // Extract features
    const features: string[] = [];
    if (/\b(booking|appointment|schedule|reserve)\b/i.test(lowerPrompt)) features.push('booking');
    if (/\b(gallery|portfolio|showcase|grid)\b/i.test(lowerPrompt)) features.push('gallery');
    if (/\b(contact|form|email|message)\b/i.test(lowerPrompt)) features.push('contact-form');
    if (/\b(testimonial|review|social proof)\b/i.test(lowerPrompt)) features.push('testimonials');
    if (/\b(blog|article|content|news)\b/i.test(lowerPrompt)) features.push('blog');

    return {
      brand: {
        name: extractBrandName(prompt) || 'Your Brand',
        industry,
        tone,
        tagline: '',
        palette: [] // User can provide custom colors later
      },
      goals,
      features,
      animationLevel,
      styleUniqueness: 0.7 // Default balanced uniqueness
    };
  };

  /**
   * Extract brand name from prompt (simple heuristic)
   */
  const extractBrandName = (prompt: string): string | null => {
    const match = prompt.match(/for\s+([A-Z][a-zA-Z\s]+)(?:\s|$|,|\.)/);
    return match ? match[1].trim() : null;
  };

  /**
   * Generate layout plan from prompt
   */
  const generateLayout = async (prompt: string, customRequest?: Partial<AIProjectRequest>): Promise<AILayoutPlan | null> => {
    setLoading(true);
    try {
      // Parse prompt or use custom request
      const projectRequest = customRequest 
        ? { ...parsePrompt(prompt), ...customRequest }
        : parsePrompt(prompt);

      console.log('[useAIWebBuilder] Generating layout for:', projectRequest);

      // Use layout planning service - it returns AILayoutResponse
      const layoutResponse = await layoutPlanningService.planLayout(projectRequest);
      const layoutPlan = layoutResponse.plan;
      
      setCurrentLayout(layoutPlan);
      
      // Notify callback
      if (options?.onLayoutGenerated) {
        options.onLayoutGenerated(layoutPlan);
      }

      toast.success(`✨ Layout plan generated with ${layoutPlan.sections.length} sections!`);
      return layoutPlan;
    } catch (error) {
      console.error('[useAIWebBuilder] Error generating layout:', error);
      toast.error('Failed to generate layout plan');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generate React/HTML code from layout plan
   */
  const generateCode = async (
    layoutPlan: AILayoutPlan, 
    format: 'react' | 'html' = 'html'
  ): Promise<AIWebBuilderResponse['code'] | null> => {
    setLoading(true);
    try {
      console.log('[useAIWebBuilder] Generating code from layout plan');

      // Call edge function with enhanced context
      const { data, error } = await supabase.functions.invoke('ai-web-builder', {
        body: {
          layoutPlan,
          componentLibrary,
          animationPresets,
          format,
          systemPrompt: generateSystemPrompt(layoutPlan)
        }
      });

      if (error) {
        console.error('[useAIWebBuilder] Edge function error:', error);
        if (error.message.includes('429')) {
          toast.error('Rate limit exceeded. Please try again later.');
        } else if (error.message.includes('402')) {
          toast.error('Payment required. Please add credits.');
        } else {
          toast.error('Failed to generate code: ' + error.message);
        }
        return null;
      }

      const code = data.code as AIWebBuilderResponse['code'];
      setGeneratedCode(code);

      // Notify callback
      if (options?.onCodeGenerated && code) {
        options.onCodeGenerated(code);
      }

      toast.success('✨ Code generated successfully!');
      return code;
    } catch (error) {
      console.error('[useAIWebBuilder] Error generating code:', error);
      toast.error('An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generate layout AND code in one step
   */
  const generateWebsite = async (
    prompt: string, 
    customRequest?: Partial<AIProjectRequest>
  ): Promise<AIWebBuilderResponse | null> => {
    const layoutPlan = await generateLayout(prompt, customRequest);
    if (!layoutPlan) return null;

    const code = await generateCode(layoutPlan);
    
    return {
      layoutPlan,
      code: code || undefined,
      explanation: `Generated ${layoutPlan.gridSystem} layout with ${layoutPlan.sections.length} sections`,
      confidence: 0.85 // Default confidence since planLayout doesn't return it in the plan itself
    };
  };

  /**
   * Generate system prompt for edge function
   */
  const generateSystemPrompt = (layoutPlan: AILayoutPlan): string => {
    return `You are an expert web developer generating production-ready code.

LAYOUT PLAN:
${JSON.stringify(layoutPlan, null, 2)}

COMPONENT LIBRARY:
${JSON.stringify(componentLibrary, null, 2)}

ANIMATION PRESETS:
${JSON.stringify(animationPresets, null, 2)}

INSTRUCTIONS:
1. Generate code using EXACTLY the components specified in layoutPlan.sections
2. Use the component variants as specified (e.g., AnimatedHero variant "gradient")
3. Apply animations from animationPresets matching the animation patterns
4. Use the color palette and typography system from layoutPlan
5. Follow the grid system: ${layoutPlan.gridSystem}
6. Maintain the section order and spacing rhythm: ${layoutPlan.rhythm}
7. Integrate images as specified in each section's imageIntegration
8. Generate clean, production-ready, responsive code
9. Use Tailwind CSS for styling with the specified color tokens
10. Include Framer Motion for animations (if React) or CSS animations (if HTML)

OUTPUT FORMAT:
Return ONLY valid code without explanations or markdown formatting.`;
  };

  /**
   * Save layout to database (TODO: Create proper table schema)
   */
  const saveLayout = async (layoutPlan: AILayoutPlan, prompt: string) => {
    try {
      // TODO: Create ai_web_builder_projects table in Supabase
      console.log('Saving layout:', { layoutPlan, prompt });
      toast.info('Layout save feature coming soon!');
      return null;
    } catch (error) {
      console.error('Error saving layout:', error);
      toast.error('Failed to save layout');
      return null;
    }
  };

  return {
    loading,
    currentLayout,
    generatedCode,
    generateLayout,
    generateCode,
    generateWebsite,
    saveLayout,
    // Utilities
    parsePrompt,
    componentLibrary,
    animationPresets
  };
};
