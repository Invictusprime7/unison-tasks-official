/**
 * Stats Variant: Highlight
 * One dominant figure anchored by supporting metrics.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { StatsFrame, StatValue, normalizeStats } from './StatsFrame';
import { hsl } from '../../themeUtils';

export const StatsHighlight: React.FC<BaseSectionProps<'stats'>> = ({ section, theme }) => {
  const items = normalizeStats(section.props.items);
  const [lead, ...rest] = items;

  return (
    <StatsFrame variantId="stats:highlight" theme={theme} headline={section.props.headline}>
      <div className="grid items-center gap-10 md:grid-cols-2">
        {lead && (
          <div
            className="p-10"
            style={{
              background: hsl(theme.colors.card),
              color: hsl(theme.colors.cardForeground),
              border: `1px solid ${hsl(theme.colors.border)}`,
              borderRadius: theme.radius,
            }}
          >
            <StatValue theme={theme} value={lead.value} emphasis />
            <span className="mt-3 block text-base" style={{ fontFamily: theme.typography.bodyFont }}>
              {lead.label}
            </span>
          </div>
        )}
        <div className="grid gap-6 sm:grid-cols-2">
          {rest.map((item, i) => (
            <div key={i} style={{ borderTop: `1px solid ${hsl(theme.colors.border)}`, paddingTop: '1rem' }}>
              <StatValue theme={theme} value={item.value} />
              <span
                className="mt-1 block text-sm"
                style={{ fontFamily: theme.typography.bodyFont, color: hsl(theme.colors.mutedForeground) }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </StatsFrame>
  );
};
