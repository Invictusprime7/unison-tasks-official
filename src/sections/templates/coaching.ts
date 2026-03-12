/**
 * Coaching / Consulting Templates — Section Registry Compositions
 * 3 variants: Executive (Dark), Wellness Coach (Light), Bold Mentor (Bold)
 */
import type { TemplateComposition, ThemeTokens } from '../types';

const THEME_EXECUTIVE: ThemeTokens = {
  colors: { primary: '220 70% 50%', primaryForeground: '0 0% 100%', secondary: '260 50% 55%', secondaryForeground: '0 0% 100%', accent: '220 60% 60%', accentForeground: '0 0% 100%', background: '225 20% 6%', foreground: '210 10% 93%', muted: '225 15% 12%', mutedForeground: '215 10% 55%', card: '225 15% 9%', cardForeground: '210 10% 93%', border: '225 12% 18%' },
  typography: { headingFont: "'Playfair Display', serif", bodyFont: "'Inter', sans-serif", headingWeight: '700', bodyWeight: '400' },
  radius: '0.75rem', sectionPadding: '5rem 1rem', containerWidth: '1100px',
};

const THEME_WELLNESS_COACH: ThemeTokens = {
  colors: { primary: '160 55% 42%', primaryForeground: '0 0% 100%', secondary: '200 50% 50%', secondaryForeground: '0 0% 100%', accent: '160 45% 50%', accentForeground: '0 0% 100%', background: '150 15% 97%', foreground: '160 15% 15%', muted: '150 10% 92%', mutedForeground: '160 8% 45%', card: '0 0% 100%', cardForeground: '160 15% 15%', border: '150 10% 88%' },
  typography: { headingFont: "'Cormorant Garamond', serif", bodyFont: "'Inter', sans-serif", headingWeight: '600', bodyWeight: '400' },
  radius: '1rem', sectionPadding: '5rem 1rem', containerWidth: '1100px',
};

const THEME_BOLD_MENTOR: ThemeTokens = {
  colors: { primary: '45 95% 55%', primaryForeground: '0 0% 5%', secondary: '25 80% 50%', secondaryForeground: '0 0% 100%', accent: '45 85% 60%', accentForeground: '0 0% 5%', background: '0 0% 4%', foreground: '0 0% 96%', muted: '0 0% 10%', mutedForeground: '0 0% 55%', card: '0 0% 7%', cardForeground: '0 0% 96%', border: '0 0% 14%' },
  typography: { headingFont: "'Bebas Neue', sans-serif", bodyFont: "'Inter', sans-serif", headingWeight: '400', bodyWeight: '400' },
  radius: '0.25rem', sectionPadding: '6rem 1rem', containerWidth: '1100px',
};

const PROGRAMS = [
  { title: '1-on-1 Executive Coaching', description: 'Personalized coaching program for C-suite executives and emerging leaders. Weekly sessions, progress tracking, and accountability.', price: '$500/mo', badge: 'Most Popular', cta: { label: 'Apply Now', intent: 'booking.create' } },
  { title: 'Group Mastermind', description: 'Join a curated group of 8 high-achievers for facilitated peer coaching, hot seats, and shared growth.', price: '$300/mo', cta: { label: 'Apply Now', intent: 'booking.create' } },
  { title: 'VIP Intensive Day', description: 'A full-day deep-dive into your business strategy, leadership challenges, and growth roadmap.', price: '$2,500', badge: 'Premium', cta: { label: 'Book Now', intent: 'booking.create' } },
  { title: 'Online Course: Leadership Foundations', description: 'Self-paced 12-module course covering emotional intelligence, communication, and strategic thinking.', price: '$197', cta: { label: 'Enroll', intent: 'newsletter.subscribe' } },
];

const TESTIMONIALS = [
  { quote: 'Working with this coach transformed my leadership style. I went from micromanaging to truly empowering my team.', author: 'Jason M.', role: 'CEO, TechVentures', rating: 5 },
  { quote: 'The mastermind group gave me accountability and perspective I couldn\'t find anywhere else. My revenue doubled in 6 months.', author: 'Priya S.', role: 'Founder, DesignLab', rating: 5 },
  { quote: 'The VIP intensive was a game-changer. We mapped out a complete 12-month growth strategy in one day.', author: 'Robert K.', role: 'VP Sales, GlobalCorp', rating: 5 },
];

const NAV = [{ label: 'Programs', href: '#programs' }, { label: 'About', href: '#about' }, { label: 'Testimonials', href: '#testimonials' }, { label: 'Contact', href: '#contact' }];
const FOOTER_COLS = [
  { title: 'Programs', links: [{ label: '1-on-1 Coaching', href: '#programs' }, { label: 'Mastermind', href: '#programs' }, { label: 'VIP Day', href: '#programs' }, { label: 'Online Course', href: '#programs' }] },
  { title: 'Resources', links: [{ label: 'Blog', href: '#' }, { label: 'Podcast', href: '#' }, { label: 'Free Guide', href: '#' }] },
];

