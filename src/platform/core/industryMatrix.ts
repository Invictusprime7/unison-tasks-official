/**
 * Industry → Capability Matrix
 * 
 * Canonical mapping from industry/category to allowed capabilities,
 * default automation packs, CRM pipeline types, and page maps.
 * 
 * This is the deterministic bridge between "what industry is this?"
 * and "what capabilities should be provisioned?"
 */

import type { CapabilityId } from './capabilityRegistry';
import type { BusinessSystemType, LayoutCategory } from '@/data/templates/types';
import type { CoreIntent } from './coreIntents';
import type { ArtDirectionPackId } from '@/sections/variants/artDirectionPacks';

// ============================================================================
// Industry Profile
// ============================================================================

/** A profile question the launcher asks for this industry. */
export interface BusinessProfileFieldSpec {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'list' | 'select' | 'number';
  required?: boolean;
  placeholder?: string;
  options?: string[];
  helpText?: string;
}

export interface IndustryProfile {
  /** Industry key (matches composition industry field) */
  industry: string;
  /** Human name */
  name: string;
  /** Maps to BusinessSystemType for backend provisioning */
  systemType: BusinessSystemType;
  /** Layout categories this industry uses */
  layoutCategories: LayoutCategory[];
  /** Capabilities enabled by default for this industry */
  defaultCapabilities: CapabilityId[];
  /** Primary intent family for this industry (used for hero CTA defaults) */
  primaryIntent: CoreIntent;
  /**
   * The one capability this industry's site exists to fulfil. Never assume
   * booking — each industry declares its own anchor.
   */
  anchorCapability?: CapabilityId;
  /** Ordered conversion journey for this industry (not a booking retrofit). */
  conversionJourney?: CoreIntent[];
  /** Art direction packs the launcher may offer for this industry. */
  allowedArtDirectionPacks?: ArtDirectionPackId[];
  /** Profile questions the launcher asks for this industry. */
  profileFields?: BusinessProfileFieldSpec[];
  /** Default CRM pipeline for this industry */
  crmPipeline: {
    name: string;
    stages: string[];
    defaultStage: string;
  };
  /** Default page map for a new site in this industry */
  defaultPages: PageSpec[];
  /** Automation recipe pack to install */
  automationPack: string;
  /** Seed data requirements */
  seedDataKeys: string[];
}

export interface PageSpec {
  title: string;
  path: string;
  purpose: 'landing' | 'services' | 'portfolio' | 'contact' | 'about' | 'blog' | 'shop' | 'checkout' | 'booking' | 'pricing' | 'faq';
  /** Section types expected on this page */
  expectedSections: string[];
}

/** Shared profile questions every industry asks. */
const BASE_PROFILE_FIELDS: BusinessProfileFieldSpec[] = [
  { key: 'businessName', label: 'Business name', type: 'text', required: true },
  { key: 'tagline', label: 'One-line description', type: 'text', required: true, placeholder: 'What you do, in a sentence' },
  { key: 'location', label: 'Location', type: 'text', placeholder: 'City, region' },
  { key: 'contactEmail', label: 'Contact email', type: 'text', required: true },
];

const withBase = (extra: BusinessProfileFieldSpec[]): BusinessProfileFieldSpec[] => [
  ...BASE_PROFILE_FIELDS,
  ...extra,
];


// ============================================================================
// Matrix
// ============================================================================

