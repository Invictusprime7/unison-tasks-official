/**
 * Form Elements — AI Site Elements Library
 *
 * Contact forms, booking forms, lead capture, multi-step forms.
 * The primary conversion mechanism for service businesses.
 */

import type { SiteElement } from '../types';

export const formElements: SiteElement[] = [
  // ========================================================================
  // CONTACT FORM SECTION
  // ========================================================================
  {
    id: 'contact-form-section',
    name: 'Contact Form Section',
    description: 'Full contact section with form + business info. The primary lead capture for service businesses.',
    category: 'forms',
    subCategory: 'contact',
    industryAffinity: ['universal', 'local-service', 'agency', 'coaching', 'salon'],
    contentSlots: [
      { name: 'section_title', type: 'heading', required: true, description: 'Section heading', example: 'Get In Touch' },
      { name: 'section_description', type: 'paragraph', required: false, description: 'Why to contact' },
      { name: 'form_fields', type: 'form', required: true, description: 'Name, email, phone, message fields' },
      { name: 'submit_button', type: 'button', required: true, description: 'Submit CTA', example: 'Send Message' },
      { name: 'contact_info', type: 'list', required: false, description: 'Phone, email, address', example: '📞 (555) 123-4567 | ✉️ hello@company.com' },
      { name: 'map', type: 'map', required: false, description: 'Location map embed' },
    ],
    variations: [
      {
        id: 'contact-split-form-info',
        name: 'Split Form + Info',
        description: 'Two-column layout: form on one side, contact details on the other',
        layout: 'split-screen',
        style: 'minimal',
        cssHints: [
          'grid md:grid-cols-2 gap-12',
          'form side: space-y-4',
          'info side: contact details + map',
        ],
        skeleton: `<section class="py-20 md:py-28 bg-background" id="contact">
  <div class="max-w-6xl mx-auto px-4">
    <div class="text-center mb-16">
      <span class="text-primary text-sm font-semibold uppercase tracking-wider">Contact</span>
      <h2 class="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4"><!-- TITLE --></h2>
      <p class="text-lg text-muted-foreground max-w-2xl mx-auto"><!-- DESCRIPTION --></p>
    </div>
    <div class="grid md:grid-cols-2 gap-12">
      <form class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <input type="text" placeholder="First Name" class="px-4 py-3 rounded-lg border border-border bg-background text-foreground" required />
          <input type="text" placeholder="Last Name" class="px-4 py-3 rounded-lg border border-border bg-background text-foreground" required />
        </div>
        <input type="email" placeholder="Email Address" class="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground" required />
        <input type="tel" placeholder="Phone (optional)" class="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground" />
        <textarea placeholder="Your Message" rows="5" class="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground resize-none" required></textarea>
        <button type="submit" class="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity" data-ut-intent="contact.submit">Send Message</button>
      </form>
      <div class="space-y-8">
        <div class="space-y-4">
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">📍</div>
            <div><h4 class="font-semibold text-foreground">Address</h4><p class="text-muted-foreground">123 Business St, City, ST 12345</p></div>
          </div>
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">📞</div>
            <div><h4 class="font-semibold text-foreground">Phone</h4><p class="text-muted-foreground">(555) 123-4567</p></div>
          </div>
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">✉️</div>
            <div><h4 class="font-semibold text-foreground">Email</h4><p class="text-muted-foreground">hello@company.com</p></div>
          </div>
        </div>
        <div class="aspect-video rounded-xl bg-muted overflow-hidden"><!-- MAP EMBED --></div>
      </div>
    </div>
  </div>
</section>`,
        bestFor: ['Service businesses', 'Agencies', 'Local businesses', 'Most common contact layout'],
        popularity: 90,
      },
    ],
    conversion: {
      goal: 'Capture leads and inquiries',
      recommendedIntent: 'contact.submit',
      placementTips: [
        'Place near the bottom of the page, above the footer',
        'Always include an anchor link from the navbar',
        'Show contact info alongside the form for users who prefer other channels',
      ],
      copyGuidelines: [
        'Keep fields minimal — name, email, message is often enough',
        'Phone should be optional',
        'Button: "Send Message", "Get in Touch", "Submit Inquiry"',
        'Add placeholder text in fields for guidance',
      ],
      abInsights: [
        '4 fields or fewer increases completion by 25%',
        'Side-by-side form + info converts better than form-only',
        'Including phone number in contact info reduces form friction (users can call instead)',
      ],
    },
    a11y: {
      ariaRequirements: ['<label> for each input (can be sr-only)', 'aria-required for required fields', 'Form validation feedback'],
      keyboardNav: 'Tab through fields, Enter to submit',
    },
    seo: {
      semanticElements: ['<section>', '<form>', '<label>', '<input>'],
      schemaType: 'ContactPage',
    },
    responsive: {
      mobile: 'Stack form above contact info, single column',
      desktop: 'Side-by-side split layout',
    },
    tags: ['contact', 'form', 'lead-capture', 'email', 'phone', 'map', 'address'],
    frequencyScore: 90,
  },

  // ========================================================================
  // FAQ ACCORDION
  // ========================================================================
  {
    id: 'faq-accordion',
    name: 'FAQ Accordion Section',
    description: 'Expandable FAQ accordion — addresses objections and reduces support load. Present on 60%+ of websites.',
    category: 'forms',
    subCategory: 'faq',
    industryAffinity: ['universal', 'saas', 'ecommerce', 'coaching', 'local-service'],
    contentSlots: [
      { name: 'section_title', type: 'heading', required: true, description: 'Section heading', example: 'Frequently Asked Questions' },
      { name: 'faq_items', type: 'list', required: true, description: '5-8 question + answer pairs' },
      { name: 'cta_text', type: 'text', required: false, description: 'Still have questions prompt', example: 'Still have questions? Contact us.' },
    ],
    variations: [
      {
        id: 'faq-simple-accordion',
        name: 'Simple Accordion',
        description: 'Clean accordion with toggle arrows — straightforward and accessible',
        layout: 'contained',
        style: 'minimal',
        cssHints: [
          'max-w-3xl mx-auto',
          'divide-y divide-border',
          'question: py-5 flex justify-between items-center cursor-pointer font-semibold',
          'answer: pb-5 text-muted-foreground hidden/shown toggle',
        ],
        skeleton: `<section class="py-20 md:py-28 bg-background">
  <div class="max-w-3xl mx-auto px-4">
    <div class="text-center mb-16">
      <span class="text-primary text-sm font-semibold uppercase tracking-wider">FAQ</span>
      <h2 class="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">Frequently Asked Questions</h2>
    </div>
    <div class="divide-y divide-border">
      <div class="faq-item">
        <button class="w-full py-5 flex justify-between items-center text-left font-semibold text-foreground hover:text-primary transition-colors" data-no-intent>
          <span><!-- QUESTION --></span>
          <span class="text-xl transition-transform duration-200">+</span>
        </button>
        <div class="pb-5 text-muted-foreground leading-relaxed hidden"><!-- ANSWER --></div>
      </div>
      <!-- REPEAT 5-8x -->
    </div>
    <div class="text-center mt-12">
      <p class="text-muted-foreground">Still have questions?</p>
      <a class="text-primary font-semibold hover:underline" data-ut-intent="contact.submit">Contact us</a>
    </div>
  </div>
</section>`,
        bestFor: ['Any website', 'Below pricing', 'Product pages'],
        popularity: 85,
      },
      {
        id: 'faq-two-column',
        name: 'Two-Column FAQ',
        description: 'FAQ split into two columns for pages with many questions',
        layout: 'grid-2',
        style: 'minimal',
        cssHints: ['grid md:grid-cols-2 gap-8', 'each column: divide-y divide-border'],
        skeleton: `<section class="py-20 md:py-28 bg-muted/20">
  <div class="max-w-6xl mx-auto px-4">
    <div class="text-center mb-16">
      <h2 class="text-3xl md:text-4xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
    </div>
    <div class="grid md:grid-cols-2 gap-8">
      <div class="divide-y divide-border"><!-- LEFT COLUMN FAQs --></div>
      <div class="divide-y divide-border"><!-- RIGHT COLUMN FAQs --></div>
    </div>
  </div>
</section>`,
        bestFor: ['Sites with 8+ FAQs', 'SaaS', 'Ecommerce'],
        popularity: 55,
      },
    ],
    conversion: {
      goal: 'Remove objections and build confidence',
      placementTips: [
        'Place after pricing or before the final CTA',
        'Address the most common customer concerns',
        'Include a "Contact us" CTA at the bottom',
      ],
      copyGuidelines: [
        'Questions: Write from the customer\'s perspective ("How do I...", "What happens if...")',
        'Answers: Concise but complete, 2-4 sentences',
        '5-8 questions is the sweet spot',
        'Include pricing, refund, and getting-started questions',
      ],
      abInsights: [
        'FAQs below pricing increase conversion by 12%',
        'Pages with FAQ have 15% lower bounce rate',
        'First FAQ should address the #1 objection',
      ],
    },
    a11y: {
      ariaRequirements: ['aria-expanded on toggle buttons', 'aria-controls linking button to panel', 'role="region" on answer panels'],
      keyboardNav: 'Enter/Space to toggle, focus management',
    },
    seo: {
      semanticElements: ['<section>', '<h2>', '<button>', '<div[role=region]>'],
      schemaType: 'FAQPage',
    },
    responsive: {
      mobile: 'Single column, full-width accordions',
      desktop: 'Single column centered (max-w-3xl) or two-column for many FAQs',
    },
    tags: ['faq', 'accordion', 'questions', 'answers', 'support', 'objection-handling'],
    frequencyScore: 80,
  },
];
