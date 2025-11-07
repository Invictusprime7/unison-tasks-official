# HTML Canvas Rendering Fix - React TSX to HTML Conversion

## Problem Identified

The AI was generating **React/TypeScript code (TSX)** but the Monaco editor and canvas were receiving it as a **string**, not rendering it properly. The canvas cannot execute React components directly - it needs compiled HTML/CSS/JS.

### Why This Happened

```typescript
// AI Generated (TSX):
import React, { useState } from 'react';

interface AnimatedHeroProps {
  title: string;
  subtitle: string;
}

export const AnimatedHero: React.FC<AnimatedHeroProps> = ({ title, subtitle }) => {
  const [gradientPos, setGradientPos] = useState({ x: 0, y: 0 });
  // ... more React code
  return <div className="hero">...</div>
}
```

**Result in Canvas**: The raw TSX string appears as text, not a rendered component ❌

### What the Canvas Needs

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <div class="hero">
        <!-- Actual rendered HTML -->
    </div>
    <script>
        // Vanilla JavaScript, not React hooks
        let gradientPos = { x: 0, y: 0 };
    </script>
</body>
</html>
```

**Result in Canvas**: Properly rendered website ✅

## Root Causes

### 1. **Default Format Was React**
```typescript
// Before (in useAIWebBuilder.ts)
const code = await generateCode(layoutPlan);  // Defaults to 'react'
```

**Issue**: React TSX cannot be executed directly in an HTML canvas/iframe without compilation.

### 2. **Conversion Function Incomplete**
The `convertReactToVanilla()` function existed but was:
- Not reliable for complex React patterns
- Couldn't handle all hooks (useState, useEffect, useCallback)
- Struggled with JSX expressions and conditional rendering
- Often produced broken HTML

### 3. **Monaco Editor Incompatibility**
Monaco editor can **display** React code with syntax highlighting, but the **live preview canvas** cannot execute it without:
- A React runtime
- Babel compilation
- Webpack/Vite bundling

## Solutions Implemented

### 1. **Changed Default Format to HTML** ✅

```typescript
// After (in useAIWebBuilder.ts)
const code = await generateCode(layoutPlan, 'html');  // Explicitly HTML
```

**Impact**: AI now generates browser-ready HTML by default instead of React components.

### 2. **Enhanced Edge Function with Format Detection** ✅

```typescript
// supabase/functions/ai-code-assistant/index.ts
const { messages, mode, format, detectedPattern, patternColors } = await req.json();

const isHtmlFormat = format === 'html';
const modeEnhancements = {
  code: isHtmlFormat 
    ? "Generate COMPLETE HTML with vanilla JavaScript"
    : "Generate COMPLETE React/TypeScript components"
};
```

**Impact**: Edge function adapts its code generation strategy based on format.

### 3. **Updated System Prompt with HTML Instructions** ✅

Added comprehensive HTML generation guidelines:

```markdown
## 📄 HTML MODE (FOR CANVAS RENDERING)

**When generating HTML code (default mode), create complete, standalone HTML documents.**

### HTML Document Structure
- Complete DOCTYPE and html tags
- Tailwind CDN in <head>
- Custom CSS in <style> tags
- Vanilla JavaScript in <script> tags
- Semantic HTML5 (header, main, section, footer)
- Self-contained (no external dependencies except Tailwind)
```

**Impact**: AI generates production-ready HTML that works immediately.

### 4. **Maintained React Support for Export** ✅

React mode is still available for users who want to export React components:

```typescript
// Explicit React generation (future use)
const code = await generateCode(layoutPlan, 'react');
```

## How It Works Now

### Flow Diagram

```
User Prompt
    ↓
Parse Prompt → Generate Layout Plan
    ↓
Generate Code (format: 'html')  ← DEFAULT
    ↓
AI Receives Enhanced System Prompt
    ↓
"Generate COMPLETE HTML with vanilla JS"
    ↓
Returns:
```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>/* animations */</style>
</head>
<body>
    <header>...</header>
    <main>
        <section>...</section>
        <section>...</section>
    </main>
    <footer>...</footer>
    <script>
        // Vanilla JS interactivity
    </script>
</body>
</html>
```
    ↓
Apply to Monaco Editor
    ↓
Render in Live Preview Canvas ✅
```

## Before vs After Examples

### Before Fix ❌

**Generated Code**:
```tsx
import React, { useState, useEffect, useCallback } from 'react';

interface AnimatedHeroProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
}

