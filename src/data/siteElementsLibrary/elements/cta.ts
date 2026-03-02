/**
 * CTA (Call-to-Action) Section Elements — AI Site Elements Library
 *
 * Dedicated CTA banners, conversion strips, and final push sections.
 * These are the "close the deal" sections placed near the bottom.
 */

import type { SiteElement } from '../types';

export const ctaElements: SiteElement[] = [
  // ========================================================================
  // CTA BANNER
  // ========================================================================
  {
    id: 'cta-banner',
    name: 'CTA Banner Section',
    description: 'Full-width banner section with headline + CTA — the final conversion push before the footer.',
    category: 'cta',
    subCategory: 'banner',
    industryAffinity: ['universal'],
    contentSlots: [
      { name: 'headline', type: 'heading', required: true, description: 'Action-oriented headline', example: 'Ready to Get Started?', charRange: { min: 15, max: 50 } },
      { name: 'subheadline', type: 'paragraph', required: false, description: 'Supporting text', charRange: { min: 20, max: 100 } },
      { name: 'cta_primary', type: 'button', required: true, description: 'Primary action button' },
      { name: 'cta_secondary', type: 'button', required: false, description: 'Secondary action' },
    ],
    variations: [
      {
        id: 'cta-banner-gradient',
        name: 'Gradient Background CTA',
        description: 'Primary-colored gradient background with white text — high visual impact',
        layout: 'contained',
        style: 'bold',
        cssHints: [
          'py-20 bg-gradient-to-r from-primary to-primary/80',
          'text-center text-white',
          'rounded-2xl or full-width',
        ],
        skeleton: `<section class="py-20">
  <div class="max-w-6xl mx-auto px-4">
    <div class="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-12 md:p-16 text-center">
      <h2 class="text-3xl md:text-4xl font-bold text-white mb-4"><!-- HEADLINE --></h2>
      <p class="text-lg text-white/80 max-w-xl mx-auto mb-8"><!-- SUBHEADLINE --></p>
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
        <a class="px-8 py-4 bg-white text-primary rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all" data-ut-intent="contact.submit" data-ut-cta="cta.primary" data-ut-label="Get Started Today"><!-- PRIMARY CTA --></a>
        <a class="px-8 py-4 border-2 border-white/30 text-white rounded-full font-semibold text-lg hover:bg-white/10 transition-all" data-ut-intent="nav.anchor" data-ut-anchor="features" data-ut-cta="cta.secondary" data-ut-label="Learn More"><!-- SECONDARY CTA --></a>
      </div>
    </div>
  </div>
</section>`,
        bestFor: ['Landing pages', 'SaaS', 'Any conversion-focused page'],
        popularity: 85,
      },
      {
        id: 'cta-banner-dark',
        name: 'Dark Background CTA',
        description: 'Dark background with primary-colored CTA — sophisticated and professional',
        layout: 'full-width',
        style: 'dark-luxury',
        cssHints: [
          'py-20 bg-gray-950',
          'text-center text-white',
          'decorative blur orbs',
        ],
        skeleton: `<section class="relative py-20 bg-gray-950 overflow-hidden">
  <div class="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent"></div>
  <div class="relative max-w-4xl mx-auto px-4 text-center">
    <h2 class="text-3xl md:text-4xl font-bold text-white mb-4"><!-- HEADLINE --></h2>
    <p class="text-lg text-gray-400 max-w-xl mx-auto mb-8"><!-- SUBHEADLINE --></p>
    <a class="inline-flex px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all" data-ut-intent="contact.submit" data-ut-cta="cta.primary" data-ut-label="Get Started"><!-- CTA --></a>
  </div>
</section>`,
        bestFor: ['Premium services', 'Agencies', 'Portfolios'],
        popularity: 70,
      },
    ],
    conversion: {
      goal: 'Final conversion push before user leaves',
      recommendedIntent: 'contact.submit',
      placementTips: [
        'Place above the footer — it\'s the last chance to convert',
        'Can also be placed between pricing and FAQ',
        'Only ONE CTA banner per page',
      ],
      copyGuidelines: [
        'Headline: Question format or urgency ("Ready to...?", "Don\'t miss out")',
        'CTA: Same as hero CTA or stronger variant',
        'Keep it simple — this is a reminder, not a pitch',
      ],
      abInsights: [
        'CTA banners increase page conversion by 10-15%',
        'Gradient backgrounds outperform flat backgrounds for CTA sections',
        'Contrast CTA button color (e.g., white on primary) increases clicks 18%',
      ],
    },
    a11y: {
      ariaRequirements: ['CTA must have descriptive label', 'Sufficient contrast on gradient'],
    },
    responsive: {
      mobile: 'Stack CTAs vertically, reduce padding',
      desktop: 'Centered layout with side-by-side CTAs',
    },
    tags: ['cta', 'banner', 'conversion', 'action', 'bottom-cta'],
    frequencyScore: 80,
  },

  // ========================================================================
  // NEWSLETTER / EMAIL CAPTURE
  // ========================================================================
  {
    id: 'newsletter-signup',
    name: 'Newsletter Signup Section',
    description: 'Email capture section for newsletter, waitlist, or lead magnet. Critical for building audience.',
    category: 'cta',
    subCategory: 'newsletter',
    industryAffinity: ['universal', 'saas', 'coaching', 'ecommerce', 'education'],
    contentSlots: [
      { name: 'headline', type: 'heading', required: true, description: 'Section heading', example: 'Stay in the Loop' },
      { name: 'description', type: 'paragraph', required: false, description: 'What subscribers will receive' },
      { name: 'email_input', type: 'form', required: true, description: 'Email input field' },
      { name: 'submit_button', type: 'button', required: true, description: 'Submit button', example: 'Subscribe' },
      { name: 'privacy_note', type: 'text', required: false, description: 'Privacy assurance', example: 'No spam. Unsubscribe anytime.' },
    ],
    variations: [
      {
        id: 'newsletter-inline',
        name: 'Inline Email Form',
        description: 'Compact inline form with email input + button side by side',
        layout: 'contained',
        style: 'minimal',
        cssHints: [
          'py-16 bg-muted/30',
          'max-w-xl mx-auto text-center',
          'flex gap-2 for input + button',
        ],
        skeleton: `<section class="py-16 bg-muted/30">
  <div class="max-w-xl mx-auto px-4 text-center">
    <h2 class="text-2xl md:text-3xl font-bold text-foreground mb-3"><!-- HEADLINE --></h2>
    <p class="text-muted-foreground mb-6"><!-- DESCRIPTION --></p>
    <form class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <input type="email" placeholder="Enter your email" class="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" required />
      <button type="submit" class="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity" data-ut-intent="newsletter.subscribe">Subscribe</button>
    </form>
    <p class="text-xs text-muted-foreground mt-3">No spam. Unsubscribe anytime.</p>
  </div>
</section>`,
        bestFor: ['Blog', 'SaaS', 'Any site building an audience'],
        popularity: 80,
      },
    ],
    conversion: {
      goal: 'Capture email addresses for nurturing',
      recommendedIntent: 'newsletter.subscribe',
      placementTips: [
        'Place above footer or within blog/content pages',
        'Can also appear as a secondary element within the footer',
      ],
      copyGuidelines: [
        'Headline: Value-first ("Get Weekly Insights" not "Subscribe to Newsletter")',
        'Button: "Subscribe", "Join", "Get Updates"',
        'Always include privacy note below form',
      ],
      abInsights: [
        'Single email field converts 30% better than name + email',
        '"No spam" notice increases submissions by 15%',
        'Inline (side-by-side) form outperforms stacked on desktop',
      ],
    },
    a11y: {
      ariaRequirements: ['<label> for email input (can be visually hidden)', 'aria-required="true"', 'Form submit feedback'],
    },
    responsive: {
      mobile: 'Stack input and button vertically',
      desktop: 'Inline side-by-side form',
    },
    tags: ['newsletter', 'email', 'subscribe', 'lead-capture', 'form', 'cta'],
    frequencyScore: 75,
  },
];
