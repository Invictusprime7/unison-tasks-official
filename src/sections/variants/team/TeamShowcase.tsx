/**
 * Team Variant: Showcase
 * Large featured team member with supporting smaller entries.
 */
import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';

export const TeamShowcase: React.FC<BaseSectionProps<'team'>> = ({ section, theme }) => {
  const { headline, subheadline, members = [] } = section.props;
  const featured = members[0];
  const rest = members.slice(1);
  return (
    <section style={{ padding: theme.sectionPadding, background: hsl(theme.colors.background) }}>
      <div className="mx-auto px-6" style={{ maxWidth: theme.containerWidth }}>
        {headline && (
          <div className="text-center mb-12">
            <h2 className="text-3xl mb-3" style={{ fontFamily: theme.typography.headingFont, fontWeight: theme.typography.headingWeight, color: hsl(theme.colors.foreground) }}>{headline}</h2>
            {subheadline && <p className="text-base max-w-lg mx-auto" style={{ color: hsl(theme.colors.mutedForeground) }}>{subheadline}</p>}
          </div>
        )}
        {featured && (
          <div className="grid gap-8 mb-10" style={{ gridTemplateColumns: '1fr 1fr', alignItems: 'center' }}>
            {featured.image ? (
              <img src={featured.image} alt={featured.name} className="w-full aspect-square object-cover" style={{ borderRadius: theme.radius }} />
            ) : (
              <div className="w-full aspect-square flex items-center justify-center text-6xl font-bold" style={{ borderRadius: theme.radius, background: hsla(theme.colors.primary, 0.08), color: hsl(theme.colors.primary) }}>{featured.name?.[0]}</div>
            )}
            <div>
              <h3 className="text-2xl font-bold mb-1" style={{ fontFamily: theme.typography.headingFont, color: hsl(theme.colors.foreground) }}>{featured.name}</h3>
              <p className="text-base mb-3" style={{ color: hsl(theme.colors.primary) }}>{featured.role}</p>
              {featured.bio && <p className="text-base leading-relaxed" style={{ color: hsl(theme.colors.mutedForeground) }}>{featured.bio}</p>}
            </div>
          </div>
        )}
        {rest.length > 0 && (
          <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${Math.min(rest.length, 4)}, 1fr)` }}>
            {rest.map((member, i) => (
              <div key={i} className="text-center">
                {member.image ? (
                  <img src={member.image} alt={member.name} className="w-16 h-16 rounded-full object-cover mx-auto mb-3" />
                ) : (
                  <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-lg font-bold" style={{ background: hsla(theme.colors.primary, 0.1), color: hsl(theme.colors.primary) }}>{member.name?.[0]}</div>
                )}
                <h4 className="text-sm font-semibold" style={{ color: hsl(theme.colors.foreground) }}>{member.name}</h4>
                <p className="text-xs" style={{ color: hsl(theme.colors.mutedForeground) }}>{member.role}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
