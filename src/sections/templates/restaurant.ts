/**
 * Restaurant Templates — Section Registry Compositions
 * 3 variants: Fine Dining (Dark), Casual Bistro (Light), Farm-to-Table (Bold)
 */
import type { TemplateComposition } from '../types';
import { THEME_RESTAURANT_WARM } from '../themes';
import type { ThemeTokens } from '../types';

const THEME_BISTRO_LIGHT: ThemeTokens = {
  colors: { primary: '25 70% 45%', primaryForeground: '0 0% 100%', secondary: '45 60% 50%', secondaryForeground: '0 0% 10%', accent: '15 80% 50%', accentForeground: '0 0% 100%', background: '35 25% 97%', foreground: '25 20% 15%', muted: '35 15% 92%', mutedForeground: '25 10% 45%', card: '0 0% 100%', cardForeground: '25 20% 15%', border: '35 15% 88%' },
  typography: { headingFont: "'Cormorant Garamond', serif", bodyFont: "'Inter', sans-serif", headingWeight: '600', bodyWeight: '400' },
  radius: '0.75rem', sectionPadding: '5rem 1rem', containerWidth: '1200px',
};

const THEME_FARM_BOLD: ThemeTokens = {
  colors: { primary: '140 60% 35%', primaryForeground: '0 0% 100%', secondary: '35 80% 50%', secondaryForeground: '0 0% 10%', accent: '140 50% 45%', accentForeground: '0 0% 100%', background: '0 0% 4%', foreground: '0 0% 95%', muted: '0 0% 10%', mutedForeground: '0 0% 55%', card: '0 0% 7%', cardForeground: '0 0% 95%', border: '0 0% 15%' },
  typography: { headingFont: "'Bebas Neue', sans-serif", bodyFont: "'Inter', sans-serif", headingWeight: '400', bodyWeight: '400' },
  radius: '0.25rem', sectionPadding: '6rem 1rem', containerWidth: '1200px',
};

const MENU_ITEMS = [
  { title: 'Pan-Seared Salmon', description: 'Wild-caught Atlantic salmon with lemon beurre blanc, seasonal vegetables, and fingerling potatoes.', price: '$38', badge: 'Chef\'s Choice', cta: { label: 'Reserve', intent: 'booking.create' } },
  { title: 'Wagyu Beef Tenderloin', description: 'A5 grade wagyu with truffle jus, roasted bone marrow, and heirloom carrots.', price: '$62', cta: { label: 'Reserve', intent: 'booking.create' } },
  { title: 'Lobster Risotto', description: 'Creamy arborio rice with butter-poached lobster, saffron, and aged parmesan.', price: '$44', cta: { label: 'Reserve', intent: 'booking.create' } },
  { title: 'Tasting Menu', description: 'Seven-course seasonal tasting menu with optional wine pairing by our sommelier.', price: '$120', badge: 'Premium', cta: { label: 'Reserve', intent: 'booking.create' } },
  { title: 'Artisan Cheese Board', description: 'Curated selection of imported and local artisanal cheeses with honey and seasonal fruits.', price: '$24', cta: { label: 'Reserve', intent: 'booking.create' } },
  { title: 'Dessert Collection', description: 'Rotating selection of house-made desserts — crème brûlée, chocolate soufflé, seasonal tarts.', price: '$16', cta: { label: 'Reserve', intent: 'booking.create' } },
];

const REVIEWS = [
  { quote: 'An extraordinary dining experience. Every course was a work of art, and the service was impeccable.', author: 'Michael R.', role: 'Food Critic', rating: 5 },
  { quote: 'The tasting menu was a journey. Each dish told a story of seasonal ingredients at their peak.', author: 'Elena S.', role: 'Regular Guest', rating: 5 },
  { quote: 'Perfect for special occasions. The ambiance, food, and wine selection are world-class.', author: 'David L.', role: 'Anniversary Dinner', rating: 5 },
];

const NAV = [
  { label: 'Menu', href: '#menu' }, { label: 'Our Story', href: '#about' },
  { label: 'Reviews', href: '#reviews' }, { label: 'Contact', href: '#contact' },
];

const FOOTER_COLS = [
  { title: 'Visit', links: [{ label: 'Menu', href: '#menu' }, { label: 'Wine List', href: '#' }, { label: 'Private Dining', href: '#contact' }] },
  { title: 'Hours', links: [{ label: 'Tue–Thu: 5pm–10pm', href: '#' }, { label: 'Fri–Sat: 5pm–11pm', href: '#' }, { label: 'Sunday Brunch: 10am–2pm', href: '#' }] },
  { title: 'Connect', links: [{ label: 'Reservations', href: '#', intent: 'booking.create' }, { label: 'Events', href: '#contact' }, { label: 'Gift Cards', href: '#' }] },
];

