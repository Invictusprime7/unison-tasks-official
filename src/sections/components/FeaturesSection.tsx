import React from 'react';
import type { BaseSectionProps } from '../types';
import { hsl, hsla, containerStyle, sectionStyle, headingStyle, bodyStyle, cardStyle } from '../themeUtils';

export const FeaturesSection: React.FC<BaseSectionProps<'features'>> = ({ section, theme }) => {
  const { headline, subheadline, items, columns = 3, layout = 'grid' } = section.props;

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
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: '2rem',
        }}>
          {items.map((item, i) => (
            <div key={i} style={{ ...cardStyle(theme), padding: '2rem', textAlign: layout === 'centered' ? 'center' : 'left' }}>
              {item.icon && (
                <div style={{
                  width: '3rem', height: '3rem', borderRadius: theme.radius,
                  background: hsla(theme.colors.primary, 0.1),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', marginBottom: '1rem',
                  margin: layout === 'centered' ? '0 auto 1rem' : undefined,
                }}>
                  {item.icon}
                </div>
              )}
              <h3 style={{ ...headingStyle(theme), fontSize: '1.15rem', marginBottom: '0.5rem' }}>{item.title}</h3>
              <p style={{ ...bodyStyle(theme), fontSize: '0.9rem', lineHeight: 1.6 }}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
