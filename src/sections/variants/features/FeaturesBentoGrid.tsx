/**
 * Features Variant: Bento Grid
 *
 * Adapted from the 21st.dev community component "Bento Product Features"
 * (21st:9206). The original shadcn/Next markup was normalized to the Unison
 * runtime: `framer-motion` staggered variants replaced with a CSS reveal gated
 * on `prefers-reduced-motion`, `@/lib/utils` `cn` dependency dropped, the
 * six `React.ReactNode` slots rebound to the canonical `features.items`
 * contract, and every color / radius / spacing value rebound to Stage 4b
 * semantic theme tokens.
 *
 * Provenance is recorded on the registry entry (`source`), never at runtime.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';

const revealStyles = `
@keyframes ut-bento-rise {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: none; }
}
[data-ut-variant="features:bento-grid"] [data-ut-rise] {
  animation: ut-bento-rise 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@media (prefers-reduced-motion: reduce) {
  [data-ut-variant="features:bento-grid"] [data-ut-rise] {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
`;

/** Bento placement for the first six items — mirrors the source layout. */
const SPANS = [
  'md:col-span-1 md:row-span-3',
  'md:col-span-1 md:row-span-1',
  'md:col-span-1 md:row-span-1',
  'md:col-span-1 md:row-span-1',
  'md:col-span-1 md:row-span-1',
  'md:col-span-2 md:row-span-1',
];

export const FeaturesBentoGrid: React.FC<BaseSectionProps<'features'>> = ({ section, theme }) => {
  const { headline, subheadline, items = [] } = section.props;

  return (
    <section
      data-ut-variant="features:bento-grid"
      data-ut-slot="features"
      style={{ padding: theme.sectionPadding, background: hsl(theme.colors.background) }}
    >
      <style>{revealStyles}</style>

      <div className="mx-auto px-6" style={{ maxWidth: theme.containerWidth }}>
        {headline && (
          <div className="mb-12 text-center">
            <h2
              data-ut-slot="features.headline"
              className="mb-3 text-3xl"
              style={{
                fontFamily: theme.typography.headingFont,
                fontWeight: theme.typography.headingWeight,
                color: hsl(theme.colors.foreground),
              }}
            >
              {headline}
            </h2>
            {subheadline && (
              <p
                data-ut-slot="features.subheadline"
                className="mx-auto max-w-lg text-base"
                style={{ fontFamily: theme.typography.bodyFont, color: hsl(theme.colors.mutedForeground) }}
              >
                {subheadline}
              </p>
            )}
          </div>
        )}

        <div className="grid w-full auto-rows-[minmax(180px,auto)] grid-cols-1 gap-6 md:grid-cols-3 md:grid-rows-3">
          {items.map((item, i) => (
            <div
              key={i}
              data-ut-rise
              data-ut-slot="features.item"
              className={`flex flex-col justify-end p-6 ${SPANS[i % SPANS.length]}`}
              style={{
                background: hsl(theme.colors.card),
                border: `1px solid ${hsla(theme.colors.border, 0.6)}`,
                borderRadius: `calc(${theme.radius} * 1.5)`,
                animationDelay: `${0.05 * i}s`,
              }}
            >
              {item.icon && <span className="mb-3 block text-2xl">{item.icon}</span>}
              <h3
                className="mb-2 text-lg"
                style={{ fontFamily: theme.typography.headingFont, color: hsl(theme.colors.cardForeground) }}
              >
                {item.title}
              </h3>
              {item.description && (
                <p
                  className="text-sm leading-relaxed"
                  style={{ fontFamily: theme.typography.bodyFont, color: hsl(theme.colors.mutedForeground) }}
                >
                  {item.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
