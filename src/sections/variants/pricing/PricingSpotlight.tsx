import { editorialCardStyle } from '../shared/editorialStyles';
import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl } from '../../themeUtils';
import { EditorialSection } from '../shared/EditorialSection';
import { normalizePricingTiers, PricingCTA } from './PricingFrame';

export function PricingSpotlight({ section, theme }: BaseSectionProps<'pricing'>) {
  return (
    <EditorialSection
      variantId="pricing:spotlight"
      theme={theme}
      headline={section.props.headline}
      description={section.props.subheadline}
    >
      <div className="grid gap-5 md:grid-cols-2">
        {normalizePricingTiers(section.props.tiers).map((tier, index) => (
          <article
            key={index}
            data-ut-slot={`tier-${index}`}
            data-ut-reveal
            className={`flex min-w-0 flex-col p-7 sm:p-9 ${tier.highlighted ? 'md:col-span-2 md:grid md:grid-cols-2 md:gap-10' : ''}`}
            style={{
              ...editorialCardStyle(theme),
              ...(tier.highlighted ? { borderColor: hsl(theme.colors.primary), borderWidth: 2 } : {}),
            }}
          >
            <div>
              {tier.badge && (
                <p
                  className="mb-4 text-xs font-semibold uppercase tracking-widest"
                  style={{ color: hsl(theme.colors.primary) }}
                >
                  {tier.badge}
                </p>
              )}
              <h3 className="text-2xl" style={{ fontFamily: theme.typography.headingFont }}>
                {tier.name}
              </h3>
              <p className="mt-5">
                <span className="text-5xl tracking-tight">{tier.price}</span>
                {tier.period && (
                  <span className="ml-2 text-sm" style={{ color: hsl(theme.colors.mutedForeground) }}>
                    /{tier.period}
                  </span>
                )}
              </p>
              {tier.description && (
                <p
                  className="mt-4 text-sm leading-relaxed"
                  style={{ color: hsl(theme.colors.mutedForeground) }}
                >
                  {tier.description}
                </p>
              )}
            </div>
            <div className="flex flex-1 flex-col">
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex gap-3">
                    <span aria-hidden="true" style={{ color: hsl(theme.colors.primary) }}>
                      ✓
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <PricingCTA tier={tier} theme={theme} />
            </div>
          </article>
        ))}
      </div>
    </EditorialSection>
  );
}
