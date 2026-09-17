/**
 * Hero Variant: Showcase Panel
 *
 * Adapted from the 21st.dev community component "Product Hero with Demo Panel"
 * (21st:26630). The original shadcn/Next markup was normalized to the Unison
 * runtime: `motion/react` staged variants replaced with a CSS reveal gated on
 * `prefers-reduced-motion`, `react-wrap-balancer` dropped in favour of native
 * text balancing, `@/components/ui/hero-14-utils/*` registry dependencies
 * replaced with canonical Unison CTA + media slots, and every color / radius /
 * spacing value rebound to Stage 4b semantic theme tokens.
 *
 * Provenance is recorded on the registry entry (`source`), never at runtime.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';

const revealStyles = `
@keyframes ut-showcase-panel-rise {
  from { opacity: 0; transform: translateY(14px); filter: blur(6px); }
  to   { opacity: 1; transform: none; filter: blur(0); }
}
[data-ut-variant="hero:showcase-panel"] [data-ut-rise] {
  animation: ut-showcase-panel-rise 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@media (prefers-reduced-motion: reduce) {
  [data-ut-variant="hero:showcase-panel"] [data-ut-rise] {
    animation: none;
    opacity: 1;
    transform: none;
    filter: none;
  }
}
`;

export const HeroShowcasePanel: React.FC<BaseSectionProps<'hero'>> = ({ section, theme }) => {
  const { headline, subheadline, description, ctas = [], badge, image, stats = [] } = section.props;

  return (
    <section
      data-ut-variant="hero:showcase-panel"
      data-ut-slot="hero"
      className="relative isolate w-full overflow-hidden"
      style={{ padding: theme.sectionPadding, background: hsl(theme.colors.background) }}
    >
      <style>{revealStyles}</style>

      <div
        className="relative z-10 mx-auto flex flex-col items-center gap-10 px-6 md:gap-14"
        style={{ maxWidth: theme.containerWidth }}
      >
        <div className="flex w-full max-w-2xl flex-col items-center gap-5 text-center">
          {badge && (
            <span
              data-ut-rise
              data-ut-slot="hero.badge"
              className="inline-block rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide"
              style={{
                color: hsl(theme.colors.primary),
                background: hsla(theme.colors.primary, 0.1),
                border: `1px solid ${hsla(theme.colors.primary, 0.18)}`,
              }}
            >
              {badge}
            </span>
          )}

          <h1
            data-ut-rise
            data-ut-slot="hero.headline"
            className="text-balance font-semibold tracking-tight"
            style={{
              fontFamily: theme.typography.headingFont,
              fontWeight: theme.typography.headingWeight,
              fontSize: 'clamp(1.875rem, 5vw, 3rem)',
              color: hsl(theme.colors.foreground),
              animationDelay: '0.1s',
            }}
          >
            {headline}
          </h1>

          {subheadline && (
            <p
              data-ut-rise
              data-ut-slot="hero.subheadline"
              className="text-balance text-sm leading-relaxed sm:text-base"
              style={{
                fontFamily: theme.typography.bodyFont,
                color: hsl(theme.colors.mutedForeground),
                maxWidth: '36rem',
                animationDelay: '0.2s',
              }}
            >
              {subheadline}
            </p>
          )}

          {description && (
            <p
              data-ut-rise
              className="text-sm leading-relaxed"
              style={{
                fontFamily: theme.typography.bodyFont,
                color: hsla(theme.colors.mutedForeground, 0.85),
                maxWidth: '34rem',
                animationDelay: '0.25s',
              }}
            >
              {description}
            </p>
          )}

          {ctas.length > 0 && (
            <div data-ut-rise className="flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: '0.3s' }}>
              {ctas.map((c, i) => (
                <a
                  key={`${c.label}-${i}`}
                  href={c.href || '#'}
                  data-ut-intent={c.intent}
                  data-ut-cta={i === 0 ? 'cta.hero' : 'cta.hero-secondary'}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium transition-opacity hover:opacity-90"
                  style={
                    i === 0 && c.variant !== 'outline'
                      ? {
                          background: hsl(theme.colors.primary),
                          color: hsl(theme.colors.primaryForeground),
                          borderRadius: `calc(${theme.radius} * 2)`,
                        }
                      : {
                          background: hsl(theme.colors.background),
                          color: hsl(theme.colors.foreground),
                          border: `1px solid ${hsl(theme.colors.border)}`,
                          borderRadius: `calc(${theme.radius} * 2)`,
                        }
                  }
                >
                  {c.label}
                </a>
              ))}
            </div>
          )}
        </div>

        {image && (
          <div
            data-ut-rise
            data-ut-slot="hero.media"
            className="relative w-full overflow-hidden"
            style={{
              borderRadius: `calc(${theme.radius} * 2.5)`,
              border: `1px solid ${hsl(theme.colors.border)}`,
              animationDelay: '0.35s',
            }}
          >
            <img
              src={image}
              alt={headline || ''}
              loading="lazy"
              decoding="async"
              className="h-[18rem] w-full object-cover sm:h-[24rem]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background: `linear-gradient(to top, ${hsla(theme.colors.foreground, 0.16)}, transparent 55%)`,
              }}
            />
          </div>
        )}

        {stats.length > 0 && (
          <div
            data-ut-rise
            className="flex w-full flex-wrap items-center justify-center gap-x-10 gap-y-4 pt-8"
            style={{ borderTop: `1px solid ${hsl(theme.colors.border)}`, animationDelay: '0.45s' }}
          >
            {stats.map((s, i) => (
              <div key={`${s.label}-${i}`} className="text-center">
                <div
                  className="text-xl font-semibold tracking-tight"
                  style={{ fontFamily: theme.typography.headingFont, color: hsl(theme.colors.foreground) }}
                >
                  {s.value}
                </div>
                <div
                  className="text-sm font-medium tracking-tight"
                  style={{ fontFamily: theme.typography.bodyFont, color: hsla(theme.colors.mutedForeground, 0.7) }}
                >
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
