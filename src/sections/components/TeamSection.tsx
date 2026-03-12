import React from 'react';
import type { BaseSectionProps } from '../types';
import { hsl, hsla, containerStyle, sectionStyle, headingStyle, bodyStyle, cardStyle } from '../themeUtils';

export const TeamSection: React.FC<BaseSectionProps<'team'>> = ({ section, theme }) => {
  const { headline, subheadline, members, columns = 3 } = section.props;

  return (
    <section style={{ ...sectionStyle(theme), background: hsl(theme.colors.background) }}>
      <div style={containerStyle(theme)}>
        {(headline || subheadline) && (
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            {headline && <h2 style={{ ...headingStyle(theme), fontSize: '2.25rem', marginBottom: '1rem' }}>{headline}</h2>}
            {subheadline && <p style={{ ...bodyStyle(theme), fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>{subheadline}</p>}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: '2rem' }}>
          {members.map((member, i) => (
            <div key={i} style={{ ...cardStyle(theme), textAlign: 'center', padding: '2rem' }}>
              {member.image && (
                <img src={member.image} alt={member.name} style={{ width: '6rem', height: '6rem', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 1rem', border: `3px solid ${hsla(theme.colors.primary, 0.2)}` }} />
              )}
              <h3 style={{ ...headingStyle(theme), fontSize: '1.1rem', marginBottom: '0.25rem' }}>{member.name}</h3>
              <p style={{ ...bodyStyle(theme), fontSize: '0.85rem', color: hsl(theme.colors.primary), marginBottom: '0.5rem' }}>{member.role}</p>
              {member.bio && <p style={{ ...bodyStyle(theme), fontSize: '0.85rem', lineHeight: 1.6 }}>{member.bio}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
