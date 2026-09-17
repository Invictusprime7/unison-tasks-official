/**
 * Hero Variant: Commerce Gradient
 *
 * Adapted from the 21st.dev community component "Commerce Hero" (21st:4927,
 * @bankkroll). The original shadcn/next markup was normalized to the Unison
 * runtime: `@/components/ui/*` imports removed, framer-motion replaced with
 * CSS reveal animation gated on `prefers-reduced-motion`, and every color /
 * radius / spacing value rebound to Stage 4b semantic theme tokens.
 *
 * Provenance is recorded on the registry entry (`source`), never at runtime.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';

const revealStyles = `
@keyframes ut-commerce-hero-rise {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: none; }
}
[data-ut-variant="hero:commerce-gradient"] [data-ut-rise] {
  animation: ut-commerce-hero-rise 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@media (prefers-reduced-motion: reduce) {
  [data-ut-variant="hero:commerce-gradient"] [data-ut-rise] {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
`;

export const HeroCommerceGradient: React.FC<BaseSectionProps<'hero'>> = ({ section, theme }) => {
  const { headline, subheadline, description, ctas = [], badge } = section.props;

  return (
    <section
      data-ut-variant="hero:commerce-gradient"
      data-ut-slot="hero"
      className="relative overflow-hidden"
      style={{
        padding: theme.sectionPadding,
        background: hsl(theme.colors.background),
      }}
    >
      <style>{revealStyles}</style>

      <div className="mx-auto" style={{ maxWidth: theme.containerWidth }}>
        <div
          className="relative overflow-hidden px-6 py-20 md:py-28 text-center"
          style={{
            borderRadius: `calc(${theme.radius} * 3)`,
            background: hsla(theme.colors.accent, 0.5),
            border: `1px solid ${hsla(theme.colors.border, 1)}`,
          }}
        >
          {badge && (
            <span
              data-ut-rise
              data-ut-slot="hero.badge"
              className="inline-block text-xs font-medium tracking-wide uppercase mb-6 px-3 py-1 rounded-full"
              style={{
                color: hsl(theme.colors.primary),
                background: hsla(theme.colors.primary, 0.1),
                border: `1px solid ${hsla(theme.colors.primary, 0.18)}`,
                animationDelay: '0.05s',
              }}
            >
              {badge}
            </span>
          )}

          <h1
            data-ut-rise
            data-ut-slot="hero.headline"
            className="font-bold tracking-tight leading-tight mb-6 mx-auto"
            style={{
              fontFamily: theme.typography.headingFont,
              fontWeight: theme.typography.headingWeight,
              fontSize: 'clamp(2.25rem, 6vw, 4.25rem)',
              maxWidth: '18ch',
              backgroundImage: `linear-gradient(90deg, ${hsl(theme.colors.primary)}, ${hsla(theme.colors.primary, 0.7)})`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              animationDelay: '0.15s',
            }}
          >
            {headline}
          </h1>

          {subheadline && (
            <p
              data-ut-rise
              data-ut-slot="hero.subheadline"
              className="text-base md:text-lg leading-relaxed mx-auto"
              style={{
                fontFamily: theme.typography.bodyFont,
                color: hsl(theme.colors.mutedForeground),
                maxWidth: '42rem',
                animationDelay: '0.3s',
              }}
            >
              {subheadline}
            </p>
          )}

          {description && (
            <p
              data-ut-rise
              className="text-sm md:text-base leading-relaxed mx-auto mt-4"
              style={{
                fontFamily: theme.typography.bodyFont,
                color: hsla(theme.colors.mutedForeground, 0.85),
                maxWidth: '40rem',
                animationDelay: '0.35s',
              }}
            >
              {description}
            </p>
          )}

          {ctas.length > 0 && (
            <div data-ut-rise className="flex gap-3 flex-wrap justify-center mt-10" style={{ animationDelay: '0.45s' }}>
              {ctas.map((c, i) => (
                <a
                  key={`${c.label}-${i}`}
                  href={c.href || '#'}
                  data-ut-intent={c.intent}
                  data-ut-cta={i === 0 ? 'cta.hero' : 'cta.hero-secondary'}
                  className="inline-flex items-center gap-2 text-sm font-medium px-6 py-3 transition-all hover:opacity-90"
                  style={
                    i === 0 && c.variant !== 'outline'
                      ? {
                          background: hsl(theme.colors.primary),
                          color: hsl(theme.colors.primaryForeground),
                          borderRadius: `calc(${theme.radius} * 4)`,
                        }
                      : {
                          background: hsl(theme.colors.background),
                          color: hsl(theme.colors.foreground),
                          border: `1px solid ${hsla(theme.colors.border, 1)}`,
                          borderRadius: `calc(${theme.radius} * 4)`,
                        }
                  }
                >
                  {c.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
