/**
 * AI Image Generation Service
 * Robust service for generating images using AI with multiple provider support
 * Integrated with web builder for seamless image creation
 */

import { supabase } from "@/integrations/supabase/client";

export interface ImageGenerationOptions {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  style?: 'realistic' | 'artistic' | 'digital-art' | 'photography' | 'illustration' | 'anime' | '3d-render';
  quality?: 'standard' | 'high' | 'ultra';
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | 'custom';
  numberOfImages?: number;
  seed?: number;
}

export interface GeneratedImage {
  url: string;
  base64?: string;
  prompt: string;
  width: number;
  height: number;
  metadata?: Record<string, unknown>;
  timestamp: number;
}

export interface ImageGenerationProgress {
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  message: string;
  estimatedTimeRemaining?: number; // seconds
}

export type ImageGenerationCallback = (progress: ImageGenerationProgress) => void;

/**
 * AI Image Generation Service
 * Handles AI image generation with robust error handling and multiple providers
 */
export class AIImageGenerationService {
  private static instance: AIImageGenerationService;
  private generationQueue: Map<string, ImageGenerationCallback[]> = new Map();
  private cache: Map<string, GeneratedImage> = new Map();

  private constructor() {
    // Singleton pattern
  }

  public static getInstance(): AIImageGenerationService {
    if (!AIImageGenerationService.instance) {
      AIImageGenerationService.instance = new AIImageGenerationService();
    }
    return AIImageGenerationService.instance;
  }

  /**
   * Generate AI image with progress tracking
   */
  async generateImage(
    options: ImageGenerationOptions,
    onProgress?: ImageGenerationCallback
  ): Promise<GeneratedImage> {
    const cacheKey = this.getCacheKey(options);
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      onProgress?.({
        status: 'completed',
        progress: 100,
        message: 'Image retrieved from cache'
      });
      return cached;
    }

    const requestId = `img-${Date.now()}-${Math.random()}`;
    
