/**
 * Portfolio Templates — Section Registry Compositions
 * 3 variants: Minimal (Light), Creative (Dark), Photography (Bold)
 */
import type { TemplateComposition, ThemeTokens } from '../types';
import { THEME_PORTFOLIO_MINIMAL } from '../themes';

const THEME_CREATIVE_DARK: ThemeTokens = {
  colors: { primary: '270 60% 55%', primaryForeground: '0 0% 100%', secondary: '330 55% 55%', secondaryForeground: '0 0% 100%', accent: '270 50% 60%', accentForeground: '0 0% 100%', background: '260 15% 6%', foreground: '260 5% 92%', muted: '260 10% 12%', mutedForeground: '260 8% 55%', card: '260 10% 9%', cardForeground: '260 5% 92%', border: '260 8% 18%' },
  typography: { headingFont: "'Space Grotesk', sans-serif", bodyFont: "'Inter', sans-serif", headingWeight: '700', bodyWeight: '400' },
  radius: '0.75rem', sectionPadding: '6rem 1.5rem', containerWidth: '1100px',
};

const THEME_PHOTOGRAPHY: ThemeTokens = {
  colors: { primary: '0 0% 100%', primaryForeground: '0 0% 5%', secondary: '0 0% 70%', secondaryForeground: '0 0% 100%', accent: '45 70% 55%', accentForeground: '0 0% 5%', background: '0 0% 3%', foreground: '0 0% 95%', muted: '0 0% 8%', mutedForeground: '0 0% 50%', card: '0 0% 6%', cardForeground: '0 0% 95%', border: '0 0% 12%' },
  typography: { headingFont: "'Inter', sans-serif", bodyFont: "'Inter', sans-serif", headingWeight: '200', bodyWeight: '300' },
  radius: '0rem', sectionPadding: '4rem 2rem', containerWidth: '1400px',
};

const PROJECTS = [
  { title: 'Brand Identity — Pulse', description: 'Complete brand system for a health-tech startup. Logo, typography, color system, and brand guidelines.', badge: 'Branding', cta: { label: 'View Project', href: '#' } },
  { title: 'E-commerce — Bloom', description: 'End-to-end design for a sustainable fashion brand. UX research, UI design, and Shopify build.', badge: 'Web Design', cta: { label: 'View Project', href: '#' } },
  { title: 'Mobile App — Flow', description: 'Meditation and wellness app design. User flows, 60+ screens, micro-interactions, and design system.', badge: 'App Design', cta: { label: 'View Project', href: '#' } },
  { title: 'Marketing Site — Atlas', description: 'High-conversion SaaS landing page. A/B tested, responsive, with 40% improvement in conversion.', badge: 'Web Design', cta: { label: 'View Project', href: '#' } },
  { title: 'Packaging — Terra', description: 'Sustainable packaging design for an organic skincare line. Eco-friendly materials and print production.', badge: 'Packaging', cta: { label: 'View Project', href: '#' } },
  { title: 'Dashboard — Metrics', description: 'Enterprise analytics dashboard. Data visualization, complex filtering, and real-time updates.', badge: 'Product', cta: { label: 'View Project', href: '#' } },
];

const TESTIMONIALS = [
  { quote: 'An incredible designer who truly understands how to translate business goals into beautiful, functional design.', author: 'Alex C.', role: 'CEO, Pulse Health', rating: 5 },
  { quote: 'Our conversion rate increased 40% after the redesign. The attention to detail and user research was exceptional.', author: 'Maya T.', role: 'VP Marketing, Atlas', rating: 5 },
  { quote: 'A rare talent who combines aesthetic sensibility with deep technical understanding.', author: 'David R.', role: 'Founder, Flow App', rating: 5 },
];

const NAV = [{ label: 'Work', href: '#work' }, { label: 'About', href: '#about' }, { label: 'Testimonials', href: '#testimonials' }, { label: 'Contact', href: '#contact' }];
const FOOTER_COLS = [
  { title: 'Work', links: [{ label: 'All Projects', href: '#work' }, { label: 'Branding', href: '#' }, { label: 'Web Design', href: '#' }, { label: 'App Design', href: '#' }] },
  { title: 'Connect', links: [{ label: 'About', href: '#about' }, { label: 'Contact', href: '#contact' }, { label: 'Resume', href: '#' }] },
];

