/**
 * Stats Frame
 *
 * Shared chrome for every stats variant: section shell, optional headline and
 * item normalization. Variants supply only the arrangement.
 */

import React from 'react';
import type { ThemeTokens, StatItem } from '../../types';
import { hsl } from '../../themeUtils';

export const normalizeStats = (items: unknown): StatItem[] => {
  if (!Array.isArray(items)) return [];
  return items
    .map((raw) => {
      const item = (raw || {}) as Record<string, unknown>;
      const value = String(item.value ?? item.number ?? '').trim();
      const label = String(item.label ?? item.title ?? '').trim();
      if (!value && !label) return null;
      return { value, label, icon: item.icon ? String(item.icon) : undefined } as StatItem;
    })
    .filter(Boolean) as StatItem[];
};

export const StatValue: React.FC<{ theme: ThemeTokens; value: string; emphasis?: boolean }> = ({
  theme,
  value,
  emphasis,
}) => (
  <span
    className={emphasis ? 'block text-5xl' : 'block text-4xl'}
    style={{
      fontFamily: theme.typography.headingFont,
      fontWeight: theme.typography.headingWeight,
      color: hsl(theme.colors.primary),
    }}
  >
    {value}
  </span>
);

export const StatsFrame: React.FC<{
  variantId: string;
  theme: ThemeTokens;
  headline?: string;
  surface?: 'background' | 'muted' | 'primary';
  children: React.ReactNode;
}> = ({ variantId, theme, headline, surface = 'background', children }) => (
  <section
    data-ut-variant={variantId}
    style={{
      padding: theme.sectionPadding,
      background: hsl(
        surface === 'muted' ? theme.colors.muted : surface === 'primary' ? theme.colors.secondary : theme.colors.background,
      ),
    }}
  >
    <div className="mx-auto px-6" style={{ maxWidth: theme.containerWidth }}>
      {headline && (
        <h2
          className="mb-10 text-center text-3xl"
          style={{
            fontFamily: theme.typography.headingFont,
            fontWeight: theme.typography.headingWeight,
            color: hsl(theme.colors.foreground),
          }}
        >
          {headline}
        </h2>
      )}
      {children}
    </div>
  </section>
);
