/**
 * Hero Variant: Prisma Cinematic
 *
 * Adapted from the 21st.dev community component "PrismaHero" (21st:12200,
 * @rahil1202). The original markup was normalized to the Unison runtime:
 * `framer-motion` replaced with CSS reveal animation gated on
 * `prefers-reduced-motion`, the hardcoded demo video/colour literals rebound to
 * Stage 4b semantic theme tokens and section media props, and canonical
 * `data-ut-*` identity/slot/intent attributes added.
 *
 * Provenance is recorded on the registry entry (`source`), never at runtime.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';

const revealStyles = `
@keyframes ut-prisma-rise {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: none; }
}
[data-ut-variant="hero:prisma-cinematic"] [data-ut-rise] {
  animation: ut-prisma-rise 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@media (prefers-reduced-motion: reduce) {
  [data-ut-variant="hero:prisma-cinematic"] [data-ut-rise] {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
`;

export const HeroPrismaCinematic: React.FC<BaseSectionProps<'hero'>> = ({ section, theme }) => {
  const { headline, subheadline, description, ctas = [], badge, image, backgroundImage } = section.props;
  const media = backgroundImage || image;
  const words = String(headline || '').trim().split(/\s+/).filter(Boolean);

  return (
    <section
      data-ut-variant="hero:prisma-cinematic"
      data-ut-slot="hero"
      className="relative w-full"
      style={{ padding: theme.sectionPadding, background: hsl(theme.colors.background) }}
    >
      <style>{revealStyles}</style>

      <div className="mx-auto" style={{ maxWidth: theme.containerWidth }}>
        <div
          className="relative overflow-hidden min-h-[70vh] md:min-h-[82vh] flex flex-col justify-end"
          style={{
            borderRadius: `calc(${theme.radius} * 4)`,
            background: hsl(theme.colors.foreground),
          }}
        >
          {media && (
            <img
              src={media}
              alt={headline ? `${headline} background` : 'Hero background'}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}

          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(to bottom, ${hsla(theme.colors.foreground, 0.35)}, transparent 45%, ${hsla(theme.colors.foreground, 0.75)})`,
            }}
          />

          {badge && (
            <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2">
              <span
                data-ut-rise
                data-ut-slot="hero.badge"
                className="inline-block px-5 py-2 text-[11px] uppercase tracking-[0.2em]"
                style={{
                  background: hsl(theme.colors.foreground),
                  color: hsl(theme.colors.background),
                  borderBottomLeftRadius: `calc(${theme.radius} * 2)`,
                  borderBottomRightRadius: `calc(${theme.radius} * 2)`,
                }}
              >
                {badge}
              </span>
            </div>
          )}

          <div className="relative z-10 grid grid-cols-12 items-end gap-6 px-5 pb-6 sm:px-8 md:px-10 md:pb-10">
            <div className="col-span-12 lg:col-span-8">
              <h1
                data-ut-slot="hero.headline"
                className="flex flex-wrap font-medium"
                style={{
                  fontFamily: theme.typography.headingFont,
                  fontWeight: theme.typography.headingWeight,
                  fontSize: 'clamp(3rem, 16vw, 13rem)',
                  lineHeight: 0.85,
                  letterSpacing: '-0.06em',
                  color: hsl(theme.colors.background),
                }}
              >
                {words.map((word, i) => (
                  <span
                    key={`${word}-${i}`}
                    data-ut-rise
                    className="inline-block"
                    style={{ marginRight: '0.22em', animationDelay: `${i * 0.08}s` }}
                  >
                    {word}
                  </span>
                ))}
              </h1>
            </div>

            <div className="col-span-12 flex flex-col gap-5 pb-2 lg:col-span-4 lg:pb-8">
              {(subheadline || description) && (
                <p
                  data-ut-rise
                  data-ut-slot="hero.subheadline"
                  className="text-sm leading-snug md:text-base"
                  style={{
                    fontFamily: theme.typography.bodyFont,
                    color: hsla(theme.colors.background, 0.78),
                    animationDelay: '0.4s',
                  }}
                >
                  {subheadline || description}
                </p>
              )}

              {ctas.length > 0 && (
                <div data-ut-rise className="flex flex-wrap items-center gap-3" style={{ animationDelay: '0.55s' }}>
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
                              background: hsl(theme.colors.background),
                              color: hsl(theme.colors.foreground),
                              borderRadius: `calc(${theme.radius} * 6)`,
                            }
                          : {
                              border: `1px solid ${hsla(theme.colors.background, 0.5)}`,
                              color: hsl(theme.colors.background),
                              borderRadius: `calc(${theme.radius} * 6)`,
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
        </div>
      </div>
    </section>
  );
};

export default HeroPrismaCinematic;
