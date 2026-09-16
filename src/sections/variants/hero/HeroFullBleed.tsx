/**
 * Hero Variant: Full-Bleed Background
 * Full-width background image/gradient with centered text overlay.
 * High-impact, immersive hero layout.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';

export const HeroFullBleed: React.FC<BaseSectionProps<'hero'>> = ({ section, theme }) => {
  const { headline, subheadline, ctas = [], badge, stats, backgroundImage } = section.props;

  return (
    <section
      data-ut-variant="hero:full-bleed"
      className="relative overflow-hidden flex items-center justify-center"
      style={{
        minHeight: '85vh',
        background: backgroundImage
          ? `linear-gradient(${hsla(theme.colors.foreground, 0.55)}, ${hsla(theme.colors.foreground, 0.55)}), url(${backgroundImage}) center/cover no-repeat`
          : `linear-gradient(135deg, ${hsl(theme.colors.primary)}, ${hsl(theme.colors.secondary)})`,
      }}
    >
      <div className="mx-auto relative text-center px-6" style={{ maxWidth: '800px' }}>
        {badge && (
          <span
            className="inline-block text-xs font-medium tracking-wide uppercase mb-6 px-3 py-1 rounded-full"
            style={{
              color: hsl(theme.colors.primaryForeground),
              background: hsla(theme.colors.primaryForeground, 0.15),
              border: `1px solid ${hsla(theme.colors.primaryForeground, 0.25)}`,
              backdropFilter: 'blur(4px)',
            }}
          >
            {badge}
          </span>
        )}

        <h1
          className="leading-tight mb-6"
          style={{
            fontFamily: theme.typography.headingFont,
            fontWeight: theme.typography.headingWeight,
            color: hsl(theme.colors.primaryForeground),
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            letterSpacing: 0,
            textShadow: `0 2px 20px ${hsla(theme.colors.foreground, 0.3)}`,
          }}
        >
          {headline}
        </h1>

        {subheadline && (
          <p
            className="text-lg leading-relaxed mb-8"
            style={{
              fontFamily: theme.typography.bodyFont,
              color: hsla(theme.colors.primaryForeground, 0.85),
              maxWidth: '580px',
              margin: '0 auto 2rem',
            }}
          >
            {subheadline}
          </p>
        )}

        {ctas.length > 0 && (
          <div className="flex gap-3 flex-wrap justify-center">
            {ctas.map((c, i) => (
              <a
                key={i}
                href={c.href || '#'}
                data-ut-intent={c.intent}
                data-ut-cta={i === 0 ? 'cta.hero' : 'cta.hero-secondary'}
                className="inline-block text-sm font-medium px-6 py-3 transition-all hover:opacity-90"
                style={
                  c.variant === 'outline'
                    ? {
                        background: 'transparent',
                        color: hsl(theme.colors.primaryForeground),
                        border: `1px solid ${hsla(theme.colors.primaryForeground, 0.4)}`,
                        borderRadius: theme.radius,
                      }
                    : {
                        background: hsl(theme.colors.primaryForeground),
                        color: hsl(theme.colors.primary),
                        borderRadius: theme.radius,
                        fontWeight: '600',
                      }
                }
              >
                {c.label}
              </a>
            ))}
          </div>
        )}

        {stats && stats.length > 0 && (
          <div className="flex gap-10 mt-12 flex-wrap justify-center">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold" style={{ fontFamily: theme.typography.headingFont, color: hsl(theme.colors.primaryForeground) }}>
                  {s.value}
                </div>
                <div className="text-xs uppercase tracking-widest mt-1" style={{ color: hsla(theme.colors.primaryForeground, 0.7) }}>
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
