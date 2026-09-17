/**
 * Before / After Frame
 *
 * Shared chrome for every before-after variant: section shell, optional
 * headline block and pair normalization. Variants supply only the arrangement.
 */

import React from 'react';
import type { ThemeTokens } from '../../types';
import { hsl } from '../../themeUtils';

export interface TransformationPair {
  before: string;
  after: string;
  label?: string;
  description?: string;
}

export const normalizePairs = (items: unknown): TransformationPair[] => {
  if (!Array.isArray(items)) return [];
  return items
    .map((raw) => {
      const entry = (raw || {}) as Record<string, unknown>;
      const before = String(entry.before ?? entry.beforeImage ?? '').trim();
      const after = String(entry.after ?? entry.afterImage ?? '').trim();
      if (!before && !after) return null;
      return {
        before,
        after,
        label: entry.label ? String(entry.label) : entry.title ? String(entry.title) : undefined,
        description: entry.description ? String(entry.description) : undefined,
      } as TransformationPair;
    })
    .filter(Boolean) as TransformationPair[];
};

export const StageTag: React.FC<{ theme: ThemeTokens; tone: 'before' | 'after'; children: React.ReactNode }> = ({
  theme,
  tone,
  children,
}) => (
  <span
    style={{
      position: 'absolute',
      top: '0.75rem',
      left: '0.75rem',
      padding: '0.25rem 0.625rem',
      borderRadius: '999px',
      fontFamily: theme.typography.bodyFont,
      fontSize: '0.6875rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      background: tone === 'after' ? hsl(theme.colors.primary) : hsl(theme.colors.foreground),
      color: tone === 'after' ? hsl(theme.colors.primaryForeground) : hsl(theme.colors.background),
    }}
  >
    {children}
  </span>
);

export const BeforeAfterFrame: React.FC<{
  variantId: string;
  theme: ThemeTokens;
  headline?: string;
  subheadline?: string;
  surface?: 'background' | 'muted';
  children: React.ReactNode;
}> = ({ variantId, theme, headline, subheadline, surface = 'muted', children }) => (
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
              className="mx-auto max-w-2xl text-lg"
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
