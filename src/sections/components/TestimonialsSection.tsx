import React from 'react';
import type { BaseSectionProps } from '../types';
import { hsl, hsla, containerStyle, sectionStyle, headingStyle, bodyStyle, cardStyle } from '../themeUtils';

export const TestimonialsSection: React.FC<BaseSectionProps<'testimonials'>> = ({ section, theme }) => {
  const { headline, subheadline, items, layout = 'grid' } = section.props;
  const cols = layout === 'single' ? 1 : items.length >= 3 ? 3 : 2;

  return (
    <section style={{ ...sectionStyle(theme), background: hsl(theme.colors.background) }}>
      <div style={containerStyle(theme)}>
        {(headline || subheadline) && (
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            {headline && <h2 style={{ ...headingStyle(theme), fontSize: '2.25rem', marginBottom: '1rem' }}>{headline}</h2>}
            {subheadline && <p style={{ ...bodyStyle(theme), fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>{subheadline}</p>}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '1.5rem' }}>
          {items.map((item, i) => (
            <div key={i} style={{ ...cardStyle(theme), padding: '2rem' }}>
              {item.rating && (
                <div style={{ marginBottom: '1rem', color: hsl(theme.colors.accent) }}>
                  {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                </div>
              )}
              <blockquote style={{
                ...bodyStyle(theme), fontSize: '1rem', lineHeight: 1.7,
                fontStyle: 'italic', marginBottom: '1.5rem',
                borderLeft: `3px solid ${hsla(theme.colors.primary, 0.3)}`,
                paddingLeft: '1rem',
              }}>
                "{item.quote}"
              </blockquote>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {item.avatar && (
                  <img src={item.avatar} alt={item.author} style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', objectFit: 'cover' }} />
                )}
                <div>
                  <div style={{ ...headingStyle(theme), fontSize: '0.9rem' }}>{item.author}</div>
                  {item.role && <div style={{ ...bodyStyle(theme), fontSize: '0.8rem' }}>{item.role}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
