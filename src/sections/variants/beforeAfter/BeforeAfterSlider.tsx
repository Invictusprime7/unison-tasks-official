/**
 * Before / After Variant: Slider
 * Draggable reveal handle over a single transformation — the strongest proof.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { BeforeAfterFrame, StageTag, normalizePairs } from './BeforeAfterFrame';
import { hsl } from '../../themeUtils';

export const BeforeAfterSlider: React.FC<BaseSectionProps<'before-after'>> = ({ section, theme }) => {
  // Incomplete pairs cannot demonstrate a transformation.
  const pairs = normalizePairs(section.props.items).filter(pair => pair.before && pair.after);
  const [position, setPosition] = React.useState(50);
  const [active, setActive] = React.useState(0);
  const activeIndex = active < pairs.length ? active : 0;
  const pair = pairs[activeIndex];
  const moveDivider = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    if (bounds.width > 0) setPosition(Math.round(Math.max(0, Math.min(100, (event.clientX - bounds.left) / bounds.width * 100))));
  };

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
            onPointerDown={event => {
              if (event.button !== 0) return;
              event.currentTarget.setPointerCapture(event.pointerId);
              moveDivider(event);
            }}
            onPointerMove={event => {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) moveDivider(event);
            }}
            onPointerUp={event => {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
            }}
            style={{
              touchAction: 'pan-y',
              cursor: 'ew-resize',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: theme.radius,
              border: `1px solid ${hsl(theme.colors.border)}`,
              aspectRatio: '4 / 3',
            }}
          >
            <img
              src={pair.before}
              draggable={false}
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
                draggable={false}
                alt={`${pair.label || 'Result'} after`}
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <StageTag theme={theme} tone="after">After</StageTag>
            <span className="absolute right-3 top-3 rounded-full px-3 py-1 text-xs" style={{ background: hsl(theme.colors.foreground), color: hsl(theme.colors.background) }}>Before</span>
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
            >
              <span className="absolute top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border" style={{ background: hsl(theme.colors.background), color: hsl(theme.colors.foreground), borderColor: hsl(theme.colors.border) }}>↔</span>
            </div>
          </div>
          <label className="mt-4 block text-sm" style={{ color: hsl(theme.colors.foreground) }}>
            Reveal the finished result
            <input
              type="range"
              min={0}
              max={100}
              value={position}
              aria-label="Reveal the finished result"
              aria-valuetext={`${position}% after`}
              onChange={(event) => setPosition(Number(event.target.value))}
              className="mt-2 block w-full cursor-ew-resize focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
              style={{ accentColor: hsl(theme.colors.primary) }}
            />
          </label>
          {(pair.label || pair.description) && (
            <figcaption
              className="mt-4 text-center text-sm"
              style={{ fontFamily: theme.typography.bodyFont, color: hsl(theme.colors.mutedForeground) }}
            >
              {[pair.label, pair.description].filter(Boolean).join(' — ')}
            </figcaption>
          )}
          {pairs.length > 1 && (
            <div className="mt-5 flex flex-wrap justify-center gap-3" aria-label="Transformation projects">
              {pairs.map((item, index) => (
                <button key={index} type="button" aria-pressed={index === activeIndex}
                  onClick={() => { setActive(index); setPosition(50); }}
                  className="border px-4 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ borderRadius: theme.radius, borderColor: hsl(theme.colors.border), color: hsl(theme.colors.foreground) }}>
                  {item.label || `Result ${index + 1}`}
                </button>
              ))}
            </div>
          )}
        </figure>
      )}
    </BeforeAfterFrame>
  );
};
