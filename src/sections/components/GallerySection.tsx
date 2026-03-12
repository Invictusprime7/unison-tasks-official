import React from 'react';
import type { BaseSectionProps } from '../types';
import { hsl, hsla, containerStyle, sectionStyle, headingStyle, bodyStyle } from '../themeUtils';

export const GallerySection: React.FC<BaseSectionProps<'gallery'>> = ({ section, theme }) => {
  const { headline, subheadline, items, columns = 3 } = section.props;

  return (
    <section style={{ ...sectionStyle(theme), background: hsl(theme.colors.muted) }}>
      <div style={containerStyle(theme)}>
        {(headline || subheadline) && (
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            {headline && <h2 style={{ ...headingStyle(theme), fontSize: '2.25rem', marginBottom: '1rem' }}>{headline}</h2>}
            {subheadline && <p style={{ ...bodyStyle(theme), fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>{subheadline}</p>}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: '1rem' }}>
          {items.map((item, i) => (
            <div key={i} style={{ position: 'relative', borderRadius: theme.radius, overflow: 'hidden', aspectRatio: '4/3' }}>
              <img src={item.src} alt={item.alt} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }} />
              {item.caption && (
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  padding: '1rem', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                  color: '#fff', fontSize: '0.85rem', fontFamily: theme.typography.bodyFont,
                }}>
                  {item.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
