/**
 * Before / After Variant: Grid
 * Paired stills side by side for each transformation — scannable at volume.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { BeforeAfterFrame, StageTag, normalizePairs } from './BeforeAfterFrame';
import { hsl } from '../../themeUtils';

export const BeforeAfterGrid: React.FC<BaseSectionProps<'before-after'>> = ({ section, theme }) => {
  const pairs = normalizePairs(section.props.items);

  return (
    <BeforeAfterFrame
      variantId="before-after:grid"
      theme={theme}
      headline={section.props.headline}
      subheadline={section.props.subheadline}
    >
      <div className="grid gap-8 sm:grid-cols-2">
        {pairs.map((pair, i) => (
          <figure
            key={i}
            className="m-0 overflow-hidden"
            style={{
              borderRadius: theme.radius,
              border: `1px solid ${hsl(theme.colors.border)}`,
              background: hsl(theme.colors.card),
            }}
          >
            <div className="grid grid-cols-2">
              <div style={{ position: 'relative' }}>
                <img
                  src={pair.before}
                  alt={`${pair.label || 'Result'} before`}
                  loading="lazy"
                  style={{ aspectRatio: '1 / 1', width: '100%', objectFit: 'cover' }}
                />
                <StageTag theme={theme} tone="before">Before</StageTag>
              </div>
              <div style={{ position: 'relative' }}>
                <img
                  src={pair.after}
                  alt={`${pair.label || 'Result'} after`}
                  loading="lazy"
                  style={{ aspectRatio: '1 / 1', width: '100%', objectFit: 'cover' }}
                />
                <StageTag theme={theme} tone="after">After</StageTag>
              </div>
            </div>
            {(pair.label || pair.description) && (
              <figcaption
                className="p-4 text-sm"
                style={{ fontFamily: theme.typography.bodyFont, color: hsl(theme.colors.mutedForeground) }}
              >
                {[pair.label, pair.description].filter(Boolean).join(' — ')}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </BeforeAfterFrame>
  );
};
