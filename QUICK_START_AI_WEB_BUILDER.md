# 🚀 Quick Start Guide - AI Web Builder

Get started with the intelligent web builder in 5 minutes!

---

## 📦 What You Got

### ✅ Files Created

```
src/
├── types/
│   └── aiWebBuilder.ts                    # Type definitions (420 lines)
├── services/
│   └── ai/
│       ├── planLayout.ts                  # Layout engine (580 lines)
│       ├── synthesizeTheme.ts             # Theme generator (480 lines)
│       └── data/
│           ├── components.json            # 40+ components with variants
│           ├── animationPresets.json      # 20+ motion presets
│           └── templates/
│               ├── restaurant.json        # Restaurant patterns
│               ├── portfolio.json         # Portfolio patterns
│               └── campaign.json          # Campaign patterns
```

### 📚 Documentation

- `AI_WEB_BUILDER_ARCHITECTURE.md` - Complete architecture guide
- `QUICK_START_AI_WEB_BUILDER.md` - This file

---

## 🎯 Basic Usage

### Step 1: Define Your Project

```typescript
import type { AIProjectRequest } from '@/types/aiWebBuilder';

const project: AIProjectRequest = {
  brand: {
    name: "Your Brand Name",
    industry: "restaurant",  // or portfolio, saas, ecommerce, etc.
    tone: "elegant",         // minimal, luxury, energetic, playful, etc.
    palette: ["#8B4513", "#D4AF37"]  // Optional custom colors
  },
  goals: [
    "showcase signature dishes",
    "increase online reservations"
  ],
  features: ["interactive menu", "booking form"],
  animationLevel: "subtle",   // none, subtle, or immersive
  styleUniqueness: 0.7        // 0 (template) to 1 (unique)
};
```

### Step 2: Generate Layout Plan

```typescript
import { layoutPlanningService } from '@/services/ai/planLayout';

const layoutResponse = await layoutPlanningService.planLayout(project);

console.log(layoutResponse.plan.sections);
// Output: [
//   { component: 'VideoHero', variant: 'overlay', order: 0, ... },
//   { component: 'InteractiveMenu', variant: 'tabs', order: 1, ... },
//   { component: 'Gallery', variant: 'masonry', order: 2, ... },
//   { component: 'BookingForm', variant: 'inline', order: 3, ... },
//   ...
// ]

console.log(layoutResponse.reasoning);
// "Generated 6-section layout for restaurant industry..."
```

### Step 3: Synthesize Theme

```typescript
import { themeSynthesisService } from '@/services/ai/synthesizeTheme';

const themeResponse = await themeSynthesisService.synthesizeTheme(project);

console.log(themeResponse.colorPalette);
// {
//   name: 'Warm Bistro',
//   primary: '#D97706',
//   secondary: '#DC2626',
//   accent: '#F59E0B',
//   gradients: { primary: 'from-amber-600 via-amber-500 to-yellow-500' }
// }

console.log(themeResponse.typography);
// {
//   fontFamily: { heading: 'Playfair Display', body: 'Inter' },
//   scale: { xl: '1.25rem', '2xl': '1.5rem', ... }
// }
```

---

## 🏭 Industry Examples

### Restaurant

```typescript
{
  industry: "restaurant",
  tone: "elegant",
  components: ["VideoHero", "InteractiveMenu", "Gallery", "BookingForm"],
  colors: "Warm amber/red tones",
  typography: "Playfair Display + Inter"
}
```

### Portfolio

```typescript
{
  industry: "portfolio",
  tone: "minimal",
  components: ["AnimatedHero", "PortfolioGrid", "StatsCounter", "CTASection"],
  colors: "Minimal grayscale + blue accent",
  typography: "Inter + Inter"
}
```

### SaaS

```typescript
{
  industry: "saas",
  tone: "professional",
  components: ["AnimatedHero", "FeatureGrid", "PricingTable", "FAQAccordion"],
  colors: "Modern blue/violet gradients",
  typography: "Inter + Inter"
}
```

### Ad Campaign

```typescript
{
  industry: "ad_campaign",
  tone: "energetic",
  components: ["ParallaxHero", "ScrollingNarrative", "VideoEmbed", "CTASection"],
  colors: "High-energy red/orange/yellow",
  typography: "Outfit + Inter"
}
```

---

## 🎨 Component Variants

