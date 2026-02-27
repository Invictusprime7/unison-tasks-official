# Unison Tasks - Current Stack

## Technology Stack (as of February 2026)

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.0 | UI framework |
| **Vite** | 7.1.10 | Build tool & dev server |
| **TypeScript** | 5.9.3 | Type safety |
| **TailwindCSS** | 3.4.18 | Utility-first styling |
| **shadcn/ui** | Latest | Component library (Radix UI primitives) |
| **React Router** | 7.9.4 | Client-side routing |
| **TanStack Query** | 5.90.3 | Server state management |
| **Framer Motion** | 12.29.2 | Animations |

### Backend & Infrastructure
| Technology | Purpose |
|------------|---------|
| **Supabase** | Database (PostgreSQL), Auth, Edge Functions, Storage |
| **Vercel** | Hosting, Serverless Functions, Analytics |
| **Inngest** | Workflow orchestration, background jobs |
| **Trigger.dev** | Event-driven automation |

### Database
- **Supabase PostgreSQL** (`nfrdomdvyrbwuokathtw.supabase.co`)
- Row-level security (RLS) enabled
- Edge Functions for serverless compute

### Key Integrations
| Service | Purpose |
|---------|---------|
| **OpenAI** | AI code assistant, template generation |
| **Lovable AI** | AI-powered web builder (Gemini 2.5 Flash) |
| **Stripe** | Payments & subscriptions |
| **Vercel Analytics** | Performance monitoring |

### Canvas & Editor
| Library | Version | Purpose |
|---------|---------|---------|
| **Fabric.js** | 6.7.1 | Canvas editing & manipulation |
| **Monaco Editor** | 4.7.0 | Code editing |
| **CodeMirror** | 6.0.2 | Alternative code editing |
| **Sandpack** | 2.20.0 | Live code preview |

### Notable Libraries
- **Zod** 4.1.12 - Schema validation
- **React Hook Form** 7.65.0 - Form handling
- **Recharts** 3.2.1 - Data visualization
- **DOMPurify** 3.3.0 - HTML sanitization
- **JSZip** 3.10.1 - File compression
- **html2canvas** 1.4.1 - Screenshot capture
- **Lucide React** 0.545.0 - Icons

### Dev Tools
- **ESLint** 9.37.0 - Linting
- **lovable-tagger** 1.1.11 - Lovable AI integration
- **rollup-plugin-visualizer** - Bundle analysis

### Environment
- **Node.js** 20.x (required)
- **PowerShell** scripts for Windows automation
- **Docker** support for preview service

---

# AI Web Parsing & VFS Integration (February 2026)

## Overview
Enhanced AI-generated web content parsing for unique React component outputs using the Virtual File System (VFS).

## New Components

### `src/utils/aiWebParser.ts`
Comprehensive parsing utility for AI-generated web content:

**Online Webpage Parsing:**
- `parseOnlineWebpage(html, sourceUrl?)` - Extract structured content from raw HTML
- `extractMeta()` - Parse meta tags, OG data, title, description
- `extractCleanHtml()` - Remove scripts, tracking, sanitize content
- `extractAssets()` - Collect images, fonts, stylesheets
- `detectFramework()` - Identify React/Vue/Svelte/HTML source

**Saved Project Parsing:**
- `parseSavedProject(data)` - Load JSON project files
- `extractProjectMetadata()` - Detect framework, dependencies, entry point
- Supports localStorage, file upload, and API sources

**Unique React Component Generation:**
- `generateUniqueReactVFS(content, options)` - Convert to complete VFS structure
- `extractComponentsFromHtml()` - Split semantic sections into components
- `htmlToJsx()` - Convert HTML attributes to valid JSX
- Components extracted: header, nav, main, section, article, aside, footer

**Code Transformation:**
- `transformCodeToVFS(code, options)` - Auto-detect and convert any code format
- Handles React, HTML, JSX snippets, mixed content
- Generates unique hash per component for caching

### `src/utils/aiResponseParser.ts` (Enhanced)
New exports for VFS integration:
- `parseAIResponseToVFS(input, options)` - Direct AI response to VFS conversion
- `extractComponentSignature(code)` - Generate unique component identifiers
- Re-exports all `aiWebParser` utilities

### `src/contexts/VFSContext.tsx` (Enhanced)
New context methods:
- `importSavedProject(data)` - Parse and import saved project
- `importFromWebpage(html, url?)` - Import online page content
- `importFromCode(code, name?)` - Import AI-generated code
- `parseWebContent(html, url?)` - Parse without importing (preview mode)

