# AI Image Generation - Complete Guide

## Overview

The Unison Tasks Web Builder includes a fully integrated AI Image Generation system powered by OpenAI's DALL-E 3, allowing users to create professional, custom images directly within their web design workflow.

## Architecture

### Components

1. **AIImageGeneratorDialog** (`src/components/creatives/AIImageGeneratorDialog.tsx`)
   - User-facing modal interface
   - Advanced controls for style, quality, aspect ratio
   - Real-time progress tracking
   - Preview and action buttons

2. **AIImageGenerationService** (`src/services/aiImageGenerationService.ts`)
   - Singleton service managing image generation
   - Caching layer for performance
   - Batch generation support
   - File storage integration

3. **Edge Function** (`supabase/functions/generate-image/index.ts`)
   - Serverless Deno function
   - DALL-E 3 integration
   - Style enhancement engine
   - Error handling and CORS

## Features

### 🎨 Style Options
- **Digital Art**: Modern, vibrant digital artwork
- **Realistic**: Photorealistic, highly detailed images
- **Artistic**: Creative, expressive painting style
- **Photography**: Professional photography look
- **Illustration**: Hand-drawn illustration style
- **Anime**: Anime/manga aesthetic
- **3D Render**: CGI and 3D visualization

### 📐 Aspect Ratios
- **1:1** - Square (1024x1024)
- **16:9** - Landscape (1920x1080) - Great for hero images
- **9:16** - Portrait (1080x1920) - Mobile screens
- **4:3** - Classic (1600x1200)
- **3:4** - Photo (1200x1600)

### ⚡ Quality Levels
- **Standard**: Fast generation, good quality
- **High**: Best quality for web use (recommended)
- **Ultra**: Maximum detail and resolution

## Usage

### From WebBuilder Toolbar

1. **Click the "AI Image" button** in the top toolbar
   - Or press `Ctrl+I` (keyboard shortcut)
   
2. **Describe your image** in the prompt field
   ```
   Example: "Modern office workspace with minimalist design, 
   natural lighting, plants, wooden desk, large windows"
   ```

3. **Optional: Add negative prompt** to exclude unwanted elements
   ```
   Example: "blurry, low quality, dark, cluttered"
   ```

4. **Select style, aspect ratio, and quality**

5. **Click "Generate Image"**

6. **Once generated:**
   - Click "Insert to Canvas" to add to your web page
   - Click "Download" to save locally
   - Click "Copy URL" to get the image link
   - Click "Save" to store in your file library

### From Elements Sidebar

1. Scroll to the **Media** section
2. Click the **"✨ AI Image Generator"** button
3. Follow the same workflow as above

### Programmatic Usage

```typescript
import { aiImageService } from '@/services/aiImageGenerationService';

// Generate a single image
const image = await aiImageService.generateImage({
  prompt: 'Professional business team photo',
  style: 'photography',
  quality: 'high',
  aspectRatio: '16:9'
}, (progress) => {
  console.log(`${progress.progress}%: ${progress.message}`);
});

// Generate multiple variations
const images = await aiImageService.generateBatch({
  prompt: 'Abstract background patterns',
  style: 'artistic',
  quality: 'standard'
}, 3);

// Save to file storage
const { url, path } = await aiImageService.saveToFiles(image, 'hero-image.png');
```

## Generated HTML Output

When an AI image is inserted into the canvas, it creates **pure HTML/CSS** with advanced features:

```html
<div data-element-id="ai-image-1732765432123" 
     data-element-type="media" 
     draggable="true" 
     class="canvas-element">
  <figure class="relative group overflow-hidden rounded-2xl shadow-2xl">
    <img 
      src="https://oaidalleapiprodscus.blob.core.windows.net/..." 
      alt="Modern office workspace with minimalist design"
      loading="lazy"
      class="w-full h-auto object-cover transition-all duration-500 
             group-hover:scale-105 group-hover:brightness-110"
      style="aspect-ratio: 16/9; max-width: 100%;"
    />
    <figcaption class="absolute bottom-0 left-0 right-0 
                       bg-gradient-to-t from-black/70 to-transparent 
                       p-4 text-white opacity-0 group-hover:opacity-100 
                       transition-opacity duration-300">
      <p class="text-sm font-medium">Modern office workspace...</p>
      <span class="text-xs opacity-75">Style: digital-art</span>
    </figcaption>
  </figure>
</div>
```

### HTML Features
- ✅ **Lazy loading** for performance
- ✅ **Responsive design** (aspect-ratio, max-width)
- ✅ **Hover effects** (scale 105%, brightness 110%)
- ✅ **Gradient caption overlay** with prompt metadata
- ✅ **Smooth transitions** (500ms scale, 300ms opacity)
- ✅ **Accessibility** (alt text from prompt)
- ✅ **Pure vanilla CSS** (no frameworks in exported code)

