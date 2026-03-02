/**
 * Utility Elements — AI Site Elements Library
 *
 * Back-to-top buttons, cookie banners, announcement bars, loading states.
 * Small but important UX elements that complete a production site.
 */

import type { SiteElement } from '../types';

export const utilityElements: SiteElement[] = [
  // ========================================================================
  // ANNOUNCEMENT BAR
  // ========================================================================
  {
    id: 'announcement-bar',
    name: 'Announcement Bar',
    description: 'Thin banner at the very top of the page for promotions, announcements, or alerts.',
    category: 'utility',
    subCategory: 'announcement',
    industryAffinity: ['universal', 'ecommerce', 'saas'],
    contentSlots: [
      { name: 'message', type: 'text', required: true, description: 'Announcement text', example: '🎉 Black Friday Sale — 30% off everything!' },
      { name: 'cta_link', type: 'button', required: false, description: 'Optional action link', example: 'Shop Now →' },
      { name: 'dismiss', type: 'icon', required: false, description: 'Close/dismiss button' },
    ],
    variations: [
      {
        id: 'announcement-gradient',
        name: 'Gradient Announcement',
        description: 'Gradient background with centered text — eye-catching and modern',
        layout: 'full-width',
        style: 'bold',
        cssHints: [
          'py-2 px-4',
          'bg-gradient-to-r from-primary via-primary/90 to-primary/80',
          'text-center text-sm text-primary-foreground',
        ],
        skeleton: `<div class="py-2 px-4 bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-center relative">
  <p class="text-sm text-primary-foreground font-medium">
    🎉 <span><!-- MESSAGE --></span>
    <a href="#" class="underline font-semibold ml-2" data-ut-intent="nav.anchor" data-ut-anchor="pricing">Shop Now →</a>
  </p>
  <button class="absolute right-4 top-1/2 -translate-y-1/2 text-primary-foreground/70 hover:text-primary-foreground" data-no-intent>✕</button>
</div>`,
        bestFor: ['Sales', 'Product launches', 'Important updates'],
        popularity: 70,
      },
    ],
    conversion: {
      goal: 'Drive attention to time-sensitive offers',
      placementTips: ['Always #1 element — above everything including navbar', 'Dismissible by user'],
      copyGuidelines: ['Keep under 80 characters', 'Include emoji for visual interest', 'CTA: "Shop Now", "Learn More"'],
    },
    a11y: { ariaRequirements: ['role="alert" or role="banner"', 'Dismiss button labeled'] },
    responsive: { mobile: 'Same layout, text wraps', desktop: 'Single line' },
    tags: ['announcement', 'banner', 'promotion', 'alert', 'sale'],
    frequencyScore: 55,
  },

  // ========================================================================
  // BACK TO TOP BUTTON
  // ========================================================================
  {
    id: 'back-to-top',
    name: 'Back to Top Button',
    description: 'Floating button that appears on scroll and scrolls user back to top. Essential for long pages.',
    category: 'utility',
    subCategory: 'scroll',
    industryAffinity: ['universal'],
    contentSlots: [
      { name: 'icon', type: 'icon', required: true, description: 'Up arrow icon' },
    ],
    variations: [
      {
        id: 'back-to-top-circle',
        name: 'Circular Button',
        description: 'Round button in bottom-right corner',
        layout: 'floating',
        style: 'minimal',
        cssHints: ['fixed bottom-8 right-8 z-40', 'w-12 h-12 rounded-full', 'bg-primary text-primary-foreground shadow-lg', 'opacity-0 pointer-events-none when at top'],
        skeleton: `<button id="back-to-top" class="fixed bottom-8 right-8 z-40 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all opacity-0 pointer-events-none" data-no-intent aria-label="Back to top">↑</button>`,
        bestFor: ['Any long page'],
        popularity: 70,
      },
    ],
    conversion: {
      goal: 'Improve UX on long pages',
      placementTips: ['Bottom-right corner (standard)', 'Show only after scrolling 300px+'],
      copyGuidelines: ['No text needed — icon only', 'aria-label="Back to top"'],
    },
    a11y: { ariaRequirements: ['aria-label="Back to top"', 'Keyboard accessible'] },
    responsive: { mobile: 'Same position, slightly smaller (w-10 h-10)', desktop: 'Standard size' },
    tags: ['back-to-top', 'scroll', 'utility', 'floating', 'button'],
    frequencyScore: 60,
  },

  // ========================================================================
  // COOKIE CONSENT BANNER
  // ========================================================================
  {
    id: 'cookie-consent',
    name: 'Cookie Consent Banner',
    description: 'Bottom banner for cookie/privacy consent — required for GDPR compliance.',
    category: 'utility',
    subCategory: 'legal',
    industryAffinity: ['universal'],
    contentSlots: [
      { name: 'message', type: 'text', required: true, description: 'Cookie policy message' },
      { name: 'accept_button', type: 'button', required: true, description: 'Accept cookies', example: 'Accept All' },
      { name: 'settings_button', type: 'button', required: false, description: 'Cookie preferences', example: 'Cookie Settings' },
      { name: 'policy_link', type: 'button', required: false, description: 'Link to privacy policy' },
    ],
    variations: [
      {
        id: 'cookie-bottom-bar',
        name: 'Bottom Bar',
        description: 'Fixed bottom bar with message and buttons',
        layout: 'full-width',
        style: 'minimal',
        cssHints: ['fixed bottom-0 left-0 right-0 z-50', 'bg-background border-t border-border shadow-lg', 'p-4'],
        skeleton: `<div class="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg p-4 hidden" id="cookie-consent">
  <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
    <p class="text-sm text-muted-foreground">We use cookies to enhance your experience. By continuing, you agree to our <a href="#" class="text-primary underline">Privacy Policy</a>.</p>
    <div class="flex items-center gap-3">
      <button class="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors" data-no-intent>Cookie Settings</button>
      <button class="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold" data-no-intent>Accept All</button>
    </div>
  </div>
</div>`,
        bestFor: ['Any website', 'GDPR compliance required'],
        popularity: 65,
      },
    ],
    conversion: {
      goal: 'Legal compliance with minimal UX disruption',
      placementTips: ['Fixed bottom', 'Show only once per session', 'Remember preference in localStorage'],
      copyGuidelines: ['Brief and clear', 'Link to full privacy policy', '"Accept All" as primary CTA'],
    },
    a11y: { ariaRequirements: ['role="dialog"', 'aria-label="Cookie consent"', 'Focus management'] },
    responsive: { mobile: 'Stack text above buttons', desktop: 'Inline text and buttons' },
    tags: ['cookie', 'consent', 'gdpr', 'privacy', 'legal', 'banner'],
    frequencyScore: 50,
  },
];
