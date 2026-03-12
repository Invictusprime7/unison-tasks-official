import React from 'react';
import type { BaseSectionProps } from '../types';
import { hsl, hsla, containerStyle, sectionStyle, headingStyle, bodyStyle } from '../themeUtils';

export const StatsSection: React.FC<BaseSectionProps<'stats'>> = ({ section, theme }) => {
  const { headline, items, layout = 'row' } = section.props;

  return (
    <section style={{
      ...sectionStyle(theme),
      background: `linear-gradient(135deg, ${hsla(theme.colors.primary, 0.05)}, ${hsla(theme.colors.secondary, 0.05)})`,
      borderTop: `1px solid ${hsla(theme.colors.border, 0.5)}`,
      borderBottom: `1px solid ${hsla(theme.colors.border, 0.5)}`,
    }}>
      <div style={containerStyle(theme)}>
        {headline && <h2 style={{ ...headingStyle(theme), fontSize: '2rem', textAlign: 'center', marginBottom: '3rem' }}>{headline}</h2>}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '4rem', flexWrap: 'wrap',
        }}>
          {items.map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ ...headingStyle(theme), fontSize: '3rem', color: hsl(theme.colors.primary), lineHeight: 1 }}>
                {stat.value}
              </div>
              <div style={{ ...bodyStyle(theme), fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.5rem' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