Each component has multiple variants. Check `components.json` for full specs:

### AnimatedHero Variants
- **gradient** - Animated gradient background (SaaS, tech)
- **glass** - Glassmorphism overlay (modern, portfolios)
- **text-focus** - Minimal typography (portfolios, minimal)

### PortfolioGrid Variants
- **masonry** - Pinterest-style (creative, varied)
- **bento** - Modern asymmetric (unique, modern)
- **grid** - Uniform layout (simple, clean)

### PricingTable Variants
- **cards** - Side-by-side cards (standard)
- **tabs** - Monthly/annual toggle (SaaS)
- **comparison** - Feature matrix (enterprise)

### TestimonialSlider Variants
- **cards** - Sliding cards (professional)
- **bubble** - Speech bubbles (friendly)
- **quote** - Large featured quote (minimal)

---

## 🎬 Animation System

Import presets from `animationPresets.json`:

```typescript
import animations from '@/services/ai/data/animationPresets.json';

// Entrance animations
animations.fadeUp       // Fade in from below
animations.slideLeft    // Slide in from right
animations.zoomIn       // Scale up fade in
animations.staggeredZoom // For grids (stagger children)

// Continuous animations
animations.float        // Gentle floating
animations.pulse        // Breathing scale
animations.parallax     // Scroll-based movement

// Hover animations
animations.hoverLift    // Lift on hover
animations.hoverScale   // Scale on hover
animations.hoverGlow    // Shadow glow
```

**Usage with Framer Motion:**

```tsx
import { motion } from 'framer-motion';
import animations from '@/services/ai/data/animationPresets.json';

<motion.div {...animations.fadeUp}>
  Content here
</motion.div>

<motion.button {...animations.hoverLift} {...animations.tapShrink}>
  Click me
</motion.button>
```

---

## 🎨 Color Palettes by Industry

```typescript
// Restaurant
{ primary: '#D97706', secondary: '#DC2626', accent: '#F59E0B' }  // Warm amber/red

// Portfolio
{ primary: '#111827', secondary: '#6B7280', accent: '#3B82F6' }  // Grayscale + blue

// Contracting
{ primary: '#1E40AF', secondary: '#059669', accent: '#F59E0B' }  // Blue/green/amber

// Creator
{ primary: '#8B5CF6', secondary: '#EC4899', accent: '#06B6D4' }  // Violet/pink/cyan

// Ad Campaign
{ primary: '#DC2626', secondary: '#EA580C', accent: '#FACC15' }  // Red/orange/yellow

// SaaS
{ primary: '#3B82F6', secondary: '#8B5CF6', accent: '#06B6D4' }  // Blue/violet/cyan

// Ecommerce
{ primary: '#059669', secondary: '#0891B2', accent: '#F59E0B' }  // Emerald/cyan/amber

// Agency
{ primary: '#7C3AED', secondary: '#EC4899', accent: '#14B8A6' }  // Violet/pink/teal
```

---

## 📊 Component Categories

### Navigation (4 components)
`StickyNav`, `GlassNav`, `MinimalNav`, `SidebarNav`

### Hero (6 components)
`AnimatedHero`, `VideoHero`, `HeroSplit`, `ParallaxHero`, `GlassHero`, `FullScreenHero`

### Content (6 components)
`FeatureShowcase`, `FeatureGrid`, `PortfolioGrid`, `Gallery`, `ProductCarousel`, `ScrollingNarrative`

### Interactive (5 components)
`InteractiveMenu`, `BookingForm`, `ContactForm`, `PricingTable`, `FAQAccordion`

### Stats & Social Proof (4 components)
`StatsCounter`, `TestimonialSlider`, `LogoCloud`, `SocialProof`

### Media (4 components)
`VideoEmbed`, `ImageFade`, `ImageGrid`, `MasonryGallery`

### CTA (3 components)
`CTASection`, `NewsletterSignup`, `LeadCapture`

### Footer (3 components)
`FooterColumns`, `MinimalFooter`, `SocialFooter`

**Total: 35+ components with 80+ variants!**

---

## 🔌 Integration Example

Connect to your existing AI Code Assistant:

