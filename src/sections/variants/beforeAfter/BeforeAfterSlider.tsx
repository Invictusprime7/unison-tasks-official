/**
 * Before / After Variant: Slider
 * Draggable reveal handle over a single transformation — the strongest proof.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { BeforeAfterFrame, StageTag, normalizePairs } from './BeforeAfterFrame';
import { hsl } from '../../themeUtils';

export const BeforeAfterSlider: React.FC<BaseSectionProps<'before-after'>> = ({ section, theme }) => {
  const pairs = normalizePairs(section.props.items);
  const [position, setPosition] = React.useState(50);
  const pair = pairs[0];

  return (
    <BeforeAfterFrame
      variantId="before-after:slider"
      theme={theme}
      headline={section.props.headline}
      subheadline={section.props.subheadline}
    >
      {pair && (
        <figure className="m-0 mx-auto" style={{ maxWidth: '48rem' }}>
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: theme.radius,
              border: `1px solid ${hsl(theme.colors.border)}`,
              aspectRatio: '4 / 3',
            }}
          >
            <img
              src={pair.before}
              alt={`${pair.label || 'Result'} before`}
              loading="lazy"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                clipPath: `inset(0 ${100 - position}% 0 0)`,
              }}
            >
              <img
                src={pair.after}
                alt={`${pair.label || 'Result'} after`}
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <StageTag theme={theme} tone="after">After</StageTag>
            <div
              aria-hidden
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: `${position}%`,
                width: '2px',
                background: hsl(theme.colors.background),
              }}
            />
            <input
              type="range"
              min={0}
              max={100}
              value={position}
              aria-label="Reveal the finished result"
              onChange={(event) => setPosition(Number(event.target.value))}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'ew-resize' }}
            />
          </div>
          {(pair.label || pair.description) && (
            <figcaption
              className="mt-4 text-center text-sm"
              style={{ fontFamily: theme.typography.bodyFont, color: hsl(theme.colors.mutedForeground) }}
            >
              {[pair.label, pair.description].filter(Boolean).join(' — ')}
            </figcaption>
          )}
        </figure>
      )}
    </BeforeAfterFrame>
  );
};
