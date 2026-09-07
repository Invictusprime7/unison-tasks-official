/**
 * Team Variant: Lead Spotlight
 * One founder/lead given a full bio panel, the rest as a supporting strip.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { MemberIdentity, MemberPortrait, TeamFrame, normalizeMembers } from './TeamFrame';
import { hsl } from '../../themeUtils';

export const TeamLeadSpotlight: React.FC<BaseSectionProps<'team'>> = ({ section, theme }) => {
  const members = normalizeMembers(section.props.members);
  const [lead, ...rest] = members;

  return (
    <TeamFrame
      variantId="team:lead-spotlight"
      theme={theme}
      headline={section.props.headline}
      subheadline={section.props.subheadline}
    >
      {lead && (
        <div className="mb-12 grid items-center gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <MemberPortrait member={lead} theme={theme} ratio="4 / 5" />
          </div>
          <div className="md:col-span-7">
            <MemberIdentity member={lead} theme={theme} />
            {lead.bio && (
              <p
                className="mt-4 text-base leading-relaxed"
                style={{ fontFamily: theme.typography.bodyFont, color: hsl(theme.colors.mutedForeground) }}
              >
                {lead.bio}
              </p>
            )}
          </div>
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
        {rest.map((member, i) => (
          <div key={i}>
            <MemberPortrait member={member} theme={theme} ratio="1 / 1" />
            <MemberIdentity member={member} theme={theme} />
          </div>
        ))}
      </div>
    </TeamFrame>
  );
};