```typescript
// In AICodeAssistant.tsx or edge function
import { layoutPlanningService } from '@/services/ai/planLayout';
import { themeSynthesisService } from '@/services/ai/synthesizeTheme';
import components from '@/services/ai/data/components.json';

async function generateWebsite(userMessage: string) {
  // 1. Parse user message → AIProjectRequest
  const project = parseMessage(userMessage);
  
  // 2. Generate layout plan
  const layout = await layoutPlanningService.planLayout(project);
  
  // 3. Synthesize theme
  const theme = await themeSynthesisService.synthesizeTheme(project);
  
  // 4. Send to AI with context
  const prompt = `
    Create a ${project.brand.industry} website with:
    
    LAYOUT:
    ${layout.plan.sections.map(s => `- ${s.component} (${s.variant})`).join('\n')}
    
    COLORS:
    Primary: ${theme.colorPalette.primary}
    Secondary: ${theme.colorPalette.secondary}
    Gradient: ${theme.colorPalette.gradients?.primary}
    
    TYPOGRAPHY:
    Heading: ${theme.typography.fontFamily.heading}
    Body: ${theme.typography.fontFamily.body}
    
    COMPONENTS:
    ${JSON.stringify(components, null, 2)}
    
    Generate production-ready React + TypeScript + Tailwind CSS code.
  `;
  
  const response = await callAI(prompt);
  return response.code;
}
```

---

## 💡 Pro Tips

### 1. **Style Uniqueness**

```typescript
styleUniqueness: 0.3  // Template-based, proven patterns
styleUniqueness: 0.7  // Unique, creative variations
styleUniqueness: 1.0  // Highly experimental, one-of-a-kind
```

### 2. **Animation Levels**

```typescript
animationLevel: "none"      // Static, fast loading
animationLevel: "subtle"    // Professional, not distracting
animationLevel: "immersive" // Bold, engaging, memorable
```

### 3. **Custom Brand Colors**

```typescript
palette: ["#FF6B6B", "#4ECDC4", "#FFE66D"]  // Overrides industry defaults
```

### 4. **Layout Preferences**

```typescript
layoutPreference: "grid"      // Classic, organized
layoutPreference: "bento"     // Modern, asymmetric
layoutPreference: "parallax"  // Immersive, storytelling
layoutPreference: "masonry"   // Creative, varied heights
```

---

## 🎯 Common Patterns

### E-commerce Store

```typescript
{
  industry: "ecommerce",
  tone: "professional",
  goals: ["increase conversions", "showcase products"],
  features: ["product grid", "reviews", "checkout"],
  animationLevel: "subtle"
}
// → FullScreenHero + ProductCarousel + Gallery + PricingTable + Reviews + Footer
```

### Creator Portfolio

```typescript
{
  industry: "creator",
  tone: "energetic",
  goals: ["grow audience", "showcase content"],
  features: ["video embed", "social proof"],
  animationLevel: "immersive"
}
// → ParallaxHero + VideoEmbed + SocialProof + Newsletter + CTASection
```

### Service Business

```typescript
{
  industry: "contracting",
  tone: "professional",
  goals: ["generate leads", "build trust"],
  features: ["project gallery", "contact form"],
  animationLevel: "subtle"
}
// → HeroSplit + StatsCounter + Gallery + Testimonials + ContactForm + Footer
```

---

## 🐛 Troubleshooting

### Layout seems repetitive?
→ Increase `styleUniqueness` to 0.7+

### Too many animations?
→ Set `animationLevel: "subtle"` or `"none"`

### Colors don't match brand?
→ Provide custom `palette: ["#color1", "#color2", "#color3"]`

### Missing component type?
→ Check `components.json` for available components and variants

### TypeScript errors?
→ Import types from `@/types/aiWebBuilder`

---

## 📚 Next Steps

1. **Explore Components** - Review `components.json` for all variants
2. **Check Templates** - See `templates/` for industry patterns
3. **Read Architecture** - Full details in `AI_WEB_BUILDER_ARCHITECTURE.md`
4. **Integrate with AI** - Connect to your edge function
5. **Build React Components** - Implement actual component code

---

## 🎉 You're Ready!

The AI Web Builder architecture is fully set up with:

✅ Comprehensive type system
✅ Intelligent layout planning
✅ Dynamic theme synthesis
✅ 40+ component library
✅ 20+ animation presets
✅ Industry templates (restaurant, portfolio, campaign)
✅ Complete documentation

Start building intelligent, beautiful, conversion-optimized websites! 🚀
