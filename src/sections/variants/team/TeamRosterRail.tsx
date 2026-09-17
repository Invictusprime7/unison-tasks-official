/**
 * Team Variant: Roster Rail
 * Horizontal snap rail of circular portraits — compact for large rosters.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { MemberIdentity, MemberPortrait, TeamFrame, normalizeMembers } from './TeamFrame';

export const TeamRosterRail: React.FC<BaseSectionProps<'team'>> = ({ section, theme }) => {
  const members = normalizeMembers(section.props.members);

  return (
    <TeamFrame
      variantId="team:roster-rail"
      theme={theme}
      headline={section.props.headline}
      subheadline={section.props.subheadline}
      surface="muted"
    >
      <div className="flex snap-x snap-mandatory gap-8 overflow-x-auto pb-4" role="group" aria-label="Team members">
        {members.map((member, i) => (
          <div key={i} className="w-56 shrink-0 snap-start">
            <MemberPortrait member={member} theme={theme} ratio="1 / 1" rounded />
            <MemberIdentity member={member} theme={theme} align="center" />
          </div>
        ))}
      </div>
    </TeamFrame>
  );
};
