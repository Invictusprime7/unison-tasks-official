/**
 * CTA Variant: Signal Banner
 *
 * Bordered card banner with corner brackets and a sweeping highlight line.
 *
 * Adapted from 21st.dev "CTA Banner" (21st:19341). styled-jsx replaced with a
 * scoped keyframe style tag, colours normalized to Stage 4b theme tokens and
 * the sweep disabled under prefers-reduced-motion.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';

const SWEEP_CSS = `
@keyframes utCtaSweep { 0%, 100% { margin-left: -10%; } 50% { margin-left: 77%; } }
[data-ut-variant="cta:signal-banner"] .ut-cta-sweep { animation: utCtaSweep 5s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  [data-ut-variant="cta:signal-banner"] .ut-cta-sweep { animation: none; margin-left: 33%; }
}
`;

export const CTASignalBanner: React.FC<BaseSectionProps<'cta'>> = ({ section, theme }) => {
  const { headline, description, ctas = [] } = section.props;
  const corner = { borderColor: hsla(theme.colors.primary, 0.45) };

  return (
    <section
      data-ut-variant="cta:signal-banner"
      style={{ padding: theme.sectionPadding, background: hsl(theme.colors.background) }}
    >
      <style>{SWEEP_CSS}</style>
      <div className="mx-auto px-6" style={{ maxWidth: theme.containerWidth }}>
        <div
          className="relative overflow-hidden px-6 py-12 text-center"
          style={{
            background: hsla(theme.colors.card, 0.85),
            border: `1px solid ${hsla(theme.colors.primary, 0.28)}`,
            borderRadius: theme.radius,
          }}
        >
          <div className="pointer-events-none absolute left-0 right-0 top-0 h-px">
            <div
              className="ut-cta-sweep h-full w-1/3"
              style={{
                background: `linear-gradient(to right, transparent, ${hsl(theme.colors.primary)}, transparent)`,
              }}
            />
          </div>

          <div className="relative">
            <h2
              className="text-2xl md:text-3xl"
              style={{
                fontFamily: theme.typography.headingFont,
                fontWeight: theme.typography.headingWeight,
                color: hsl(theme.colors.foreground),
                letterSpacing: '0.02em',
              }}
            >
              {headline}
            </h2>
            {description && (
              <p
                className="mx-auto mt-3 max-w-xl text-base"
                style={{ fontFamily: theme.typography.bodyFont, color: hsl(theme.colors.mutedForeground) }}
              >
                {description}
              </p>
            )}

            {ctas.length > 0 && (
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                {ctas.map((c, i) => {
                  const primary = i === 0 || c.variant === 'primary';
                  return (
                    <a
                      key={i}
                      href={c.href || '#'}
                      data-ut-intent={c.intent}
                      data-ut-cta={i === 0 ? 'cta.banner' : 'cta.banner-secondary'}
                      className="inline-flex items-center px-6 py-3 text-sm font-semibold uppercase tracking-widest no-underline transition-all hover:opacity-90"
                      style={{
                        borderRadius: theme.radius,
                        fontFamily: theme.typography.bodyFont,
                        background: primary ? hsla(theme.colors.primary, 0.18) : 'transparent',
                        color: primary ? hsl(theme.colors.primary) : hsl(theme.colors.mutedForeground),
                        border: `1px solid ${hsla(theme.colors.primary, primary ? 0.8 : 0.3)}`,
                      }}
                    >
                      {c.label}
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          <span className="pointer-events-none absolute left-0 top-0 h-5 w-5 border-l-2 border-t-2" style={corner} />
          <span className="pointer-events-none absolute right-0 top-0 h-5 w-5 border-r-2 border-t-2" style={corner} />
          <span className="pointer-events-none absolute bottom-0 left-0 h-5 w-5 border-b-2 border-l-2" style={corner} />
          <span className="pointer-events-none absolute bottom-0 right-0 h-5 w-5 border-b-2 border-r-2" style={corner} />
        </div>
      </div>
    </section>
  );
};
