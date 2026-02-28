/**
 * Industry Page Research Patterns
 *
 * Pre-analysed, research-backed templates for every major industry × page combination.
 * Each `IndustryPagePattern` is derived from studying real top-performing websites in that
 * niche (via web research) and encodes:
 *   - required / optional sections with concrete descriptions
 *   - typical CTA intents and button labels
 *   - micro-copy examples (headlines, subheadlines, CTAs)
 *   - live DuckDuckGo search queries used to augment AI generation at runtime
 *
 * Usage in edge function:
 *   const profile = getIndustryProfile(systemType);
 *   const pattern = matchPagePattern(profile, pageName, navLabel);
 *   const liveResearch = await scrapePageResearch(pattern.searchQueries);
 *   // inject profile.staticContext + liveResearch into the AI prompt
 *
 * @module industryPagePatterns
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface PageSection {
  name: string;
  required: boolean;
  description: string;
  /** Concrete example of what this section's copy / HTML should contain */
  exampleContent?: string;
}

export interface IndustryPagePattern {
  /** Canonical slug used to match `pageName` from WebBuilder nav */
  pageName: string;
  /** Additional nav labels / slugs that map to this pattern */
  aliases: string[];
  /** Short human-readable title for AI prompts */
  displayTitle: string;
  /** Ordered list of sections to generate */
  sections: PageSection[];
  /** CTA button labels and their data-ut-intent values */
  ctaIntents: { label: string; intent: string; dataPath?: string }[];
  /** Micro-copy bank used to enrich generated content */
  copy: {
    headlines: string[];
    subheadlines: string[];
    ctaTexts: string[];
    trustSignals: string[];
  };
  /** DuckDuckGo queries for live research at generation time (≤2 used per request) */
  searchQueries: string[];
  /** Tailwind color hints to apply as defaults when no brand context is available */
  colorHints?: string;
}

