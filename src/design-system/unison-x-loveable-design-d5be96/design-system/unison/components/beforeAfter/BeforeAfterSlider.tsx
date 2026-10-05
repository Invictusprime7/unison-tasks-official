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
  const [active, setActive] = React.useState(0);
  const pair = pairs[Math.min(active, Math.max(0, pairs.length - 1))];
  const fromPointer = (element: HTMLElement, clientX: number) => {
    const rect = element.getBoundingClientRect();
    if (!rect.width) return;
    setPosition(Math.round(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))));
  };
  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    fromPointer(event.currentTarget, event.clientX);
  };
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) fromPointer(event.currentTarget, event.clientX);
  };
  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const select = (index: number) => { setActive(index); setPosition(50); };

  return (
    <BeforeAfterFrame
      variantId="before-after:slider"
      theme={theme}
      headline={section.props.headline}
      subheadline={section.props.subheadline}
    >
      {pair && (
        <figure className="m-0 mx-auto" style={{ maxWidth: '48rem' }}>
          {pairs.length > 1 && (
            <div className="mb-4 flex flex-wrap justify-center gap-2" role="group" aria-label="Choose a project">
              {pairs.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  aria-pressed={index === active}
                  onClick={() => select(index)}
                  className="min-h-11 px-4 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{
                    fontFamily: theme.typography.bodyFont,
                    borderRadius: theme.radius,
                    border: `1px solid ${hsl(theme.colors.border)}`,
                    background: index === active ? hsl(theme.colors.foreground) : 'transparent',
                    color: index === active ? hsl(theme.colors.background) : hsl(theme.colors.foreground),
                  }}
                >
                  {item.label || `Project ${index + 1}`}
                </button>
              ))}
            </div>
          )}
          <div
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            style={{
              touchAction: 'pan-y',
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
              aria-valuetext={`${position}% after`}
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
