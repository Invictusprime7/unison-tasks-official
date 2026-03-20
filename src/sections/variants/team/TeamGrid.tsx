/**
 * Team Variant: Grid
 * Photo card grid showing team members with roles and bios. Default variant.
 */
import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';

export const TeamGrid: React.FC<BaseSectionProps<'team'>> = ({ section, theme }) => {
  const { headline, subheadline, members = [], columns = 3 } = section.props;
  return (
    <section style={{ padding: theme.sectionPadding, background: hsl(theme.colors.background) }}>
      <div className="mx-auto px-6" style={{ maxWidth: theme.containerWidth }}>
        {headline && (
          <div className="text-center mb-12">
            <h2 className="text-3xl mb-3" style={{ fontFamily: theme.typography.headingFont, fontWeight: theme.typography.headingWeight, color: hsl(theme.colors.foreground) }}>{headline}</h2>
            {subheadline && <p className="text-base max-w-lg mx-auto" style={{ color: hsl(theme.colors.mutedForeground) }}>{subheadline}</p>}
          </div>
        )}
        <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {members.map((member, i) => (
            <div key={i} className="text-center p-6" style={{ background: hsl(theme.colors.card), border: `1px solid ${hsla(theme.colors.border, 0.5)}`, borderRadius: theme.radius }}>
              {member.image ? (
                <img src={member.image} alt={member.name} className="w-24 h-24 rounded-full object-cover mx-auto mb-4" />
              ) : (
                <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold" style={{ background: hsla(theme.colors.primary, 0.1), color: hsl(theme.colors.primary) }}>{member.name?.[0]}</div>
              )}
              <h3 className="text-lg font-bold mb-1" style={{ fontFamily: theme.typography.headingFont, color: hsl(theme.colors.cardForeground) }}>{member.name}</h3>
              <p className="text-sm mb-2" style={{ color: hsl(theme.colors.primary) }}>{member.role}</p>
              {member.bio && <p className="text-sm leading-relaxed" style={{ color: hsl(theme.colors.mutedForeground) }}>{member.bio}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
