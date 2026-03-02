/**
 * Features & Content Section Elements — AI Site Elements Library
 *
 * Feature grids, about sections, stats strips, service cards, team sections.
 * These are the "meat" sections that communicate value.
 */

import type { SiteElement } from '../types';

export const featuresElements: SiteElement[] = [
  // ========================================================================
  // FEATURES GRID — 3 COLUMN (most common)
  // ========================================================================
  {
    id: 'features-grid-3',
    name: '3-Column Feature Grid',
    description: 'Three feature cards with icon + title + description. The most ubiquitous content section on the web.',
    category: 'features',
    subCategory: 'grid',
    industryAffinity: ['universal', 'saas', 'agency', 'coaching'],
    contentSlots: [
      { name: 'section_eyebrow', type: 'badge', required: false, description: 'Eyebrow text above section title', example: 'Why Choose Us' },
      { name: 'section_title', type: 'heading', required: true, description: 'H2 section heading', example: 'Everything You Need to Succeed', charRange: { min: 15, max: 60 } },
      { name: 'section_subtitle', type: 'paragraph', required: false, description: 'Supporting text below heading', charRange: { min: 30, max: 120 } },
      { name: 'feature_cards', type: 'list', required: true, description: '3-6 feature cards, each with icon + title + description' },
    ],
    variations: [
      {
        id: 'features-grid-icon-top',
        name: 'Icon Top Cards',
        description: 'Cards with icon above title — clean and scannable',
        layout: 'grid-3',
        style: 'minimal',
        cssHints: [
          'py-20 md:py-28',
          'grid md:grid-cols-2 lg:grid-cols-3 gap-8',
          'card: p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-all',
          'icon: w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4',
        ],
        skeleton: `<section class="py-20 md:py-28 bg-background">
  <div class="max-w-6xl mx-auto px-4">
    <div class="text-center mb-16">
      <span class="text-primary text-sm font-semibold uppercase tracking-wider"><!-- EYEBROW --></span>
      <h2 class="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4"><!-- TITLE --></h2>
      <p class="text-lg text-muted-foreground max-w-2xl mx-auto"><!-- SUBTITLE --></p>
    </div>
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      <!-- REPEAT 3-6x -->
      <div class="p-6 rounded-xl bg-card border border-border hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
        <div class="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4"><!-- ICON --></div>
        <h3 class="text-xl font-semibold text-foreground mb-2"><!-- FEATURE TITLE --></h3>
        <p class="text-muted-foreground leading-relaxed"><!-- FEATURE DESC --></p>
      </div>
    </div>
  </div>
</section>`,
        bestFor: ['SaaS', 'Any product/service', 'Most versatile layout'],
        popularity: 95,
      },
      {
        id: 'features-grid-large-icon',
        name: 'Large Icon Centered',
        description: 'Centered cards with large icons and prominent titles',
        layout: 'grid-3',
        style: 'bold',
        cssHints: [
          'text-center per card',
          'icon: w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10',
        ],
        skeleton: `<section class="py-20 md:py-28 bg-muted/30">
  <div class="max-w-6xl mx-auto px-4">
    <div class="text-center mb-16">
      <h2 class="text-3xl md:text-4xl font-bold text-foreground mb-4"><!-- TITLE --></h2>
      <p class="text-lg text-muted-foreground max-w-2xl mx-auto"><!-- SUBTITLE --></p>
    </div>
    <div class="grid md:grid-cols-3 gap-10">
      <div class="text-center p-8">
        <div class="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"><!-- ICON --></div>
        <h3 class="text-xl font-bold text-foreground mb-3"><!-- FEATURE TITLE --></h3>
        <p class="text-muted-foreground"><!-- FEATURE DESC --></p>
      </div>
    </div>
  </div>
</section>`,
        bestFor: ['Simple value propositions', 'Service overviews'],
        popularity: 75,
      },
    ],
    conversion: {
      goal: 'Communicate key value propositions and benefits',
      placementTips: [
        'Place directly after the hero section',
        'Use 3 cards for simplicity, 6 for comprehensive features',
        'Alternate background colors between sections (bg-background / bg-muted/30)',
      ],
      copyGuidelines: [
        'Feature titles: 2-4 words, benefit-oriented',
        'Feature descriptions: 1-2 sentences, concrete not abstract',
        'Use varied icons — avoid all being the same type',
        'Section title: Question or statement format',
      ],
      abInsights: [
        '3 features outperform 4 for scannability',
        'Icon + title + description converts better than icon + paragraph only',
        'Cards with borders outperform flat cards by 11%',
      ],
    },
    a11y: {
      ariaRequirements: ['H2 for section title', 'H3 for card titles', 'Decorative icons should have aria-hidden="true"'],
    },
    seo: {
      semanticElements: ['<section>', '<h2>', '<h3>'],
    },
    responsive: {
      mobile: '1 column stack',
      tablet: '2 column grid',
      desktop: '3 column grid',
    },
    tags: ['features', 'grid', 'cards', 'benefits', 'value-proposition', 'icons'],
    frequencyScore: 95,
  },

  // ========================================================================
  // STATS / METRICS STRIP
  // ========================================================================
  {
    id: 'stats-strip',
    name: 'Stats / Metrics Strip',
    description: 'Horizontal row of 3-4 key metrics with animated counters. Builds credibility through numbers.',
    category: 'features',
    subCategory: 'stats',
    industryAffinity: ['universal', 'saas', 'agency', 'nonprofit', 'coaching'],
    contentSlots: [
      { name: 'stat_items', type: 'list', required: true, description: '3-4 stat items with number + label', example: '10K+ Customers | 99.9% Uptime | 50+ Countries | 4.9★ Rating' },
    ],
    variations: [
      {
        id: 'stats-inline',
        name: 'Inline Grid',
        description: 'Clean inline grid with large numbers and small labels',
        layout: 'grid-4',
        style: 'minimal',
        cssHints: [
          'py-16 bg-muted/30 border-y border-border',
          'grid grid-cols-2 md:grid-cols-4 gap-8',
          'number: text-4xl font-bold text-primary',
          'label: text-sm text-muted-foreground uppercase tracking-wider',
        ],
        skeleton: `<section class="py-16 bg-muted/30 border-y border-border">
  <div class="max-w-6xl mx-auto px-4">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
      <div>
        <div class="text-4xl md:text-5xl font-bold text-primary mb-2" data-counter data-target="10000">0</div>
        <div class="text-sm text-muted-foreground uppercase tracking-wider">Happy Customers</div>
      </div>
      <!-- REPEAT 3-4x -->
    </div>
  </div>
</section>`,
        bestFor: ['Between sections', 'Below hero', 'Social proof reinforcement'],
        popularity: 85,
      },
      {
        id: 'stats-dark-bg',
        name: 'Dark Background Strip',
        description: 'Stats on a dark contrasting background for visual separation',
        layout: 'grid-4',
        style: 'dark-luxury',
        cssHints: [
          'py-16 bg-gray-950 text-white',
          'divider between stats: border-l border-gray-800',
        ],
        skeleton: `<section class="py-16 bg-gray-950">
  <div class="max-w-6xl mx-auto px-4">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
      <div class="md:border-r md:border-gray-800 last:border-0">
        <div class="text-4xl md:text-5xl font-bold text-white mb-2" data-counter data-target="10000">0</div>
        <div class="text-sm text-gray-400 uppercase tracking-wider">Happy Customers</div>
      </div>
    </div>
  </div>
</section>`,
        bestFor: ['Creating visual contrast', 'Premium feel', 'Separating content blocks'],
        popularity: 70,
      },
    ],
    conversion: {
      goal: 'Build trust through concrete numbers',
      placementTips: [
        'Place between hero and features, or between features and testimonials',
        'Keep to 3-4 stats maximum',
        'Use animated counters for engagement',
      ],
      copyGuidelines: [
        'Use round impressive numbers with K+ or M+ suffixes',
        'Labels: 2-3 words, lowercase or uppercase',
        'Include diverse metric types (customers, uptime, countries, rating)',
      ],
      abInsights: [
        'Animated counters increase time-on-page by 15%',
        '4 stats outperform 3 for credibility, but 5+ cause cognitive overload',
        'Dark-background stats create effective "section breaks"',
      ],
    },
    a11y: {
      ariaRequirements: ['aria-label on counter elements with final value', 'Ensure counters show final value if JS fails'],
    },
    responsive: {
      mobile: '2 columns (2x2 grid)',
      desktop: '4 columns inline',
    },
    tags: ['stats', 'metrics', 'numbers', 'counter', 'social-proof', 'credibility'],
    frequencyScore: 80,
  },

  // ========================================================================
  // SERVICE CARDS
  // ========================================================================
  {
    id: 'service-cards',
    name: 'Service Cards Section',
    description: 'Grid of detailed service offering cards with pricing, duration, and CTA. Critical for service businesses.',
    category: 'features',
    subCategory: 'services',
    industryAffinity: ['salon', 'local-service', 'coaching', 'agency', 'healthcare', 'fitness'],
    contentSlots: [
      { name: 'section_title', type: 'heading', required: true, description: 'Section heading', example: 'Our Services' },
      { name: 'category_filters', type: 'list', required: false, description: 'Filter pills for service categories', example: 'All | Haircuts | Color | Treatments' },
      { name: 'service_cards', type: 'list', required: true, description: 'Service cards with name, price, duration, description, CTA' },
    ],
    variations: [
      {
        id: 'service-cards-premium',
        name: 'Premium Service Cards',
        description: 'Rich cards with price badge, metadata row, and booking CTA',
        layout: 'grid-3',
        style: 'dark-luxury',
        cssHints: [
          'bg-gray-900 rounded-2xl p-8',
          'border border-gray-800 hover:border-primary/50',
          'price: text-2xl font-bold text-primary absolute top-6 right-6',
          'badge: bg-primary/20 text-primary text-xs px-3 py-1 rounded-full',
          'metadata: flex gap-4 text-sm text-gray-500',
        ],
        skeleton: `<section class="py-20 md:py-28 bg-gray-950">
  <div class="max-w-6xl mx-auto px-4">
    <div class="text-center mb-12">
      <span class="text-primary text-sm font-semibold uppercase tracking-wider">What We Offer</span>
      <h2 class="text-3xl md:text-4xl font-bold text-white mt-2 mb-4"><!-- TITLE --></h2>
    </div>
    <div class="flex flex-wrap justify-center gap-3 mb-12">
      <!-- CATEGORY PILLS -->
      <button class="px-5 py-2 rounded-full bg-primary text-white text-sm font-medium" data-no-intent>All</button>
      <button class="px-5 py-2 rounded-full bg-white/10 text-gray-300 text-sm hover:bg-white/20" data-no-intent>Category</button>
    </div>
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="relative bg-gray-900 rounded-2xl p-8 border border-gray-800 hover:border-primary/50 hover:-translate-y-1 transition-all duration-300">
        <span class="absolute top-6 right-6 text-2xl font-bold text-primary">$99</span>
        <span class="inline-flex px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium mb-4">Popular</span>
        <h3 class="text-xl font-bold text-white mb-2"><!-- SERVICE NAME --></h3>
        <p class="text-gray-400 mb-4"><!-- SERVICE DESC --></p>
        <div class="flex items-center gap-4 text-sm text-gray-500 mb-6">
          <span>⏱ 60 min</span>
          <span>✨ Premium</span>
        </div>
        <button class="w-full py-3 bg-primary/10 text-primary rounded-xl font-semibold hover:bg-primary hover:text-white transition-all" data-ut-intent="booking.create">Book Now</button>
      </div>
    </div>
  </div>
</section>`,
        bestFor: ['Salons', 'Spas', 'Consulting', 'Any service business'],
        popularity: 80,
      },
    ],
    conversion: {
      goal: 'Drive service bookings',
      recommendedIntent: 'booking.create',
      placementTips: [
        'Place after hero or after about section',
        'Most popular service should be visually highlighted',
        'Each card should have its own CTA',
      ],
      copyGuidelines: [
        'Include price AND duration — users need both to decide',
        'Use "Book Now" or "Schedule" CTAs — not "Learn More"',
        'Highlight most popular/recommended service with a badge',
      ],
    },
    a11y: {
      ariaRequirements: ['Each card is a self-contained unit', 'Price info accessible to screen readers'],
    },
    responsive: {
      mobile: '1 column stack',
      tablet: '2 columns',
      desktop: '3 columns',
    },
    tags: ['services', 'cards', 'pricing', 'booking', 'grid', 'filter'],
    frequencyScore: 80,
  },
];
