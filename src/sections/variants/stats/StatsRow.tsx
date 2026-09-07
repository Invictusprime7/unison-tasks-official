/**
 * Stats Variant: Row
 * A single measured row of proof figures separated by hairlines.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { StatsFrame, StatValue, normalizeStats } from './StatsFrame';
import { hsl } from '../../themeUtils';

export const StatsRow: React.FC<BaseSectionProps<'stats'>> = ({ section, theme }) => {
  const items = normalizeStats(section.props.items);

  return (
    <StatsFrame variantId="stats:row" theme={theme} headline={section.props.headline}>
      <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
        {items.map((item, i) => (
          <div
            key={i}
            className="px-4 text-center"
            style={{ borderLeft: i === 0 ? 'none' : `1px solid ${hsl(theme.colors.border)}` }}
          >
            <StatValue theme={theme} value={item.value} />
            <span
              className="mt-2 block text-sm"
              style={{ fontFamily: theme.typography.bodyFont, color: hsl(theme.colors.mutedForeground) }}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </StatsFrame>
  );
};