## Integration Points

### ElementsSidebar Integration

```typescript
<ElementsSidebar
  onAIImageGenerated={(imageUrl, metadata) => {
    // Image is automatically inserted with advanced styling
    console.log('Generated:', imageUrl);
    console.log('Metadata:', metadata); // { prompt, style, quality }
  }}
/>
```

### WebBuilder Integration

The WebBuilder includes:
- **Toolbar button** (top toolbar, purple-highlighted)
- **Keyboard shortcut** (Ctrl+I)
- **Automatic insertion** into preview and code editor
- **Drag-drop support** via canvas-element wrapper

## Edge Function Details

### Deployment Status
```bash
# Check deployment
supabase functions list

# Expected output:
# generate-image | ACTIVE | v9 | 2025-11-27 05:45:36
```

### API Configuration

The Edge Function requires the `OPENAI_API_KEY` secret:

```bash
# Check if configured
supabase secrets list

# Set if missing
supabase secrets set OPENAI_API_KEY=sk-...
```

### Request Format

```json
{
  "prompt": "Professional headshot photo",
  "negative_prompt": "blurry, low quality",
  "width": 1024,
  "height": 1024,
  "style": "photography",
  "quality": "high",
  "num_images": 1,
  "seed": 123456
}
```

### Response Format

```json
{
  "imageUrl": "https://oaidalleapiprodscus.blob.core.windows.net/...",
  "url": "https://oaidalleapiprodscus.blob.core.windows.net/...",
  "seed": 123456
}
```

### Error Handling

The Edge Function handles:
- Missing API key → Returns error with placeholder image
- Invalid prompts → Returns validation error
- OpenAI API failures → Returns detailed error message
- Network timeouts → Returns timeout error

## Performance Optimizations

### Caching Layer

The service automatically caches generated images based on:
- Prompt text
- Dimensions (width × height)
- Style
- Quality level

Cache key format: `{prompt}-{width}x{height}-{style}-{quality}`

```typescript
// Check cache stats
const stats = aiImageService.getCacheStats();
console.log(`Cached: ${stats.size} images`);

// Clear cache
aiImageService.clearCache();
```

### Progress Tracking

Real-time progress updates during generation:

```typescript
aiImageService.generateImage(options, (progress) => {
  // progress.status: 'queued' | 'processing' | 'completed' | 'failed'
  // progress.progress: 0-100
  // progress.message: User-friendly status message
  // progress.estimatedTimeRemaining: Seconds (optional)
});
```

### Batch Generation

Generate multiple variations efficiently:

```typescript
const variations = await aiImageService.generateBatch(
  { prompt: 'Hero background', style: 'digital-art' },
  5, // Count
  (progress) => console.log(`Image ${progress.progress}%`)
);
```

## Best Practices

### Prompt Engineering

✅ **Good prompts:**
```
"Modern minimalist kitchen with white cabinets, marble countertops, 
natural lighting through large windows, plants on shelves, 
professional interior photography"
```

❌ **Weak prompts:**
```
"kitchen"
```

### Style Selection

- **Photography** → Real-life scenes, people, products
- **Digital Art** → Web graphics, illustrations, UI elements
- **3D Render** → Product mockups, architectural visualization
- **Illustration** → Icons, diagrams, infographics
- **Artistic** → Creative backgrounds, abstract designs

### Quality Guidelines

- **Standard**: Blog images, thumbnails (faster)
- **High**: Hero images, featured content (recommended)
- **Ultra**: Print-ready, high-detail requirements (slower)

### Negative Prompts

Use negative prompts to improve quality:
```
Common exclusions:
- "blurry, low quality, pixelated"
- "text, watermark, signature"
- "distorted, deformed, bad anatomy"
- "dark, underexposed, noisy"
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+I` | Open AI Image Generator |
| `Ctrl+S` | Save current work |
| `Ctrl+K` | Toggle code view |
| `Ctrl+P` | Toggle preview |
| `F1` | Show help |

## Troubleshooting

### "Image generation failed"

**Possible causes:**
1. OPENAI_API_KEY not configured
2. Network connectivity issues
3. Invalid prompt (too short/long)
4. OpenAI API rate limits

**Solutions:**
```bash
# Verify Edge Function is deployed
supabase functions list | grep generate-image

# Check secrets
supabase secrets list | grep OPENAI

# Test Edge Function directly
supabase functions invoke generate-image --data '{"prompt":"test"}'
```

### "No data returned from image generation service"

This indicates the Edge Function returned an empty response.

**Debug steps:**
1. Check browser console for detailed error logs
2. Verify Edge Function logs: `supabase functions logs generate-image`
3. Test with a simpler prompt
4. Check OpenAI API status: https://status.openai.com

