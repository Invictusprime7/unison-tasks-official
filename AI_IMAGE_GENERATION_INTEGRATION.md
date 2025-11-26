# AI Image Generation Integration

## Overview

This document describes the robust AI image generation system integrated into the Web Builder, allowing users to generate professional images using AI and seamlessly insert them into their web designs.

## Features

### 🎨 AI Image Generation Service
- **Multi-provider support**: Robust architecture ready for multiple AI providers
- **Progress tracking**: Real-time progress updates during generation
- **Result caching**: Intelligent caching to avoid duplicate generations
- **Quality control**: Multiple quality levels (Standard, High, Ultra)
- **Style variations**: 7 different artistic styles
- **Aspect ratio options**: 5 preset aspect ratios plus custom
- **Template integration**: Context-aware generation for web designs

### 🖼️ Image Generator Dialog
- **Intuitive interface**: Beautiful gradient UI with dark theme
- **Prompt engineering**: Enhanced prompts based on selected style
- **Negative prompts**: Optional negative prompt for better quality
- **Real-time preview**: See generated images immediately
- **Multiple actions**: Insert to canvas, download, copy URL, save to files
- **Progress indicators**: Visual progress bars with time estimates

### 📦 Elements Sidebar Integration
- **One-click access**: "Generate AI Image" button prominently displayed
- **AI Image element**: Dedicated draggable AI image placeholder
- **Seamless workflow**: Generate → Insert → Edit in one flow

## Architecture

### File Structure
```
src/
├── services/
│   └── aiImageGenerationService.ts      # Core AI image generation service
├── components/
│   └── creatives/
│       ├── AIImageGeneratorDialog.tsx   # Image generator UI dialog
│       ├── ElementsSidebar.tsx          # Updated with AI integration
│       └── WebBuilder.tsx               # Updated to handle AI images
```

### Component Hierarchy
```
WebBuilder
├── ElementsSidebar
│   └── AIImageGeneratorDialog
│       └── aiImageService (singleton)
```

## Usage Guide

### For Users

#### Method 1: Direct AI Image Generation
1. Open Elements Sidebar in Web Builder
2. Click **"Generate AI Image"** button (purple gradient button)
3. Enter image description in the prompt field
4. Select style, aspect ratio, and quality
5. Click **"Generate Image"**
6. Wait for generation (15-30 seconds)
7. Click **"Insert to Canvas"** to add to your design

#### Method 2: Using AI Image Placeholder
1. Drag the **"AI Image"** element from Media category
2. Drop it onto the canvas
3. Click **"Generate AI Image"** button
4. Follow generation steps above
5. Generated image automatically replaces placeholder

### For Developers

#### Using the AI Image Service

```typescript
import { aiImageService } from '@/services/aiImageGenerationService';

// Basic generation
const image = await aiImageService.generateImage({
  prompt: 'Modern office workspace with plants',
  style: 'digital-art',
  quality: 'high',
  aspectRatio: '16:9'
});

// With progress tracking
const image = await aiImageService.generateImage(
  {
    prompt: 'Sunset over mountains',
    style: 'photography',
    quality: 'ultra'
  },
  (progress) => {
    console.log(`Progress: ${progress.progress}%`);
    console.log(`Status: ${progress.status}`);
    console.log(`Message: ${progress.message}`);
  }
);

// Template-specific generation
const image = await aiImageService.generateForTemplateElement(
  'Hero section background',
  {
    brandColors: ['#3b82f6', '#8b5cf6'],
    brandStyle: 'modern minimalist',
    websiteTheme: 'tech startup'
  }
);

// Batch generation
const images = await aiImageService.generateBatch(
  { prompt: 'Product photos', style: 'photography' },
  5, // Generate 5 images
  (progress) => console.log(progress.message)
);

// Save to user files
const { url, path } = await aiImageService.saveToFiles(image);
console.log('Saved to:', path);
```

#### Adding AI Image Generation to Custom Components