export const portfolioMinimal: TemplateComposition = {
  id: 'portfolio-minimal', name: 'Studio — Minimal Portfolio', category: 'portfolio', industry: 'portfolio',
  description: 'Clean minimal theme for design portfolios', theme: THEME_PORTFOLIO_MINIMAL,
  tags: ['portfolio', 'minimal', 'light', 'design'], systemType: 'portfolio',
  sections: [
    { id: 'nav', type: 'navbar', props: { brand: 'Studio', links: NAV, cta: { label: 'Let\'s Talk', intent: 'contact.submit' }, sticky: true } },
    { id: 'hero', type: 'hero', props: { headline: 'Design that speaks. Work that delivers.', subheadline: 'Independent designer specializing in brand identity, web design, and digital product design for startups and established brands.', ctas: [{ label: 'View Work', href: '#work' }, { label: 'Get in Touch', intent: 'contact.submit', variant: 'outline' }] } },
    { id: 'work', type: 'services', props: { headline: 'Selected Work', items: PROJECTS, columns: 3 } },
    { id: 'about', type: 'about', props: { headline: 'About', description: 'I\'m a multidisciplinary designer with 10+ years of experience helping brands tell their story through thoughtful, purposeful design. I believe great design is invisible — it just works. My process is collaborative, research-driven, and obsessively detail-oriented. Currently accepting new projects for Q2 2026.' } },
    { id: 'stats', type: 'stats', props: { items: [{ value: '50+', label: 'Projects' }, { value: '10+', label: 'Years' }, { value: '30+', label: 'Clients' }, { value: '12', label: 'Awards' }] } },
    { id: 'testimonials', type: 'testimonials', props: { headline: 'Kind Words', items: TESTIMONIALS } },
    { id: 'contact', type: 'contact', props: { headline: 'Start a Project', description: 'Have an idea? Let\'s make it real.', email: 'hello@studio.design' } },
    { id: 'footer', type: 'footer', props: { brand: 'Studio', columns: FOOTER_COLS, newsletter: false, socials: [{ platform: 'Dribbble', url: '#' }, { platform: 'Behance', url: '#' }, { platform: 'LinkedIn', url: '#' }] } },
  ],
};

export const portfolioCreative: TemplateComposition = {
  id: 'portfolio-creative', name: 'Prism — Creative Portfolio', category: 'portfolio', industry: 'portfolio',
  description: 'Vibrant dark theme for creative portfolios', theme: THEME_CREATIVE_DARK,
  tags: ['portfolio', 'creative', 'dark'], systemType: 'portfolio',
  sections: [
    { id: 'nav', type: 'navbar', props: { brand: 'Prism', links: NAV, cta: { label: 'Hire Me', intent: 'contact.submit' }, sticky: true } },
    { id: 'hero', type: 'hero', props: { badge: '🎨 Creative Design', headline: 'Turning Ideas Into Visual Stories', subheadline: 'I design brands, products, and experiences that people remember.', ctas: [{ label: 'See My Work', href: '#work' }, { label: 'Contact', intent: 'contact.submit', variant: 'outline' }], stats: [{ value: '100+', label: 'Projects' }, { value: '15', label: 'Awards' }] } },
    { id: 'work', type: 'services', props: { headline: 'Featured Projects', items: PROJECTS, columns: 3 } },
    { id: 'testimonials', type: 'testimonials', props: { headline: 'Client Love', items: TESTIMONIALS } },
    { id: 'contact', type: 'contact', props: { headline: 'Let\'s Create Together', email: 'hello@prism.design' } },
    { id: 'footer', type: 'footer', props: { brand: 'Prism', columns: FOOTER_COLS, socials: [{ platform: 'Instagram', url: '#' }, { platform: 'Dribbble', url: '#' }] } },
  ],
};

export const portfolioPhotography: TemplateComposition = {
  id: 'portfolio-photography', name: 'Lens — Photography', category: 'portfolio', industry: 'portfolio',
  description: 'Dramatic dark theme for photography portfolios', theme: THEME_PHOTOGRAPHY,
  tags: ['portfolio', 'photography', 'dark', 'dramatic'], systemType: 'portfolio',
  sections: [
    { id: 'nav', type: 'navbar', props: { brand: 'LENS', links: [{ label: 'Portfolio', href: '#work' }, { label: 'About', href: '#about' }, { label: 'Contact', href: '#contact' }], cta: { label: 'Book a Shoot', intent: 'booking.create' }, sticky: true } },
    { id: 'hero', type: 'hero', props: { headline: 'Capturing moments that matter', subheadline: 'Editorial, portrait, and commercial photography.', ctas: [{ label: 'View Portfolio', href: '#work' }, { label: 'Book a Session', intent: 'booking.create', variant: 'outline' }] } },
    { id: 'work', type: 'services', props: { headline: 'Portfolio', items: PROJECTS.slice(0, 4).map(p => ({ ...p, badge: undefined, description: 'Click to view full gallery' })), columns: 2 } },
    { id: 'about', type: 'about', props: { headline: 'The Photographer', description: 'With a decade behind the lens, I specialize in capturing authentic moments with cinematic quality. My work has been featured in Vogue, National Geographic, and The New York Times. Available for editorial, portrait, wedding, and commercial assignments worldwide.' } },
    { id: 'contact', type: 'contact', props: { headline: 'Get in Touch', email: 'studio@lens.photo' } },
    { id: 'footer', type: 'footer', props: { brand: 'LENS', columns: FOOTER_COLS, socials: [{ platform: 'Instagram', url: '#' }, { platform: '500px', url: '#' }] } },
  ],
};
