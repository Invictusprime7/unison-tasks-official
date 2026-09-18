import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl } from '../../themeUtils';
import { EditorialSection } from '../shared/EditorialSection';
import { normalizeFaqItems } from './FAQFrame';

export function FAQEditorial({ section, theme }: BaseSectionProps<'faq'>) {
  return (
    <EditorialSection
      variantId="faq:editorial"
      theme={theme}
      headline={section.props.headline}
      description={section.props.subheadline}
    >
      <div className="grid items-start gap-x-12 md:grid-cols-2">
        {normalizeFaqItems(section.props.items).map((item, index) => (
          <details
            key={index}
            data-ut-slot={`question-${index}`}
            className="border-t py-6"
            style={{ borderColor: hsl(theme.colors.border) }}
          >
            <summary className="cursor-pointer text-lg font-medium">
              <span
                className="mr-4 text-xs tabular-nums"
                style={{ color: hsl(theme.colors.mutedForeground) }}
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              {item.question}
            </summary>
            <p
              className="mt-5 whitespace-pre-line leading-relaxed"
              style={{ color: hsl(theme.colors.mutedForeground) }}
            >
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </EditorialSection>
  );
}
