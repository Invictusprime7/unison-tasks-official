/**
 * Logo Cloud Variant: Grid
 * Grid of partner/brand logos with names. Default variant.
 */
import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';

export const LogoCloudGrid: React.FC<BaseSectionProps<'logo-cloud'>> = ({ section, theme }) => {
  const { headline, logos = [] } = section.props;
  return (
    <section style={{ padding: theme.sectionPadding, background: hsl(theme.colors.muted) }}>
      <div className="mx-auto px-6" style={{ maxWidth: theme.containerWidth }}>
        {headline && <h2 className="text-xl text-center mb-8" style={{ fontFamily: theme.typography.headingFont, fontWeight: theme.typography.headingWeight, color: hsl(theme.colors.mutedForeground) }}>{headline}</h2>}
        <div className="grid gap-6 items-center justify-items-center" style={{ gridTemplateColumns: `repeat(${Math.min(logos.length, 5)}, 1fr)` }}>
          {logos.map((logo, i) => (
            <div key={i} className="flex items-center justify-center p-4 w-full" style={{ background: hsl(theme.colors.card), border: `1px solid ${hsla(theme.colors.border, 0.4)}`, borderRadius: theme.radius, minHeight: '5rem' }}>
              {logo.src ? (
                <img src={logo.src} alt={logo.name} className="max-h-10 max-w-full object-contain" style={{ filter: 'grayscale(100%)', opacity: 0.7 }} />
              ) : (
                <span className="text-sm font-semibold" style={{ color: hsl(theme.colors.mutedForeground) }}>{logo.name}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