export const restaurantFineDining: TemplateComposition = {
  id: 'restaurant-fine-dining', name: 'Aurum — Fine Dining', category: 'restaurant', industry: 'restaurant',
  description: 'Dark luxury theme for upscale restaurants', theme: THEME_RESTAURANT_WARM,
  tags: ['restaurant', 'fine-dining', 'dark'], systemType: 'booking',
  sections: [
    { id: 'nav', type: 'navbar', props: { brand: 'Aurum', links: NAV, cta: { label: 'Reserve a Table', intent: 'booking.create' }, sticky: true } },
    { id: 'hero', type: 'hero', props: { badge: '✦ Fine Dining Experience', headline: 'Where Every Dish Tells a Story', subheadline: 'Award-winning cuisine crafted from the finest seasonal ingredients, served in an intimate atmosphere of understated elegance.', ctas: [{ label: 'Reserve a Table', intent: 'booking.create' }, { label: 'View Menu', href: '#menu', variant: 'outline' }], stats: [{ value: '2★', label: 'Michelin' }, { value: '15+', label: 'Years' }, { value: '4.9', label: 'Rating' }] } },
    { id: 'menu', type: 'services', props: { headline: 'The Menu', subheadline: 'Seasonal dishes crafted with passion and precision', items: MENU_ITEMS, columns: 3 } },
    { id: 'about', type: 'about', props: { headline: 'Our Story', description: 'Founded in 2009 by Chef Antoine Beaumont, Aurum celebrates the art of seasonal dining. Every dish is a love letter to local farmers, foragers, and the timeless traditions of French culinary craft. Our intimate 48-seat dining room provides the perfect setting for celebrations, anniversaries, and evenings you\'ll remember.', cta: { label: 'Meet the Chef', href: '#team' } } },
    { id: 'reviews', type: 'testimonials', props: { headline: 'Guest Reviews', items: REVIEWS } },
    { id: 'cta', type: 'cta', props: { headline: 'Join Us for an Unforgettable Evening', description: 'Reservations recommended. Private dining available for parties of 8+.', ctas: [{ label: 'Reserve Now', intent: 'booking.create' }, { label: 'Private Events', intent: 'contact.submit', variant: 'outline' }] } },
    { id: 'contact', type: 'contact', props: { headline: 'Visit Aurum', phone: '(555) 234-5678', email: 'reservations@aurum.com', address: '42 Vine Street, Downtown' } },
    { id: 'footer', type: 'footer', props: { brand: 'Aurum', columns: FOOTER_COLS, newsletter: true, socials: [{ platform: 'Instagram', url: '#' }, { platform: 'Facebook', url: '#' }] } },
  ],
};

export const restaurantCasualBistro: TemplateComposition = {
  id: 'restaurant-casual-bistro', name: 'Harvest Kitchen — Bistro', category: 'restaurant', industry: 'restaurant',
  description: 'Warm light theme for casual dining', theme: THEME_BISTRO_LIGHT,
  tags: ['restaurant', 'casual', 'light', 'bistro'], systemType: 'booking',
  sections: [
    { id: 'nav', type: 'navbar', props: { brand: 'Harvest Kitchen', links: NAV, cta: { label: 'Book a Table', intent: 'booking.create' }, sticky: true } },
    { id: 'hero', type: 'hero', props: { badge: '🌾 Farm-Fresh Dining', headline: 'Good Food, Good Company', subheadline: 'A neighborhood bistro serving honest, farm-to-table cuisine in a warm and welcoming atmosphere.', ctas: [{ label: 'Book a Table', intent: 'booking.create' }, { label: 'See the Menu', href: '#menu', variant: 'outline' }] } },
    { id: 'menu', type: 'services', props: { headline: 'Today\'s Specials', items: MENU_ITEMS.slice(0, 4), columns: 2 } },
    { id: 'stats', type: 'stats', props: { items: [{ value: '100%', label: 'Local Produce' }, { value: '500+', label: 'Happy Reviews' }, { value: '12', label: 'Years Open' }] } },
    { id: 'reviews', type: 'testimonials', props: { headline: 'What Our Guests Say', items: REVIEWS } },
    { id: 'contact', type: 'contact', props: { headline: 'Come Visit Us', phone: '(555) 345-6789', email: 'hello@harvestkitchen.com', address: '88 Main Street' } },
    { id: 'footer', type: 'footer', props: { brand: 'Harvest Kitchen', columns: FOOTER_COLS, newsletter: true, socials: [{ platform: 'Instagram', url: '#' }] } },
  ],
};

export const restaurantFarmBold: TemplateComposition = {
  id: 'restaurant-farm-bold', name: 'ROOTS — Farm to Table', category: 'restaurant', industry: 'restaurant',
  description: 'Bold editorial theme for farm-to-table restaurants', theme: THEME_FARM_BOLD,
  tags: ['restaurant', 'bold', 'farm-to-table'], systemType: 'booking',
  sections: [
    { id: 'nav', type: 'navbar', props: { brand: 'ROOTS', links: NAV, cta: { label: 'RESERVE', intent: 'booking.create' }, sticky: true } },
    { id: 'hero', type: 'hero', props: { badge: '🌱 FARM TO TABLE', headline: 'FROM THE EARTH TO YOUR PLATE', subheadline: 'Hyper-local, hyper-seasonal. Every ingredient sourced within 50 miles.', ctas: [{ label: 'Reserve Your Seat', intent: 'booking.create' }], stats: [{ value: '50mi', label: 'Sourcing Radius' }, { value: '12', label: 'Partner Farms' }, { value: '0', label: 'Food Miles' }] } },
    { id: 'menu', type: 'services', props: { headline: 'SEASONAL MENU', items: MENU_ITEMS, columns: 3 } },
    { id: 'cta', type: 'cta', props: { headline: 'TASTE THE DIFFERENCE', description: 'Join us for a dining experience rooted in sustainability.', ctas: [{ label: 'BOOK NOW', intent: 'booking.create' }] } },
    { id: 'reviews', type: 'testimonials', props: { headline: 'REVIEWS', items: REVIEWS } },
    { id: 'footer', type: 'footer', props: { brand: 'ROOTS', columns: FOOTER_COLS, newsletter: true, socials: [{ platform: 'IG', url: '#' }] } },
  ],
};
