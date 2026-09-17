/**
 * Logo Cloud Frame
 *
 * Shared chrome for every logo-cloud variant: section shell, optional headline
 * and logo normalization. Variants supply only the arrangement.
 *
 * Phase 3 — `logo-cloud` is a first-class semantic family. It no longer renders
 * through the stats placeholder, and every variant here is portable-recipe
 * certified so Preview, canonical VFS and published runtime agree.
 */

import React from 'react';
import type { ThemeTokens } from '../../types';
import { hsl } from '../../themeUtils';

export interface LogoEntry {
  name: string;
  src?: string;
}

export const normalizeLogos = (logos: unknown, items?: unknown): LogoEntry[] => {
  const source = Array.isArray(logos) && logos.length ? logos : Array.isArray(items) ? items : [];
  return source
    .map((raw) => {
      if (typeof raw === 'string') return raw.trim() ? { name: raw.trim() } : null;
      const entry = (raw || {}) as Record<string, unknown>;
      const name = String(entry.name ?? entry.label ?? entry.title ?? '').trim();
      const src = entry.src ? String(entry.src) : entry.image ? String(entry.image) : undefined;
      if (!name && !src) return null;
      return { name, src };
    })
    .filter(Boolean) as LogoEntry[];
};

export const LogoMark: React.FC<{ theme: ThemeTokens; logo: LogoEntry; height?: string }> = ({
  theme,
  logo,
  height = '2rem',
}) =>
  logo.src ? (
    <img
      src={logo.src}
      alt={logo.name || ''}
      loading="lazy"
      style={{ height, width: 'auto', objectFit: 'contain' }}
    />
  ) : (
    <span
      style={{
        fontFamily: theme.typography.headingFont,
        fontWeight: theme.typography.headingWeight,
        fontSize: '1.125rem',
        letterSpacing: '0.02em',
        color: hsl(theme.colors.mutedForeground),
      }}
    >
      {logo.name}
    </span>
  );

export const LogoCloudFrame: React.FC<{
  variantId: string;
  theme: ThemeTokens;
  headline?: string;
  surface?: 'background' | 'muted';
  children: React.ReactNode;
}> = ({ variantId, theme, headline, surface = 'muted', children }) => (
  <section
    data-ut-variant={variantId}
    style={{
      padding: theme.sectionPadding,
      background: hsl(surface === 'muted' ? theme.colors.muted : theme.colors.background),
      borderTop: `1px solid ${hsl(theme.colors.border)}`,
      borderBottom: `1px solid ${hsl(theme.colors.border)}`,
    }}
  >
    <div className="mx-auto px-6" style={{ maxWidth: theme.containerWidth }}>
      {headline && (
        <p
          className="mb-10 text-center text-xs uppercase"
          style={{
            fontFamily: theme.typography.bodyFont,
            letterSpacing: '0.18em',
            color: hsl(theme.colors.mutedForeground),
          }}
        >
          {headline}
        </p>
      )}
      {children}
    </div>
  </section>
);
