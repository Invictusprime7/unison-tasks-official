/**
 * Team Variant: Compact
 * Compact avatar-list layout, great for larger teams.
 */
import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';

export const TeamCompact: React.FC<BaseSectionProps<'team'>> = ({ section, theme }) => {
  const { headline, subheadline, members = [] } = section.props;
  return (
    <section style={{ padding: theme.sectionPadding, background: hsl(theme.colors.muted) }}>
      <div className="mx-auto px-6" style={{ maxWidth: '52rem' }}>
        {headline && (
          <div className="text-center mb-10">
            <h2 className="text-3xl mb-3" style={{ fontFamily: theme.typography.headingFont, fontWeight: theme.typography.headingWeight, color: hsl(theme.colors.foreground) }}>{headline}</h2>
            {subheadline && <p className="text-base max-w-lg mx-auto" style={{ color: hsl(theme.colors.mutedForeground) }}>{subheadline}</p>}
          </div>
        )}
        <div className="space-y-3">
          {members.map((member, i) => (
            <div key={i} className="flex items-center gap-4 p-4" style={{ background: hsl(theme.colors.card), border: `1px solid ${hsla(theme.colors.border, 0.4)}`, borderRadius: theme.radius }}>
              {member.image ? (
                <img src={member.image} alt={member.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-base font-bold" style={{ background: hsla(theme.colors.primary, 0.1), color: hsl(theme.colors.primary) }}>{member.name?.[0]}</div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold" style={{ color: hsl(theme.colors.cardForeground) }}>{member.name}</h3>
                <p className="text-sm" style={{ color: hsl(theme.colors.mutedForeground) }}>{member.role}</p>
              </div>
              {member.socials?.length ? (
                <div className="flex gap-2">
                  {member.socials.map((s, j) => (
                    <a key={j} href={s.url} className="text-xs px-2 py-1 rounded" style={{ background: hsla(theme.colors.primary, 0.08), color: hsl(theme.colors.primary), textDecoration: 'none' }}>{s.platform}</a>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
