import React from 'react';
import type { BaseSectionProps } from '../types';
import { hsl, hsla, containerStyle, sectionStyle, headingStyle, bodyStyle, cardStyle, primaryButtonStyle } from '../themeUtils';

export const ServicesSection: React.FC<BaseSectionProps<'services'>> = ({ section, theme }) => {
  const { headline, subheadline, items, columns = 3 } = section.props;

  return (
    <section style={{ ...sectionStyle(theme), background: hsl(theme.colors.background) }}>
      <div style={containerStyle(theme)}>
        {(headline || subheadline) && (
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            {headline && <h2 style={{ ...headingStyle(theme), fontSize: '2.25rem', marginBottom: '1rem' }}>{headline}</h2>}
            {subheadline && <p style={{ ...bodyStyle(theme), fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>{subheadline}</p>}
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: '1.5rem',
        }}>
          {items.map((item, i) => (
            <div key={i} style={{ ...cardStyle(theme), padding: '2rem' }}>
              {item.badge && (
                <span style={{
                  display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '9999px',
                  fontSize: '0.75rem', fontWeight: '600',
                  background: hsla(theme.colors.primary, 0.12),
                  color: hsl(theme.colors.primary),
                  marginBottom: '1rem',
                }}>
                  {item.badge}
                </span>
              )}
              {item.image && (
                <img src={item.image} alt={item.title} style={{ width: '100%', borderRadius: theme.radius, marginBottom: '1rem', aspectRatio: '16/10', objectFit: 'cover' }} />
              )}
              <h3 style={{ ...headingStyle(theme), fontSize: '1.25rem', marginBottom: '0.5rem' }}>{item.title}</h3>
              <p style={{ ...bodyStyle(theme), fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>{item.description}</p>
              {(item.price || item.duration) && (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1rem' }}>
                  {item.price && <span style={{ ...headingStyle(theme), fontSize: '1.5rem', color: hsl(theme.colors.primary) }}>{item.price}</span>}
                  {item.duration && <span style={{ ...bodyStyle(theme), fontSize: '0.8rem' }}>{item.duration}</span>}
                </div>
              )}
              {item.cta && (
                <a href={item.cta.href || '#'} data-intent={item.cta.intent} style={{ ...primaryButtonStyle(theme), display: 'inline-block', fontSize: '0.85rem', padding: '0.5rem 1.25rem', textDecoration: 'none' }}>
                  {item.cta.label}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
