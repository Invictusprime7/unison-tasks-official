/**
 * Pricing Variant: Feature Table
 *
 * Side-by-side plan columns over a shared feature checklist, with the
 * highlighted tier lifted by an accent border and badge.
 *
 * Adapted from 21st.dev "Pricing Table" (21st:8374). The lucide-react check
 * icon is replaced with an inline SVG so generated sites carry no vendor deps.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';
import { PricingFrame, PricingCTA, normalizePricingTiers } from './PricingFrame';

const Check: React.FC<{ color: string }> = ({ color }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 20 20"
    className="mt-0.5 h-4 w-4 shrink-0"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 10.5l4 4 8-9" />
  </svg>
);

export const PricingFeatureTable: React.FC<BaseSectionProps<'pricing'>> = ({ section, theme }) => {
  const { headline, subheadline, tiers } = section.props;
  const plans = normalizePricingTiers(tiers);
  if (!plans.length) return null;

  return (
    <PricingFrame variantId="pricing:feature-table" theme={theme} headline={headline} subheadline={subheadline}>
      <div
        className="grid gap-6"
        style={{ gridTemplateColumns: `repeat(${Math.min(plans.length, 3)}, minmax(0, 1fr))` }}
      >
        {plans.map((tier, i) => (
          <div
            key={i}
            data-ut-slot={`plan-${i + 1}`}
            className="flex h-full flex-col p-8"
            style={{
              background: hsl(theme.colors.card),
              color: hsl(theme.colors.cardForeground),
              border: `1px solid ${tier.highlighted ? hsl(theme.colors.primary) : hsla(theme.colors.border, 0.7)}`,
              borderRadius: theme.radius,
              boxShadow: tier.highlighted ? `0 18px 40px -24px ${hsla(theme.colors.primary, 0.6)}` : 'none',
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <h3
                className="text-lg"
                style={{ fontFamily: theme.typography.headingFont, fontWeight: theme.typography.headingWeight }}
              >
                {tier.name}
              </h3>
              {(tier.badge || tier.highlighted) && (
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{ background: hsla(theme.colors.primary, 0.14), color: hsl(theme.colors.primary) }}
                >
                  {tier.badge || 'Most popular'}
                </span>
              )}
            </div>

            <div className="mt-4 flex items-baseline gap-1">
              <span
                className="text-4xl"
                style={{ fontFamily: theme.typography.headingFont, fontWeight: theme.typography.headingWeight }}
              >
                {tier.price}
              </span>
              {tier.period && (
                <span className="text-sm" style={{ color: hsl(theme.colors.mutedForeground) }}>
                  /{tier.period}
                </span>
              )}
            </div>

            {tier.description && (
              <p className="mt-3 text-sm leading-relaxed" style={{ color: hsl(theme.colors.mutedForeground) }}>
                {tier.description}
              </p>
            )}

            <ul className="mt-6 flex flex-grow flex-col gap-3 p-0" style={{ listStyle: 'none' }}>
              {tier.features.map((feature, f) => (
                <li key={f} className="flex items-start gap-2 text-sm" style={{ fontFamily: theme.typography.bodyFont }}>
                  <Check color={hsl(theme.colors.primary)} />
                  <span style={{ color: hsl(theme.colors.mutedForeground) }}>{feature}</span>
                </li>
              ))}
            </ul>

            <PricingCTA tier={tier} theme={theme} />
          </div>
        ))}
      </div>
    </PricingFrame>
  );
};