### `src/hooks/useVFSContext.ts` (Enhanced)
New hook for imports:
```typescript
const { importFromWebpage, importFromCode, importSavedProject } = useVFSImport();

// Import from URL content
const result = importFromWebpage(fetchedHtml, 'https://example.com');

// Import AI-generated code
const result = importFromCode(aiResponse, 'MyProject');

// Import saved project
const project = importSavedProject(localStorage.getItem('project'));
```

## VFS Generation Output
Each generation produces a complete React project structure:
```
/index.html          - HTML with Tailwind CDN
/src/App.tsx         - Main app component
/src/main.tsx        - React entry point
/src/index.css       - Enhanced CSS with variables
/src/components/     - Extracted semantic components
/package.json        - Dependencies & scripts
/vite.config.ts      - Vite configuration
/tsconfig.json       - TypeScript config
```

## Usage Examples

```typescript
// 1. Import webpage for recreation
const html = await fetch('https://example.com').then(r => r.text());
const result = vfs.importFromWebpage(html, 'https://example.com');
console.log('Generated', Object.keys(result.files).length, 'files');

// 2. Convert AI output to VFS
const aiOutput = await generateWithAI(prompt);
const { files, componentName } = transformCodeToVFS(aiOutput, {
  projectName: 'MyWebsite',
  preferReact: true
});

// 3. Parse for analysis without importing
const content = vfs.parseWebContent(html);
console.log('Framework:', content.framework);
console.log('Assets:', content.assets.length);
```

---

# Infrastructure Analysis & Cleanup (February 2026)

## Completed Fixes

### 1. Consolidated HTML-to-JSX Converters
**Issue:** 3 separate implementations of the same logic in:
- `componentRenderer.ts` (basic: 4 replacements)
- `templateToVFS.ts` (medium: with style conversion)
- `aiWebParser.ts` (comprehensive: all conversions)

**Resolution:**
- Canonical `htmlToJsx()` now exported from [aiWebParser.ts](src/utils/aiWebParser.ts)
- [componentRenderer.ts](src/utils/componentRenderer.ts) - Now imports from aiWebParser
- [templateToVFS.ts](src/utils/templateToVFS.ts) - Now imports from aiWebParser
- Removed ~50 lines of duplicate code

### 2. Removed Dead Import
- [AICodeAssistant.tsx](src/components/creatives/AICodeAssistant.tsx) had unused import of `parseAIFileTags`
- Import removed, functionality already covered by `parseAIResponse`

---

## Files Recommended for Removal

### Definitely Unused (0 imports)

| File | Lines | Reason |
|------|-------|--------|
| [src/utils/htmlToTemplateConverter.ts](src/utils/htmlToTemplateConverter.ts) | 280 | No imports found anywhere in codebase |
| [supabase/functions/ai-web-assistant/](supabase/functions/ai-web-assistant/) | 90 | No call sites in src/ - never invoked |

### Candidates for Deprecation (low usage)

| File | Status | Action Taken |
|------|--------|--------------|
| ~~src/utils/aiFileTags.ts~~ | ✅ DELETED | Functionality in aiResponseParser.ts |
| ~~src/utils/vfs.ts~~ | ✅ DELETED | Class inlined into SecureIframePreview.tsx |
| ~~src/hooks/useAITemplate.ts~~ | ✅ MERGED | Functions moved to useWebBuilderAI.ts |

### Edge Functions with Overlapping Purpose

| Function | Purpose | Recommendation |
|----------|---------|----------------|
| `ai-code-assistant` | Primary - General code gen with web research | KEEP (17+ call sites) |
| `ai-design-assistant` | Fabric canvas mockups | KEEP (used by DesignStudio) |
| `ai-web-assistant` | Streaming web suggestions | **DELETE** - 0 call sites |
| `web-builder-ai` | Fabric.js objects | KEEP (1 call site) |
| `generate-ai-template` | JSON template schema | KEEP (2 call sites) |
| `generate-template` | Raw HTML output | KEEP (1 call site) |
| `generate-page` | Page structure schema | KEEP (3 call sites) |

---

## VFS Component Inventory

### Currently Active VFS Files

| File | Type | Lines | Purpose | Status |
|------|------|-------|---------|--------|
| [useVirtualFileSystem.ts](src/hooks/useVirtualFileSystem.ts) | Hook | 1280 | Primary VFS - React state tree | **ACTIVE** |
| [VFSContext.tsx](src/contexts/VFSContext.tsx) | Context | 290 | VFS + Preview provider | **ACTIVE** |
| [useVFSContext.ts](src/hooks/useVFSContext.ts) | Hook | 100 | VFS accessor hooks | **ACTIVE** |
| [aiWebParser.ts](src/utils/aiWebParser.ts) | Utility | 990 | Parse & transform to VFS | **ACTIVE** |
| [templateToVFS.ts](src/utils/templateToVFS.ts) | Utility | 327 | Template → VFS files | **ACTIVE** |
| [redirectPageGenerator.ts](src/utils/redirectPageGenerator.ts) | Utility | 447 | Multi-page VFS generation | **ACTIVE** |

