/**
 * Navigation Elements — AI Site Elements Library
 *
 * Patterns distilled from thousands of production websites.
 * Covers navbar, sidebar, mobile menu, breadcrumb, megamenu.
 */

import type { SiteElement } from '../types';

export const navigationElements: SiteElement[] = [
  // ========================================================================
  // NAVBAR — the single most common element on the web
  // ========================================================================
  {
    id: 'navbar-standard',
    name: 'Standard Navbar',
    description: 'Horizontal navigation bar with logo, nav links, and CTA button. Present on 99% of websites.',
    category: 'navigation',
    subCategory: 'navbar',
    industryAffinity: ['universal'],
    contentSlots: [
      { name: 'logo', type: 'image', required: true, description: 'Brand logo or text lockup', example: '<span class="text-xl font-bold">BrandName</span>' },
      { name: 'nav_links', type: 'list', required: true, description: '4-7 navigation links', example: 'Home, Services, About, Pricing, Contact' },
      { name: 'cta_button', type: 'button', required: true, description: 'Primary action button', example: 'Get Started' },
      { name: 'mobile_toggle', type: 'icon', required: true, description: 'Hamburger menu icon for mobile' },
    ],
    variations: [
      {
        id: 'navbar-transparent',
        name: 'Transparent Overlay',
        description: 'Transparent navbar that overlays the hero section, becomes solid on scroll',
        layout: 'full-width',
        style: 'dark-luxury',
        cssHints: ['fixed top-0 w-full z-50', 'bg-transparent backdrop-blur-sm', 'transition-all duration-300', 'scroll: bg-background/95 shadow-lg'],
        skeleton: `<header class="fixed top-0 w-full z-50 transition-all duration-300" id="navbar">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16 md:h-20">
      <div class="flex-shrink-0"><!-- LOGO --></div>
      <nav class="hidden md:flex items-center gap-8"><!-- NAV LINKS: each <a> needs data-ut-intent="nav.goto" data-ut-path="/page" --></nav>
      <div class="hidden md:flex items-center gap-4"><a data-ut-intent="booking.create" data-ut-cta="cta.nav" data-ut-label="Book Now" class="px-5 py-2.5 bg-primary text-primary-foreground rounded-full font-semibold"><!-- CTA --></a></div>
      <button class="md:hidden" data-no-intent><!-- MOBILE TOGGLE --></button>
    </div>
  </div>
</header>`,
        bestFor: ['Landing pages', 'Portfolio sites', 'Full-bleed hero layouts'],
        popularity: 85,
      },
      {
        id: 'navbar-solid',
        name: 'Solid Background',
        description: 'Standard solid background navbar — the most common pattern',
        layout: 'full-width',
        style: 'corporate',
        cssHints: ['sticky top-0 z-50', 'bg-background border-b border-border', 'shadow-sm'],
        skeleton: `<header class="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
      <div class="flex-shrink-0"><!-- LOGO --></div>
      <nav class="hidden md:flex items-center gap-6"><!-- NAV LINKS: each <a> needs data-ut-intent="nav.goto" data-ut-path="/page" --></nav>
      <div class="flex items-center gap-3"><a data-ut-intent="booking.create" data-ut-cta="cta.nav" data-ut-label="Book Now" class="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold"><!-- CTA --></a></div>
    </div>
  </div>
</header>`,
        bestFor: ['SaaS', 'Corporate', 'Ecommerce', 'Any content-heavy site'],
        popularity: 95,
      },
      {
        id: 'navbar-centered-logo',
        name: 'Centered Logo',
        description: 'Logo centered with navigation split on both sides',
        layout: 'full-width',
        style: 'elegant',
        cssHints: ['sticky top-0 z-50', 'bg-background', 'text-center'],
        skeleton: `<header class="sticky top-0 z-50 bg-background border-b border-border">
  <div class="max-w-7xl mx-auto px-4">
    <div class="flex items-center justify-center h-20">
      <nav class="hidden md:flex items-center gap-6"><!-- LEFT LINKS --></nav>
      <div class="mx-8"><!-- CENTERED LOGO --></div>
      <nav class="hidden md:flex items-center gap-6"><!-- RIGHT LINKS + CTA --></nav>
    </div>
  </div>
</header>`,
        bestFor: ['Fashion', 'Restaurant', 'Salon', 'Luxury brands'],
        popularity: 45,
      },
    ],
    conversion: {
      goal: 'Persistent access to key actions and navigation',
      recommendedIntent: 'nav.goto',
      placementTips: ['Always sticky or fixed at top', 'CTA should contrast with nav bg', 'Keep mobile menu accessible'],
      copyGuidelines: ['Max 7 nav items', 'CTA label should be action-oriented: "Get Started", "Book Now"', 'Use descriptive link labels, not "Click Here"'],
      abInsights: ['Sticky navbars increase conversion by 8-12%', 'Single CTA in nav outperforms dual CTAs', 'Transparent-to-solid transition feels premium'],
    },
    a11y: {
      ariaRequirements: ['role="navigation"', 'aria-label="Main navigation"', 'aria-expanded on mobile toggle'],
      keyboardNav: 'Tab through links, Enter/Space to activate, Escape to close mobile menu',
      screenReader: 'Use <nav> landmark, skip-nav link recommended',
    },
    seo: {
      semanticElements: ['<header>', '<nav>', '<a>'],
    },
    responsive: {
      mobile: 'Hamburger menu with slide-out drawer or dropdown. Logo + toggle only visible.',
      tablet: 'Can show abbreviated nav or full nav depending on item count.',
      desktop: 'Full horizontal nav with all links and CTA visible.',
    },
    tags: ['navbar', 'header', 'navigation', 'menu', 'sticky', 'responsive'],
    frequencyScore: 99,
  },

  // ========================================================================
  // MOBILE MENU
  // ========================================================================
  {
    id: 'mobile-menu-drawer',
    name: 'Mobile Menu Drawer',
    description: 'Slide-out drawer menu for mobile navigation — the standard mobile pattern.',
    category: 'navigation',
    subCategory: 'mobile-menu',
    industryAffinity: ['universal'],
    contentSlots: [
      { name: 'nav_links', type: 'list', required: true, description: 'Full navigation link list' },
      { name: 'cta_button', type: 'button', required: false, description: 'Primary CTA duplicated in menu' },
      { name: 'social_links', type: 'list', required: false, description: 'Social media icons' },
    ],
    variations: [
      {
        id: 'mobile-drawer-right',
        name: 'Right Slide Drawer',
        description: 'Menu slides in from the right edge',
        layout: 'sidebar',
        style: 'minimal',
        cssHints: ['fixed inset-y-0 right-0 w-80 z-50', 'bg-background shadow-2xl', 'transform translate-x-full transition-transform', 'open: translate-x-0'],
        skeleton: `<div class="fixed inset-0 z-50 hidden" id="mobile-menu">
  <div class="fixed inset-0 bg-black/50" data-no-intent></div>
  <div class="fixed inset-y-0 right-0 w-80 bg-background shadow-2xl transform translate-x-full transition-transform duration-300">
    <div class="flex items-center justify-between p-4 border-b">
      <!-- LOGO + CLOSE -->
    </div>
    <nav class="flex flex-col gap-1 p-4"><!-- NAV LINKS --></nav>
    <div class="p-4 mt-auto border-t"><!-- CTA + SOCIAL --></div>
  </div>
</div>`,
        bestFor: ['Any site', 'Most intuitive pattern for users'],
        popularity: 80,
      },
      {
        id: 'mobile-fullscreen',
        name: 'Fullscreen Overlay',
        description: 'Full-screen menu overlay with centered navigation',
        layout: 'overlay',
        style: 'bold',
        cssHints: ['fixed inset-0 z-50', 'bg-background', 'flex flex-col items-center justify-center'],
        skeleton: `<div class="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center" id="mobile-menu-fullscreen" style="display:none">
  <button class="absolute top-4 right-4" data-no-intent><!-- CLOSE --></button>
  <nav class="flex flex-col items-center gap-6 text-3xl font-bold"><!-- NAV LINKS --></nav>
  <div class="mt-12"><!-- CTA --></div>
</div>`,
        bestFor: ['Portfolio', 'Agency', 'Design-forward sites'],
        popularity: 55,
      },
    ],
    conversion: {
      goal: 'Mobile navigation access',
      recommendedIntent: 'nav.goto',
      placementTips: ['Always accessible from navbar hamburger', 'Include CTA in menu'],
      copyGuidelines: ['Larger tap targets (min 44px)', 'Keep same labels as desktop nav'],
    },
    a11y: {
      ariaRequirements: ['aria-expanded on toggle', 'aria-hidden on overlay when closed', 'focus trap when open'],
      keyboardNav: 'Escape to close, Tab through items',
      screenReader: 'Announce "Menu opened" on toggle',
    },
    responsive: {
      mobile: 'This IS the mobile pattern.',
      desktop: 'Hidden — desktop nav takes over.',
    },
    tags: ['mobile', 'menu', 'drawer', 'hamburger', 'responsive'],
    frequencyScore: 95,
  },

  // ========================================================================
  // BREADCRUMB
  // ========================================================================
  {
    id: 'breadcrumb-standard',
    name: 'Breadcrumb Navigation',
    description: 'Secondary navigation showing page hierarchy — critical for ecommerce and multi-page sites.',
    category: 'navigation',
    subCategory: 'breadcrumb',
    industryAffinity: ['ecommerce', 'saas', 'real-estate', 'education'],
    contentSlots: [
      { name: 'path_items', type: 'list', required: true, description: 'Hierarchy of page links', example: 'Home > Products > Category > Item' },
    ],
    variations: [
      {
        id: 'breadcrumb-chevron',
        name: 'Chevron Separator',
        description: 'Links separated by chevron (>) characters',
        layout: 'contained',
        style: 'minimal',
        cssHints: ['flex items-center gap-2 text-sm text-muted-foreground', 'last: text-foreground font-medium'],
        skeleton: `<nav aria-label="Breadcrumb" class="py-3">
  <ol class="flex items-center gap-2 text-sm text-muted-foreground">
    <li><a href="/" data-ut-intent="nav.goto" data-ut-path="/" class="hover:text-primary">Home</a></li>
    <li class="text-border">/</li>
    <li><a href="/products" data-ut-intent="nav.goto" data-ut-path="/products" class="hover:text-primary">Products</a></li>
    <li class="text-border">/</li>
    <li class="text-foreground font-medium" aria-current="page">Current Page</li>
  </ol>
</nav>`,
        bestFor: ['Ecommerce', 'Documentation', 'Multi-level sites'],
        popularity: 85,
      },
    ],
    conversion: {
      goal: 'Reduce bounce rate by showing navigation context',
      placementTips: ['Below navbar, above page content', 'Never in hero sections'],
      copyGuidelines: ['Keep labels short', 'Current page is not a link'],
    },
    a11y: {
      ariaRequirements: ['aria-label="Breadcrumb"', 'aria-current="page" on last item', '<ol> ordered list'],
    },
    seo: {
      semanticElements: ['<nav>', '<ol>', '<li>'],
      schemaType: 'BreadcrumbList',
    },
    responsive: {
      mobile: 'Truncate middle items with "..." or hide on very small screens',
      desktop: 'Show full path',
    },
    tags: ['breadcrumb', 'navigation', 'hierarchy', 'secondary-nav'],
    frequencyScore: 65,
  },
];
