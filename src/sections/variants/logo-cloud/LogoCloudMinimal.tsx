/**
 * Logo Cloud Variant: Minimal
 * Single horizontal row of logos, clean minimal look.
 */
import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';

export const LogoCloudMinimal: React.FC<BaseSectionProps<'logo-cloud'>> = ({ section, theme }) => {
  const { headline, logos = [] } = section.props;
  return (
    <section style={{ padding: '2.5rem 1rem', background: hsl(theme.colors.background), borderTop: `1px solid ${hsla(theme.colors.border, 0.3)}`, borderBottom: `1px solid ${hsla(theme.colors.border, 0.3)}` }}>
      <div className="mx-auto px-6" style={{ maxWidth: theme.containerWidth }}>
        {headline && <p className="text-xs text-center mb-5 uppercase tracking-widest" style={{ color: hsl(theme.colors.mutedForeground) }}>{headline}</p>}
        <div className="flex items-center justify-center flex-wrap gap-8">
          {logos.map((logo, i) => (
            <div key={i} className="flex items-center">
              {logo.src ? (
                <img src={logo.src} alt={logo.name} className="max-h-7 max-w-full object-contain" style={{ filter: 'grayscale(100%)', opacity: 0.5 }} />
              ) : (
                <span className="text-sm font-medium" style={{ color: hsla(theme.colors.mutedForeground, 0.5) }}>{logo.name}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
