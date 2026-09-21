/**
 * Hero Variant: Centered
 *
 * Canonical adaptation of 21st:10024 "Hero 1" by @efferd. The source's ruled
 * max-width frame, top radial shade, pill announcement badge and centered
 * headline stack are reproduced. The shadcn Button, logo-cloud dependency and
 * `--theme()` colour functions are replaced by canonical intent anchors and
 * Stage 4b theme tokens; the frame hairlines and radial shade are preserved.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';

export const HeroCentered: React.FC<BaseSectionProps<'hero'>> = ({ section, theme }) => {
  const { headline, subheadline, ctas = [], badge, stats } = section.props;
  const rule = hsla(theme.colors.border, 0.65);

  return (
    <section
      data-ut-variant="hero:centered"
      data-ut-slot="hero"
      className="relative isolate overflow-hidden"
      style={{
        padding: theme.sectionPadding,
        paddingTop: 'clamp(5.5rem, 8vw, 7rem)',
        background: hsl(theme.colors.background),
      }}
    >
      {/* Top shade — source radial gradient, re-expressed with theme tokens. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-16 -z-10 h-80"
        style={{
          background: `radial-gradient(35% 80% at 50% 0%, ${hsla(theme.colors.primary, 0.12)}, transparent)`,
        }}
      />

      <div className="relative mx-auto px-6 text-center" style={{ maxWidth: theme.containerWidth }}>
        {/* Faded vertical frame borders from the source layout. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 hidden w-px lg:block"
          style={{ background: `linear-gradient(to bottom, transparent, ${rule} 20%, ${rule} 80%, transparent)` }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-px lg:block"
          style={{ background: `linear-gradient(to bottom, transparent, ${rule} 20%, ${rule} 80%, transparent)` }}
        />

        {badge && (
          <span
            className="mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide"
            style={{
              color: hsl(theme.colors.primary),
              background: hsla(theme.colors.primary, 0.08),
              border: `1px solid ${hsla(theme.colors.primary, 0.18)}`,
              fontFamily: theme.typography.bodyFont,
            }}
          >
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ background: hsl(theme.colors.primary) }} />
            {badge}
          </span>
        )}

        <h1
          className="mx-auto mb-6 max-w-3xl text-balance leading-[1.05] tracking-tight"
          style={{
            fontFamily: theme.typography.headingFont,
            fontWeight: theme.typography.headingWeight,
            color: hsl(theme.colors.foreground),
            fontSize: 'clamp(2.5rem, 5.2vw, 4rem)',
          }}
        >
          {headline}
        </h1>

        {subheadline && (
          <p
            className="mx-auto mb-9 max-w-xl text-lg leading-relaxed"
            style={{ fontFamily: theme.typography.bodyFont, color: hsl(theme.colors.mutedForeground) }}
          >
            {subheadline}
          </p>
        )}

        {ctas.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3">
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
          <div
            className="mt-14 flex flex-wrap justify-center gap-10 pt-10"
            style={{ borderTop: `1px solid ${rule}` }}
          >
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div
                  className="text-3xl font-bold"
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
    </section>
  );
};
