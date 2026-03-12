/**
 * Nonprofit Templates — Section Registry Compositions
 * 3 variants: Impactful (Dark), Community (Light), Urgent Appeal (Bold)
 */
import type { TemplateComposition, ThemeTokens } from '../types';

const THEME_IMPACT: ThemeTokens = {
  colors: { primary: '160 65% 40%', primaryForeground: '0 0% 100%', secondary: '200 55% 45%', secondaryForeground: '0 0% 100%', accent: '45 80% 55%', accentForeground: '0 0% 10%', background: '200 15% 6%', foreground: '0 0% 93%', muted: '200 10% 12%', mutedForeground: '200 8% 55%', card: '200 10% 9%', cardForeground: '0 0% 93%', border: '200 8% 18%' },
  typography: { headingFont: "'Playfair Display', serif", bodyFont: "'Inter', sans-serif", headingWeight: '700', bodyWeight: '400' },
  radius: '0.75rem', sectionPadding: '5rem 1rem', containerWidth: '1100px',
};

const THEME_COMMUNITY: ThemeTokens = {
  colors: { primary: '200 60% 45%', primaryForeground: '0 0% 100%', secondary: '160 50% 42%', secondaryForeground: '0 0% 100%', accent: '25 70% 55%', accentForeground: '0 0% 100%', background: '0 0% 98%', foreground: '210 15% 15%', muted: '210 10% 94%', mutedForeground: '210 8% 45%', card: '0 0% 100%', cardForeground: '210 15% 15%', border: '210 10% 90%' },
  typography: { headingFont: "'Inter', sans-serif", bodyFont: "'Inter', sans-serif", headingWeight: '700', bodyWeight: '400' },
  radius: '1rem', sectionPadding: '5rem 1rem', containerWidth: '1100px',
};

const THEME_URGENT: ThemeTokens = {
  colors: { primary: '0 75% 50%', primaryForeground: '0 0% 100%', secondary: '45 90% 55%', secondaryForeground: '0 0% 10%', accent: '0 65% 55%', accentForeground: '0 0% 100%', background: '0 0% 4%', foreground: '0 0% 96%', muted: '0 0% 10%', mutedForeground: '0 0% 55%', card: '0 0% 7%', cardForeground: '0 0% 96%', border: '0 0% 14%' },
  typography: { headingFont: "'Bebas Neue', sans-serif", bodyFont: "'Inter', sans-serif", headingWeight: '400', bodyWeight: '400' },
  radius: '0.25rem', sectionPadding: '5rem 1rem', containerWidth: '1100px',
};

const PROGRAMS = [
  { title: 'Clean Water Initiative', description: 'Providing sustainable clean water solutions to communities in need. 500+ wells built.', badge: 'Active', cta: { label: 'Donate', intent: 'contact.submit' } },
  { title: 'Education for All', description: 'Scholarships and school building programs reaching 10,000+ students annually.', cta: { label: 'Support', intent: 'contact.submit' } },
  { title: 'Community Health', description: 'Mobile health clinics, vaccination campaigns, and health education across 12 countries.', cta: { label: 'Learn More', href: '#' } },
  { title: 'Youth Empowerment', description: 'Job training, mentorship, and entrepreneurship programs for at-risk youth.', badge: 'New', cta: { label: 'Get Involved', intent: 'contact.submit' } },
];

const TESTIMONIALS = [
  { quote: 'This organization changed the trajectory of my community. Our children now have access to clean water and quality education.', author: 'Amara K.', role: 'Community Leader', rating: 5 },
  { quote: 'I\'ve volunteered with many organizations, but none match the transparency and impact of this team.', author: 'Jessica M.', role: 'Volunteer', rating: 5 },
  { quote: 'Every dollar donated goes directly to programs. The efficiency and dedication are remarkable.', author: 'Thomas W.', role: 'Major Donor', rating: 5 },
];

const NAV = [{ label: 'Our Work', href: '#programs' }, { label: 'Impact', href: '#impact' }, { label: 'Stories', href: '#testimonials' }, { label: 'Contact', href: '#contact' }];
const FOOTER_COLS = [
  { title: 'Programs', links: [{ label: 'Clean Water', href: '#programs' }, { label: 'Education', href: '#programs' }, { label: 'Health', href: '#programs' }, { label: 'Youth', href: '#programs' }] },
  { title: 'Get Involved', links: [{ label: 'Donate', href: '#', intent: 'contact.submit' }, { label: 'Volunteer', href: '#contact' }, { label: 'Partner', href: '#contact' }, { label: 'Events', href: '#' }] },
];