export const coachingExecutive: TemplateComposition = {
  id: 'coaching-executive', name: 'Ascend — Executive Coach', category: 'coaching', industry: 'coaching',
  description: 'Polished dark theme for executive coaching', theme: THEME_EXECUTIVE,
  tags: ['coaching', 'executive', 'dark'], systemType: 'booking',
  sections: [
    { id: 'nav', type: 'navbar', props: { brand: 'Ascend', links: NAV, cta: { label: 'Book Discovery Call', intent: 'booking.create' }, sticky: true } },
    { id: 'hero', type: 'hero', props: { badge: '✦ Executive Coaching', headline: 'Elevate Your Leadership', subheadline: 'Trusted by Fortune 500 executives to unlock potential, drive results, and lead with clarity.', ctas: [{ label: 'Book Discovery Call', intent: 'booking.create' }, { label: 'View Programs', href: '#programs', variant: 'outline' }], stats: [{ value: '500+', label: 'Leaders Coached' }, { value: '95%', label: 'Goal Achievement' }, { value: '15+', label: 'Years' }] } },
    { id: 'programs', type: 'services', props: { headline: 'Coaching Programs', subheadline: 'Structured pathways to your next level', items: PROGRAMS, columns: 2 } },
    { id: 'about', type: 'about', props: { headline: 'Your Coach', description: 'With 15 years of experience coaching C-suite leaders at Fortune 500 companies, I bring a unique blend of corporate strategy and human psychology. ICF Master Certified Coach (MCC) with an MBA from Harvard Business School. My approach is direct, evidence-based, and tailored to your specific challenges and aspirations.' } },
    { id: 'testimonials', type: 'testimonials', props: { headline: 'Client Results', items: TESTIMONIALS } },
    { id: 'cta', type: 'cta', props: { headline: 'Ready to Level Up?', description: 'Book a complimentary 30-minute discovery call to discuss your goals.', ctas: [{ label: 'Book Discovery Call', intent: 'booking.create' }] } },
    { id: 'contact', type: 'contact', props: { headline: 'Get in Touch', email: 'coach@ascend.com' } },
    { id: 'footer', type: 'footer', props: { brand: 'Ascend', columns: FOOTER_COLS, newsletter: true, socials: [{ platform: 'LinkedIn', url: '#' }, { platform: 'Twitter', url: '#' }] } },
  ],
};

export const coachingWellness: TemplateComposition = {
  id: 'coaching-wellness', name: 'Thrive — Wellness Coach', category: 'coaching', industry: 'coaching',
  description: 'Calming light theme for wellness and life coaching', theme: THEME_WELLNESS_COACH,
  tags: ['coaching', 'wellness', 'light'], systemType: 'booking',
  sections: [
    { id: 'nav', type: 'navbar', props: { brand: 'Thrive', links: NAV, cta: { label: 'Start Your Journey', intent: 'booking.create' }, sticky: true } },
    { id: 'hero', type: 'hero', props: { badge: '🌿 Holistic Coaching', headline: 'Find Your Balance, Find Yourself', subheadline: 'A nurturing approach to personal growth, mindfulness, and living with intention.', ctas: [{ label: 'Free Consultation', intent: 'booking.create' }, { label: 'Learn More', href: '#programs', variant: 'outline' }] } },
    { id: 'programs', type: 'services', props: { headline: 'Programs & Offerings', items: PROGRAMS, columns: 2 } },
    { id: 'stats', type: 'stats', props: { items: [{ value: '1000+', label: 'Lives Changed' }, { value: '100%', label: 'Holistic' }, { value: '4.9★', label: 'Rating' }] } },
    { id: 'testimonials', type: 'testimonials', props: { headline: 'Words of Transformation', items: TESTIMONIALS } },
    { id: 'faq', type: 'faq', props: { headline: 'Questions?', items: [{ question: 'What is your coaching approach?', answer: 'I use an integrative approach combining positive psychology, mindfulness-based stress reduction, and solution-focused coaching.' }, { question: 'How long is a typical coaching engagement?', answer: 'Most clients see significant results within 3-6 months of regular sessions.' }] } },
    { id: 'contact', type: 'contact', props: { headline: 'Let\'s Connect', email: 'hello@thrivecoaching.com' } },
    { id: 'footer', type: 'footer', props: { brand: 'Thrive', columns: FOOTER_COLS, newsletter: true, socials: [{ platform: 'Instagram', url: '#' }, { platform: 'YouTube', url: '#' }] } },
  ],
};

export const coachingBoldMentor: TemplateComposition = {
  id: 'coaching-bold-mentor', name: 'IGNITE — Bold Mentor', category: 'coaching', industry: 'coaching',
  description: 'High-energy bold theme for motivational coaching', theme: THEME_BOLD_MENTOR,
  tags: ['coaching', 'bold', 'mentor', 'motivational'], systemType: 'booking',
  sections: [
    { id: 'nav', type: 'navbar', props: { brand: 'IGNITE', links: NAV, cta: { label: 'APPLY NOW', intent: 'booking.create' }, sticky: true } },
    { id: 'hero', type: 'hero', props: { headline: 'STOP PLAYING SMALL', subheadline: 'You weren\'t built to blend in. It\'s time to build the business and life you actually want.', ctas: [{ label: 'APPLY NOW', intent: 'booking.create' }], stats: [{ value: '$50M+', label: 'Client Revenue' }, { value: '10X', label: 'Avg Growth' }] } },
    { id: 'programs', type: 'services', props: { headline: 'PROGRAMS', items: PROGRAMS, columns: 2 } },
    { id: 'testimonials', type: 'testimonials', props: { headline: 'RESULTS SPEAK', items: TESTIMONIALS } },
    { id: 'cta', type: 'cta', props: { headline: 'YOUR TIME IS NOW', description: 'Limited spots available. Apply for the next cohort.', ctas: [{ label: 'APPLY', intent: 'booking.create' }] } },
    { id: 'footer', type: 'footer', props: { brand: 'IGNITE', columns: FOOTER_COLS, newsletter: true, socials: [{ platform: 'YouTube', url: '#' }, { platform: 'IG', url: '#' }] } },
  ],
};
