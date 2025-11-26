# Copilot Instructions for Unison Tasks Web Builder

## Project Overview
The Unison Tasks Web Builder is a sophisticated AI-powered web design tool that enables users to create professional, static websites using a drag-and-drop interface. The core functionality revolves around generating and exporting **pure HTML, CSS, and Vanilla JavaScript** code, ensuring compatibility across various platforms without reliance on frameworks like React or Vue.

**CRITICAL OUTPUT REQUIREMENT:** Web builder generates and exports **EXCLUSIVELY HTML + CSS + Vanilla JavaScript** - no React, no frameworks. User gets pure, framework-agnostic web code with AI-powered design generation, drag-and-drop interface, and Supabase backend. Primary focus: professional website templates with live preview and export capabilities.

## Critical Architecture Patterns

### 1. Dual Rendering System (Fabric.js + HTML)
**Always maintain sync between canvas editing and HTML preview:**
```JavaScipt
// ❌ DON'T update only one view
fabricCanvas.add(newObject);

// ✅ DO use template schema as source of truth
await templateState.updateTemplate(schema);
// Auto-triggers: TemplateRenderer (Fabric) + TemplateToHTMLExporter (HTML)
```
**Files:** `src/hooks/useTemplateState.ts`, `src/utils/templateRenderer.ts`, `src/utils/templateToHTMLExporter.ts`

### 2. Service Singleton Pattern
All AI/generation services use getInstance():
```typescript
// ✅ Correct
const service = AIImageGenerationService.getInstance();
const dragDrop = CanvasDragDropService.getInstance();

// ❌ Wrong - breaks shared state
const service = new AIImageGenerationService();
```
**Services:** `src/services/` (aiImageGenerationService, canvasDragDropService, aiLearningService, etc.)

### 3. Supabase Edge Functions (NOT REST API)
```typescript
// ✅ Edge Functions for AI operations
const { data, error } = await supabase.functions.invoke('ai-code-assistant', {
  body: { prompt, context }
});

// ✅ Database direct access for CRUD
await supabase.from('tasks').insert({ ... });
```
**Available functions:** `ai-code-assistant`, `generate-image`, `generate-template`, `copy-rewrite`

### 4. Component Library Pattern
**50+ pre-built web elements in ElementsSidebar:**
- Each element has: `id`, `name`, `category`, `icon`, `htmlTemplate`, `tags`
- Draggable with native HTML5 drag API
- Auto-wraps in `.canvas-element` divs for reordering
**File:** `src/components/creatives/ElementsSidebar.tsx` (940 lines)

## Key Workflows

### Building & Running
```bash
npm run dev          # Dev server on :8080
npm run build        # Production build (20-30s)
npm run lint         # ESLint check
```

### Adding New Web Elements
1. Add to `ELEMENT_LIBRARY` array in `ElementsSidebar.tsx`
2. Include: `htmlTemplate` (Tailwind classes), `category`, `tags`
3. Service auto-handles drag-drop insertion with reordering JS

### AI Template Generation
```typescript
// User prompt → Edge function → Structured schema → Dual render
const template = await generateTemplate(prompt);
await templateState.updateTemplate(template);
// Result: Editable Fabric canvas + Live HTML preview (pure HTML/CSS/JS)
```

### Generated Code Output
**CRITICAL:** All AI-generated templates export as:
- **Pure HTML5** - Semantic tags, no JSX
- **Pure CSS** - Vanilla CSS or Tailwind classes (no styled-components, no CSS-in-JS)
- **Pure JavaScript** - ES6+ vanilla JS (no React hooks, no framework syntax)

```javascript
// ✅ CORRECT: Vanilla JavaScript
document.querySelectorAll('.menu-item').forEach(item => {
  item.addEventListener('click', (e) => {
    // Pure JS event handling
  });
});

// ❌ WRONG: React/Framework syntax
const [state, setState] = useState();  // DON'T generate this
onClick={() => handleClick()}          // DON'T generate this
```

### Canvas Element Insertion
**All inserted elements get wrapped:**
```html
<div data-element-id="element-{timestamp}" 
     data-element-type="{category}" 
     draggable="true" 
     class="canvas-element">
  {actual element HTML}
</div>
```
**Why:** Enables drag-to-reorder, selection, deletion via embedded JavaScript

**Export Format:** When user exports, wrapper divs are preserved but contain only:
- **HTML**: Standard HTML5 tags
- **CSS**: Tailwind classes or vanilla CSS
- **JavaScript**: Pure vanilla JS for interactivity (no React, no Vue, no frameworks)

## Security & Sanitization

### HTML Preview Iframe
```typescript
// ✅ Always sanitize before iframe injection
const clean = sanitizeHTML(exportedHtml); // Uses DOMPurify
const safeCss = sanitizeCSS(rawCss);

// Iframe sandbox MUST exclude allow-same-origin
<iframe sandbox="allow-scripts allow-pointer-lock" />
```
**Files:** `src/utils/htmlSanitizer.ts`, `src/components/SecureIframePreview.tsx`

### Asset Loading
```typescript
// ✅ Always preload before render (prevents white flash)
const assets = assetPreloader.extractAssetUrls(template);
await assetPreloader.preloadImages(assets.images);
await assetPreloader.preloadFonts(assets.fonts);
```
**File:** `src/utils/assetPreloader.ts`

