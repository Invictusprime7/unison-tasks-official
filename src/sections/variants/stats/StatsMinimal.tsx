/**
 * Stats Variant: Minimal
 * Compact inline stats in a single band with dividers.
 */
import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';

export const StatsMinimal: React.FC<BaseSectionProps<'stats'>> = ({ section, theme }) => {
  const { headline, items = [] } = section.props;
  return (
    <section style={{ padding: theme.sectionPadding, background: `linear-gradient(135deg, ${hsla(theme.colors.primary, 0.04)}, ${hsla(theme.colors.secondary, 0.04)})` }}>
      <div className="mx-auto px-6" style={{ maxWidth: theme.containerWidth }}>
        {headline && <h2 className="text-2xl text-center mb-8" style={{ fontFamily: theme.typography.headingFont, fontWeight: theme.typography.headingWeight, color: hsl(theme.colors.foreground) }}>{headline}</h2>}
        <div className="flex items-center justify-center flex-wrap">
          {items.map((stat, i) => (
            <React.Fragment key={i}>
              {i > 0 && <div className="mx-6 hidden md:block" style={{ width: '1px', height: '3rem', background: hsla(theme.colors.border, 0.4) }} />}
              <div className="text-center px-2 py-2">
                <div className="text-3xl font-bold" style={{ fontFamily: theme.typography.headingFont, color: hsl(theme.colors.foreground) }}>{stat.value}</div>
                <div className="text-xs uppercase tracking-wider mt-1" style={{ color: hsl(theme.colors.mutedForeground) }}>{stat.label}</div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};