### TypeScript errors in Edge Function file

**This is expected!** The `generate-image/index.ts` file uses Deno runtime, which VS Code doesn't recognize.

- Errors like "Cannot find module 'https://deno.land/...'" are normal
- The function deploys and runs correctly in production
- See `supabase/functions/README.md` for details

### Blank page when clicking "Generate Image"

**Fixed in v1.0.1:**
- All buttons now have `type="button"` to prevent form submission
- If you still see this, clear browser cache and hard refresh

## Advanced Features

### Template-Aware Generation

Generate images that match your website's brand:

```typescript
const image = await aiImageService.generateForTemplateElement(
  'Hero section background',
  {
    brandColors: ['#3B82F6', '#8B5CF6'],
    brandStyle: 'modern minimalist',
    websiteTheme: 'SaaS tech startup'
  }
);
```

### File Storage Integration

Save generated images to Supabase Storage:

```typescript
const { path, url } = await aiImageService.saveToFiles(
  generatedImage,
  'custom-filename.png'
);

// File stored at: {userId}/generated-images/custom-filename.png
// Accessible via: url
```

### Custom Image Components

The system includes 4 pre-built image components in ElementsSidebar:

1. **Responsive Image** - Picture element with srcset
2. **Image with Caption** - Figure with overlay
3. **Image Gallery Grid** - 4-column responsive layout
4. **Parallax Image** - Scroll effects with vanilla JS

## API Reference

### AIImageGenerationService

```typescript
class AIImageGenerationService {
  // Singleton instance
  static getInstance(): AIImageGenerationService;
  
  // Generate single image
  generateImage(
    options: ImageGenerationOptions,
    onProgress?: ImageGenerationCallback
  ): Promise<GeneratedImage>;
  
  // Generate multiple images
  generateBatch(
    options: ImageGenerationOptions,
    count: number,
    onProgress?: ImageGenerationCallback
  ): Promise<GeneratedImage[]>;
  
  // Save to file storage
  saveToFiles(
    image: GeneratedImage,
    fileName?: string
  ): Promise<{ path: string; url: string }>;
  
  // Template-aware generation
  generateForTemplateElement(
    elementDescription: string,
    context?: BrandContext
  ): Promise<GeneratedImage>;
  
  // Cache management
  clearCache(): void;
  getCacheStats(): { size: number; keys: string[] };
}
```

### Types

```typescript
interface ImageGenerationOptions {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  style?: 'realistic' | 'artistic' | 'digital-art' | 
          'photography' | 'illustration' | 'anime' | '3d-render';
  quality?: 'standard' | 'high' | 'ultra';
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | 'custom';
  numberOfImages?: number;
  seed?: number;
}

interface GeneratedImage {
  url: string;
  base64?: string;
  prompt: string;
  width: number;
  height: number;
  metadata?: Record<string, unknown>;
  timestamp: number;
}

interface ImageGenerationProgress {
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  message: string;
  estimatedTimeRemaining?: number; // seconds
}
```

## Deployment

### Vercel/Netlify

The web builder frontend is automatically deployed when you push to GitHub. No special configuration needed for AI image generation.

### Supabase Edge Functions

Deploy the Edge Function:

```bash
# Login to Supabase
supabase login

# Deploy Edge Function
supabase functions deploy generate-image

# Set API key secret
supabase secrets set OPENAI_API_KEY=sk-...

# Verify deployment
supabase functions list
```

### Environment Variables

Required secrets in Supabase:
- `OPENAI_API_KEY` - Your OpenAI API key

No environment variables needed in Vercel/Netlify for AI image generation.

## Cost Considerations

### OpenAI DALL-E 3 Pricing (as of 2024)

- **Standard (1024×1024)**: $0.040 per image
- **Standard (1024×1792 or 1792×1024)**: $0.080 per image
- **HD (1024×1024)**: $0.080 per image
- **HD (1024×1792 or 1792×1024)**: $0.120 per image

### Optimization Tips

1. **Use caching** - The service automatically caches identical requests
2. **Choose quality wisely** - Standard quality is often sufficient
3. **Batch requests** - Generate variations together
4. **Reuse images** - Save to file library for later use

## Support

### Documentation
- Main docs: `/workspaces/unison-tasks-24334-81331/.github/copilot-instructions.md`
- Edge Function docs: `/workspaces/unison-tasks-24334-81331/supabase/functions/README.md`

### Getting Help
- Check browser console for detailed error logs
- Review Edge Function logs: `supabase functions logs generate-image`
- Test Edge Function: `supabase functions invoke generate-image --data '{"prompt":"test"}'`

---

**Version**: 1.0.0  
**Last Updated**: November 28, 2025  
**Status**: ✅ Fully Operational
