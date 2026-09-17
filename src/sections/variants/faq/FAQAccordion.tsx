/**
 * FAQ Variant: Accordion
 * Native disclosure list — one open answer at a time reads calm and premium.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { FAQFrame, normalizeFaqItems } from './FAQFrame';
import { hsl } from '../../themeUtils';

export const FAQAccordion: React.FC<BaseSectionProps<'faq'>> = ({ section, theme }) => {
  const items = normalizeFaqItems(section.props.items);

  return (
    <FAQFrame
      variantId="faq:accordion"
      theme={theme}
      headline={section.props.headline}
      subheadline={section.props.subheadline}
    >
      <div className="mx-auto max-w-3xl">
        {items.map((item, i) => (
          <details
            key={i}
            className="mb-3 p-6"
            style={{
              background: hsl(theme.colors.card),
              color: hsl(theme.colors.cardForeground),
              border: `1px solid ${hsl(theme.colors.border)}`,
              borderRadius: theme.radius,
            }}
          >
            <summary
              className="cursor-pointer list-none text-base font-semibold"
              style={{ fontFamily: theme.typography.headingFont }}
            >
              {item.question}
            </summary>
            <p
              className="mt-3 text-sm leading-relaxed"
              style={{ fontFamily: theme.typography.bodyFont, color: hsl(theme.colors.mutedForeground) }}
            >
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </FAQFrame>
  );
};
