/**
 * Stats Variant: Banded Grid
 * Proof figures held in tinted cards on a contrasting band.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { StatsFrame, StatValue, normalizeStats } from './StatsFrame';
import { hsl } from '../../themeUtils';

export const StatsBandedGrid: React.FC<BaseSectionProps<'stats'>> = ({ section, theme }) => {
  const items = normalizeStats(section.props.items);
  const cols = items.length >= 4 ? 'md:grid-cols-4' : 'md:grid-cols-3';

  return (
    <StatsFrame variantId="stats:banded-grid" theme={theme} headline={section.props.headline} surface="muted">
      <div className={`grid gap-6 sm:grid-cols-2 ${cols}`}>
        {items.map((item, i) => (
          <div
            key={i}
            className="p-8 text-center"
            style={{
              background: hsl(theme.colors.card),
              color: hsl(theme.colors.cardForeground),
              border: `1px solid ${hsl(theme.colors.border)}`,
              borderRadius: theme.radius,
            }}
          >
            <StatValue theme={theme} value={item.value} />
            <span className="mt-2 block text-sm" style={{ fontFamily: theme.typography.bodyFont }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </StatsFrame>
  );
};
