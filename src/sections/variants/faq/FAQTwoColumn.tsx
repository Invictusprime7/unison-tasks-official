/**
 * FAQ Variant: Two Column
 * Question/answer pairs laid out as an editorial two-column reference sheet.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { FAQFrame, normalizeFaqItems } from './FAQFrame';
import { hsl } from '../../themeUtils';

export const FAQTwoColumn: React.FC<BaseSectionProps<'faq'>> = ({ section, theme }) => {
  const items = normalizeFaqItems(section.props.items);

  return (
    <FAQFrame
      variantId="faq:two-column"
      theme={theme}
      headline={section.props.headline}
      subheadline={section.props.subheadline}
      surface="muted"
    >
      <div className="grid gap-x-12 gap-y-8 md:grid-cols-2">
        {items.map((item, i) => (
          <div key={i} style={{ borderTop: `1px solid ${hsl(theme.colors.border)}`, paddingTop: '1.25rem' }}>
            <h3
              className="mb-2 text-base font-semibold"
              style={{ fontFamily: theme.typography.headingFont, color: hsl(theme.colors.foreground) }}
            >
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
