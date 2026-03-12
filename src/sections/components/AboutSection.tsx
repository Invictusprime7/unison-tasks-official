import React from 'react';
import type { BaseSectionProps } from '../types';
import { hsl, hsla, containerStyle, sectionStyle, headingStyle, bodyStyle, primaryButtonStyle } from '../themeUtils';

export const AboutSection: React.FC<BaseSectionProps<'about'>> = ({ section, theme }) => {
  const { headline, description, image, cta, layout = 'text-left' } = section.props;
  const imageFirst = layout === 'text-right';

  return (
    <section style={{ ...sectionStyle(theme), background: hsl(theme.colors.background) }}>
      <div style={{
        ...containerStyle(theme),
        display: 'grid',
        gridTemplateColumns: image ? '1fr 1fr' : '1fr',
        gap: '3rem',
        alignItems: 'center',
      }}>
        {imageFirst && image && (
          <img src={image} alt={headline || 'About'} style={{ width: '100%', borderRadius: theme.radius, boxShadow: `0 20px 40px ${hsla(theme.colors.primary, 0.1)}` }} />
        )}
        <div>
          {headline && <h2 style={{ ...headingStyle(theme), fontSize: '2.25rem', marginBottom: '1rem' }}>{headline}</h2>}
          <p style={{ ...bodyStyle(theme), fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '1.5rem' }}>{description}</p>
          {cta && (
            <a href={cta.href || '#'} data-intent={cta.intent} style={{ ...primaryButtonStyle(theme), display: 'inline-block', textDecoration: 'none' }}>
              {cta.label}
            </a>
          )}
        </div>
        {!imageFirst && image && (
          <img src={image} alt={headline || 'About'} style={{ width: '100%', borderRadius: theme.radius, boxShadow: `0 20px 40px ${hsla(theme.colors.primary, 0.1)}` }} />
        )}
      </div>
    </section>
  );
};
