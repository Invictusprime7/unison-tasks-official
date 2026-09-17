/**
 * Gallery Variant: Lightbox Grid
 * Square inspection grid with prominent zoom affordance.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { GalleryFrame, GalleryFigure } from './GalleryFrame';

export const GalleryLightboxGrid: React.FC<BaseSectionProps<'gallery'>> = ({ section, theme }) => {
  const { headline, subheadline, items, filterable, columns = 3 } = section.props;
  const desktopColumns = columns === 2 ? 'lg:grid-cols-2' : columns === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3';

  return (
    <GalleryFrame
      variantId="gallery:lightbox-grid"
      theme={theme}
      headline={headline}
      subheadline={subheadline}
      items={items}
      filterable={filterable}
    >
      {({ items: media, open }) => (
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${desktopColumns} gap-3`}>
          {media.map((item, i) => (
            <GalleryFigure key={i} item={item} theme={theme} aspect="1 / 1" onOpen={() => open(i)} />
          ))}
        </div>
      )}
    </GalleryFrame>
  );
};
