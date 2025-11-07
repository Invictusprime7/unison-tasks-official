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
   * Build React/TypeScript prompt for AI code generation
   */
  const buildReactTypeScriptPrompt = (layoutPlan: AILayoutPlan): string => {
    return `Create a complete, production-ready React/TypeScript component with Tailwind CSS:

**PROJECT TYPE:** ${layoutPlan.sections[0]?.component || 'website'}
**GRID SYSTEM:** ${layoutPlan.gridSystem}
**COLOR PALETTE:** ${layoutPlan.colorPalette.name}
- Primary: ${layoutPlan.colorPalette.primary}
- Secondary: ${layoutPlan.colorPalette.secondary}
- Accent: ${layoutPlan.colorPalette.accent}

**TYPOGRAPHY:**
- Heading: ${layoutPlan.typography.fontFamily.heading}
- Body: ${layoutPlan.typography.fontFamily.body}

**SECTIONS TO IMPLEMENT (${layoutPlan.sections.length} total):**
${layoutPlan.sections.map((section, i) => `${i + 1}. ${section.component} (${section.variant})`).join('\n')}

**CRITICAL REQUIREMENTS:**

1. **React/TypeScript Structure:**
   - Use functional components with TypeScript
   - Define proper Props interfaces
   - Use React hooks (useState, useEffect, useCallback, useMemo)
   - Export named components: \`export const ComponentName: React.FC<Props>\`
   - Add proper TypeScript types for all variables and functions

2. **Tailwind CSS Styling:**
   - Use Tailwind utility classes exclusively
   - Apply the color palette consistently
   - Responsive design with sm:, md:, lg:, xl: breakpoints
   - Smooth animations with transition classes
   - Hover states and interactive effects

3. **Code Quality:**
   - Production-ready, no placeholders or TODOs
   - Proper error handling
   - Accessible markup (ARIA labels, semantic HTML)
   - Performance optimized (memoization where needed)
   - Clean, readable code with proper formatting

4. **Component Features:**
   - All ${layoutPlan.sections.length} sections implemented
   - Interactive elements with proper event handlers
   - Smooth scrolling and animations
   - Mobile-first responsive design
   - Dark mode support where appropriate

Generate complete, working React/TypeScript code in separate code blocks:
- \`\`\`tsx for the React component
- \`\`\`css for any additional CSS (if needed, though prefer Tailwind)
- \`\`\`typescript for any utility functions or types (if needed)

Make it beautiful, modern, and fully functional!`;
  };

  /**
   * Build HTML prompt for AI code generation
   */
  const buildHTMLPrompt = (layoutPlan: AILayoutPlan): string => {
    return `Create a complete, production-ready HTML website with Tailwind CSS:

**PROJECT TYPE:** ${layoutPlan.sections[0]?.component || 'website'}
**GRID SYSTEM:** ${layoutPlan.gridSystem}
**COLOR PALETTE:** ${layoutPlan.colorPalette.name}
- Primary: ${layoutPlan.colorPalette.primary}
- Secondary: ${layoutPlan.colorPalette.secondary}
- Accent: ${layoutPlan.colorPalette.accent}

**TYPOGRAPHY:**
- Heading: ${layoutPlan.typography.fontFamily.heading}
- Body: ${layoutPlan.typography.fontFamily.body}

**SECTIONS TO IMPLEMENT (${layoutPlan.sections.length} total):**
${layoutPlan.sections.map((section, i) => `${i + 1}. ${section.component} (${section.variant})`).join('\n')}

**REQUIREMENTS:**
- Use semantic HTML5 tags
- Tailwind CSS for all styling
- Implement all ${layoutPlan.sections.length} sections in order
- Apply the color palette throughout
- Make it fully responsive (mobile, tablet, desktop)
- Add smooth animations and transitions
- Include proper meta tags and structure
- Professional, modern design
- Vanilla JavaScript for interactivity (no frameworks)

Generate complete, working code that I can copy and use immediately.`;
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
   * Generate React/HTML code from layout plan using ai-code-assistant
   */
  const generateCode = async (
    layoutPlan: AILayoutPlan, 
    format: 'react' | 'html' = 'react'
  ): Promise<AIWebBuilderResponse['code'] | null> => {
    setLoading(true);
    try {
      console.log(`[useAIWebBuilder] Generating ${format.toUpperCase()} code from layout plan`);

      // Build a detailed prompt for code generation
      const prompt = format === 'react' 
        ? buildReactTypeScriptPrompt(layoutPlan)
        : buildHTMLPrompt(layoutPlan);

      // Call the ai-code-assistant edge function with proper authorization
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase configuration missing. Check environment variables.');
      }

      console.log('[useAIWebBuilder] Calling edge function:', {
        url: `${supabaseUrl}/functions/v1/ai-code-assistant`,
        hasAuth: !!supabaseKey,
        format
      });

      const response = await fetch(`${supabaseUrl}/functions/v1/ai-code-assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          mode: 'code',
          format: format
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[useAIWebBuilder] Edge function error response:', errorText);
        throw new Error(`Edge function failed: ${response.status} ${response.statusText}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response stream available');
      }

      const decoder = new TextDecoder();
      let fullContent = '';
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          
          // Parse SSE format (data: {...})
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonStr = line.slice(6); // Remove "data: " prefix
                if (jsonStr.trim() === '[DONE]') continue;
                
                const data = JSON.parse(jsonStr);
                if (data.choices?.[0]?.delta?.content) {
                  fullContent += data.choices[0].delta.content;
                }
              } catch (e) {
                // Skip invalid JSON chunks
                console.debug('[useAIWebBuilder] Skipping invalid JSON chunk:', line);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      console.log('[useAIWebBuilder] Full generated content length:', fullContent.length);

      // Parse code from the full streamed content
      let code = parseCodeFromContent(fullContent, format);

      // If React/TypeScript code is generated but might not render, convert to vanilla JS
      if (format === 'react' && code.html && !isValidReactCode(code.html)) {
        console.warn('[useAIWebBuilder] React code validation failed, converting to vanilla HTML');
        toast.info('Converting React components to vanilla HTML for compatibility...');
        code = convertReactToVanilla(code);
      }

      if (!code.html && !code.css && !code.javascript) {
        throw new Error('No code blocks found in AI response');
      }

      setGeneratedCode(code);

      // Notify callback
      if (options?.onCodeGenerated && code) {
        options.onCodeGenerated(code);
      }

      toast.success(`✨ ${format === 'react' ? 'React/TypeScript' : 'HTML'} code generated successfully!`);
      return code;
    } catch (error) {
      console.error('[useAIWebBuilder] Error generating code:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to generate code: ${errorMessage}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Parse code blocks from AI response content
   */
  const parseCodeFromContent = (content: string, format: 'react' | 'html' = 'html'): AIWebBuilderResponse['code'] => {
    // Try React/TypeScript patterns first
    const tsxMatch = content.match(/```tsx\n([\s\S]*?)\n```/) || 
                     content.match(/```typescript\n([\s\S]*?)\n```/) ||
                     content.match(/```ts\n([\s\S]*?)\n```/);
    
    // Try HTML patterns
    const htmlMatch = content.match(/```html\n([\s\S]*?)\n```/);
    
    // Try CSS patterns
    const cssMatch = content.match(/```css\n([\s\S]*?)\n```/);
    
    // Try JavaScript patterns
    const jsMatch = content.match(/```javascript\n([\s\S]*?)\n```/) || 
                    content.match(/```js\n([\s\S]*?)\n```/);

    // If React format, prioritize TSX/TS content
    if (format === 'react' && tsxMatch) {
      return {
        html: tsxMatch[1],
        css: cssMatch ? cssMatch[1] : '',
        javascript: jsMatch ? jsMatch[1] : ''
      };
    }

    // Otherwise use HTML
    return {
      html: htmlMatch ? htmlMatch[1] : (tsxMatch ? tsxMatch[1] : content),
      css: cssMatch ? cssMatch[1] : '',
      javascript: jsMatch ? jsMatch[1] : ''
    };
  };

  /**
   * Validate if React code is properly structured
   */
  const isValidReactCode = (code: string): boolean => {
    // Check for basic React patterns
    const hasReactImport = /import\s+.*React/.test(code);
    const hasComponentExport = /export\s+(const|function)/.test(code);
    const hasJSXReturn = /<[A-Z]/.test(code) || /<(div|section|main|header|footer|nav|article)/.test(code);
    const hasReactHooks = /(useState|useEffect|useCallback|useMemo|useRef)/.test(code);
    
    // Consider it valid if it has most React patterns
    const validityScore = [hasReactImport, hasComponentExport, hasJSXReturn].filter(Boolean).length;
    return validityScore >= 2; // At least 2 out of 3 patterns
  };

  /**
   * Convert React/TypeScript code to vanilla HTML/JS
   */
  const convertReactToVanilla = (code: AIWebBuilderResponse['code']): AIWebBuilderResponse['code'] => {
    if (!code.html) return code;

    console.log('[useAIWebBuilder] Converting React to vanilla HTML/JS');

    try {
      let html = code.html;

      // Remove React imports
      html = html.replace(/import\s+.*from\s+['"]react['"];?\n?/g, '');
      html = html.replace(/import\s+.*from\s+['"].*['"];?\n?/g, '');

      // Remove TypeScript interfaces and types
      html = html.replace(/interface\s+\w+\s*{[^}]*}\s*/g, '');
      html = html.replace(/type\s+\w+\s*=\s*[^;]+;\s*/g, '');

      // Extract JSX/HTML content from component
      const componentMatch = html.match(/return\s*\(([\s\S]*?)\);?\s*}/);
      if (componentMatch) {
        html = componentMatch[1].trim();
      } else {
        // Try to extract content between return and closing brace
        const returnMatch = html.match(/return\s*([\s\S]*?)(?:;|\})/);
        if (returnMatch) {
          html = returnMatch[1].trim();
        }
      }

      // Convert JSX className to class
      html = html.replace(/className=/g, 'class=');

      // Convert React event handlers to vanilla JS
      html = html.replace(/onClick={([^}]+)}/g, (match, handler) => {
        return `onclick="${handler.replace(/\(\) =>\s*/, '')}"`;
      });
      html = html.replace(/onSubmit={([^}]+)}/g, (match, handler) => {
        return `onsubmit="${handler.replace(/\(\) =>\s*/, '')}"`;
      });
      html = html.replace(/onChange={([^}]+)}/g, (match, handler) => {
        return `onchange="${handler.replace(/\(\) =>\s*/, '')}"`;
      });

      // Remove JSX expressions in curly braces (convert to empty or default)
      html = html.replace(/{\s*(\w+)\s*}/g, '');

      // Extract useState calls and convert to vanilla JS
      const stateMatches = code.html.match(/const\s+\[(\w+),\s*set\w+\]\s*=\s*useState\((.*?)\)/g);
      let javascript = code.javascript || '';

      if (stateMatches) {
        stateMatches.forEach(stateMatch => {
          const varMatch = stateMatch.match(/const\s+\[(\w+),\s*set(\w+)\]\s*=\s*useState\((.*?)\)/);
          if (varMatch) {
            const varName = varMatch[1];
            const initialValue = varMatch[3];
            javascript += `\nlet ${varName} = ${initialValue};\n`;
          }
        });
      }

      // Clean up any remaining JSX syntax
      html = html.replace(/<>\s*/g, '');
      html = html.replace(/\s*<\/>/g, '');

      // Wrap in proper HTML structure if not already wrapped
      if (!html.includes('<html') && !html.includes('<!DOCTYPE')) {
        html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Website</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
${html}
</body>
</html>`;
      }

      return {
        html,
        css: code.css || '',
        javascript: javascript
      };
    } catch (error) {
      console.error('[useAIWebBuilder] Error converting React to vanilla:', error);
      // Return original code if conversion fails
      return code;
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

    // Generate code from the layout plan
    const code = await generateCode(layoutPlan);
    
    return {
      layoutPlan,
      code: code || undefined,
      explanation: `Generated ${layoutPlan.gridSystem} layout with ${layoutPlan.sections.length} sections`,
      confidence: 0.85
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
