import React from 'react';
import type { BaseSectionProps } from '../types';
import { hsl, hsla } from '../themeUtils';

export const HeroSection: React.FC<BaseSectionProps<'hero'>> = ({ section, theme }) => {
  const { headline, subheadline, ctas = [], badge, stats, layout = 'centered', image, backgroundImage } = section.props;
  const heroImage = image || backgroundImage;
  const isSplit = layout === 'split' && Boolean(heroImage);

  return (
    <section
      className="relative overflow-hidden"
      style={{
        padding: theme.sectionPadding,
        paddingTop: 'clamp(5.5rem, 8vw, 6.5rem)',
        background: hsl(theme.colors.background),
      }}
    >
      <div
        className={`mx-auto relative ${isSplit ? 'grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-left' : 'text-center'}`}
        style={{
          maxWidth: theme.containerWidth,
        }}
      >
        <div>
          {badge && (
            <span
              className="inline-block text-xs font-semibold tracking-wide uppercase mb-6 px-3.5 py-1.5 rounded-full"
              style={{
                color: hsl(theme.colors.primary),
                background: hsla(theme.colors.primary, 0.08),
                border: `1px solid ${hsla(theme.colors.primary, 0.2)}`,
              }}
            >
              {badge}
            </span>
          )}

          <h1
            className="leading-tight mb-6 font-semibold"
            style={{
              fontFamily: theme.typography.headingFont,
              fontWeight: theme.typography.headingWeight,
              color: hsl(theme.colors.foreground),
              fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)',
              letterSpacing: '-0.02em',
            }}
          >
            {headline}
          </h1>

          {subheadline && (
            <p
              className="text-lg leading-relaxed mb-8"
              style={{
                fontFamily: theme.typography.bodyFont,
                color: hsl(theme.colors.mutedForeground),
                maxWidth: isSplit ? undefined : '580px',
                margin: isSplit ? undefined : '0 auto',
                marginBottom: '2rem',
              }}
            >
              {subheadline}
            </p>
          )}

          {ctas.length > 0 && (
            <div
              className="flex gap-3 flex-wrap"
              style={{ justifyContent: isSplit ? 'flex-start' : 'center' }}
            >
              {ctas.map((c, i) => (
                <a
                  key={i}
                  href={c.href || '#'}
                  data-ut-intent={c.intent}
                  className="inline-block text-sm font-semibold px-6 py-3.5 transition-all hover:opacity-90 active:scale-[0.98] shadow-sm cursor-pointer"
                  style={
                    c.variant === 'outline'
                      ? {
                          background: 'transparent',
                          color: hsl(theme.colors.foreground),
                          border: `1px solid ${hsla(theme.colors.border, 1)}`,
                          borderRadius: theme.radius,
                        }
                      : {
                          background: hsl(theme.colors.primary),
                          color: hsl(theme.colors.primaryForeground),
                          borderRadius: theme.radius,
                        }
                  }
                >
                  {c.label}
                </a>
              ))}
            </div>
          )}

          {stats && stats.length > 0 && (
            <div className="flex gap-10 mt-12 flex-wrap" style={{ justifyContent: isSplit ? 'flex-start' : 'center' }}>
              {stats.map((s, i) => (
                <div key={i} className={isSplit ? 'text-left' : 'text-center'}>
                  <div
                    className="text-3xl font-bold"
                    style={{ fontFamily: theme.typography.headingFont, color: hsl(theme.colors.primary) }}
                  >
                    {s.value}
                  </div>
                  <div
                    className="text-xs uppercase tracking-widest mt-1"
                    style={{ color: hsl(theme.colors.mutedForeground) }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {isSplit && heroImage && (
          <div
            className="relative rounded-2xl overflow-hidden shadow-md"
            style={{
              aspectRatio: '4/3',
              background: hsla(theme.colors.muted, 0.2),
            }}
          >
            <img
              src={heroImage}
              alt={headline}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              style={{ borderRadius: theme.radius }}
            />
          </div>
        )}
      </div>
    </section>
  );
};
