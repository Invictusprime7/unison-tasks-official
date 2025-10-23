import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Canvas as FabricCanvas, Rect, Circle, IText, Textbox, FabricImage } from 'fabric';
import { toast } from 'sonner';
import { TemplateRenderer } from '@/utils/templateRenderer';
import { TemplateToHTMLExporter } from '@/utils/templateToHTMLExporter';
import type { AIGeneratedTemplate } from '@/types/template';

export interface AICanvasObject {
  type: 'rect' | 'circle' | 'text' | 'textbox' | 'image' | 'group';
  left: number;
  top: number;
  width?: number;
  height?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  src?: string;
  radius?: number;
  rx?: number;
  ry?: number;
  shadow?: any;
}

export interface AIResponse {
  objects: AICanvasObject[];
  explanation: string;
}

export interface AITemplateResponse {
  template: AIGeneratedTemplate;
  explanation: string;
}

export const useWebBuilderAI = (
  fabricCanvas: FabricCanvas | null,
  onTemplateGenerated?: (template: AIGeneratedTemplate) => void
) => {
  const [loading, setLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<AIResponse | null>(null);

  const generateDesign = async (prompt: string, action: 'create' | 'modify' = 'create'): Promise<AIResponse | null> => {
    if (!fabricCanvas) {
      toast.error('Canvas not ready');
      return null;
    }

    setLoading(true);
    try {
      // Get current canvas state for context
      const canvasState = {
        objects: fabricCanvas.getObjects().length,
        dimensions: {
          width: fabricCanvas.width,
          height: fabricCanvas.height
        }
      };

      console.log('[useWebBuilderAI] Calling web-builder-ai function');
      
      const { data, error } = await supabase.functions.invoke('web-builder-ai', {
        body: { 
          prompt,
          canvasState,
          action
        }
      });

      if (error) {
        console.error('[useWebBuilderAI] Edge function error:', error);
        if (error.message?.includes('429') || error.status === 429) {
          toast.error('Rate limit exceeded. Please try again in a moment.');
        } else if (error.message?.includes('402') || error.status === 402) {
          toast.error('AI credits required. Please check your workspace settings.');
        } else if (error.message?.includes('Failed to fetch') || error.message?.includes('fetch')) {
          toast.error('Connection error. Please check your internet connection and try again.');
        } else {
          toast.error('Failed to generate design. Please try again.');
        }
        return null;
      }

      if (!data || typeof data !== 'object') {
        console.error('[useWebBuilderAI] Invalid response data:', data);
        toast.error('Invalid response from AI. Please try again.');
        return null;
      }

      const aiResponse = data as AIResponse;
      setLastResponse(aiResponse);

      // Add objects to canvas
      if (aiResponse.objects && Array.isArray(aiResponse.objects)) {
        await addObjectsToCanvas(aiResponse.objects);
        toast.success(aiResponse.explanation || 'Design generated successfully!');
      } else {
        console.error('[useWebBuilderAI] No objects in response:', aiResponse);
        toast.error('AI returned empty design. Please try a different prompt.');
        return null;
      }
      
      return aiResponse;
    } catch (error) {
      console.error('[useWebBuilderAI] Unexpected error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const addObjectsToCanvas = async (objects: AICanvasObject[]) => {
    if (!fabricCanvas) return;

    const canvasWidth = fabricCanvas.width || 1280;
    const canvasHeight = fabricCanvas.height || 800;

    const constrainPosition = (value: number, max: number, size: number = 0) => {
      return Math.max(0, Math.min(value, max - size));
    };

    for (const obj of objects) {
      try {
        let fabricObj;

        switch (obj.type) {
          case 'rect':
            const rectWidth = obj.width || 200;
            const rectHeight = obj.height || 100;
            fabricObj = new Rect({
              left: constrainPosition(obj.left, canvasWidth, rectWidth),
              top: constrainPosition(obj.top, canvasHeight, rectHeight),
              width: rectWidth,
              height: rectHeight,
              fill: obj.fill || '#3b82f6',
              stroke: obj.stroke,
              strokeWidth: obj.strokeWidth || 0,
              rx: obj.rx || 0,
              ry: obj.ry || 0,
              shadow: obj.shadow,
            });
            break;

          case 'circle':
            const radius = obj.radius || 50;
            fabricObj = new Circle({
              left: constrainPosition(obj.left, canvasWidth, radius * 2),
              top: constrainPosition(obj.top, canvasHeight, radius * 2),
              radius: radius,
              fill: obj.fill || '#3b82f6',
              stroke: obj.stroke,
              strokeWidth: obj.strokeWidth || 0,
            });
            break;

          case 'text':
            fabricObj = new IText(obj.text || 'Text', {
              left: constrainPosition(obj.left, canvasWidth),
              top: constrainPosition(obj.top, canvasHeight),
              fill: obj.fill || '#000000',
              fontSize: obj.fontSize || 24,
              fontFamily: obj.fontFamily || 'Arial',
            });
            break;

          case 'textbox':
            const textboxWidth = obj.width || 200;
            fabricObj = new Textbox(obj.text || 'Text', {
              left: constrainPosition(obj.left, canvasWidth, textboxWidth),
              top: constrainPosition(obj.top, canvasHeight),
              width: textboxWidth,
              fill: obj.fill || '#000000',
              fontSize: obj.fontSize || 16,
              fontFamily: obj.fontFamily || 'Arial',
            });
            break;

          case 'image':
            if (obj.src) {
              try {
                fabricObj = await FabricImage.fromURL(obj.src, {
                  crossOrigin: 'anonymous'
                });
                const imgWidth = obj.width || fabricObj.width || 100;
                const imgHeight = obj.height || fabricObj.height || 100;
                fabricObj.set({
                  left: constrainPosition(obj.left, canvasWidth, imgWidth),
                  top: constrainPosition(obj.top, canvasHeight, imgHeight),
                  scaleX: obj.width ? obj.width / (fabricObj.width || 1) : 1,
                  scaleY: obj.height ? obj.height / (fabricObj.height || 1) : 1,
                });
              } catch (error) {
                console.error('Error loading image:', error);
                toast.error('Failed to load image: ' + obj.src);
                continue;
              }
            }
            break;
        }

        if (fabricObj) {
          fabricCanvas.add(fabricObj);
        }
      } catch (error) {
        console.error('Error adding object to canvas:', error);
      }
    }

    fabricCanvas.renderAll();
  };

  const generateTemplate = async (prompt: string): Promise<AITemplateResponse | null> => {
    setLoading(true);
    try {
      console.log('[useWebBuilderAI] Generating template with prompt:', prompt);
      
      const { data, error } = await supabase.functions.invoke('generate-ai-template', {
        body: { 
          prompt,
          industry: 'web',
          goal: 'web-builder-template',
          format: 'web'
        }
      });

      if (error) {
        console.error('[useWebBuilderAI] Edge function error:', error);
        if (error.message?.includes('429') || error.status === 429) {
          toast.error('Rate limit exceeded. Please try again in a moment.');
        } else if (error.message?.includes('402') || error.status === 402) {
          toast.error('AI credits required. Please check your workspace settings.');
        } else if (error.message?.includes('Failed to fetch') || error.message?.includes('fetch')) {
          toast.error('Connection error. Please check your internet connection and try again.');
        } else {
          toast.error('Failed to generate template. Please try again.');
        }
        return null;
      }

      if (!data || typeof data !== 'object') {
        console.error('[useWebBuilderAI] Invalid response data:', data);
        toast.error('Invalid response from AI. Please try again.');
        return null;
      }

      console.log('[useWebBuilderAI] Received data:', data);

      // Handle both wrapped and unwrapped responses
      const template = data.template || data;
      
      if (!template || !template.sections || !Array.isArray(template.sections)) {
        console.error('[useWebBuilderAI] Invalid template structure - missing or invalid sections:', template);
        toast.error('AI returned invalid template structure. Please try a different prompt.');
        return null;
      }

      if (!template.variants || !Array.isArray(template.variants)) {
        console.error('[useWebBuilderAI] Invalid template structure - missing or invalid variants:', template);
        toast.error('AI returned invalid template structure. Please try a different prompt.');
        return null;
      }

      const aiTemplateResponse: AITemplateResponse = {
        template: template,
        explanation: data.explanation || 'AI template generated successfully!'
      };
      
      console.log('[useWebBuilderAI] Valid template created with', template.sections.length, 'sections');
      
      toast.success(aiTemplateResponse.explanation);
      return aiTemplateResponse;
    } catch (error) {
      console.error('[useWebBuilderAI] Unexpected error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error('An unexpected error occurred. Please try a different prompt.');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    lastResponse,
    generateDesign,
    generateTemplate,
  };
};