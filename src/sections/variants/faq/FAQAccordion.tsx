/**
 * FAQ Variant: Accordion
 * Classic expandable accordion FAQ. Default variant (uses details/summary for zero-JS).
 */
import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';

export const FAQAccordion: React.FC<BaseSectionProps<'faq'>> = ({ section, theme }) => {
  const { headline, subheadline, items = [] } = section.props;
  return (
    <section style={{ padding: theme.sectionPadding, background: hsl(theme.colors.background) }}>
      <div className="mx-auto px-6" style={{ maxWidth: '48rem' }}>
        {headline && (
          <div className="text-center mb-12">
            <h2 className="text-3xl mb-3" style={{ fontFamily: theme.typography.headingFont, fontWeight: theme.typography.headingWeight, color: hsl(theme.colors.foreground) }}>{headline}</h2>
            {subheadline && <p className="text-base max-w-lg mx-auto" style={{ color: hsl(theme.colors.mutedForeground) }}>{subheadline}</p>}
          </div>
        )}
        <div className="space-y-3">
          {items.map((item, i) => (
            <details key={i} className="group" style={{ borderRadius: theme.radius, border: `1px solid ${hsla(theme.colors.border, 0.5)}`, overflow: 'hidden' }}>
              <summary className="cursor-pointer p-4 flex items-center justify-between" style={{ fontFamily: theme.typography.headingFont, fontWeight: '600', color: hsl(theme.colors.foreground), background: hsl(theme.colors.card) }}>
                {item.question}
                <span className="ml-2 text-sm" style={{ color: hsl(theme.colors.mutedForeground) }}>+</span>
              </summary>
              <div className="p-4 pt-0" style={{ background: hsl(theme.colors.card) }}>
                <p className="text-sm leading-relaxed" style={{ color: hsl(theme.colors.mutedForeground) }}>{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};
