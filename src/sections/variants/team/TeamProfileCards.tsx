import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl } from '../../themeUtils';
import { TeamFrame, MemberPortrait, MemberIdentity, normalizeMembers } from './TeamFrame';
/** Original implementation informed by 21st:8757 portrait-card composition. */
export const TeamProfileCards: React.FC<BaseSectionProps<'team'>> = ({section,theme}) => <TeamFrame variantId="team:profile-cards" theme={theme} headline={section.props.headline} subheadline={section.props.subheadline}>
 <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{normalizeMembers(section.props.members).map((member,i)=><article key={i} className="group overflow-hidden border p-3" style={{borderRadius:theme.radius,borderColor:hsl(theme.colors.border),background:hsl(theme.colors.card)}}>
 <div className="overflow-hidden" style={{borderRadius:theme.radius}}><div className="transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"><MemberPortrait member={member} theme={theme} ratio="4 / 5"/></div></div>
 <div className="px-2 pb-3"><MemberIdentity member={member} theme={theme}/>{member.bio && <p className="mt-3 text-sm" style={{color:hsl(theme.colors.mutedForeground)}}>{member.bio}</p>}</div>
 </article>)}</div></TeamFrame>;
