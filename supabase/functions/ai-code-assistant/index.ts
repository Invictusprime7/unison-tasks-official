import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

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
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, mode, savePattern = true, generateImage = false, imagePlacement, currentCode, editMode = false } = await req.json();
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

    // Fetch top learned patterns for context
    const { data: patterns } = await supabase
      .from('ai_code_patterns')
      .select('*')
      .order('success_rate', { ascending: false })
      .order('usage_count', { ascending: false })
      .limit(10);

    const learnedPatterns = patterns && patterns.length > 0 ? (patterns as CodePattern[]).map((p: CodePattern) => `
📚 Pattern: ${p.pattern_type.toUpperCase()}
Description: ${p.description || 'N/A'}
Used ${p.usage_count} times with ${p.success_rate}% success
Tags: ${(p.tags || []).join(', ')}
Code Example:
\`\`\`
${p.code_snippet.substring(0, 300)}${p.code_snippet.length > 300 ? '...' : ''}
\`\`\`
`).join('\n---\n') : 'No learned patterns yet - but I will learn from every successful interaction!';

    // Build edit mode context if we have current code
    const editModeContext = editMode && currentCode ? `
🔄 **EDIT MODE ACTIVE - MODIFYING EXISTING TEMPLATE**
You are editing an existing saved template. The user wants to MODIFY their existing code, NOT replace it entirely.

**CURRENT TEMPLATE CODE:**
\`\`\`html
${currentCode.substring(0, 8000)}${currentCode.length > 8000 ? '\n... (truncated for context)' : ''}
\`\`\`

⚠️ **CRITICAL EDIT MODE RULES - MUST FOLLOW:**
1. **NEVER CREATE A NEW PAGE** - You are editing the existing template above, NOT generating from scratch
2. **PRESERVE ALL EXISTING ELEMENTS** - Do NOT remove ANY sections, components, or content unless explicitly asked
3. **ONLY MODIFY WHAT'S REQUESTED** - If user says "center the hero", ONLY add centering classes to the hero section
4. **KEEP ALL OTHER SECTIONS INTACT** - Headers, footers, features, testimonials - everything stays unless removal is requested
5. **MAINTAIN existing styles** - Don't change colors, fonts, or styling unless specifically asked
6. **PRESERVE existing JavaScript** - Don't remove any working functionality
7. **OUTPUT THE FULL MODIFIED CODE** - Return the COMPLETE template with the requested changes applied
8. **If user asks for a "new page" or "start fresh"** - ONLY THEN generate fresh code

🚫 **COMMON MISTAKES TO AVOID:**
- DON'T replace the entire page when asked to reposition one element
- DON'T remove sections that weren't mentioned in the request
- DON'T simplify or reduce the template - keep ALL content
- DON'T change element content unless asked (keep all text, images, links)

📐 **POSITIONING & LAYOUT COMMANDS:**
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
      code: `You are an ELITE "Super Web Builder Expert" AI - a continuously learning, production-grade code generator specializing in VANILLA JAVASCRIPT, HTML5, and modern CSS.
${editModeContext}
🧠 **CONTINUOUS LEARNING SYSTEM:**
You actively learn from successful code patterns and build upon proven solutions. Your knowledge base grows with each interaction, making you increasingly capable of creating robust, dynamic webpages.

**CURRENT LEARNED PATTERNS:**
${learnedPatterns}

🎯 **YOUR EVOLVING EXPERTISE:**
- **VANILLA JAVASCRIPT (Primary)** - Pure ES6+, no frameworks required
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

3. **SCROLL-TRIGGERED ANIMATIONS:**
   \`\`\`javascript
   // Intersection Observer for scroll animations
   const observeElements = () => {
     const observer = new IntersectionObserver((entries) => {
       entries.forEach(entry => {
         if (entry.isIntersecting) {
           entry.target.classList.add('animate-visible');
         }
       });
     }, { threshold: 0.1 });
     
     document.querySelectorAll('.animate-on-scroll').forEach(el => {
       observer.observe(el);
     });
   };
   
   // CSS for scroll animations
   // .animate-on-scroll { opacity: 0; transform: translateY(30px); transition: all 0.6s ease; }
   // .animate-on-scroll.animate-visible { opacity: 1; transform: translateY(0); }
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

Learn from every review to provide increasingly valuable insights!`
    };

    const systemPrompt = systemPrompts[mode as keyof typeof systemPrompts] || systemPrompts.code;

    // Check if user wants to generate an image
    const userPrompt = messages[messages.length - 1]?.content?.toLowerCase() || '';
    const imageKeywords = ['generate image', 'create image', 'add image', 'brand logo', 'logo', 'add photo', 'insert image', 'place image'];
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
      const imageStyle = isLogo ? 'logo' : 'digital-art';
      
      try {
        // Call image generation
        const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash-image-preview',
            messages: [{
              role: 'user',
              content: `${imageDescription}, ${isLogo ? 'clean professional logo design, minimal, vector style, transparent background' : 'high quality digital art'}`
            }],
            modalities: ['image', 'text']
          }),
        });
        
        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
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
        }
      } catch (imageError) {
        console.error('[AI-Code-Assistant] Image generation failed:', imageError);
      }
    }

    const body: Record<string, unknown> = {
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt + (generatedImageUrl ? `

**IMPORTANT: An AI-generated image has been created for this request. Include this image HTML in your response at the appropriate location:**
${imageHtml}

The image is already styled for the "${imagePlacement || 'top-left'}" position. Make sure to include it in a relative-positioned container.` : '') },
        ...messages
      ],
    };

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Save learning session (async, don't wait)
    const originalUserPrompt = messages[messages.length - 1]?.content || '';
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
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