### Legacy/Redundant VFS Files

| File | Lines | Issue | Action |
|------|-------|-------|--------|
| [vfs.ts](src/utils/vfs.ts) | 102 | Class-based VFS, only 1 usage | Migrate SecureIframePreview to use context |

---

## Duplicate Function Analysis

### Parsing Functions (Choose ONE per Type)

| Parser Type | Recommended | Deprecated |
|-------------|-------------|------------|
| AI file tags | `aiResponseParser.parseFileTags()` | `aiFileTags.parseAIFileTags()` |
| AI response structure | `aiResponseParser.parseAIResponse()` | - |
| HTML → JSX | `aiWebParser.htmlToJsx()` | `componentRenderer.convertHTMLToJSX()`, `templateToVFS.convertHtmlToJsx()` |
| Webpage parsing | `aiWebParser.parseOnlineWebpage()` | - |
| Code transformation | `aiWebParser.transformCodeToVFS()` | - |

### Template Generation (All Serve Different Purposes)

| Function | Output | Keep |
|----------|--------|------|
| `generateUniqueReactVFS()` | React project files | Yes |
| `templateToVFSFiles()` | Basic VFS structure | Yes |
| `generateMultiPageVFS()` | Multi-page router | Yes |

---

## Recommended Cleanup Commands

```powershell
# Remove definitely unused files
Remove-Item ".\src\utils\htmlToTemplateConverter.ts"
Remove-Item ".\src\utils\aiFileTags.ts"
Remove-Item ".\supabase\functions\ai-web-assistant" -Recurse

# Remove from supabase config
# Edit supabase/config.toml and remove [functions.ai-web-assistant] section
```

---

# Premium Industry Template Library for System Launcher

## Problem
Currently, only **1 actual HTML template** exists (Salon Luxury Premium). The System Launcher shows template cards for dozens of categories (Restaurant, E-commerce, Portfolio, etc.), but they all lack real HTML code. When users select them, the system either falls back to AI generation (inconsistent quality) or shows empty previews. There is no "gold standard" reference for AI to learn from.

## Solution
Build **3 premium, handcrafted HTML templates per industry** (8 industries x 3 = **24 total templates**) that:
- Follow the exact same structure as the existing `salon-luxury-premium` template
- Use the `ADVANCED_CSS`, `SCROLL_REVEAL_SCRIPT`, and `INTERACTIVE_SCRIPT` systems already in place
- Wire all CTAs with `data-ut-intent` and `data-ut-cta` attributes
- Include Lucide CDN icons, real Unsplash imagery, and industry-specific content
- Serve as both selectable starter templates AND reference material for AI generation

## Industry x Template Matrix

Each industry gets 3 distinct visual/structural variants:

| Industry | Template 1 (Dark Luxury) | Template 2 (Light Modern) | Template 3 (Bold Editorial) |
|---|---|---|---|
| **Salon/Spa** | Already exists | Light airy wellness | Bold magazine editorial |
| **Restaurant** | Dark fine dining | Bright casual bistro | Rustic farm-to-table |
| **Local Service** | Professional contractor | Friendly neighborhood | Emergency/urgent CTA |
| **E-commerce** | Dark fashion store | Clean product showcase | Bold lifestyle brand |
| **Coaching** | Premium executive | Warm approachable | Bold motivational |
| **Real Estate** | Luxury properties | Modern listings | Bold investment |
| **Portfolio/Creator** | Minimal dark showcase | Light gallery | Bold experimental |
| **Nonprofit** | Warm mission-driven | Clean institutional | Bold impact-focused |

## Architecture

### File Structure

```text
src/data/templates/
  salon/index.ts          (existing - add 2 more templates)
  restaurant/index.ts     (NEW - 3 templates)
  local-service/index.ts  (NEW - 3 templates)
  ecommerce/index.ts      (NEW - 3 templates)
  coaching/index.ts       (NEW - 3 templates)
  real-estate/index.ts    (NEW - 3 templates)
  portfolio/index.ts      (NEW - 3 templates)
  nonprofit/index.ts      (NEW - 3 templates)
  index.ts                (updated to aggregate all)
  types.ts                (updated with new categories)
```

### Template Structure Per File

Each industry file follows the proven `salon/index.ts` pattern:

