/**
 * Gallery Variant: Masonry
 * Column-flow masonry with natural image heights.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { GalleryFrame, GalleryFigure } from './GalleryFrame';

export const GalleryMasonry: React.FC<BaseSectionProps<'gallery'>> = ({ section, theme }) => {
  const { headline, subheadline, items, filterable, columns = 3 } = section.props;
  const desktopColumns = columns === 2 ? 'lg:columns-2' : columns === 4 ? 'lg:columns-4' : 'lg:columns-3';

  return (
    <GalleryFrame
      variantId="gallery:masonry"
      theme={theme}
      headline={headline}
      subheadline={subheadline}
      items={items}
      filterable={filterable}
    >
      {({ items: media, open }) => (
        <div
          className={`columns-1 sm:columns-2 ${desktopColumns} [column-fill:_balance] gap-4`}
        >
          {media.map((item, i) => (
            <div key={i} className="mb-4 break-inside-avoid">
              <GalleryFigure
                item={item}
                theme={theme}
                onOpen={() => open(i)}
                aspect={i % 3 === 0 ? '3 / 4' : i % 3 === 1 ? '1 / 1' : '4 / 5'}
              />
            </div>
          ))}
        </div>
      )}
    </GalleryFrame>
  );
};
