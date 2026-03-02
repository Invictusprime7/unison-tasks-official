/**
 * Content Section Elements — AI Site Elements Library
 *
 * About sections, team grids, gallery/portfolio, blog cards.
 * The narrative and visual storytelling sections.
 */

import type { SiteElement } from '../types';

export const contentElements: SiteElement[] = [
  // ========================================================================
  // ABOUT / STORY SECTION
  // ========================================================================
  {
    id: 'about-section',
    name: 'About / Story Section',
    description: 'Company or personal story section with text and image. Builds emotional connection.',
    category: 'content',
    subCategory: 'about',
    industryAffinity: ['universal', 'restaurant', 'salon', 'coaching', 'nonprofit', 'agency'],
    contentSlots: [
      { name: 'section_eyebrow', type: 'badge', required: false, description: 'Eyebrow text', example: 'Our Story' },
      { name: 'section_title', type: 'heading', required: true, description: 'H2 heading', example: 'Passionate About Quality' },
      { name: 'story_text', type: 'paragraph', required: true, description: 'Story/about paragraphs', charRange: { min: 100, max: 400 } },
      { name: 'image', type: 'image', required: true, description: 'Team photo, workspace, or founder image' },
      { name: 'highlights', type: 'list', required: false, description: 'Key highlights/achievements', example: '15+ Years Experience | Award Winning | 500+ Projects' },
    ],
    variations: [
      {
        id: 'about-split-image',
        name: 'Split Image + Text',
        description: 'Two-column layout with image on one side, story text on the other',
        layout: 'split-screen',
        style: 'minimal',
        cssHints: [
          'grid md:grid-cols-2 gap-12 items-center',
          'image: rounded-2xl shadow-lg',
          'text side: space-y-4',
        ],
        skeleton: `<section class="py-20 md:py-28 bg-background" id="about">
  <div class="max-w-6xl mx-auto px-4">
    <div class="grid md:grid-cols-2 gap-12 items-center">
      <div class="relative">
        <img class="rounded-2xl shadow-lg w-full" src="" alt="" />
        <div class="absolute -bottom-4 -right-4 bg-primary text-primary-foreground p-4 rounded-xl shadow-lg">
          <div class="text-2xl font-bold">15+</div>
          <div class="text-sm">Years Experience</div>
        </div>
      </div>
      <div>
        <span class="text-primary text-sm font-semibold uppercase tracking-wider">Our Story</span>
        <h2 class="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-6"><!-- TITLE --></h2>
        <p class="text-muted-foreground leading-relaxed mb-4"><!-- PARAGRAPH 1 --></p>
        <p class="text-muted-foreground leading-relaxed mb-6"><!-- PARAGRAPH 2 --></p>
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 bg-muted/50 rounded-lg text-center">
            <div class="text-2xl font-bold text-primary">500+</div>
            <div class="text-sm text-muted-foreground">Projects</div>
          </div>
          <div class="p-4 bg-muted/50 rounded-lg text-center">
            <div class="text-2xl font-bold text-primary">98%</div>
            <div class="text-sm text-muted-foreground">Client Satisfaction</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`,
        bestFor: ['Service businesses', 'Restaurants', 'Agencies', 'Most versatile about layout'],
        popularity: 85,
      },
    ],
    conversion: {
      goal: 'Build trust and emotional connection',
      placementTips: [
        'Place after features/services section',
        'Don\'t make it too long — 2-3 paragraphs max',
        'Include a relatable founder/team image',
      ],
      copyGuidelines: [
        'Tell a story — founding mission, values, journey',
        'Include concrete achievements (years, projects, clients)',
        'Write in first person (we/our) for warmth',
      ],
    },
    a11y: {
      ariaRequirements: ['Alt text on image describing the scene', 'H2 section heading'],
    },
    seo: {
      semanticElements: ['<section>', '<h2>', '<img>'],
      schemaType: 'AboutPage',
    },
    responsive: {
      mobile: 'Stack image above text',
      desktop: 'Side-by-side split',
    },
    tags: ['about', 'story', 'company', 'team', 'mission', 'values'],
    frequencyScore: 80,
  },

  // ========================================================================
  // TEAM GRID
  // ========================================================================
  {
    id: 'team-grid',
    name: 'Team Grid Section',
    description: 'Grid of team member cards with photo, name, role, and social links.',
    category: 'content',
    subCategory: 'team',
    industryAffinity: ['universal', 'agency', 'salon', 'coaching', 'nonprofit'],
    contentSlots: [
      { name: 'section_title', type: 'heading', required: true, description: 'Section heading', example: 'Meet Our Team' },
      { name: 'team_cards', type: 'list', required: true, description: 'Team member cards (photo, name, role, bio, social)' },
    ],
    variations: [
      {
        id: 'team-grid-cards',
        name: 'Card Grid',
        description: 'Clean cards with circular or rounded photos',
        layout: 'grid-4',
        style: 'minimal',
        cssHints: [
          'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8',
          'card: text-center group',
          'image: w-32 h-32 rounded-full mx-auto mb-4 object-cover',
        ],
        skeleton: `<section class="py-20 md:py-28 bg-muted/20">
  <div class="max-w-6xl mx-auto px-4">
    <div class="text-center mb-16">
      <span class="text-primary text-sm font-semibold uppercase tracking-wider">Our Team</span>
      <h2 class="text-3xl md:text-4xl font-bold text-foreground mt-2">Meet Our Team</h2>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
      <div class="text-center group">
        <div class="relative mb-4 mx-auto w-32 h-32">
          <img class="w-full h-full rounded-full object-cover ring-4 ring-primary/10 group-hover:ring-primary/30 transition-all" src="" alt="" />
        </div>
        <h3 class="font-semibold text-foreground"><!-- NAME --></h3>
        <p class="text-sm text-primary mb-2"><!-- ROLE --></p>
        <div class="flex justify-center gap-3 text-muted-foreground"><!-- SOCIAL LINKS --></div>
      </div>
    </div>
  </div>
</section>`,
        bestFor: ['Agencies', 'Salons', 'Nonprofits', 'Any team showcase'],
        popularity: 75,
      },
    ],
    conversion: {
      goal: 'Build personal trust through team visibility',
      placementTips: [
        'Place after about/story section',
        'Show 3-8 team members',
        'Founder/CEO should be first or highlighted',
      ],
      copyGuidelines: [
        'Name: Full name',
        'Role: Professional title',
        'Optional bio: 1 sentence about expertise/personality',
      ],
    },
    a11y: {
      ariaRequirements: ['Alt text: "[Name], [Role]" format', 'Social links with aria-labels'],
    },
    responsive: {
      mobile: '2 columns',
      desktop: '3-4 columns',
    },
    tags: ['team', 'members', 'staff', 'people', 'about', 'social'],
    frequencyScore: 65,
  },

  // ========================================================================
  // PORTFOLIO / GALLERY GRID
  // ========================================================================
  {
    id: 'portfolio-gallery',
    name: 'Portfolio / Gallery Grid',
    description: 'Visual gallery of work samples, projects, or photos with hover overlays.',
    category: 'content',
    subCategory: 'gallery',
    industryAffinity: ['portfolio', 'agency', 'salon', 'restaurant', 'real-estate'],
    contentSlots: [
      { name: 'section_title', type: 'heading', required: true, description: 'Section heading', example: 'Our Work' },
      { name: 'category_filters', type: 'list', required: false, description: 'Category filter pills' },
      { name: 'gallery_items', type: 'list', required: true, description: 'Gallery items (image, title, category, link)' },
    ],
    variations: [
      {
        id: 'gallery-hover-overlay',
        name: 'Hover Overlay Grid',
        description: 'Grid of images with title/category overlay on hover',
        layout: 'grid-3',
        style: 'minimal',
        cssHints: [
          'grid grid-cols-2 md:grid-cols-3 gap-4',
          'item: group relative overflow-hidden rounded-xl aspect-square',
          'overlay: absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity',
        ],
        skeleton: `<section class="py-20 md:py-28 bg-background">
  <div class="max-w-6xl mx-auto px-4">
    <div class="text-center mb-12">
      <h2 class="text-3xl md:text-4xl font-bold text-foreground mb-4"><!-- TITLE --></h2>
    </div>
    <div class="flex flex-wrap justify-center gap-3 mb-10">
      <button class="px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium" data-no-intent>All</button>
      <button class="px-5 py-2 rounded-full bg-muted text-muted-foreground text-sm hover:bg-primary/10" data-no-intent>Category</button>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div class="group relative overflow-hidden rounded-xl aspect-square">
        <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="" alt="" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <div>
            <h3 class="text-white font-semibold"><!-- PROJECT NAME --></h3>
            <p class="text-white/70 text-sm"><!-- CATEGORY --></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`,
        bestFor: ['Portfolio', 'Agency', 'Salon work showcase', 'Restaurant gallery'],
        popularity: 75,
      },
    ],
    conversion: {
      goal: 'Showcase work quality and capabilities',
      placementTips: [
        'Place after services or about section',
        'Use high-quality, curated images',
        'Filter categories help users find relevant work',
      ],
      copyGuidelines: [
        'Minimal text — let images speak',
        'Category labels for organizing',
        'Project names should be descriptive',
      ],
    },
    a11y: {
      ariaRequirements: ['Descriptive alt text on all images', 'Focusable items with keyboard access'],
    },
    responsive: {
      mobile: '2 columns',
      desktop: '3 columns with hover effects',
    },
    tags: ['gallery', 'portfolio', 'work', 'projects', 'images', 'showcase'],
    frequencyScore: 65,
  },
];
