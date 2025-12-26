import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { DroppedFile } from '@/components/creatives/web-builder/FileDropZone';

interface AnalysisResult {
  success: boolean;
  code?: string;
  explanation?: string;
  error?: string;
}

export const useAIFileAnalysis = () => {
  const [analyzing, setAnalyzing] = useState(false);

  const analyzeAndGenerate = useCallback(async (
    prompt: string,
    files: DroppedFile[]
  ): Promise<AnalysisResult> => {
    setAnalyzing(true);
    
    try {
      // Build context from files
      const fileContexts = await Promise.all(
        files.map(async (file) => {
          if (file.type === 'image' && file.preview) {
            return {
              type: 'image' as const,
              name: file.name,
              dataUrl: file.preview,
              description: `Image file: ${file.name}`,
            };
          } else if (file.content) {
            return {
              type: 'code' as const,
              name: file.name,
              content: file.content,
              description: `${file.type} file: ${file.name}`,
            };
          }
          return null;
        })
      );

      const validContexts = fileContexts.filter(Boolean);

      // Build enhanced prompt with file context
      let enhancedPrompt = prompt;
      
      const imageFiles = validContexts.filter(c => c?.type === 'image');
      const codeFiles = validContexts.filter(c => c?.type === 'code');

      if (imageFiles.length > 0) {
        enhancedPrompt += `\n\n[CONTEXT: User provided ${imageFiles.length} image(s): ${imageFiles.map(f => f?.name).join(', ')}. Analyze and recreate the design.]`;
      }

      if (codeFiles.length > 0) {
        enhancedPrompt += '\n\n[CODE FILES PROVIDED:]';
        codeFiles.forEach(f => {
          if (f?.content) {
            enhancedPrompt += `\n\n--- ${f.name} ---\n${f.content.slice(0, 5000)}`;
          }
        });
      }

      // Call the AI edge function
      const { data, error } = await supabase.functions.invoke('ai-code-assistant', {
        body: {
          messages: [
            {
              role: 'system',
              content: `You are an expert web developer and designer. When users provide images, analyze them carefully and recreate the design as React/HTML code. When users provide code files, understand them and help modify or build upon them.

OUTPUT FORMAT: Always return valid React component code that can be rendered. Use Tailwind CSS for styling. The code should be a complete, self-contained component.

For image analysis:
- Study colors, layout, typography, spacing
- Recreate the visual design as closely as possible
- Use placeholder images where needed (picsum.photos or placehold.co)
- Match the overall aesthetic and structure

For code files:
- Understand the existing code structure
- Maintain consistency with the provided code style
- Extend or modify as requested`
            },
            {
              role: 'user',
              content: enhancedPrompt,
            },
            // Include image data for vision models
            ...imageFiles.map(img => ({
              role: 'user' as const,
              content: [
                {
                  type: 'image_url' as const,
                  image_url: { url: img?.dataUrl || '' }
                }
              ]
            }))
          ],
          mode: 'component',
        }
      });

      if (error) {
        console.error('[useAIFileAnalysis] Error:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      // Extract code from response
      const responseContent = data?.response || data?.content || data?.code || '';
      
      // Try to extract code block
      const codeMatch = responseContent.match(/```(?:jsx?|tsx?|html)?\s*([\s\S]*?)```/);
      const code = codeMatch ? codeMatch[1].trim() : responseContent;

      return {
        success: true,
        code,
        explanation: data?.explanation || 'Code generated from your files',
      };

    } catch (err) {
      console.error('[useAIFileAnalysis] Exception:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const generateFromImage = useCallback(async (
    imageDataUrl: string,
    instructions: string = 'Recreate this design as a React component'
  ): Promise<AnalysisResult> => {
    setAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-code-assistant', {
        body: {
          messages: [
            {
              role: 'system',
              content: `You are an expert at analyzing UI designs and recreating them as React components with Tailwind CSS. 
              
Study the provided image carefully and:
1. Identify the layout structure (grid, flex, etc.)
2. Note all colors, fonts, spacing
3. Recreate every visual element
4. Use semantic HTML elements
5. Make it fully responsive

Return ONLY the React component code, no explanations.`
            },
            {
              role: 'user',
              content: [
                { type: 'text', text: instructions },
                { type: 'image_url', image_url: { url: imageDataUrl } }
              ]
            }
          ],
          mode: 'component',
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      const responseContent = data?.response || data?.content || data?.code || '';
      const codeMatch = responseContent.match(/```(?:jsx?|tsx?|html)?\s*([\s\S]*?)```/);
      const code = codeMatch ? codeMatch[1].trim() : responseContent;

      return {
        success: true,
        code,
        explanation: 'Design recreated from image',
      };

    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    } finally {
      setAnalyzing(false);
    }
  }, []);

  return {
    analyzing,
    analyzeAndGenerate,
    generateFromImage,
  };
};