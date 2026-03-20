/**
 * Logo Cloud Variant: Scroll
 * Infinite marquee-style scrolling logo strip with CSS animation.
 */
import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';

export const LogoCloudScroll: React.FC<BaseSectionProps<'logo-cloud'>> = ({ section, theme }) => {
  const { headline, logos = [] } = section.props;
  return (
    <section style={{ padding: theme.sectionPadding, background: hsl(theme.colors.background), overflow: 'hidden' }}>
      <div className="mx-auto px-6" style={{ maxWidth: theme.containerWidth }}>
        {headline && <h2 className="text-xl text-center mb-8" style={{ fontFamily: theme.typography.headingFont, fontWeight: theme.typography.headingWeight, color: hsl(theme.colors.mutedForeground) }}>{headline}</h2>}
        <div className="relative overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)' }}>
          <div className="flex gap-12 items-center" style={{ animation: 'scroll 20s linear infinite', width: 'max-content' }}>
            {[...logos, ...logos].map((logo, i) => (
              <div key={i} className="flex items-center justify-center flex-shrink-0 px-4" style={{ minWidth: '8rem' }}>
                {logo.src ? (
                  <img src={logo.src} alt={logo.name} className="max-h-8 max-w-full object-contain" style={{ filter: 'grayscale(100%)', opacity: 0.6 }} />
                ) : (
                  <span className="text-sm font-semibold whitespace-nowrap" style={{ color: hsl(theme.colors.mutedForeground) }}>{logo.name}</span>
                )}
              </div>
            ))}
          </div>
        </div>
        <style>{`@keyframes scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
      </div>
    </section>
  );
};