## Project-Specific Conventions

### Import Aliases
```typescript
import { Button } from '@/components/ui/button';  // shadcn/ui components
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
```

### State Management
- **React Query** for server state (`@tanstack/react-query`)
- **React hooks** for local state (no Redux/Zustand)
- **Template schema** as single source of truth (not Fabric canvas state)

### Styling
- **Tailwind CSS** primary (utility classes)
- **CSS variables** for design tokens (`src/index.css`)
- **shadcn/ui** for UI components (not Material-UI or Ant Design)

### TypeScript
- Strict mode enabled
- **No `any` types** (use `unknown` then type guard)
- Interfaces for data structures, types for unions/intersections
- **Files:** `src/types/template.ts`, `src/types/aiWebBuilder.ts`, `src/types/document.ts`

## Route Structure
```
/                    - Landing page (Index.tsx)
/auth               - Supabase authentication
/dashboard          - User projects overview
/web-builder        - Main web builder (WebBuilder.tsx)
/design-studio      - Fabric.js design studio
/code-editor        - CodeMirror-based editor
/creatives          - AI image/video tools
/files              - File management
/planning           - Task planning
/project/:id        - Project detail view
```

## AI Integration Points

### 1. AI Code Assistant
**Context:** Lives in web builder sidebar, generates code snippets
```typescript
await supabase.functions.invoke('ai-code-assistant', {
  body: { 
    prompt: userMessage,
    context: { currentCode, selectedElement }
  }
});
```

### 2. AI Image Generator
**Context:** Generate images for template elements
```typescript
const image = await aiImageService.generateImage({
  prompt: 'modern office workspace',
  style: 'digital-art',
  quality: 'high',
  aspectRatio: '16:9'
});
// Auto-inserts to canvas with wrapper div
// Exports as standard <img> tag in pure HTML
```
**File:** `src/services/aiImageGenerationService.ts`

### 3. Code Generation Philosophy
**CRITICAL:** When generating or modifying templates:
- Generate **only HTML/CSS/JavaScript** - never React components
- Use semantic HTML5 tags: `<header>`, `<nav>`, `<section>`, `<article>`, `<footer>`
- Use vanilla JavaScript for interactivity (event listeners, DOM manipulation)
- Tailwind classes are OK, but must work as standard CSS classes
- No JSX syntax, no React hooks, no framework-specific code

```javascript
// ✅ CORRECT: Pure vanilla JavaScript for a dropdown
const dropdown = document.querySelector('.dropdown');
const menu = dropdown.querySelector('.menu');
dropdown.addEventListener('click', () => {
  menu.classList.toggle('hidden');
});

// ❌ WRONG: React-style code
const [isOpen, setIsOpen] = useState(false);
<div onClick={() => setIsOpen(!isOpen)}>  // Don't generate this
```

### 4. Template Schema Validation
**Always validate AI-generated templates before render:**
```typescript
import { TemplateValidator } from '@/schemas/templateSchema';

const result = TemplateValidator.safeParse(template);
if (!result.success) {
  // Handle validation errors - don't render invalid templates
}
```

## Common Gotchas

1. **Canvas disposal:** Always dispose Fabric canvas on component unmount
   ```typescript
   useEffect(() => {
     return () => fabricCanvas?.dispose();
   }, [fabricCanvas]);
   ```

2. **Element IDs:** Use timestamp-based IDs for uniqueness
   ```typescript
   const elementId = `element-${Date.now()}`;
   ```

3. **RPC messaging:** Use `rpc.ts` for iframe communication (not postMessage directly)
   ```typescript
   import { createRPCHandler } from '@/utils/rpc';
   const handler = createRPCHandler({ ... });
   ```

4. **Lock files:** Only `package-lock.json` (removed bun.lock, pnpm-lock.yaml)

5. **Route additions:** Add new routes ABOVE the catch-all `*` route in App.tsx

## Design Token System
**All exports use CSS variables from `src/index.css`:**
```css
/* Colors (HSL) */
--primary: 210 100% 50%;
--secondary: 0 0% 90%;

/* Spacing (rem) */
--space-4: 1rem;
--space-8: 2rem;

/* Typography */
--font-size-4xl: 2.25rem;
```

**Usage:**
```css
color: hsl(var(--primary));
padding: var(--space-8);
font-size: var(--font-size-4xl);
```

## Testing Changes
1. Check TypeScript: No errors after edits
2. Check ESLint: `npm run lint`
3. Build test: `npm run build` (should complete in ~20-30s)
4. Runtime test: Visual check in browser

## Documentation Philosophy
- **Update existing docs** (ARCHITECTURE.md, AI_*.md) vs creating new files
- **No `*_COMPLETE.md`** status files (removed in cleanup)
- Keep docs concise and actionable

## Recent Major Changes
- Removed duplicate components (EnhancedWebBuilder, ElementsSidebarDemo, ImageEditor)
- Consolidated to single web builder implementation (WebBuilder.tsx)
- Replaced simple ImageEditor with comprehensive AIImageGeneratorDialog
- Cleaned 47+ redundant documentation files
- Single lock file (package-lock.json only)
