/**
 * Stats Variant: Cards
 * Stat items rendered as individual cards in a grid.
 */
import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';

export const StatsCards: React.FC<BaseSectionProps<'stats'>> = ({ section, theme }) => {
  const { headline, items = [] } = section.props;
  return (
    <section style={{ padding: theme.sectionPadding, background: hsl(theme.colors.muted) }}>
      <div className="mx-auto px-6" style={{ maxWidth: theme.containerWidth }}>
        {headline && <h2 className="text-3xl text-center mb-10" style={{ fontFamily: theme.typography.headingFont, fontWeight: theme.typography.headingWeight, color: hsl(theme.colors.foreground) }}>{headline}</h2>}
        <div className="grid gap-5" style={{ gridTemplateColumns: `repeat(${Math.min(items.length, 4)}, 1fr)` }}>
          {items.map((stat, i) => (
            <div key={i} className="p-6 text-center" style={{ background: hsl(theme.colors.card), border: `1px solid ${hsla(theme.colors.border, 0.5)}`, borderRadius: theme.radius }}>
              {stat.icon && <span className="text-3xl block mb-3">{stat.icon}</span>}
              <div className="text-3xl font-bold mb-1" style={{ fontFamily: theme.typography.headingFont, color: hsl(theme.colors.primary) }}>{stat.value}</div>
              <div className="text-sm" style={{ color: hsl(theme.colors.mutedForeground) }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