```typescript
import { AIImageGeneratorDialog } from '@/components/creatives/AIImageGeneratorDialog';

function MyComponent() {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <button onClick={() => setShowDialog(true)}>
        Generate AI Image
      </button>
      
      <AIImageGeneratorDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onImageGenerated={(imageUrl, metadata) => {
          console.log('Generated:', imageUrl);
          // Use the image URL in your component
        }}
        defaultPrompt="Your default prompt"
        context={{
          brandColors: ['#3b82f6'],
          brandStyle: 'modern',
          websiteTheme: 'professional'
        }}
      />
    </>
  );
}
```

## API Reference

### AIImageGenerationService

#### Methods

##### `generateImage(options, onProgress?)`
Generate a single AI image with optional progress tracking.

**Parameters:**
- `options: ImageGenerationOptions` - Generation parameters
- `onProgress?: ImageGenerationCallback` - Optional progress callback

**Returns:** `Promise<GeneratedImage>`

##### `generateBatch(options, count, onProgress?)`
Generate multiple images in batch.

**Parameters:**
- `options: ImageGenerationOptions` - Generation parameters
- `count: number` - Number of images to generate
- `onProgress?: ImageGenerationCallback` - Optional progress callback

**Returns:** `Promise<GeneratedImage[]>`

##### `saveToFiles(image, fileName?)`
Save generated image to user's file storage.

**Parameters:**
- `image: GeneratedImage` - The generated image to save
- `fileName?: string` - Optional custom filename

**Returns:** `Promise<{ path: string; url: string }>`

##### `generateForTemplateElement(description, context?)`
Generate image specifically for template elements with brand context.

**Parameters:**
- `description: string` - Element description
- `context?: object` - Brand context (colors, style, theme)

**Returns:** `Promise<GeneratedImage>`

##### `clearCache()`
Clear the image generation cache.

##### `getCacheStats()`
Get cache statistics.

**Returns:** `{ size: number; keys: string[] }`

### Types

#### ImageGenerationOptions
```typescript
interface ImageGenerationOptions {
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
```

#### GeneratedImage
```typescript
interface GeneratedImage {
  url: string;
  base64?: string;
  prompt: string;
  width: number;
  height: number;
  metadata?: Record<string, unknown>;
  timestamp: number;
}
```

#### ImageGenerationProgress
```typescript
interface ImageGenerationProgress {
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  message: string;
  estimatedTimeRemaining?: number; // seconds
}
```

## Style Options

### Available Styles

1. **Digital Art** (default)
   - Best for: Web graphics, UI elements, modern designs
   - Characteristics: Clean, professional, vibrant colors

2. **Realistic**
   - Best for: Product photos, portraits, real-world scenes
   - Characteristics: Photorealistic, detailed, 8k resolution

3. **Artistic**
   - Best for: Creative projects, expressive designs
   - Characteristics: Creative, expressive, vibrant colors

4. **Photography**
   - Best for: Professional photos, marketing materials
   - Characteristics: Professional lighting, sharp focus

5. **Illustration**
   - Best for: Editorial content, storytelling
   - Characteristics: Hand-drawn style, artistic flair

6. **Anime**
   - Best for: Anime/manga style projects
   - Characteristics: Anime aesthetic, colorful, detailed

7. **3D Render**
   - Best for: Product visualization, architectural renders
   - Characteristics: 3D rendering, realistic lighting

## Quality Levels

### Standard Quality
- Resolution: ~768x768 base
- Generation time: 5-10 seconds
- Use case: Quick drafts, testing

### High Quality (Recommended)
- Resolution: ~1024x1024 base
- Generation time: 15-25 seconds
- Use case: Production websites, final designs

### Ultra Quality
- Resolution: Up to 2048x2048
- Generation time: 30-45 seconds
- Use case: Hero images, high-detail requirements

## Aspect Ratios

- **1:1** (Square) - Social media, profile images
- **16:9** (Landscape) - Hero sections, banners
- **9:16** (Portrait) - Mobile screens, stories
- **4:3** (Classic) - Traditional screens, presentations
- **3:4** (Photo) - Portrait photos, posters

## Integration Points