    try {
      // Initial progress
      onProgress?.({
        status: 'queued',
        progress: 0,
        message: 'Preparing image generation...'
      });

      // Prepare generation parameters
      const params = this.prepareGenerationParams(options);
      
      onProgress?.({
        status: 'processing',
        progress: 20,
        message: 'Sending request to AI service...',
        estimatedTimeRemaining: 15
      });

      // Call Supabase Edge Function for image generation
      console.log('[AIImageService] Calling generate-image function...');
      
      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: {
          prompt: params.prompt,
          negative_prompt: params.negativePrompt,
          width: params.width,
          height: params.height,
          style: params.style,
          quality: params.quality,
          num_images: params.numberOfImages || 1,
          seed: params.seed
        }
      });

      console.log('[AIImageService] Response:', { data, error });

      if (error) {
        console.error('[AIImageService] Error from edge function:', error);
        throw new Error(`Image generation failed: ${error.message}`);
      }

      if (!data) {
        console.error('[AIImageService] No data returned from edge function');
        throw new Error('No data returned from image generation service');
      }

      if (data.error) {
        console.error('[AIImageService] Error in response data:', data.error);
        throw new Error(data.error);
      }

      if (!data.imageUrl && !data.url) {
        console.error('[AIImageService] No image URL in response:', data);
        throw new Error('Image URL not found in response');
      }

      onProgress?.({
        status: 'processing',
        progress: 80,
        message: 'Processing generated image...'
      });

      // Process the response
      const generatedImage: GeneratedImage = {
        url: data.imageUrl || data.url,
        base64: data.base64,
        prompt: options.prompt,
        width: params.width,
        height: params.height,
        metadata: {
          style: params.style,
          quality: params.quality,
          negativePrompt: params.negativePrompt,
          seed: data.seed
        },
        timestamp: Date.now()
      };

      // Cache the result
      this.cache.set(cacheKey, generatedImage);

      onProgress?.({
        status: 'completed',
        progress: 100,
        message: 'Image generated successfully!'
      });

      return generatedImage;

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate image';
      onProgress?.({
        status: 'failed',
        progress: 0,
        message: errorMessage
      });
      throw error;
    }
  }

  /**
   * Generate multiple images in batch
   */
  async generateBatch(
    options: ImageGenerationOptions,
    count: number,
    onProgress?: ImageGenerationCallback
  ): Promise<GeneratedImage[]> {
    const results: GeneratedImage[] = [];
    
    for (let i = 0; i < count; i++) {
      onProgress?.({
        status: 'processing',
        progress: Math.floor((i / count) * 100),
        message: `Generating image ${i + 1} of ${count}...`
      });

      const image = await this.generateImage({
        ...options,
        seed: options.seed ? options.seed + i : undefined
      });
      
      results.push(image);
    }

    onProgress?.({
      status: 'completed',
      progress: 100,
      message: `Generated ${count} images successfully!`
    });

    return results;
  }

  /**
   * Save generated image to user's file storage
   */
  async saveToFiles(
    image: GeneratedImage,
    fileName?: string
  ): Promise<{ path: string; url: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || 'anonymous';

      // Convert base64 or URL to blob
      const blob = image.base64 
        ? this.base64ToBlob(image.base64)
        : await this.urlToBlob(image.url);

      const finalFileName = fileName || `ai-generated-${Date.now()}.png`;
      const filePath = `${userId}/generated-images/${finalFileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("user-files")
        .upload(filePath, blob, {
          contentType: 'image/png',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("user-files")
        .getPublicUrl(filePath);

      // Save metadata to database
      await supabase.from("files").insert({
        user_id: user?.id || null,
        name: finalFileName,
        size: blob.size,
        mime_type: 'image/png',
        storage_path: filePath,
        folder_path: '/generated-images'
      });

      return { path: filePath, url: publicUrl };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to save image: ${errorMessage}`);
    }
  }

  /**
   * Generate image for specific template element
   */
  async generateForTemplateElement(
    elementDescription: string,
    context?: {
      brandColors?: string[];
      brandStyle?: string;
      websiteTheme?: string;
    }
  ): Promise<GeneratedImage> {
    // Build enhanced prompt with context
    let enhancedPrompt = elementDescription;
    
    if (context?.brandStyle) {
      enhancedPrompt += `, ${context.brandStyle} style`;
    }
    
    if (context?.websiteTheme) {
      enhancedPrompt += `, ${context.websiteTheme} theme`;
    }

    if (context?.brandColors && context.brandColors.length > 0) {
      enhancedPrompt += `, color palette: ${context.brandColors.join(', ')}`;
    }

    // Add quality modifiers for web use
    enhancedPrompt += ', high quality, professional, clean composition, suitable for web design';

    return this.generateImage({
      prompt: enhancedPrompt,
      quality: 'high',
      aspectRatio: '16:9',
      style: 'digital-art'
    });
  }

  /**
   * Prepare generation parameters with defaults
   */
  private prepareGenerationParams(options: ImageGenerationOptions) {
    const aspectRatios: Record<string, [number, number]> = {
      '1:1': [1024, 1024],
      '16:9': [1920, 1080],
      '9:16': [1080, 1920],
      '4:3': [1600, 1200],
      '3:4': [1200, 1600]
    };

    let width = options.width || 1024;
    let height = options.height || 1024;

    if (options.aspectRatio && options.aspectRatio !== 'custom') {
      [width, height] = aspectRatios[options.aspectRatio];
    }

    // Adjust for quality
    if (options.quality === 'ultra') {
      width = Math.min(width * 1.5, 2048);
      height = Math.min(height * 1.5, 2048);
    } else if (options.quality === 'standard') {
      width = Math.min(width * 0.75, 1024);
      height = Math.min(height * 0.75, 1024);
    }

    return {
      prompt: this.enhancePrompt(options.prompt, options.style),
      negativePrompt: options.negativePrompt || this.getDefaultNegativePrompt(),
      width: Math.round(width),
      height: Math.round(height),
      style: options.style || 'digital-art',
      quality: options.quality || 'high',
      numberOfImages: options.numberOfImages || 1,
      seed: options.seed
    };
  }

  /**
   * Enhance prompt based on style
   */
  private enhancePrompt(prompt: string, style?: string): string {
    const styleModifiers: Record<string, string> = {
      'realistic': 'photorealistic, detailed, 8k resolution',
      'artistic': 'artistic, creative, expressive, vibrant',
      'digital-art': 'digital art, modern, clean, professional',
      'photography': 'professional photography, sharp focus, well-lit',
      'illustration': 'illustration, hand-drawn style, artistic',
      'anime': 'anime style, manga, colorful, detailed',
      '3d-render': '3D render, realistic lighting, high quality'
    };

    if (style && styleModifiers[style]) {
      return `${prompt}, ${styleModifiers[style]}`;
    }

    return prompt;
  }

  /**
   * Get default negative prompt to improve quality
   */
  private getDefaultNegativePrompt(): string {
    return 'blurry, low quality, distorted, deformed, ugly, bad anatomy, watermark, text, signature';
  }

  /**
   * Generate cache key for result caching
   */
  private getCacheKey(options: ImageGenerationOptions): string {
    const params = this.prepareGenerationParams(options);
    return `${params.prompt}-${params.width}x${params.height}-${params.style}-${params.quality}`;
  }

  /**
   * Convert base64 to Blob
   */
  private base64ToBlob(base64: string): Blob {
    const parts = base64.split(';base64,');
    const contentType = parts[0].split(':')[1] || 'image/png';
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    
    return new Blob([uInt8Array], { type: contentType });
  }

  /**
   * Convert URL to Blob
   */
  private async urlToBlob(url: string): Promise<Blob> {
    const response = await fetch(url);
    return await response.blob();
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const aiImageService = AIImageGenerationService.getInstance();
