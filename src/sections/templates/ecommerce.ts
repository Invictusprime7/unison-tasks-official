/**
 * E-commerce Templates — Section Registry Compositions
 * 3 variants: Dark Fashion, Clean Showcase, Bold Lifestyle
 */
import type { TemplateComposition, ThemeTokens } from '../types';
import { THEME_ECOMMERCE_MODERN } from '../themes';

const THEME_FASHION_DARK: ThemeTokens = {
  colors: { primary: '0 0% 90%', primaryForeground: '0 0% 5%', secondary: '0 0% 60%', secondaryForeground: '0 0% 100%', accent: '0 0% 80%', accentForeground: '0 0% 5%', background: '0 0% 4%', foreground: '0 0% 93%', muted: '0 0% 10%', mutedForeground: '0 0% 55%', card: '0 0% 7%', cardForeground: '0 0% 93%', border: '0 0% 15%' },
  typography: { headingFont: "'Inter', sans-serif", bodyFont: "'Inter', sans-serif", headingWeight: '300', bodyWeight: '400' },
  radius: '0rem', sectionPadding: '5rem 1rem', containerWidth: '1280px',
};

const THEME_LIFESTYLE: ThemeTokens = {
  colors: { primary: '25 90% 55%', primaryForeground: '0 0% 100%', secondary: '350 70% 55%', secondaryForeground: '0 0% 100%', accent: '25 80% 60%', accentForeground: '0 0% 100%', background: '0 0% 3%', foreground: '0 0% 95%', muted: '0 0% 8%', mutedForeground: '0 0% 55%', card: '0 0% 6%', cardForeground: '0 0% 95%', border: '0 0% 14%' },
  typography: { headingFont: "'Bebas Neue', sans-serif", bodyFont: "'Inter', sans-serif", headingWeight: '400', bodyWeight: '400' },
  radius: '0.25rem', sectionPadding: '5rem 1rem', containerWidth: '1280px',
};

const PRODUCTS = [
  { title: 'Structured Wool Coat', description: 'Double-faced Italian wool. Minimalist silhouette with horn buttons.', price: '$480', badge: 'New', cta: { label: 'Shop Now', intent: 'newsletter.subscribe' } },
  { title: 'Silk Midi Dress', description: 'Fluid silk charmeuse in seasonal colorway. French seam construction.', price: '$320', cta: { label: 'Shop Now', intent: 'newsletter.subscribe' } },
  { title: 'Leather Crossbody', description: 'Full-grain vegetable-tanned leather. Handcrafted in small batches.', price: '$195', badge: 'Bestseller', cta: { label: 'Shop Now', intent: 'newsletter.subscribe' } },
  { title: 'Cashmere Knit Set', description: 'Mongolian cashmere ribbed top and wide-leg trouser. Available in 6 colors.', price: '$540', cta: { label: 'Shop Now', intent: 'newsletter.subscribe' } },
  { title: 'Linen Shirt', description: 'Relaxed-fit Belgian linen with mother-of-pearl buttons.', price: '$145', cta: { label: 'Shop Now', intent: 'newsletter.subscribe' } },
  { title: 'Suede Chelsea Boot', description: 'Italian suede with Goodyear welt construction. Water-resistant treatment.', price: '$285', cta: { label: 'Shop Now', intent: 'newsletter.subscribe' } },
];

const NAV = [{ label: 'New In', href: '#products' }, { label: 'Collections', href: '#collections' }, { label: 'About', href: '#about' }];
const FOOTER_COLS = [
  { title: 'Shop', links: [{ label: 'New Arrivals', href: '#' }, { label: 'Best Sellers', href: '#' }, { label: 'Collections', href: '#' }, { label: 'Sale', href: '#' }] },
  { title: 'Help', links: [{ label: 'Shipping', href: '#' }, { label: 'Returns', href: '#' }, { label: 'Size Guide', href: '#' }, { label: 'Contact', href: '#contact' }] },
  { title: 'About', links: [{ label: 'Our Story', href: '#about' }, { label: 'Sustainability', href: '#' }, { label: 'Careers', href: '#' }] },
];

