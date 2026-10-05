/**
 * Team Variant: Portrait Grid
 * Editorial portrait grid with name/role captions.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { MemberIdentity, MemberPortrait, TeamFrame, normalizeMembers } from './TeamFrame';

export const TeamPortraitGrid: React.FC<BaseSectionProps<'team'>> = ({ section, theme }) => {
  const members = normalizeMembers(section.props.members);
  const cols = (section.props.columns ?? (members.length >= 4 ? 4 : 3)) >= 4 ? 'md:grid-cols-4' : 'md:grid-cols-3';

  return (
    <TeamFrame
      variantId="team:portrait-grid"
      theme={theme}
      headline={section.props.headline}
      subheadline={section.props.subheadline}
    >
      <div className={`grid gap-8 sm:grid-cols-2 ${cols}`}>
        {members.map((member, i) => (
          <div key={i}>
            <MemberPortrait member={member} theme={theme} />
            <MemberIdentity member={member} theme={theme} />
          </div>
        ))}
      </div>
    </TeamFrame>
  );
};
