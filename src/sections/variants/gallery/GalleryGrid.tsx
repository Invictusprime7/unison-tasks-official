/**
 * Gallery Variant: Grid
 * Uniform grid of equally-sized image cards with hover overlays.
 */
import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';

export const GalleryGrid: React.FC<BaseSectionProps<'gallery'>> = ({ section, theme }) => {
  const { headline, subheadline, items = [], columns = 3 } = section.props;
  return (
    <section style={{ padding: theme.sectionPadding, background: hsl(theme.colors.muted) }}>
      <div className="mx-auto px-6" style={{ maxWidth: theme.containerWidth }}>
        {headline && (
          <div className="text-center mb-12">
            <h2 className="text-3xl mb-3" style={{ fontFamily: theme.typography.headingFont, fontWeight: theme.typography.headingWeight, color: hsl(theme.colors.foreground) }}>{headline}</h2>
            {subheadline && <p className="text-base max-w-lg mx-auto" style={{ color: hsl(theme.colors.mutedForeground) }}>{subheadline}</p>}
          </div>
        )}
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {items.map((item, i) => (
            <div key={i} className="relative overflow-hidden group" style={{ aspectRatio: '4/3', borderRadius: theme.radius }}>
              <img src={item.src} alt={item.alt} className="w-full h-full object-cover" style={{ borderRadius: theme.radius }} />
              <div className="absolute inset-0 flex flex-col justify-end p-4" style={{ background: 'linear-gradient(transparent 40%, rgba(0,0,0,0.6))' }}>
                {item.caption && <p className="text-sm text-white font-medium">{item.caption}</p>}
                {item.category && <span className="text-xs text-white/70">{item.category}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
