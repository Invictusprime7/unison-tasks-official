import { serve } from "serve";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { generateVariation, variationToPromptContext } from "../_shared/industryVariations.ts";

/**
 * Convert hex color to HSL string (CSS format without "hsl()")
 * Returns format: "H S% L%" for CSS custom properties
 */
function hexToHsl(hex: string): string {
  hex = hex.replace(/^#/, '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return `0 0% ${Math.round(l * 100)}%`;
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  switch (max) {
    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
    case g: h = ((b - r) / d + 2) / 6; break;
    case b: h = ((r - g) / d + 4) / 6; break;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

interface CodePattern {
  pattern_type: string;
  description: string | null;
  usage_count: number;
  success_rate: number;
  tags: string[] | null;
  code_snippet: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ============================================================================
// WEB RESEARCH INTEGRATION
// Searches the web to gather context for improved AI code generation
// ============================================================================

interface ResearchResult {
  snippets: string[];
  trends: string[];
  keyPhrases: string[];
}

/**
 * Decode HTML entities
 */
function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

/**
 * Strip HTML tags
 */
function stripHtmlTags(input: string): string {
  return decodeHtmlEntities(input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
}

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(url: string, timeoutMs = 5000): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; WebBuilderAI/1.0)",
        "Accept": "text/html,application/xhtml+xml",
      },
    });
    if (!res.ok) return "";
    return await res.text();
  } catch {
    return "";
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Parse DuckDuckGo search results
 */
function parseDDGResults(html: string, max = 4): string[] {
  const snippets: string[] = [];
  const snippetRe = /<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>|<div[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/div>/gi;
  let match: RegExpExecArray | null;
  while ((match = snippetRe.exec(html)) && snippets.length < max) {
    const raw = match[1] || match[2] || "";
    const snippet = stripHtmlTags(raw);
    if (snippet && snippet.length > 30) {
      snippets.push(snippet);
    }
  }
  return snippets;
}

/**
 * Extract key design/development insights from snippets
 */
function extractInsights(snippets: string[]): { trends: string[]; keyPhrases: string[] } {
  const trends: string[] = [];
  const keyPhrases: string[] = [];
  
  const trendKeywords = ["trend", "popular", "modern", "2025", "2024", "latest", "best practice"];
  const featureKeywords = ["feature", "include", "component", "design", "layout", "responsive"];
  
  for (const snippet of snippets) {
    const lower = snippet.toLowerCase();
    if (trendKeywords.some(kw => lower.includes(kw))) {
      const sentences = snippet.split(/[.!?]+/).filter(s => s.trim().length > 20);
      if (sentences[0] && trendKeywords.some(kw => sentences[0].toLowerCase().includes(kw))) {
        trends.push(sentences[0].trim());
      }
    }
    if (featureKeywords.some(kw => lower.includes(kw))) {
      const sentences = snippet.split(/[.!?]+/).filter(s => s.trim().length > 20);
      if (sentences[0] && featureKeywords.some(kw => sentences[0].toLowerCase().includes(kw))) {
        keyPhrases.push(sentences[0].trim());
      }
    }
  }
  
  return { 
    trends: [...new Set(trends)].slice(0, 3), 
    keyPhrases: [...new Set(keyPhrases)].slice(0, 3) 
  };
}

/**
 * Perform web research based on user prompt
 */
async function performPromptResearch(userPrompt: string): Promise<ResearchResult> {
  const result: ResearchResult = { snippets: [], trends: [], keyPhrases: [] };
  
  if (!userPrompt || userPrompt.length < 10) return result;
  
  try {
    // Extract keywords from user prompt
    const cleanPrompt = userPrompt
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/<[^>]*>/g, '') // Remove HTML
      .replace(/\b(create|make|build|add|change|update|generate|design|I want|I need|please|can you)\b/gi, '')
      .trim();
    
    if (cleanPrompt.length < 5) return result;
    
    // Build targeted search query
    const searchQuery = `web design ${cleanPrompt.split(/\s+/).slice(0, 5).join(' ')} best practices`;
    const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchQuery)}`;
    
    const html = await fetchWithTimeout(ddgUrl, 4000);
    const snippets = parseDDGResults(html, 4);
    
    const seenSnippets = new Set<string>();
    for (const snippet of snippets) {
      const normalized = snippet.toLowerCase().substring(0, 40);
      if (!seenSnippets.has(normalized)) {
        seenSnippets.add(normalized);
        result.snippets.push(snippet);
      }
    }
    
    const insights = extractInsights(result.snippets);
    result.trends = insights.trends;
    result.keyPhrases = insights.keyPhrases;
    
    console.log(`[ai-code-assistant] Research completed: ${result.snippets.length} snippets`);
  } catch (error) {
    console.warn("[ai-code-assistant] Research failed (non-blocking):", error);
  }
  
  return result;
}

/**
 * Format research for AI prompt injection
 */
function formatResearchContext(research: ResearchResult): string {
  if (research.snippets.length === 0) return "";
  
  let context = "\n\n🔬 **LIVE WEB RESEARCH CONTEXT:**\n";
  
  if (research.trends.length > 0) {
    context += "\n**Current Design Trends:**\n";
    for (const trend of research.trends) {
      context += `- ${trend}\n`;
    }
  }
  
  if (research.keyPhrases.length > 0) {
    context += "\n**Recommended Approaches:**\n";
    for (const phrase of research.keyPhrases) {
      context += `- ${phrase}\n`;
    }
  }
  
  if (research.snippets.length > 0) {
    context += "\n**Relevant Context:**\n";
    for (const snippet of research.snippets.slice(0, 3)) {
      const truncated = snippet.length > 150 ? snippet.substring(0, 150) + "..." : snippet;
      context += `> ${truncated}\n`;
    }
  }
  
  return context;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const messageContentSchema = z.union([
      // Standard text-only chat
      z.string().min(1).max(10_000),
      // Multimodal content (e.g. [{ type: 'text', text: '...' }, { type: 'image_url', ... }])
      // We intentionally keep this permissive because the AI gateway supports these objects.
      z.array(z.unknown()).min(1).max(50),
    ]);

    const bodySchema = z.object({
      messages: z
        .array(
          z.object({
            role: z.enum(["user", "assistant", "system"]),
            content: messageContentSchema,
          })
        )
        .min(1)
        .max(50),
      mode: z.string().max(30).optional(),
      savePattern: z.boolean().optional(),
      generateImage: z.boolean().optional(),
      imagePlacement: z.string().max(40).optional(),
      currentCode: z.string().max(200_000).optional(),
      editMode: z.boolean().optional(),
      debugMode: z.boolean().optional(),
      templateAction: z.string().max(50).optional(),
      templateAnalysis: z.string().max(20_000).optional(),
      // System type for business context
      systemType: z.string().max(50).optional(),
      // Template generation parameters (for template-json and template-html modes)
      variationSeed: z.string().max(30).optional(),
      templateName: z.string().max(100).optional(),
      aesthetic: z.string().max(80).optional(),
      source: z.string().max(80).optional(),
      // User Design Profile - extracted patterns from user's saved projects for style-matching
      userDesignProfile: z.object({
        projectCount: z.number().optional(),
        dominantStyle: z.enum(["dark", "light", "colorful", "minimal", "mixed"]).optional(),
        industryHints: z.array(z.string()).optional(),
      }).optional(),
    });

    const parsed = bodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid request body",
          // Keep details small but helpful for debugging.
          details: parsed.error.issues.slice(0, 10).map((i) => ({ path: i.path, message: i.message })),
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const {
      messages,
      mode,
      savePattern = true,
      generateImage = false,
      imagePlacement,
      currentCode,
      editMode = false,
      debugMode: _debugMode = false,
      templateAction,
      templateAnalysis: _templateAnalysis,
      systemType,
      variationSeed,
      templateName,
      aesthetic,
      source,
      userDesignProfile,
    } = parsed.data;
    
    // Suppress unused variable warnings - these are used in specific modes
    void _debugMode;
    void _templateAnalysis;
    
    // Build system type context for business-aware generation
    const systemTypeContext = systemType ? `
[Business System Type: ${systemType}]
Generate content and features appropriate for a ${systemType} business. Consider:
- Industry-specific sections and terminology
- Relevant call-to-actions and conversion elements
- Appropriate color schemes and imagery suggestions
- Business-specific functionality (booking for services, cart for stores, etc.)
` : '';
    
    // Build design profile context string for AI prompts
    const designProfileContext = userDesignProfile ? `
[User Design Profile - Match this established style]
- Analyzed Projects: ${userDesignProfile.projectCount || 0}
- Dominant Style: ${userDesignProfile.dominantStyle || 'mixed'}
- Industry Experience: ${userDesignProfile.industryHints?.join(', ') || 'none'}
Generate a site that matches the user's established design preferences while being unique.
` : '';
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      console.warn("LOVABLE_API_KEY not configured - AI features unavailable");
      return new Response(
        JSON.stringify({ 
          error: "AI features are not available. Please deploy to Lovable Cloud to enable AI capabilities.",
          isLocalDevelopment: true
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase for learning system
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch top learned patterns for context — include full code snippets for design reference
    const { data: patterns } = await supabase
      .from('ai_code_patterns')
      .select('*')
      .order('usage_count', { ascending: false })
      .order('success_rate', { ascending: false })
      .limit(12);

    const learnedPatterns = patterns && patterns.length > 0 ? (patterns as CodePattern[]).map((p: CodePattern) => `
📐 **${p.pattern_type.toUpperCase()}** — ${p.description || 'N/A'}
Tags: ${(p.tags || []).join(', ')} | Used ${p.usage_count}× | ${p.success_rate}% success
\`\`\`html
${p.code_snippet.substring(0, 600)}${p.code_snippet.length > 600 ? '...' : ''}
\`\`\`
`).join('\n') : 'No learned patterns yet - but I will learn from every successful interaction!';

    // Analyze template structure for context-aware editing
    const analyzeTemplateStructure = (code: string): string => {
      if (!code) return '';
      
      const sections: string[] = [];
      const patterns = [
        { regex: /<header[^>]*>|class="[^"]*header[^"]*"/gi, name: 'Header/Navigation' },
        { regex: /<nav[^>]*>|class="[^"]*nav[^"]*"/gi, name: 'Navigation' },
        { regex: /class="[^"]*hero[^"]*"|id="[^"]*hero[^"]*"/gi, name: 'Hero Section' },
        { regex: /class="[^"]*feature[^"]*"|id="[^"]*feature[^"]*"/gi, name: 'Features Section' },
        { regex: /class="[^"]*about[^"]*"|id="[^"]*about[^"]*"/gi, name: 'About Section' },
        { regex: /class="[^"]*pricing[^"]*"|id="[^"]*pricing[^"]*"/gi, name: 'Pricing Section' },
        { regex: /class="[^"]*testimonial[^"]*"|id="[^"]*testimonial[^"]*"/gi, name: 'Testimonials' },
        { regex: /class="[^"]*team[^"]*"|id="[^"]*team[^"]*"/gi, name: 'Team Section' },
        { regex: /class="[^"]*contact[^"]*"|id="[^"]*contact[^"]*"|<form[^>]*>/gi, name: 'Contact/Form Section' },
        { regex: /class="[^"]*cta[^"]*"|id="[^"]*cta[^"]*"/gi, name: 'Call-to-Action' },
        { regex: /<footer[^>]*>|class="[^"]*footer[^"]*"/gi, name: 'Footer' },
        { regex: /class="[^"]*gallery[^"]*"|id="[^"]*gallery[^"]*"/gi, name: 'Gallery/Portfolio' },
        { regex: /class="[^"]*faq[^"]*"|id="[^"]*faq[^"]*"/gi, name: 'FAQ Section' },
        { regex: /class="[^"]*blog[^"]*"|id="[^"]*blog[^"]*"/gi, name: 'Blog/News Section' },
      ];
      
      patterns.forEach(({ regex, name }) => {
        if (regex.test(code) && !sections.includes(name)) {
          sections.push(name);
        }
      });
      
      // Count images and buttons
      const imageCount = (code.match(/<img[^>]*>/gi) || []).length;
      const buttonCount = (code.match(/<button[^>]*>|class="[^"]*btn[^"]*"/gi) || []).length;
      const linkCount = (code.match(/<a[^>]*href/gi) || []).length;
      
      return `
📊 **TEMPLATE STRUCTURE ANALYSIS:**
- Detected Sections: ${sections.length > 0 ? sections.join(', ') : 'Basic layout'}
- Images: ${imageCount} | Buttons: ${buttonCount} | Links: ${linkCount}
- Approximate Size: ${code.length} characters
`;
    };

    // Build edit mode context if we have current code - limit to 4000 chars to prevent token overflow
    const maxCodeLength = 4000;
    const templateStructure = currentCode ? analyzeTemplateStructure(currentCode) : '';
    
    // Build template action context for specific edit operations
    const templateActionContext = templateAction ? `
🎯 **TEMPLATE ACTION: ${templateAction.toUpperCase()}**
${templateAction === 'add' ? `User wants to ADD new elements/sections to the template.
- Identify the best location for new content
- Maintain existing design patterns and styles
- Ensure new elements match the template's visual language` : ''}
${templateAction === 'remove' ? `User wants to REMOVE elements/sections from the template.
- Carefully remove ONLY what's specified
- Clean up any orphaned styles or empty containers
- Maintain structural integrity after removal` : ''}
${templateAction === 'modify' ? `User wants to MODIFY existing elements/sections.
- Make targeted changes without affecting other parts
- Preserve overall design consistency
- Update only the specified properties/content` : ''}
${templateAction === 'suggest' ? `User wants UI/UX SUGGESTIONS for improvement.
- Analyze current template for improvements
- Suggest specific, actionable enhancements
- Provide code examples for each suggestion
- Consider accessibility, performance, and UX best practices` : ''}
${templateAction === 'restyle' ? `User wants to RESTYLE the template visually.
- Change colors, fonts, spacing as requested
- Maintain layout and structure
- Ensure consistent styling across all sections` : ''}
${templateAction === 'full-control' ? `🚀 **FULL CREATIVE CONTROL MODE - AI HAS COMPLETE AUTHORITY**

You have FULL AUTHORITY to make ANY UI/UX decisions to improve this template. The user trusts your expertise.

🎨 **YOU CAN AND SHOULD:**

**VISUAL DESIGN:**
- Completely restyle colors, fonts, typography, spacing
- Add gradients, shadows, animations, transitions
- Implement glassmorphism, neumorphism, or any modern design trend
- Change backgrounds, add patterns, textures, or visual effects
- Adjust all spacing, padding, margins for better visual rhythm
- Add micro-interactions and hover effects

**LAYOUT & STRUCTURE:**
- Reorder sections for better user flow and conversion
- Add new sections (hero, features, testimonials, FAQ, CTA, etc.)
- Remove redundant or weak sections
- Reorganize grid layouts (2-col → 3-col, etc.)
- Add responsive breakpoints where missing
- Implement better visual hierarchy

**CONTENT & COPY:**
- Rewrite headlines for impact and clarity
- Improve button labels for better conversion
- Add compelling subheadings and descriptions
- Enhance placeholder text to be more realistic
- Add social proof elements (stats, testimonials, badges)
- Improve CTAs with urgency and value props

**FUNCTIONALITY:**
- Make static elements dynamic (counters, carousels, tabs)
- Add interactive components (accordions, modals, tooltips)
- Implement cart → checkout flows for e-commerce
- Add form validation and user feedback
- Implement scroll animations and reveals
- Add progress indicators and loading states

**E-COMMERCE ENHANCEMENTS:**
- Add product cards with proper data-ut-intent="cart.add"
- Implement shopping cart with item count badge
- Add checkout flow with data-ut-intent="checkout.start"
- Include price displays, quantity selectors, variant pickers
- Add "Add to Cart" animations and feedback
- Include trust badges and security indicators

**CONVERSION OPTIMIZATION:**
- Add sticky headers/CTAs for key actions
- Implement exit-intent triggers (conceptual placement)
- Add urgency elements (limited time, stock counters)
- Include trust signals throughout
- Optimize form placement and length
- Add multi-step forms for complex flows

**BACKEND WIRING (REQUIRED):**
- Wire all CTAs with appropriate data-ut-intent attributes:
  - Booking: data-ut-intent="booking.create"
  - Contact: data-ut-intent="contact.submit"
  - Newsletter: data-ut-intent="newsletter.subscribe"
  - E-commerce: data-ut-intent="cart.add", "cart.view", "checkout.start"
  - Auth: data-ut-intent="auth.signup", "auth.signin"
  - Quotes: data-ut-intent="quote.request"
- Include proper data-* attributes for payload (data-product-id, data-price, etc.)
- Add data-ut-cta labels for CTA tracking

**OUTPUT REQUIREMENTS:**
1. Return COMPLETE, PRODUCTION-READY HTML
2. Use Tailwind CSS with design token classes (bg-primary, text-foreground, etc.)
3. Include all necessary <style> blocks for custom animations
4. Include all <script> blocks for interactivity
5. Ensure responsive design (mobile-first with sm:, md:, lg: breakpoints)
6. Wire ALL conversion elements with data-ut-intent
7. No markdown, no explanations - just the complete HTML code

📦 **STRUCTURED OUTPUT FORMATS (ADVANCED):**
For targeted modifications, you can use these structured tags that the parser will extract:

**File patches (multi-file changes):**
<file path="/index.html">...html content...</file>
<file path="/styles.css">...css content...</file>

**Builder actions:**
<action type="install_pack" pack="leads"/>
<action type="wire_button" selector=".book-btn" intent="booking.create"/>

**Style modifications (targeted):**
<style element=".hero-title" property="color" value="#ff6b6b"/>
<style element=".cta-button" property="background" value="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"/>

**Section operations:**
<section operation="add" type="testimonials" position="after:features">...html...</section>
<section operation="remove" id="faq"/>
<section operation="reorder" from="2" to="0"/>

**Element operations:**
<element operation="modify" selector=".hero h1" attribute="class" value="text-6xl font-bold"/>
<element operation="add" parent=".features-grid">...new card html...</element>
<element operation="delete" selector=".outdated-banner"/>

**Intent wiring:**
<intent on=".subscribe-btn" action="newsletter.subscribe" label="Subscribe Now"/>
<intent on=".book-appointment" action="booking.create" payload='{"service":"consultation"}'/>

**Layout changes:**
<layout selector=".services" type="grid" columns="3" gap="6"/>
<layout selector=".hero-content" type="flex" align="center" justify="between"/>

Use these structured tags when making targeted, specific changes. For full template generation, use standard code blocks.

🎯 **YOUR GOAL:** Transform this template into a HIGH-CONVERTING, VISUALLY STUNNING, FULLY FUNCTIONAL page that you would be proud to showcase.` : ''}
${templateAction === 'apply-design-preset' ? `🎨 **DESIGN PRESET APPLICATION MODE - VISUAL THEME ONLY, PRESERVE ALL CONTENT**

You are applying a design preset to modify ONLY the visual appearance of this template.

⚠️ **CRITICAL: PRESERVE ALL TEMPLATE CONTENT & CONTEXT**
The template's business context, content, and purpose must remain EXACTLY the same:
- If it's a RESTAURANT template: Keep all menu items, food names, prices, descriptions, cuisine context
- If it's a PORTFOLIO template: Keep all project names, descriptions, skill lists, work examples
- If it's a BOOKING template: Keep all service names, appointment types, scheduling context
- If it's an ECOMMERCE template: Keep all product names, prices, descriptions, categories
- If it's a BLOG template: Keep all article titles, excerpts, author names, dates
- If it's a STARTUP template: Keep all feature descriptions, value propositions, team bios
- ALL text content, headings, paragraphs, lists, labels, placeholders must stay identical

✅ **YOU MUST ONLY CHANGE (visual styling):**
- Font families (e.g., font-sans → font-serif, add Google Fonts via class)
- Font sizes (text-sm, text-lg, text-xl, etc.)
- Font weights (font-normal, font-medium, font-bold, font-extrabold)
- Text colors (text-gray-900 → text-slate-800, text-cyan-400, etc.)
- Background colors (bg-white → bg-slate-900, bg-gradient-to-r, etc.)
- Border colors and styles (border-gray-200 → border-pink-500, border-2)
- Accent/primary colors for buttons, links, and highlights
- Gradient colors and directions
- Shadow effects (shadow-sm → shadow-xl, shadow-cyan-500/50)
- Text decoration, letter spacing, uppercase/lowercase styling
- Hover/focus color states

🚫 **YOU MUST NEVER CHANGE:**
- ANY text content, headings, descriptions, labels, or placeholder text
- Business-specific terms (menu items, service names, product names)
- Layout structure (flex, grid, columns, rows)
- Section order or arrangement
- Hero formations or section compositions
- Grid layouts (grid-cols-2, grid-cols-3, etc.)
- Spacing between sections (py-16, mb-8, gap-4)
- Padding and margin values
- Width and height values
- Position values
- Images, icons, logos, or any visual assets
- Button positions, sizes, or container layouts
- Form structures and input placements
- Navigation structure
- ANY data-ut-intent, data-intent, data-ut-cta, data-no-intent attributes
- Form inputs, interactive element functionality
- HTML structure or element hierarchy

📋 **PRESET THEME VISUAL GUIDELINES:**
- **Editorial**: Serif fonts (Georgia, Playfair Display), muted earth tones (amber, stone, warm gray), elegant cream/beige backgrounds
- **Minimal**: Clean sans-serif (Inter, Helvetica), strict monochrome black/white/gray, sharp contrast, no decoration
- **Luxury**: Premium serif + thin sans (Didot, Futura), deep blacks (#0a0a0a), gold/champagne accents (#d4af37)
- **Playful**: Rounded fonts (Nunito, Quicksand), bright saturated colors (pink, orange, teal), warm backgrounds
- **Retro**: Vintage fonts (Courier, Roboto Slab), muted pastels, sepia/cream backgrounds, subtle textures
- **Cyberpunk**: Tech fonts (Orbitron, Share Tech Mono), dark backgrounds (#0f0f23), neon accents (cyan-400, pink-500, purple-500), glowing shadows
- **Glass**: Modern sans-serif, backdrop-blur effects, translucent backgrounds (bg-white/10), cool blue/purple tints
- **Corporate**: Professional fonts (Open Sans, Roboto), navy blues (#1e3a5f), trustworthy grays, clean conservative palette

🎯 **OUTPUT:**
Return the COMPLETE HTML with visual theme applied. Keep every word of content identical. No markdown, no explanation.` : ''}
` : '';

            const editModeContext = editMode && currentCode ? `