export const INDUSTRY_MATRIX: Record<string, IndustryProfile> = {
  saas: {
    industry: 'saas',
    name: 'SaaS & Software',
    systemType: 'saas',
    layoutCategories: ['saas', 'landing'],
    defaultCapabilities: ['contact', 'newsletter', 'lead-capture'],
    primaryIntent: 'contact.submit',
    anchorCapability: 'lead-capture',
    conversionJourney: ['nav.goto', 'lead.capture', 'auth.register'],
    allowedArtDirectionPacks: ['glass-tech', 'swiss-grid', 'neon-grid', 'mono-terminal', 'bold-commercial'],
    profileFields: withBase([
      { key: 'productCategory', label: 'What does the product do?', type: 'text', required: true },
      { key: 'targetCustomer', label: 'Who is it for?', type: 'text', required: true },
      { key: 'pricingTiers', label: 'Plan names', type: 'list', placeholder: 'Starter, Growth, Scale' },
      { key: 'trialLength', label: 'Free trial length', type: 'text', placeholder: '14 days' },
    ]),
    crmPipeline: {
      name: 'SaaS Pipeline',
      stages: ['New Lead', 'Demo Requested', 'Trial Started', 'Qualified', 'Customer'],
      defaultStage: 'New Lead',
    },
    defaultPages: [
      { title: 'Home', path: '/', purpose: 'landing', expectedSections: ['navbar', 'hero', 'features', 'stats', 'testimonials', 'cta', 'footer'] },
      { title: 'Features', path: '/services', purpose: 'services', expectedSections: ['navbar', 'features', 'services', 'footer'] },
      { title: 'Pricing', path: '/pricing', purpose: 'pricing', expectedSections: ['navbar', 'pricing', 'faq', 'footer'] },
      { title: 'Contact', path: '/contact', purpose: 'contact', expectedSections: ['navbar', 'contact', 'footer'] },
    ],
    automationPack: 'saas_growth',
    seedDataKeys: ['business_name', 'business_email', 'features', 'pricing_tiers'],
  },

  salon: {
    industry: 'salon',
    name: 'Salon & Spa',
    systemType: 'booking',
    layoutCategories: ['salon'],
    defaultCapabilities: ['booking', 'contact', 'newsletter'],
    primaryIntent: 'booking.create',
    anchorCapability: 'booking',
    conversionJourney: ['nav.goto', 'booking.create', 'contact.submit'],
    allowedArtDirectionPacks: ['luxury-minimal', 'soft-editorial', 'warm-craft', 'editorial-noir', 'organic-studio'],
    profileFields: withBase([
      { key: 'services', label: 'Services offered', type: 'list', required: true, placeholder: 'Cut, colour, treatment' },
      { key: 'stylists', label: 'Team members', type: 'list' },
      { key: 'operatingHours', label: 'Opening hours', type: 'textarea', required: true },
      { key: 'bookingLeadTime', label: 'How far ahead can clients book?', type: 'text', placeholder: '30 days' },
    ]),
    crmPipeline: {
      name: 'Salon Clients',
      stages: ['New Client', 'Booked', 'Completed', 'VIP', 'Inactive'],
      defaultStage: 'New Client',
    },
    defaultPages: [
      { title: 'Home', path: '/', purpose: 'landing', expectedSections: ['navbar', 'hero', 'services', 'testimonials', 'cta', 'footer'] },
      { title: 'Services', path: '/services', purpose: 'services', expectedSections: ['navbar', 'services', 'pricing', 'footer'] },
      { title: 'Book', path: '/booking', purpose: 'booking', expectedSections: ['navbar', 'services', 'contact', 'footer'] },
      { title: 'Contact', path: '/contact', purpose: 'contact', expectedSections: ['navbar', 'contact', 'footer'] },
    ],
    automationPack: 'booking_salon',
    seedDataKeys: ['business_name', 'business_email', 'services', 'operating_hours'],
  },

  restaurant: {
    industry: 'restaurant',
    name: 'Restaurant & Food',
    systemType: 'booking',
    layoutCategories: ['restaurant'],
    defaultCapabilities: ['booking', 'contact', 'newsletter'],
    primaryIntent: 'booking.create',
    anchorCapability: 'booking',
    conversionJourney: ['nav.goto', 'booking.create', 'cart.add'],
    allowedArtDirectionPacks: ['warm-craft', 'print-serif', 'editorial-noir', 'organic-studio', 'soft-editorial'],
    profileFields: withBase([
      { key: 'cuisine', label: 'Cuisine', type: 'text', required: true },
      { key: 'menuHighlights', label: 'Signature dishes', type: 'list', required: true },
      { key: 'operatingHours', label: 'Service hours', type: 'textarea', required: true },
      { key: 'seatingCapacity', label: 'Seating capacity', type: 'number' },
      { key: 'orderingMode', label: 'Ordering', type: 'select', options: ['Reservations only', 'Takeaway only', 'Reservations and takeaway'] },
    ]),
    crmPipeline: {
      name: 'Restaurant Guests',
      stages: ['New Reservation', 'Confirmed', 'Seated', 'Completed', 'VIP'],
      defaultStage: 'New Reservation',
    },
    defaultPages: [
      { title: 'Home', path: '/', purpose: 'landing', expectedSections: ['navbar', 'hero', 'services', 'gallery', 'testimonials', 'cta', 'footer'] },
      { title: 'Menu', path: '/menu', purpose: 'services', expectedSections: ['navbar', 'services', 'footer'] },
      { title: 'Contact', path: '/contact', purpose: 'contact', expectedSections: ['navbar', 'contact', 'footer'] },
    ],
    automationPack: 'booking_restaurant',
    seedDataKeys: ['business_name', 'business_email', 'menu_items', 'operating_hours'],
  },

  'local-service': {
    industry: 'local-service',
    name: 'Local Service / Contractor',
    systemType: 'booking',
    layoutCategories: ['contractor'],
    defaultCapabilities: ['quoting', 'contact', 'newsletter', 'lead-capture'],
    primaryIntent: 'quote.request',
    anchorCapability: 'quoting',
    conversionJourney: ['nav.goto', 'quote.request', 'lead.capture'],
    allowedArtDirectionPacks: ['bold-commercial', 'swiss-grid', 'warm-craft', 'brutalist-poster'],
    profileFields: withBase([
      { key: 'services', label: 'Services offered', type: 'list', required: true },
      { key: 'serviceAreas', label: 'Areas served', type: 'list', required: true },
      { key: 'licensing', label: 'Licences and insurance', type: 'text' },
      { key: 'emergencyAvailability', label: 'Emergency callouts?', type: 'select', options: ['Yes, 24/7', 'Business hours only'] },
    ]),
    crmPipeline: {
      name: 'Service Pipeline',
      stages: ['New Lead', 'Quote Sent', 'Scheduled', 'In Progress', 'Completed', 'Follow-up'],
      defaultStage: 'New Lead',
    },
    defaultPages: [
      { title: 'Home', path: '/', purpose: 'landing', expectedSections: ['navbar', 'hero', 'services', 'testimonials', 'stats', 'cta', 'footer'] },
      { title: 'Services', path: '/services', purpose: 'services', expectedSections: ['navbar', 'services', 'pricing', 'footer'] },
      { title: 'Contact', path: '/contact', purpose: 'contact', expectedSections: ['navbar', 'contact', 'footer'] },
    ],
    automationPack: 'local_service',
    seedDataKeys: ['business_name', 'business_email', 'services', 'service_areas'],
  },

  coaching: {
    industry: 'coaching',
    name: 'Coaching & Consulting',
    systemType: 'booking',
    layoutCategories: ['coaching'],
    defaultCapabilities: ['booking', 'contact', 'newsletter', 'lead-capture'],
    primaryIntent: 'booking.create',
    anchorCapability: 'booking',
    conversionJourney: ['nav.goto', 'booking.create', 'lead.capture'],
    allowedArtDirectionPacks: ['soft-editorial', 'luxury-minimal', 'print-serif', 'organic-studio'],
    profileFields: withBase([
      { key: 'programs', label: 'Programs offered', type: 'list', required: true },
      { key: 'credentials', label: 'Credentials', type: 'text', required: true },
      { key: 'clientOutcome', label: 'Outcome you deliver', type: 'text', required: true },
      { key: 'discoveryCallLength', label: 'Discovery call length', type: 'text', placeholder: '30 minutes' },
    ]),
    crmPipeline: {
      name: 'Coaching Pipeline',
      stages: ['Discovery', 'Proposal', 'Active Client', 'Completed', 'Alumni'],
      defaultStage: 'Discovery',
    },
    defaultPages: [
      { title: 'Home', path: '/', purpose: 'landing', expectedSections: ['navbar', 'hero', 'services', 'testimonials', 'about', 'cta', 'footer'] },
      { title: 'Programs', path: '/programs', purpose: 'services', expectedSections: ['navbar', 'services', 'pricing', 'faq', 'footer'] },
      { title: 'Contact', path: '/contact', purpose: 'contact', expectedSections: ['navbar', 'contact', 'footer'] },
    ],
    automationPack: 'coaching',
    seedDataKeys: ['business_name', 'business_email', 'programs', 'credentials'],
  },

  'real-estate': {
    industry: 'real-estate',
    name: 'Real Estate',
    systemType: 'agency',
    layoutCategories: ['realestate'],
    defaultCapabilities: ['contact', 'lead-capture', 'booking', 'newsletter'],
    primaryIntent: 'contact.submit',
    anchorCapability: 'lead-capture',
    conversionJourney: ['nav.goto', 'lead.capture', 'booking.create'],
    allowedArtDirectionPacks: ['luxury-minimal', 'cinematic-portfolio', 'editorial-noir', 'swiss-grid'],
    profileFields: withBase([
      { key: 'serviceAreas', label: 'Markets served', type: 'list', required: true },
      { key: 'specialties', label: 'Specialties', type: 'list' },
      { key: 'licenseNumber', label: 'Licence number', type: 'text' },
    ]),
    crmPipeline: {
      name: 'Real Estate Pipeline',
      stages: ['New Lead', 'Showing Scheduled', 'Offer Made', 'Under Contract', 'Closed'],
      defaultStage: 'New Lead',
    },
    defaultPages: [
      { title: 'Home', path: '/', purpose: 'landing', expectedSections: ['navbar', 'hero', 'services', 'stats', 'testimonials', 'cta', 'footer'] },
      { title: 'Listings', path: '/listings', purpose: 'portfolio', expectedSections: ['navbar', 'gallery', 'footer'] },
      { title: 'Contact', path: '/contact', purpose: 'contact', expectedSections: ['navbar', 'contact', 'footer'] },
    ],
    automationPack: 'real_estate',
    seedDataKeys: ['business_name', 'business_email', 'service_areas', 'specialties'],
  },

  ecommerce: {
    industry: 'ecommerce',
    name: 'E-Commerce',
    systemType: 'store',
    layoutCategories: ['store'],
    defaultCapabilities: ['commerce', 'contact', 'newsletter'],
    primaryIntent: 'cart.add',
    anchorCapability: 'commerce',
    conversionJourney: ['nav.goto', 'cart.add', 'cart.view', 'pay.checkout'],
    allowedArtDirectionPacks: ['commerce-editorial', 'bold-commercial', 'luxury-minimal', 'swiss-grid', 'editorial-noir'],
    profileFields: withBase([
      { key: 'productCategories', label: 'Product categories', type: 'list', required: true },
      { key: 'priceRange', label: 'Typical price range', type: 'text' },
      { key: 'shippingRegions', label: 'Ships to', type: 'list', required: true },
      { key: 'returnsPolicy', label: 'Returns policy', type: 'textarea' },
    ]),
    crmPipeline: {
      name: 'Customer Pipeline',
      stages: ['Prospect', 'First Purchase', 'Repeat Customer', 'VIP', 'Win-back'],
      defaultStage: 'Prospect',
    },
    defaultPages: [
      { title: 'Home', path: '/', purpose: 'landing', expectedSections: ['navbar', 'hero', 'services', 'testimonials', 'cta', 'footer'] },
      { title: 'Shop', path: '/shop', purpose: 'shop', expectedSections: ['navbar', 'services', 'footer'] },
      { title: 'Contact', path: '/contact', purpose: 'contact', expectedSections: ['navbar', 'contact', 'footer'] },
    ],
    automationPack: 'ecommerce',
    seedDataKeys: ['business_name', 'business_email', 'products', 'shipping_info'],
  },

  portfolio: {
    industry: 'portfolio',
    name: 'Portfolio & Creative',
    systemType: 'portfolio',
    layoutCategories: ['portfolio'],
    defaultCapabilities: ['contact', 'newsletter'],
    primaryIntent: 'contact.submit',
    anchorCapability: 'contact',
    conversionJourney: ['nav.goto', 'contact.submit'],
    allowedArtDirectionPacks: ['cinematic-portfolio', 'editorial-noir', 'print-serif', 'brutalist-poster', 'mono-terminal'],
    profileFields: withBase([
      { key: 'discipline', label: 'Your discipline', type: 'text', required: true },
      { key: 'featuredProjects', label: 'Projects to feature', type: 'list', required: true },
      { key: 'clients', label: 'Notable clients', type: 'list' },
      { key: 'availability', label: 'Currently taking work?', type: 'select', options: ['Available', 'Booked, taking enquiries'] },
    ]),
    crmPipeline: {
      name: 'Creative Pipeline',
      stages: ['Inquiry', 'Briefing', 'Proposal', 'Active Project', 'Delivered'],
      defaultStage: 'Inquiry',
    },
    defaultPages: [
      { title: 'Home', path: '/', purpose: 'landing', expectedSections: ['navbar', 'hero', 'gallery', 'about', 'testimonials', 'cta', 'footer'] },
      { title: 'Work', path: '/work', purpose: 'portfolio', expectedSections: ['navbar', 'gallery', 'footer'] },
      { title: 'Contact', path: '/contact', purpose: 'contact', expectedSections: ['navbar', 'contact', 'footer'] },
    ],
    automationPack: 'portfolio',
    seedDataKeys: ['business_name', 'business_email', 'portfolio_items'],
  },

  nonprofit: {
    industry: 'nonprofit',
    name: 'Nonprofit & Charity',
    systemType: 'content',
    layoutCategories: ['nonprofit'],
    defaultCapabilities: ['donation', 'contact', 'newsletter'],
    primaryIntent: 'donation.start',
    anchorCapability: 'donation',
    conversionJourney: ['nav.goto', 'donation.start', 'newsletter.subscribe'],
    allowedArtDirectionPacks: ['warm-craft', 'soft-editorial', 'print-serif', 'organic-studio'],
    profileFields: withBase([
      { key: 'mission', label: 'Mission statement', type: 'textarea', required: true },
      { key: 'programs', label: 'Programs', type: 'list', required: true },
      { key: 'impactStats', label: 'Impact numbers', type: 'list', placeholder: '12,000 meals served' },
      { key: 'donationTiers', label: 'Suggested donation amounts', type: 'list' },
    ]),
    crmPipeline: {
      name: 'Donor Pipeline',
      stages: ['Prospect', 'First-time Donor', 'Recurring Donor', 'Major Donor', 'Lapsed'],
      defaultStage: 'Prospect',
    },
    defaultPages: [
      { title: 'Home', path: '/', purpose: 'landing', expectedSections: ['navbar', 'hero', 'stats', 'services', 'testimonials', 'cta', 'footer'] },
      { title: 'About', path: '/about', purpose: 'about', expectedSections: ['navbar', 'about', 'team', 'footer'] },
      { title: 'Contact', path: '/contact', purpose: 'contact', expectedSections: ['navbar', 'contact', 'footer'] },
    ],
    automationPack: 'nonprofit',
    seedDataKeys: ['business_name', 'business_email', 'mission_statement', 'programs'],
  },

  agency: {
    industry: 'agency',
    name: 'Agency & Professional Services',
    systemType: 'agency',
    layoutCategories: ['agency', 'landing'],
    defaultCapabilities: ['contact', 'quoting', 'lead-capture', 'newsletter'],
    primaryIntent: 'contact.submit',
    anchorCapability: 'lead-capture',
    conversionJourney: ['nav.goto', 'lead.capture', 'contact.submit'],
    allowedArtDirectionPacks: ['swiss-grid', 'editorial-noir', 'glass-tech', 'bold-commercial', 'brutalist-poster'],
    profileFields: withBase([
      { key: 'servicesOffered', label: 'Services offered', type: 'list', required: true },
      { key: 'caseStudies', label: 'Case studies to feature', type: 'list', required: true },
      { key: 'clientResults', label: 'Headline client results', type: 'list' },
      { key: 'engagementModel', label: 'Engagement model', type: 'select', options: ['Retainer', 'Project', 'Both'] },
    ]),
    crmPipeline: {
      name: 'Agency Pipeline',
      stages: ['New Lead', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'],
      defaultStage: 'New Lead',
    },
    defaultPages: [
      { title: 'Home', path: '/', purpose: 'landing', expectedSections: ['navbar', 'hero', 'services', 'stats', 'testimonials', 'cta', 'footer'] },
      { title: 'Services', path: '/services', purpose: 'services', expectedSections: ['navbar', 'services', 'pricing', 'faq', 'footer'] },
      { title: 'Contact', path: '/contact', purpose: 'contact', expectedSections: ['navbar', 'contact', 'footer'] },
    ],
    automationPack: 'agency',
    seedDataKeys: ['business_name', 'business_email', 'services', 'case_studies'],
  },
};

const INDUSTRY_ALIASES: Record<string, string> = {
  barber: 'salon',
  medspa: 'salon',
  wellness: 'salon',
  dental: 'local-service',
  healthcare: 'local-service',
  contractor: 'local-service',
  local_service: 'local-service',
  hvac: 'local-service',
  cleaning: 'local-service',
  landscaping: 'local-service',
  auto_detailing: 'local-service',
  moving: 'local-service',
  legal: 'agency',
  realestate: 'real-estate',
  real_estate: 'real-estate',
  ecommerce: 'ecommerce',
  store: 'ecommerce',
  'e-commerce': 'ecommerce',
  photographer: 'portfolio',
  photography: 'portfolio',
  creative: 'portfolio',
  creator: 'portfolio',
  fitness: 'coaching',
  content: 'nonprofit',
  landing: 'agency',
};

// ============================================================================
// Lookup Helpers
// ============================================================================

export function normalizeIndustryKey(industry: string): string {
  const key = industry.trim().toLowerCase();
  return INDUSTRY_ALIASES[key] || key;
}

export function getIndustryProfile(industry: string): IndustryProfile | undefined {
  return INDUSTRY_MATRIX[normalizeIndustryKey(industry)];
}

export function getIndustryForCategory(category: LayoutCategory): IndustryProfile | undefined {
  return Object.values(INDUSTRY_MATRIX).find(p =>
    p.layoutCategories.includes(category)
  );
}

export function getIndustryForSystemType(systemType: BusinessSystemType): IndustryProfile[] {
  return Object.values(INDUSTRY_MATRIX).filter(p => p.systemType === systemType);
}

export function getAllIndustries(): IndustryProfile[] {
  return Object.values(INDUSTRY_MATRIX);
}
