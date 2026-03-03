import { serve } from "serve";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { generateVariation, variationToPromptContext } from "../_shared/industryVariations.ts";
import {
  getIndustryProfile,
  matchPagePattern,
  buildIndustryPageContext,
  getResearchQueries,
} from "../_shared/industryPagePatterns.ts";

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
      systemType: z.string().max(50).nullish(),
      // Template generation parameters (for template-json and template-html modes)
      variationSeed: z.string().max(30).nullish(),
      templateName: z.string().max(100).nullish(),
      aesthetic: z.string().max(80).nullish(),
      source: z.string().max(80).nullish(),
      // User Design Profile - extracted patterns from user's saved projects for style-matching
      userDesignProfile: z.object({
        projectCount: z.number().optional(),
        dominantStyle: z.enum(["dark", "light", "colorful", "minimal", "mixed"]).optional(),
        industryHints: z.array(z.string()).optional(),
      }).optional(),
      // Flag for fast on-demand page generation (nav clicks in preview).
      // When true: skip the thinking instruction and cap output tokens to 10000 for speed.
      navPageGen: z.boolean().optional(),
      // Nav page generation context — page slug + the nav link label that was clicked
      navPageName: z.string().max(100).nullish(),
      navLabel: z.string().max(120).nullish(),
      // Systems Build Context — mirrors the full BlueprintSchema from systems-build (snake_case).
      // When provided, every generation request benefits from brand, palette, intents & section layout.
      // When absent but systemType is present a minimal default blueprint is auto-synthesised below.
      systemsBuildContext: z.object({
        version: z.string().optional(),
        identity: z.object({
          industry: z.string().max(80).optional(),
          business_model: z.string().max(80).optional(),
          primary_goal: z.string().max(200).optional(),
          locale: z.string().max(20).optional(),
        }).optional(),
        brand: z.object({
          business_name: z.string().max(100).optional(),
          tagline: z.string().max(200).optional(),
          tone: z.string().max(80).optional(),
          palette: z.object({
            primary: z.string().optional(),
            secondary: z.string().optional(),
            accent: z.string().optional(),
            background: z.string().optional(),
            foreground: z.string().optional(),
          }).optional(),
          typography: z.object({ heading: z.string().optional(), body: z.string().optional() }).optional(),
          logo: z.object({ mode: z.string().optional(), text_lockup: z.string().optional() }).optional(),
        }).optional(),
        design: z.object({
          layout: z.object({
            hero_style: z.string().max(40).optional(),
            section_spacing: z.string().max(20).optional(),
            max_width: z.string().max(20).optional(),
            navigation_style: z.string().max(20).optional(),
          }).optional(),
          effects: z.object({
            animations: z.boolean().optional(),
            scroll_animations: z.boolean().optional(),
            hover_effects: z.boolean().optional(),
            gradient_backgrounds: z.boolean().optional(),
            glassmorphism: z.boolean().optional(),
            shadows: z.string().max(20).optional(),
          }).optional(),
          images: z.object({
            style: z.string().max(20).optional(),
            aspect_ratio: z.string().max(20).optional(),
            overlay_style: z.string().max(20).optional(),
          }).optional(),
          buttons: z.object({
            style: z.string().max(20).optional(),
            size: z.string().max(20).optional(),
            hover_effect: z.string().max(20).optional(),
          }).optional(),
          sections: z.object({
            include_stats: z.boolean().optional(),
            include_testimonials: z.boolean().optional(),
            include_faq: z.boolean().optional(),
            include_cta_banner: z.boolean().optional(),
            include_newsletter: z.boolean().optional(),
            include_social_proof: z.boolean().optional(),
            use_counter_animations: z.boolean().optional(),
          }).optional(),
          content: z.object({
            density: z.string().max(20).optional(),
            use_icons: z.boolean().optional(),
            writing_style: z.string().max(30).optional(),
          }).optional(),
        }).optional(),
        intents: z.array(z.object({
          intent: z.string().max(60),
          target: z.object({ kind: z.string().optional(), ref: z.string().optional() }).optional(),
        })).max(20).optional(),
        // Extra fields for template structural context
        template_sections: z.array(z.string().max(60)).max(20).optional(),
        template_intents: z.array(z.string().max(60)).max(20).optional(),
      }).optional(),
      // AI Site Elements Library — pre-built component intelligence context
      siteElementsLibraryContext: z.string().max(50_000).optional(),
      // Surgical edit mode — the user wants a targeted change, not full-page generation
      surgicalEdit: z.boolean().optional(),
      // VFS file tree context — paths and sizes for project awareness
      vfsFileTree: z.array(z.object({
        path: z.string().max(200),
        size: z.number(),
      })).max(500).optional(),
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
      systemsBuildContext,
      navPageGen = false,
      navPageName,
      navLabel,
      siteElementsLibraryContext,
      surgicalEdit = false,
      vfsFileTree,
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

    // Build systems-build blueprint context — brand, palette, intents, template structure.
    // Auto-synthesise a minimal default when systemType is present but no explicit blueprint was sent.
    const resolvedBlueprint = systemsBuildContext ?? (systemType ? {
      identity: { industry: systemType },
      brand: { business_name: templateName ?? systemType },
    } : null);

    const systemsBuildContextText = resolvedBlueprint ? (() => {
      const { brand, identity, design, intents, template_sections, template_intents } = resolvedBlueprint as {
        brand?: { business_name?: string; tagline?: string; tone?: string; palette?: Record<string, string | undefined>; typography?: { heading?: string; body?: string } };
        identity?: { industry?: string; primary_goal?: string };
        design?: {
          layout?: { hero_style?: string };
          effects?: { animations?: boolean; glassmorphism?: boolean; shadows?: string };
          sections?: { include_stats?: boolean; include_testimonials?: boolean; include_faq?: boolean; include_cta_banner?: boolean; include_newsletter?: boolean; include_social_proof?: boolean };
          buttons?: { style?: string };
          content?: { writing_style?: string };
        };
        intents?: Array<{ intent: string }>;
        template_sections?: string[];
        template_intents?: string[];
      };

      const lines: string[] = ['\n[🏗️ Business Blueprint — Use for Content, Colors & Intent Wiring]'];
      if (brand?.business_name) lines.push(`Business: ${brand.business_name}`);
      if (brand?.tagline) lines.push(`Tagline: "${brand.tagline}"`);
      if (identity?.industry) lines.push(`Industry: ${identity.industry.replace(/_/g, ' ')}`);
      if (identity?.primary_goal) lines.push(`Goal: ${identity.primary_goal}`);
      if (brand?.tone) lines.push(`Tone: ${brand.tone}`);
      if (brand?.palette) {
        const p = brand.palette;
        lines.push(`Brand Colors: Primary ${p['primary'] || 'auto'} | Secondary ${p['secondary'] || 'auto'} | Accent ${p['accent'] || 'auto'} | BG ${p['background'] || 'auto'} | FG ${p['foreground'] || 'auto'}`);
      }
      if (brand?.typography) lines.push(`Typography: ${brand.typography.heading || 'auto'} (headings) / ${brand.typography.body || 'auto'} (body)`);
      if (design?.layout?.hero_style) lines.push(`Hero Layout: ${design.layout.hero_style}`);
      if (design?.effects?.glassmorphism) lines.push(`Visual FX: glassmorphism enabled`);
      if (design?.effects?.shadows) lines.push(`Shadow Style: ${design.effects.shadows}`);
      if (design?.buttons?.style) lines.push(`Button Style: ${design.buttons.style}`);
      if (design?.content?.writing_style) lines.push(`Writing Style: ${design.content.writing_style}`);
      if (design?.sections) {
        const s = design.sections;
        const included = (Object.entries(s) as [string, boolean | undefined][])
          .filter(([, v]) => v)
          .map(([k]) => k.replace('include_', '').replace(/_/g, ' '));
        if (included.length) lines.push(`Required Sections: ${included.join(', ')}`);
      }
      if (intents?.length) lines.push(`Backend Intents to Wire: ${intents.map(i => i.intent).join(', ')}`);
      if (template_sections?.length) lines.push(`Template Section Layout: ${template_sections.join(' → ')}`);
      if (template_intents?.length) lines.push(`Existing Intent Wiring: ${template_intents.join(', ')}`);
      lines.push('Apply this blueprint: use the brand colors, tone, and wire all listed intents on CTAs.');
      return lines.join('\n');
    })() : '';
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      // Not fatal — we will fall through to direct OpenAI / Anthropic API fallbacks below.
      console.warn("LOVABLE_API_KEY not configured — will attempt direct provider APIs as fallback");
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
      code: `You are an ELITE fullstack React/TypeScript engineer embedded inside a Web Builder IDE with a Virtual File System (VFS).
${editModeContext}

## YOUR ROLE
You are as powerful as a senior fullstack engineer. Users direct you with natural language prompts, and you execute with precision — creating, editing, and wiring React/TSX code across the entire VFS.

## PLATFORM CAPABILITIES
- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite, react-router-dom, framer-motion, lucide-react icons
- **Backend**: Supabase Edge Functions (Deno/TypeScript), PostgreSQL database, Row Level Security, Auth, Storage
- **Preview**: Sandpack-based live preview renders the VFS in an iframe in real-time
- **VFS**: You can create/edit/delete any file in the project. Changes render instantly.

## VFS CONTEXT
The user's current project files are provided below. Use this context to:
- Understand existing component structure, imports, and patterns
- Make targeted edits that fit the existing codebase
- Avoid duplicating existing utilities or components
- Wire new features into existing routing and layouts

## OUTPUT FORMAT (CRITICAL)
ALWAYS return a JSON object with this structure — no markdown fences, no prose outside the JSON:

\`\`\`
{
  "files": {
    "src/App.tsx": "// full file content...",
    "src/components/NewComponent.tsx": "// full file content...",
    "src/pages/NewPage.tsx": "// full file content..."
  },
  "explanation": "Brief description of what was created/changed"
}
\`\`\`

**Rules:**
- Include ONLY files that are new or modified — do NOT echo unchanged files
- Each file value must be the COMPLETE file content (not a diff)
- For small edits to large files, still output the complete file
- Use proper TypeScript with explicit types
- Import from existing project paths (@/components/ui/*, @/lib/utils, etc.)

## REACT/TSX CODING STANDARDS
1. **Components**: Functional components with TypeScript interfaces for props
2. **Styling**: Tailwind CSS utility classes + CSS variables (hsl(var(--primary)), etc.)
3. **State**: React hooks (useState, useEffect, useCallback, useMemo, useContext)
4. **Routing**: react-router-dom with <Link>, useNavigate, useParams
5. **Icons**: Import from lucide-react: \`import { IconName } from "lucide-react"\`
6. **UI Library**: Use shadcn/ui components from @/components/ui/* when available
7. **Utilities**: Use cn() from @/lib/utils for conditional classes

## BACKEND / EDGE FUNCTIONS
When the user requests backend functionality:

1. **Edge Functions**: Create files at \`supabase/functions/<name>/index.ts\`
   - Use Deno runtime, import from "https://deno.land/std" or "npm:" prefixes
   - Include CORS headers for browser access
   - Use LOVABLE_API_KEY (auto-provided) for AI gateway calls
   - Access Supabase via createClient with SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY

2. **Database**: Suggest SQL migrations as comments/instructions (you cannot execute SQL directly)

3. **Client Integration**: Use \`supabase.functions.invoke()\` from @/integrations/supabase/client

## SURGICAL vs FULL GENERATION
- **Surgical Edit** (user asks to change/fix/add ONE thing): Modify ONLY the targeted file(s). Output minimal file set.
- **Full Generation** (user asks to create/build/generate a feature): Create all necessary files — components, pages, hooks, types, styles.

## DESIGN QUALITY
- Professional, production-ready UI
- Responsive design (mobile-first with sm/md/lg/xl breakpoints)
- Proper typography hierarchy, spacing, and color contrast
- Smooth animations with Tailwind transitions or framer-motion
- Accessible (semantic HTML, ARIA labels, focus states)

## CONVERSATION CONTEXT
Maintain awareness of previous messages in the conversation. Build iteratively on prior work. If the user says "make it better" or "fix that", reference the most recent code you generated.

## CRITICAL RULES
- NEVER output raw HTML with <script> tags — always use React/TSX
- NEVER use CDN script tags — use npm imports
- NEVER convert React to vanilla JS — the preview runs React natively
- ALWAYS output valid JSON with the "files" structure
- ALWAYS include complete file contents (not partial/diff)
- For backend features, create the edge function AND the client-side integration code`,

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

    // For navPageGen requests, ALSO run targeted industry page research in parallel
    const navResearchPromise: Promise<string> = (navPageGen && systemType)
      ? (async () => {
          try {
            const profile = getIndustryProfile(systemType ?? null);
            const pattern = matchPagePattern(profile, navPageName ?? '', navLabel ?? '');
            // Static context (always fast)
            const staticCtx = buildIndustryPageContext(profile, pattern);
            // Live DuckDuckGo research using pattern-specific queries (run both in parallel)
            const queries = getResearchQueries(pattern);
            const liveResults = await Promise.allSettled(
              queries.map(q => performPromptResearch(q))
            );
            const liveSnippets = liveResults
              .filter((r): r is PromiseFulfilledResult<{ snippets: string[]; trends: string[]; keyPhrases: string[] }> => r.status === 'fulfilled')
              .flatMap(r => r.value.snippets.slice(0, 3));
            const liveCtx = liveSnippets.length > 0
              ? `\n\n📡 LIVE WEB RESEARCH (industry page patterns):\n${liveSnippets.map(s => `  • ${s}`).join('\n')}`
              : '';
            return staticCtx + liveCtx;
          } catch (e) {
            console.warn('[navResearch] failed:', e);
            return '';
          }
        })()
      : Promise.resolve('');
    
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
    const [research, industryPageContext] = await Promise.all([researchPromise, navResearchPromise]);
    const researchContext = formatResearchContext(research);

    // ── Thinking-tag instruction injected into every request ───────────────
    // All models (Gemini, GPT-4o, Claude via gateway) are asked to reason step-by-step
    // inside <thinking>…</thinking> before producing their final answer.
    // The tags are stripped from the returned content and forwarded to the UI separately.
    // For navPageGen requests (on-demand page clicks), skip thinking to reduce latency.
    const thinkingInstruction = navPageGen ? '' : `

[REASONING REQUIREMENT]
Before writing your final answer, reason through the problem step-by-step inside <thinking> tags.
Structure your thinking as follows:
<thinking>
1. UNDERSTAND: What exactly is the user asking for?
2. ANALYSE: What does the current code/context tell me?
3. PLAN: What approach will produce the best result?
4. CONSIDER: Are there edge cases, accessibility concerns, or performance issues?
5. DECIDE: Final plan before I write the output.
</thinking>
Write your <thinking> block FIRST, then immediately follow with your complete response (HTML/code/answer).
Never include the <thinking> block explanation text in your final output.`;

    // Helper: parse and strip <thinking>…</thinking> from a raw model response
    const extractThinkingTags = (raw: string): { reasoning: string; content: string } => {
      // Match both single-line and multi-line thinking blocks at the start of the response
      const match = raw.match(/^\s*<thinking>([\s\S]*?)<\/thinking>\s*/i);
      if (match) {
        return { reasoning: match[1].trim(), content: raw.slice(match[0].length).trim() };
      }
      // Also handle thinking block anywhere in the response (some models insert it mid-text)
      const anyMatch = raw.match(/<thinking>([\s\S]*?)<\/thinking>\s*/i);
      if (anyMatch) {
        return {
          reasoning: anyMatch[1].trim(),
          content: raw.replace(/<thinking>[\s\S]*?<\/thinking>\s*/i, '').trim(),
        };
      }
      return { reasoning: '', content: raw };
    };

    // Inject AI Site Elements Library knowledge when available.
    // SKIP entirely for surgical edits — the library pressures the AI toward
    // full-page generation and conflicts with targeted edit instructions.
    // The library provides STRUCTURAL patterns and INTENT WIRING only.
    // Visual design (colors, fonts, gradients, effects) comes from the
    // industry variation system and design profile — NOT from the library.
    const elementsLibraryBlock = (siteElementsLibraryContext && !surgicalEdit)
      ? `\n${siteElementsLibraryContext}\n⚠️ LIBRARY USAGE RULE: The element library above provides STRUCTURE and INTENT WIRING patterns only. For colors, fonts, gradients, card styles, and visual effects, follow the industry variation system, design profile, and brand palette provided elsewhere in this prompt. Do NOT copy visual styles from the library skeletons — create a UNIQUE design each time.\n`
      : '';

    // For surgical edits, inject a strong system-level reinforcement that overrides
    // the general edit mode context. This ensures the AI only touches the targeted element.
    const surgicalEditReinforcement = surgicalEdit ? `

🔒🔒🔒 SURGICAL EDIT OVERRIDE — HIGHEST PRIORITY 🔒🔒🔒
This is a SURGICAL EDIT request. The user wants ONE specific change.
Your output MUST be the COMPLETE template HTML, but with ONLY the requested element modified.
EVERY other section, element, style, script, text, image, color, font, and data attribute MUST remain BYTE-FOR-BYTE IDENTICAL to the input.
Think of this as applying a minimal diff — if a line wasn't mentioned by the user, it MUST NOT change.
DO NOT "improve", reorganize, or modernize unmentioned parts of the template.
DO NOT add new sections unless explicitly asked.
DO NOT remove any sections, scripts, or styles.
If the user asks to change ONE element's color, ONLY that element's color class changes. Nothing else.

⚠️ CRITICAL STYLE PRESERVATION ⚠️
- Copy ALL <style> blocks from the input VERBATIM — character for character.
- DO NOT rewrite, reformat, consolidate, minify, or "clean up" any CSS.
- DO NOT change CSS custom properties, color values, font-family declarations, or animation keyframes.
- DO NOT change Tailwind utility classes on elements you were NOT asked to modify.
- If the user asks to change element X, ONLY modify classes/styles on element X. Leave ALL other elements' classes untouched.
- DO NOT change background colors, gradients, border-radius, box-shadow, or any visual property on ANY element not targeted by the user.

⚠️ BACKEND / WIRING EDITS — EXTRA RULES ⚠️
When the user asks to "wire", "connect", "integrate", "hook up", "link to backend", "add API call", "submit data", "save to database", or similar backend-wiring requests:
- You are ONLY allowed to add/modify <script> blocks, data attributes (data-*), form action/method attributes, or fetch/API call logic.
- You MUST NOT change ANY visual styling: no class changes, no inline style changes, no CSS modifications.
- You MUST NOT rearrange, rewrite, or "improve" any HTML structure or element order.
- The ONLY acceptable changes are functional: adding event listeners, fetch calls, form handlers, script blocks.
- Copy the entire template as-is and ONLY inject the minimal JavaScript/attributes needed for the backend wiring.
🔒🔒🔒 END SURGICAL EDIT OVERRIDE 🔒🔒🔒
` : '';

    // Build VFS file tree context block for project awareness
    const vfsContextBlock = vfsFileTree && vfsFileTree.length > 0
      ? `\n\n[VFS PROJECT FILE TREE — ${vfsFileTree.length} files]\n${vfsFileTree.map((f: { path: string; size: number }) => `${f.path} (${f.size}b)`).join('\n')}\n\nUse this file tree to understand the project structure. Reference existing files in imports. Only output files that are new or modified.`
      : '';

    const aiMessages = [
      { role: 'system', content: systemPrompt + surgicalEditReinforcement + researchContext + industryPageContext + systemTypeContext + designProfileContext + systemsBuildContextText + elementsLibraryBlock + vfsContextBlock + thinkingInstruction + (generatedImageUrl ? `

**IMPORTANT: An AI-generated image has been created for this request. Include this image HTML in your response at the appropriate location:**
${imageHtml}

The image is already styled for the "${imagePlacement || 'top-left'}" position. Make sure to include it in a relative-positioned container.` : '') },
      ...processedMessages
    ];

    // Hybrid AI: try Vercel AI Gateway models first, then fall back to direct provider APIs
    // Models listed in order of preference (valid, existing model IDs)
    // navPageGen reduces maxTokens to 10000 for faster on-demand page generation
    const pageTokens = navPageGen ? 10000 : 32000;
    const gatewayModels = LOVABLE_API_KEY ? [
      { id: 'google/gemini-2.5-flash',       maxTokens: pageTokens,        label: 'Gemini 2.5 Flash' },
      { id: 'google/gemini-2.5-pro',         maxTokens: pageTokens,        label: 'Gemini 2.5 Pro' },
      { id: 'openai/gpt-5-mini',             maxTokens: pageTokens,        label: 'GPT-5 Mini' },
    ] : [];

    let content = '';
    let lastError = '';
    // Mutable wrapper so TypeScript const-analysis doesn't flag it (assigned inside nested conditionals)
    const capture = { reasoning: '' };

    // ── Phase 1: Vercel AI Gateway ──────────────────────────────────────────
    for (const model of gatewayModels) {
      try {
        console.log(`[AI-Hybrid] Trying gateway model ${model.label}...`);
        const controller = new AbortController();
        // 25s per-model timeout: allows up to 5 attempts (125s total) within Supabase's 150s wall-clock limit
        const timeoutId = setTimeout(() => controller.abort(), 25000);

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

        // Extract <thinking> tags before storing final content
        const extracted = extractThinkingTags(parsed);
        if (extracted.reasoning) {
          capture.reasoning = extracted.reasoning;
          console.log(`[AI-Hybrid] Thinking tags extracted from ${model.label}: ${extracted.reasoning.length} chars`);
        }
        content = extracted.content;
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

    // ── Phase 2: Direct OpenAI API (gpt-4o-mini / gpt-4o) ──────────────────
    if (!content) {
      const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
      if (OPENAI_API_KEY) {
        const openaiModels = [
          { id: 'gpt-4o-mini', maxTokens: 16000, label: 'OpenAI gpt-4o-mini' },
          { id: 'gpt-4o',      maxTokens: 16000, label: 'OpenAI gpt-4o' },
        ];
        for (const model of openaiModels) {
          try {
            console.log(`[AI-Hybrid] Trying direct ${model.label}...`);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 25000);
            const resp = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ model: model.id, max_tokens: model.maxTokens, messages: aiMessages }),
              signal: controller.signal,
            });
            clearTimeout(timeoutId);
            if (!resp.ok) {
              const errText = await resp.text();
              console.warn(`[AI-Hybrid] ${model.label} error ${resp.status}: ${errText.substring(0, 200)}`);
              lastError = `${model.label}: ${resp.status}`;
              continue;
            }
            const data = await resp.json();
            const parsed = data.choices?.[0]?.message?.content || '';
            if (!parsed) { lastError = `${model.label}: no content`; continue; }
            // Extract <thinking> tags
            const extracted = extractThinkingTags(parsed);
            if (extracted.reasoning) {
              capture.reasoning = extracted.reasoning;
              console.log(`[AI-Hybrid] Thinking tags extracted from ${model.label}: ${extracted.reasoning.length} chars`);
            }
            content = extracted.content;
            console.log(`[AI-Hybrid] Success with ${model.label}`);
            break;
          } catch (err) {
            lastError = `${model.label}: ${err instanceof Error ? err.message : 'unknown'}`;
            continue;
          }
        }
      }
    }

    // ── Phase 3: Direct Anthropic API (claude-sonnet-4-5 with extended thinking) ───────────────────
    if (!content) {
      const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
      if (ANTHROPIC_API_KEY) {
        try {
          console.log('[AI-Hybrid] Trying direct Anthropic claude-sonnet-4-5 (extended thinking)...');
          const controller = new AbortController();
          // 30s for Anthropic (Phase 3 fallback, budget already tight by this point)
          const timeoutId = setTimeout(() => controller.abort(), 30000);
          // Anthropic uses a slightly different messages format (no system in messages array)
          const systemMsg = aiMessages.find(m => m.role === 'system')?.content || '';
          const userMsgs = aiMessages.filter(m => m.role !== 'system');
          const resp = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'x-api-key': ANTHROPIC_API_KEY,
              'anthropic-version': '2025-02-19',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'claude-sonnet-4-5',
              max_tokens: navPageGen ? 10000 : 32000,
              // Extended thinking disabled for navPageGen (speed matters more than reasoning quality)
              ...(navPageGen ? {} : {
                thinking: {
                  type: 'enabled',
                  budget_tokens: 10000,
                },
              }),
              system: systemMsg,
              messages: userMsgs,
            }),
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          if (resp.ok) {
            const data = await resp.json();
            // Extended thinking returns multiple content blocks (thinking + text).
            // Find the text block explicitly so we never accidentally return raw thinking tokens.
            const textBlock = (data.content as Array<{ type: string; text?: string; thinking?: string }> | undefined)
              ?.find(b => b.type === 'text');
            // Capture native Anthropic thinking blocks
            const thinkingBlocks = (data.content as Array<{ type: string; thinking?: string }> | undefined)
              ?.filter(b => b.type === 'thinking')
              .map(b => b.thinking || '')
              .filter(Boolean);
            const parsed = textBlock?.text || data.content?.[0]?.text || '';
            if (parsed) {
              if (thinkingBlocks?.length) {
                // Prefer native Anthropic thinking blocks
                capture.reasoning = thinkingBlocks.join('\n\n');
                console.log(`[AI-Hybrid] Native extended thinking captured from Anthropic: ${capture.reasoning.length} chars`);
                content = parsed;
              } else {
                // Fall back to tag extraction (in case model used <thinking> tags inline)
                const extracted = extractThinkingTags(parsed);
                if (extracted.reasoning) {
                  capture.reasoning = extracted.reasoning;
                  console.log(`[AI-Hybrid] Thinking tags extracted from Anthropic response: ${extracted.reasoning.length} chars`);
                }
                content = extracted.content;
              }
              console.log('[AI-Hybrid] Success with Anthropic claude-sonnet-4-5');
            } else {
              lastError = 'Anthropic: no content';
            }
          } else {
            const errText = await resp.text();
            lastError = `Anthropic: ${resp.status} ${errText.substring(0, 100)}`;
          }
        } catch (err) {
          lastError = `Anthropic: ${err instanceof Error ? err.message : 'unknown'}`;
        }
      }
    }

    if (!content) {
      throw new Error(`All AI providers failed. Last error: ${lastError}. Please ensure at least one of LOVABLE_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY is set in your Supabase secrets.`);
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
        // Claude extended thinking text (only present when direct Anthropic API with thinking enabled was used)
        thinking: capture.reasoning ? capture.reasoning.substring(0, 12000) : undefined,
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
    
    if (message.includes('All AI providers failed') || message.includes('All AI models failed')) {
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
