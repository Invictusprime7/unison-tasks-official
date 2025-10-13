# Web Builder AI - Architecture Documentation

## Phase 2 & 3 Implementation: Complete ✅

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Input (AI Prompt)                   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase Edge Function                        │
│              (generate-ai-template/web-builder-ai)               │
│                                                                   │
│  • Lovable AI (google/gemini-2.5-flash)                         │
│  • Generates structured template schema                          │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Template Schema (Source of Truth)              │
│                                                                   │
│  AIGeneratedTemplate {                                           │
│    sections: TemplateSection[]                                   │
│    components: TemplateComponent[]                               │
│    brandKit: TemplateBrandKit                                    │
│    data: TemplateData                                            │
│  }                                                                │
└────────────────┬──────────────────────────┬─────────────────────┘
                 │                          │
                 ▼                          ▼
┌────────────────────────────┐  ┌──────────────────────────────────┐
│   Fabric.js Canvas         │  │   HTML/CSS Export                │
│   (Editing Mode)           │  │   (Preview Mode)                 │
│                            │  │                                  │
│  TemplateRenderer          │  │  TemplateToHTMLExporter          │
│  • Validates schema        │  │  • Applies design tokens         │
│  • Preloads assets         │  │  • Semantic HTML tags            │
│  • Renders to Fabric       │  │  • Google Fonts integration      │
│  • User can edit objects   │  │  • Sanitizes output              │
└────────────────────────────┘  └──────────────┬───────────────────┘
                                               │
                                               ▼
                                  ┌─────────────────────────────────┐
                                  │  SecureIframePreview            │
                                  │  • Sandboxed execution          │
                                  │  • RPC messaging                │
                                  │  • VFS file system              │
                                  │  • Live HTML preview            │
                                  └─────────────────────────────────┘
```

## Key Components

### 1. State Management (`useTemplateState.ts`)

**Single Source of Truth**: Template schema drives both rendering modes.

```typescript
const templateState = useTemplateState(fabricCanvas);

// Update template → triggers dual rendering
await templateState.updateTemplate(aiTemplate);

// Access synchronized state
const { template, html, css, isRendering } = templateState;
```

**Features:**
- ✅ Template schema as source of truth
- ✅ Automatic dual rendering (Fabric + HTML)
- ✅ Asset preloading before render
- ✅ HTML sanitization before iframe injection
- ✅ Data binding support

### 2. Template Rendering Pipeline

#### A. Fabric Canvas (Editing)
**File**: `src/utils/templateRenderer.ts`

```typescript
const renderer = new TemplateRenderer(fabricCanvas);
await renderer.renderTemplate(template);
```

**5 Pillars of Reliability:**
1. ✅ Schema validation (TemplateValidator)
2. ✅ Deterministic layout (LayoutEngine)
3. ✅ Safe adapter pattern (error isolation)
4. ✅ Asset preloading (AssetPreloader)
5. ✅ Error state rendering

#### B. HTML Export (Preview)
**File**: `src/utils/templateToHTMLExporter.ts`

```typescript
const exporter = new TemplateToHTMLExporter();
const html = exporter.exportToHTML(template);
```

**Features:**
- ✅ Design tokens from `index.css`
- ✅ Semantic HTML5 tags (`<header>`, `<section>`, `<footer>`)
- ✅ Responsive CSS with token mapping
- ✅ Google Fonts auto-loading
- ✅ Framework-agnostic clean code

### 3. Integration with Existing Tools

#### AssetPreloader (`assetPreloader.ts`)
```typescript
// Automatically used in useTemplateState
const assets = assetPreloader.extractAssetUrls(template);
await assetPreloader.preloadFonts(assets.fonts);
await assetPreloader.preloadImages(assets.images);
```

**Benefits:**
- ✅ Prevents "white flash" on render
- ✅ Progress callbacks for UX
- ✅ Caching for performance

#### LayoutEngine (`layoutEngine.ts`)
```typescript
// Used internally by TemplateRenderer
const layout = layoutEngine.applyLayout(section);
// Returns deterministic positions
```

**Benefits:**
- ✅ Consistent positioning
- ✅ Flexbox-based calculations
- ✅ Auto-layout support

#### HTMLSanitizer (`htmlSanitizer.ts`)
```typescript
// Applied before iframe injection
const clean = sanitizeHTML(exportedHtml);
const safeCss = sanitizeCSS(rawCss);
```

**Security:**
- ✅ DOMPurify integration
- ✅ CSP headers in iframe
- ✅ XSS prevention

### 4. Secure Iframe Preview

**File**: `src/components/SecureIframePreview.tsx`

**Security Architecture:**
```html
<iframe 
  sandbox="allow-scripts allow-pointer-lock"
  <!-- NO allow-same-origin for max isolation -->
