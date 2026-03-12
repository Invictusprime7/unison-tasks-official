/**
 * Local Service / Contractor Templates — Section Registry Compositions
 * 3 variants: Professional (Dark), Friendly (Light), Emergency (Bold)
 */
import type { TemplateComposition, ThemeTokens } from '../types';
import { THEME_CONTRACTOR_PRO } from '../themes';

const THEME_FRIENDLY: ThemeTokens = {
  colors: { primary: '200 80% 45%', primaryForeground: '0 0% 100%', secondary: '160 55% 42%', secondaryForeground: '0 0% 100%', accent: '200 70% 50%', accentForeground: '0 0% 100%', background: '200 15% 97%', foreground: '210 15% 15%', muted: '200 10% 92%', mutedForeground: '210 8% 45%', card: '0 0% 100%', cardForeground: '210 15% 15%', border: '200 10% 88%' },
  typography: { headingFont: "'Inter', sans-serif", bodyFont: "'Inter', sans-serif", headingWeight: '700', bodyWeight: '400' },
  radius: '0.75rem', sectionPadding: '5rem 1rem', containerWidth: '1200px',
};

const THEME_EMERGENCY: ThemeTokens = {
  colors: { primary: '0 80% 50%', primaryForeground: '0 0% 100%', secondary: '45 90% 50%', secondaryForeground: '0 0% 10%', accent: '0 70% 55%', accentForeground: '0 0% 100%', background: '0 0% 5%', foreground: '0 0% 95%', muted: '0 0% 10%', mutedForeground: '0 0% 55%', card: '0 0% 8%', cardForeground: '0 0% 95%', border: '0 0% 15%' },
  typography: { headingFont: "'Inter', sans-serif", bodyFont: "'Inter', sans-serif", headingWeight: '900', bodyWeight: '400' },
  radius: '0.5rem', sectionPadding: '5rem 1rem', containerWidth: '1200px',
};

const SERVICES = [
  { title: 'Kitchen & Bath Remodels', description: 'Complete kitchen and bathroom renovations with premium materials and expert craftsmanship.', price: 'From $15K', cta: { label: 'Get Quote', intent: 'quote.request' } },
  { title: 'Roofing & Siding', description: 'New installations, repairs, and replacement with industry-leading warranties.', price: 'From $8K', cta: { label: 'Get Quote', intent: 'quote.request' } },
  { title: 'Electrical Services', description: 'Licensed electricians for residential and commercial wiring, panels, and code compliance.', price: 'From $200', cta: { label: 'Get Quote', intent: 'quote.request' } },
  { title: 'Plumbing', description: 'Emergency repairs, fixture installation, pipe replacement, and water heater service.', price: 'From $150', badge: '24/7', cta: { label: 'Get Quote', intent: 'quote.request' } },
  { title: 'Landscaping', description: 'Design, installation, and maintenance for lawns, patios, and outdoor living spaces.', price: 'From $2K', cta: { label: 'Get Quote', intent: 'quote.request' } },
  { title: 'General Contracting', description: 'Full project management for home additions, renovations, and new construction.', price: 'Custom', cta: { label: 'Get Quote', intent: 'quote.request' } },
];

const REVIEWS = [
  { quote: 'Apex completely transformed our kitchen. On time, on budget, and the quality is outstanding. Highly recommend!', author: 'Tom & Sarah W.', role: 'Kitchen Remodel', rating: 5 },
  { quote: 'Fast response for our emergency plumbing issue. Professional crew, fair pricing, and excellent workmanship.', author: 'Mark J.', role: 'Emergency Plumbing', rating: 5 },
  { quote: 'Best contractor we\'ve ever worked with. Clear communication, clean jobsite, and incredible attention to detail.', author: 'Linda P.', role: 'Bathroom Renovation', rating: 5 },
];

const NAV = [{ label: 'Services', href: '#services' }, { label: 'Our Work', href: '#work' }, { label: 'Reviews', href: '#reviews' }, { label: 'Contact', href: '#contact' }];
const FOOTER_COLS = [
  { title: 'Services', links: [{ label: 'Remodeling', href: '#services' }, { label: 'Roofing', href: '#services' }, { label: 'Electrical', href: '#services' }, { label: 'Plumbing', href: '#services' }] },
  { title: 'Info', links: [{ label: 'About Us', href: '#' }, { label: 'Reviews', href: '#reviews' }, { label: 'Licensing', href: '#' }, { label: 'Insurance', href: '#' }] },
  { title: 'Service Area', links: [{ label: 'Metro Area', href: '#' }, { label: 'Suburbs', href: '#' }, { label: '24/7 Emergency', href: '#contact' }] },
];