1. **Industry-specific CSS overrides** (gradient colors, accent hues)
2. **3 complete HTML templates** with 8-12 sections each:
   - Navigation (sticky, with mobile menu)
   - Hero (industry-specific imagery + CTA)
   - Services/Features/Products grid
   - About/Trust section with stats
   - Gallery/Portfolio/Menu section (industry-specific)
   - Testimonials
   - Pricing/Packages (where applicable)
   - Contact/Booking form (wired with `data-ut-intent`)
   - Newsletter signup
   - Footer with hours, links, social
3. **Export as `LayoutTemplate[]`** with proper `id`, `category`, `systemType`, `tags`

### What Each Template Includes

Every template will have:
- Full `<!DOCTYPE html>` document via `wrapInHtmlDoc()`
- `ADVANCED_CSS` for glassmorphism, shadows, animations
- `SCROLL_REVEAL_SCRIPT` for IntersectionObserver animations
- `INTERACTIVE_SCRIPT` for tabs, carousels, accordion, smooth scroll
- Lucide CDN (`<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js">`) with `lucide.createIcons()` init
- Industry-specific Unsplash photo IDs (not generic placeholders)
- Realistic business content (names, prices, descriptions, testimonials)
- Proper `data-ut-intent` wiring on all conversion CTAs
- `data-no-intent` on UI controls (tabs, filters, accordions)
- `data-ut-section` labels for AI editing context
- Responsive design (mobile-first with `md:` and `lg:` breakpoints)

## Implementation Steps

### Step 1: Update `types.ts`
Add missing `LayoutCategory` values for the new industries so the type system covers all template folders.

### Step 2: Create Industry Template Files (7 new files)
Each file contains 3 complete HTML templates following the salon pattern. Templates are premium quality with:
- Dark/Light/Bold visual variants
- Industry-appropriate color schemes from `extendedIndustryProfiles.ts` palettes
- Real Unsplash images tagged to each industry
- Complete interactive functionality (forms, accordions, tabs, carousels)

### Step 3: Add 2 More Salon Templates
The existing salon file has 1 template. Add 2 more variants (Light Wellness + Bold Editorial) to match the 3-per-industry standard.

### Step 4: Update `index.ts` Aggregation
Import all new industry template arrays and merge them into `layoutTemplates`. Update `getTemplatesByCategory` and `getTemplatesBySystem` to correctly resolve the new templates.

### Step 5: Ensure Manifest Coverage
Verify every new template ID has a corresponding entry in `manifest.ts`. Add any missing manifest entries so the System Launcher correctly provisions backend resources.

### Step 6: Update System Launcher Integration
Ensure `SystemLauncher.tsx` properly surfaces the new templates when a user selects each business system type. The category filter and template count should reflect the expanded library.

### Step 7: Feed Templates to AI Generation
Update `systems-build` edge function to optionally load the closest matching template HTML from the frontend template library as a "reference example" in its prompt, giving AI a concrete quality baseline to match or exceed.

## Technical Details

### Template ID Convention
```text
{industry}-{variant}-{descriptor}
Examples:
  restaurant-dark-fine-dining
  restaurant-light-casual-bistro
  restaurant-bold-farm-table
  ecommerce-dark-fashion
  coaching-premium-executive
```

### Intent Wiring Per Industry

| Industry | Primary Intent | Secondary Intents |
|---|---|---|
| Salon/Spa | `booking.create` | `contact.submit`, `newsletter.subscribe` |
| Restaurant | `booking.create` | `contact.submit`, `newsletter.subscribe` |
| Local Service | `quote.request` | `contact.submit`, `booking.create` |
| E-commerce | `newsletter.subscribe` | `contact.submit` |
| Coaching | `booking.create` | `contact.submit`, `newsletter.subscribe`, `quote.request` |
| Real Estate | `contact.submit` | `quote.request`, `newsletter.subscribe` |
| Portfolio | `contact.submit` | `quote.request` |
| Nonprofit | `contact.submit` | `newsletter.subscribe` |

### Image Strategy

Each industry uses curated Unsplash photo IDs for consistent, high-quality imagery:
- Restaurant: Food plating, dining ambiance, chef action shots
- Local Service: Workers on-site, tools, before/after transformations
- E-commerce: Product flat-lays, lifestyle shots, packaging
- Coaching: Professional headshots, workshop settings, success imagery
- Real Estate: Property exteriors, interiors, aerial views
- Portfolio: Creative work samples, studio shots, process imagery
- Nonprofit: Community impact, volunteers, beneficiary stories

## Expected Outcome

- **24 total production-ready templates** available in System Launcher
- Each industry has 3 visually distinct options (dark luxury, light modern, bold editorial)
- AI systems can reference these templates as quality baselines
- Users see real previews instead of empty placeholders
- All templates are backend-wired and ready for production deployment

