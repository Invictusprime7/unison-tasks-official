/**
 * Real Estate Templates — Section Registry Compositions
 * 3 variants: Luxury (Dark), Residential (Light), Commercial (Bold)
 */
import type { TemplateComposition, ThemeTokens } from '../types';

const THEME_LUXURY_RE: ThemeTokens = {
  colors: { primary: '45 60% 50%', primaryForeground: '0 0% 5%', secondary: '30 40% 40%', secondaryForeground: '0 0% 100%', accent: '45 50% 55%', accentForeground: '0 0% 5%', background: '220 15% 6%', foreground: '40 10% 90%', muted: '220 10% 12%', mutedForeground: '40 8% 55%', card: '220 10% 9%', cardForeground: '40 10% 90%', border: '220 8% 18%' },
  typography: { headingFont: "'Playfair Display', serif", bodyFont: "'Inter', sans-serif", headingWeight: '700', bodyWeight: '400' },
  radius: '0.5rem', sectionPadding: '5rem 1rem', containerWidth: '1200px',
};

const THEME_RESIDENTIAL: ThemeTokens = {
  colors: { primary: '200 60% 45%', primaryForeground: '0 0% 100%', secondary: '160 45% 40%', secondaryForeground: '0 0% 100%', accent: '200 50% 50%', accentForeground: '0 0% 100%', background: '200 15% 97%', foreground: '210 15% 15%', muted: '200 10% 92%', mutedForeground: '210 8% 45%', card: '0 0% 100%', cardForeground: '210 15% 15%', border: '200 10% 88%' },
  typography: { headingFont: "'Inter', sans-serif", bodyFont: "'Inter', sans-serif", headingWeight: '700', bodyWeight: '400' },
  radius: '0.75rem', sectionPadding: '5rem 1rem', containerWidth: '1200px',
};

const THEME_COMMERCIAL: ThemeTokens = {
  colors: { primary: '220 70% 50%', primaryForeground: '0 0% 100%', secondary: '200 60% 45%', secondaryForeground: '0 0% 100%', accent: '45 80% 55%', accentForeground: '0 0% 10%', background: '220 20% 6%', foreground: '0 0% 95%', muted: '220 15% 12%', mutedForeground: '220 8% 55%', card: '220 12% 9%', cardForeground: '0 0% 95%', border: '220 10% 18%' },
  typography: { headingFont: "'Inter', sans-serif", bodyFont: "'Inter', sans-serif", headingWeight: '800', bodyWeight: '400' },
  radius: '0.5rem', sectionPadding: '5rem 1rem', containerWidth: '1200px',
};

const LISTINGS = [
  { title: 'Oceanfront Penthouse', description: 'Stunning 4BR/3BA penthouse with panoramic ocean views, private terrace, and designer finishes.', price: '$4.2M', badge: 'Featured', cta: { label: 'Schedule Tour', intent: 'booking.create' } },
  { title: 'Modern Downtown Loft', description: 'Open-concept 2BR loft in the heart of downtown. Floor-to-ceiling windows, exposed brick.', price: '$850K', cta: { label: 'Schedule Tour', intent: 'booking.create' } },
  { title: 'Suburban Family Estate', description: '5BR/4BA estate on 2 acres. Gourmet kitchen, pool, home theater, and 3-car garage.', price: '$1.8M', badge: 'New Listing', cta: { label: 'Schedule Tour', intent: 'booking.create' } },
  { title: 'Historic Brownstone', description: 'Beautifully restored 3BR brownstone with original details, garden, and modern updates.', price: '$1.2M', cta: { label: 'Schedule Tour', intent: 'booking.create' } },
];

const TESTIMONIALS = [
  { quote: 'Found our dream home in under 30 days. The team\'s market knowledge and negotiation skills are unmatched.', author: 'The Hendersons', role: 'Buyers', rating: 5 },
  { quote: 'Sold our property for 15% above asking. Professional marketing, stunning photography, and expert staging.', author: 'James W.', role: 'Seller', rating: 5 },
  { quote: 'As first-time buyers, we needed guidance at every step. They made the process smooth and stress-free.', author: 'Sarah & Mike', role: 'First-Time Buyers', rating: 5 },
];

const NAV = [{ label: 'Properties', href: '#properties' }, { label: 'About', href: '#about' }, { label: 'Testimonials', href: '#testimonials' }, { label: 'Contact', href: '#contact' }];
const FOOTER_COLS = [
  { title: 'Properties', links: [{ label: 'Luxury', href: '#' }, { label: 'Residential', href: '#' }, { label: 'Commercial', href: '#' }, { label: 'Rentals', href: '#' }] },
  { title: 'Services', links: [{ label: 'Buying', href: '#' }, { label: 'Selling', href: '#' }, { label: 'Valuation', href: '#' }, { label: 'Consulting', href: '#' }] },
];

