/**
 * Pricing Variant: Columns
 * Side-by-side pricing cards with highlighted tier. Default variant.
 */
import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';

export const PricingColumns: React.FC<BaseSectionProps<'pricing'>> = ({ section, theme }) => {
  const { headline, subheadline, tiers = [] } = section.props;
  return (
    <section style={{ padding: theme.sectionPadding, background: hsl(theme.colors.background) }}>
      <div className="mx-auto px-6" style={{ maxWidth: theme.containerWidth }}>
        {headline && (
          <div className="text-center mb-12">
            <h2 className="text-3xl mb-3" style={{ fontFamily: theme.typography.headingFont, fontWeight: theme.typography.headingWeight, color: hsl(theme.colors.foreground) }}>{headline}</h2>
            {subheadline && <p className="text-base max-w-lg mx-auto" style={{ color: hsl(theme.colors.mutedForeground) }}>{subheadline}</p>}
          </div>
        )}
        <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${Math.min(tiers.length, 3)}, 1fr)` }}>
          {tiers.map((tier, i) => (
            <div key={i} className="p-6 flex flex-col" style={{ background: tier.highlighted ? hsl(theme.colors.primary) : hsl(theme.colors.card), color: tier.highlighted ? hsl(theme.colors.primaryForeground) : hsl(theme.colors.cardForeground), border: `1px solid ${hsla(theme.colors.border, 0.6)}`, borderRadius: theme.radius, position: 'relative' }}>
              {tier.badge && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full" style={{ background: hsl(theme.colors.accent), color: hsl(theme.colors.accentForeground) }}>{tier.badge}</span>}
              <h3 className="text-xl font-bold mb-1" style={{ fontFamily: theme.typography.headingFont }}>{tier.name}</h3>
              {tier.description && <p className="text-sm mb-4 opacity-75">{tier.description}</p>}
              <div className="text-4xl font-bold mb-1" style={{ fontFamily: theme.typography.headingFont }}>{tier.price}<span className="text-sm font-normal opacity-60">{tier.period ? `/${tier.period}` : ''}</span></div>
              <ul className="my-6 space-y-2 flex-1">{tier.features.map((f, j) => <li key={j} className="text-sm flex items-center gap-2"><span>✓</span>{f}</li>)}</ul>
              <a href={tier.cta?.href || '#'} className="block text-center py-2.5 px-4 rounded font-medium text-sm" style={{ background: tier.highlighted ? hsl(theme.colors.background) : hsl(theme.colors.primary), color: tier.highlighted ? hsl(theme.colors.foreground) : hsl(theme.colors.primaryForeground), borderRadius: theme.radius }}>{tier.cta?.label || 'Get Started'}</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
