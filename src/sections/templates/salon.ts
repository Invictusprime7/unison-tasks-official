/**
 * Salon Templates — Section Registry Compositions
 * 
 * 3 variants using the section registry:
 * - Dark Luxury
 * - Light Wellness 
 * - Bold Editorial
 */

import type { TemplateComposition } from '../types';
import { THEME_DARK_LUXURY, THEME_LIGHT_WELLNESS, THEME_BOLD_EDITORIAL } from '../themes';

// ============================================================================
// Shared Salon Data
// ============================================================================

const SALON_SERVICES = [
  { title: 'Signature Cut & Style', description: 'Precision cutting with our master stylists, includes consultation, shampoo, and luxury blowout.', price: '$85+', duration: '60 min', badge: 'Most Popular', cta: { label: 'Book Now', intent: 'booking.create' } },
  { title: 'Color Artistry', description: 'Custom color formulation — balayage, highlights, or full color — tailored to your vision.', price: '$150+', duration: '120 min', cta: { label: 'Book Now', intent: 'booking.create' } },
  { title: 'Bridal & Special Event', description: 'Complete bridal styling packages with trial run, day-of styling, and optional makeup.', price: '$250+', duration: '180 min', badge: 'Premium', cta: { label: 'Book Now', intent: 'booking.create' } },
  { title: 'Keratin Treatment', description: 'Professional smoothing treatment for frizz-free, silky hair that lasts up to 3 months.', price: '$200+', duration: '150 min', cta: { label: 'Book Now', intent: 'booking.create' } },
  { title: 'Scalp Therapy', description: 'Rejuvenating scalp treatment with aromatherapy massage and deep conditioning.', price: '$65', duration: '45 min', cta: { label: 'Book Now', intent: 'booking.create' } },
  { title: 'Extensions & Additions', description: 'Premium tape-in, sew-in, or clip-in extensions. Certified application and blending.', price: '$300+', duration: '180 min', cta: { label: 'Book Now', intent: 'booking.create' } },
];

const SALON_TEAM = [
  { name: 'Isabella Rossi', role: 'Master Stylist & Founder', bio: '15 years of award-winning artistry in editorial and bridal styling.' },
  { name: 'Marcus Chen', role: 'Color Specialist', bio: 'Balayage and vivid color expert with international training.' },
  { name: 'Aria Thompson', role: 'Senior Stylist', bio: 'Precision cutting and texture specialist.' },
  { name: 'Sofia Martinez', role: 'Bridal Specialist', bio: 'Dedicated to creating your perfect wedding-day look.' },
];

const SALON_TESTIMONIALS = [
  { quote: 'Isabella completely transformed my hair. The balayage is exactly what I envisioned — natural, dimensional, and absolutely stunning.', author: 'Sarah M.', role: 'Regular Client', rating: 5 },
  { quote: 'Best salon experience in the city. The attention to detail and luxurious atmosphere make every visit feel special.', author: 'Jennifer K.', role: 'Bridal Client', rating: 5 },
  { quote: 'Marcus is a color genius. He listened to exactly what I wanted and delivered beyond my expectations.', author: 'Amanda R.', role: 'Color Client', rating: 5 },
];

const SALON_FAQ = [
  { question: 'How do I book an appointment?', answer: 'You can book online through our website, call us directly, or use our mobile app. We recommend booking 1-2 weeks in advance for popular time slots.' },
  { question: 'What is your cancellation policy?', answer: 'We require 24-hour notice for cancellations. Late cancellations or no-shows may be subject to a 50% service charge.' },
  { question: 'Do you offer consultations?', answer: 'Yes! We offer complimentary 15-minute consultations for new clients and before major services like color transformations.' },
  { question: 'What products do you use?', answer: 'We exclusively use professional-grade products from Olaplex, Kerastase, and our own curated line of sulfate-free formulations.' },
];

