import React from 'react';
import type { BaseSectionProps } from '../types';
import { hsl, hsla, containerStyle, sectionStyle, headingStyle, bodyStyle, primaryButtonStyle, outlineButtonStyle } from '../themeUtils';

export const CTASection: React.FC<BaseSectionProps<'cta'>> = ({ section, theme }) => {
  const { headline, description, ctas, layout = 'centered', backgroundImage } = section.props;

  return (
    <section style={{
      ...sectionStyle(theme),
      background: backgroundImage
        ? `linear-gradient(135deg, ${hsla(theme.colors.primary, 0.9)}, ${hsla(theme.colors.secondary, 0.9)}), url(${backgroundImage}) center/cover`
        : `linear-gradient(135deg, ${hsla(theme.colors.primary, 0.1)}, ${hsla(theme.colors.secondary, 0.1)})`,
      textAlign: layout === 'centered' ? 'center' : 'left',
      position: 'relative',
      overflow: 'hidden',
      borderTop: `1px solid ${hsla(theme.colors.primary, 0.15)}`,
      borderBottom: `1px solid ${hsla(theme.colors.primary, 0.15)}`,
    }}>
      <div style={containerStyle(theme)}>
        <h2 style={{ ...headingStyle(theme), fontSize: '2.5rem', marginBottom: '1rem' }}>{headline}</h2>
        {description && <p style={{ ...bodyStyle(theme), fontSize: '1.15rem', maxWidth: '600px', margin: layout === 'centered' ? '0 auto 2rem' : '0 0 2rem' }}>{description}</p>}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: layout === 'centered' ? 'center' : 'flex-start', flexWrap: 'wrap' }}>
          {ctas.map((cta, i) => (
            <a
              key={i}
              href={cta.href || '#'}
              data-intent={cta.intent}
              style={{
                ...(cta.variant === 'outline' || cta.variant === 'secondary' ? outlineButtonStyle(theme) : primaryButtonStyle(theme)),
                textDecoration: 'none',
              }}
            >
              {cta.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
