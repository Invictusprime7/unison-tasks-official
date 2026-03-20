/**
 * Pricing Variant: Table
 * Comparison table layout with feature checkmarks across tiers.
 */
import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';

export const PricingTable: React.FC<BaseSectionProps<'pricing'>> = ({ section, theme }) => {
  const { headline, subheadline, tiers = [] } = section.props;
  return (
    <section style={{ padding: theme.sectionPadding, background: hsl(theme.colors.muted) }}>
      <div className="mx-auto px-6" style={{ maxWidth: theme.containerWidth }}>
        {headline && (
          <div className="text-center mb-12">
            <h2 className="text-3xl mb-3" style={{ fontFamily: theme.typography.headingFont, fontWeight: theme.typography.headingWeight, color: hsl(theme.colors.foreground) }}>{headline}</h2>
            {subheadline && <p className="text-base max-w-lg mx-auto" style={{ color: hsl(theme.colors.mutedForeground) }}>{subheadline}</p>}
          </div>
        )}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: hsl(theme.colors.card), borderRadius: theme.radius, overflow: 'hidden' }}>
            <thead>
              <tr>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', borderBottom: `1px solid ${hsla(theme.colors.border, 0.5)}`, fontFamily: theme.typography.headingFont, color: hsl(theme.colors.cardForeground) }}>Feature</th>
                {tiers.map((tier, i) => (
                  <th key={i} style={{ padding: '1rem 1.5rem', textAlign: 'center', borderBottom: `1px solid ${hsla(theme.colors.border, 0.5)}`, background: tier.highlighted ? hsla(theme.colors.primary, 0.05) : 'transparent', fontFamily: theme.typography.headingFont, color: hsl(theme.colors.cardForeground) }}>
                    <div className="font-bold text-lg">{tier.name}</div>
                    <div className="text-2xl font-bold mt-1" style={{ color: hsl(theme.colors.primary) }}>{tier.price}<span className="text-sm font-normal opacity-60">{tier.period ? `/${tier.period}` : ''}</span></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(() => {
                const allFeatures = [...new Set(tiers.flatMap(t => t.features))];
                return allFeatures.map((feature, fi) => (
                  <tr key={fi} style={{ borderBottom: `1px solid ${hsla(theme.colors.border, 0.3)}` }}>
                    <td style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem', color: hsl(theme.colors.cardForeground) }}>{feature}</td>
                    {tiers.map((tier, ti) => (
                      <td key={ti} style={{ padding: '0.75rem 1.5rem', textAlign: 'center', background: tier.highlighted ? hsla(theme.colors.primary, 0.03) : 'transparent' }}>
                        <span style={{ color: tier.features.includes(feature) ? hsl(theme.colors.primary) : hsl(theme.colors.mutedForeground) }}>{tier.features.includes(feature) ? '✓' : '—'}</span>
                      </td>
                    ))}
                  </tr>
                ));
              })()}
            </tbody>
            <tfoot>
              <tr>
                <td style={{ padding: '1rem 1.5rem' }}></td>
                {tiers.map((tier, i) => (
                  <td key={i} style={{ padding: '1rem 1.5rem', textAlign: 'center', background: tier.highlighted ? hsla(theme.colors.primary, 0.05) : 'transparent' }}>
                    <a href={tier.cta?.href || '#'} className="inline-block py-2 px-6 rounded font-medium text-sm" style={{ background: hsl(theme.colors.primary), color: hsl(theme.colors.primaryForeground), borderRadius: theme.radius, textDecoration: 'none' }}>{tier.cta?.label || 'Choose'}</a>
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </section>
  );
};
