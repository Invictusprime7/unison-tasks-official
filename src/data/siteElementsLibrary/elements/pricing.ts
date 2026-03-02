/**
 * Pricing Section Elements — AI Site Elements Library
 *
 * Pricing tables, comparison grids, plan cards.
 * Critical for SaaS, coaching, and any subscription/tiered business.
 */

import type { SiteElement } from '../types';

export const pricingElements: SiteElement[] = [
  // ========================================================================
  // PRICING CARDS — 3-TIER (the standard)
  // ========================================================================
  {
    id: 'pricing-3-tier',
    name: '3-Tier Pricing Cards',
    description: 'Three pricing plan cards with highlighted "popular" tier. The gold standard for subscription pricing.',
    category: 'pricing',
    subCategory: 'tiers',
    industryAffinity: ['saas', 'coaching', 'agency', 'fitness', 'education'],
    contentSlots: [
      { name: 'section_title', type: 'heading', required: true, description: 'Section heading', example: 'Simple, Transparent Pricing' },
      { name: 'billing_toggle', type: 'button', required: false, description: 'Monthly/Annual toggle', example: 'Monthly | Annual (Save 20%)' },
      { name: 'plan_cards', type: 'list', required: true, description: '3 plan cards with name, price, features, CTA' },
    ],
    variations: [
      {
        id: 'pricing-cards-elevated',
        name: 'Elevated Popular Card',
        description: 'Middle card elevated and highlighted — draws eye to recommended plan',
        layout: 'grid-3',
        style: 'minimal',
        cssHints: [
          'grid md:grid-cols-3 gap-8 items-stretch',
          'popular card: ring-2 ring-primary shadow-xl scale-105 relative',
          'badge: absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm',
          'price: text-5xl font-bold',
          'features: list with check icons',
        ],
        skeleton: `<section class="py-20 md:py-28 bg-background">
  <div class="max-w-5xl mx-auto px-4">
    <div class="text-center mb-16">
      <span class="text-primary text-sm font-semibold uppercase tracking-wider">Pricing</span>
      <h2 class="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4"><!-- TITLE --></h2>
      <div class="inline-flex items-center rounded-full bg-muted p-1 mt-4">
        <button class="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium" data-no-intent>Monthly</button>
        <button class="px-4 py-2 rounded-full text-muted-foreground text-sm font-medium hover:text-foreground" data-no-intent>Annual</button>
      </div>
    </div>
    <div class="grid md:grid-cols-3 gap-8 items-stretch">
      <!-- BASIC -->
      <div class="bg-card rounded-2xl p-8 border border-border flex flex-col">
        <h3 class="text-xl font-bold text-foreground mb-2">Starter</h3>
        <p class="text-muted-foreground text-sm mb-6">For individuals getting started</p>
        <div class="mb-6"><span class="text-5xl font-bold text-foreground">$9</span><span class="text-muted-foreground">/mo</span></div>
        <ul class="space-y-3 mb-8 flex-1">
          <li class="flex items-center gap-2 text-sm text-muted-foreground"><span class="text-primary">✓</span> Feature 1</li>
        </ul>
        <button class="w-full py-3 border border-border rounded-xl font-semibold text-foreground hover:bg-muted transition-all" data-ut-intent="pay.checkout" data-plan="starter">Get Started</button>
      </div>
      <!-- POPULAR (elevated) -->
      <div class="relative bg-card rounded-2xl p-8 border-2 border-primary shadow-xl md:scale-105 flex flex-col">
        <div class="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">Most Popular</div>
        <h3 class="text-xl font-bold text-foreground mb-2">Professional</h3>
        <p class="text-muted-foreground text-sm mb-6">For growing businesses</p>
        <div class="mb-6"><span class="text-5xl font-bold text-foreground">$29</span><span class="text-muted-foreground">/mo</span></div>
        <ul class="space-y-3 mb-8 flex-1">
          <li class="flex items-center gap-2 text-sm text-foreground"><span class="text-primary">✓</span> Everything in Starter</li>
        </ul>
        <button class="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold shadow-md hover:shadow-lg transition-all" data-ut-intent="pay.checkout" data-plan="professional">Get Started</button>
      </div>
      <!-- ENTERPRISE -->
      <div class="bg-card rounded-2xl p-8 border border-border flex flex-col">
        <h3 class="text-xl font-bold text-foreground mb-2">Enterprise</h3>
        <p class="text-muted-foreground text-sm mb-6">For large organizations</p>
        <div class="mb-6"><span class="text-5xl font-bold text-foreground">$99</span><span class="text-muted-foreground">/mo</span></div>
        <ul class="space-y-3 mb-8 flex-1">
          <li class="flex items-center gap-2 text-sm text-muted-foreground"><span class="text-primary">✓</span> Everything in Pro</li>
        </ul>
        <button class="w-full py-3 border border-border rounded-xl font-semibold text-foreground hover:bg-muted transition-all" data-ut-intent="contact.submit">Contact Sales</button>
      </div>
    </div>
  </div>
</section>`,
        bestFor: ['SaaS', 'Subscriptions', 'Any tiered pricing'],
        popularity: 92,
      },
    ],
    conversion: {
      goal: 'Drive plan selection and checkout',
      recommendedIntent: 'pay.checkout',
      placementTips: [
        'Place after features and testimonials (user needs to understand value first)',
        'Popular plan should be visually emphasized',
        'Consider a FAQ section directly below pricing',
      ],
      copyGuidelines: [
        'Plan names: Descriptive (Starter, Pro, Enterprise) not cute',
        'Price: Large, bold — no hiding it',
        'Feature list: Checkmarks, 5-8 items per plan',
        'CTA: "Get Started", "Start Free Trial", "Contact Sales" for enterprise',
      ],
      abInsights: [
        'Elevated middle card increases mid-tier selection by 25%',
        'Monthly/Annual toggle with savings badge increases annual uptake 40%',
        '"Most Popular" badge on middle tier increases selection 20%',
        'Showing annual savings as percentage outperforms raw dollar amount',
      ],
    },
    a11y: {
      ariaRequirements: ['role="radiogroup" on toggle', 'aria-pressed on toggle buttons', 'Pricing amounts in text, not just visual'],
      keyboardNav: 'Tab through plans, toggle billing with keyboard',
    },
    seo: {
      semanticElements: ['<section>', '<h2>', '<h3>'],
      schemaType: 'Product',
    },
    responsive: {
      mobile: '1 column stack, popular card resets scale',
      tablet: '1 column or 3 column depending on card width',
      desktop: '3 column with elevated middle card',
    },
    tags: ['pricing', 'plans', 'tiers', 'subscription', 'checkout', 'saas'],
    frequencyScore: 78,
  },
];
