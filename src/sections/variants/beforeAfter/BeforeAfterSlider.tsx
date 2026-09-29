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
            <span style={{ position: 'absolute', top: 0, right: 0, width: '5.5rem', height: '3rem', pointerEvents: 'none' }}>
              <StageTag theme={theme} tone="before">Before</StageTag>
            </span>
            <div
              aria-hidden
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: `${position}%`,
                width: '2px',
                transform: 'translateX(-1px)',
                background: hsl(theme.colors.background),
                pointerEvents: 'none',
              }}
            >
              <span
                className="ba-knob"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '2.75rem',
                  height: '2.75rem',
                  borderRadius: '999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  fontWeight: 700,
                  background: hsl(theme.colors.background),
                  color: hsl(theme.colors.foreground),
                  border: `1px solid ${hsl(theme.colors.border)}`,
                  boxShadow: `0 2px 10px ${hsl(theme.colors.foreground)}33`,
                }}
              >
                ↔
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={position}
              aria-label="Reveal the finished result"
              aria-valuetext={`${position}% after`}
              onChange={(event) => setPosition(Number(event.target.value))}
              className="ba-range"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'ew-resize', margin: 0 }}
            />
            <style>{`.ba-range:focus-visible ~ .ba-focus{opacity:1}`}</style>
            <span
              aria-hidden
              className="ba-focus"
              style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0, outline: `2px solid ${hsl(theme.colors.primary)}`, outlineOffset: '-4px', borderRadius: theme.radius }}
            />
          </div>
          <p
            className="mt-2 text-center text-xs"
            style={{ fontFamily: theme.typography.bodyFont, color: hsl(theme.colors.mutedForeground) }}
          >
            Drag the handle to compare
          </p>
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
