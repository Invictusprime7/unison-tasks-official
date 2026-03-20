/**
 * Gallery Variant: Minimal
 * Clean rows of images with subtle borders, no overlay.
 */
import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';

export const GalleryMinimal: React.FC<BaseSectionProps<'gallery'>> = ({ section, theme }) => {
  const { headline, subheadline, items = [] } = section.props;
  return (
    <section style={{ padding: theme.sectionPadding, background: hsl(theme.colors.background) }}>
      <div className="mx-auto px-6" style={{ maxWidth: '52rem' }}>
        {headline && (
          <div className="text-center mb-12">
            <h2 className="text-3xl mb-3" style={{ fontFamily: theme.typography.headingFont, fontWeight: theme.typography.headingWeight, color: hsl(theme.colors.foreground) }}>{headline}</h2>
            {subheadline && <p className="text-base max-w-lg mx-auto" style={{ color: hsl(theme.colors.mutedForeground) }}>{subheadline}</p>}
          </div>
        )}
        <div className="space-y-6">
          {items.map((item, i) => (
            <div key={i} className="overflow-hidden" style={{ borderRadius: theme.radius, border: `1px solid ${hsla(theme.colors.border, 0.4)}` }}>
              <img src={item.src} alt={item.alt} className="w-full block" style={{ maxHeight: '24rem', objectFit: 'cover' }} />
              {(item.caption || item.category) && (
                <div className="flex items-center justify-between p-3" style={{ background: hsl(theme.colors.card) }}>
                  {item.caption && <p className="text-sm" style={{ color: hsl(theme.colors.cardForeground) }}>{item.caption}</p>}
                  {item.category && <span className="text-xs px-2 py-1 rounded-full" style={{ background: hsla(theme.colors.primary, 0.08), color: hsl(theme.colors.primary) }}>{item.category}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
