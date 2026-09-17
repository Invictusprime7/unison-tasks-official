/**
 * Services Variant: Product Cards
 *
 * Retail product grid — contained product art, name, tagline, price with an
 * optional strike-through original price and an offer chip.
 *
 * Adapted from 21st.dev "Product Card" (21st:8286). Framer Motion hover swapped
 * for CSS transitions; colours/typography come from Stage 4b theme tokens.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';

export const ServicesProductCards: React.FC<BaseSectionProps<'services'>> = ({ section, theme }) => {
  const { headline, subheadline, items = [], columns = 4 } = section.props;
  const cols = Math.max(1, Math.min(columns, items.length || columns));

  return (
    <section
      data-ut-variant="services:product-cards"
      data-ut-slot="products"
      style={{ padding: theme.sectionPadding, background: hsl(theme.colors.background) }}
    >
      <div className="mx-auto px-6" style={{ maxWidth: theme.containerWidth }}>
        {(headline || subheadline) && (
          <div className="mb-12 text-center">
            {headline && (
              <h2
                className="mb-3 text-3xl"
                style={{
                  fontFamily: theme.typography.headingFont,
                  fontWeight: theme.typography.headingWeight,
                  color: hsl(theme.colors.foreground),
                }}
              >
                {headline}
              </h2>
            )}
            {subheadline && (
              <p className="mx-auto max-w-xl text-base" style={{ color: hsl(theme.colors.mutedForeground) }}>
                {subheadline}
              </p>
            )}
          </div>
        )}

        <div
          className="grid gap-6"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {items.map((item, i) => (
            <article
              key={i}
              data-ut-slot={`product-${i + 1}`}
              className="group flex h-full flex-col overflow-hidden p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg motion-reduce:transform-none motion-reduce:transition-none"
              style={{
                background: hsl(theme.colors.card),
                color: hsl(theme.colors.cardForeground),
                border: `1px solid ${hsla(theme.colors.border, 0.6)}`,
                borderRadius: theme.radius,
              }}
            >
              <div
                className="mb-4 flex h-40 w-full items-center justify-center overflow-hidden"
                style={{ background: hsla(theme.colors.muted, 0.6), borderRadius: theme.radius }}
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none"
                  />
                ) : (
                  <span aria-hidden="true" className="text-3xl">
                    {item.icon || '🛍️'}
                  </span>
                )}
              </div>

              <div className="flex flex-grow flex-col items-center gap-1">
                {item.badge && (
                  <span
                    className="mb-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{ background: hsla(theme.colors.primary, 0.12), color: hsl(theme.colors.primary) }}
                  >
                    {item.badge}
                  </span>
                )}
                <h3
                  className="text-base"
                  style={{
                    fontFamily: theme.typography.headingFont,
                    fontWeight: theme.typography.headingWeight,
                  }}
                >
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: hsl(theme.colors.mutedForeground) }}>
                  {item.description}
                </p>
              </div>

              {(item.price || item.duration) && (
                <div className="mt-4 flex flex-col items-center gap-2">
                  {item.price && (
                    <span
                      className="text-2xl"
                      style={{
                        fontFamily: theme.typography.headingFont,
                        fontWeight: theme.typography.headingWeight,
                        color: hsl(theme.colors.foreground),
                      }}
                    >
                      {item.price}
                    </span>
                  )}
                  {item.duration && (
                    <span
                      className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs"
                      style={{ background: hsla(theme.colors.secondary, 0.18), color: hsl(theme.colors.foreground) }}
                    >
                      {item.duration}
                    </span>
                  )}
                </div>
              )}

              <a
                href={item.cta?.href || '#products'}
                data-ut-intent={item.cta?.intent || 'cart.add'}
                data-ut-cta="cta.product"
                className="mt-5 inline-flex w-full items-center justify-center px-4 py-2.5 text-sm font-semibold no-underline transition-opacity hover:opacity-90"
                style={{
                  background: hsl(theme.colors.primary),
                  color: hsl(theme.colors.primaryForeground),
                  borderRadius: theme.radius,
                  fontFamily: theme.typography.bodyFont,
                }}
              >
                {item.cta?.label || 'Add to Bag'}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
