/**
 * Testimonials Variant: Spotlight
 * Large single testimonial with prominent quote and avatar.
 */
import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';

export const TestimonialsSpotlight: React.FC<BaseSectionProps<'testimonials'>> = ({ section, theme }) => {
  const { headline, items = [] } = section.props;
  const featured = items[0];
  if (!featured) return null;
  return (
    <section style={{ padding: theme.sectionPadding, background: hsl(theme.colors.background) }}>
      <div className="mx-auto px-6" style={{ maxWidth: '48rem', textAlign: 'center' }}>
        {headline && <h2 className="text-3xl mb-10" style={{ fontFamily: theme.typography.headingFont, fontWeight: theme.typography.headingWeight, color: hsl(theme.colors.foreground) }}>{headline}</h2>}
        <div className="relative p-10" style={{ background: hsl(theme.colors.card), border: `1px solid ${hsla(theme.colors.border, 0.5)}`, borderRadius: `calc(${theme.radius} * 2)` }}>
          <span className="text-5xl leading-none block mb-4" style={{ color: hsla(theme.colors.primary, 0.2), fontFamily: 'serif' }}>"</span>
          <p className="text-xl leading-relaxed mb-6" style={{ color: hsl(theme.colors.cardForeground), fontFamily: theme.typography.bodyFont }}>{featured.quote}</p>
          {featured.rating && <div className="mb-4" style={{ color: hsl(theme.colors.primary), fontSize: '1.25rem' }}>{'★'.repeat(featured.rating)}{'☆'.repeat(5 - featured.rating)}</div>}
          <div className="flex items-center justify-center gap-3">
            {featured.avatar ? (
              <img src={featured.avatar} alt={featured.author} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold" style={{ background: hsla(theme.colors.primary, 0.1), color: hsl(theme.colors.primary) }}>{featured.author?.[0]}</div>
            )}
            <div className="text-left">
              <div className="text-base font-semibold" style={{ color: hsl(theme.colors.cardForeground) }}>{featured.author}</div>
              {featured.role && <div className="text-sm" style={{ color: hsl(theme.colors.mutedForeground) }}>{featured.role}</div>}
            </div>
          </div>
        </div>
        {items.length > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {items.map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full" style={{ background: i === 0 ? hsl(theme.colors.primary) : hsla(theme.colors.border, 0.5) }} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