export const nonprofitImpact: TemplateComposition = {
  id: 'nonprofit-impact', name: 'Hope Foundation — Impact', category: 'nonprofit', industry: 'nonprofit',
  description: 'Dark inspiring theme for impact-focused nonprofits', theme: THEME_IMPACT,
  tags: ['nonprofit', 'impact', 'dark', 'charity'], systemType: 'content',
  sections: [
    { id: 'nav', type: 'navbar', props: { brand: 'Hope Foundation', links: NAV, cta: { label: 'Donate Now', intent: 'contact.submit' }, sticky: true } },
    { id: 'hero', type: 'hero', props: { badge: '🌍 Making a Difference', headline: 'Every Action Creates a Ripple of Change', subheadline: 'Join us in building a more equitable world. Together, we\'ve impacted 2 million lives across 30 countries.', ctas: [{ label: 'Donate Now', intent: 'contact.submit' }, { label: 'Our Impact', href: '#impact', variant: 'outline' }], stats: [{ value: '2M+', label: 'Lives Impacted' }, { value: '30', label: 'Countries' }, { value: '95%', label: 'To Programs' }] } },
    { id: 'programs', type: 'services', props: { headline: 'Our Programs', subheadline: 'Where your support goes', items: PROGRAMS, columns: 2 } },
    { id: 'impact', type: 'stats', props: { headline: 'Our Impact', items: [{ value: '500+', label: 'Wells Built' }, { value: '10K+', label: 'Students' }, { value: '50K+', label: 'Patients Treated' }, { value: '95¢', label: 'Per Dollar to Programs' }] } },
    { id: 'testimonials', type: 'testimonials', props: { headline: 'Stories of Change', items: TESTIMONIALS } },
    { id: 'cta', type: 'cta', props: { headline: 'Be Part of the Solution', description: 'Your donation today creates lasting change tomorrow.', ctas: [{ label: 'Donate', intent: 'contact.submit' }, { label: 'Volunteer', intent: 'contact.submit', variant: 'outline' }] } },
    { id: 'contact', type: 'contact', props: { headline: 'Get Involved', email: 'info@hopefoundation.org', phone: '(555) 012-3456' } },
    { id: 'footer', type: 'footer', props: { brand: 'Hope Foundation', columns: FOOTER_COLS, newsletter: true, socials: [{ platform: 'Instagram', url: '#' }, { platform: 'Facebook', url: '#' }, { platform: 'Twitter', url: '#' }] } },
  ],
};

export const nonprofitCommunity: TemplateComposition = {
  id: 'nonprofit-community', name: 'Together — Community', category: 'nonprofit', industry: 'nonprofit',
  description: 'Warm light theme for community organizations', theme: THEME_COMMUNITY,
  tags: ['nonprofit', 'community', 'light'], systemType: 'content',
  sections: [
    { id: 'nav', type: 'navbar', props: { brand: 'Together', links: NAV, cta: { label: 'Join Us', intent: 'contact.submit' }, sticky: true } },
    { id: 'hero', type: 'hero', props: { badge: '🤝 Stronger Together', headline: 'Building Stronger Communities', subheadline: 'A grassroots organization dedicated to empowering local communities through education, health, and opportunity.', ctas: [{ label: 'Get Involved', intent: 'contact.submit' }, { label: 'Our Programs', href: '#programs', variant: 'outline' }] } },
    { id: 'programs', type: 'services', props: { headline: 'What We Do', items: PROGRAMS, columns: 2 } },
    { id: 'stats', type: 'stats', props: { items: [{ value: '5K+', label: 'Volunteers' }, { value: '100+', label: 'Programs' }, { value: '50K+', label: 'Community Members' }] } },
    { id: 'testimonials', type: 'testimonials', props: { headline: 'Community Voices', items: TESTIMONIALS } },
    { id: 'contact', type: 'contact', props: { headline: 'Connect With Us', email: 'hello@together.org', phone: '(555) 234-5678' } },
    { id: 'footer', type: 'footer', props: { brand: 'Together', columns: FOOTER_COLS, newsletter: true, socials: [{ platform: 'Facebook', url: '#' }, { platform: 'Instagram', url: '#' }] } },
  ],
};

export const nonprofitUrgent: TemplateComposition = {
  id: 'nonprofit-urgent', name: 'ACT NOW — Urgent Appeal', category: 'nonprofit', industry: 'nonprofit',
  description: 'Bold urgent theme for emergency fundraising', theme: THEME_URGENT,
  tags: ['nonprofit', 'urgent', 'bold', 'fundraising'], systemType: 'content',
  sections: [
    { id: 'nav', type: 'navbar', props: { brand: 'ACT NOW', links: NAV, cta: { label: '🚨 DONATE', intent: 'contact.submit' }, sticky: true } },
    { id: 'hero', type: 'hero', props: { badge: '🚨 EMERGENCY APPEAL', headline: 'THEY NEED US NOW', subheadline: 'Millions affected. Every dollar saves a life. Act today.', ctas: [{ label: 'DONATE NOW', intent: 'contact.submit' }], stats: [{ value: '3.2M', label: 'Affected' }, { value: '$5M', label: 'Goal' }, { value: '72hr', label: 'Deadline' }] } },
    { id: 'programs', type: 'services', props: { headline: 'WHERE FUNDS GO', items: PROGRAMS, columns: 2 } },
    { id: 'cta', type: 'cta', props: { headline: 'EVERY SECOND COUNTS', description: 'Your donation is tax-deductible and 100% goes to emergency relief.', ctas: [{ label: 'DONATE $25', intent: 'contact.submit' }, { label: 'DONATE $100', intent: 'contact.submit' }] } },
    { id: 'testimonials', type: 'testimonials', props: { headline: 'IMPACT', items: TESTIMONIALS } },
    { id: 'footer', type: 'footer', props: { brand: 'ACT NOW', columns: FOOTER_COLS, newsletter: false, socials: [{ platform: 'Twitter', url: '#' }] } },
  ],
};
