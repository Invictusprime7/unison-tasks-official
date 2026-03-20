/**
 * Pricing Variant: Minimal
 * Clean, minimal pricing with simple cards and no visual clutter.
 */
import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';

export const PricingMinimal: React.FC<BaseSectionProps<'pricing'>> = ({ section, theme }) => {
  const { headline, subheadline, tiers = [] } = section.props;
  return (
    <section style={{ padding: theme.sectionPadding, background: hsl(theme.colors.background) }}>
      <div className="mx-auto px-6" style={{ maxWidth: '52rem' }}>
        {headline && (
          <div className="text-center mb-14">
            <h2 className="text-3xl mb-3" style={{ fontFamily: theme.typography.headingFont, fontWeight: theme.typography.headingWeight, color: hsl(theme.colors.foreground) }}>{headline}</h2>
            {subheadline && <p className="text-base max-w-lg mx-auto" style={{ color: hsl(theme.colors.mutedForeground) }}>{subheadline}</p>}
          </div>
        )}
        <div className="space-y-4">
          {tiers.map((tier, i) => (
            <div key={i} className="flex items-center justify-between p-5" style={{ border: `1px solid ${tier.highlighted ? hsl(theme.colors.primary) : hsla(theme.colors.border, 0.5)}`, borderRadius: theme.radius, background: tier.highlighted ? hsla(theme.colors.primary, 0.03) : 'transparent' }}>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-bold" style={{ fontFamily: theme.typography.headingFont, color: hsl(theme.colors.foreground) }}>{tier.name}</h3>
                  {tier.badge && <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: hsla(theme.colors.primary, 0.1), color: hsl(theme.colors.primary) }}>{tier.badge}</span>}
                </div>
                <p className="text-sm" style={{ color: hsl(theme.colors.mutedForeground) }}>{tier.features.slice(0, 3).join(' · ')}</p>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-2xl font-bold" style={{ fontFamily: theme.typography.headingFont, color: hsl(theme.colors.foreground) }}>{tier.price}<span className="text-sm font-normal opacity-60">{tier.period ? `/${tier.period}` : ''}</span></span>
                <a href={tier.cta?.href || '#'} className="py-2 px-5 rounded text-sm font-medium" style={{ background: tier.highlighted ? hsl(theme.colors.primary) : 'transparent', color: tier.highlighted ? hsl(theme.colors.primaryForeground) : hsl(theme.colors.primary), border: `1px solid ${hsl(theme.colors.primary)}`, borderRadius: theme.radius, textDecoration: 'none' }}>{tier.cta?.label || 'Select'}</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