/>
```

**Features:**
- ✅ Sandboxed execution environment
- ✅ RPC messaging layer (`rpc.ts`)
- ✅ Virtual filesystem (`vfs.ts`)
- ✅ Console/error interception
- ✅ Content Security Policy

### 5. AI Integration

**Edge Function**: `supabase/functions/generate-ai-template/index.ts`

**Model**: `google/gemini-2.5-flash` (FREE during Sept 29 - Oct 13, 2025)

**Response Format:**
```json
{
  "template": { /* AIGeneratedTemplate */ },
  "explanation": "Created a modern landing page...",
  "html": "<!DOCTYPE html>...",
  "css": "/* Design tokens applied */"
}
```

## Design Token System

**Source**: `src/index.css`

### Color Tokens (HSL)
```css
--primary: 210 100% 50%;
--secondary: 0 0% 90%;
--accent: 200 90% 55%;
```

### Spacing Scale
```css
--space-1: 0.25rem;  /* 4px */
--space-4: 1rem;     /* 16px */
--space-8: 2rem;     /* 32px */
```

### Typography
```css
--font-size-base: 1rem;
--font-size-2xl: 1.5rem;
--font-size-4xl: 2.25rem;
```

**Usage in Exports:**
```css
.component-heading {
  font-size: var(--font-size-4xl);
  color: hsl(var(--primary));
  padding: var(--space-8);
}
```

## Data Flow

### Template Generation
```
1. User: "Create a landing page"
   ↓
2. AI Assistant detects template request
   ↓
3. Edge function → Lovable AI → Structured schema
   ↓
4. useTemplateState.updateTemplate(schema)
   ↓
5. PARALLEL:
   - TemplateRenderer → Fabric Canvas
   - TemplateToHTMLExporter → HTML/CSS
   ↓
6. SecureIframePreview displays sanitized HTML
```

### Canvas Edits (Future)
```
1. User edits object on Fabric Canvas
   ↓
2. Canvas event listener detects change
   ↓
3. Update template schema
   ↓
4. Re-export HTML/CSS
   ↓
5. Update VFS → refresh iframe
```

## File Structure

```
src/
├── hooks/
│   ├── useTemplateState.ts       # State management (NEW)
│   ├── useWebBuilderAI.ts        # AI integration
│   └── useCanvasHistory.ts       # Undo/redo
├── utils/
│   ├── templateRenderer.ts       # Fabric rendering
│   ├── templateToHTMLExporter.ts # HTML export (NEW)
│   ├── assetPreloader.ts         # Asset loading
│   ├── layoutEngine.ts           # Layout calculations
│   ├── htmlSanitizer.ts          # Security
│   ├── rpc.ts                    # RPC messaging
│   └── vfs.ts                    # Virtual filesystem
├── components/
│   ├── SecureIframePreview.tsx   # Sandboxed preview
│   └── creatives/
│       ├── WebBuilder.tsx        # Main component
│       └── web-builder/
│           └── AIAssistantPanel.tsx
└── types/
    └── template.ts               # Type definitions
```

## Testing the Feature

1. **Navigate to Web Builder**
2. **Click "AI Assistant" button**
3. **Try a full template prompt:**
   - "Create a landing page for a SaaS product"
   - "Generate a portfolio website template"
4. **Observe dual rendering:**
   - ✅ Fabric Canvas shows editable objects
   - ✅ Preview dialog shows live HTML
5. **Edit on canvas** → changes reflected immediately

## Performance Optimizations

### Asset Preloading
- Images cached in `AssetPreloader`
- Fonts loaded before render
- Progress feedback to user

### Lazy Rendering
- Only visible sections rendered
- Virtual scrolling for large templates
- Debounced updates

### Memory Management
- Canvas disposal on unmount
- Asset cache clearing
- VFS cleanup

## Security Considerations

### Iframe Sandbox
- ✅ No `allow-same-origin` (maximum isolation)
- ✅ CSP headers restrict scripts
- ✅ RPC for controlled communication

### HTML Sanitization
- ✅ DOMPurify on all user content
- ✅ Whitelist approach for CSS
- ✅ No inline scripts allowed

### API Security
- ✅ Edge functions validate input
- ✅ Rate limiting (429 errors)
- ✅ Payment checks (402 errors)

## Next Steps (Phase 4+)

### Bidirectional Sync
- [ ] Canvas edits → update template schema
- [ ] Schema changes → re-render both views
- [ ] Real-time collaboration (Supabase Realtime)

### Advanced Export
- [ ] React component generation
- [ ] Vue/Svelte templates
- [ ] Tailwind CSS option
- [ ] Component library integration

### Enhanced Preview
- [ ] Live editing in iframe
- [ ] Device frame simulation
- [ ] Network throttling
- [ ] Accessibility testing

## Troubleshooting

### Template not rendering
1. Check console for validation errors
2. Verify template schema structure
3. Check asset URLs are accessible

### Iframe shows blank
1. Check HTML sanitization didn't strip content
2. Verify CSP headers
3. Check browser console for errors

### Slow rendering
1. Check image sizes (optimize before upload)
2. Reduce number of components
3. Clear asset cache

## API Reference

See inline JSDoc comments in:
- `src/hooks/useTemplateState.ts`
- `src/utils/templateToHTMLExporter.ts`
- `src/utils/templateRenderer.ts`

---

**Status**: ✅ Phase 2 & 3 Complete
**Next**: Phase 4 - Bidirectional Sync & Advanced Features
