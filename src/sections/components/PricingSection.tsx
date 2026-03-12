import React from 'react';
import type { BaseSectionProps } from '../types';
import { hsl, hsla, containerStyle, sectionStyle, headingStyle, bodyStyle, cardStyle, primaryButtonStyle, outlineButtonStyle } from '../themeUtils';

export const PricingSection: React.FC<BaseSectionProps<'pricing'>> = ({ section, theme }) => {
  const { headline, subheadline, tiers } = section.props;

  return (
    <section style={{ ...sectionStyle(theme), background: hsl(theme.colors.muted) }}>
      <div style={containerStyle(theme)}>
        {(headline || subheadline) && (
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            {headline && <h2 style={{ ...headingStyle(theme), fontSize: '2.25rem', marginBottom: '1rem' }}>{headline}</h2>}
            {subheadline && <p style={{ ...bodyStyle(theme), fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>{subheadline}</p>}
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(tiers.length, 3)}, 1fr)`,
          gap: '1.5rem',
          alignItems: 'start',
        }}>
          {tiers.map((tier, i) => (
            <div key={i} style={{
              ...cardStyle(theme),
              padding: '2.5rem',
              border: tier.highlighted
                ? `2px solid hsl(${theme.colors.primary})`
                : `1px solid ${hsla(theme.colors.border, 1)}`,
              position: 'relative',
              transform: tier.highlighted ? 'scale(1.05)' : undefined,
            }}>
              {tier.badge && (
                <span style={{
                  position: 'absolute', top: '-0.75rem', left: '50%', transform: 'translateX(-50%)',
                  padding: '0.25rem 1rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600',
                  background: `linear-gradient(135deg, hsl(${theme.colors.primary}), hsl(${theme.colors.secondary}))`,
                  color: hsl(theme.colors.primaryForeground),
                }}>
                  {tier.badge}
                </span>
              )}
              <h3 style={{ ...headingStyle(theme), fontSize: '1.25rem', marginBottom: '0.5rem' }}>{tier.name}</h3>
              {tier.description && <p style={{ ...bodyStyle(theme), fontSize: '0.85rem', marginBottom: '1rem' }}>{tier.description}</p>}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '1.5rem' }}>
                <span style={{ ...headingStyle(theme), fontSize: '2.5rem', color: hsl(theme.colors.primary) }}>{tier.price}</span>
                {tier.period && <span style={{ ...bodyStyle(theme), fontSize: '0.9rem' }}>/{tier.period}</span>}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem' }}>
                {tier.features.map((feat, j) => (
                  <li key={j} style={{
                    ...bodyStyle(theme), fontSize: '0.9rem',
                    padding: '0.5rem 0',
                    borderBottom: `1px solid ${hsla(theme.colors.border, 0.5)}`,
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                  }}>
                    <span style={{ color: hsl(theme.colors.primary) }}>✓</span>
                    {feat}
                  </li>
                ))}
              </ul>
              <a
                href={tier.cta.href || '#'}
                data-intent={tier.cta.intent}
                style={{
                  ...(tier.highlighted ? primaryButtonStyle(theme) : outlineButtonStyle(theme)),
                  display: 'block', textAlign: 'center', textDecoration: 'none', width: '100%',
                }}
              >
                {tier.cta.label}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
