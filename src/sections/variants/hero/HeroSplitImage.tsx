/**
 * Hero Variant: Split Image
 *
 * Canonical adaptation of 21st:1160 "Hero with image, text and two buttons" by
 * @tommyjepsen. The source's two-column grid, outline badge, oversized
 * tracking-tight regular-weight headline, muted lead paragraph, paired action
 * buttons and square media panel are preserved. shadcn Button/Badge and lucide
 * imports are replaced by canonical intent anchors, and every colour resolves
 * from the Stage 4b theme instead of the source palette.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';

export const HeroSplitImage: React.FC<BaseSectionProps<'hero'>> = ({ section, theme }) => {
  const { headline, subheadline, ctas = [], badge, stats, image } = section.props;

  return (
    <section
      data-ut-variant="hero:split-image"
      data-ut-slot="hero"
      className="relative overflow-hidden"
      style={{
        padding: theme.sectionPadding,
        paddingTop: 'clamp(5rem, 8vw, 7rem)',
        background: hsl(theme.colors.background),
      }}
    >
      <div
        className="mx-auto grid grid-cols-1 items-center gap-10 px-6 lg:grid-cols-2 lg:gap-16"
        style={{ maxWidth: theme.containerWidth }}
      >
        <div className="flex flex-col gap-6">
          {badge && (
            <span
              className="inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide"
              style={{
                color: hsl(theme.colors.foreground),
                border: `1px solid ${hsla(theme.colors.border, 1)}`,
                fontFamily: theme.typography.bodyFont,
              }}
            >
              {badge}
            </span>
          )}

          <h1
            className="max-w-xl text-left leading-[1.05] tracking-tighter"
            style={{
              fontFamily: theme.typography.headingFont,
              fontWeight: theme.typography.headingWeight,
              color: hsl(theme.colors.foreground),
              fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
            }}
          >
            {headline}
          </h1>

          {subheadline && (
            <p
              className="max-w-md text-left text-xl leading-relaxed tracking-tight"
              style={{ fontFamily: theme.typography.bodyFont, color: hsl(theme.colors.mutedForeground) }}
            >
              {subheadline}
            </p>
          )}

          {ctas.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {ctas.map((c, i) => (
                <a
                  key={i}
                  href={c.href || '#'}
                  data-ut-intent={c.intent}
                  data-ut-cta={i === 0 ? 'cta.hero' : 'cta.hero-secondary'}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium motion-safe:transition-transform motion-safe:hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={
                    c.variant === 'outline'
                      ? {
                          background: 'transparent',
                          color: hsl(theme.colors.foreground),
                          border: `1px solid ${hsla(theme.colors.border, 1)}`,
                          borderRadius: theme.radius,
                          fontFamily: theme.typography.bodyFont,
                        }
                      : {
                          background: hsl(theme.colors.primary),
                          color: hsl(theme.colors.primaryForeground),
                          borderRadius: theme.radius,
                          fontFamily: theme.typography.bodyFont,
                        }
                  }
                >
                  {c.label}
                </a>
              ))}
            </div>
          )}

          {stats && stats.length > 0 && (
            <div className="flex flex-wrap gap-8 pt-2">
              {stats.map((s, i) => (
                <div key={i}>
                  <div
                    className="text-2xl font-bold"
                    style={{ fontFamily: theme.typography.headingFont, color: hsl(theme.colors.primary) }}
                  >
                    {s.value}
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-widest" style={{ color: hsl(theme.colors.mutedForeground) }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          data-ut-slot="hero-media"
          className="relative w-full overflow-hidden"
          style={{ aspectRatio: '1 / 1', borderRadius: theme.radius, background: hsla(theme.colors.muted, 1) }}
        >
          {image && (
            <img
              src={image}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:hover:scale-[1.02]"
            />
          )}
        </div>
      </div>
    </section>
  );
};
