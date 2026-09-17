/**
 * Gallery Variant: Horizontal Reel
 * Scroll-snapped horizontal filmstrip with the shared lightbox chrome.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { GalleryFrame, GalleryFigure } from './GalleryFrame';

export const GalleryHorizontalReel: React.FC<BaseSectionProps<'gallery'>> = ({ section, theme }) => {
  const { headline, subheadline, items, filterable } = section.props;

  return (
    <GalleryFrame
      variantId="gallery:horizontal-reel"
      theme={theme}
      headline={headline}
      subheadline={subheadline}
      items={items}
      filterable={filterable}
    >
      {({ items: media, open }) => (
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
          {media.map((item, i) => (
            <div key={i} className="w-[78%] flex-none snap-start sm:w-[46%] lg:w-[32%]">
              <GalleryFigure item={item} theme={theme} aspect="4 / 5" onOpen={() => open(i)} />
            </div>
          ))}
        </div>
      )}
    </GalleryFrame>
  );
};
