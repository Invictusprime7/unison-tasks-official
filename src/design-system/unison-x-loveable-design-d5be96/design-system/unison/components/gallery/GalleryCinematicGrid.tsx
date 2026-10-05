/**
 * Gallery Variant: Cinematic Grid
 * Wide 16:9 frames on a calm, even grid.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { GalleryFrame, GalleryFigure } from './GalleryFrame';

export const GalleryCinematicGrid: React.FC<BaseSectionProps<'gallery'>> = ({ section, theme }) => {
  const { headline, subheadline, items, filterable, columns = 3 } = section.props;
  const desktopColumns = columns === 2 ? 'lg:grid-cols-2' : columns === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3';

  return (
    <GalleryFrame
      variantId="gallery:cinematic-grid"
      theme={theme}
      headline={headline}
      subheadline={subheadline}
      items={items}
      filterable={filterable}
    >
      {({ items: media, open }) => (
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${desktopColumns} gap-5`}>
          {media.map((item, i) => (
            <GalleryFigure key={i} item={item} theme={theme} aspect="16 / 9" onOpen={() => open(i)} />
          ))}
        </div>
      )}
    </GalleryFrame>
  );
};
