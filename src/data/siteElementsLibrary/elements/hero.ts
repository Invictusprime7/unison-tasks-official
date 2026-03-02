/**
 * Hero Section Elements — AI Site Elements Library
 *
 * The hero is the most critical above-the-fold element.
 * Patterns from thousands of high-converting landing pages.
 */

import type { SiteElement } from '../types';

export const heroElements: SiteElement[] = [
  // ========================================================================
  // HERO — CENTERED TEXT
  // ========================================================================
  {
    id: 'hero-centered',
    name: 'Centered Hero',
    description: 'Full-width centered headline + subheadline + dual CTAs. The most common hero pattern across all industries.',
    category: 'hero',
    subCategory: 'centered',
    industryAffinity: ['universal', 'saas', 'agency', 'coaching'],
    contentSlots: [
      { name: 'eyebrow', type: 'badge', required: false, description: 'Small badge/pill above headline', example: '✨ Now in Beta', charRange: { min: 5, max: 30 } },
      { name: 'headline', type: 'heading', required: true, description: 'Primary H1 headline — the most important text on the page', example: 'Build Websites That Convert', charRange: { min: 20, max: 80 } },
      { name: 'subheadline', type: 'paragraph', required: true, description: 'Supporting text below headline', example: 'Create stunning, high-converting websites in minutes with our AI-powered builder.', charRange: { min: 40, max: 160 } },
      { name: 'cta_primary', type: 'button', required: true, description: 'Primary CTA button', example: 'Get Started Free' },
      { name: 'cta_secondary', type: 'button', required: false, description: 'Secondary/ghost CTA', example: 'Watch Demo' },
      { name: 'social_proof', type: 'text', required: false, description: 'Trust signal below CTAs', example: '★★★★★ Trusted by 10,000+ businesses' },
      { name: 'hero_image', type: 'image', required: false, description: 'Product screenshot or illustration below text' },
    ],
    variations: [
      {
        id: 'hero-centered-gradient',
        name: 'Gradient Background',
        description: 'Centered text over a gradient background with floating accent elements',
        layout: 'full-width',
        style: 'bold',
        cssHints: [
          'min-h-screen flex items-center justify-center',
          'bg-gradient-to-br from-background via-primary/5 to-background',
          'relative overflow-hidden',
          'decorative blur orbs: absolute w-96 h-96 rounded-full bg-primary/10 blur-3xl',
        ],
        skeleton: `<section class="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-primary/5 to-background">
  <div class="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
  <div class="absolute bottom-20 right-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl"></div>
  <div class="relative z-10 max-w-4xl mx-auto px-4 text-center">
    <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"><!-- EYEBROW --></div>
    <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6"><!-- HEADLINE --></h1>
    <p class="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"><!-- SUBHEADLINE --></p>
    <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
      <a class="px-8 py-4 bg-primary text-primary-foreground rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all" data-ut-intent="booking.create" data-ut-cta="cta.hero" data-ut-label="Get Started"><!-- PRIMARY CTA --></a>
      <a class="px-8 py-4 border-2 border-border text-foreground rounded-full text-lg font-semibold hover:bg-muted transition-all" data-ut-intent="nav.anchor" data-ut-anchor="features" data-ut-cta="cta.hero-secondary" data-ut-label="Learn More"><!-- SECONDARY CTA --></a>
    </div>
    <p class="text-sm text-muted-foreground"><!-- SOCIAL PROOF --></p>
  </div>
</section>`,
        bestFor: ['SaaS landing pages', 'Tech products', 'Startups'],
        popularity: 90,
      },
      {
        id: 'hero-centered-dark',
        name: 'Dark Luxury',
        description: 'Dark background with gradient text, blur orbs, and premium feel',
        layout: 'full-width',
        style: 'dark-luxury',
        cssHints: [
          'min-h-screen bg-gray-950',
          'relative overflow-hidden',
          'bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950',
          'h1: bg-clip-text text-transparent bg-gradient-to-r from-white via-primary to-white',
        ],
        skeleton: `<section class="relative min-h-screen flex items-center justify-center bg-gray-950 overflow-hidden">
  <div class="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent"></div>
  <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
  <div class="relative z-10 max-w-4xl mx-auto px-4 text-center">
    <div class="inline-flex px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-sm text-gray-300 mb-8"><!-- EYEBROW --></div>
    <h1 class="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
      <span class="bg-clip-text text-transparent bg-gradient-to-r from-white via-primary to-white"><!-- HEADLINE --></span>
    </h1>
    <p class="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10"><!-- SUBHEADLINE --></p>
    <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
      <a class="px-8 py-4 bg-primary text-primary-foreground rounded-full text-lg font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all" data-ut-intent="booking.create" data-ut-cta="cta.hero" data-ut-label="Get Started"><!-- PRIMARY CTA --></a>
      <a class="px-8 py-4 border border-white/20 text-white rounded-full text-lg font-semibold hover:bg-white/5 transition-all" data-ut-intent="nav.anchor" data-ut-anchor="features" data-ut-cta="cta.hero-secondary" data-ut-label="Learn More"><!-- SECONDARY CTA --></a>
    </div>
  </div>
</section>`,
        bestFor: ['Premium services', 'Agencies', 'Tech products', 'Portfolio'],
        popularity: 80,
      },
    ],
    conversion: {
      goal: 'Capture attention and drive primary action within 3 seconds',
      recommendedIntent: 'contact.submit',
      placementTips: [
        'Always the first section below the navbar',
        'CTA must be above the fold on all devices',
        'Keep headline under 10 words for max impact',
      ],
      copyGuidelines: [
        'Headline: Benefit-driven, not feature-driven ("Save 10 hours/week" not "AI-powered scheduling")',
        'Subheadline: Elaborate on HOW, address objections',
        'Primary CTA: Action verb + value ("Start Free Trial", "Book a Demo")',
        'Secondary CTA: Lower commitment ("Learn More", "Watch Video")',
      ],
      abInsights: [
        'Dual CTAs increase conversion 12-18% vs single CTA',
        'Social proof line below CTAs increases trust 25%',
        'Eyebrow badge increases engagement by 8%',
        'Gradient text headlines get 15% more visual attention',
      ],
      mobileNotes: [
        'Stack CTAs vertically on mobile',
        'Headline: text-3xl on mobile, text-6xl on desktop',
        'Hide decorative elements on mobile for performance',
      ],
    },
    a11y: {
      ariaRequirements: ['H1 must be the first heading on the page', 'CTA buttons must have descriptive text'],
      keyboardNav: 'Tab to CTAs, Enter to activate',
      screenReader: 'Ensure heading hierarchy is correct (H1 only once per page)',
    },
    seo: {
      semanticElements: ['<section>', '<h1>', '<p>'],
    },
    responsive: {
      mobile: 'Stack vertically, reduce font sizes, stack CTAs',
      tablet: 'Intermediate sizing, side-by-side CTAs',
      desktop: 'Full impact with large typography and decorative elements',
    },
    tags: ['hero', 'above-fold', 'cta', 'headline', 'landing-page', 'conversion'],
    frequencyScore: 95,
  },

  // ========================================================================
  // HERO — SPLIT (TEXT + IMAGE)
  // ========================================================================
  {
    id: 'hero-split',
    name: 'Split Hero',
    description: 'Two-column hero with text on one side and image/visual on the other. The second most common hero pattern.',
    category: 'hero',
    subCategory: 'split',
    industryAffinity: ['universal', 'saas', 'ecommerce', 'coaching', 'healthcare'],
    contentSlots: [
      { name: 'eyebrow', type: 'badge', required: false, description: 'Badge above headline' },
      { name: 'headline', type: 'heading', required: true, description: 'H1 headline', charRange: { min: 15, max: 60 } },
      { name: 'subheadline', type: 'paragraph', required: true, description: 'Supporting paragraph', charRange: { min: 40, max: 200 } },
      { name: 'cta_primary', type: 'button', required: true, description: 'Primary CTA' },
      { name: 'cta_secondary', type: 'button', required: false, description: 'Secondary CTA' },
      { name: 'hero_image', type: 'image', required: true, description: 'Product image, screenshot, or illustration' },
      { name: 'trust_badges', type: 'list', required: false, description: 'Trust indicators below CTAs', example: 'Company logos, ratings, certifications' },
    ],
    variations: [
      {
        id: 'hero-split-image-right',
        name: 'Image Right',
        description: 'Text left, image/visual right — the default reading-order layout',
        layout: 'split-screen',
        style: 'corporate',
        cssHints: [
          'min-h-[80vh] flex items-center',
          'grid md:grid-cols-2 gap-12 items-center',
          'image: rounded-2xl shadow-2xl',
        ],
        skeleton: `<section class="py-20 md:py-28 bg-background">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
      <div>
        <div class="inline-flex px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"><!-- EYEBROW --></div>
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight"><!-- HEADLINE --></h1>
        <p class="text-lg text-muted-foreground mb-8 leading-relaxed"><!-- SUBHEADLINE --></p>
        <div class="flex flex-wrap gap-4 mb-8">
          <a class="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold shadow-md hover:shadow-lg transition-all" data-ut-intent="booking.create" data-ut-cta="cta.hero" data-ut-label="Get Started"><!-- PRIMARY CTA --></a>
          <a class="px-6 py-3 border border-border text-foreground rounded-lg font-semibold hover:bg-muted transition-all" data-ut-intent="nav.anchor" data-ut-anchor="services" data-ut-cta="cta.hero-secondary" data-ut-label="Learn More"><!-- SECONDARY CTA --></a>
        </div>
        <div class="flex items-center gap-6 text-sm text-muted-foreground"><!-- TRUST BADGES --></div>
      </div>
      <div class="relative">
        <img class="rounded-2xl shadow-2xl w-full" src="" alt="" loading="eager" />
      </div>
    </div>
  </div>
</section>`,
        bestFor: ['SaaS', 'Product pages', 'Corporate', 'Most versatile layout'],
        popularity: 92,
      },
      {
        id: 'hero-split-image-left',
        name: 'Image Left',
        description: 'Image/visual left, text right — good for visual-first products',
        layout: 'split-screen',
        style: 'minimal',
        cssHints: ['Same structure, reversed grid order: md:order-2 on text, md:order-1 on image'],
        skeleton: `<section class="py-20 md:py-28 bg-background">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
      <div class="md:order-2"><!-- TEXT CONTENT --></div>
      <div class="md:order-1 relative">
        <img class="rounded-2xl shadow-2xl w-full" src="" alt="" loading="eager" />
      </div>
    </div>
  </div>
</section>`,
        bestFor: ['Visual products', 'Food/restaurant', 'Fashion', 'Real estate'],
        popularity: 60,
      },
    ],
    conversion: {
      goal: 'Show the product/service while driving action',
      recommendedIntent: 'contact.submit',
      placementTips: [
        'Image should show the product in use or the end result',
        'Text side follows natural reading order (left-to-right for LTR)',
        'Trust badges below CTA reinforce credibility',
      ],
      copyGuidelines: [
        'Headline: Problem → Solution framing',
        'Subheadline: 2-3 sentences max',
        'Include a specific number when possible ("Join 5,000+ teams")',
      ],
      abInsights: [
        'Image-right outperforms image-left by ~7% for LTR audiences',
        'Product screenshots convert 30% better than stock photos',
        'Trust badges below CTA increase conversion 20%',
      ],
    },
    a11y: {
      ariaRequirements: ['Descriptive alt text on hero image', 'H1 must be present'],
    },
    seo: {
      semanticElements: ['<section>', '<h1>', '<img alt="...">'],
    },
    responsive: {
      mobile: 'Stack vertically — text first, image below',
      desktop: 'Side-by-side split layout',
    },
    tags: ['hero', 'split', 'two-column', 'image', 'product-showcase'],
    frequencyScore: 90,
  },

  // ========================================================================
  // HERO — FULL-BLEED IMAGE/VIDEO BACKGROUND
  // ========================================================================
  {
    id: 'hero-fullbleed',
    name: 'Full-Bleed Background Hero',
    description: 'Full-screen hero with background image/video and text overlay. Dramatic and immersive.',
    category: 'hero',
    subCategory: 'fullbleed',
    industryAffinity: ['restaurant', 'real-estate', 'salon', 'portfolio', 'nonprofit'],
    contentSlots: [
      { name: 'background', type: 'image', required: true, description: 'Full-screen background image or video' },
      { name: 'headline', type: 'heading', required: true, description: 'H1 headline', charRange: { min: 10, max: 60 } },
      { name: 'subheadline', type: 'paragraph', required: true, description: 'Supporting text', charRange: { min: 30, max: 120 } },
      { name: 'cta_primary', type: 'button', required: true, description: 'Primary CTA' },
    ],
    variations: [
      {
        id: 'hero-fullbleed-dark-overlay',
        name: 'Dark Gradient Overlay',
        description: 'Dark gradient overlay on image for text readability — the most reliable fullbleed pattern',
        layout: 'full-width',
        style: 'dark-luxury',
        cssHints: [
          'relative min-h-screen flex items-center',
          'bg-cover bg-center bg-no-repeat',
          'overlay: absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent',
        ],
        skeleton: `<section class="relative min-h-screen flex items-center bg-cover bg-center bg-no-repeat" style="background-image: url('...')">
  <div class="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent"></div>
  <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl">
      <h1 class="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6"><!-- HEADLINE --></h1>
      <p class="text-lg md:text-xl text-gray-200 mb-8"><!-- SUBHEADLINE --></p>
      <a class="inline-flex px-8 py-4 bg-primary text-primary-foreground rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all" data-ut-intent="booking.create" data-ut-cta="cta.hero" data-ut-label="Book Now"><!-- CTA --></a>
    </div>
  </div>
</section>`,
        bestFor: ['Restaurants', 'Hotels', 'Real estate', 'Event venues', 'Nonprofits'],
        popularity: 75,
      },
    ],
    conversion: {
      goal: 'Create emotional impact and drive action',
      recommendedIntent: 'booking.create',
      placementTips: [
        'Background image must be high-quality and relevant',
        'Always use overlay for text readability',
        'Single CTA is most effective on full-bleed heroes',
      ],
      copyGuidelines: [
        'Keep text brief — the image does the heavy lifting',
        'Headline: Aspirational or emotional',
        'CTA: Specific action ("Reserve a Table", "View Properties")',
      ],
      abInsights: [
        'Gradient overlay outperforms solid overlay for conversion',
        'Left-aligned text converts better than centered on full-bleed',
        'Single focused CTA converts 15% better than dual CTAs on image backgrounds',
      ],
    },
    a11y: {
      ariaRequirements: ['aria-label on section describing the image context', 'Sufficient contrast ratio on overlay text'],
    },
    responsive: {
      mobile: 'Reduce min-height to 70vh, increase overlay opacity for readability',
      desktop: 'Full min-h-screen with large typography',
    },
    tags: ['hero', 'fullbleed', 'background-image', 'overlay', 'immersive', 'dramatic'],
    frequencyScore: 75,
  },
];
