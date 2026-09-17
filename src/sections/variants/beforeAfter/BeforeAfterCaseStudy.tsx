/**
 * Before / After Variant: Case Study
 * One transformation told as a narrative block with supporting detail.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { BeforeAfterFrame, StageTag, normalizePairs } from './BeforeAfterFrame';
import { hsl } from '../../themeUtils';

export const BeforeAfterCaseStudy: React.FC<BaseSectionProps<'before-after'>> = ({ section, theme }) => {
  const pairs = normalizePairs(section.props.items);

  return (
    <BeforeAfterFrame
      variantId="before-after:case-study"
      theme={theme}
      headline={section.props.headline}
      subheadline={section.props.subheadline}
      surface="background"
    >
      <div className="flex flex-col gap-14">
        {pairs.map((pair, i) => (
          <article key={i} className="grid items-center gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <div className="grid grid-cols-2 gap-3">
              <div style={{ position: 'relative' }}>
                <img
                  src={pair.before}
                  alt={`${pair.label || 'Case study'} before`}
                  loading="lazy"
                  style={{ aspectRatio: '3 / 4', width: '100%', objectFit: 'cover', borderRadius: theme.radius }}
                />
                <StageTag theme={theme} tone="before">Before</StageTag>
              </div>
              <div style={{ position: 'relative' }}>
                <img
                  src={pair.after}
                  alt={`${pair.label || 'Case study'} after`}
                  loading="lazy"
                  style={{ aspectRatio: '3 / 4', width: '100%', objectFit: 'cover', borderRadius: theme.radius }}
                />
                <StageTag theme={theme} tone="after">After</StageTag>
              </div>
            </div>
            <div>
              <h3
                className="mb-3 text-2xl"
                style={{
                  fontFamily: theme.typography.headingFont,
                  fontWeight: theme.typography.headingWeight,
                  color: hsl(theme.colors.foreground),
                }}
              >
                {pair.label || `Transformation ${i + 1}`}
              </h3>
              <p
                className="text-base leading-relaxed"
                style={{ fontFamily: theme.typography.bodyFont, color: hsl(theme.colors.mutedForeground) }}
              >
                {pair.description || 'A considered plan, careful execution and a finish the client can maintain.'}
              </p>
            </div>
          </article>
        ))}
      </div>
    </BeforeAfterFrame>
  );
};
