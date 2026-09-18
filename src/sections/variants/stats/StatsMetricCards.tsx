/**
 * Stats Variant: Metric Cards
 *
 * Bordered metric tiles with an accent rule and optional icon glyph.
 *
 * Adapted from 21st.dev "Stats Band" (21st:1195). The lucide-react icon import
 * is replaced by the theme-safe glyph the StatItem contract already carries.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';
import { StatsFrame, StatValue, normalizeStats } from './StatsFrame';

export const StatsMetricCards: React.FC<BaseSectionProps<'stats'>> = ({ section, theme }) => {
  const { headline, items } = section.props;
  const stats = normalizeStats(items);
  if (!stats.length) return null;

  return (
    <StatsFrame variantId="stats:metric-cards" theme={theme} headline={headline} surface="background">
      <div
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat, i) => (
          <div
            key={i}
            data-ut-slot={`stat-${i + 1}`}
            className="relative overflow-hidden p-7 transition-transform duration-300 hover:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none"
            style={{
              background: hsl(theme.colors.card),
              border: `1px solid ${hsla(theme.colors.border, 0.7)}`,
              borderRadius: theme.radius,
            }}
          >
            <span
              aria-hidden="true"
              className="absolute left-0 top-0 h-full w-1"
              style={{ background: hsla(theme.colors.primary, 0.75) }}
            />
            {stat.icon && (
              <span className="mb-3 block text-xl" aria-hidden="true">
                {stat.icon}
              </span>
            )}
            <StatValue theme={theme} value={stat.value} />
            <span
              className="mt-2 block text-sm"
              style={{ fontFamily: theme.typography.bodyFont, color: hsl(theme.colors.mutedForeground) }}
            >
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </StatsFrame>
  );
};