### Web Builder Integration
The AI image generator is integrated into the Web Builder at multiple touchpoints:

1. **Elements Sidebar**: Purple gradient button for quick access
2. **Media Category**: AI Image placeholder element
3. **Canvas Insertion**: Generated images automatically inserted as draggable elements
4. **Reordering Support**: AI images support full drag-and-drop reordering

### Generated Image Structure
When an AI image is inserted into the canvas, it follows this structure:

```html
<div 
  data-element-id="ai-image-{timestamp}" 
  data-element-type="media" 
  draggable="true" 
  class="canvas-element"
>
  <img 
    src="{generated-image-url}" 
    alt="AI Generated Image" 
    class="w-full h-auto rounded-2xl shadow-lg" 
  />
</div>
```

## Caching Strategy

The service implements intelligent caching to:
- Avoid duplicate generations
- Reduce API costs
- Improve performance
- Provide instant results for repeated prompts

Cache key format:
```
{prompt}-{width}x{height}-{style}-{quality}
```

## Error Handling

The service implements comprehensive error handling:

1. **Network Errors**: Automatic retry with exponential backoff
2. **API Errors**: Clear error messages with troubleshooting hints
3. **Validation Errors**: Client-side validation before API call
4. **Progress Errors**: Failed state with detailed error message

## Future Enhancements

### Planned Features
- [ ] Image editing (crop, resize, filters)
- [ ] Image-to-image generation (style transfer)
- [ ] Background removal
- [ ] Upscaling for higher resolution
- [ ] Batch operations (generate sets)
- [ ] Image variations (generate similar)
- [ ] Custom model selection
- [ ] Advanced prompt builder with suggestions
- [ ] Image history and favorites
- [ ] AI-powered image search in library

### Provider Integration Roadmap
- [ ] DALL-E 3 integration
- [ ] Midjourney API (when available)
- [ ] Stable Diffusion XL
- [ ] Adobe Firefly
- [ ] Custom model support

## Performance Considerations

### Optimization Techniques
1. **Lazy Loading**: Dialog only loads when opened
2. **Image Compression**: Automatic compression for web
3. **CDN Integration**: Generated images served via CDN
4. **Progressive Loading**: Show low-res preview during generation
5. **Request Batching**: Combine multiple small requests

### Best Practices
- Use appropriate quality level for use case
- Cache results when possible
- Provide clear, detailed prompts
- Use negative prompts to avoid common issues
- Preview before inserting to canvas

## Troubleshooting

### Common Issues

**Issue: Generation takes too long**
- Solution: Try Standard quality or smaller dimensions

**Issue: Generated image doesn't match prompt**
- Solution: Be more specific in prompt, add negative prompts

**Issue: Out of memory errors**
- Solution: Reduce quality or dimensions, clear cache

**Issue: Image not inserting to canvas**
- Solution: Check browser console for errors, verify WebBuilder is active

## Security

### Image Content Filtering
- Automatic content moderation
- NSFW detection and blocking
- Copyright-safe generation
- User content policy enforcement

### Data Privacy
- User prompts not stored permanently
- Generated images owned by user
- Optional image deletion
- GDPR compliance

## Testing

### Manual Testing Checklist
- [ ] Generate image with different styles
- [ ] Test all aspect ratios
- [ ] Verify quality levels
- [ ] Test progress tracking
- [ ] Verify canvas insertion
- [ ] Test drag-and-drop
- [ ] Verify file saving
- [ ] Test error scenarios
- [ ] Check mobile responsiveness
- [ ] Verify caching works

### Automated Tests
See `tests/aiImageGeneration.test.ts` for comprehensive test suite.

## Support

For issues or questions:
1. Check this documentation
2. Review console errors
3. Check Supabase Edge Function logs
4. Contact development team

## Credits

- AI Image Generation: Powered by Supabase Edge Functions
- UI Components: shadcn/ui
- Icons: Lucide React
- Styling: Tailwind CSS

---

**Last Updated**: November 26, 2025
**Version**: 1.0.0
**Status**: Production Ready ✅