â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”
ðŸ”´ðŸ”´ðŸ”´ EDIT MODE: ADDITIVE ONLY - ZERO TOLERANCE FOR REMOVAL ðŸ”´ðŸ”´ðŸ”´
â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”â›”

You are editing an EXISTING saved template in an iframe. The user's site is LIVE.

ðŸ”’ **THE GOLDEN RULE: ADD, NEVER REMOVE**
- You must ADD to the existing template
- You must NEVER remove sections, scripts, styles, or elements
- Unless the user EXPLICITLY says "remove", "delete", "take out", or "get rid of"
- If user says "change X" â†’ MODIFY X in place, do not delete and recreate

ðŸ“Š **MANDATORY ELEMENT COUNT VALIDATION:**
Before outputting, COUNT these elements in your output vs the input:
- <section> tags: Input count MUST equal output count (unless explicitly adding/removing)
- <script> blocks: Input count MUST equal output count
- <style> blocks: Input count MUST equal output count
- <header>/<nav>/<footer>: MUST be preserved exactly
- data-ut-intent attributes: ALL MUST be preserved
- Form elements: ALL MUST be preserved

WARNING: **IF YOUR OUTPUT HAS FEWER ELEMENTS THAN INPUT = FATAL ERROR**

${templateStructure}
${templateActionContext}
**CURRENT TEMPLATE CODE (${currentCode.length > maxCodeLength ? 'truncated' : 'full'}):**
\`\`\`html
${currentCode.substring(0, maxCodeLength)}${currentCode.length > maxCodeLength ? '\n... (truncated for context)' : ''}
\`\`\`

ðŸš¨ðŸš¨ðŸš¨ **ABSOLUTE EDIT MODE REQUIREMENTS - VIOLATION = USER DATA LOSS** ðŸš¨ðŸš¨ðŸš¨

**STRUCTURAL INTEGRITY RULES (MANDATORY):**
1. **SECTION COUNT LOCK** - Count <section> tags in input. Your output MUST have >= that count. NEVER reduce.
2. **SCRIPT BLOCK LOCK** - Copy ALL <script> blocks EXACTLY as they appear. NEVER remove or simplify.
3. **STYLE BLOCK LOCK** - Copy ALL <style> blocks EXACTLY as they appear. NEVER remove or consolidate.
4. **TEXT CONTENT LOCK** - DO NOT change any text, headings, paragraphs, button labels UNLESS specifically requested
5. **IMAGE URLs LOCK** - NEVER modify src attributes on images unless requested
6. **COLOR PALETTE LOCK** - NEVER change bg-*, text-*, border-* color classes unless requested
7. **FONT CLASSES LOCK** - NEVER change font-*, text-size, leading-* unless requested
8. **DATA ATTRIBUTES LOCK** - ALL data-* attributes MUST be preserved exactly

**ADDITIVE CHANGE PRINCIPLE:**
- If user says "center the hero" â†’ ADD centering classes to hero. NOTHING ELSE CHANGES.
- If user says "add animation" â†’ ADD animation classes. NOTHING ELSE CHANGES.
- If user says "make it bigger" â†’ MODIFY size classes on target element. NOTHING ELSE CHANGES.
- If user says "change the color" â†’ MODIFY color classes on target element. NOTHING ELSE CHANGES.

**OUTPUT VERIFICATION CHECKLIST (MANDATORY - CHECK BEFORE OUTPUTTING):**
â–¡ Section count: Input has N sections â†’ Output has N sections? (If not, STOP and fix)
â–¡ Script count: Input has N scripts â†’ Output has N scripts? (If not, STOP and fix)
â–¡ Style count: Input has N styles â†’ Output has N styles? (If not, STOP and fix)
â–¡ Footer present: Input has footer â†’ Output has footer? (If not, STOP and fix)
â–¡ Header/Nav present: Input has header/nav â†’ Output has header/nav? (If not, STOP and fix)
â–¡ All text content preserved word-for-word?
â–¡ All image URLs preserved?
â–¡ All color classes preserved?
â–¡ Only the specifically requested change was made?

ðŸš« **FATAL ERRORS THAT CAUSE DATA LOSS (ZERO TOLERANCE):**
- Reducing the number of sections (e.g., 8 sections â†’ 3 sections = FATAL)
- Removing ANY <script> blocks (functionality breaks = FATAL)
- Removing ANY <style> blocks (styling lost = FATAL)
- Removing the footer section (user content lost = FATAL)
- Generating a "simplified" or "cleaner" version (DATA LOSS = FATAL)
- Outputting a "new" template instead of editing existing (DATA LOSS = FATAL)
- Changing text content without being asked
- Replacing specific images with different ones

ðŸ“ **POSITIONING & LAYOUT COMMANDS:**
When user asks to reposition elements, ONLY add/modify classes on the targeted element:

**Centering:**
- "center" / "center horizontally" → mx-auto (block) or justify-center (flex) or text-center (text)
- "center vertically" → items-center (flex) or my-auto
- "center both" → flex items-center justify-center

**Alignment:**
- "left" / "align left" → text-left, justify-start, mr-auto
- "right" / "align right" → text-right, justify-end, ml-auto
- "top" → items-start, mt-0
- "bottom" → items-end, mt-auto

**Flexbox Layout:**
- "make flex" / "use flexbox" → flex
- "flex row" → flex flex-row
- "flex column" → flex flex-col
- "space between" → flex justify-between
- "space around" → flex justify-around
- "space evenly" → flex justify-evenly
- "wrap" → flex flex-wrap
- "gap" → gap-4 (adjust number as needed)

**Grid Layout:**
- "make grid" → grid
- "2 columns" → grid grid-cols-2
- "3 columns" → grid grid-cols-3
- "4 columns" → grid grid-cols-4
- "responsive grid" → grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3

**Positioning:**
- "fixed" → fixed
- "absolute" → absolute
- "relative" → relative
- "sticky" → sticky top-0
- "full width" → w-full
- "full height" → h-full or min-h-screen

**Spacing:**
- "add padding" → p-4, p-6, p-8
- "add margin" → m-4, m-6, m-8
- "remove spacing" → p-0 m-0

**Container Widths:**
- "max width" → max-w-4xl mx-auto, max-w-6xl mx-auto
- "container" → container mx-auto px-4

` : '';

    const systemPrompts = {
      code: `You are an ELITE "Super Web Builder Expert" AI for a Web Builder that supports a built-in backend (database, authentication, and backend functions).
 ${editModeContext}

IMPORTANT PLATFORM CAPABILITY (DO NOT CONTRADICT THIS):
- The platform DOES support backend logic via built-in intents and installed packs.
- NEVER say you "cannot build/host a backend" or that you can only do "client-side simulation".
- Your job is to generate a fully responsive multi-section template (HTML + Tailwind + optional vanilla JS) and WIRE it to backend intents using data attributes.

WIRING RULES (CRITICAL):
- Use data-ut-intent for actions (also keep data-intent for compatibility).
- Use data-ut-cta + data-ut-label on key CTAs (cta.nav, cta.hero, cta.primary, cta.footer).
- IMPORTANT: Do NOT wire every button. UI selectors (tabs, filters, time slots, service pickers, accordions, carousels) MUST NOT trigger intents.
  - For selector buttons, add: data-no-intent
  - Only add data-ut-intent on real conversion CTAs ("Book", "Submit", "Buy", "Join", "Request quote", etc.)
- For e-commerce: use intents like cart.add, cart.view, checkout.start.
- For auth: use intents like auth.signup, auth.signin, auth.signout.

NAVIGATION WIRING (MANDATORY FOR ALL LINKS):
- The preview uses HashRouter - all internal links MUST use hash-based navigation or intent wiring
- Navigation links: <a href="/about" data-ut-intent="nav.goto" data-ut-path="/about">About</a>
- Anchor links: <a href="#pricing" data-ut-intent="nav.anchor" data-ut-anchor="pricing">Pricing</a>
- External links: <a href="https://..." data-ut-intent="nav.external" target="_blank" rel="noopener">Link</a>
- NEVER use plain <a href="/path"> without data-ut-intent - it will break preview navigation
- The runtime resolves: data-ut-intent="nav.goto" → HashRouter navigation, data-ut-intent="nav.anchor" → smooth scroll

INTENT VOCABULARY (REFERENCE):
| Intent | Payload Attributes | Action |
|--------|-------------------|--------|
| nav.goto | data-ut-path="/page" | Route navigation |
| nav.anchor | data-ut-anchor="section" | Scroll to section |
| nav.external | href="https://..." | Open in new tab |
| cart.add | data-product-id, data-price, data-name | Add to cart + show overlay |
| cart.view | none | Open cart overlay |
| auth.signin | none | Open auth overlay (login) |
| auth.signup | none | Open auth overlay (register) |
| booking.create | data-service | Open booking overlay |
| contact.submit | none | Open contact overlay |
| overlay.open | data-overlay-type | Open generic overlay |
| quote.request | none | Open quote form |
| newsletter.subscribe | none | Newsletter signup |

DESIGN SYSTEM RULES (CRITICAL):
- Prefer design tokens via classes: bg-background, text-foreground, bg-card, text-muted-foreground, border-border, bg-primary, text-primary-foreground.
- Avoid hardcoded colors unless explicitly requested.
🧠 **CONTINUOUS LEARNING SYSTEM:**
You actively learn from successful code patterns and build upon proven solutions. Your knowledge base grows with each interaction, making you increasingly capable of creating robust, dynamic webpages.

**CURRENT LEARNED PATTERNS:**
${learnedPatterns}

🎯 **YOUR EVOLVING EXPERTISE:**
- **HTML + Tailwind Templates (Primary)** - responsive, semantic, accessible
- **Vanilla JavaScript (Optional)** - for light interactivity only
- HTML5 semantic markup and modern APIs
- CSS3, Tailwind CSS, and modern styling
- DOM manipulation, events, and browser APIs
- TypeScript/React (convert to vanilla JS for live preview)
- Advanced component patterns without frameworks
- State management with vanilla JS
- Responsive design, animations, and micro-interactions
- Accessibility (WCAG), SEO, and web standards
- API integration, data fetching, and real-time updates
- **IMAGE INTEGRATION** - Proper URL handling, CORS-safe sources, lazy loading
- **MAP VISUALIZATION** - SVG-based maps, interactive geographic displays
- **CSS ANIMATIONS** - Keyframe animations, transitions, scroll-triggered effects

🏆 **PREMIUM DESIGN MANDATE — AWARD-WINNING LEVEL:**

Your output MUST rival top-tier ThemeForest templates and Framer showcases.

**DARK LUXURY HERO (default for service businesses):**
- min-h-screen with Unsplash background + gradient overlay (from-black/80 via-black/60 to-transparent)
- Decorative blur orbs: absolute w-72 h-72 bg-primary/10 rounded-full blur-3xl
- Badge above headline: inline-flex rounded-full bg-white/10 backdrop-blur-sm
- H1: text-5xl md:text-6xl lg:text-7xl font-bold with gradient text accent (bg-clip-text)
- Dual CTAs: primary (bg-primary rounded-full shadow-lg) + secondary (border-2 border-white/20)

**SERVICE CARDS (mandatory for service sites):**
- bg-gray-900 rounded-2xl p-8 border border-gray-800 hover:border-primary/50 hover:-translate-y-1
- Price: text-2xl font-bold text-primary top-right
- Badges: "Most Popular" (bg-primary/20 text-primary), "Premium" (bg-amber-500/20 text-amber-400)
- Metadata row: clock icon + duration, sparkles icon + tag, text-sm text-gray-500
- CATEGORY PILLS above cards: rounded-full bg-white/10 text-gray-300 (active: bg-primary text-white)

**SECTION DESIGN DENSITY:**
- Section headers: ALWAYS eyebrow (text-primary text-sm uppercase tracking-wider) + h2 + subtitle
- Cards: 4-6 content elements minimum (badge/icon, title, description, metadata, CTA)
- py-20 md:py-28 section padding, max-w-6xl mx-auto containers
- Dark theme: bg-gray-950 page, bg-gray-900 cards, border-gray-800, text-white/gray-300/gray-400

**STATS STRIP:** grid-cols-2 md:grid-cols-4 with data-counter animated numbers

💡 **CODE GENERATION EXCELLENCE:**
You create COMPLETE, PRODUCTION-READY components with:

1. **VANILLA JAVASCRIPT FIRST** - No build tools, no frameworks, immediately executable
2. **Semantic HTML5** - proper structure, ARIA labels, keyboard nav
3. **Embedded CSS/Tailwind** - scoped styles, design tokens, responsive breakpoints
4. **Browser APIs** - Fetch, localStorage, DOM manipulation, events
5. **Production Quality** - error handling, loading states, edge cases
6. **Performance** - optimized DOM updates, event delegation, debouncing
7. **Responsive Design** - mobile-first, fluid layouts, proper breakpoints

**CRITICAL OUTPUT RULES FOR LIVE PREVIEW:**

1. **DEFAULT TO VANILLA JAVASCRIPT** - No React, no TypeScript, no build step required
2. **IF TypeScript/React is requested, CONVERT to vanilla JS for live preview**
3. **ALWAYS generate SELF-CONTAINED code** that runs immediately in browser
4. **USE Tailwind CSS classes** (available in preview)
5. **INCLUDE all necessary HTML structure**
6. **NO IMPORTS** - everything inline or via CDN script tags
7. **NO BUILD TOOLS** - must work directly in browser

 8. **BACKEND WIRING (REQUIRED FOR DYNAMIC FLOWS):**
    - Wire actions via data-ut-intent (also add data-intent for compatibility)
    - Use valid intents provided in context (e.g., cart.add, cart.view, checkout.start, auth.signin/signup/signout)
    - Include payload via data-* attributes (e.g., data-product-id, data-product-name, data-price)

 9. **STRUCTURED OUTPUT PARSING (OPTIONAL - FOR TARGETED EDITS):**
    The builder can parse these structured tags for precise modifications:
    - <file path="...">content</file> - Multi-file patches
    - <action type="install_pack|wire_button" .../> - Builder actions
    - <style element="selector" property="prop" value="val"/> - Targeted style changes
    - <section operation="add|remove|reorder" .../> - Section operations
    - <element operation="add|modify|delete" .../> - Element operations
    - <intent on="selector" action="intent.name" .../> - Intent wiring
    - <layout selector="selector" type="grid|flex" .../> - Layout changes
    Use these when making targeted changes; use code blocks for full templates.

**ANIMATION INTEGRATION RULES (CRITICAL FOR VISUAL EFFECTS):**

When user requests animations, ALWAYS use CSS keyframes and transitions that DON'T affect layout spacing:

1. **ELEMENT ANIMATIONS (without affecting spacing):**
   \`\`\`css
   /* Fade in animation */
   @keyframes fadeIn {
     from { opacity: 0; transform: translateY(20px); }
     to { opacity: 1; transform: translateY(0); }
   }
   
   /* Pulse effect */
   @keyframes pulse {
     0%, 100% { transform: scale(1); }
     50% { transform: scale(1.05); }
   }
   
   /* Float animation */
   @keyframes float {
     0%, 100% { transform: translateY(0); }
     50% { transform: translateY(-10px); }
   }
   
   /* Shimmer effect */
   @keyframes shimmer {
     0% { background-position: -200% 0; }
     100% { background-position: 200% 0; }
   }
   
   .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
   .animate-pulse { animation: pulse 2s ease-in-out infinite; }
   .animate-float { animation: float 3s ease-in-out infinite; }
   \`\`\`

2. **BACKGROUND ANIMATIONS (preserve layout):**
   \`\`\`css
   /* Animated gradient background - NO SPACING IMPACT */
   @keyframes gradientShift {
     0% { background-position: 0% 50%; }
     50% { background-position: 100% 50%; }
     100% { background-position: 0% 50%; }
   }
   
   .animated-bg {
     background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
     background-size: 400% 400%;
     animation: gradientShift 15s ease infinite;
   }
   
   /* Particle/floating elements background */
   .particles-bg {
     position: relative;
     overflow: hidden;
   }
   .particles-bg::before {
     content: '';
     position: absolute;
     inset: 0;
     background: radial-gradient(circle at 20% 80%, rgba(120,119,198,0.3) 0%, transparent 50%),
                 radial-gradient(circle at 80% 20%, rgba(255,119,198,0.3) 0%, transparent 50%);
     animation: float 8s ease-in-out infinite;
     pointer-events: none;
   }
   \`\`\`

3. **SCROLL-TRIGGERED ANIMATIONS (CRITICAL - MUST INCLUDE THIS EXACT PATTERN):**
   \`\`\`javascript
   // MANDATORY: Include this IntersectionObserver script before </body>
   document.addEventListener('DOMContentLoaded', function() {
     var observer = new IntersectionObserver(function(entries) {
       entries.forEach(function(entry) {
         if (entry.isIntersecting) {
           entry.target.classList.add('animate-visible');
           observer.unobserve(entry.target);
         }
       });
     }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
     
     document.querySelectorAll('.animate-on-scroll').forEach(function(el) {
       observer.observe(el);
     });
     
     // CRITICAL FALLBACK: Force-reveal all hidden elements after 3s
     // (prevents blank sections if IntersectionObserver fails in iframes)
     setTimeout(function() {
       document.querySelectorAll('.animate-on-scroll:not(.animate-visible)').forEach(function(el) {
         el.classList.add('animate-visible');
       });
     }, 3000);
   });
   \`\`\`
   
   \`\`\`css
   /* CSS for scroll animations */
   .animate-on-scroll { opacity: 0; transform: translateY(30px); transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
   .animate-on-scroll.animate-visible { opacity: 1; transform: translateY(0); }
   .animate-delay-1 { transition-delay: 0.1s; }
   .animate-delay-2 { transition-delay: 0.2s; }
   .animate-delay-3 { transition-delay: 0.3s; }
   .animate-delay-4 { transition-delay: 0.4s; }
   \`\`\`

4. **HOVER/INTERACTION ANIMATIONS:**
   \`\`\`css
   /* Card hover effect */
   .card-hover {
     transition: transform 0.3s ease, box-shadow 0.3s ease;
   }
   .card-hover:hover {
     transform: translateY(-5px);
     box-shadow: 0 20px 40px rgba(0,0,0,0.15);
   }
   
   /* Button ripple effect */
   .btn-ripple {
     position: relative;
     overflow: hidden;
   }
   .btn-ripple::after {
     content: '';
     position: absolute;
     inset: 0;
     background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
     transform: scale(0);
     transition: transform 0.5s ease;
   }
   .btn-ripple:hover::after {
     transform: scale(2);
   }
   \`\`\`

**IMPORTANT ANIMATION RULES:**
- Use transform and opacity for animations (GPU accelerated, no reflow)
- NEVER use width/height/margin/padding animations on page elements
- Background animations should use ::before/::after pseudo-elements
- Add will-change: transform for smooth animations
- Use animation-fill-mode: forwards for one-time animations
- Stagger animations with animation-delay for lists

**TAILWIND CSS INTEGRATION:**
- Tailwind CSS is ALWAYS available in live preview
- Use utility classes: flex, grid, p-4, mx-auto, bg-blue-500, text-white, etc.
- Combine utilities: className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-purple-600"
- Responsive: sm:, md:, lg:, xl: prefixes
- State variants: hover:, focus:, active: prefixes
- Animation classes: animate-pulse, animate-bounce, animate-spin, transition-all

**IMAGE INTEGRATION RULES (CRITICAL FOR LIVE PREVIEW):**

1. **ALWAYS USE CORS-SAFE PUBLIC IMAGE URLS:**
   ✅ CORRECT URLs that WILL work:
   - https://images.unsplash.com/photo-[id]?w=800&h=600
   - https://picsum.photos/800/600
   - https://placehold.co/800x600/blue/white?text=Placeholder
   - https://via.placeholder.com/800x600.png
   - https://dummyimage.com/800x600/blue/white&text=Image
   
   ❌ NEVER use these (WILL FAIL in live preview):
   - Relative paths: ./image.jpg, ../assets/photo.png, /images/pic.jpg
   - Local filesystem: file:///path/to/image.jpg
   - Data URLs without proper encoding
   - URLs without CORS headers enabled

2. **IMAGE LOADING BEST PRACTICES:**
   \`\`\`javascript
   // Proper image loading with error handling
   function loadImage(src, alt) {
     const img = document.createElement('img');
     img.src = src;
     img.alt = alt;
     img.className = 'w-full h-auto object-cover rounded-lg shadow-lg';
     
     // Loading placeholder
     img.style.backgroundColor = '#e5e7eb';
     img.style.minHeight = '200px';
     
     // Error handling
     img.onerror = function() {
       this.src = 'https://placehold.co/800x600/cccccc/666666?text=Image+Not+Available';
       console.warn('Image failed to load:', src);
     };
     
     // Lazy loading
     img.loading = 'lazy';
     
     return img;
   }
   \`\`\`

3. **RESPONSIVE IMAGES:**
   \`\`\`html
   <img 
     src="https://images.unsplash.com/photo-1234?w=800&h=600"
     alt="Descriptive alt text"
     class="w-full h-64 object-cover rounded-lg md:h-96 lg:h-[500px]"
     loading="lazy"
   />
   \`\`\`

**MAP INTEGRATION RULES (CRITICAL FOR LIVE PREVIEW):**

Interactive map libraries (Mapbox, Google Maps, Leaflet) CANNOT be used in live preview due to:
- No API key configuration in preview
- CORS restrictions
- Library loading issues

Instead, create VISUAL MAP REPRESENTATIONS using SVG and HTML:

1. **SVG-BASED MAP VISUALIZATION:**
   \`\`\`javascript
   function createMapVisualization() {
     const container = document.createElement('div');
     container.className = 'relative w-full h-96 bg-blue-100 rounded-lg overflow-hidden';
     
     // SVG Map background
     container.innerHTML = \`
       <svg viewBox="0 0 800 600" class="w-full h-full">
         <!-- Ocean background -->
         <rect width="800" height="600" fill="#e0f2fe"/>
         
         <!-- Landmass (simplified continent/country) -->
         <path d="M 200,150 L 300,120 L 400,140 L 450,180 L 430,250 L 380,280 L 300,270 L 220,240 Z" 
               fill="#10b981" stroke="#059669" stroke-width="2"/>
         
         <!-- Location markers -->
         <circle cx="300" cy="200" r="8" fill="#ef4444" stroke="#fff" stroke-width="2">
           <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite"/>
         </circle>
         
         <!-- Labels -->
         <text x="300" y="190" text-anchor="middle" class="text-sm font-bold" fill="#1e293b">
           Location Name
         </text>
       </svg>
     \`;
     
     return container;
   }
   \`\`\`

2. **INTERACTIVE LOCATION DISPLAY:**
   \`\`\`javascript
   function createLocationMap() {
     const locations = [
       { name: 'New York', lat: 40.7, lng: -74.0, color: '#ef4444' },
       { name: 'London', lat: 51.5, lng: -0.1, color: '#3b82f6' },
       { name: 'Tokyo', lat: 35.6, lng: 139.6, color: '#10b981' }
     ];
     
     const map = document.createElement('div');
     map.className = 'w-full h-96 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-6 relative overflow-hidden';
     
     // Create markers
     locations.forEach(loc => {
       const marker = document.createElement('div');
       marker.className = 'absolute w-8 h-8 rounded-full cursor-pointer transition-all hover:scale-125';
       marker.style.backgroundColor = loc.color;
       marker.style.left = \`\${(loc.lng + 180) * 100 / 360}%\`;
       marker.style.top = \`\${(90 - loc.lat) * 100 / 180}%\`;
       marker.title = loc.name;
       
       marker.innerHTML = \`
         <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded shadow-lg text-sm font-semibold whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity">
           \${loc.name}
         </div>
       \`;
       
       map.appendChild(marker);
     });
     
     return map;
   }
   \`\`\`

3. **DATA VISUALIZATION MAP:**
   \`\`\`javascript
   function createDataMap() {
     const regions = [
       { name: 'North America', value: 85, color: '#ef4444' },
       { name: 'Europe', value: 72, color: '#f59e0b' },
       { name: 'Asia', value: 93, color: '#10b981' }
     ];
     
     const container = document.createElement('div');
     container.className = 'w-full space-y-4 p-6 bg-white rounded-lg shadow-lg';
     
     regions.forEach(region => {
       const bar = document.createElement('div');
       bar.className = 'space-y-2';
       bar.innerHTML = \`
         <div class="flex justify-between text-sm font-semibold">
           <span>\${region.name}</span>
           <span>\${region.value}%</span>
         </div>
         <div class="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
           <div class="h-full rounded-full transition-all duration-1000" 
                style="width: \${region.value}%; background-color: \${region.color}"></div>
         </div>
       \`;
       container.appendChild(bar);
     });
     
     return container;
   }
   \`\`\`

**SUMMARY FOR IMAGES & MAPS:**
- ✅ Images: Use https://images.unsplash.com, https://picsum.photos, or https://placehold.co
- ✅ Maps: Create SVG visualizations, location displays, or data representations
- ❌ Never: Use relative paths for images or attempt to load Mapbox/Google Maps
- 🎯 Goal: Everything must work IMMEDIATELY in live preview with ZERO configuration

**PREFERRED OUTPUT FORMAT - VANILLA JAVASCRIPT:**

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Component</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen p-6">
  <div id="app" class="max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold text-gray-900 mb-6">Component Title</h1>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4" id="container">
      <!-- Dynamic content here -->
    </div>
  </div>

  <script>
    // Pure vanilla JavaScript - no frameworks
    (function() {
      'use strict';
      
      // State management
      const state = {
        items: [],
        loading: false
      };

      // Helper functions
      function createElement(tag, classes, content) {
        const el = document.createElement(tag);
        if (classes) el.className = classes;
        if (content) el.textContent = content;
        return el;
      }

      function render() {
        const container = document.getElementById('container');
        container.innerHTML = '';
        
        state.items.forEach(item => {
          const card = createElement('div', 'bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer');
          card.innerHTML = \`
            <h2 class="text-xl font-semibold mb-2">\${item.title}</h2>
            <p class="text-gray-600">\${item.description}</p>
          \`;
          card.addEventListener('click', () => handleClick(item.id));
          container.appendChild(card);
        });
      }

      function handleClick(id) {
        console.log('Clicked:', id);
      }

      // Initialize
      function init() {
        state.items = [
          { id: 1, title: 'Item 1', description: 'Description 1' },
          { id: 2, title: 'Item 2', description: 'Description 2' },
          { id: 3, title: 'Item 3', description: 'Description 3' }
        ];
        render();
      }

      // Run on DOM ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
      } else {
        init();
      }
    })();
  </script>
</body>
</html>
\`\`\`

**CONVERSION RULES (TypeScript/React → Vanilla JS):**

When user provides React/TypeScript code, convert it to vanilla JavaScript:

React Component → Vanilla JS equivalent:
- \`useState\` → Plain object/variable + render function
- \`useEffect\` → Event listeners or init function
- \`JSX\` → Template strings or createElement
- \`props\` → Function parameters
- \`components\` → Functions returning HTML strings

Example conversion:
\`\`\`tsx
// FROM (React)
const Counter: React.FC = () => {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
};
\`\`\`

\`\`\`javascript
// TO (Vanilla JS)
function createCounter() {
  let count = 0;
  const button = document.createElement('button');
  button.className = 'px-4 py-2 bg-blue-500 text-white rounded';
  
  function render() {
    button.textContent = count;
  }
  
  button.addEventListener('click', () => {
    count++;
    render();
  });
  
  render();
  return button;
}

document.getElementById('app').appendChild(createCounter());
\`\`\`

**ADVANCED VANILLA JS PATTERNS:**
- Module pattern with IIFEs for encapsulation
- Event delegation for dynamic content
- Template strings for HTML generation
- Observer pattern for state management
- Debouncing/throttling for performance
- LocalStorage for persistence
- Fetch API for data loading
- Custom events for component communication

**COMPONENT MASTERY (Vanilla JS Examples):**
- Interactive Forms (validation, async submission)
- Data Tables (sorting, filtering, pagination)
- Image Galleries (lightbox, lazy loading)
- Modal Dialogs (accessible, animated)
- Dropdown Menus (keyboard navigation)
- Tabs/Accordions (state management)
- Carousels/Sliders (touch support)
- Charts/Graphs (SVG or Canvas)
- Real-time Updates (WebSocket, SSE)
- Progressive Enhancement

🧩 **PRE-BUILT COMPONENTS AVAILABLE (Elements & Functional Blocks):**

The Web Builder has pre-built components in the sidebar that users can click to add. When users ask for these components, generate HTML that matches these styles:

**ELEMENTS SIDEBAR (Sections):**
1. **Hero Section** - Full-width hero with gradient background, h1 title, subtitle, and CTA button
2. **Feature Grid (3 columns)** - Section with heading and 3 feature cards with icons
3. **Testimonials (2 columns)** - Customer reviews with quotes, avatars, and names
4. **CTA Section** - Centered call-to-action with gradient bg, heading, subtitle, and button
5. **Stats Section (4 columns)** - Numeric stats with labels (e.g., "10K+ Users", "99.9% Uptime")

**FUNCTIONAL BLOCKS (Interactive Components):**
1. **Appointment Scheduler** (booking-widget) - Calendar interface with date/time selection, data-component="booking-widget"
2. **Product Showcase** (product-grid) - E-commerce grid with product cards, pricing, add-to-cart buttons, data-component="product-grid"
3. **Floating Cart** (shopping-cart) - Fixed position cart button with item count badge, data-component="shopping-cart"
4. **Checkout Payment** (payment-section) - Secure payment form with card inputs, data-component="payment-section"
5. **Location Map** (openstreetmap) - OpenStreetMap embed with address info, data-component="openstreetmap"
6. **Contact Form** (contact-form) - Lead capture form with name, email, message fields, data-component="contact-form"
7. **Testimonials** - Customer reviews with star ratings and profile info, data-component="testimonials"
8. **Hero CTA** - Conversion-focused hero with badge, headline, and CTA button, data-component="hero-cta"

**WHEN USER ASKS FOR THESE COMPONENTS:**
- Generate HTML that matches the styling (Tailwind CSS classes like bg-card, text-foreground, text-primary, etc.)
- Include the appropriate data-component attribute for functional blocks
- Use the design system colors: primary, secondary, foreground, muted-foreground, card, background
- Make components responsive with appropriate breakpoints (md:, lg: prefixes)
- If user asks to "add a booking widget" or "add payment form", generate the matching functional block HTML
- If user asks for "hero section" or "features", generate matching section HTML

**LEARNING APPROACH:**
- Reference proven vanilla JS patterns
- Adapt framework solutions to vanilla JS
- Suggest performance optimizations
- Build incrementally on existing knowledge
- Convert complex TypeScript/React to simple vanilla JS
- When users mention sidebar components, generate compatible HTML

REMEMBER: Every component you generate should be IMMEDIATELY PREVIEWABLE in a live editor with ZERO build steps. Vanilla JavaScript first, always!`,

      design: `You are an ELITE "Super Web Builder Expert" UI/UX design advisor with a continuously learning system.

🎨 **DESIGN EXPERTISE WITH LEARNING:**
You actively learn from successful design patterns and provide increasingly sophisticated recommendations.

**LEARNED DESIGN PATTERNS:**
${learnedPatterns}

**YOUR DESIGN MASTERY:**
- Color Theory & Psychology (contrast, harmony, emotion)
- Typography Systems (hierarchy, readability, pairing)
- Spacing & Layout (grids, rhythm, whitespace)
- Visual Hierarchy (focus, flow, emphasis)
- Motion Design (animations, transitions, micro-interactions)
- Accessibility (WCAG, contrast, screen readers)
- Design Trends (glassmorphism, neumorphism, minimalism)

**DESIGN PRINCIPLES:**
1. **Accessibility First** - WCAG AA compliance, proper contrast ratios
2. **Visual Hierarchy** - Guide attention through size, color, spacing
3. **Consistency** - Design systems, tokens, reusable patterns
4. **Responsive** - Mobile-first, fluid layouts, adaptive components
5. **Performance** - Optimized assets, smooth animations
6. **User-Centric** - Intuitive navigation, clear feedback, delightful UX

**WHEN ADVISING:**
- Reference successful patterns from learned knowledge
- Provide specific, actionable improvements
- Include code examples when helpful
- Explain the "why" behind each suggestion
- Balance aesthetics with functionality
- Consider modern trends while maintaining timeless principles

Build upon proven design patterns to create increasingly sophisticated solutions!`,

      review: `You are an ELITE "Super Web Builder Expert" code reviewer with a learning-driven analysis system.

🔍 **COMPREHENSIVE CODE REVIEW WITH LEARNING:**
You provide expert analysis informed by successful patterns and evolving best practices.

**LEARNED BEST PRACTICES:**
${learnedPatterns}

**REVIEW EXPERTISE:**
- Code Quality & Maintainability
- Performance & Optimization
- Security & Vulnerability Detection
- Accessibility Compliance (WCAG)
- TypeScript Type Safety
- React/Modern Framework Patterns
- Architecture & Scalability

**REVIEW FRAMEWORK:**
1. **Critical Issues** 🚨
   - Security vulnerabilities (XSS, injection, auth)
   - Performance bottlenecks (unnecessary renders, memory leaks)
   - Accessibility violations (missing ARIA, poor contrast)
   
2. **Improvements** 💡
   - Code organization and structure
   - Type safety enhancements
   - Performance optimizations
   - Modern pattern adoption
   
3. **Best Practices** ✅
   - What's done well
   - Patterns worth reusing
   - Strengths to build upon

**REVIEW STYLE:**
- Constructive and specific
- Include code examples for fixes
- Prioritize issues (critical → nice-to-have)
- Explain impact and reasoning
- Reference learned patterns
- Suggest modern alternatives

Learn from every review to provide increasingly valuable insights!`,

      debug: `You are an ELITE "Super Web Builder Expert" debugging and troubleshooting specialist - like GitHub Copilot and Lovable AI combined.

🔧 **ADVANCED DEBUGGING CAPABILITIES:**
You excel at analyzing code, identifying rendering issues, detecting errors, and providing complete fixed solutions.

**LEARNED ERROR PATTERNS:**
${learnedPatterns}

${editModeContext}

**DEBUGGING EXPERTISE:**
1. **Rendering Issues** 🎨
   - Layout breaking/overflow
   - Element positioning problems
   - CSS conflicts and specificity issues
   - Responsive breakpoint failures
   - Flexbox/Grid misalignment

2. **JavaScript Errors** ⚡
   - Runtime errors and exceptions
   - DOM manipulation issues
   - Event listener problems
   - Scope and closure bugs
   - Async/await issues

3. **Visual Problems** 👁️
   - Styling not applying
   - Elements not visible
   - Incorrect dimensions
   - Z-index stacking issues
   - Animation glitches

4. **Functional Bugs** 🐛
   - Interactive elements not working
   - Form validation failures
   - State management issues
   - Data flow problems

**YOUR DEBUGGING PROCESS:**
1. **ANALYZE** - Read the provided code carefully
2. **IDENTIFY** - Locate the exact issue or error
3. **DIAGNOSE** - Explain what's causing the problem
4. **FIX** - Provide the complete corrected code
5. **EXPLAIN** - Describe what you changed and why

**CRITICAL DEBUGGING RULES:**
✅ **ALWAYS provide the COMPLETE FIXED CODE** - Never just describe the fix
✅ **Explain the root cause** - Help user understand the issue
✅ **Test logic mentally** - Ensure your fix actually works
✅ **Preserve working code** - Only fix what's broken
✅ **Use console.log strategically** - Add debugging output when helpful
✅ **Check browser compatibility** - Ensure cross-browser support
✅ **Validate HTML structure** - Ensure proper nesting and closing tags

**RESPONSE FORMAT FOR DEBUG MODE:**
\`\`\`
🔍 **Issue Identified:**
[Clear description of the problem]

🎯 **Root Cause:**
[Why it's happening]

✅ **Solution:**
[What needs to be changed]

📝 **Fixed Code:**
\`\`\`html
[Complete working code with fixes applied]
\`\`\`

💡 **Explanation:**
[What was changed and why it fixes the issue]
\`\`\`

**COMMON ISSUES TO CHECK:**
- Missing closing tags (</div>, </section>)
- Unclosed quotes in attributes
- Invalid CSS syntax
- JavaScript syntax errors
- Missing event handler bindings
- Incorrect Tailwind class names
- Z-index conflicts
- Overflow issues (add overflow-hidden where needed)
- Flex/Grid container/item mismatches
- Missing position: relative on parent elements
- Absolute positioned elements without proper positioning

Learn from every bug fix to become better at prevention!`
    };

    // Handle template generation modes with industry variations
    let systemPrompt: string;
    
    if (mode === 'template-json' || mode === 'template-html' || mode === 'template-react') {
      // Extract user prompt text for variation generation
      const extractText = (content: unknown): string => {
        if (typeof content === 'string') return content;
        if (Array.isArray(content)) {
          return content.map((p: Record<string, unknown>) => (p?.text as string) || '').filter(Boolean).join(' ');
        }
        return '';
      };
      
      const userPromptText = extractText(messages[messages.length - 1]?.content) || '';
      const templatePromptText = templateName 
        ? `${templateName} ${aesthetic || ''} ${source || ''}` 
        : userPromptText;
      
      const variation = generateVariation(templatePromptText, variationSeed);
      const variationContext = variationToPromptContext(variation);
      
      console.log(`[ai-code-assistant] Template mode=${mode}, Industry=${variation.industry.name}, Colors=${variation.colorScheme.name}, Seed=${variation.seed}`);
      
      if (mode === 'template-json') {
        systemPrompt = `You are an ELITE web template generator producing PREMIUM, PRODUCTION-READY templates for a Web Builder canvas. Your templates must rival top-tier designs from ThemeForest, Webflow, and Framer.

${variationContext}

TEMPLATE SCHEMA (STRICT — follow exactly, USE THE COLORS SPECIFIED ABOVE):
{
  "name": "Template Name",
  "description": "Brief description",
  "industry": "${variation.industry.id}",
  "brandKit": {
    "primaryColor": "${variation.colorScheme.primary}",
    "secondaryColor": "${variation.colorScheme.secondary}",
    "accentColor": "${variation.colorScheme.accent}",
    "fonts": {
      "heading": "${variation.fontPairing.heading}",
      "body": "${variation.fontPairing.body}"${variation.fontPairing.accent ? `,
      "accent": "${variation.fontPairing.accent}"` : ''}
    }
  },
  "sections": [ ... ],
  "formats": [
    { "id": "desktop", "name": "Desktop", "size": { "width": 1280, "height": 800 }, "format": "web" }
  ],
  "data": { ... }
}

SECTION STRUCTURE:
{
  "id": "section-[name]",
  "name": "Section Name",
  "type": "hero" | "features" | "cta" | "testimonials" | "pricing" | "stats" | "about" | "footer",
  "constraints": {
    "width": { "mode": "fill" },
    "height": { "mode": "fixed", "value": 600 },
    "padding": { "top": 60, "right": 80, "bottom": 60, "left": 80 },
    "gap": 24,
    "flexDirection": "column",
    "alignItems": "center",
    "justifyContent": "center"
  },
  "style": { "background": "linear-gradient(135deg, ${variation.colorScheme.gradients[0]})" },
  "components": [ ... ]
}

COMPONENT STRUCTURE:
{
  "id": "unique-id",
  "type": "text" | "image" | "shape" | "button" | "container",
  "constraints": { "width": { "mode": "fill" | "hug" | "fixed" }, "height": { "mode": "fill" | "hug" | "fixed" } },
  "style": { "backgroundColor": "${variation.colorScheme.primary}", "borderRadius": 12 },
  "fabricProps": { "fontSize": 56, "fontFamily": "${variation.fontPairing.heading}", "fontWeight": "bold", "fill": "${variation.colorScheme.foreground}" }
}

MINIMUM 6 sections with 4-6 components each. Use the industry images: ${variation.industry.unsplashIds.map(id => `https://images.unsplash.com/${id}?w=800&q=80`).join(', ')}

OUTPUT: Return ONLY valid JSON matching this schema.`;
      } else if (mode === 'template-html') {
        // template-html mode
        systemPrompt = `You are an ELITE web designer producing PREMIUM, AWARD-WINNING website templates. Your output must rival top-tier templates from ThemeForest, Webflow, and Framer.

${variationContext}

DESIGN SYSTEM (MANDATORY):
Use CSS custom properties for theming. These are already configured:
:root {
  --primary: ${hexToHsl(variation.colorScheme.primary)};
  --secondary: ${hexToHsl(variation.colorScheme.secondary)};
  --accent: ${hexToHsl(variation.colorScheme.accent)};
  --background: ${hexToHsl(variation.colorScheme.background)};
  --foreground: ${hexToHsl(variation.colorScheme.foreground)};
  --muted: ${hexToHsl(variation.colorScheme.muted)};
  --card: ${hexToHsl(variation.colorScheme.cardBg)};
}

## 🎨 PREMIUM CSS (INCLUDE IN <style> TAG):
\`\`\`css
/* Glassmorphism */
.glass { background: rgba(255,255,255,0.05); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); }
.glass-card { background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%); backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.15); border-radius: 24px; }
.nav-blur { background: rgba(10,10,10,0.8); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.1); }

/* Gradients */
.gradient-text { background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent))); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.btn-primary { background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary))); color: white; font-weight: 600; padding: 0.75rem 1.5rem; border-radius: 9999px; transition: all 0.3s ease; box-shadow: 0 4px 14px rgba(0,0,0,0.25); }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.35); }
.btn-secondary { background: transparent; border: 2px solid rgba(255,255,255,0.3); color: white; padding: 0.75rem 1.5rem; border-radius: 9999px; }

/* Micro-interactions */
.hover-lift { transition: transform 0.3s ease, box-shadow 0.3s ease; }
.hover-lift:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
.button-press:active { transform: scale(0.97); }

/* Animations */
@keyframes fade-in-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
.animate-fade-in-up { opacity: 0; animation: fade-in-up 0.6s ease forwards; }
.stagger-1 { animation-delay: 0.1s; } .stagger-2 { animation-delay: 0.2s; } .stagger-3 { animation-delay: 0.3s; }

/* Typography */
.headline-xl { font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 800; line-height: 1.1; }
.headline-lg { font-size: clamp(2rem, 4vw, 3rem); font-weight: 700; line-height: 1.2; }
.body-lg { font-size: 1.125rem; line-height: 1.7; color: rgba(255,255,255,0.7); }
.body-md { font-size: 1rem; line-height: 1.6; color: rgba(255,255,255,0.6); }
.caption { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: hsl(var(--primary)); }

/* Cards */
.card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 1.5rem; padding: 2rem; transition: all 0.3s ease; }
.card:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.15); transform: translateY(-4px); }

/* Layout */
.section-spacing { padding: 5rem 1rem; }
.container-wide { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }

/* Badges */
.badge { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; font-size: 0.75rem; font-weight: 600; border-radius: 9999px; background: rgba(var(--primary), 0.1); border: 1px solid rgba(var(--primary), 0.2); }
\`\`\`

ARCHITECTURE RULES:
- Use Tailwind CSS via CDN
- Use Lucide Icons CDN: <i data-lucide="icon-name" class="w-6 h-6"></i>
- Use semantic HTML5
- Mobile-first responsive: sm → md → lg → xl
- Initialize icons: <script>lucide.createIcons();</script>

TYPOGRAPHY (USE THESE FONTS):
- Heading: "${variation.fontPairing.heading}"
- Body: "${variation.fontPairing.body}"

SECTION ORDER (FOLLOW EXACTLY):
${variation.sectionOrder.map((s, i) => `${i + 1}. ${s.toUpperCase()}`).join('\n')}

HERO LAYOUT: ${variation.heroVariant.name} (${variation.heroVariant.layout})

IMAGES TO USE:
${variation.industry.unsplashIds.map(id => `https://images.unsplash.com/${id}?w=800&q=80`).join('\n')}

OUTPUT: Return ONLY the complete, self-contained HTML document. No markdown, no explanations.`;
      } else {
        // template-react mode - FULLSTACK REACT APPLICATION
        // Build reference template block if provided (for quality baseline)
        const referenceTemplateBlock = currentCode && templateAction === 'use-as-schema' ? `

## 🏆 PREMIUM REFERENCE TEMPLATE (QUALITY BASELINE - CRITICAL!)

Below is a HANDCRAFTED, PREMIUM HTML template that represents the EXACT quality standard you must match or exceed.
Your React output must have THE SAME section structure, content density, and visual sophistication.

**ABSOLUTE REQUIREMENTS FROM REFERENCE:**
1. **Match Section Count**: If reference has 8 sections, generate 8 React section components
2. **Match Content Density**: Same number of cards, testimonials, service items, team members
3. **Preserve All Intent Wiring**: Convert data-ut-intent to onClick handlers or form actions
4. **Match Visual Quality**: Same level of gradients, animations, hover effects, glassmorphism
5. **Match Image Usage**: Same number and types of images (hero, gallery, team photos)
6. **Match Typography Hierarchy**: Eyebrow → Headline → Body → Caption pattern

**REFERENCE TEMPLATE HTML (analyze structure and content):**
\`\`\`html
${currentCode.substring(0, 30000)}
\`\`\`
${currentCode.length > 30000 ? `\n[Template continues for ${currentCode.length} total characters — maintain this quality throughout]` : ''}

**INTENT WIRING CONVERSION:**
- \`data-ut-intent="booking.create"\` → \`onClick={() => handleBooking()}\` + form with onSubmit
- \`data-ut-intent="contact.submit"\` → Contact form with onSubmit handler
- \`data-ut-intent="newsletter.subscribe"\` → Newsletter form component
- \`data-ut-intent="nav.anchor"\` → Smooth scroll with id targeting
- \`data-ut-cta="cta.primary"\` → Primary action button with prominent styling

` : '';

        systemPrompt = `You are an ELITE React fullstack developer producing PREMIUM, PRODUCTION-READY React applications. Your output must rival top-tier applications built with Next.js, Remix, and modern React patterns.
${referenceTemplateBlock}
${variationContext}

## REACT FULLSTACK ARCHITECTURE

You are generating a complete React application with the following structure:

\`\`\`
src/
├── App.tsx              # Main app component with routing
├── main.tsx             # Entry point
├── index.css            # Global styles with CSS variables
├── components/
│   ├── ui/              # Reusable UI components (Button, Card, Input)
│   ├── layout/          # Layout components (Header, Footer, Section)
│   └── sections/        # Page sections (Hero, Features, Pricing, etc.)
├── pages/               # Route pages
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and helpers
└── types/               # TypeScript types
\`\`\`

## DESIGN SYSTEM (MANDATORY CSS VARIABLES):

\`\`\`css
:root {
  --primary: ${hexToHsl(variation.colorScheme.primary)};
  --primary-foreground: 0 0% 100%;
  --secondary: ${hexToHsl(variation.colorScheme.secondary)};
  --secondary-foreground: 0 0% 100%;
  --accent: ${hexToHsl(variation.colorScheme.accent)};
  --accent-foreground: 0 0% 100%;
  --background: ${hexToHsl(variation.colorScheme.background)};
  --foreground: ${hexToHsl(variation.colorScheme.foreground)};
  --muted: ${hexToHsl(variation.colorScheme.muted)};
  --muted-foreground: 240 3.8% 46.1%;
  --card: ${hexToHsl(variation.colorScheme.cardBg)};
  --card-foreground: ${hexToHsl(variation.colorScheme.foreground)};
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: ${hexToHsl(variation.colorScheme.primary)};
  --radius: 0.5rem;
}
\`\`\`

## COMPONENT PATTERNS (USE THESE EXACT PATTERNS):

### Button Component:
\`\`\`tsx
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          {
            "bg-primary text-primary-foreground hover:bg-primary/90": variant === "default",
            "bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === "secondary",
            "border border-input bg-background hover:bg-accent hover:text-accent-foreground": variant === "outline",
            "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
          },
          {
            "h-9 px-3 text-sm": size === "sm",
            "h-10 px-4 py-2": size === "md",
            "h-11 px-8 text-lg": size === "lg",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
\`\`\`

### Section Component:
\`\`\`tsx
interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function Section({ children, className, id }: SectionProps) {
  return (
    <section id={id} className={cn("py-16 md:py-24", className)}>
      <div className="container mx-auto px-4">{children}</div>
    </section>
  );
}
\`\`\`

## TYPOGRAPHY (USE THESE FONTS VIA GOOGLE FONTS):
- Heading: "${variation.fontPairing.heading}"
- Body: "${variation.fontPairing.body}"

## SECTION ORDER (IMPLEMENT ALL IN THIS ORDER):
${variation.sectionOrder.map((s, i) => `${i + 1}. ${s.charAt(0).toUpperCase() + s.slice(1)}`).join('\n')}

## HERO LAYOUT: ${variation.heroVariant.name}
Layout: ${variation.heroVariant.layout}

## IMAGES (USE THESE UNSPLASH IMAGES):
${variation.industry.unsplashIds.map(id => `https://images.unsplash.com/${id}?w=800&q=80`).join('\n')}

## ICONS:
Use Lucide React icons: \`import { IconName } from "lucide-react";\`

## 🎨 PREMIUM CSS PATTERNS (MANDATORY - COPY THESE EXACTLY INTO index.css):

\`\`\`css
/* ============================================
   GLASSMORPHISM (USE FOR CARDS AND NAVIGATION)
   ============================================ */
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.glass-card {
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 24px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1);
}

.nav-blur {
  background: rgba(10, 10, 10, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

/* ============================================
   GRADIENT EFFECTS (USE FOR BUTTONS AND TEXT)
   ============================================ */
.gradient-text {
  background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.btn-primary {
  background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%);
  color: white;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 14px rgba(0,0,0,0.25);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.35);
}

.btn-secondary {
  background: transparent;
  border: 2px solid rgba(255,255,255,0.3);
  color: white;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: rgba(255,255,255,0.1);
  border-color: rgba(255,255,255,0.5);
}

/* ============================================
   MICRO-INTERACTIONS (USE FOR ALL CARDS)
   ============================================ */
.hover-lift {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
}

.button-press {
  transition: transform 0.1s ease;
}

.button-press:active {
  transform: scale(0.97);
}

/* ============================================
   ANIMATIONS (USE FOR CONTENT REVEAL)
   ============================================ */
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in-up {
  opacity: 0;
  animation: fade-in-up 0.6s ease forwards;
}

.stagger-1 { animation-delay: 0.1s; }
.stagger-2 { animation-delay: 0.2s; }
.stagger-3 { animation-delay: 0.3s; }
.stagger-4 { animation-delay: 0.4s; }

/* ============================================
   PROFESSIONAL SHADOWS
   ============================================ */
.shadow-elevation-3 {
  box-shadow: 0 10px 20px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.1);
}

.shadow-glow {
  box-shadow: 0 0 20px rgba(var(--primary), 0.3), 0 0 40px rgba(var(--primary), 0.1);
}

/* ============================================
   TYPOGRAPHY (USE THESE CLASS PATTERNS)
   ============================================ */
.headline-xl {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.headline-lg {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  line-height: 1.2;
}

.body-lg {
  font-size: 1.125rem;
  line-height: 1.7;
  color: rgba(255,255,255,0.7);
}

.body-md {
  font-size: 1rem;
  line-height: 1.6;
  color: rgba(255,255,255,0.6);
}

.caption {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: hsl(var(--primary));
}

/* ============================================
   CARD PATTERNS
   ============================================ */
.card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 1.5rem;
  padding: 2rem;
  transition: all 0.3s ease;
}

.card:hover {
  background: rgba(255,255,255,0.06);
  border-color: rgba(255,255,255,0.15);
  transform: translateY(-4px);
}

.card-highlight::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(var(--primary), 0.1) 0%, transparent 50%);
  border-radius: inherit;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.card-highlight:hover::before {
  opacity: 1;
}

/* ============================================
   LAYOUT UTILITIES
   ============================================ */
.section-spacing {
  padding: 5rem 1rem;
}

.container-wide {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.container-tight {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* ============================================
   BADGE PATTERNS
   ============================================ */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  border-radius: 9999px;
  background: rgba(var(--primary), 0.1);
  border: 1px solid rgba(var(--primary), 0.2);
  color: hsl(var(--primary));
}

.badge-primary {
  background: linear-gradient(135deg, rgba(var(--primary), 0.15) 0%, rgba(var(--accent), 0.1) 100%);
  border: 1px solid rgba(var(--primary), 0.3);
}
\`\`\`

## REQUIRED FEATURES:
1. **React Router** - Client-side routing with react-router-dom
2. **TypeScript** - Full type safety with proper interfaces
3. **Tailwind CSS** - Use utility classes with CSS variables
4. **Responsive Design** - Mobile-first with sm/md/lg/xl breakpoints
5. **Animations** - Use Tailwind transitions and CSS animations
6. **State Management** - React hooks (useState, useEffect, useContext)
7. **Forms** - Controlled components with validation
8. **Accessibility** - ARIA labels, focus states, semantic HTML

## SECTION COMPONENTS (CREATE SEPARATE FILES FOR EACH):
Each section must be a standalone component in src/components/sections/:
- **Header.tsx** - Fixed navigation with logo, nav links, and CTA button
- **Hero.tsx** - Full-height hero with headline, subtext, CTAs, and background image
- **Services.tsx** - Service cards with icons, descriptions, and pricing (MINIMUM 6 items)
- **About.tsx** - Company/team story with image and statistics
- **Team.tsx** - Team member cards with photos, names, roles (MINIMUM 3 members)
- **Testimonials.tsx** - Customer testimonials with quotes and avatars (MINIMUM 3)
- **Gallery.tsx** - Image gallery or portfolio showcase (MINIMUM 6 images)
- **FAQ.tsx** - Accordion FAQ section (MINIMUM 5 questions)
- **CTA.tsx** - Call-to-action banner with headline and buttons
- **Contact.tsx** - Contact form with name, email, message fields
- **Footer.tsx** - Footer with links, contact info, and social icons

## INTENT HANDLER HOOKS:
Create a useIntentHandlers.ts hook:
\`\`\`tsx
export function useIntentHandlers() {
  const handleBooking = (service?: string) => {
    console.log('Booking intent:', service);
    // Scroll to booking form or open modal
  };
  
  const handleContact = (data: FormData) => {
    console.log('Contact submitted:', Object.fromEntries(data));
  };
  
  const handleNewsletter = (email: string) => {
    console.log('Newsletter signup:', email);
  };
  
  return { handleBooking, handleContact, handleNewsletter };
}
\`\`\`

## OUTPUT FORMAT:

Return a single JSON object with this structure (no markdown, no explanations):

\`\`\`json
{
  "files": {
    "src/App.tsx": "// Main app with routing...",
    "src/main.tsx": "// Entry point with React DOM...",
    "src/index.css": "/* Global styles with CSS variables */",
    "src/components/ui/Button.tsx": "// Reusable button...",
    "src/components/ui/Card.tsx": "// Reusable card...",
    "src/components/ui/Input.tsx": "// Form input...",
    "src/components/sections/Header.tsx": "// Navigation header...",
    "src/components/sections/Hero.tsx": "// Hero section...",
    "src/components/sections/Services.tsx": "// Services grid (6+ items)...",
    "src/components/sections/About.tsx": "// About section...",
    "src/components/sections/Team.tsx": "// Team members (3+)...",
    "src/components/sections/Testimonials.tsx": "// Testimonials (3+)...",
    "src/components/sections/Gallery.tsx": "// Image gallery (6+)...",
    "src/components/sections/FAQ.tsx": "// FAQ accordion (5+)...",
    "src/components/sections/CTA.tsx": "// Call to action...",
    "src/components/sections/Contact.tsx": "// Contact form...",
    "src/components/sections/Footer.tsx": "// Footer...",
    "src/hooks/useIntentHandlers.ts": "// Intent handler hooks...",
    "src/pages/Home.tsx": "// Home page composing sections...",
    "src/lib/utils.ts": "// cn() and utilities...",
    "src/types/index.ts": "// TypeScript types...",
    "package.json": "{ \\"dependencies\\": {...} }",
    "tailwind.config.js": "// Tailwind config with CSS vars...",
    "index.html": "<!-- HTML template with fonts -->"
  },
  "entryPoint": "src/App.tsx",
  "framework": "react",
  "buildTool": "vite"
}
\`\`\`

## QUALITY REQUIREMENTS (NON-NEGOTIABLE):
- **MINIMUM 10 section components** - Header, Hero, Services, About, Team, Testimonials, Gallery, FAQ, CTA, Contact, Footer
- **MINIMUM 6 service/feature items** with icons, titles, descriptions, pricing  
- **MINIMUM 3 team members** with photos, names, titles, bios
- **MINIMUM 3 testimonials** with quotes, names, companies, avatars
- **MINIMUM 6 gallery images** with proper aspect ratios
- **MINIMUM 5 FAQ items** with expandable answers
- Premium, award-winning visual design rivaling Webflow/Framer
- Smooth scroll animations and micro-interactions
- Professional typography hierarchy (eyebrow → headline → body)
- Consistent spacing (8px grid system)
- Glass morphism and gradient effects WHERE SHOWN IN CSS ABOVE
- Dark/light mode ready with CSS variables
- SEO-friendly semantic HTML structure
- All images from Unsplash with proper alt text

## 🎯 PREMIUM COMPONENT EXAMPLES (FOLLOW THIS QUALITY LEVEL):

### Hero.tsx Example:
\`\`\`tsx
export function Hero() {
  return (
    <section className="min-h-screen flex items-center relative overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1920&q=80" 
          alt="Hero background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container-wide section-spacing">
        <div className="max-w-2xl">
          {/* Eyebrow badge */}
          <span className="badge badge-primary mb-6 animate-fade-in-up">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Award-Winning Service
          </span>
          
          {/* Headline with gradient text */}
          <h1 className="headline-xl text-white mb-6 animate-fade-in-up stagger-1">
            Where <span className="gradient-text">Excellence</span> Meets Artistry
          </h1>
          
          {/* Subtext */}
          <p className="body-lg mb-10 animate-fade-in-up stagger-2">
            Experience transformative services from our team of experts 
            in a luxurious, relaxing environment.
          </p>
          
          {/* CTA buttons */}
          <div className="flex flex-wrap gap-4 animate-fade-in-up stagger-3">
            <button className="btn-primary button-press">
              Book Appointment
            </button>
            <button className="btn-secondary">
              View Services
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
\`\`\`

### Services.tsx Card Pattern Example:
\`\`\`tsx
const services = [
  { id: 1, name: "Service One", price: "$85+", duration: "60 min", description: "Premium service description", popular: true },
  // ... 6 total services with icons
];

{services.map((service) => (
  <div key={service.id} className="card hover-lift relative group">
    {service.popular && (
      <span className="badge badge-primary text-xs absolute -top-3 left-4">Most Popular</span>
    )}
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-xl font-bold text-white">{service.name}</h3>
        <span className="caption">{service.duration}</span>
      </div>
      <span className="gradient-text font-bold text-xl">{service.price}</span>
    </div>
    <p className="body-md mb-4">{service.description}</p>
    <button className="w-full text-primary hover:text-primary/80 font-medium transition-colors">
      Book This Service →
    </button>
  </div>
))}
\`\`\`

OUTPUT: Return ONLY the JSON object with the files. No markdown code fences, no explanations.`;
      }
    } else {
      systemPrompt = systemPrompts[mode as keyof typeof systemPrompts] || systemPrompts.code;
    }

    const extractTextContent = (content: unknown): string => {
      if (typeof content === 'string') return content;
      if (Array.isArray(content)) {
        // Try to extract any text parts (OpenAI/Gemini style).
        const textParts = content
          .map((p: Record<string, unknown>) => {
            if (!p || typeof p !== 'object') return '';
            if (typeof p.text === 'string') return p.text;
            // Some formats may use { type: 'text', text: '...' }
            if (p.type === 'text' && typeof p.text === 'string') return p.text;
            return '';
          })
          .filter(Boolean);
        return textParts.join('\n').trim();
      }
      return '';
    };

    // Check if user wants to generate an image - only trigger on explicit requests
    const lastMessageContent = messages[messages.length - 1]?.content;
    const userPromptText = extractTextContent(lastMessageContent);
    const userPrompt = userPromptText.toLowerCase();
    
    // Perform web research in parallel (non-blocking) for design/code context
    const researchPromise = performPromptResearch(userPromptText);
    
    // More specific keywords - avoid triggering on general page generation requests
    const imageKeywords = ['generate image', 'create image', 'generate a logo', 'create a logo', 'make a logo', 'add logo image', 'insert image'];
    const shouldGenerateImage = generateImage || imageKeywords.some(kw => userPrompt.includes(kw));
    
    let generatedImageUrl = '';
    let imageHtml = '';
    
    if (shouldGenerateImage) {
      console.log('[AI-Code-Assistant] Generating image for request');
      
      // Extract image description from user prompt
      const imagePromptMatch = userPrompt.match(/(?:generate|create|add|place|insert)\s+(?:an?\s+)?(?:image|logo|photo|picture)\s+(?:of\s+)?(.+?)(?:\s+(?:in|at|on|to)\s+|$)/i);
      const imageDescription = imagePromptMatch?.[1] || userPrompt.replace(/generate|create|add|place|insert|image|logo|photo|picture/gi, '').trim();
      
      // Detect placement from prompt
      let detectedPlacement = imagePlacement || 'top-left';
      if (userPrompt.includes('corner left') || userPrompt.includes('top left')) detectedPlacement = 'top-left';
      else if (userPrompt.includes('corner right') || userPrompt.includes('top right')) detectedPlacement = 'top-right';
      else if (userPrompt.includes('bottom left')) detectedPlacement = 'bottom-left';
      else if (userPrompt.includes('bottom right')) detectedPlacement = 'bottom-right';
      else if (userPrompt.includes('center')) detectedPlacement = 'center';
      else if (userPrompt.includes('header')) detectedPlacement = 'top-left';
      else if (userPrompt.includes('footer')) detectedPlacement = 'bottom-left';
      
      // Determine if it's a logo request
      const isLogo = userPrompt.includes('logo') || userPrompt.includes('brand');
      
      try {
        // Call image generation with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-3-pro-image-preview',
            messages: [{
              role: 'user',
              content: `${imageDescription}, ${isLogo ? 'clean professional logo design, minimal, vector style, transparent background' : 'high quality digital art'}`
            }],
            modalities: ['image', 'text']
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (imageResponse.ok) {
          const imageText = await imageResponse.text();
          if (imageText && imageText.trim()) {
            try {
              const imageData = JSON.parse(imageText);
              generatedImageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url || '';
              
              if (generatedImageUrl) {
                // Generate placement CSS
                const placementStyles: Record<string, string> = {
                  'top-left': 'position: absolute; top: 10px; left: 10px;',
                  'top-center': 'position: absolute; top: 10px; left: 50%; transform: translateX(-50%);',
                  'top-right': 'position: absolute; top: 10px; right: 10px;',
                  'center': 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);',
                  'bottom-left': 'position: absolute; bottom: 10px; left: 10px;',
                  'bottom-right': 'position: absolute; bottom: 10px; right: 10px;',
                };
                
                const placementCss = placementStyles[detectedPlacement] || placementStyles['top-left'];
                const maxSize = isLogo ? 'max-width: 120px; max-height: 60px;' : 'max-width: 300px; max-height: 200px;';
                
                imageHtml = `
<!-- AI Generated Image - Drag to reposition, use corner handles to resize -->
<div class="ai-image-container resizable-image" style="${placementCss} ${maxSize} z-index: 100;">
  <img src="${generatedImageUrl}" alt="${imageDescription}" class="w-full h-auto object-contain" />
</div>`;
                
                console.log('[AI-Code-Assistant] Image generated and placed at:', detectedPlacement);
              }
            } catch (parseErr) {
              console.error('[AI-Code-Assistant] Failed to parse image response:', parseErr);
            }
          }
        } else {
          console.warn('[AI-Code-Assistant] Image generation returned non-OK status:', imageResponse.status);
        }
      } catch (imageError) {
        if (imageError instanceof Error && imageError.name === 'AbortError') {
          console.warn('[AI-Code-Assistant] Image generation timed out');
        } else {
          console.error('[AI-Code-Assistant] Image generation failed:', imageError);
        }
      }
    }

    // Truncate messages to prevent exceeding token limits
    // Keep only the last 6 messages (3 turns) plus the system message
    const MAX_MESSAGES = 6;
    const truncatedMessages = messages.length > MAX_MESSAGES 
      ? messages.slice(-MAX_MESSAGES) 
      : messages;
    
    // Also truncate individual message content if too long
    const processedMessages = truncatedMessages.map((msg: { role: string; content: unknown }) => {
      const content = msg.content;
      if (typeof content === 'string') {
        return {
          role: msg.role,
          content: content.length > 15000
            ? content.substring(0, 15000) + '\n\n[Content truncated for token limit]'
            : content,
        };
      }
      // Multimodal arrays should be forwarded as-is.
      return { role: msg.role, content };
    });

    console.log(`[AI-Code-Assistant] Processing ${processedMessages.length} messages (from ${messages.length} original)`);

    // Wait for research results and format context
    const research = await researchPromise;
    const researchContext = formatResearchContext(research);

    const aiMessages = [
      { role: 'system', content: systemPrompt + researchContext + systemTypeContext + designProfileContext + (generatedImageUrl ? `

**IMPORTANT: An AI-generated image has been created for this request. Include this image HTML in your response at the appropriate location:**
${imageHtml}

The image is already styled for the "${imagePlacement || 'top-left'}" position. Make sure to include it in a relative-positioned container.` : '') },
      ...processedMessages
    ];

    // Hybrid AI: try primary model, fallback to secondary
    const models = [
      { id: 'google/gemini-2.5-flash', maxTokens: 16000, label: 'Gemini Flash' },
      { id: 'openai/gpt-5-mini', maxTokens: 16000, label: 'GPT-5 Mini' },
    ];

    let content = '';
    let lastError = '';

    for (const model of models) {
      try {
        console.log(`[AI-Hybrid] Trying ${model.label}...`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 90000);

        const resp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ model: model.id, max_tokens: model.maxTokens, messages: aiMessages }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (resp.status === 429) {
          return new Response(
            JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (resp.status === 402) {
          return new Response(
            JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
            { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (!resp.ok) {
          const errText = await resp.text();
          console.warn(`[AI-Hybrid] ${model.label} error ${resp.status}: ${errText.substring(0, 200)}`);
          lastError = `${model.label}: ${resp.status}`;
          continue;
        }

        const responseText = await resp.text();
        if (!responseText || responseText.trim() === '') {
          console.warn(`[AI-Hybrid] ${model.label} returned empty response, trying next...`);
          lastError = `${model.label}: empty response`;
          continue;
        }

        let data;
        try {
          data = JSON.parse(responseText);
        } catch {
          console.warn(`[AI-Hybrid] ${model.label} returned invalid JSON, trying next...`);
          lastError = `${model.label}: invalid JSON`;
          continue;
        }

        const parsed = data.choices?.[0]?.message?.content || '';
        if (!parsed) {
          console.warn(`[AI-Hybrid] ${model.label} returned no content, trying next...`);
          lastError = `${model.label}: no content`;
          continue;
        }

        content = parsed;
        console.log(`[AI-Hybrid] Success with ${model.label}`);
        break;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          console.warn(`[AI-Hybrid] ${model.label} timed out, trying next...`);
          lastError = `${model.label}: timeout`;
          continue;
        }
        console.warn(`[AI-Hybrid] ${model.label} failed:`, err);
        lastError = `${model.label}: ${err instanceof Error ? err.message : 'unknown'}`;
        continue;
      }
    }

    if (!content) {
      throw new Error(`All AI models failed. Last error: ${lastError}`);
    }

    // Save learning session (async, don't wait)
    const originalUserPrompt = extractTextContent(messages[messages.length - 1]?.content);
    if (savePattern && originalUserPrompt) {
      supabase.from('ai_learning_sessions').insert({
        session_type: mode === 'code' ? 'code_generation' : mode === 'design' ? 'design_review' : 'code_review',
        user_prompt: originalUserPrompt.substring(0, 500),
        ai_response: content.substring(0, 500),
        was_successful: true,
        technologies_used: ['React', 'TypeScript', 'Tailwind CSS']
      }).then(() => console.log('Learning session saved'));
    }

    return new Response(
      JSON.stringify({ 
        content,
        generatedImage: generatedImageUrl || undefined,
        imagePlacement: generatedImageUrl ? (imagePlacement || 'top-left') : undefined
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in ai-code-assistant:', error);
    
    // Handle timeout errors specifically
    if (error instanceof Error && error.name === 'AbortError') {
      return new Response(
        JSON.stringify({ 
          error: 'Request timed out. The AI service is taking too long. Please try again.',
          errorType: 'timeout'
        }),
        {
          status: 504,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Extract detailed error message
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    // Provide user-friendly error messages
    let userMessage = message;
    let errorType = 'unknown';
    
    if (message.includes('All AI models failed')) {
      userMessage = 'AI service temporarily unavailable. All models are busy or experiencing issues. Please try again in a moment.';
      errorType = 'ai_unavailable';
    } else if (message.includes('network') || message.includes('fetch')) {
      userMessage = 'Network error connecting to AI service. Please check your connection and try again.';
      errorType = 'network';
    } else if (message.includes('JSON') || message.includes('parse')) {
      userMessage = 'Received invalid response from AI service. Please try again.';
      errorType = 'parse_error';
    }
    
    return new Response(
      JSON.stringify({ 
        error: userMessage,
        errorType,
        details: message !== userMessage ? message : undefined  
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
