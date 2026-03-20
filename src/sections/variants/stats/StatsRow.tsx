/**
 * Stats Variant: Row
 * Horizontal row of stat counters. Default variant.
 */
import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';

export const StatsRow: React.FC<BaseSectionProps<'stats'>> = ({ section, theme }) => {
  const { headline, items = [] } = section.props;
  return (
    <section style={{ padding: theme.sectionPadding, background: hsl(theme.colors.background) }}>
      <div className="mx-auto px-6" style={{ maxWidth: theme.containerWidth }}>
        {headline && <h2 className="text-3xl text-center mb-10" style={{ fontFamily: theme.typography.headingFont, fontWeight: theme.typography.headingWeight, color: hsl(theme.colors.foreground) }}>{headline}</h2>}
        <div className="flex items-center justify-center flex-wrap" style={{ gap: '3rem' }}>
          {items.map((stat, i) => (
            <div key={i} className="text-center px-4">
              {stat.icon && <span className="text-2xl block mb-2">{stat.icon}</span>}
              <div className="text-4xl font-bold mb-1" style={{ fontFamily: theme.typography.headingFont, color: hsl(theme.colors.primary) }}>{stat.value}</div>
              <div className="text-sm" style={{ color: hsl(theme.colors.mutedForeground) }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
