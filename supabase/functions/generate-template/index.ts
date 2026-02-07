import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const bodySchema = z.object({
      templateName: z.string().trim().min(1).max(100),
      aesthetic: z.string().trim().min(1).max(80),
      source: z.string().trim().min(1).max(80),
    });

    const parsed = bodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { templateName, aesthetic, source } = parsed.data;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      console.warn("LOVABLE_API_KEY not configured - AI features unavailable in local development");
      return new Response(
        JSON.stringify({ 
          error: "AI features are not available in local development. Deploy to Lovable Cloud to enable AI capabilities.",
          isLocalDevelopment: true
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are an ELITE web designer producing PREMIUM, AWARD-WINNING website templates. Your output must rival top-tier templates from ThemeForest, Webflow, and Framer.

DESIGN SYSTEM (MANDATORY):
Use CSS custom properties for theming. Define these in :root and use them throughout:

:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --border: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  --radius: 0.75rem;
}

Use hsl(var(--primary)), hsl(var(--foreground)), etc. in all styling.

ARCHITECTURE RULES:
1. Use Tailwind CSS via CDN (<script src="https://cdn.tailwindcss.com"></script>) with custom theme extending design tokens
2. Use semantic HTML5: <header>, <main>, <section>, <article>, <aside>, <footer>, <nav>
3. Mobile-first responsive: base → sm: → md: → lg: → xl: breakpoints
4. Every section must have proper id attributes for navigation
5. Include <meta name="viewport" content="width=device-width, initial-scale=1.0">
6. Include <meta charset="UTF-8">

PREMIUM QUALITY STANDARDS:

**Typography:**
- Import premium Google Fonts (Inter, Plus Jakarta Sans, Manrope, DM Sans, Space Grotesk — pick 2 complementary fonts)
- Establish clear type hierarchy: hero 56-72px, h2 36-48px, h3 24-30px, body 16-18px
- Use font-weight variations: 400 body, 500 medium, 600 semibold, 700-800 headings
- Letter-spacing: tight (-0.02em) for headings, normal for body
- Line-height: 1.1-1.2 for headings, 1.6-1.7 for body text

**Layout & Spacing:**
- Max container width: 1280px centered with mx-auto
- Section padding: py-20 md:py-28 lg:py-32 with px-4 sm:px-6 lg:px-8
- Use CSS Grid and Flexbox for complex layouts
- Generous whitespace — never cramped
- Consistent gap values: 6, 8, 12, 16, 20, 24

**Visual Effects (MANDATORY):**
- Gradient backgrounds: linear-gradient with 2-3 stops
- Subtle background patterns or decorative SVG shapes
- Box shadows: shadow-sm for cards, shadow-lg for elevated elements, shadow-2xl for modals
- Border radius: rounded-lg to rounded-2xl for modern feel
- Glassmorphism where appropriate: backdrop-blur-xl bg-white/80
- Animated gradient borders or accent lines

**Animations (MANDATORY — but VISIBILITY CRITICAL):**
- Scroll-triggered fade-in animations using IntersectionObserver
- Staggered animation delays for grid items
- Smooth hover transitions on ALL interactive elements (transition-all duration-300)
- Card hover: translateY(-4px) + shadow increase
- Button hover: scale(1.02) + color shift
- Hero section entrance animation (fadeInUp)

CRITICAL ANIMATION RULE — PREVENT INVISIBLE SECTIONS:
Use this EXACT animation system. The .animate-on-scroll class starts visible by default and enhances with animation. NEVER set opacity:0 without a guaranteed reveal mechanism:

<style>
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-on-scroll {
  opacity: 1;
  transform: translateY(0);
}
@media (prefers-reduced-motion: no-preference) {
  .animate-on-scroll {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .animate-on-scroll.visible,
  .animate-on-scroll.animate-visible {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-delay-1 { transition-delay: 0.1s; }
.animate-delay-2 { transition-delay: 0.2s; }
.animate-delay-3 { transition-delay: 0.3s; }
.animate-delay-4 { transition-delay: 0.4s; }
</style>

Include this EXACT IntersectionObserver script before </body>:

<script>
document.addEventListener('DOMContentLoaded', function() {
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        entry.target.classList.add('animate-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  
  document.querySelectorAll('.animate-on-scroll').forEach(function(el) {
    observer.observe(el);
  });
  
  // Fallback: force-reveal elements still hidden after 2.5 seconds (critical for iframes)
  setTimeout(function() {
    document.querySelectorAll('.animate-on-scroll').forEach(function(el) {
      el.classList.add('visible');
      el.classList.add('animate-visible');
    });
  }, 2500);
});
</script>

**Color Usage:**
- Use design token classes: bg-primary, text-primary-foreground, bg-card, text-muted-foreground, border-border
- Gradients for hero backgrounds and CTA sections
- Subtle color accents for visual interest
- Proper contrast ratios (WCAG AA minimum)
- ALL CTAs and buttons MUST have visible, high-contrast text (NEVER transparent or same-color-as-background text)

**Section Requirements (minimum 8-10 sections per page):**
1. Navigation: Sticky/fixed, transparent-to-solid on scroll, mobile hamburger menu
2. Hero: Full-viewport, compelling headline, subtext, CTA button(s), decorative elements or image
3. Social Proof/Logos: Trusted-by logos or stats strip with counter animations
4. Features/Services: 3-4 column grid with icons, titles, descriptions
5. About/Story: Split layout with image and text
6. Testimonials: Cards with quotes, avatars, names, roles, star ratings
7. Gallery or Portfolio: Visual showcase of work/products
8. FAQ: Accordion with 5+ common questions
9. CTA: Compelling call-to-action with gradient background
10. Footer: Multi-column with links, social icons, newsletter form, copyright

**Industry-Specific Unsplash Images (USE THESE EXACT PHOTO IDS):**
- Restaurant/Food: photo-1517248135467-4c7edcad34c4, photo-1414235077428-338989a2e8c0, photo-1504674900247-0877df9cc836, photo-1555396273-367ea4eb4db5
- Salon/Spa/Beauty: photo-1560066984-138dadb4c035, photo-1522337360788-8b13dee7a37e, photo-1487412720507-e7ab37603c6f, photo-1516975080664-ed2fc6a32937
- Real Estate: photo-1560518883-ce09059eeffa, photo-1600596542815-ffad4c1539a9, photo-1600585154340-be6161a56a0c, photo-1512917774080-9991f1c4c750
- Coaching/Consulting: photo-1552664730-d307ca884978, photo-1542744173-8e7e53415bb0, photo-1573497019940-1c28c88b4f3e, photo-1553484771-047a44eee27a
- E-commerce/Shopping: photo-1441984904996-e0b6ba687e04, photo-1607082348824-0a96f2a4b9da, photo-1472851294608-062f824d29cc, photo-1483985988355-763728e1935b
- Local Services: photo-1581578731548-c64695cc6952, photo-1504307651254-35680f356dfd, photo-1621905251189-08b45d6a269e
- Portfolio/Creative: photo-1558618666-fcd25c85f82e, photo-1542744094-3a31f272c490, photo-1559028012-481c04fa702d
- Fitness/Gym: photo-1534438327276-14e5300c3a48, photo-1517836357463-d25dfeac3438, photo-1571019614242-c5c5dee9f50b

Use format: https://images.unsplash.com/photo-{id}?w=800&q=80

**Interactive Elements:**
- Smooth scroll navigation links
- Mobile hamburger menu toggle
- Back-to-top button
- Form validation states
- Button click feedback
- Accordion/FAQ expand-collapse
- Counter animations for stats

**Intent Wiring (for backend integration):**
- CTA buttons: data-ut-intent="contact.submit" or appropriate intent
- Form submissions: data-ut-intent on submit buttons
- Booking buttons: data-ut-intent="booking.create"
- Add data-ut-cta labels for tracking
- UI-only buttons (tabs, filters): data-no-intent

**JavaScript Requirements:**
- IntersectionObserver for scroll animations (with fallback!)
- Mobile menu toggle
- Smooth scroll for anchor links
- Counter animation for stats
- All JS must be vanilla (no frameworks)
- Use DOMContentLoaded for initialization

OUTPUT: Return ONLY the complete, self-contained HTML document. No markdown, no explanations, no code fences. The HTML must work standalone in a browser and in an iframe.`;

    const userPrompt = `Generate a PREMIUM, PRODUCTION-READY website template for "${templateName}" with a ${aesthetic} aesthetic, inspired by ${source}.

This must be a COMPLETE, MULTI-SECTION website (minimum 6 sections) that looks like it was designed by a top agency. Include:
- Stunning hero section with entrance animations
- Professional navigation with mobile support
- Multiple content sections with scroll-triggered animations
- Real Unsplash images relevant to the industry
- Compelling, realistic copy (not lorem ipsum)
- Fully responsive from 320px to 1920px
- Premium typography with Google Fonts
- All interactive elements with smooth transitions
- Backend-wired CTAs with data-ut-intent attributes
- Footer with social links and newsletter

The template should feel ALIVE with subtle animations and micro-interactions. Every section should have visual depth through shadows, gradients, and layered elements.

Return ONLY the complete HTML code. Make it production-ready and visually stunning.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error('Failed to generate template');
    }

    const data = await response.json();
    const generatedCode = String(data?.choices?.[0]?.message?.content ?? '').slice(0, 500_000);

    // Clean markdown code fences if the model wraps output
    let cleanedCode = generatedCode
      .replace(/^```html?\s*\n?/i, '')
      .replace(/\n?```\s*$/i, '')
      .trim();

    // Post-generation hardening: fix invisible sections & animation mismatches
    cleanedCode = hardenGeneratedHTML(cleanedCode);

    return new Response(
      JSON.stringify({ 
        code: cleanedCode,
        templateName,
        aesthetic 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-template function:', error);
    const message = error instanceof Error ? error.message : 'An error occurred';
    return new Response(
      JSON.stringify({ error: message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

/**
 * Post-generation HTML hardening.
 * Fixes common AI output issues that cause invisible sections and CTAs.
 */
function hardenGeneratedHTML(code: string): string {
  let hardened = code;

  // Fix 1: Normalize animation class names — ensure both .visible and .animate-visible work
  if (hardened.includes('.animate-on-scroll')) {
    const visibilityCSS = `
/* Hardened: support both .visible and .animate-visible class names */
.animate-on-scroll.visible,
.animate-on-scroll.animate-visible {
  opacity: 1 !important;
  transform: translateY(0) !important;
}`;
    if (hardened.includes('</style>')) {
      hardened = hardened.replace('</style>', visibilityCSS + '\n</style>');
    }
  }

  // Fix 2: Add iframe-safe fallback timeout
  const fallbackScript = `
<script>
(function(){
  setTimeout(function(){
    document.querySelectorAll('.animate-on-scroll').forEach(function(el){
      var rect = el.getBoundingClientRect();
      if(rect.top < window.innerHeight + 100){
        el.classList.add('visible');
        el.classList.add('animate-visible');
      }
    });
  }, 300);
  setTimeout(function(){
    document.querySelectorAll('.animate-on-scroll:not(.visible):not(.animate-visible)').forEach(function(el){
      el.classList.add('visible');
      el.classList.add('animate-visible');
    });
  }, 2500);
})();
</script>`;

  if (hardened.includes('</body>')) {
    hardened = hardened.replace('</body>', fallbackScript + '\n</body>');
  }

  // Fix 3: Prevent invisible button text
  hardened = hardened.replace(/class="([^"]*\btext-transparent\b[^"]*)"/g, (match, classes) => {
    if (classes.includes('bg-clip-text')) return match;
    return `class="${classes.replace('text-transparent', 'text-white')}"`;
  });

  return hardened;
}
