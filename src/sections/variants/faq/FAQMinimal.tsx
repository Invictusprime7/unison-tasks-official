/**
 * FAQ Variant: Minimal
 * Clean, simple list of Q&A separated by dividers.
 */
import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';

export const FAQMinimal: React.FC<BaseSectionProps<'faq'>> = ({ section, theme }) => {
  const { headline, subheadline, items = [] } = section.props;
  return (
    <section style={{ padding: theme.sectionPadding, background: hsl(theme.colors.background) }}>
      <div className="mx-auto px-6" style={{ maxWidth: '40rem' }}>
        {headline && (
          <div className="mb-10">
            <h2 className="text-3xl mb-3" style={{ fontFamily: theme.typography.headingFont, fontWeight: theme.typography.headingWeight, color: hsl(theme.colors.foreground) }}>{headline}</h2>
            {subheadline && <p className="text-base" style={{ color: hsl(theme.colors.mutedForeground) }}>{subheadline}</p>}
          </div>
        )}
        <div>
          {items.map((item, i) => (
            <div key={i} className="py-5" style={{ borderBottom: i < items.length - 1 ? `1px solid ${hsla(theme.colors.border, 0.3)}` : 'none' }}>
              <h3 className="text-base font-semibold mb-2" style={{ fontFamily: theme.typography.headingFont, color: hsl(theme.colors.foreground) }}>{item.question}</h3>
              <p className="text-sm leading-relaxed" style={{ color: hsl(theme.colors.mutedForeground) }}>{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
