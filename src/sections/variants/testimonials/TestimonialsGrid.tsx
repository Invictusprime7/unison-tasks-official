/**
 * Testimonials Variant: Grid
 * Card grid of testimonials with avatars and star ratings. Default variant.
 */
import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';

export const TestimonialsGrid: React.FC<BaseSectionProps<'testimonials'>> = ({ section, theme }) => {
  const { headline, subheadline, items = [] } = section.props;
  return (
    <section style={{ padding: theme.sectionPadding, background: hsl(theme.colors.muted) }}>
      <div className="mx-auto px-6" style={{ maxWidth: theme.containerWidth }}>
        {headline && (
          <div className="text-center mb-12">
            <h2 className="text-3xl mb-3" style={{ fontFamily: theme.typography.headingFont, fontWeight: theme.typography.headingWeight, color: hsl(theme.colors.foreground) }}>{headline}</h2>
            {subheadline && <p className="text-base max-w-lg mx-auto" style={{ color: hsl(theme.colors.mutedForeground) }}>{subheadline}</p>}
          </div>
        )}
        <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${Math.min(items.length, 3)}, 1fr)` }}>
          {items.map((item, i) => (
            <div key={i} className="p-6 flex flex-col" style={{ background: hsl(theme.colors.card), border: `1px solid ${hsla(theme.colors.border, 0.5)}`, borderRadius: theme.radius }}>
              {item.rating && (
                <div className="mb-3" style={{ color: hsl(theme.colors.primary) }}>
                  {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                </div>
              )}
              <p className="flex-1 mb-4 text-sm leading-relaxed" style={{ color: hsl(theme.colors.cardForeground), fontStyle: 'italic' }}>"{item.quote}"</p>
              <div className="flex items-center gap-3 pt-3" style={{ borderTop: `1px solid ${hsla(theme.colors.border, 0.3)}` }}>
                {item.avatar ? (
                  <img src={item.avatar} alt={item.author} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: hsla(theme.colors.primary, 0.1), color: hsl(theme.colors.primary) }}>{item.author?.[0]}</div>
                )}
                <div>
                  <div className="text-sm font-medium" style={{ color: hsl(theme.colors.cardForeground) }}>{item.author}</div>
                  {item.role && <div className="text-xs" style={{ color: hsl(theme.colors.mutedForeground) }}>{item.role}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
