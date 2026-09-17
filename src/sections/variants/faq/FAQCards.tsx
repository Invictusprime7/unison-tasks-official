/**
 * FAQ Variant: Cards
 * Answer cards in a scannable grid — good for short, high-volume questions.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { FAQFrame, normalizeFaqItems } from './FAQFrame';
import { hsl } from '../../themeUtils';

export const FAQCards: React.FC<BaseSectionProps<'faq'>> = ({ section, theme }) => {
  const items = normalizeFaqItems(section.props.items);
  const cols = items.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2';

  return (
    <FAQFrame
      variantId="faq:cards"
      theme={theme}
      headline={section.props.headline}
      subheadline={section.props.subheadline}
    >
      <div className={`grid gap-6 ${cols}`}>
        {items.map((item, i) => (
          <div
            key={i}
            className="h-full p-8"
            style={{
              background: hsl(theme.colors.card),
              color: hsl(theme.colors.cardForeground),
              border: `1px solid ${hsl(theme.colors.border)}`,
              borderRadius: theme.radius,
            }}
          >
            <h3 className="mb-3 text-base font-semibold" style={{ fontFamily: theme.typography.headingFont }}>
              {item.question}
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{ fontFamily: theme.typography.bodyFont, color: hsl(theme.colors.mutedForeground) }}
            >
              {item.answer}
            </p>
          </div>
        ))}
      </div>
    </FAQFrame>
  );
};
