/**
 * Hero Variant: Full Bleed
 *
 * Canonical adaptation of 21st:6834 "Hero — Aurora Background" by
 * @ravikatiyar162. The source's full-height stage with two slowly drifting,
 * heavily blurred aurora blobs behind centered content is preserved. The
 * framer-motion wrapper and `cn` helper are replaced with CSS keyframes that
 * only run under `motion-safe`, and the source palette is replaced by
 * Stage 4b theme tokens layered over the section background image.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';

const AURORA_KEYFRAMES = `
@media (prefers-reduced-motion: no-preference) {
  @keyframes ut-hero-aurora-1 {
    0%, 100% { transform: translate(0%, 0%) scale(1); }
    25% { transform: translate(18%, -18%) scale(1.2); }
    50% { transform: translate(-18%, 18%) scale(0.85); }
    75% { transform: translate(9%, -9%) scale(1.1); }
  }
  @keyframes ut-hero-aurora-2 {
    0%, 100% { transform: translate(0%, 0%) scale(1); }
    25% { transform: translate(-18%, 18%) scale(1.1); }
    50% { transform: translate(18%, -18%) scale(0.9); }
    75% { transform: translate(-9%, 9%) scale(1.2); }
  }
  .ut-hero-aurora-1 { animation: ut-hero-aurora-1 20s ease-in-out infinite; }
  .ut-hero-aurora-2 { animation: ut-hero-aurora-2 20s ease-in-out infinite; }
}
`;

export const HeroFullBleed: React.FC<BaseSectionProps<'hero'>> = ({ section, theme }) => {
  const { headline, subheadline, ctas = [], badge, stats, backgroundImage } = section.props;

  return (
    <section
      data-ut-variant="hero:full-bleed"
      data-ut-slot="hero"
      className="relative isolate flex items-center justify-center overflow-hidden"
      style={{
        minHeight: '85vh',
        background: backgroundImage
          ? `linear-gradient(${hsla(theme.colors.foreground, 0.58)}, ${hsla(theme.colors.foreground, 0.58)}), url(${backgroundImage}) center/cover no-repeat`
          : `linear-gradient(135deg, ${hsl(theme.colors.primary)}, ${hsl(theme.colors.secondary)})`,
      }}
    >
      <style>{AURORA_KEYFRAMES}</style>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="ut-hero-aurora-1 absolute -top-1/4 left-1/4 h-96 w-96 rounded-full blur-3xl"
          style={{ background: hsla(theme.colors.primary, 0.35) }}
        />
        <div
          className="ut-hero-aurora-2 absolute -bottom-1/4 right-1/4 h-96 w-96 rounded-full blur-3xl"
          style={{ background: hsla(theme.colors.accent, 0.3) }}
        />
      </div>

      <div className="relative z-10 mx-auto px-5 py-16 text-center sm:px-8 md:py-20" style={{ maxWidth: '820px' }}>
        {badge && (
          <span data-ut-slot="hero.badge"
            className="mb-6 inline-block rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide"
            style={{
              color: hsl(theme.colors.primaryForeground),
              background: hsla(theme.colors.primaryForeground, 0.15),
              border: `1px solid ${hsla(theme.colors.primaryForeground, 0.25)}`,
              backdropFilter: 'blur(4px)',
              fontFamily: theme.typography.bodyFont,
            }}
          >
            {badge}
          </span>
        )}

        <h1 data-ut-slot="hero.headline"
          className="mb-6 text-balance leading-[1.05] tracking-tight"
          style={{
            fontFamily: theme.typography.headingFont,
            fontWeight: theme.typography.headingWeight,
            color: hsl(theme.colors.primaryForeground),
            fontSize: 'clamp(2.5rem, 5.5vw, 4.25rem)',
            textShadow: `0 2px 24px ${hsla(theme.colors.foreground, 0.35)}`,
          }}
        >
          {headline}
        </h1>

        {subheadline && (
          <p data-ut-slot="hero.subheadline"
            className="mx-auto mb-9 max-w-xl text-lg leading-relaxed"
            style={{ fontFamily: theme.typography.bodyFont, color: hsla(theme.colors.primaryForeground, 0.85) }}
          >
            {subheadline}
          </p>
        )}

        {ctas.length > 0 && (
          <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            {ctas.map((c, i) => (
              <a
                key={i}
                href={c.href || '#'}
                data-ut-intent={c.intent ?? 'nav.goto'}
                data-ut-cta={i === 0 ? 'cta.hero' : 'cta.hero-secondary'}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium motion-safe:transition-transform motion-safe:hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={
                  c.variant === 'outline'
                    ? {
                        background: 'transparent',
                        color: hsl(theme.colors.primaryForeground),
                        border: `1px solid ${hsla(theme.colors.primaryForeground, 0.4)}`,
                        borderRadius: theme.radius,
                        fontFamily: theme.typography.bodyFont,
                      }
                    : {
                        background: hsl(theme.colors.primaryForeground),
                        color: hsl(theme.colors.primary),
                        borderRadius: theme.radius,
                        fontWeight: 600,
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
          <div className="mt-10 grid grid-cols-2 gap-6 sm:mt-12 sm:flex sm:flex-wrap sm:justify-center sm:gap-10">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div data-ut-slot={`hero.value`}
                  className="text-3xl font-bold"
                  style={{ fontFamily: theme.typography.headingFont, color: hsl(theme.colors.primaryForeground) }}
                >
                  {s.value}
                </div>
                <div data-ut-slot={`hero.label`} className="mt-1 text-xs uppercase tracking-widest" style={{ color: hsla(theme.colors.primaryForeground, 0.7) }}>
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
