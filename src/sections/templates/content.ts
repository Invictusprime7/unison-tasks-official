import type { TemplateComposition } from '../types';

export const CONTENT_COMPOSITIONS: TemplateComposition[] = [
  {
    id: 'nonprofit-premium',
    name: 'Mission Journal',
    category: 'nonprofit',
    industry: 'nonprofit',
    systemType: 'content',
    description: 'Editorial storytelling for publications, newsletters, and mission-led organizations.',
    tags: ['content', 'editorial', 'newsletter', 'nonprofit', 'stories'],
    theme: {
      colors: {
        primary: '153 56% 30%',
        primaryForeground: '0 0% 100%',
        secondary: '42 55% 93%',
        secondaryForeground: '153 35% 18%',
        accent: '8 72% 55%',
        accentForeground: '0 0% 100%',
        background: '48 38% 97%',
        foreground: '165 22% 13%',
        muted: '45 24% 91%',
        mutedForeground: '165 10% 38%',
        card: '0 0% 100%',
        cardForeground: '165 22% 13%',
        border: '42 20% 82%',
      },
      typography: {
        headingFont: "'Newsreader', serif",
        bodyFont: "'Manrope', sans-serif",
        headingWeight: '600',
        bodyWeight: '400',
      },
      radius: '0.375rem',
      sectionPadding: '5rem 1.5rem',
      containerWidth: '1180px',
    },
    pageRoles: ['home', 'about', 'blog', 'services', 'contact'],
    sections: [
      {
        id: 'mission-journal-nav',
        type: 'navbar',
        props: {
          brand: 'Field Notes',
          sticky: true,
          layout: 'standard',
          links: [
            { label: 'Stories', href: '#stories' },
            { label: 'Our Work', href: '#work' },
            { label: 'About', href: '#about' },
          ],
          cta: {
            label: 'Join the newsletter',
            href: '#newsletter',
            intent: 'newsletter.subscribe',
            variant: 'primary',
          },
        },
      },
      {
        id: 'mission-journal-hero',
        type: 'hero',
        props: {
          layout: 'split',
          badge: 'Independent stories, practical change',
          headline: 'Ideas worth carrying into the world.',
          subheadline: 'Reporting, field guides, and first-person stories from people building stronger communities.',
          image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&q=85',
          ctas: [
            { label: 'Read the latest', href: '#stories', variant: 'primary' },
            { label: 'Get weekly notes', href: '#newsletter', intent: 'newsletter.subscribe', variant: 'outline' },
          ],
          stats: [
            { value: '42k', label: 'Weekly readers' },
            { value: '18', label: 'Communities covered' },
            { value: '100%', label: 'Independent' },
          ],
        },
      },
      {
        id: 'mission-journal-stories',
        type: 'blog-preview',
        props: {
          headline: 'From the field',
          posts: [
            {
              title: 'The neighborhood library built after closing time',
              excerpt: 'How a volunteer crew turned an empty storefront into a room for learning and connection.',
              image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=900&q=80',
              date: 'June 14',
              author: 'Maya Ellis',
              href: '#story-library',
            },
            {
              title: 'A practical guide to listening before launching',
              excerpt: 'Five field-tested prompts for teams designing programs with, rather than for, a community.',
              image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=80',
              date: 'June 7',
              author: 'Jon Bell',
              href: '#story-listening',
            },
            {
              title: 'Small grants, visible change',
              excerpt: 'Inside a resident-led fund backing block-level ideas with unusually fast decisions.',
              image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=900&q=80',
              date: 'May 29',
              author: 'Nia Brooks',
              href: '#story-grants',
            },
          ],
        },
      },
      {
        id: 'mission-journal-about',
        type: 'about',
        props: {
          layout: 'text-right',
          headline: 'Reporting that stays close to the work',
          description: 'We publish useful, accountable stories with the people closest to the issue. Every edition pairs honest reporting with resources readers can use, share, or support.',
          image: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?w=1000&q=80',
          cta: { label: 'Meet the editorial team', href: '#team', variant: 'outline' },
        },
      },
      {
        id: 'mission-journal-impact',
        type: 'stats',
        props: {
          headline: 'Reader-supported impact',
          layout: 'row',
          items: [
            { value: '186', label: 'Original stories' },
            { value: '73', label: 'Local contributors' },
            { value: '31', label: 'Open-source guides' },
            { value: '12', label: 'Reader meetups' },
          ],
        },
      },
      {
        id: 'mission-journal-newsletter',
        type: 'cta',
        props: {
          layout: 'split',
          headline: 'One thoughtful note each Friday.',
          description: 'The week’s strongest story, one useful resource, and a clear way to take part.',
          ctas: [
            { label: 'Subscribe free', intent: 'newsletter.subscribe', variant: 'primary' },
            { label: 'Send us a story', href: '#contact', intent: 'contact.submit', variant: 'outline' },
          ],
        },
      },
      {
        id: 'mission-journal-contact',
        type: 'contact',
        props: {
          layout: 'minimal-inline',
          headline: 'Have a story we should follow?',
          description: 'Share the people, projects, or questions that deserve closer attention.',
          fields: [
            { name: 'name', type: 'text', placeholder: 'Your name', required: true },
            { name: 'email', type: 'email', placeholder: 'Email address', required: true },
            { name: 'message', type: 'textarea', placeholder: 'Tell us what is happening', required: true },
          ],
          submitLabel: 'Send story tip',
          submitIntent: 'contact.submit',
        },
      },
      {
        id: 'mission-journal-footer',
        type: 'footer',
        props: {
          brand: 'Field Notes',
          layout: 'columns',
          newsletter: true,
          columns: [
            { title: 'Read', links: [{ label: 'Latest stories', href: '#stories' }, { label: 'Field guides', href: '#guides' }] },
            { title: 'About', links: [{ label: 'Our approach', href: '#about' }, { label: 'Contact', href: '#contact' }] },
          ],
          socials: [
            { platform: 'instagram', url: '#' },
            { platform: 'linkedin', url: '#' },
          ],
          copyright: 'Field Notes. Independent stories for stronger communities.',
        },
      },
    ],
  },
];