export const contractorPro: TemplateComposition = {
  id: 'contractor-professional', name: 'Apex Contracting — Pro', category: 'contractor', industry: 'local-service',
  description: 'Professional dark theme for contractors and home services', theme: THEME_CONTRACTOR_PRO,
  tags: ['contractor', 'service', 'dark', 'professional'], systemType: 'booking',
  sections: [
    { id: 'nav', type: 'navbar', props: { brand: 'Apex Contracting', links: NAV, cta: { label: 'Get Free Quote', intent: 'quote.request' }, sticky: true } },
    { id: 'hero', type: 'hero', props: { badge: '⚡ Licensed & Insured', headline: 'Quality Craftsmanship You Can Trust', subheadline: '20+ years of residential and commercial contracting. Licensed, insured, and committed to excellence on every project.', ctas: [{ label: 'Get Free Quote', intent: 'quote.request' }, { label: 'Our Services', href: '#services', variant: 'outline' }], stats: [{ value: '20+', label: 'Years' }, { value: '5K+', label: 'Projects' }, { value: '4.9', label: 'Rating' }], layout: 'centered' } },
    { id: 'services', type: 'services', props: { headline: 'Our Services', subheadline: 'Full-service contracting for every need', items: SERVICES, columns: 3 } },
    { id: 'stats', type: 'stats', props: { items: [{ value: '$50M+', label: 'Projects Completed' }, { value: '100%', label: 'Licensed' }, { value: '5-Year', label: 'Warranty' }, { value: '24/7', label: 'Emergency' }] } },
    { id: 'reviews', type: 'testimonials', props: { headline: 'Client Reviews', items: REVIEWS } },
    { id: 'cta', type: 'cta', props: { headline: 'Ready to Start Your Project?', description: 'Get a free, no-obligation quote within 24 hours.', ctas: [{ label: 'Request Free Quote', intent: 'quote.request' }, { label: 'Call (555) 456-7890', href: 'tel:+15554567890', variant: 'outline' }] } },
    { id: 'contact', type: 'contact', props: { headline: 'Contact Us', phone: '(555) 456-7890', email: 'info@apexcontracting.com', address: '789 Industrial Blvd' } },
    { id: 'footer', type: 'footer', props: { brand: 'Apex Contracting', columns: FOOTER_COLS, newsletter: false, socials: [{ platform: 'Facebook', url: '#' }, { platform: 'Google', url: '#' }] } },
  ],
};

export const contractorFriendly: TemplateComposition = {
  id: 'contractor-friendly', name: 'HomeRight — Friendly', category: 'contractor', industry: 'local-service',
  description: 'Light friendly theme for neighborhood services', theme: THEME_FRIENDLY,
  tags: ['contractor', 'service', 'light', 'friendly'], systemType: 'booking',
  sections: [
    { id: 'nav', type: 'navbar', props: { brand: 'HomeRight', links: NAV, cta: { label: 'Free Estimate', intent: 'quote.request' }, sticky: true } },
    { id: 'hero', type: 'hero', props: { badge: '🏠 Your Neighborhood Pros', headline: 'Home Improvement Made Easy', subheadline: 'Friendly, reliable service from your neighbors. We treat every home like it\'s our own.', ctas: [{ label: 'Get Free Estimate', intent: 'quote.request' }, { label: 'See Our Work', href: '#work', variant: 'outline' }] } },
    { id: 'services', type: 'services', props: { headline: 'How We Can Help', items: SERVICES.slice(0, 4), columns: 2 } },
    { id: 'reviews', type: 'testimonials', props: { headline: 'Neighbor Reviews', items: REVIEWS } },
    { id: 'faq', type: 'faq', props: { headline: 'Common Questions', items: [{ question: 'Are you licensed and insured?', answer: 'Yes! We are fully licensed, bonded, and insured for all services we offer.' }, { question: 'Do you offer free estimates?', answer: 'Absolutely. We provide detailed written estimates at no cost or obligation.' }, { question: 'What areas do you serve?', answer: 'We serve the greater metro area and surrounding suburbs within 30 miles.' }] } },
    { id: 'contact', type: 'contact', props: { headline: 'Get in Touch', phone: '(555) 567-8901', email: 'hello@homeright.com' } },
    { id: 'footer', type: 'footer', props: { brand: 'HomeRight', columns: FOOTER_COLS, newsletter: true, socials: [{ platform: 'Facebook', url: '#' }, { platform: 'Nextdoor', url: '#' }] } },
  ],
};

export const contractorEmergency: TemplateComposition = {
  id: 'contractor-emergency', name: 'RAPID Response — Emergency', category: 'contractor', industry: 'local-service',
  description: 'Bold urgent theme for emergency services', theme: THEME_EMERGENCY,
  tags: ['contractor', 'emergency', 'bold', 'urgent'], systemType: 'booking',
  sections: [
    { id: 'nav', type: 'navbar', props: { brand: 'RAPID', links: NAV, cta: { label: '🚨 EMERGENCY', intent: 'quote.request' }, sticky: true } },
    { id: 'hero', type: 'hero', props: { badge: '🚨 24/7 EMERGENCY SERVICE', headline: 'FAST RESPONSE WHEN YOU NEED IT MOST', subheadline: 'Licensed professionals on call around the clock. Average response time: 45 minutes.', ctas: [{ label: 'CALL NOW', href: 'tel:+15559111234' }, { label: 'Request Service', intent: 'quote.request', variant: 'outline' }], stats: [{ value: '45min', label: 'Avg Response' }, { value: '24/7', label: 'Available' }, { value: '100%', label: 'Guaranteed' }] } },
    { id: 'services', type: 'services', props: { headline: 'EMERGENCY SERVICES', items: SERVICES.filter(s => s.badge === '24/7' || s.title.includes('Plumbing') || s.title.includes('Electrical')).concat(SERVICES.slice(0, 3)), columns: 3 } },
    { id: 'cta', type: 'cta', props: { headline: 'DON\'T WAIT — CALL NOW', description: 'Every minute counts. Our crews are standing by.', ctas: [{ label: 'CALL (555) 911-1234', href: 'tel:+15559111234' }] } },
    { id: 'reviews', type: 'testimonials', props: { headline: 'VERIFIED REVIEWS', items: REVIEWS } },
    { id: 'footer', type: 'footer', props: { brand: 'RAPID', columns: FOOTER_COLS, newsletter: false, socials: [{ platform: 'Google', url: '#' }] } },
  ],
};
