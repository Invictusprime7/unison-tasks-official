/**
 * Gallery Variant: Masonry
 * Masonry-style gallery grid with varying heights. Default variant.
 */
import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';

export const GalleryMasonry: React.FC<BaseSectionProps<'gallery'>> = ({ section, theme }) => {
  const { headline, subheadline, items = [], columns = 3 } = section.props;
  return (
    <section style={{ padding: theme.sectionPadding, background: hsl(theme.colors.background) }}>
      <div className="mx-auto px-6" style={{ maxWidth: theme.containerWidth }}>
        {headline && (
          <div className="text-center mb-12">
            <h2 className="text-3xl mb-3" style={{ fontFamily: theme.typography.headingFont, fontWeight: theme.typography.headingWeight, color: hsl(theme.colors.foreground) }}>{headline}</h2>
            {subheadline && <p className="text-base max-w-lg mx-auto" style={{ color: hsl(theme.colors.mutedForeground) }}>{subheadline}</p>}
          </div>
        )}
        <div style={{ columnCount: columns, columnGap: '1rem' }}>
          {items.map((item, i) => (
            <div key={i} className="mb-4 break-inside-avoid overflow-hidden group" style={{ borderRadius: theme.radius }}>
              <div className="relative">
                <img src={item.src} alt={item.alt} className="w-full block" style={{ borderRadius: theme.radius }} />
                {item.caption && (
                  <div className="absolute inset-x-0 bottom-0 p-3" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
                    <p className="text-sm text-white">{item.caption}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
