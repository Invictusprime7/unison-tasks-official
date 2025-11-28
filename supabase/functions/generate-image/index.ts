/**
 * Supabase Edge Function: Generate Image
 * Generates AI images using OpenAI DALL-E 3 or Stability AI
 */

/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

interface ImageGenerationRequest {
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  style?: 'digital-art' | 'realistic' | 'artistic' | 'photography' | 'illustration' | 'anime' | '3d-render';
  quality?: 'standard' | 'high' | 'ultra';
  num_images?: number;
  seed?: number;
}

interface ImageGenerationResponse {
  imageUrl: string;
  url: string;
  base64?: string;
  seed?: number;
  error?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const {
      prompt,
      negative_prompt,
      width = 1024,
      height = 1024,
      style = 'digital-art',
      quality = 'high',
      num_images = 1,
      seed
    }: ImageGenerationRequest = await req.json();

    console.log('[Generate-Image] Request:', { prompt, style, quality });

    if (!prompt || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Enhance prompt based on style
    const stylePrompts: Record<string, string> = {
      'digital-art': 'digital art style, vibrant colors, professional, high quality',
      'realistic': 'photorealistic, highly detailed, professional photography',
      'artistic': 'artistic painting style, creative, expressive brushstrokes',
      'photography': 'professional photography, sharp focus, perfect lighting',
      'illustration': 'illustrated style, clean lines, professional illustration',
      'anime': 'anime art style, vibrant colors, manga aesthetic',
      '3d-render': '3D rendered, CGI, professional 3D visualization'
    };

    const enhancedPrompt = `${prompt}, ${stylePrompts[style] || stylePrompts['digital-art']}`;
    
    // Add negative prompt handling
    const fullPrompt = negative_prompt 
      ? `${enhancedPrompt}. Avoid: ${negative_prompt}`
      : enhancedPrompt;

    console.log('[Generate-Image] Enhanced prompt:', fullPrompt);

    // Map quality to DALL-E 3 quality
    const dalleQuality = quality === 'ultra' ? 'hd' : 'standard';
    
    // Determine size based on width/height (DALL-E 3 supports: 1024x1024, 1792x1024, 1024x1792)
    let size = '1024x1024';
    if (width > height && width >= 1792) {
      size = '1792x1024';
    } else if (height > width && height >= 1792) {
      size = '1024x1792';
    }

    // Call OpenAI DALL-E 3 API
    const openaiResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: fullPrompt,
        n: 1, // DALL-E 3 only supports n=1
        size: size,
        quality: dalleQuality,
        response_format: 'url'
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error('[Generate-Image] OpenAI Error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to generate image');
    }

    const result = await openaiResponse.json();
    console.log('[Generate-Image] Success:', result.data[0].url);

    const response: ImageGenerationResponse = {
      imageUrl: result.data[0].url,
      url: result.data[0].url,
      seed: seed || Math.floor(Math.random() * 1000000)
    };

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('[Generate-Image] Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate image';
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        imageUrl: 'https://via.placeholder.com/1024x1024?text=Generation+Failed',
        url: 'https://via.placeholder.com/1024x1024?text=Generation+Failed'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
