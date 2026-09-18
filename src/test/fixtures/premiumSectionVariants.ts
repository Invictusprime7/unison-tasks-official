import type { SectionPropsMap, SectionType } from '@/sections/types';

export const premiumSectionProps: Partial<SectionPropsMap> = {
  features: { headline: 'Work with clarity', items: [{ title: 'Strategy', description: 'A clear direction for your next chapter.', icon: 'S' }] },
  testimonials: { headline: 'Client stories', items: [{ quote: 'A thoughtful collaboration.', author: 'Alex' }, { quote: 'A clear process.', author: 'Sam' }, { quote: 'We felt heard.', author: 'Jo' }, { quote: 'Excellent support.', author: 'Lee' }] },
  services: { headline: 'Considered work. Lasting impact.', subheadline: 'From the first conversation to the final detail, made around you.', items: [
    { title: 'Brand strategy', description: 'Find the perspective that makes your business distinct. A clear foundation for everything that follows.', image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1000', price: 'From $1,200', duration: '2 weeks', cta: { label: 'Discuss your project', href: '/contact', intent: 'contact.submit' } },
    { title: 'Digital experiences', description: 'Useful, expressive websites that connect the details.', price: 'From $2,400', cta: { label: 'Explore the process', href: '/services' } },
    { title: 'Creative direction', description: 'One consistent point of view, wherever your brand lives.', duration: 'Ongoing collaboration', cta: { label: 'Get in touch', href: '/contact' } },
    { title: 'Launch support', description: 'A thoughtful introduction, with support beyond launch day.' },
  ] },
  faq: { headline: 'A few things you might be wondering.', subheadline: 'A clear answer is a good place to start.', items: [
    { question: 'How do we get started?', answer: 'Tell us about your project through the inquiry form. We will discuss the scope together.' },
    { question: 'Can I change my booking?', answer: 'Contact our team to check availability for a new date.' },
    { question: 'Do you work remotely?', answer: 'Yes. We collaborate with teams across time zones.' },
    { question: 'What is included?', answer: 'Your proposal describes deliverables, milestones and pricing before work begins.' },
  ] },
  contact: { headline: 'Good things begin with a conversation.', description: 'Tell us what you have in mind.', address: '1200 W Randolph St, Chicago, IL', email: 'hello@example.com', phone: '+1 312 555 0100', showMap: false },
  about: { headline: 'Small team. Shared ambition.', description: 'We are an independent studio built around curiosity, care, and close collaboration.\n\nOur work connects thoughtful strategy with the details people remember.', image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1000', cta: { label: 'Meet the studio', href: '/contact' } },
  stats: { headline: 'The work, in numbers.', items: [{ value: '12', label: 'Years of independent practice' }, { value: '48', label: 'Projects delivered' }, { value: '9', label: 'Countries represented' }, { value: '86%', label: 'Clients from referrals' }] },
  pricing: { headline: 'Room for every ambition.', subheadline: 'Choose the scope that fits your next chapter.', tiers: [
    { name: 'Essentials', price: '$900', period: 'project', features: ['Discovery workshop', 'Focused design direction'], cta: { label: 'Discuss Essentials', href: '/contact' } },
    { name: 'Studio', price: '$2,400', period: 'project', description: 'Strategy and execution, working together.', highlighted: true, badge: 'A complete foundation', features: ['Brand strategy', 'Visual identity', 'Launch assets', 'Project support'], cta: { label: 'Discuss Studio', href: '/contact' } },
    { name: 'Partnership', price: 'Let?s talk', features: ['Ongoing creative direction', 'A dedicated studio partner'], cta: { label: 'Start a conversation', href: '/contact' } },
  ] },
  gallery: { headline: 'Selected work.', subheadline: 'Different ambitions. The same attention to detail.', filterable: true, items: [
    { src: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1000', alt: 'Sunlit studio interior', caption: 'A quieter kind of workspace', category: 'Spaces' },
    { src: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1000', alt: 'Collaborative workspace', caption: 'Built for conversation', category: 'Branding' },
  ] },
};
export const premiumFamilies = Object.keys(premiumSectionProps) as SectionType[];
