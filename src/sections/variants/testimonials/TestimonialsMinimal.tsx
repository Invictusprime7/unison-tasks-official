/**
 * Testimonials Variant: Minimal
 * Simple quote list without cards, clean and editorial.
 */
import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';

export const TestimonialsMinimal: React.FC<BaseSectionProps<'testimonials'>> = ({ section, theme }) => {
  const { headline, subheadline, items = [] } = section.props;
  return (
    <section style={{ padding: theme.sectionPadding, background: hsl(theme.colors.background) }}>
      <div className="mx-auto px-6" style={{ maxWidth: '48rem' }}>
        {headline && (
          <div className="text-center mb-12">
            <h2 className="text-3xl mb-3" style={{ fontFamily: theme.typography.headingFont, fontWeight: theme.typography.headingWeight, color: hsl(theme.colors.foreground) }}>{headline}</h2>
            {subheadline && <p className="text-base max-w-md mx-auto" style={{ color: hsl(theme.colors.mutedForeground) }}>{subheadline}</p>}
          </div>
        )}
        <div className="space-y-8">
          {items.map((item, i) => (
            <div key={i} className="pl-6" style={{ borderLeft: `3px solid ${hsla(theme.colors.primary, 0.3)}` }}>
              <p className="text-base leading-relaxed mb-3" style={{ color: hsl(theme.colors.foreground), fontStyle: 'italic' }}>"{item.quote}"</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium" style={{ color: hsl(theme.colors.foreground) }}>{item.author}</span>
                {item.role && <span className="text-sm" style={{ color: hsl(theme.colors.mutedForeground) }}>— {item.role}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
