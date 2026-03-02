/**
 * Social Proof Elements — AI Site Elements Library
 *
 * Testimonials, reviews, logo strips, case studies.
 * The primary trust-building sections on any website.
 */

import type { SiteElement } from '../types';

export const socialProofElements: SiteElement[] = [
  // ========================================================================
  // TESTIMONIAL CARDS
  // ========================================================================
  {
    id: 'testimonials-cards',
    name: 'Testimonial Cards',
    description: 'Grid of customer testimonial cards with quote, name, role, and avatar. The most common social proof pattern.',
    category: 'social-proof',
    subCategory: 'testimonials',
    industryAffinity: ['universal', 'saas', 'coaching', 'agency', 'local-service'],
    contentSlots: [
      { name: 'section_title', type: 'heading', required: true, description: 'Section heading', example: 'What Our Clients Say' },
      { name: 'section_subtitle', type: 'paragraph', required: false, description: 'Supporting text' },
      { name: 'testimonial_items', type: 'list', required: true, description: 'Testimonial cards (quote, name, role, avatar, rating)' },
    ],
    variations: [
      {
        id: 'testimonials-3-grid',
        name: '3-Column Grid',
        description: 'Three testimonial cards in a grid — balanced and scannable',
        layout: 'grid-3',
        style: 'minimal',
        cssHints: [
          'grid md:grid-cols-2 lg:grid-cols-3 gap-6',
          'card: bg-card rounded-xl p-6 border border-border',
          'quote: text-muted-foreground italic mb-4',
          'stars: text-yellow-400 flex gap-1 mb-3',
          'avatar: w-12 h-12 rounded-full',
        ],
        skeleton: `<section class="py-20 md:py-28 bg-muted/20">
  <div class="max-w-6xl mx-auto px-4">
    <div class="text-center mb-16">
      <span class="text-primary text-sm font-semibold uppercase tracking-wider">Testimonials</span>
      <h2 class="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4"><!-- TITLE --></h2>
    </div>
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-shadow">
        <div class="flex gap-1 text-yellow-400 mb-3">★★★★★</div>
        <p class="text-muted-foreground italic mb-4 leading-relaxed">"<!-- QUOTE -->"</p>
        <div class="flex items-center gap-3">
          <img class="w-12 h-12 rounded-full object-cover" src="" alt="" />
          <div>
            <div class="font-semibold text-foreground"><!-- NAME --></div>
            <div class="text-sm text-muted-foreground"><!-- ROLE --></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`,
        bestFor: ['Any business', 'Most versatile testimonial layout'],
        popularity: 90,
      },
      {
        id: 'testimonials-featured',
        name: 'Featured Single Testimonial',
        description: 'Large featured testimonial with big quote marks — high impact',
        layout: 'contained',
        style: 'elegant',
        cssHints: [
          'max-w-3xl mx-auto text-center',
          'large decorative quote marks: text-6xl text-primary/20',
          'quote text: text-xl md:text-2xl italic',
        ],
        skeleton: `<section class="py-20 md:py-28 bg-background">
  <div class="max-w-3xl mx-auto px-4 text-center">
    <div class="text-6xl text-primary/20 leading-none mb-6">"</div>
    <blockquote class="text-xl md:text-2xl text-foreground italic leading-relaxed mb-8"><!-- QUOTE --></blockquote>
    <div class="flex items-center justify-center gap-4">
      <img class="w-14 h-14 rounded-full object-cover" src="" alt="" />
      <div class="text-left">
        <div class="font-semibold text-foreground"><!-- NAME --></div>
        <div class="text-sm text-muted-foreground"><!-- ROLE --></div>
      </div>
    </div>
  </div>
</section>`,
        bestFor: ['When you have one powerful testimonial', 'B2B with notable clients'],
        popularity: 60,
      },
    ],
    conversion: {
      goal: 'Build trust and overcome objections through social proof',
      placementTips: [
        'Place after features or pricing section',
        'Best between conversion-focused sections',
        'Multiple testimonial sections can be used — one near hero, one near CTA',
      ],
      copyGuidelines: [
        'Quotes should reference specific results or outcomes',
        'Include full name + role/company for credibility',
        'Max 3-4 sentences per quote',
        'Star ratings (★★★★★) increase trust significantly',
      ],
      abInsights: [
        'Testimonials with photos convert 35% better than text-only',
        'Specific outcomes ("increased sales by 40%") outperform generic praise',
        '3 testimonials is the sweet spot — more causes decision paralysis',
      ],
    },
    a11y: {
      ariaRequirements: ['Use <blockquote> for quotes', 'aria-label for star ratings'],
      screenReader: 'Star ratings should have text alternatives',
    },
    seo: {
      semanticElements: ['<blockquote>', '<cite>'],
      schemaType: 'Review',
    },
    responsive: {
      mobile: '1 column stack',
      tablet: '2 columns',
      desktop: '3 columns or featured single',
    },
    tags: ['testimonials', 'reviews', 'social-proof', 'trust', 'quotes', 'ratings'],
    frequencyScore: 85,
  },

  // ========================================================================
  // LOGO STRIP / CLIENT LOGOS
  // ========================================================================
  {
    id: 'logo-strip',
    name: 'Client Logo Strip',
    description: 'Horizontal row of client/partner logos — instant credibility signal. Used by 70%+ of B2B sites.',
    category: 'social-proof',
    subCategory: 'logos',
    industryAffinity: ['universal', 'saas', 'agency', 'coaching'],
    contentSlots: [
      { name: 'label', type: 'text', required: false, description: 'Label above logos', example: 'Trusted by leading companies' },
      { name: 'logos', type: 'list', required: true, description: '4-8 client logos' },
    ],
    variations: [
      {
        id: 'logo-strip-grayscale',
        name: 'Grayscale Logos',
        description: 'Grayscale logos that colorize on hover — subtle and professional',
        layout: 'full-width',
        style: 'minimal',
        cssHints: [
          'py-12 bg-muted/20 border-y border-border',
          'flex flex-wrap items-center justify-center gap-8 md:gap-12',
          'logo: h-8 md:h-10 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all',
        ],
        skeleton: `<section class="py-12 bg-muted/20 border-y border-border">
  <div class="max-w-6xl mx-auto px-4">
    <p class="text-center text-sm text-muted-foreground mb-8">Trusted by leading companies</p>
    <div class="flex flex-wrap items-center justify-center gap-8 md:gap-12">
      <img class="h-8 md:h-10 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-300" src="" alt="Client" />
      <!-- REPEAT 4-8x -->
    </div>
  </div>
</section>`,
        bestFor: ['Below hero', 'B2B SaaS', 'Agencies', 'Any business with recognizable clients'],
        popularity: 85,
      },
    ],
    conversion: {
      goal: 'Instant credibility through brand association',
      placementTips: [
        'Best placement: directly below hero, before features',
        'Also effective below testimonials',
        'Compact strip — should not dominate page',
      ],
      copyGuidelines: [
        'Label: "Trusted by" or "Our Clients" — keep it simple',
        'No need for company names if logos are recognizable',
        'Use 5-8 logos for optimal density',
      ],
      abInsights: [
        'Logo strips increase trust by 33% for first-time visitors',
        'Grayscale-to-color hover effect feels more premium',
        'Placing logo strip below hero increases form completion by 12%',
      ],
    },
    a11y: {
      ariaRequirements: ['Alt text on each logo with company name'],
    },
    responsive: {
      mobile: 'Wrap to 2-3 per row, or horizontal scroll',
      desktop: 'All logos in one row',
    },
    tags: ['logos', 'clients', 'trust', 'social-proof', 'brands', 'partners'],
    frequencyScore: 80,
  },
];