export const ecommerceFashionDark: TemplateComposition = {
  id: 'ecommerce-fashion-dark', name: 'NOIR — Fashion', category: 'store', industry: 'ecommerce',
  description: 'Minimal dark theme for fashion e-commerce', theme: THEME_FASHION_DARK,
  tags: ['ecommerce', 'fashion', 'dark', 'minimal'], systemType: 'store',
  sections: [
    { id: 'nav', type: 'navbar', props: { brand: 'NOIR', links: NAV, cta: { label: 'Join Us', intent: 'newsletter.subscribe' }, sticky: true } },
    { id: 'hero', type: 'hero', props: { headline: 'The New Collection', subheadline: 'Timeless silhouettes. Considered materials. Made to endure.', ctas: [{ label: 'Shop New Arrivals', href: '#products' }, { label: 'View Lookbook', href: '#collections', variant: 'outline' }] } },
    { id: 'products', type: 'services', props: { headline: 'New Arrivals', items: PRODUCTS, columns: 3 } },
    { id: 'about', type: 'about', props: { headline: 'Our Philosophy', description: 'NOIR believes in the beauty of restraint. Every piece is designed to transcend seasons — built with the finest materials, produced responsibly, and made to become a permanent part of your wardrobe. We source exclusively from certified mills and workshops committed to ethical production.' } },
    { id: 'cta', type: 'cta', props: { headline: 'Join the NOIR Community', description: 'Early access to new collections, exclusive offers, and style inspiration.', ctas: [{ label: 'Subscribe', intent: 'newsletter.subscribe' }] } },
    { id: 'footer', type: 'footer', props: { brand: 'NOIR', columns: FOOTER_COLS, newsletter: true, socials: [{ platform: 'Instagram', url: '#' }, { platform: 'Pinterest', url: '#' }] } },
  ],
};

export const ecommerceCleanShowcase: TemplateComposition = {
  id: 'ecommerce-clean-showcase', name: 'Bloom — Clean Store', category: 'store', industry: 'ecommerce',
  description: 'Clean light theme for product showcases', theme: THEME_ECOMMERCE_MODERN,
  tags: ['ecommerce', 'clean', 'light', 'modern'], systemType: 'store',
  sections: [
    { id: 'nav', type: 'navbar', props: { brand: 'Bloom', links: NAV, cta: { label: 'Shop Now', href: '#products' }, sticky: true } },
    { id: 'hero', type: 'hero', props: { badge: '🌸 Spring Collection', headline: 'Fresh Styles for a New Season', subheadline: 'Discover our curated selection of sustainable fashion, designed for modern living.', ctas: [{ label: 'Shop the Collection', href: '#products' }, { label: 'Our Story', href: '#about', variant: 'outline' }] } },
    { id: 'products', type: 'services', props: { headline: 'Featured Products', subheadline: 'Handpicked by our stylists', items: PRODUCTS.slice(0, 4), columns: 4 } },
    { id: 'stats', type: 'stats', props: { items: [{ value: '100%', label: 'Sustainable' }, { value: '50K+', label: 'Happy Customers' }, { value: 'Free', label: 'Shipping $100+' }] } },
    { id: 'about', type: 'about', props: { headline: 'Sustainably Made', description: 'Every Bloom piece is crafted with care for people and planet. We partner with certified ethical manufacturers and use organic, recycled, and regenerative materials whenever possible.', cta: { label: 'Learn More', href: '#' } } },
    { id: 'contact', type: 'contact', props: { headline: 'Need Help?', description: 'Our customer care team is here for you.', email: 'care@bloom.com', phone: '(555) 678-9012' } },
    { id: 'footer', type: 'footer', props: { brand: 'Bloom', columns: FOOTER_COLS, newsletter: true, socials: [{ platform: 'Instagram', url: '#' }, { platform: 'TikTok', url: '#' }] } },
  ],
};

export const ecommerceBoldLifestyle: TemplateComposition = {
  id: 'ecommerce-bold-lifestyle', name: 'EDGE Goods — Bold', category: 'store', industry: 'ecommerce',
  description: 'Bold lifestyle brand theme', theme: THEME_LIFESTYLE,
  tags: ['ecommerce', 'bold', 'lifestyle'], systemType: 'store',
  sections: [
    { id: 'nav', type: 'navbar', props: { brand: 'EDGE', links: NAV, cta: { label: 'SHOP', href: '#products' }, sticky: true } },
    { id: 'hero', type: 'hero', props: { headline: 'LIVE ON THE EDGE', subheadline: 'Bold essentials for those who refuse to blend in.', ctas: [{ label: 'SHOP THE DROP', href: '#products' }], stats: [{ value: '100+', label: 'Styles' }, { value: '24hr', label: 'Shipping' }] } },
    { id: 'products', type: 'services', props: { headline: 'THE DROP', items: PRODUCTS, columns: 3 } },
    { id: 'cta', type: 'cta', props: { headline: 'DON\'T MISS OUT', description: 'Limited drops. Once they\'re gone, they\'re gone.', ctas: [{ label: 'JOIN THE LIST', intent: 'newsletter.subscribe' }] } },
    { id: 'footer', type: 'footer', props: { brand: 'EDGE', columns: FOOTER_COLS, newsletter: true, socials: [{ platform: 'IG', url: '#' }, { platform: 'TikTok', url: '#' }] } },
  ],
};
