/**
 * CTA Variant: Centered
 * Clean centered CTA with headline, description, and buttons.
 * This is the default CTA style.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';

export const CTACentered: React.FC<BaseSectionProps<'cta'>> = ({ section, theme }) => {
  const { headline, description, ctas = [] } = section.props;

  return (
    <section
        data-ut-variant="cta:centered"
      className="text-center"
      style={{
        padding: theme.sectionPadding,
        background: hsla(theme.colors.primary, 0.04),
        borderTop: `1px solid ${hsla(theme.colors.border, 0.4)}`,
        borderBottom: `1px solid ${hsla(theme.colors.border, 0.4)}`,
      }}
    >
      <div className="mx-auto px-5 sm:px-6 lg:px-8" style={{ maxWidth: theme.containerWidth }}>
        <h2 data-ut-slot="cta.headline"
          className="mb-4 text-2xl sm:text-3xl md:text-4xl"
          style={{
            fontFamily: theme.typography.headingFont,
            fontWeight: theme.typography.headingWeight,
            color: hsl(theme.colors.foreground),
          }}
        >
          {headline}
        </h2>
        {description && (
          <p data-ut-slot="cta.description"
            className="text-base max-w-lg mx-auto mb-8"
            style={{ fontFamily: theme.typography.bodyFont, color: hsl(theme.colors.mutedForeground) }}
          >
            {description}
          </p>
        )}
        <div data-ut-slot="cta.actions" className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          {ctas.map((c, i) => (
            <a
              key={i}
              href={c.href || '#'}
              data-ut-intent={c.intent ?? 'nav.goto'}
              data-ut-cta={i === 0 ? 'cta.hero' : 'cta.hero-secondary'}
              className="inline-block text-sm font-medium px-6 py-3 motion-safe:transition-opacity hover:opacity-90"
              style={
                c.variant === 'outline'
                  ? {
                      background: 'transparent',
                      color: hsl(theme.colors.foreground),
                      border: `1px solid ${hsla(theme.colors.border, 1)}`,
                      borderRadius: theme.radius,
                    }
                  : {
                      background: hsl(theme.colors.primary),
                      color: hsl(theme.colors.primaryForeground),
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
