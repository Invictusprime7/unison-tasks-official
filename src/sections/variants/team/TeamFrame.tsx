/**
 * Team Frame
 *
 * Shared chrome for every team variant: section shell, editorial intro,
 * member normalization and the canonical portrait. Variants supply arrangement.
 */

import React from 'react';
import type { ThemeTokens, TeamMember } from '../../types';
import { hsl } from '../../themeUtils';

export const normalizeMembers = (members: unknown): TeamMember[] => {
  if (!Array.isArray(members)) return [];
  return members
    .map((raw) => {
      const item = (raw || {}) as Record<string, unknown>;
      const name = String(item.name ?? '').trim();
      if (!name) return null;
      return {
        name,
        role: String(item.role ?? item.title ?? '').trim(),
        bio: item.bio ? String(item.bio) : undefined,
        image: item.image ? String(item.image) : item.avatar ? String(item.avatar) : undefined,
      } as TeamMember;
    })
    .filter(Boolean) as TeamMember[];
};

export const MemberPortrait: React.FC<{
  member: TeamMember;
  theme: ThemeTokens;
  ratio?: string;
  rounded?: boolean;
}> = ({ member, theme, ratio = '3 / 4', rounded }) =>
  member.image ? (
    <img
      src={member.image}
      alt={member.name}
      loading="lazy"
      className="w-full object-cover"
      style={{ aspectRatio: ratio, borderRadius: rounded ? '9999px' : theme.radius }}
    />
  ) : (
    <div
      className="w-full"
      style={{
        aspectRatio: ratio,
        borderRadius: rounded ? '9999px' : theme.radius,
        background: hsl(theme.colors.muted),
        border: `1px solid ${hsl(theme.colors.border)}`,
      }}
    />
  );

export const MemberIdentity: React.FC<{ member: TeamMember; theme: ThemeTokens; align?: 'start' | 'center' }> = ({
  member,
  theme,
  align = 'start',
}) => (
  <div className={align === 'center' ? 'text-center' : ''}>
    <span
      className="mt-4 block text-base font-semibold"
      style={{ fontFamily: theme.typography.headingFont, color: hsl(theme.colors.foreground) }}
    >
      {member.name}
    </span>
    {member.role && (
      <span
        className="mt-1 block text-sm"
        style={{ fontFamily: theme.typography.bodyFont, color: hsl(theme.colors.mutedForeground) }}
      >
        {member.role}
      </span>
    )}
  </div>
);

export const TeamFrame: React.FC<{
  variantId: string;
  theme: ThemeTokens;
  headline?: string;
  subheadline?: string;
  surface?: 'background' | 'muted';
  children: React.ReactNode;
}> = ({ variantId, theme, headline, subheadline, surface = 'background', children }) => (
  <section
    data-ut-variant={variantId}
    style={{
      padding: theme.sectionPadding,
      background: hsl(surface === 'muted' ? theme.colors.muted : theme.colors.background),
    }}
  >
    <div className="mx-auto px-6" style={{ maxWidth: theme.containerWidth }}>
      {(headline || subheadline) && (
        <div className="mb-12 text-center">
          {headline && (
            <h2
              className="mb-3 text-3xl"
              style={{
                fontFamily: theme.typography.headingFont,
                fontWeight: theme.typography.headingWeight,
                color: hsl(theme.colors.foreground),
              }}
            >
              {headline}
            </h2>
          )}
          {subheadline && (
            <p
              className="mx-auto max-w-2xl text-base"
              style={{ fontFamily: theme.typography.bodyFont, color: hsl(theme.colors.mutedForeground) }}
            >
              {subheadline}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  </section>
);