export interface IndustryResearchProfile {
  industryId: string;
  displayName: string;
  /** Broad description injected into the AI system prompt */
  industryContext: string;
  terminology: string[];
  trustSignals: string[];
  businessGoals: string[];
  conversionFocus: string[];
  pages: IndustryPagePattern[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────────────

function backNav(label = '← Back to Home'): PageSection {
  return {
    name: 'Back Navigation',
    required: true,
    description: `Fixed top bar with "${label}" link (data-ut-intent="nav.goto" data-ut-path="/index.html") and the site logo.`,
  };
}

function footerSection(): PageSection {
  return {
    name: 'Footer',
    required: true,
    description: 'Full-width footer matching the main page: logo, nav links, contact info, social links, and copyright.',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// RESTAURANT
// ─────────────────────────────────────────────────────────────────────────────

const RESTAURANT: IndustryResearchProfile = {
  industryId: 'restaurant',
  displayName: 'Restaurant / Food & Drink',
  industryContext:
    'Top-performing restaurant websites (Nobu, Joe & The Juice, Noma, Eataly, Sweetgreen) use high-contrast food photography, warm palettes, prominent reservation CTAs, and clear menu structures. Customers visit to: see the menu, make a reservation, find hours/location, and view the ambiance.',
  terminology: ['reservation', 'cuisine', 'specials', 'seasonal menu', 'tasting menu', 'à la carte', 'prix fixe', 'sommelier', 'farm-to-table'],
  trustSignals: ['Michelin stars', 'James Beard Award', 'Zagat rating', 'years in business', 'press mentions', 'chef biography'],
  businessGoals: ['drive reservations', 'promote seasonal specials', 'build brand story', 'facilitate online ordering'],
  conversionFocus: ['booking.create', 'order.created', 'lead.capture'],
  pages: [
    {
      pageName: 'menu',
      aliases: ['our-menu', 'food', 'drinks', 'wine-list', 'view-menu'],
      displayTitle: 'Full Menu',
      sections: [
        backNav('← Back to Home'),
        { name: 'Menu Hero', required: true, description: 'Full-width hero with a mouthwatering food photo and handwritten-style "Our Menu" heading. Include a category filter nav (Starters, Mains, Desserts, Drinks) with data-no-intent.' },
        { name: 'Starters / Appetisers', required: true, description: 'Grid or list of 5–8 items: name, description, price. Use a 2-column card layout with dish photo placeholders.' },
        { name: 'Main Courses', required: true, description: '2-column grid of 8–10 main dishes with name, ingredients, dietary icons (GF, V, VG), and price.' },
        { name: 'Desserts', required: true, description: 'Visually rich 3-column grid showcasing 4–6 desserts with prices.' },
        { name: 'Drinks & Wine', required: true, description: 'Curated cocktails, wine list (red/white/sparkling), soft drinks. Show glass icons and prices.' },
        { name: 'Dietary Filters', required: false, description: 'Filter chips for Vegan, Gluten-Free, Nut-Free, Spicy. data-no-intent on all chips.' },
        { name: 'Call to Reserve', required: true, description: 'Sticky bottom banner: "Love what you see? Reserve your table →" with data-ut-intent="booking.create".' },
        footerSection(),
      ],
      ctaIntents: [
        { label: 'Reserve a Table', intent: 'booking.create' },
        { label: 'Order Online', intent: 'order.created' },
      ],
      copy: {
        headlines: ['A Menu Crafted With Passion', 'Seasonal Ingredients, Timeless Flavours', 'Every Dish Tells a Story'],
        subheadlines: ['Fresh, locally sourced ingredients prepared by our award-winning chef', 'Our menu changes with the seasons to bring you the finest produce'],
        ctaTexts: ['Reserve a Table', 'Order Online', 'View Full Menu'],
        trustSignals: ['Locally sourced ingredients', 'Chef-crafted daily specials', 'Dietary options available'],
      },
      searchQueries: ['restaurant menu page design best practices 2025', 'top restaurant website menu layout features'],
    },
    {
      pageName: 'booking',
      aliases: ['reserve', 'reservations', 'book-a-table', 'reservation'],
      displayTitle: 'Reservations',
      sections: [
        backNav(),
        { name: 'Reservation Hero', required: true, description: 'Intimate dining photo background with overlay text "Reserve Your Table" and sub-copy about the experience.' },
        { name: 'Booking Form', required: true, description: 'Clean card form: date picker, time selector (dropdown of available slots), party size, name, email, phone, special requests textarea. "Confirm Reservation" button with data-ut-intent="booking.create".', exampleContent: 'Date, Time, Party Size (1-10), Name, Email, Phone, Special Requests (dietary needs, celebrations, seating preferences)' },
        { name: 'Private Dining', required: false, description: 'Section showcasing private dining room for events and parties. Includes a "Enquire About Private Events" CTA with data-ut-intent="contact.submit".' },
        { name: 'Opening Hours', required: true, description: 'Clear table of day-by-day opening times: Mon-Thu Lunch/Dinner, Fri-Sat Extended, Sun Brunch.' },
        { name: 'Location & Parking', required: true, description: 'Map placeholder, full address, nearest parking/transit, valet info.' },
        { name: 'Cancellation Policy', required: true, description: '24-hour cancellation policy notice. Request credit card to hold reservation.' },
        footerSection(),
      ],
      ctaIntents: [
        { label: 'Confirm Reservation', intent: 'booking.create' },
        { label: 'Enquire About Private Dining', intent: 'contact.submit' },
      ],
      copy: {
        headlines: ['Reserve Your Table', 'Join Us for an Unforgettable Dining Experience', 'Your Table Awaits'],
        subheadlines: ['Book online in under 60 seconds', 'We look forward to welcoming you'],
        ctaTexts: ['Confirm Reservation', 'Check Availability', 'Book a Table'],
        trustSignals: ['Instant confirmation', 'Free cancellation 24hrs before', 'Over 10,000 happy guests'],
      },
      searchQueries: ['restaurant reservations page design examples 2025', 'best restaurant booking form UX patterns'],
    },
    {
      pageName: 'about',
      aliases: ['our-story', 'about-us', 'the-team', 'chef'],
      displayTitle: 'Our Story',
      sections: [
        backNav(),
        { name: 'Origin Story Hero', required: true, description: 'Warm editorial photo of the chef/founders. Large headline: "Our Story" with founding year.' },
        { name: 'Chef Biography', required: true, description: 'Portrait photo, name, credentials (culinary school, career highlights, awards), and a personal quote in a pull-quote style.' },
        { name: 'Philosophy', required: true, description: 'Three columns: "Our Ingredients", "Our Technique", "Our Community" — each with an icon and 2-3 sentences.' },
        { name: 'Behind the Scenes', required: false, description: 'Photo gallery strip of kitchen prep, local farm visits, chef at work.' },
        { name: 'Press & Awards', required: false, description: 'Logos of publications (NYT, Eater, Forbes), quotes from reviews.' },
        { name: 'CTA to Reserve', required: true, description: '"Experience it yourself" banner with data-ut-intent="booking.create".' },
        footerSection(),
      ],
      ctaIntents: [{ label: 'Reserve a Table', intent: 'booking.create' }],
      copy: {
        headlines: ['Born from a Love of Food', 'Where Tradition Meets Innovation', 'A Passion for the Plate'],
        subheadlines: ['Our kitchen has been a family affair since 2004', 'Every dish carries the story of where it came from'],
        ctaTexts: ['Reserve a Table', 'Meet the Team', 'Read Our Story'],
        trustSignals: ['Est. 2004', 'Family-owned', 'Award-winning chef'],
      },
      searchQueries: ['restaurant about us page design 2025 storytelling', 'chef biography page best practices'],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// SALON / BEAUTY
// ─────────────────────────────────────────────────────────────────────────────

const SALON: IndustryResearchProfile = {
  industryId: 'salon',
  displayName: 'Salon & Beauty',
  industryContext:
    'Top-performing beauty websites (Drybar, blow LTD, Regis, Spoke & Weal) use elegant editorial imagery, strong branding, service menu cards with prices, and frictionless online booking. Key user goals: browse services/prices, book an appointment, find location, see stylist work.',
  terminology: ['appointment', 'stylist', 'treatment', 'blowout', 'balayage', 'keratin', 'colourist', 'skin consultation', 'waxing', 'extensions'],
  trustSignals: ['certified stylists', 'years of experience', 'client before/afters', 'product brands used', '5-star reviews'],
  businessGoals: ['drive bookings', 'showcase services with pricing', 'build stylist profiles', 'promote gift cards'],
  conversionFocus: ['booking.create', 'lead.capture'],
  pages: [
    {
      pageName: 'services',
      aliases: ['our-services', 'treatments', 'price-list', 'pricing'],
      displayTitle: 'Services & Pricing',
      sections: [
        backNav(),
        { name: 'Services Hero', required: true, description: 'Elegant hero with editorial salon photo, "Our Services" heading, and category navigation tabs (Hair, Colour, Nails, Skin, Lashes).' },
        { name: 'Hair Services', required: true, description: 'Service cards: Women\'s Cut & Style, Men\'s Cut, Blowout, Updo/Special Occasion. Each card shows service name, description, duration, and starting price with "Book This Service" button.' },
        { name: 'Colour Services', required: true, description: 'Balayage, Highlights, Full Colour, Toning, Keratin Treatment — priced by hair length (short/medium/long).' },
        { name: 'Skin & Beauty', required: false, description: 'Facials, Waxing, Lash Extensions, Brow Services — service cards with prices.' },
        { name: 'Add-On Menu', required: false, description: 'Small extras: Conditioning treatment, Scalp massage, Eyebrow tint — prices shown.' },
        { name: 'Book Appointment CTA', required: true, description: 'Sticky sidebar or bottom banner: "Ready to Book? Choose Your Service" with data-ut-intent="booking.create".' },
        footerSection(),
      ],
      ctaIntents: [
        { label: 'Book This Service', intent: 'booking.create' },
        { label: 'Book an Appointment', intent: 'booking.create' },
      ],
      copy: {
        headlines: ['Discover Our Services', 'Expert Treatments, Exceptional Results', 'Your Beauty, Our Craft'],
        subheadlines: ['From a quick blowout to a full colour transformation', 'All services performed by certified specialists'],
        ctaTexts: ['Book an Appointment', 'Book This Service', 'View Pricing', 'Check Availability'],
        trustSignals: ['Certified stylists', 'Premium products only', 'Satisfaction guaranteed'],
      },
      searchQueries: ['hair salon services price list page design 2025', 'beauty salon website services layout best practices'],
    },
    {
      pageName: 'booking',
      aliases: ['book', 'book-appointment', 'reserve', 'schedule'],
      displayTitle: 'Book an Appointment',
      sections: [
        backNav(),
        { name: 'Booking Hero', required: true, description: 'Clean, minimal hero: "Book Your Appointment" heading with a tagline. No distracting background — keep focus on the form.' },
        { name: 'Step 1 – Choose Service', required: true, description: 'Visual service selector cards (Hair Cut, Colour, Blowout, etc.) with checkboxes. Multi-select allowed.' },
        { name: 'Step 2 – Choose Stylist', required: true, description: 'Stylist profile cards: photo, name, speciality, availability badge. "Any Available Stylist" option included.' },
        { name: 'Step 3 – Date & Time', required: true, description: 'Calendar date picker + time slot grid (09:00–18:00 in 30-min blocks). Highlight available slots in brand colour.' },
        { name: 'Step 4 – Your Details', required: true, description: 'Name, email, phone, additional notes. GDPR consent checkbox.', exampleContent: 'First name, Last name, Email, Phone, Notes (allergies, preferences)' },
        { name: 'Confirmation Preview', required: true, description: 'Summary panel showing chosen service, stylist, date, time, and estimated price before submission. "Confirm Booking" button with data-ut-intent="booking.create".' },
        { name: 'Gift Cards CTA', required: false, description: 'Banner promoting "Give the Gift of Beauty" with data-ut-intent="lead.capture".' },
        footerSection(),
      ],
      ctaIntents: [
        { label: 'Confirm Booking', intent: 'booking.create' },
        { label: 'Buy a Gift Card', intent: 'lead.capture' },
      ],
      copy: {
        headlines: ['Book Your Appointment Online', 'Treat Yourself Today', 'Your Transformation Starts Here'],
        subheadlines: ['Quick and easy — book in under 2 minutes', 'Free cancellation up to 24 hours before'],
        ctaTexts: ['Confirm Booking', 'Check Availability', 'Book Now'],
        trustSignals: ['Free cancellation', 'Instant confirmation email', 'Secure booking'],
      },
      searchQueries: ['hair salon booking page UX 2025 step-by-step', 'beauty appointment booking form best practices'],
    },
    {
      pageName: 'team',
      aliases: ['stylists', 'our-team', 'meet-the-team', 'staff'],
      displayTitle: 'Meet Our Team',
      sections: [
        backNav(),
        { name: 'Team Hero', required: true, description: 'Group editorial photo of all stylists, styled headline "Meet Our Stylists".' },
        { name: 'Stylist Cards Grid', required: true, description: '3-column grid of stylists. Each card: pro photo, name, title, 2-sentence bio, specialities badges, "Book with [Name]" CTA with data-ut-intent="booking.create".' },
        { name: 'Certifications', required: false, description: 'Logos/badges of professional associations and product brand certifications (Olaplex, Kerastase, etc.).' },
        { name: 'Careers CTA', required: false, description: '"Join Our Team" section for stylist recruitment with data-ut-intent="contact.submit".' },
        footerSection(),
      ],
      ctaIntents: [{ label: 'Book with This Stylist', intent: 'booking.create' }],
      copy: {
        headlines: ['Meet Our Expert Stylists', 'The Talented Hands Behind Your Look', 'Your Style is in Safe Hands'],
        subheadlines: ['Our team brings decades of combined experience', 'Certified, passionate, and dedicated to your best look'],
        ctaTexts: ['Book with This Stylist', 'Book an Appointment', 'View Services'],
        trustSignals: ['Certified professionals', 'Ongoing training', 'Friendly & welcoming'],
      },
      searchQueries: ['salon stylist team page design 2025', 'beauty team profiles page layout examples'],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// REAL ESTATE
// ─────────────────────────────────────────────────────────────────────────────

const REALESTATE: IndustryResearchProfile = {
  industryId: 'realestate',
  displayName: 'Real Estate',
  industryContext:
    'Top real estate websites (Compass, Zillow, Douglas Elliman, Sotheby\'s Realty) use large property photography, map-based search, compelling agent profiles, and strong lead-capture CTAs. Users visit to: search listings, contact agents, estimate home values, and explore neighbourhoods.',
  terminology: ['listing', 'MLS', 'days on market', 'asking price', 'offer', 'closing', 'equity', 'escrow', 'neighbourhood', 'market analysis', 'buyer\'s agent', 'staging'],
  trustSignals: ['years of experience', 'homes sold', 'total sales volume', 'client testimonials', 'top producer award', 'neighbourhood specialist'],
  businessGoals: ['generate seller leads', 'capture buyer leads', 'showcase listings', 'build agent brand'],
  conversionFocus: ['lead.capture', 'contact.submit', 'booking.create'],
  pages: [
    {
      pageName: 'listings',
      aliases: ['properties', 'homes', 'for-sale', 'search', 'browse'],
      displayTitle: 'Property Listings',
      sections: [
        backNav(),
        { name: 'Search Hero', required: true, description: 'Large map or cityscape background. Search bar with: Location input, Min/Max Price, Beds, Baths, Property Type dropdown. "Search Properties" button with data-no-intent (filter UI).' },
        { name: 'Filter Bar', required: true, description: 'Horizontal filter pills: For Sale, For Rent | Price Range slider | Beds | Baths | Property Type. All with data-no-intent.' },
        { name: 'Featured Listings Grid', required: true, description: '3-column card grid. Each card: high-quality property photo, price badge, address, beds/baths/sqft icons, "Schedule a Tour" CTA (data-ut-intent="booking.create") and "Save" heart icon.' },
        { name: 'Map View Toggle', required: false, description: 'Map placeholder with pins. Toggle between List/Map view (data-no-intent).' },
        { name: 'Recently Sold', required: false, description: 'Row of recently sold properties showing sale price, reinforcing market activity.' },
        { name: 'Market Insights CTA', required: true, description: '"Get a Free Home Valuation" banner with data-ut-intent="lead.capture".' },
        footerSection(),
      ],
      ctaIntents: [
        { label: 'Schedule a Tour', intent: 'booking.create' },
        { label: 'Get Free Valuation', intent: 'lead.capture' },
        { label: 'Contact Agent', intent: 'contact.submit' },
      ],
      copy: {
        headlines: ['Find Your Dream Home', 'Exceptional Homes for Exceptional Lives', 'Discover Properties in Your Neighbourhood'],
        subheadlines: ['Browse hundreds of listings updated daily', 'From starter homes to luxury estates'],
        ctaTexts: ['Schedule a Tour', 'View Details', 'Get Free Valuation', 'Contact Agent'],
        trustSignals: ['MLS verified listings', 'Updated hourly', '14-day free cancellation on tours'],
      },
      searchQueries: ['real estate listings page design best practices 2025', 'property search results page UX layout'],
    },
    {
      pageName: 'contact',
      aliases: ['contact-agent', 'get-in-touch', 'contact-us'],
      displayTitle: 'Contact an Agent',
      sections: [
        backNav(),
        { name: 'Contact Hero', required: true, description: 'Professional headshot of lead agent with name, title, phone, and email prominently displayed.' },
        { name: 'Contact Form', required: true, description: 'Name, Email, Phone, "I am a" (Buyer/Seller/Investor), Message, Preferred contact time. "Send Message" with data-ut-intent="contact.submit".' },
        { name: 'Schedule a Call', required: false, description: 'Calendar-style time picker for a free consultation call. data-ut-intent="booking.create".' },
        { name: 'Office Locations', required: true, description: 'Cards for each office: address, phone, hours, map embed placeholder.' },
        { name: 'Social Proof', required: false, description: '3 client testimonials with star ratings and property types.' },
        footerSection(),
      ],
      ctaIntents: [
        { label: 'Send Message', intent: 'contact.submit' },
        { label: 'Schedule a Consultation', intent: 'booking.create' },
      ],
      copy: {
        headlines: ['Let\'s Find Your Perfect Home', 'Talk to an Expert Agent', 'Start Your Real Estate Journey'],
        subheadlines: ['No obligation, just expert guidance', 'Respond within 1 business hour'],
        ctaTexts: ['Send Message', 'Schedule a Call', 'Book a Consultation'],
        trustSignals: ['Licensed & insured', 'Responds within 1 hour', 'Free initial consultation'],
      },
      searchQueries: ['real estate agent contact page best practices 2025', 'real estate lead capture form design'],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// CONSULTING
// ─────────────────────────────────────────────────────────────────────────────

const CONSULTING: IndustryResearchProfile = {
  industryId: 'consulting',
  displayName: 'Consulting & Professional Services',
  industryContext:
    'Top consulting websites (McKinsey, Bain, Accenture, boutique firms) demonstrate authority through thought leadership, case studies, structured service offerings, and clear pathways to book a discovery call. Clients are decision-makers who evaluate credibility before reaching out.',
  terminology: ['engagement', 'retainer', 'deliverable', 'ROI', 'KPI', 'strategic roadmap', 'discovery call', 'business transformation', 'advisory', 'implementation'],
  trustSignals: ['Fortune 500 clients', 'years of experience', 'published case studies', 'industry certifications', 'LinkedIn credibility', 'speaking engagements'],
  businessGoals: ['book discovery calls', 'showcase expertise', 'generate qualified leads', 'demonstrate ROI'],
  conversionFocus: ['booking.create', 'lead.capture', 'contact.submit'],
  pages: [
    {
      pageName: 'services',
      aliases: ['solutions', 'what-we-do', 'capabilities', 'expertise'],
      displayTitle: 'Our Services',
      sections: [
        backNav(),
        { name: 'Services Hero', required: true, description: 'Clean, authority-driven hero. Bold headline about transformation/results. Sub-copy on specialisation. Dual CTAs: "Book a Discovery Call" (booking.create) and "View Case Studies" (nav.goto to case-studies).' },
        { name: 'Service Pillars', required: true, description: '3-column icon + text cards for core service lines (e.g., Strategy, Operations, Technology). Each with a 3-bullet outcome list and "Learn More" link.' },
        { name: 'Detailed Service Cards', required: true, description: 'Accordion or tab layout with full descriptions, deliverables, timeline, and typical ROI for each service line.' },
        { name: 'Industries Served', required: true, description: 'Logo grid or industry icons: Finance, Healthcare, Technology, Retail, Manufacturing.' },
        { name: 'Process Overview', required: true, description: 'Numbered 4-step process: Discovery → Strategy → Implementation → Measure. Timeline graphic.' },
        { name: 'Pricing Transparency', required: false, description: 'Engagement models: Project-based, Retainer, Workshop. Starting price ranges or "Request a Quote" cards.' },
        { name: 'Discovery Call CTA', required: true, description: '"Ready to Transform Your Business?" full-width CTA banner with data-ut-intent="booking.create".' },
        footerSection(),
      ],
      ctaIntents: [
        { label: 'Book a Discovery Call', intent: 'booking.create' },
        { label: 'Request a Quote', intent: 'quote.request' },
        { label: 'Get in Touch', intent: 'contact.submit' },
      ],
      copy: {
        headlines: ['Strategic Expertise. Measurable Results.', 'We Solve Your Hardest Business Problems', 'From Strategy to Execution'],
        subheadlines: ['Trusted by 50+ companies across 12 industries', '25+ years of combined leadership experience'],
        ctaTexts: ['Book a Discovery Call', 'See Our Work', 'Get a Free Consultation', 'Request a Proposal'],
        trustSignals: ['Confidential & secure', 'NDA available', 'Fortune 500 experience', 'Certified practitioners'],
      },
      searchQueries: ['consulting firm services page design best practices 2025', 'professional services website layout case studies'],
    },
    {
      pageName: 'case-studies',
      aliases: ['case-study', 'results', 'portfolio', 'work', 'our-work'],
      displayTitle: 'Case Studies',
      sections: [
        backNav(),
        { name: 'Case Studies Hero', required: true, description: '"Real Results for Real Businesses" hero with a key metric stat (e.g., "Avg 3.2× ROI for our clients").' },
        { name: 'Filter by Industry', required: false, description: 'Filter tags: All, Finance, Technology, Retail, Healthcare. data-no-intent.' },
        { name: 'Case Study Cards', required: true, description: '2-column cards. Each: client industry icon, challenge summary, solution brief, key result metrics (e.g., "+45% revenue"), "Read Full Case Study" link.' },
        { name: 'Methodology Note', required: false, description: 'Short paragraph on confidentiality — client names anonymised where requested.' },
        { name: 'Start Your Success Story CTA', required: true, description: 'Full-width CTA: "Ready for results like these?" → data-ut-intent="booking.create".' },
        footerSection(),
      ],
      ctaIntents: [{ label: 'Book a Discovery Call', intent: 'booking.create' }],
      copy: {
        headlines: ['Results That Speak for Themselves', 'Proven Impact Across Industries', 'From Challenge to Competitive Advantage'],
        subheadlines: ['Real transformations. Measurable outcomes. Lasting change.', 'See how we\'ve helped businesses like yours'],
        ctaTexts: ['Read Case Study', 'Book a Discovery Call', 'Talk to an Expert'],
        trustSignals: ['Avg 3.2× ROI', 'Confidential client engagements', '98% client satisfaction'],
      },
      searchQueries: ['consulting case studies page design layout examples 2025', 'professional services results portfolio page'],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// ECOMMERCE
// ─────────────────────────────────────────────────────────────────────────────

const ECOMMERCE: IndustryResearchProfile = {
  industryId: 'ecommerce',
  displayName: 'E-commerce / Online Store',
  industryContext:
    'Top e-commerce sites (Shopify stores, ASOS, Allbirds, Glossier) prioritise product discovery, trust-building (reviews, returns), easy cart UX, and mobile-first checkout. Key conversion factors: fast page load, clear pricing, social proof, urgency signals, and simple navigation.',
  terminology: ['add to cart', 'checkout', 'wishlist', 'free shipping', 'returns policy', 'SKU', 'inventory', 'bundle', 'discount code', 'upsell'],
  trustSignals: ['free returns', 'secure checkout', 'customer reviews', 'money-back guarantee', 'fast shipping', 'SSL badge'],
  businessGoals: ['increase AOV', 'reduce cart abandonment', 'build brand loyalty', 'drive repeat purchases'],
  conversionFocus: ['cart.add', 'pay.checkout', 'cart.checkout', 'lead.capture'],
  pages: [
    {
      pageName: 'products',
      aliases: ['shop', 'store', 'catalogue', 'collection', 'all-products'],
      displayTitle: 'Shop',
      sections: [
        backNav('← Back to Home'),
        { name: 'Shop Header', required: true, description: 'Banner hero image or sale banner. Category navigation: New Arrivals, Best Sellers, Sale, All Products.' },
        { name: 'Filter & Sort', required: true, description: 'Left sidebar or top bar: Category filter, Price range slider, Size, Colour chips, Sort by (Price, Popularity, New). All data-no-intent.' },
        { name: 'Product Grid', required: true, description: '4-column responsive product cards. Each: product photo (hover shows second angle), product name, price (with sale price struck through), star rating, "Add to Cart" button with data-ut-intent="cart.add", wishlist heart.' },
        { name: 'Sale Banner', required: false, description: 'Inline promotional banner between rows: "20% off Sitewide — Use Code: SAVE20". Urgency countdown timer.' },
        { name: 'Load More / Pagination', required: true, description: '"Load More Products" button (data-no-intent) or pagination numbers.' },
        { name: 'Newsletter Signup', required: false, description: '"Get 10% off your first order" email capture with data-ut-intent="newsletter.subscribe".' },
        footerSection(),
      ],
      ctaIntents: [
        { label: 'Add to Cart', intent: 'cart.add' },
        { label: 'Buy Now', intent: 'pay.checkout' },
        { label: 'Get 10% Off', intent: 'newsletter.subscribe' },
      ],
      copy: {
        headlines: ['Shop Our Collection', 'Discover Your New Favourites', 'New Arrivals Just Dropped'],
        subheadlines: ['Free shipping on orders over $50', 'Free returns within 30 days'],
        ctaTexts: ['Add to Cart', 'Buy Now', 'Shop Now', 'Explore Collection'],
        trustSignals: ['Free shipping & returns', '4.8★ from 2,000+ reviews', 'Secure checkout'],
      },
      searchQueries: ['ecommerce product listing page design conversion 2025', 'best online store product grid layout UX'],
    },
    {
      pageName: 'checkout',
      aliases: ['cart', 'order', 'purchase', 'buy'],
      displayTitle: 'Checkout',
      sections: [
        backNav('← Continue Shopping'),
        { name: 'Progress Steps', required: true, description: 'Step indicator: Cart → Shipping → Payment → Confirmation. Clearly show current step.' },
        { name: 'Cart Summary', required: true, description: 'Right panel with line items (product thumbnail, name, quantity stepper, price), subtotal, shipping estimate, discount code field, order total.' },
        { name: 'Shipping Information', required: true, description: 'Form: First/Last Name, Email, Address Line 1&2, City, State/Province, Postal Code, Country. Shipping method selector (Standard Free, Express $9.99).' },
        { name: 'Payment', required: true, description: 'Card number, expiry, CVV, name on card. Trust badges: Visa, Mastercard, AmEx, PayPal, Apple Pay icons. SSL notice. "Complete Purchase" with data-ut-intent="pay.checkout".', exampleContent: 'Card number (formatted XXXX XXXX XXXX XXXX), MM/YY, CVV, Billing address same as shipping? checkbox' },
        { name: 'Order Summary Sidebar', required: true, description: 'Persistent right panel showing all items, subtotal, shipping, tax, total.' },
        { name: 'Trust Badges', required: true, description: 'Row at bottom: 🔒 Secure Checkout · Free Returns · 24/7 Support · Money-Back Guarantee.' },
        footerSection(),
      ],
      ctaIntents: [
        { label: 'Complete Purchase', intent: 'pay.checkout' },
        { label: 'Apply Discount Code', intent: 'cart.checkout' },
      ],
      copy: {
        headlines: ['Complete Your Order', 'Secure Checkout', 'Almost There!'],
        subheadlines: ['Encrypted & secure. We never store your card details.', 'Free standard shipping on your order'],
        ctaTexts: ['Complete Purchase', 'Place Order', 'Pay Now'],
        trustSignals: ['256-bit SSL encryption', 'PCI DSS compliant', 'Free 30-day returns'],
      },
      searchQueries: ['ecommerce checkout page design best practices 2025 conversion rate', 'online store checkout UX reduce abandonment'],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// FITNESS
// ─────────────────────────────────────────────────────────────────────────────

const FITNESS: IndustryResearchProfile = {
  industryId: 'fitness',
  displayName: 'Fitness & Gym',
  industryContext:
    'Top fitness websites (Equinox, CrossFit affiliates, Barry\'s, F45) use high-energy photography, transformation proof, clear membership tiers, free trial CTAs, and class schedules. Key selling points: results, community, programme structure, and qualified coaches.',
  terminology: ['membership', 'class schedule', 'personal training', 'free trial', 'transformation', 'WOD', 'macros', 'HIIT', 'strength & conditioning', 'nutrition coaching'],
  trustSignals: ['member transformations', 'certified coaches', 'years in business', 'social proof', 'equipment quality', 'clean facility'],
  businessGoals: ['convert free trial sign-ups', 'sell memberships', 'book personal training', 'fill class slots'],
  conversionFocus: ['lead.capture', 'booking.create', 'auth.register'],
  pages: [
    {
      pageName: 'classes',
      aliases: ['schedule', 'timetable', 'class-schedule', 'programs', 'sessions'],
      displayTitle: 'Class Schedule',
      sections: [
        backNav(),
        { name: 'Schedule Hero', required: true, description: 'Action shot of class in progress. "Join a Class" heading with energy. Week selector (Mon-Sun) with data-no-intent.' },
        { name: 'Weekly Schedule Grid', required: true, description: 'Timetable grid indexed by day (columns) and time slots (rows). Each class card: class name, instructor, duration, difficulty badge (Beginner/Intermediate/Advanced), max participants, spots left, "Book Class" button with data-ut-intent="booking.create".' },
        { name: 'Class Types', required: true, description: '3-column cards explaining each class format: HIIT, Strength, Yoga, Spin, etc. — with photo, description, calories burned estimate.' },
        { name: 'New Member Offer', required: true, description: '"Try Your First Class Free" banner with data-ut-intent="lead.capture".' },
        footerSection(),
      ],
      ctaIntents: [
        { label: 'Book This Class', intent: 'booking.create' },
        { label: 'Try First Class Free', intent: 'lead.capture' },
      ],
      copy: {
        headlines: ['Find Your Class', 'Train Hard. Feel Amazing.', 'Classes for Every Fitness Level'],
        subheadlines: ['50+ classes per week across all levels', 'Expert coaches, proven results'],
        ctaTexts: ['Book Class', 'Try it Free', 'View Full Schedule', 'Reserve Your Spot'],
        trustSignals: ['Certified coaches', 'Small class sizes', 'No commitment required for first class'],
      },
      searchQueries: ['gym class schedule page design 2025 timetable UX', 'fitness studio schedule page best practices'],
    },
    {
      pageName: 'membership',
      aliases: ['memberships', 'join', 'pricing', 'plans', 'sign-up'],
      displayTitle: 'Membership Plans',
      sections: [
        backNav(),
        { name: 'Membership Hero', required: true, description: '"Start Your Transformation Today" hero with before/after photos or energy shots. "Free Trial Available" badge.' },
        { name: 'Pricing Cards', required: true, description: '3-tier pricing: Basic (class access), Pro (unlimited + PT session), Elite (unlimited + PT + nutrition). Each card: price/month, feature list with checkmarks, "Get Started" CTA. highlight the "Most Popular" tier with data-ut-intent="lead.capture".' },
        { name: 'Free Trial CTA', required: true, description: 'Full-width bold section: "7-Day Free Trial — No Credit Card Required" with email capture. data-ut-intent="lead.capture".' },
        { name: 'What\'s Included', required: true, description: 'Icon grid: Access all classes, Locker room, Shower & towels, Parking, Online app, Progress tracking.' },
        { name: 'Member Transformations', required: false, description: '3 before/after cards with name, goal achieved, time taken, and quote.' },
        { name: 'FAQ', required: false, description: 'Accordion: Can I freeze my membership? Is there a joining fee? Can I change plans? What happens after my trial?' },
        footerSection(),
      ],
      ctaIntents: [
        { label: 'Start Free Trial', intent: 'lead.capture' },
        { label: 'Join Now', intent: 'auth.register' },
        { label: 'Book a Tour', intent: 'booking.create' },
      ],
      copy: {
        headlines: ['Choose Your Membership', 'Invest in Your Health', 'One Gym. Unlimited Results.'],
        subheadlines: ['Flexible plans. Cancel anytime. No long-term contracts.', '7-day free trial for new members'],
        ctaTexts: ['Start Free Trial', 'Join Now', 'Get Started', 'Book a Free Tour'],
        trustSignals: ['No joining fee', 'Cancel anytime', '7-day free trial', '500+ happy members'],
      },
      searchQueries: ['gym membership pricing page design 2025 freemium trial', 'fitness center membership plans page conversion'],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// HEALTHCARE
// ─────────────────────────────────────────────────────────────────────────────

const HEALTHCARE: IndustryResearchProfile = {
  industryId: 'healthcare',
  displayName: 'Healthcare & Medical',
  industryContext:
    'Leading healthcare practice websites (Mayo Clinic, One Medical, forward-thinking private practices) prioritise trust, HIPAA-sensitivity, clear service listing, provider profiles, and frictionless appointment booking. Patients evaluate: qualifications, services, insurance, location, and reviews.',
  terminology: ['appointment', 'consultation', 'referral', 'specialist', 'primary care', 'telehealth', 'insurance', 'copay', 'patient portal', 'EMR', 'HIPAA'],
  trustSignals: ['Board-certified physicians', 'years in practice', 'accreditations', 'patient reviews', 'insurance accepted', 'telehealth available'],
  businessGoals: ['fill appointment calendar', 'onboard new patients', 'highlight specialities', 'drive telehealth adoption'],
  conversionFocus: ['booking.create', 'lead.capture', 'contact.submit'],
  pages: [
    {
      pageName: 'services',
      aliases: ['specialties', 'specialities', 'treatments', 'what-we-treat', 'conditions'],
      displayTitle: 'Our Services',
      sections: [
        backNav(),
        { name: 'Services Hero', required: true, description: 'Clean, clinical hero: soft blue/white palette, provider photo, "Expert Care for Every Need" heading.' },
        { name: 'Service Category Cards', required: true, description: 'Grid of 6-9 service areas (Primary Care, Cardiology, Dermatology, etc.). Each card: medical icon, service name, 1-line description, "Book Appointment" CTA with data-ut-intent="booking.create".' },
        { name: 'Service Detail Panels', required: true, description: 'Expandable sections for each speciality: conditions treated, procedures offered, which providers, insurance coverage.' },
        { name: 'Telehealth Banner', required: false, description: '"See a doctor from home" telehealth promo with data-ut-intent="booking.create".' },
        { name: 'Insurance Accepted', required: true, description: 'Grid of accepted insurance logos/names. "Don\'t see your plan? Contact us" link with data-ut-intent="contact.submit".' },
        { name: 'Book Appointment CTA', required: true, description: 'Prominent CTA: "Ready to Schedule? New patients welcome" → data-ut-intent="booking.create".' },
        footerSection(),
      ],
      ctaIntents: [
        { label: 'Book an Appointment', intent: 'booking.create' },
        { label: 'Contact Us', intent: 'contact.submit' },
      ],
      copy: {
        headlines: ['Comprehensive Care Under One Roof', 'Expert Specialists. Compassionate Care.', 'Your Health is Our Priority'],
        subheadlines: ['Accepting new patients', 'Same-day appointments available', 'Most major insurance plans accepted'],
        ctaTexts: ['Book an Appointment', 'Schedule a Consultation', 'New Patient Registration'],
        trustSignals: ['Board-certified physicians', 'HIPAA compliant', 'Same-day availability', 'Accepting new patients'],
      },
      searchQueries: ['medical practice services page design 2025 patient-focused', 'healthcare website services page best practices'],
    },
    {
      pageName: 'booking',
      aliases: ['appointments', 'book-appointment', 'schedule-visit', 'new-patient'],
      displayTitle: 'Book an Appointment',
      sections: [
        backNav(),
        { name: 'Booking Hero', required: true, description: 'Welcoming, calm design. "Schedule Your Visit" heading. "New patients welcome" badge.' },
        { name: 'Appointment Type', required: true, description: 'Radio buttons or cards: New Patient Visit, Follow-Up, Telehealth, Urgent Care. Clearly labelled.' },
        { name: 'Provider Selection', required: false, description: 'Provider cards with photo, name, speciality, accepting new patients badge. "No preference" option.' },
        { name: 'Appointment Form', required: true, description: 'Date/time picker, reason for visit dropdown, patient name, DOB, email, phone, insurance info. "Request Appointment" with data-ut-intent="booking.create".', exampleContent: 'First/Last name, Date of birth, Email, Phone, Insurance plan name + member ID, Reason for visit, Preferred provider, Preferred date/time' },
        { name: 'HIPAA Notice', required: true, description: 'Small-print HIPAA privacy notice and data security statement.' },
        { name: 'What to Bring', required: false, description: 'Checklist card: ID, Insurance cards, Medication list, Referral (if applicable).' },
        footerSection(),
      ],
      ctaIntents: [
        { label: 'Request Appointment', intent: 'booking.create' },
        { label: 'Telehealth Appointment', intent: 'booking.create' },
      ],
      copy: {
        headlines: ['Book Your Appointment', 'Schedule a Visit', 'Same-Day Appointments Available'],
        subheadlines: ['We\'ll confirm your appointment within 1 business hour', 'Telehealth and in-person options'],
        ctaTexts: ['Request Appointment', 'Book Now', 'Schedule a Visit'],
        trustSignals: ['HIPAA compliant', 'Confirmed within 1 hour', 'Free new patient consultation'],
      },
      searchQueries: ['medical appointment booking page design 2025 patient experience', 'healthcare practice online scheduling best practices'],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// TECHNOLOGY / SAAS
// ─────────────────────────────────────────────────────────────────────────────

const TECHNOLOGY: IndustryResearchProfile = {
  industryId: 'technology',
  displayName: 'Technology / SaaS',
  industryContext:
    'Top SaaS and tech product websites (Stripe, Linear, Notion, Vercel) use clean dark or light UIs with precise typography, animated product demos, feature comparison tables, transparent pricing, and strong social proof. Conversion paths: free trial signup, contact sales, and product demos.',
  terminology: ['API', 'integration', 'dashboard', 'workflow', 'automation', 'SLA', 'uptime', 'SDK', 'webhook', 'enterprise plan', 'freemium'],
  trustSignals: ['SOC 2 compliant', 'GDPR compliant', 'uptime SLA', 'used by X companies', 'enterprise clients', 'security certifications'],
  businessGoals: ['drive free trial sign-ups', 'move freemium to paid', 'generate enterprise leads', 'reduce churn'],
  conversionFocus: ['auth.register', 'lead.capture', 'booking.create'],
  pages: [
    {
      pageName: 'pricing',
      aliases: ['plans', 'pricing-plans', 'subscription', 'upgrade'],
      displayTitle: 'Pricing',
      sections: [
        backNav(),
        { name: 'Pricing Hero', required: true, description: 'Clean hero: "Simple, Transparent Pricing" with monthly/annual toggle switch (data-no-intent). Annual saves 20% badge.' },
        { name: 'Pricing Tiers', required: true, description: '3 cards: Free (forever free), Pro ($29/mo), Enterprise (Custom). Each tier: price, billing cadence, target persona, 8-10 feature list with checkmarks/cross icons, primary CTA. Highlight pro tier.', exampleContent: 'Free: up to 5 projects, 1 user; Pro: unlimited projects, 5 users, priority support; Enterprise: SSO, SLA, dedicated CSM' },
        { name: 'Feature Comparison Table', required: true, description: 'Full comparison table with all features as rows, plan tiers as columns. Checkmark/dash icons. Sticky header.' },
        { name: 'FAQ', required: true, description: 'Accordion: Can I upgrade or downgrade? What happens when my trial ends? Do you offer refunds? Can I pay annually? Is there a non-profit discount?' },
        { name: 'Enterprise CTA', required: true, description: '"Need a custom plan for your team?" section → "Contact Sales" with data-ut-intent="lead.capture".' },
        { name: 'Logos Strip', required: false, description: 'Trusted-by logos of well-known clients.' },
        footerSection(),
      ],
      ctaIntents: [
        { label: 'Start Free Trial', intent: 'auth.register' },
        { label: 'Contact Sales', intent: 'lead.capture' },
        { label: 'Get Started for Free', intent: 'auth.register' },
      ],
      copy: {
        headlines: ['Simple, Transparent Pricing', 'Start Free. Scale as You Grow.', 'Plans for Every Team'],
        subheadlines: ['No hidden fees. Cancel any time.', 'Free tier available — no credit card required'],
        ctaTexts: ['Start Free Trial', 'Get Started for Free', 'Contact Sales', 'Book a Demo'],
        trustSignals: ['No credit card required', 'Cancel anytime', 'SOC 2 compliant', '99.9% uptime SLA'],
      },
      searchQueries: ['SaaS pricing page design conversion best practices 2025', 'software product pricing tiers page layout'],
    },
    {
      pageName: 'features',
      aliases: ['product', 'capabilities', 'how-it-works', 'overview'],
      displayTitle: 'Features',
      sections: [
        backNav(),
        { name: 'Features Hero', required: true, description: 'Animated product screenshot or illustration. Headline about the primary value prop. "See It In Action" or "Start Free Trial" CTA.' },
        { name: 'Key Features Grid', required: true, description: '2-column alternating layout. Each feature: icon, bold title, 2-sentence description, product screenshot or animation. Alternate text-left/image-right.' },
        { name: 'Integration Logos', required: false, description: '"Works with your favourite tools" — logos of Slack, GitHub, Jira, Salesforce, Zapier, etc.' },
        { name: 'Technical Specs', required: false, description: 'Table or grid: API rate limits, supported languages/frameworks, data residency, compliance certs.' },
        { name: '"Start Building" CTA', required: true, description: 'Full-width CTA section with primary metric ("Deploy in under 5 minutes") → data-ut-intent="auth.register".' },
        footerSection(),
      ],
      ctaIntents: [
        { label: 'Start Free Trial', intent: 'auth.register' },
        { label: 'Book a Demo', intent: 'booking.create' },
      ],
      copy: {
        headlines: ['Everything You Need to Ship Faster', 'Powerful Features. Simple Interface.', 'Built for Teams Who Move Fast'],
        subheadlines: ['From solo developer to enterprise teams', 'Setup in minutes. Results from day one.'],
        ctaTexts: ['Start Free Trial', 'Book a Demo', 'View Documentation', 'Get Started Free'],
        trustSignals: ['Trusted by 10,000+ teams', '< 5 min setup', '99.9% uptime', 'SOC 2 Type II'],
      },
      searchQueries: ['SaaS features page design 2025 product showcase layout', 'software product features page conversion UX'],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LOCAL SERVICE
// ─────────────────────────────────────────────────────────────────────────────

const LOCALSERVICE: IndustryResearchProfile = {
  industryId: 'localservice',
  displayName: 'Local Service Business',
  industryContext:
    'Top local service websites (plumbers, electricians, HVAC, landscaping, cleaning) emphasise local credibility, clear service areas, online quote requests, and emergency availability. Customers make quick decisions based on: availability, reviews, price transparency, and trust signals.',
  terminology: ['free estimate', 'service area', 'licensed & insured', 'emergency service', 'same-day', 'residential', 'commercial', 'warranty', 'satisfaction guaranteed'],
  trustSignals: ['licensed & insured', 'years in business', 'BBB accredited', 'Google reviews', 'service guarantee', 'background-checked technicians'],
  businessGoals: ['generate quote requests', 'book service calls', 'showcase service area', 'build local trust'],
  conversionFocus: ['quote.request', 'booking.create', 'contact.submit', 'lead.capture'],
  pages: [
    {
      pageName: 'services',
      aliases: ['what-we-do', 'service-list', 'our-services'],
      displayTitle: 'Our Services',
      sections: [
        backNav(),
        { name: 'Services Hero', required: true, description: 'Strong hero with team/work photo. "Professional [Industry] Services" heading with local area name. Dual CTAs: "Get a Free Quote" (quote.request) and "Call Now" (lead.capture).' },
        { name: 'Service List', required: true, description: '4-column icon grid of specific services. Each: icon, service name, brief description, "Get Estimate" button with data-ut-intent="quote.request".' },
        { name: 'Emergency Service Banner', required: false, description: '"24/7 Emergency Service Available" red/orange banner with phone number and data-ut-intent="lead.capture".' },
        { name: 'Service Area Map', required: true, description: 'Map placeholder showing coverage area with list of cities/zip codes served.' },
        { name: 'Process', required: true, description: 'Simple 3-step: Request Quote → Schedule Service → Problem Solved. With icons.' },
        { name: 'Free Estimate CTA', required: true, description: 'Full-width section: "Get Your Free No-Obligation Estimate" with form (name, phone, service needed, address). data-ut-intent="quote.request".' },
        footerSection(),
      ],
      ctaIntents: [
        { label: 'Get a Free Quote', intent: 'quote.request' },
        { label: 'Book Service Call', intent: 'booking.create' },
        { label: 'Call Now', intent: 'lead.capture' },
      ],
      copy: {
        headlines: ['Professional Services You Can Trust', 'Fast, Reliable, Affordable', 'Your Local [Service] Experts'],
        subheadlines: ['Licensed & insured. Serving [City] and surrounding areas.', 'Free estimates. No hidden fees.'],
        ctaTexts: ['Get a Free Quote', 'Book Service Call', 'Call Now', 'Request Estimate'],
        trustSignals: ['Licensed & insured', '5-star Google reviews', 'Background-checked technicians', '100% satisfaction guarantee'],
      },
      searchQueries: ['local service business website services page design 2025', 'plumber electrician contractor website best practices'],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// CREATOR / PORTFOLIO
// ─────────────────────────────────────────────────────────────────────────────

const CREATOR: IndustryResearchProfile = {
  industryId: 'creator',
  displayName: 'Creator / Portfolio',
  industryContext:
    'Top creative portfolios (Awwwards winners, Behance features, freelance designers/developers) showcase work with visual impact, demonstrate range of skills, tell a personal story, and make it easy for clients to make contact. Key signals: quality of work, client logos, personality, and clear next-step CTA.',
  terminology: ['portfolio', 'case study', 'client', 'freelance', 'commission', 'brief', 'deliverables', 'creative direction', 'brand identity', 'motion design'],
  trustSignals: ['client logos', 'project count', 'years of experience', 'testimonials', 'award nominations', 'press features'],
  businessGoals: ['attract freelance clients', 'showcase creative range', 'build personal brand', 'drive inbound enquiries'],
  conversionFocus: ['lead.capture', 'contact.submit', 'booking.create'],
  pages: [
    {
      pageName: 'portfolio',
      aliases: ['work', 'projects', 'case-studies', 'gallery', 'my-work', 'view-work'],
      displayTitle: 'Portfolio',
      sections: [
        backNav(),
        { name: 'Portfolio Hero', required: true, description: '"My Work" or "Selected Projects" hero — minimal, bold typography, optional looping reel of project stills.' },
        { name: 'Filter Bar', required: false, description: 'Category tags: All, Branding, Web Design, Motion, Photography. data-no-intent.' },
        { name: 'Project Grid', required: true, description: 'Masonry or uniform grid of project cards. Each: full-bleed cover image, hover overlay with project name + category, "View Case Study" link tag. 6-12 projects shown.' },
        { name: 'Featured Project Deep-Dive', required: false, description: 'One highlighted project with full-width imagery, challenge/solution/result narrative, client name, and result metrics.' },
        { name: 'Client Logos', required: false, description: '"Trusted by brands including" — greyscale client/brand logos.' },
        { name: 'Hire Me CTA', required: true, description: '"Have a project in mind? Let\'s talk." → data-ut-intent="lead.capture".' },
        footerSection(),
      ],
      ctaIntents: [
        { label: 'Hire Me', intent: 'lead.capture' },
        { label: 'Start a Project', intent: 'lead.capture' },
        { label: 'Get in Touch', intent: 'contact.submit' },
      ],
      copy: {
        headlines: ['Selected Projects', 'Work That Makes an Impact', 'Craft. Code. Create.'],
        subheadlines: ['A curated selection of past projects and collaborations', 'Every project is a new opportunity to do something great'],
        ctaTexts: ['View Case Study', 'Hire Me', 'Start a Project', 'Let\'s Talk'],
        trustSignals: ['50+ completed projects', 'Clients on 3 continents', 'Worked with Fortune 500 brands'],
      },
      searchQueries: ['creative portfolio page design best practices 2025', 'freelance designer portfolio layout masonry grid'],
    },
    {
      pageName: 'about',
      aliases: ['about-me', 'bio', 'story', 'who-am-i'],
      displayTitle: 'About Me',
      sections: [
        backNav(),
        { name: 'Hero Portrait', required: true, description: 'Large editorial portrait or workspace photo. Name, one-line title, location. Warm, personal tone.' },
        { name: 'Bio', required: true, description: '3-4 paragraph personal story: how you started, your craft philosophy, what drives you, what you specialise in. First person, conversational.' },
        { name: 'Skills & Tools', required: true, description: 'Visual skills grid: tool logos (Figma, Adobe CC, VS Code, etc.) or skill tags with proficiency indicators.' },
        { name: 'Timeline', required: false, description: 'Vertical timeline of career milestones: education, first client, pivotal projects, current focus.' },
        { name: 'Values', required: false, description: '3 personal working principles with icons, e.g., "Details Matter", "Clear Communication", "Deadline-Driven".' },
        { name: 'CTA to Work Together', required: true, description: '"Want to collaborate?" → "Start a Conversation" with data-ut-intent="contact.submit".' },
        footerSection(),
      ],
      ctaIntents: [
        { label: 'Start a Conversation', intent: 'contact.submit' },
        { label: 'View My Work', intent: 'lead.capture' },
      ],
      copy: {
        headlines: ['The Person Behind the Work', 'Creative. Strategic. Human.', 'Nice to Meet You'],
        subheadlines: ['I turn complex ideas into clear, beautiful design', 'Freelance designer based in [City] — working with clients worldwide'],
        ctaTexts: ['Start a Conversation', 'View My Work', 'Download Resume', 'Let\'s Collaborate'],
        trustSignals: ['8+ years experience', 'Available for new projects', '100% remote-friendly'],
      },
      searchQueries: ['freelance designer about me page portfolio 2025 personal brand', 'creative professional bio page design examples'],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// NONPROFIT
// ─────────────────────────────────────────────────────────────────────────────

const NONPROFIT: IndustryResearchProfile = {
  industryId: 'nonprofit',
  displayName: 'Non-Profit & Charity',
  industryContext:
    'Top nonprofit websites (charity: water, Doctors Without Borders, local shelters) lead with emotional impact, use storytelling through beneficiary cases, show transparent fund usage, and make donation as frictionless as possible. Trust is paramount — donors need to see credibility and impact.',
  terminology: ['donation', 'grant', 'beneficiary', 'impact report', 'volunteer', 'fiscal year', '501(c)(3)', 'charity navigator', 'programmatic spend', 'matching gift'],
  trustSignals: ['charity navigator rating', '% going to programs', 'annual impact report', 'board of directors', 'IRS 501(c)(3) status', 'financial transparency'],
  businessGoals: ['increase donations', 'recruit volunteers', 'build email list', 'communicate impact'],
  conversionFocus: ['pay.checkout', 'newsletter.subscribe', 'lead.capture'],
  pages: [
    {
      pageName: 'donate',
      aliases: ['donation', 'give', 'support-us', 'contribute'],
      displayTitle: 'Donate',
      sections: [
        backNav(),
        { name: 'Donation Hero', required: true, description: 'Emotional full-width photo of beneficiaries or impact. Bold headline: "Your Gift Changes Lives". Impact stat (e.g., "$25 feeds a family for a week").' },
        { name: 'Donation Amount Selector', required: true, description: 'Quick-select amount buttons: $10, $25, $50, $100, Custom. Monthly/One-time toggle. Impact description updates per amount selected (data-no-intent on toggles/selectors). "Donate Now" with data-ut-intent="pay.checkout".' },
        { name: 'Donor Form', required: true, description: 'Name, email, billing address, card details. Opt-in for donor newsletter. data-ut-intent="pay.checkout" on submit.', exampleContent: 'First/last name, email, amount, card info, optional: dedicate donation to someone' },
        { name: 'Impact Map', required: false, description: 'Map showing where donations have been used / where beneficiaries are located.' },
        { name: 'Fund Transparency', required: true, description: 'Pie/donut chart: Programs 84% | Admin 8% | Fundraising 8%. "View Full Impact Report" link.' },
        { name: 'Other Ways to Give', required: false, description: 'Cards: Recurring Gift, Corporate Matching, Legacy Giving, Volunteer Time.' },
        footerSection(),
      ],
      ctaIntents: [
        { label: 'Donate Now', intent: 'pay.checkout' },
        { label: 'Become a Monthly Donor', intent: 'newsletter.subscribe' },
      ],
      copy: {
        headlines: ['Make a Difference Today', 'Your Gift, Their Future', 'Every Dollar Counts'],
        subheadlines: ['100% of your donation goes directly to our programmes', 'Tax-deductible under IRS code 501(c)(3)'],
        ctaTexts: ['Donate Now', 'Give Monthly', 'Make a One-Time Gift'],
        trustSignals: ['501(c)(3) nonprofit', '4-star Charity Navigator', '92% of funds to programs', 'Secure SSL donation'],
      },
      searchQueries: ['nonprofit donation page design best practices 2025 conversion', 'charity website donate page UX optimize'],
    },
    {
      pageName: 'volunteer',
      aliases: ['get-involved', 'join-us', 'volunteer-opportunities'],
      displayTitle: 'Volunteer',
      sections: [
        backNav(),
        { name: 'Volunteer Hero', required: true, description: 'Photo of volunteers in action. "Join Our Community of Change-Makers" heading. "Apply to Volunteer" CTA.' },
        { name: 'Volunteer Opportunities', required: true, description: 'Cards for each volunteer role: role title, commitment (hours/week), location (remote/in-person), skills needed, "Apply for This Role" button. data-ut-intent="lead.capture".' },
        { name: 'Volunteer Stories', required: false, description: '2-3 testimonial cards from volunteers: photo, name, role, quote about impact.' },
        { name: 'Application Form', required: true, description: 'Name, email, phone, area of interest, availability, skills, motivation text area. data-ut-intent="lead.capture".' },
        footerSection(),
      ],
      ctaIntents: [
        { label: 'Apply to Volunteer', intent: 'lead.capture' },
        { label: 'Sign Up as Volunteer', intent: 'lead.capture' },
      ],
      copy: {
        headlines: ['Volunteer with Us', 'Give Your Time. Change Lives.', 'Join Our Team of Volunteers'],
        subheadlines: ['Flexible, meaningful, impactful', 'No experience necessary — just passion'],
        ctaTexts: ['Apply to Volunteer', 'Get Involved', 'Sign Up'],
        trustSignals: ['1,200+ active volunteers', 'Flexible scheduling', 'Training provided', 'References available'],
      },
      searchQueries: ['nonprofit volunteer page design 2025', 'charity volunteer sign-up page best practices'],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared / Generic pages (used as fallback for all industries)
// ─────────────────────────────────────────────────────────────────────────────

const GENERIC_PAGES: IndustryPagePattern[] = [
  {
    pageName: 'about',
    aliases: ['about-us', 'our-story', 'who-we-are', 'company'],
    displayTitle: 'About Us',
    sections: [
      backNav(),
      { name: 'About Hero', required: true, description: 'Story-driven photo or illustration. Headline: "Who We Are" or the company name. Mission statement in 1-2 sentences.' },
      { name: 'Our Mission', required: true, description: 'Two-column layout: mission text + supporting photo or icon.' },
      { name: 'Team', required: true, description: '3-column team member cards: photo, name, title, brief bio, LinkedIn icon.' },
      { name: 'Values', required: false, description: '3-4 company values with icons and descriptions.' },
      { name: 'History/Timeline', required: false, description: 'Horizontal or vertical timeline of company milestones.' },
      { name: 'CTA', required: true, description: '"Work With Us" or "Get In Touch" → data-ut-intent="contact.submit".' },
      footerSection(),
    ],
    ctaIntents: [{ label: 'Get in Touch', intent: 'contact.submit' }],
    copy: {
      headlines: ['About Us', 'Our Story', 'Who We Are'],
      subheadlines: ['Passionate about our work since day one', 'A team built on trust, expertise, and results'],
      ctaTexts: ['Get in Touch', 'Meet the Team', 'Learn More'],
      trustSignals: ['Years of experience', 'Satisfied clients', 'Industry expertise'],
    },
    searchQueries: ['company about us page design best practices 2025', 'about us page storytelling layout examples'],
  },
  {
    pageName: 'contact',
    aliases: ['contact-us', 'get-in-touch', 'reach-us', 'talk-to-us'],
    displayTitle: 'Contact Us',
    sections: [
      backNav(),
      { name: 'Contact Hero', required: true, description: '"Get in Touch" heading with friendly sub-copy. Contact info (phone, email, address) prominently displayed alongside the form.' },
      { name: 'Contact Form', required: true, description: 'Name, email, phone (optional), subject dropdown, message. "Send Message" button with data-ut-intent="contact.submit".' },
      { name: 'Map', required: false, description: 'Embedded map placeholder showing office/store location.' },
      { name: 'Office Hours', required: true, description: 'Table of opening hours by day.' },
      { name: 'Social Links', required: false, description: 'Row of social media icons linking to profiles.' },
      footerSection(),
    ],
    ctaIntents: [{ label: 'Send Message', intent: 'contact.submit' }],
    copy: {
      headlines: ['Get in Touch', "We'd Love to Hear From You", 'Contact Us'],
      subheadlines: ["We respond to all enquiries within 1 business day", 'Fill out the form and we\'ll be in touch'],
      ctaTexts: ['Send Message', 'Submit', 'Get in Touch'],
      trustSignals: ['Respond within 1 business day', 'Confidential enquiries welcome'],
    },
    searchQueries: ['contact us page design best practices 2025', 'business contact page form UX layout'],
  },
  {
    pageName: 'pricing',
    aliases: ['plans', 'packages', 'rates', 'cost'],
    displayTitle: 'Pricing',
    sections: [
      backNav(),
      { name: 'Pricing Hero', required: true, description: '"Simple, Transparent Pricing" heading. Monthly/annual billing toggle with data-no-intent.' },
      { name: 'Pricing Cards', required: true, description: '3-tier pricing cards: Starter, Professional, Enterprise. Each with price, feature list, and primary CTA. Highlight the most popular tier.' },
      { name: 'Feature Comparison', required: true, description: 'Table comparing all features across tiers.' },
      { name: 'FAQ', required: false, description: 'Accordion with common billing/pricing questions.' },
      { name: 'Enterprise CTA', required: false, description: '"Need a custom plan?" → data-ut-intent="contact.submit".' },
      footerSection(),
    ],
    ctaIntents: [
      { label: 'Get Started', intent: 'lead.capture' },
      { label: 'Contact Sales', intent: 'contact.submit' },
    ],
    copy: {
      headlines: ['Simple, Transparent Pricing', 'Choose Your Plan', 'Plans for Every Stage'],
      subheadlines: ['No hidden fees. Cancel any time.', 'Start with a free trial — no credit card required'],
      ctaTexts: ['Get Started', 'Start Free Trial', 'Contact Sales', 'View All Features'],
      trustSignals: ['No contracts', 'Cancel anytime', 'Money-back guarantee'],
    },
    searchQueries: ['pricing page design best practices 2025 conversion', 'SaaS service pricing page layout examples'],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Registry
// ─────────────────────────────────────────────────────────────────────────────

const INDUSTRY_PROFILES: Record<string, IndustryResearchProfile> = {
  restaurant:    RESTAURANT,
  salon:         SALON,
  realestate:    REALESTATE,
  consulting:    CONSULTING,
  ecommerce:     ECOMMERCE,
  fitness:       FITNESS,
  healthcare:    HEALTHCARE,
  technology:    TECHNOLOGY,
  localservice:  LOCALSERVICE,
  creator:       CREATOR,
  nonprofit:     NONPROFIT,
};

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/** Resolve the best industry profile for a given systemType string (fuzzy matching). */
export function getIndustryProfile(systemType: string | null | undefined): IndustryResearchProfile | null {
  if (!systemType) return null;
  const key = systemType.toLowerCase().replace(/[-_\s]/g, '');
  // Direct match
  if (INDUSTRY_PROFILES[key]) return INDUSTRY_PROFILES[key];
  // Partial match
  for (const [id, profile] of Object.entries(INDUSTRY_PROFILES)) {
    if (key.includes(id) || id.includes(key)) return profile;
  }
  return null;
}

/**
 * Find the most relevant IndustryPagePattern for a given page name or nav label.
 * Falls back to GENERIC_PAGES, then returns null.
 */
export function matchPagePattern(
  profile: IndustryResearchProfile | null,
  pageName: string,
  navLabel?: string,
): IndustryPagePattern | null {
  const normalise = (s: string) => s.toLowerCase().replace(/[-_\s]/g, '');
  const normPage = normalise(pageName);
  const normLabel = navLabel ? normalise(navLabel) : '';

  const allPatterns = [
    ...(profile?.pages ?? []),
    ...GENERIC_PAGES,
  ];

  for (const pattern of allPatterns) {
    const normPName = normalise(pattern.pageName);
    if (normPage === normPName || normPage.includes(normPName) || normPName.includes(normPage)) {
      return pattern;
    }
    // Check aliases
    for (const alias of pattern.aliases) {
      const normAlias = normalise(alias);
      if (normPage === normAlias || normLabel === normAlias || normPage.includes(normAlias) || normLabel.includes(normAlias)) {
        return pattern;
      }
    }
    // Check against nav label
    if (normLabel && (normLabel === normalise(pattern.displayTitle) || normalise(pattern.displayTitle).includes(normLabel))) {
      return pattern;
    }
  }
  return null;
}

/**
 * Build a detailed AI-injection context string from an industry profile and page pattern.
 * Includes industry terminology, trust signals, sections spec, copy examples, and CTAs.
 * The live research snippets (from DuckDuckGo) should be appended separately.
 */
export function buildIndustryPageContext(
  profile: IndustryResearchProfile | null,
  pattern: IndustryPagePattern | null,
): string {
  if (!profile && !pattern) return '';

  let ctx = '\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  ctx += '🏢 INDUSTRY PAGE RESEARCH CONTEXT\n';
  ctx += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';

  if (profile) {
    ctx += `\n📋 Industry: ${profile.displayName}\n`;
    ctx += `${profile.industryContext}\n`;
    ctx += `\n🔑 Industry Terminology: ${profile.terminology.join(', ')}\n`;
    ctx += `\n✅ Trust Signals to Include: ${profile.trustSignals.join(' · ')}\n`;
    ctx += `\n🎯 Primary Conversion Goals: ${profile.conversionFocus.join(', ')}\n`;
  }

  if (pattern) {
    ctx += `\n\n📄 Page: "${pattern.displayTitle}"\n`;
    ctx += `\n📐 Required Sections (in order):\n`;
    for (const section of pattern.sections) {
      const req = section.required ? '✅ [REQUIRED]' : '⬜ [OPTIONAL]';
      ctx += `  ${req} ${section.name}: ${section.description}\n`;
      if (section.exampleContent) {
        ctx += `     └─ Example fields/content: ${section.exampleContent}\n`;
      }
    }

    ctx += `\n🔘 CTA Buttons to Include:\n`;
    for (const cta of pattern.ctaIntents) {
      ctx += `  • "${cta.label}" → data-ut-intent="${cta.intent}"${cta.dataPath ? ` data-ut-path="${cta.dataPath}"` : ''}\n`;
    }

    ctx += `\n✍️  Copy Examples (use or adapt):\n`;
    ctx += `  Headlines: ${pattern.copy.headlines.join(' | ')}\n`;
    ctx += `  Sub-copy:  ${pattern.copy.subheadlines.join(' | ')}\n`;
    ctx += `  CTA text:  ${pattern.copy.ctaTexts.join(' | ')}\n`;
    ctx += `  Trust:     ${pattern.copy.trustSignals.join(' | ')}\n`;
  }

  ctx += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  return ctx;
}

/**
 * Get the DuckDuckGo search queries for a page pattern (max 2 for speed).
 * Returns empty array if no pattern is found.
 */
export function getResearchQueries(pattern: IndustryPagePattern | null): string[] {
  if (!pattern) return [];
  return pattern.searchQueries.slice(0, 2);
}
