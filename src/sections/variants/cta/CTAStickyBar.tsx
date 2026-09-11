/**
 * CTA Variant: Sticky Bar
 *
 * A low-height conversion bar that pins to the bottom of the viewport. Used on
 * routes where the primary action must stay reachable while the visitor reads
 * (services, pricing, shop). Token-only styling.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';

export const CTAStickyBar: React.FC<BaseSectionProps<'cta'>> = ({ section, theme }) => {
  const { headline, description, ctas = [] } = section.props;

  return (
    <section
      className="sticky bottom-0 z-40 w-full backdrop-blur-md"
      data-variant="cta:sticky-bar"
      style={{
        background: hsla(theme.colors.card, 0.94),
        borderTop: `1px solid ${hsla(theme.colors.border, 0.6)}`,
        padding: '0.875rem 0',
      }}
    >
      <div
        className="mx-auto flex flex-wrap items-center justify-between gap-4 px-6"
        style={{ maxWidth: theme.containerWidth }}
      >
        <div className="min-w-0">
          <p
            className="text-sm font-semibold truncate"
            style={{
              fontFamily: theme.typography.headingFont,
              color: hsl(theme.colors.foreground),
            }}
          >
            {headline}
          </p>
          {description && (
            <p
              className="text-xs truncate"
              style={{ fontFamily: theme.typography.bodyFont, color: hsl(theme.colors.mutedForeground) }}
            >
              {description}
            </p>
          )}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {ctas.slice(0, 2).map((c, i) => (
            <a
              key={i}
              href={c.href || '#'}
              data-ut-intent={c.intent}
              data-ut-cta={i === 0 ? 'cta.sticky' : 'cta.sticky-secondary'}
              className="inline-block text-sm font-medium px-5 py-2.5 transition-all hover:opacity-90"
              style={
                i === 0 && c.variant !== 'outline'
                  ? {
                      background: hsl(theme.colors.primary),
                      color: hsl(theme.colors.primaryForeground),
                      borderRadius: theme.radius,
                    }
                  : {
                      background: 'transparent',
                      color: hsl(theme.colors.foreground),
                      border: `1px solid ${hsla(theme.colors.border, 1)}`,
                      borderRadius: theme.radius,
                    }
              }
            >
              {c.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
