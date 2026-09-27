/**
 * Services Variant: Compact List
 * Horizontal list with icon, title, and description on one row.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';

export const ServicesCompactList: React.FC<BaseSectionProps<'services'>> = ({ section, theme }) => {
  const { headline, subheadline, items = [] } = section.props;

  return (
    <section data-ut-variant="services:compact-list" style={{ padding: theme.sectionPadding, background: hsl(theme.colors.muted) }}>
      <div className="mx-auto px-5 sm:px-6 lg:px-8" style={{ maxWidth: '56rem' }}>
        {headline && (
          <div className="text-center mb-12">
            <h2 data-ut-slot="services.headline"
              className="text-3xl mb-3"
              style={{
                fontFamily: theme.typography.headingFont,
                fontWeight: theme.typography.headingWeight,
                color: hsl(theme.colors.foreground),
              }}
            >
              {headline}
            </h2>
            {subheadline && (
              <p data-ut-slot="services.subheadline" className="text-base max-w-lg mx-auto" style={{ color: hsl(theme.colors.mutedForeground) }}>
                {subheadline}
              </p>
            )}
          </div>
        )}
        <div className="flex flex-col gap-4">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-5 p-5"
              style={{
                background: hsl(theme.colors.card),
                border: `1px solid ${hsla(theme.colors.border, 0.5)}`,
                borderRadius: theme.radius,
              }}
            >
              <div
                className="flex-shrink-0 w-11 h-11 flex items-center justify-center text-lg rounded-lg"
                style={{
                  background: hsla(theme.colors.primary, 0.1),
                  color: hsl(theme.colors.primary),
                }}
              >
                {item.icon || '●'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 data-ut-slot={`services.title`}
                  className="text-base mb-0.5"
                  style={{
                    fontFamily: theme.typography.headingFont,
                    fontWeight: theme.typography.headingWeight,
                    color: hsl(theme.colors.cardForeground),
                  }}
                >
                  {item.title}
                </h3>
                <p data-ut-slot={`services.description`} className="text-sm truncate" style={{ color: hsl(theme.colors.mutedForeground) }}>
                  {item.description}
                </p>
              </div>
              {item.price && (
                <span data-ut-slot={`services.price`} className="text-lg font-semibold flex-shrink-0" style={{ color: hsl(theme.colors.primary) }}>
                  {item.price}
                </span>
              )}
              {item.cta && (
                <a
                  href={item.cta.href || '#'}
                  data-ut-intent={item.cta.intent ?? 'nav.goto'}
                  data-ut-cta="cta.card"
                  className="flex-shrink-0 text-sm font-medium px-4 py-2 motion-safe:transition-opacity hover:opacity-90"
                  style={{
                    background: hsl(theme.colors.primary),
                    color: hsl(theme.colors.primaryForeground),
                    borderRadius: theme.radius,
                  }}
                >
                  {item.cta.label}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
