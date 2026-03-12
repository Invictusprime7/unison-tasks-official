import React from 'react';
import type { BaseSectionProps } from '../types';
import { hsl, hsla, containerStyle, sectionStyle, headingStyle, bodyStyle, primaryButtonStyle, outlineButtonStyle } from '../themeUtils';

export const HeroSection: React.FC<BaseSectionProps<'hero'>> = ({ section, theme }) => {
  const { headline, subheadline, description, ctas = [], image, backgroundImage, layout = 'centered', badge, stats } = section.props;

  const isSplit = layout === 'split';

  return (
    <section
      style={{
        ...sectionStyle(theme),
        paddingTop: '8rem',
        paddingBottom: '5rem',
        background: backgroundImage
          ? `linear-gradient(180deg, ${hsla(theme.colors.background, 0.9)}, ${hsla(theme.colors.background, 0.95)}), url(${backgroundImage}) center/cover`
          : hsl(theme.colors.background),
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Gradient orb decoration */}
      <div style={{
        position: 'absolute', top: '-30%', right: '-10%', width: '600px', height: '600px',
        background: `radial-gradient(circle, ${hsla(theme.colors.primary, 0.08)} 0%, transparent 70%)`,
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div style={{
        ...containerStyle(theme),
        display: isSplit ? 'grid' : 'flex',
        gridTemplateColumns: isSplit ? '1fr 1fr' : undefined,
        flexDirection: isSplit ? undefined : 'column',
        alignItems: 'center',
        gap: '3rem',
        textAlign: isSplit ? 'left' : 'center',
        position: 'relative',
      }}>
        <div>
          {badge && (
            <span style={{
              display: 'inline-block',
              padding: '0.35rem 1rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: '600',
              fontFamily: theme.typography.bodyFont,
              background: hsla(theme.colors.primary, 0.12),
              color: hsl(theme.colors.primary),
              border: `1px solid ${hsla(theme.colors.primary, 0.25)}`,
              marginBottom: '1.5rem',
            }}>
              {badge}
            </span>
          )}

          <h1 style={{
            ...headingStyle(theme),
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            lineHeight: 1.1,
            marginBottom: '1.5rem',
          }}>
            {headline}
          </h1>

          {subheadline && (
            <p style={{
              ...bodyStyle(theme),
              fontSize: '1.25rem',
              lineHeight: 1.6,
              maxWidth: isSplit ? undefined : '640px',
              margin: isSplit ? undefined : '0 auto',
              marginBottom: '2rem',
            }}>
              {subheadline}
            </p>
          )}

          {description && (
            <p style={{ ...bodyStyle(theme), marginBottom: '2rem' }}>
              {description}
            </p>
          )}

          {ctas.length > 0 && (
            <div style={{ display: 'flex', gap: '1rem', justifyContent: isSplit ? 'flex-start' : 'center', flexWrap: 'wrap' }}>
              {ctas.map((cta, i) => (
                <a
                  key={i}
                  href={cta.href || '#'}
                  data-intent={cta.intent}
                  style={cta.variant === 'outline' || cta.variant === 'secondary'
                    ? outlineButtonStyle(theme)
                    : primaryButtonStyle(theme)
                  }
                >
                  {cta.label}
                </a>
              ))}
            </div>
          )}

          {stats && stats.length > 0 && (
            <div style={{
              display: 'flex', gap: '2.5rem', marginTop: '3rem',
              justifyContent: isSplit ? 'flex-start' : 'center',
            }}>
              {stats.map((stat, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ ...headingStyle(theme), fontSize: '2rem', color: hsl(theme.colors.primary) }}>
                    {stat.value}
                  </div>
                  <div style={{ ...bodyStyle(theme), fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {isSplit && image && (
          <div style={{ position: 'relative' }}>
            <img
              src={image}
              alt={headline}
              style={{
                width: '100%',
                borderRadius: theme.radius,
                boxShadow: `0 25px 50px -12px ${hsla(theme.colors.primary, 0.15)}`,
              }}
            />
          </div>
        )}
      </div>
    </section>
  );
};
