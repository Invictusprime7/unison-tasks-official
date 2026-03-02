/**
 * Footer Elements — AI Site Elements Library
 *
 * Footer sections with links, contact info, social media, and legal.
 * The anchor of every website — present on 100% of sites.
 */

import type { SiteElement } from '../types';

export const footerElements: SiteElement[] = [
  {
    id: 'footer-multi-column',
    name: 'Multi-Column Footer',
    description: 'Standard footer with logo, link columns, social icons, and copyright. The universal footer pattern.',
    category: 'footer',
    subCategory: 'standard',
    industryAffinity: ['universal'],
    contentSlots: [
      { name: 'logo', type: 'image', required: true, description: 'Brand logo or text' },
      { name: 'tagline', type: 'text', required: false, description: 'Short brand description' },
      { name: 'link_columns', type: 'list', required: true, description: '2-4 columns of grouped links', example: 'Product: Features, Pricing, API | Company: About, Careers, Blog | Support: Help, Contact, Status' },
      { name: 'social_icons', type: 'list', required: false, description: 'Social media icon links' },
      { name: 'newsletter', type: 'form', required: false, description: 'Optional newsletter signup' },
      { name: 'copyright', type: 'text', required: true, description: 'Copyright notice', example: '© 2026 Company. All rights reserved.' },
      { name: 'legal_links', type: 'list', required: false, description: 'Privacy, Terms links' },
    ],
    variations: [
      {
        id: 'footer-4-column',
        name: '4-Column Footer',
        description: 'Logo + tagline on left, 3 link columns on right — the most common footer layout',
        layout: 'grid-4',
        style: 'minimal',
        cssHints: [
          'pt-16 pb-8 bg-gray-950 text-gray-300',
          'grid md:grid-cols-4 gap-8',
          'border-t border-gray-800',
          'bottom bar: border-t border-gray-800 pt-8 mt-8 flex justify-between',
        ],
        skeleton: `<footer class="pt-16 pb-8 bg-gray-950 text-gray-300">
  <div class="max-w-6xl mx-auto px-4">
    <div class="grid md:grid-cols-4 gap-8 mb-12">
      <div>
        <div class="text-xl font-bold text-white mb-3"><!-- LOGO --></div>
        <p class="text-sm text-gray-400 leading-relaxed"><!-- TAGLINE --></p>
        <div class="flex items-center gap-3 mt-4"><!-- SOCIAL ICONS --></div>
      </div>
      <div>
        <h4 class="text-white font-semibold mb-4">Product</h4>
        <ul class="space-y-2 text-sm">
          <li><a href="#" data-ut-intent="nav.anchor" data-ut-anchor="features" class="hover:text-white transition-colors">Features</a></li>
          <li><a href="#" data-ut-intent="nav.anchor" data-ut-anchor="pricing" class="hover:text-white transition-colors">Pricing</a></li>
        </ul>
      </div>
      <div>
        <h4 class="text-white font-semibold mb-4">Company</h4>
        <ul class="space-y-2 text-sm">
          <li><a href="/about" data-ut-intent="nav.goto" data-ut-path="/about" class="hover:text-white transition-colors">About</a></li>
          <li><a href="/contact" data-ut-intent="nav.goto" data-ut-path="/contact" class="hover:text-white transition-colors">Contact</a></li>
        </ul>
      </div>
      <div>
        <h4 class="text-white font-semibold mb-4">Support</h4>
        <ul class="space-y-2 text-sm">
          <li><a href="#" class="hover:text-white transition-colors">Help Center</a></li>
          <li><a href="#" class="hover:text-white transition-colors">FAQ</a></li>
        </ul>
      </div>
    </div>
    <div class="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
      <p>© 2026 Company. All rights reserved.</p>
      <div class="flex gap-6">
        <a href="#" class="hover:text-gray-300">Privacy Policy</a>
        <a href="#" class="hover:text-gray-300">Terms of Service</a>
      </div>
    </div>
  </div>
</footer>`,
        bestFor: ['Any website', 'The most versatile footer pattern'],
        popularity: 90,
      },
      {
        id: 'footer-simple',
        name: 'Simple Centered Footer',
        description: 'Minimal centered footer for simple sites — logo, nav, social, copyright',
        layout: 'stacked',
        style: 'minimal',
        cssHints: [
          'py-12 bg-muted/30 border-t border-border',
          'text-center',
          'flex flex-col items-center gap-6',
        ],
        skeleton: `<footer class="py-12 bg-muted/30 border-t border-border">
  <div class="max-w-6xl mx-auto px-4 text-center">
    <div class="text-xl font-bold text-foreground mb-4"><!-- LOGO --></div>
    <nav class="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground mb-6">
      <a href="#" class="hover:text-foreground transition-colors">Home</a>
      <a href="#" class="hover:text-foreground transition-colors">About</a>
      <a href="#" class="hover:text-foreground transition-colors">Services</a>
      <a href="#" class="hover:text-foreground transition-colors">Contact</a>
    </nav>
    <div class="flex justify-center gap-4 mb-6"><!-- SOCIAL ICONS --></div>
    <p class="text-sm text-muted-foreground">© 2026 Company. All rights reserved.</p>
  </div>
</footer>`,
        bestFor: ['Simple sites', 'Portfolios', 'Landing pages'],
        popularity: 65,
      },
    ],
    conversion: {
      goal: 'Provide site-wide navigation and build trust through completeness',
      placementTips: [
        'Always the last element on every page',
        'Include all important links users might look for',
        'Social proof elements (trust badges, certifications) can reinforce credibility',
      ],
      copyGuidelines: [
        'Group links into logical categories (3-4 columns max)',
        'Include legal links (Privacy, Terms) for trust and compliance',
        'Copyright should include current year',
      ],
    },
    a11y: {
      ariaRequirements: ['<footer> landmark', 'aria-label="Site footer"', 'Meaningful link text'],
      screenReader: 'Footer is a natural landmark for navigation',
    },
    seo: {
      semanticElements: ['<footer>', '<nav>', '<a>'],
    },
    responsive: {
      mobile: 'Stack columns vertically, center-align everything',
      desktop: 'Multi-column grid layout',
    },
    tags: ['footer', 'links', 'social', 'copyright', 'legal', 'navigation'],
    frequencyScore: 99,
  },
];
