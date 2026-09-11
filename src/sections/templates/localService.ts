/**
 * Local Service, Contractor & Real Estate Template Compositions
 *
 * These industries previously borrowed the agency composition, which meant a
 * roofing company shipped a creative-studio site. Each now owns a first-class
 * composition with its own theme, section order, copy and conversion intents.
 */
import type { TemplateComposition } from '../types';

export const LOCAL_SERVICE_COMPOSITIONS: TemplateComposition[] = [
  // ──────────────────────────────────────────────
  // Contractor — trade work, quote-led, proof heavy
  // ──────────────────────────────────────────────
  {
    id: 'contractor-trade',
    name: 'Contractor Trade',
    category: 'agency',
    industry: 'contractor',
    systemType: 'agency',
    description: 'Quote-led layout for builders, roofers, electricians and trade contractors.',
    tags: ['contractor', 'trade', 'quote', 'local', 'services'],
    theme: {
      colors: {
        primary: '24 92% 46%',
        primaryForeground: '0 0% 100%',
        secondary: '215 28% 17%',
        secondaryForeground: '0 0% 100%',
        accent: '42 96% 52%',
        accentForeground: '215 30% 12%',
        background: '0 0% 100%',
        foreground: '215 30% 12%',
        muted: '215 20% 96%',
        mutedForeground: '215 14% 42%',
        card: '0 0% 100%',
        cardForeground: '215 30% 12%',
        border: '215 18% 88%',
      },
      typography: {
        headingFont: "'Archivo Black', sans-serif",
        bodyFont: "'Hind', sans-serif",
        headingWeight: '400',
        bodyWeight: '400',
      },
      radius: '0.375rem',
      sectionPadding: '5.5rem 1.5rem',
      containerWidth: '1200px',
    },
    sections: [
      {
        id: 'contractor-trade-nav',
        type: 'navbar',
        variantId: 'navbar:standard',
        props: {
          layout: 'standard',
          brand: 'Ironhill Contracting',
          sticky: true,
          links: [
            { label: 'Services', href: '#services' },
            { label: 'Projects', href: '#gallery' },
            { label: 'Reviews', href: '#testimonials' },
            { label: 'About', href: '#about' },
          ],
          cta: { label: 'Get a Free Quote', href: '#contact', intent: 'quote.request', variant: 'primary' },
        },
      },
      {
        id: 'contractor-trade-hero',
        type: 'hero',
        variantId: 'hero:full-bleed',
        props: {
          layout: 'full-bleed',
          badge: 'Licensed, bonded & insured',
          headline: 'Built Right The First Time',
          subheadline: 'Residential and commercial construction across the county — fixed quotes, clean sites, and work that passes inspection first time.',
          backgroundImage: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1600&q=80',
          ctas: [
            { label: 'Get a Free Quote', href: '#contact', intent: 'quote.request', variant: 'primary' },
            { label: 'Call the Yard', href: 'tel:+15551234567', intent: 'contact.call', variant: 'outline' },
          ],
          stats: [
            { value: '25 yrs', label: 'On the tools' },
            { value: '600+', label: 'Projects completed' },
            { value: '4.9★', label: 'Average review' },
          ],
        },
      },
      {
        id: 'contractor-trade-services',
        type: 'services',
        variantId: 'services:card-grid',
        props: {
          headline: 'What We Take On',
          subheadline: 'One licensed crew, start to finish. No subcontractor roulette.',
          columns: 3,
          layout: 'grid',
          items: [
            { title: 'Roofing & Gutters', description: 'Full tear-offs, re-roofs and storm repairs with manufacturer-backed warranties.', icon: '🏠', cta: { label: 'Get a Quote', intent: 'quote.request', variant: 'ghost' } },
            { title: 'Kitchen & Bath Remodels', description: 'Design, permits, trades and finish work handled under a single fixed price.', icon: '🛠️', badge: 'Most requested', cta: { label: 'Get a Quote', intent: 'quote.request', variant: 'ghost' } },
            { title: 'Additions & Extensions', description: 'Structural work, framing and build-out that adds real square footage and value.', icon: '📐', cta: { label: 'Get a Quote', intent: 'quote.request', variant: 'ghost' } },
            { title: 'Decks & Outdoor Builds', description: 'Composite and hardwood decks, pergolas and outdoor kitchens built to code.', icon: '🪵', cta: { label: 'Get a Quote', intent: 'quote.request', variant: 'ghost' } },
            { title: 'Emergency Repairs', description: 'Storm, water and structural damage stabilised same day, insurance paperwork included.', icon: '🚨', cta: { label: 'Call Now', intent: 'contact.call', variant: 'ghost' } },
            { title: 'Commercial Fit-Out', description: 'Retail and office build-outs scheduled around your trading hours.', icon: '🏗️', cta: { label: 'Get a Quote', intent: 'quote.request', variant: 'ghost' } },
          ],
        },
      },
      {
        id: 'contractor-trade-stats',
        type: 'stats',
        props: {
          layout: 'row',
          items: [
            { value: '25 yrs', label: 'In business', icon: '🔨' },
            { value: '600+', label: 'Jobs completed', icon: '✅' },
            { value: '100%', label: 'Licensed & insured', icon: '🛡️' },
            { value: '48 hrs', label: 'Average quote turnaround', icon: '⏱️' },
          ],
        },
      },
      {
        id: 'contractor-trade-gallery',
        type: 'gallery',
        variantId: 'gallery:cinematic-grid',
        props: {
          headline: 'Recent Projects',
          subheadline: 'Finished work from the last twelve months',
          columns: 3,
          filterable: false,
          items: [
            { src: 'https://images.unsplash.com/photo-1523413363574-c30aa1c2a516?w=800&q=80', alt: 'Completed roof replacement', caption: 'Full re-roof — Maple Ridge' },
            { src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', alt: 'Renovated kitchen', caption: 'Kitchen remodel — Elm Street' },
            { src: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&q=80', alt: 'Home extension framing', caption: 'Two-storey addition — Brookside' },
            { src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80', alt: 'Bathroom renovation', caption: 'Master bath — Cedar Park' },
            { src: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80', alt: 'New composite deck', caption: 'Composite deck — Lakeview' },
            { src: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80', alt: 'Commercial fit out', caption: 'Retail fit-out — Main & 4th' },
          ],
        },
      },
      {
        id: 'contractor-trade-testimonials',
        type: 'testimonials',
        variantId: 'testimonials:grid',
        props: {
          headline: 'What Homeowners Say',
          layout: 'grid',
          items: [
            { quote: 'They quoted on the Tuesday, started the following Monday and finished a day early. Site was swept every evening.', author: 'Karen M.', role: 'Maple Ridge', rating: 5 },
            { quote: 'Two other contractors ghosted us. Ironhill turned up, priced it honestly and handled the permit themselves.', author: 'Dev P.', role: 'Brookside', rating: 5 },
            { quote: 'Storm took half our roof off. They tarped it the same night and had it rebuilt within the week.', author: 'Tom & Alice R.', role: 'Cedar Park', rating: 5 },
          ],
        },
      },
      {
        id: 'contractor-trade-about',
        type: 'about',
        props: {
          headline: 'A Crew, Not a Call Centre',
          body: 'Ironhill has been building in this county since 1999. The person who quotes your job is on site while it is built, and you have their number for the life of the warranty.',
          image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=900&q=80',
        },
      },
      {
        id: 'contractor-trade-faq',
        type: 'faq',
        variantId: 'faq:accordion',
        props: {
          headline: 'Before You Book',
          items: [
            { question: 'Is the quote fixed?', answer: 'Yes. Once we have surveyed the property the written quote is the price, unless you change the scope in writing.' },
            { question: 'Do you handle permits?', answer: 'We file and manage all permits and inspections as part of the job.' },
            { question: 'How soon can you start?', answer: 'Most jobs start within two to four weeks. Emergency repairs are attended the same day.' },
            { question: 'What warranty do I get?', answer: 'Ten years on workmanship plus the manufacturer warranty on materials.' },
          ],
        },
      },
      {
        id: 'contractor-trade-cta',
        type: 'cta',
        variantId: 'cta:split-card',
        props: {
          layout: 'split',
          headline: 'Get Your Free On-Site Quote',
          description: 'Send us the job and we will survey the property and put a fixed price in writing within 48 hours.',
          ctas: [
            { label: 'Request a Quote', intent: 'quote.request', variant: 'primary' },
            { label: 'Call the Yard', href: 'tel:+15551234567', intent: 'contact.call', variant: 'outline' },
          ],
        },
      },
      {
        id: 'contractor-trade-contact',
        type: 'contact',
        variantId: 'contact:quote-request',
        props: {
          layout: 'split',
          headline: 'Tell Us About the Job',
          description: 'The more detail you give us, the more accurate the first number will be.',
          submitLabel: 'Request a Quote',
          submitIntent: 'quote.request',
          phone: '(555) 123-4567',
          email: 'quotes@ironhill.build',
          fields: [
            { name: 'name', type: 'text', placeholder: 'Your name', required: true },
            { name: 'phone', type: 'text', placeholder: 'Best number to reach you', required: true },
            { name: 'address', type: 'text', placeholder: 'Property address', required: false },
            { name: 'service', type: 'text', placeholder: 'What needs doing?', required: true },
            { name: 'message', type: 'textarea', placeholder: 'Access, timings, anything we should know', required: false },
          ],
        },
      },
      {
        id: 'contractor-trade-footer',
        type: 'footer',
        variantId: 'footer:dark-band',
        props: {
          layout: 'dark-band',
          brand: 'Ironhill Contracting',
          copyright: '© 2026 Ironhill Contracting. License #CB-448120.',
          newsletter: false,
          columns: [
            { title: 'Services', links: [{ label: 'Roofing', href: '#services' }, { label: 'Remodels', href: '#services' }, { label: 'Emergency Repairs', href: '#services' }] },
            { title: 'Company', links: [{ label: 'About', href: '#about' }, { label: 'Projects', href: '#gallery' }, { label: 'Reviews', href: '#testimonials' }] },
            { title: 'Contact', links: [{ label: '(555) 123-4567', href: 'tel:+15551234567' }, { label: 'quotes@ironhill.build', href: 'mailto:quotes@ironhill.build' }] },
          ],
          socials: [{ platform: 'facebook', url: '#' }, { platform: 'instagram', url: '#' }],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────
  // Local service — dispatch-led, availability forward
  // ──────────────────────────────────────────────
  {
    id: 'local-service-dispatch',
    name: 'Local Service Dispatch',
    category: 'agency',
    industry: 'local-service',
    systemType: 'agency',
    description: 'Availability-forward layout for plumbers, HVAC, cleaning and mobile service businesses.',
    tags: ['local-service', 'dispatch', 'booking', 'callout', 'services'],
    theme: {
      colors: {
        primary: '199 89% 40%',
        primaryForeground: '0 0% 100%',
        secondary: '199 30% 94%',
        secondaryForeground: '200 40% 16%',
        accent: '160 72% 40%',
        accentForeground: '0 0% 100%',
        background: '0 0% 100%',
        foreground: '200 35% 14%',
        muted: '200 22% 96%',
        mutedForeground: '200 12% 44%',
        card: '200 25% 99%',
        cardForeground: '200 35% 14%',
        border: '200 20% 88%',
      },
      typography: {
        headingFont: "'Outfit', sans-serif",
        bodyFont: "'Figtree', sans-serif",
        headingWeight: '700',
        bodyWeight: '400',
      },
      radius: '0.75rem',
      sectionPadding: '5rem 1.5rem',
      containerWidth: '1160px',
    },
    sections: [
      {
        id: 'local-service-dispatch-nav',
        type: 'navbar',
        variantId: 'navbar:standard',
        props: {
          layout: 'standard',
          brand: 'Bluewater Home Services',
          sticky: true,
          links: [
            { label: 'Services', href: '#services' },
            { label: 'Pricing', href: '#pricing' },
            { label: 'Service Area', href: '#about' },
            { label: 'Reviews', href: '#testimonials' },
          ],
          cta: { label: 'Book a Visit', href: '#booking', intent: 'booking.create', variant: 'primary' },
        },
      },
      {
        id: 'local-service-dispatch-hero',
        type: 'hero',
        variantId: 'hero:split-image',
        props: {
          layout: 'split',
          badge: 'Same-day slots available today',
          headline: 'A Technician At Your Door, Not On Hold',
          subheadline: 'Plumbing, heating and cooling handled by local technicians with upfront pricing and two-hour arrival windows.',
          image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1000&q=80',
          ctas: [
            { label: 'Book a Visit', href: '#booking', intent: 'booking.create', variant: 'primary' },
            { label: 'Call Dispatch', href: 'tel:+15559876543', intent: 'contact.call', variant: 'outline' },
          ],
          stats: [
            { value: '2 hr', label: 'Arrival window' },
            { value: 'Same day', label: 'Emergency callouts' },
            { value: 'No', label: 'Overtime surcharge' },
          ],
        },
      },
      {
        id: 'local-service-dispatch-services',
        type: 'services',
        variantId: 'services:alternating',
        props: {
          headline: 'What We Fix',
          subheadline: 'Priced before we start, never after.',
          columns: 3,
          layout: 'alternating',
          items: [
            { title: 'Plumbing Repairs', description: 'Leaks, blockages, burst pipes and fixture replacement, diagnosed on the first visit.', icon: '🚰', cta: { label: 'Book a Visit', intent: 'booking.create', variant: 'ghost' } },
            { title: 'Heating & Cooling', description: 'Furnace and AC servicing, repairs and replacements with seasonal tune-up plans.', icon: '🌡️', badge: 'Popular', cta: { label: 'Book a Visit', intent: 'booking.create', variant: 'ghost' } },
            { title: 'Water Heaters', description: 'Tank and tankless installs, same-day replacement on most common models.', icon: '🔥', cta: { label: 'Book a Visit', intent: 'booking.create', variant: 'ghost' } },
            { title: 'Drain Cleaning', description: 'Camera inspection and jetting for recurring blockages, with before-and-after footage.', icon: '🌀', cta: { label: 'Book a Visit', intent: 'booking.create', variant: 'ghost' } },
            { title: 'Emergency Callout', description: 'Nights, weekends and holidays covered at the same hourly rate.', icon: '🚨', cta: { label: 'Call Dispatch', intent: 'contact.call', variant: 'ghost' } },
            { title: 'Maintenance Plans', description: 'Two visits a year, priority scheduling and 15% off every repair.', icon: '📅', cta: { label: 'See Plans', href: '#pricing', variant: 'ghost' } },
          ],
        },
      },
      {
        id: 'local-service-dispatch-stats',
        type: 'stats',
        props: {
          layout: 'row',
          items: [
            { value: '18 min', label: 'Average call answer', icon: '📞' },
            { value: '11', label: 'Local technicians', icon: '👷' },
            { value: '4.9★', label: 'From 1,200 reviews', icon: '⭐' },
            { value: '1 yr', label: 'Repair warranty', icon: '🛡️' },
          ],
        },
      },
      {
        id: 'local-service-dispatch-pricing',
        type: 'pricing',
        variantId: 'pricing:tiers',
        props: {
          headline: 'Straightforward Rates',
          subheadline: 'Diagnostic fee waived when you go ahead with the repair.',
          tiers: [
            { name: 'Standard Callout', price: '$89', features: ['Two-hour window', 'Full diagnosis', 'Written quote before work starts'], cta: { label: 'Book a Visit', intent: 'booking.create' } },
            { name: 'Priority Same-Day', price: '$149', features: ['Arrival within four hours', 'Evening slots included', 'Diagnostic fee waived on repair'], cta: { label: 'Book a Visit', intent: 'booking.create' }, highlighted: true },
            { name: 'Care Plan', price: '$29/mo', features: ['Two maintenance visits a year', 'Priority scheduling', '15% off all repairs'], cta: { label: 'Join the Plan', intent: 'checkout.start' } },
          ],
        },
      },
      {
        id: 'local-service-dispatch-testimonials',
        type: 'testimonials',
        variantId: 'testimonials:rail',
        props: {
          headline: 'Neighbours Who Called Us',
          layout: 'carousel',
          items: [
            { quote: 'Burst pipe at 11pm. Someone answered, someone arrived, and the price was the price they quoted on the phone.', author: 'Rosa L.', role: 'Northside', rating: 5 },
            { quote: 'They showed me the camera footage of the blocked drain before quoting. No upselling at all.', author: 'Michael T.', role: 'Harbour View', rating: 5 },
            { quote: 'Care plan has paid for itself twice over. The AC tune-up caught a fault before summer.', author: 'Jenna W.', role: 'Old Mill', rating: 5 },
          ],
        },
      },
      {
        id: 'local-service-dispatch-about',
        type: 'about',
        props: {
          headline: 'Serving This County Since 2008',
          body: 'Every technician is employed, background-checked and paid hourly — never on commission — so the fix you are quoted is the fix you need.',
          image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=900&q=80',
        },
      },
      {
        id: 'local-service-dispatch-faq',
        type: 'faq',
        variantId: 'faq:accordion',
        props: {
          headline: 'Common Questions',
          items: [
            { question: 'Do you charge extra at nights or weekends?', answer: 'No. The hourly rate is the same whenever you call.' },
            { question: 'How does the arrival window work?', answer: 'You get a two-hour window plus a text when the technician is on the way.' },
            { question: 'What areas do you cover?', answer: 'The whole county plus a twenty-mile radius. Give us your postcode and dispatch will confirm.' },
          ],
        },
      },
      {
        id: 'local-service-dispatch-cta',
        type: 'cta',
        variantId: 'cta:sticky-bar',
        props: {
          layout: 'banner',
          headline: 'Need someone today?',
          description: 'Same-day slots are still open.',
          ctas: [
            { label: 'Book a Visit', intent: 'booking.create', variant: 'primary' },
            { label: 'Call Dispatch', href: 'tel:+15559876543', intent: 'contact.call', variant: 'outline' },
          ],
        },
      },
      {
        id: 'local-service-dispatch-contact',
        type: 'contact',
        variantId: 'contact:split-card',
        props: {
          layout: 'split-card',
          headline: 'Book a Technician',
          description: 'Tell us the problem and your postcode and dispatch will confirm your window.',
          submitLabel: 'Request a Visit',
          submitIntent: 'booking.create',
          phone: '(555) 987-6543',
          email: 'dispatch@bluewaterhome.com',
          fields: [
            { name: 'name', type: 'text', placeholder: 'Your name', required: true },
            { name: 'phone', type: 'text', placeholder: 'Mobile number', required: true },
            { name: 'postcode', type: 'text', placeholder: 'Postcode', required: true },
            { name: 'issue', type: 'textarea', placeholder: 'What is going wrong?', required: true },
          ],
        },
      },
      {
        id: 'local-service-dispatch-footer',
        type: 'footer',
        variantId: 'footer:columns',
        props: {
          layout: 'columns',
          brand: 'Bluewater Home Services',
          copyright: '© 2026 Bluewater Home Services. Licensed & insured.',
          newsletter: false,
          columns: [
            { title: 'Services', links: [{ label: 'Plumbing', href: '#services' }, { label: 'Heating & Cooling', href: '#services' }, { label: 'Drain Cleaning', href: '#services' }] },
            { title: 'Plans', links: [{ label: 'Pricing', href: '#pricing' }, { label: 'Care Plan', href: '#pricing' }] },
            { title: 'Contact', links: [{ label: '(555) 987-6543', href: 'tel:+15559876543' }, { label: 'dispatch@bluewaterhome.com', href: 'mailto:dispatch@bluewaterhome.com' }] },
          ],
          socials: [{ platform: 'facebook', url: '#' }],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────
  // Real estate — listing-led, valuation as the conversion
  // ──────────────────────────────────────────────
  {
    id: 'real-estate-listings',
    name: 'Real Estate Listings',
    category: 'agency',
    industry: 'real-estate',
    systemType: 'agency',
    description: 'Listing-forward layout for estate agents, brokerages and property teams.',
    tags: ['real-estate', 'property', 'listings', 'valuation', 'agency'],
    theme: {
      colors: {
        primary: '158 42% 24%',
        primaryForeground: '40 30% 96%',
        secondary: '40 30% 94%',
        secondaryForeground: '158 42% 18%',
        accent: '36 62% 52%',
        accentForeground: '158 45% 12%',
        background: '40 25% 98%',
        foreground: '158 20% 12%',
        muted: '40 20% 94%',
        mutedForeground: '158 10% 42%',
        card: '0 0% 100%',
        cardForeground: '158 20% 12%',
        border: '40 18% 87%',
      },
      typography: {
        headingFont: "'Cormorant Garamond', serif",
        bodyFont: "'Karla', sans-serif",
        headingWeight: '600',
        bodyWeight: '400',
      },
      radius: '0.25rem',
      sectionPadding: '6rem 1.5rem',
      containerWidth: '1240px',
    },
    sections: [
      {
        id: 'real-estate-listings-nav',
        type: 'navbar',
        variantId: 'navbar:centered-logo',
        props: {
          layout: 'centered-logo',
          brand: 'Ardenwood & Co.',
          sticky: true,
          links: [
            { label: 'Listings', href: '#gallery' },
            { label: 'Selling', href: '#services' },
            { label: 'Our Team', href: '#team' },
            { label: 'Journal', href: '#about' },
          ],
          cta: { label: 'Book a Valuation', href: '#booking', intent: 'booking.create', variant: 'primary' },
        },
      },
      {
        id: 'real-estate-listings-hero',
        type: 'hero',
        variantId: 'hero:full-bleed',
        props: {
          layout: 'full-bleed',
          badge: 'Independent since 1984',
          headline: 'Homes Worth The Move',
          subheadline: 'A boutique brokerage handling town and country property, with valuations grounded in what actually sold on your street.',
          backgroundImage: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1600&q=80',
          ctas: [
            { label: 'Book a Valuation', href: '#booking', intent: 'booking.create', variant: 'primary' },
            { label: 'Browse Listings', href: '#gallery', intent: 'nav.goto', variant: 'outline' },
          ],
          stats: [
            { value: '98%', label: 'Of asking achieved' },
            { value: '31 days', label: 'Average time to offer' },
            { value: '40 yrs', label: 'In the area' },
          ],
        },
      },
      {
        id: 'real-estate-listings-gallery',
        type: 'gallery',
        variantId: 'gallery:editorial-mosaic',
        props: {
          headline: 'Current Listings',
          subheadline: 'A selection of what is on the market this week',
          columns: 3,
          filterable: true,
          items: [
            { src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80', alt: 'Period townhouse', caption: 'Chapel Row — 4 bed townhouse · $845,000' },
            { src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', alt: 'Modern family home', caption: 'Kestrel Lane — 5 bed new build · $1,120,000' },
            { src: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80', alt: 'Country house', caption: 'Ardenwood Grange — 6 bed estate · $2,400,000' },
            { src: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80', alt: 'Riverside cottage', caption: 'Mill Cottage — 3 bed riverside · $615,000' },
            { src: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80', alt: 'City apartment', caption: 'The Foundry — 2 bed loft · $478,000' },
            { src: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=800&q=80', alt: 'Suburban home', caption: 'Willow Drive — 4 bed detached · $720,000' },
          ],
        },
      },
      {
        id: 'real-estate-listings-services',
        type: 'services',
        variantId: 'services:compact-list',
        props: {
          headline: 'How We Work',
          subheadline: 'Selling, buying and letting handled by the same named agent throughout.',
          columns: 3,
          layout: 'list',
          items: [
            { title: 'Free Valuation', description: 'An in-person appraisal with comparable sales evidence, no obligation to instruct.', icon: '📋', cta: { label: 'Book a Valuation', intent: 'booking.create', variant: 'ghost' } },
            { title: 'Sales & Marketing', description: 'Professional photography, floor plans, drone footage and portal-wide listing.', icon: '📸', cta: { label: 'Talk to Us', intent: 'contact.submit', variant: 'ghost' } },
            { title: 'Buyer Representation', description: 'Off-market access and negotiation on your side of the table.', icon: '🔑', cta: { label: 'Register Interest', intent: 'lead.submit', variant: 'ghost' } },
            { title: 'Lettings & Management', description: 'Tenant vetting, compliance and full property management under one fee.', icon: '🏘️', cta: { label: 'Talk to Us', intent: 'contact.submit', variant: 'ghost' } },
          ],
        },
      },
      {
        id: 'real-estate-listings-stats',
        type: 'stats',
        props: {
          layout: 'row',
          items: [
            { value: '98%', label: 'Of asking price', icon: '📈' },
            { value: '31 days', label: 'To offer', icon: '📆' },
            { value: '400+', label: 'Sales last year', icon: '🏡' },
            { value: '1.2%', label: 'Flat commission', icon: '💷' },
          ],
        },
      },
      {
        id: 'real-estate-listings-team',
        type: 'team',
        props: {
          headline: 'Your Named Agents',
          subheadline: 'You deal with the person who valued your home, start to finish.',
          columns: 3,
          members: [
            { name: 'Helena Ardenwood', role: 'Principal Agent', bio: 'Third-generation agent covering the town and surrounding villages.', image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80' },
            { name: 'Samuel Oyelaran', role: 'Head of Sales', bio: 'Specialises in period property and chain negotiation.', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80' },
            { name: 'Freya Lindqvist', role: 'Lettings Director', bio: 'Manages a portfolio of 180 rental properties across the county.', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80' },
          ],
        },
      },
      {
        id: 'real-estate-listings-testimonials',
        type: 'testimonials',
        variantId: 'testimonials:spotlight',
        props: {
          headline: 'Sold & Settled',
          layout: 'single',
          items: [
            { quote: 'Three viewings, two offers, above asking. Helena handled the chain when it wobbled and it completed on time.', author: 'The Whitmores', role: 'Chapel Row', rating: 5 },
            { quote: 'They talked us out of over-pricing it. Sold in nineteen days at a number we were delighted with.', author: 'Ade & Nia B.', role: 'Willow Drive', rating: 5 },
            { quote: 'As buyers we were shown two houses before they hit the portals. That is worth the relationship alone.', author: 'Dr. Kaur', role: 'Kestrel Lane', rating: 5 },
          ],
        },
      },
      {
        id: 'real-estate-listings-faq',
        type: 'faq',
        variantId: 'faq:accordion',
        props: {
          headline: 'Selling Questions',
          items: [
            { question: 'What does a valuation cost?', answer: 'Nothing, and there is no obligation to instruct us afterwards.' },
            { question: 'What is your commission?', answer: 'A flat 1.2% including photography, floor plans and portal listings. No withdrawal fees.' },
            { question: 'How quickly can you list?', answer: 'Photography is usually booked within three working days of instruction.' },
          ],
        },
      },
      {
        id: 'real-estate-listings-cta',
        type: 'cta',
        variantId: 'cta:gradient-banner',
        props: {
          layout: 'banner',
          headline: 'Find Out What Your Home Is Worth',
          description: 'A free, in-person valuation backed by real comparable sales — not an online estimate.',
          ctas: [
            { label: 'Book a Valuation', intent: 'booking.create', variant: 'primary' },
            { label: 'Ask a Question', intent: 'contact.submit', variant: 'outline' },
          ],
        },
      },
      {
        id: 'real-estate-listings-contact',
        type: 'contact',
        variantId: 'contact:centered',
        props: {
          layout: 'centered',
          headline: 'Speak To An Agent',
          description: 'Selling, buying or letting — tell us which and we will call you back today.',
          submitLabel: 'Request a Call Back',
          submitIntent: 'lead.submit',
          phone: '(555) 204-8890',
          email: 'office@ardenwood.co',
          fields: [
            { name: 'name', type: 'text', placeholder: 'Your name', required: true },
            { name: 'phone', type: 'text', placeholder: 'Phone number', required: true },
            { name: 'address', type: 'text', placeholder: 'Property address', required: false },
            { name: 'message', type: 'textarea', placeholder: 'How can we help?', required: false },
          ],
        },
      },
      {
        id: 'real-estate-listings-footer',
        type: 'footer',
        variantId: 'footer:columns',
        props: {
          layout: 'columns',
          brand: 'Ardenwood & Co.',
          copyright: '© 2026 Ardenwood & Co. Registered property agents.',
          newsletter: true,
          columns: [
            { title: 'Property', links: [{ label: 'Listings', href: '#gallery' }, { label: 'Selling', href: '#services' }, { label: 'Lettings', href: '#services' }] },
            { title: 'Office', links: [{ label: 'Our Team', href: '#team' }, { label: 'Journal', href: '#about' }, { label: 'Careers', href: '#' }] },
            { title: 'Contact', links: [{ label: '(555) 204-8890', href: 'tel:+15552048890' }, { label: 'office@ardenwood.co', href: 'mailto:office@ardenwood.co' }] },
          ],
          socials: [{ platform: 'instagram', url: '#' }, { platform: 'linkedin', url: '#' }],
        },
      },
    ],
  },
];