export const realEstateLuxury: TemplateComposition = {
  id: 'realestate-luxury', name: 'Prestige Realty — Luxury', category: 'realestate', industry: 'real-estate',
  description: 'Luxury dark theme for high-end real estate', theme: THEME_LUXURY_RE,
  tags: ['real-estate', 'luxury', 'dark'], systemType: 'agency',
  sections: [
    { id: 'nav', type: 'navbar', props: { brand: 'Prestige Realty', links: NAV, cta: { label: 'Schedule Viewing', intent: 'booking.create' }, sticky: true } },
    { id: 'hero', type: 'hero', props: { badge: '✦ Luxury Real Estate', headline: 'Exceptional Properties for Exceptional Living', subheadline: 'Curating the finest luxury properties in the most coveted locations. Your dream home awaits.', ctas: [{ label: 'View Properties', href: '#properties' }, { label: 'Schedule Consultation', intent: 'booking.create', variant: 'outline' }], stats: [{ value: '$2B+', label: 'In Sales' }, { value: '500+', label: 'Properties Sold' }, { value: '20+', label: 'Years' }] } },
    { id: 'properties', type: 'services', props: { headline: 'Featured Properties', items: LISTINGS, columns: 2 } },
    { id: 'stats', type: 'stats', props: { items: [{ value: '98%', label: 'Client Satisfaction' }, { value: '14', label: 'Avg Days on Market' }, { value: '105%', label: 'Avg Sale/List Ratio' }] } },
    { id: 'testimonials', type: 'testimonials', props: { headline: 'Client Stories', items: TESTIMONIALS } },
    { id: 'cta', type: 'cta', props: { headline: 'Find Your Perfect Home', description: 'Schedule a private consultation with our luxury property specialists.', ctas: [{ label: 'Book Consultation', intent: 'booking.create' }, { label: 'Call (555) 789-0123', href: 'tel:+15557890123', variant: 'outline' }] } },
    { id: 'contact', type: 'contact', props: { headline: 'Contact Us', phone: '(555) 789-0123', email: 'luxury@prestigerealty.com', address: '100 Park Avenue, Suite 500' } },
    { id: 'footer', type: 'footer', props: { brand: 'Prestige Realty', columns: FOOTER_COLS, newsletter: true, socials: [{ platform: 'Instagram', url: '#' }, { platform: 'LinkedIn', url: '#' }] } },
  ],
};

export const realEstateResidential: TemplateComposition = {
  id: 'realestate-residential', name: 'HomeBase — Residential', category: 'realestate', industry: 'real-estate',
  description: 'Clean light theme for residential real estate', theme: THEME_RESIDENTIAL,
  tags: ['real-estate', 'residential', 'light'], systemType: 'agency',
  sections: [
    { id: 'nav', type: 'navbar', props: { brand: 'HomeBase', links: NAV, cta: { label: 'Get Started', intent: 'contact.submit' }, sticky: true } },
    { id: 'hero', type: 'hero', props: { badge: '🏠 Find Your Home', headline: 'Your Journey Home Starts Here', subheadline: 'Whether buying your first home or upgrading, we\'ll guide you every step of the way.', ctas: [{ label: 'Browse Listings', href: '#properties' }, { label: 'Free Home Valuation', intent: 'quote.request', variant: 'outline' }] } },
    { id: 'properties', type: 'services', props: { headline: 'Featured Listings', items: LISTINGS, columns: 2 } },
    { id: 'testimonials', type: 'testimonials', props: { headline: 'Happy Homeowners', items: TESTIMONIALS } },
    { id: 'faq', type: 'faq', props: { headline: 'Buying & Selling FAQ', items: [{ question: 'How do I get started?', answer: 'Schedule a free consultation and we\'ll discuss your goals, budget, and timeline.' }, { question: 'Do you help with financing?', answer: 'Yes, we connect you with trusted mortgage partners who can find the best rates for your situation.' }, { question: 'What areas do you cover?', answer: 'We cover the entire metro area and surrounding suburbs.' }] } },
    { id: 'contact', type: 'contact', props: { headline: 'Let\'s Talk', phone: '(555) 890-1234', email: 'hello@homebase.com' } },
    { id: 'footer', type: 'footer', props: { brand: 'HomeBase', columns: FOOTER_COLS, newsletter: true, socials: [{ platform: 'Facebook', url: '#' }, { platform: 'Instagram', url: '#' }] } },
  ],
};

export const realEstateCommercial: TemplateComposition = {
  id: 'realestate-commercial', name: 'CityBlock — Commercial', category: 'realestate', industry: 'real-estate',
  description: 'Professional dark theme for commercial real estate', theme: THEME_COMMERCIAL,
  tags: ['real-estate', 'commercial', 'professional'], systemType: 'agency',
  sections: [
    { id: 'nav', type: 'navbar', props: { brand: 'CityBlock', links: NAV, cta: { label: 'Inquire', intent: 'contact.submit' }, sticky: true } },
    { id: 'hero', type: 'hero', props: { headline: 'Commercial Real Estate Solutions', subheadline: 'Strategic acquisition, leasing, and management of prime commercial properties.', ctas: [{ label: 'View Portfolio', href: '#properties' }, { label: 'Contact Us', intent: 'contact.submit', variant: 'outline' }], stats: [{ value: '5M+', label: 'Sq Ft Managed' }, { value: '$1B+', label: 'Transactions' }, { value: '200+', label: 'Properties' }] } },
    { id: 'properties', type: 'services', props: { headline: 'Available Properties', items: LISTINGS, columns: 2 } },
    { id: 'testimonials', type: 'testimonials', props: { headline: 'Client Results', items: TESTIMONIALS } },
    { id: 'contact', type: 'contact', props: { headline: 'Get in Touch', phone: '(555) 901-2345', email: 'deals@cityblock.com', address: '200 Financial District, Tower 1' } },
    { id: 'footer', type: 'footer', props: { brand: 'CityBlock', columns: FOOTER_COLS, newsletter: false, socials: [{ platform: 'LinkedIn', url: '#' }] } },
  ],
};