const SALON_NAV_LINKS = [
  { label: 'Services', href: '#services' },
  { label: 'Stylists', href: '#team' },
  { label: 'Reviews', href: '#testimonials' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
];

const SALON_FOOTER_COLUMNS = [
  { title: 'Services', links: [{ label: 'Cuts & Styling', href: '#services' }, { label: 'Color', href: '#services' }, { label: 'Bridal', href: '#services' }, { label: 'Treatments', href: '#services' }] },
  { title: 'Info', links: [{ label: 'About Us', href: '#team' }, { label: 'Reviews', href: '#testimonials' }, { label: 'FAQ', href: '#faq' }, { label: 'Contact', href: '#contact' }] },
  { title: 'Hours', links: [{ label: 'Mon–Fri: 9am–8pm', href: '#' }, { label: 'Saturday: 9am–6pm', href: '#' }, { label: 'Sunday: 10am–5pm', href: '#' }] },
];

// ============================================================================
// Dark Luxury Variant
// ============================================================================

export const salonDarkLuxury: TemplateComposition = {
  id: 'salon-dark-luxury',
  name: 'Luxe Salon — Dark',
  category: 'salon',
  industry: 'salon',
  description: 'Sophisticated dark theme with pink/purple gradients for premium salons',
  theme: THEME_DARK_LUXURY,
  tags: ['salon', 'beauty', 'dark', 'luxury'],
  systemType: 'booking',
  sections: [
    { id: 'nav', type: 'navbar', props: { brand: 'LUXE SALON', links: SALON_NAV_LINKS, cta: { label: 'Book Now', intent: 'booking.create' }, sticky: true } },
    { id: 'hero', type: 'hero', props: { badge: '✦ Premium Hair Studio', headline: 'Where Beauty Meets Artistry', subheadline: 'Experience world-class hair styling in an intimate, luxurious setting. Our master stylists craft looks that are uniquely you.', ctas: [{ label: 'Book Appointment', intent: 'booking.create' }, { label: 'View Services', href: '#services', variant: 'outline' }], stats: [{ value: '15+', label: 'Years' }, { value: '10K+', label: 'Clients' }, { value: '4.9', label: 'Rating' }] } },
    { id: 'services', type: 'services', props: { headline: 'Our Services', subheadline: 'Curated treatments designed to enhance your natural beauty', items: SALON_SERVICES, columns: 3 } },
    { id: 'team', type: 'team', props: { headline: 'Meet Our Stylists', subheadline: 'Award-winning artists dedicated to your transformation', members: SALON_TEAM, columns: 4 } },
    { id: 'testimonials', type: 'testimonials', props: { headline: 'Client Love', subheadline: 'What our clients say about their experience', items: SALON_TESTIMONIALS } },
    { id: 'cta', type: 'cta', props: { headline: 'Ready for Your Transformation?', description: 'Book your appointment today and experience the difference.', ctas: [{ label: 'Book Now', intent: 'booking.create' }, { label: 'Call Us', href: 'tel:+1234567890', variant: 'outline' }] } },
    { id: 'faq', type: 'faq', props: { headline: 'Frequently Asked Questions', items: SALON_FAQ } },
    { id: 'contact', type: 'contact', props: { headline: 'Get in Touch', description: 'Questions? We\'d love to hear from you.', phone: '(555) 123-4567', email: 'hello@luxesalon.com', address: '123 Beauty Lane, Suite 200' } },
    { id: 'footer', type: 'footer', props: { brand: 'LUXE SALON', columns: SALON_FOOTER_COLUMNS, newsletter: true, socials: [{ platform: 'Instagram', url: '#' }, { platform: 'Facebook', url: '#' }, { platform: 'TikTok', url: '#' }] } },
  ],
};

// ============================================================================
// Light Wellness Variant
// ============================================================================

export const salonLightWellness: TemplateComposition = {
  id: 'salon-light-wellness',
  name: 'Serenity Salon — Light',
  category: 'salon',
  industry: 'salon',
  description: 'Calm, warm light theme with organic typography for wellness-focused salons',
  theme: THEME_LIGHT_WELLNESS,
  tags: ['salon', 'beauty', 'light', 'wellness'],
  systemType: 'booking',
  sections: [
    { id: 'nav', type: 'navbar', props: { brand: 'Serenity', links: SALON_NAV_LINKS, cta: { label: 'Book a Visit', intent: 'booking.create' }, sticky: true } },
    { id: 'hero', type: 'hero', props: { badge: '🌿 Wellness & Beauty', headline: 'Your Sanctuary of Self-Care', subheadline: 'A holistic approach to beauty, where relaxation meets expert styling in a serene, sun-filled space.', ctas: [{ label: 'Book Your Visit', intent: 'booking.create' }, { label: 'Our Philosophy', href: '#team', variant: 'outline' }] } },
    { id: 'services', type: 'services', props: { headline: 'Treatments & Services', subheadline: 'Nurturing rituals for hair, scalp, and soul', items: SALON_SERVICES, columns: 3 } },
    { id: 'stats', type: 'stats', props: { items: [{ value: '2,500+', label: 'Happy Clients' }, { value: '100%', label: 'Organic Products' }, { value: '4.9★', label: 'Google Rating' }, { value: '8+', label: 'Years' }] } },
    { id: 'team', type: 'team', props: { headline: 'Our Artists', subheadline: 'Passionate professionals who care about your wellness', members: SALON_TEAM, columns: 4 } },
    { id: 'testimonials', type: 'testimonials', props: { headline: 'Kind Words', items: SALON_TESTIMONIALS } },
    { id: 'faq', type: 'faq', props: { headline: 'Common Questions', items: SALON_FAQ } },
    { id: 'contact', type: 'contact', props: { headline: 'Visit Us', description: 'We\'d love to welcome you to our studio.', phone: '(555) 123-4567', email: 'hello@serenitysalon.com', address: '456 Wellness Drive' } },
    { id: 'footer', type: 'footer', props: { brand: 'Serenity', columns: SALON_FOOTER_COLUMNS, newsletter: true, socials: [{ platform: 'Instagram', url: '#' }, { platform: 'Pinterest', url: '#' }] } },
  ],
};

// ============================================================================
// Bold Editorial Variant
// ============================================================================

export const salonBoldEditorial: TemplateComposition = {
  id: 'salon-bold-editorial',
  name: 'EDGE Studio — Bold',
  category: 'salon',
  industry: 'salon',
  description: 'High-contrast editorial style with bold typography for fashion-forward salons',
  theme: THEME_BOLD_EDITORIAL,
  tags: ['salon', 'beauty', 'bold', 'editorial'],
  systemType: 'booking',
  sections: [
    { id: 'nav', type: 'navbar', props: { brand: 'EDGE', links: SALON_NAV_LINKS, cta: { label: 'BOOK', intent: 'booking.create' }, sticky: true } },
    { id: 'hero', type: 'hero', props: { badge: '🔥 EDITORIAL STYLING', headline: 'REDEFINE YOUR LOOK', subheadline: 'Bold cuts. Fearless color. Unapologetic style. This is not your average salon.', ctas: [{ label: 'Book Session', intent: 'booking.create' }, { label: 'See Our Work', href: '#team', variant: 'outline' }], stats: [{ value: '500+', label: 'Editorial Shoots' }, { value: '50+', label: 'Awards' }, { value: '∞', label: 'Creativity' }] } },
    { id: 'services', type: 'services', props: { headline: 'WHAT WE DO', subheadline: 'Fashion-forward services for the bold', items: SALON_SERVICES, columns: 3 } },
    { id: 'team', type: 'team', props: { headline: 'THE CREW', members: SALON_TEAM, columns: 4 } },
    { id: 'testimonials', type: 'testimonials', props: { headline: 'REVIEWS', items: SALON_TESTIMONIALS } },
    { id: 'cta', type: 'cta', props: { headline: 'READY TO GO BOLD?', description: 'Your transformation starts with a single booking.', ctas: [{ label: 'BOOK NOW', intent: 'booking.create' }] } },
    { id: 'faq', type: 'faq', props: { headline: 'FAQ', items: SALON_FAQ } },
    { id: 'footer', type: 'footer', props: { brand: 'EDGE', columns: SALON_FOOTER_COLUMNS, newsletter: true, socials: [{ platform: 'IG', url: '#' }, { platform: 'TikTok', url: '#' }] } },
  ],
};