export const AnimatedHero: React.FC<AnimatedHeroProps> = ({ 
  title, 
  subtitle, 
  ctaText, 
  ctaLink 
}) => {
  const [gradientPos, setGradientPos] = useState({ x: 0, y: 0 });
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    setGradientPos({ x: e.clientX, y: e.clientY });
  }, []);
  
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);
  
  return (
    <section className="hero">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </section>
  );
};
```

**Canvas Result**: Raw TSX code displayed as text string 😢

### After Fix ✅

**Generated Code**:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Animated Hero</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .hero-gradient {
            background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), 
                        rgba(139, 92, 246, 0.3), 
                        rgba(59, 130, 246, 0.1));
        }
    </style>
</head>
<body class="bg-gray-900 text-white">
    <section id="hero" class="hero-gradient min-h-screen flex items-center justify-center px-6">
        <div class="text-center">
            <h1 class="text-6xl font-bold mb-4">Amazing Hero Title</h1>
            <p class="text-xl mb-8">Your stunning subtitle goes here</p>
            <a href="#" class="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all">
                Get Started
            </a>
        </div>
    </section>
    
    <script>
        const hero = document.getElementById('hero');
        
        document.addEventListener('mousemove', function(e) {
            const x = (e.clientX / window.innerWidth) * 100;
            const y = (e.clientY / window.innerHeight) * 100;
            hero.style.setProperty('--mouse-x', x + '%');
            hero.style.setProperty('--mouse-y', y + '%');
        });
    </script>
</body>
</html>
```

**Canvas Result**: Beautiful, interactive hero section with gradient following mouse! 🎉

## Technical Details

### Files Modified

1. **`src/hooks/useAIWebBuilder.ts`**
   - Line ~522: Changed `generateCode(layoutPlan)` to `generateCode(layoutPlan, 'html')`
   - Impact: All AI generations now default to HTML format

2. **`supabase/functions/ai-code-assistant/index.ts`**
   - Line ~1229: Added `format` parameter extraction from request
   - Line ~1240: Added format-aware mode enhancements
   - Line ~15: Added HTML mode system prompt instructions
   - Impact: Edge function generates appropriate code based on format

### Deployment Status

✅ **Frontend Changes**: Committed to `379f6bf`
✅ **Edge Function**: Deployed (version 30)
✅ **Status**: Live and active

## Monaco Editor Compatibility

### What Monaco CAN Do ✅
- Display React/TSX code with syntax highlighting
- Show TypeScript type errors
- Provide autocomplete for React/TS
- Format code

### What Monaco CANNOT Do ❌
- Execute React components without a runtime
- Compile TSX to JavaScript on-the-fly
- Render JSX in a canvas/iframe

### Solution
**Generate HTML by default**, which Monaco can:
- Display with syntax highlighting ✅
- Pass to canvas for immediate rendering ✅
- Edit with full HTML/CSS/JS support ✅

## When to Use React Mode

React mode is still available for specific use cases:

```typescript
// Explicit React generation
const code = await generateCode(layoutPlan, 'react');
```

**Use Cases**:
- Exporting components to a React project
- Generating reusable React components
- Creating component library documentation
- When user explicitly requests "React component"

**Default**: Always use HTML mode for canvas rendering.

## Testing Instructions

1. Open Web Builder page
2. Open AI Assistant panel
3. Try this prompt:
   ```
   Create a modern landing page with animated hero, 
   features section, and contact form
   ```

4. **Verify**:
   - ✅ Generated code is complete HTML document
   - ✅ Includes `<!DOCTYPE html>` and full structure
   - ✅ Has Tailwind CDN link in `<head>`
   - ✅ Uses vanilla JavaScript, not React hooks
   - ✅ Renders immediately in canvas preview
   - ✅ All interactions work (hover, click, animations)
   - ✅ No "import React" or "interface" keywords
   - ✅ No TSX syntax like `className={}`

## Summary

| Aspect | Before | After |
|--------|--------|-------|
| Default Format | React/TSX | HTML |
| Canvas Rendering | ❌ String display | ✅ Full render |
| Monaco Compatibility | ⚠️ Display only | ✅ Display + Execute |
| Interactivity | ❌ No runtime | ✅ Vanilla JS works |
| User Experience | 😢 Broken | 🎉 Perfect |
| Token Limit | 3000 (truncated) | 16000 (complete) |

## Root Cause Summary

**Monaco editor is NOT incompatible with React** - it can display React code perfectly.

**The canvas/iframe is incompatible with raw React** - it cannot execute TSX without compilation.

**Solution**: Generate HTML by default so the canvas can render it immediately, while Monaco can still edit it with full syntax support.

---

✅ **Fix Complete**: AI now generates complete HTML that renders beautifully in the canvas! 🎨
