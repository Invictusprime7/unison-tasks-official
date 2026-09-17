/**
 * Gallery Variant: Collection Tiles
 *
 * Adapted from the 21st.dev community component "Commerce Hero" (21st:4927,
 * @bankkroll) — specifically its category tile grid. Normalized for the Unison
 * runtime: `@/components/ui/*` and lucide imports removed (arrow rendered as
 * inline SVG), framer-motion staggered reveal replaced with CSS animation that
 * respects `prefers-reduced-motion`, and all colors / radii / spacing rebound
 * to Stage 4b semantic theme tokens.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';

const tileStyles = `
@keyframes ut-collection-tile-rise {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: none; }
}
[data-ut-variant="gallery:collection-tiles"] [data-ut-tile] {
  animation: ut-collection-tile-rise 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}
[data-ut-variant="gallery:collection-tiles"] [data-ut-tile] img {
  transition: transform 0.5s ease, opacity 0.5s ease;
}
[data-ut-variant="gallery:collection-tiles"] [data-ut-tile]:hover img {
  transform: scale(1.1);
  opacity: 1;
}
@media (prefers-reduced-motion: reduce) {
  [data-ut-variant="gallery:collection-tiles"] [data-ut-tile] {
    animation: none;
    opacity: 1;
    transform: none;
  }
  [data-ut-variant="gallery:collection-tiles"] [data-ut-tile] img,
  [data-ut-variant="gallery:collection-tiles"] [data-ut-tile]:hover img {
    transition: none;
    transform: none;
  }
}
`;

const ArrowUpRight: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M7 17 17 7" />
    <path d="M7 7h10v10" />
  </svg>
);

export const GalleryCollectionTiles: React.FC<BaseSectionProps<'gallery'>> = ({ section, theme }) => {
  const { headline, subheadline, items = [], columns = 4 } = section.props;

  const gridCols =
    columns === 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : columns === 3
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  return (
    <section
      data-ut-variant="gallery:collection-tiles"
      data-ut-slot="gallery"
      className="relative"
      style={{
        padding: theme.sectionPadding,
        background: hsl(theme.colors.background),
      }}
    >
      <style>{tileStyles}</style>

      <div className="mx-auto" style={{ maxWidth: theme.containerWidth }}>
        {(headline || subheadline) && (
          <div className="text-center mb-12">
            {headline && (
              <h2
                data-ut-slot="gallery.headline"
                className="font-bold tracking-tight mb-4"
                style={{
                  fontFamily: theme.typography.headingFont,
                  fontWeight: theme.typography.headingWeight,
                  fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
                  color: hsl(theme.colors.foreground),
                }}
              >
                {headline}
              </h2>
            )}
            {subheadline && (
              <p
                className="text-base md:text-lg leading-relaxed mx-auto"
                style={{
                  fontFamily: theme.typography.bodyFont,
                  color: hsl(theme.colors.mutedForeground),
                  maxWidth: '42rem',
                }}
              >
                {subheadline}
              </p>
            )}
          </div>
        )}

        <div className={`grid ${gridCols} gap-4 sm:gap-6`}>
          {items.map((item, index) => {
            const title = item.caption || item.category || item.alt;
            return (
              <a
                key={`${item.src}-${index}`}
                data-ut-tile
                data-ut-slot="gallery.item"
                data-ut-intent="nav.goto"
                href="#"
                className="group relative block overflow-hidden"
                style={{
                  borderRadius: `calc(${theme.radius} * 3)`,
                  background: hsla(theme.colors.muted, 0.5),
                  minHeight: '18rem',
                  padding: '1.5rem',
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                {title && (
                  <h3
                    className="relative z-10 text-center font-bold my-2"
                    style={{
                      fontFamily: theme.typography.headingFont,
                      fontWeight: theme.typography.headingWeight,
                      fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                      color: hsl(theme.colors.primary),
                    }}
                  >
                    {title}
                  </h3>
                )}

                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <img
                    src={item.src}
                    alt={item.alt}
                    loading="lazy"
                    className="w-full h-auto object-contain"
                    style={{ maxWidth: 'min(45%, 200px)', opacity: 0.9 }}
                  />
                </div>

                <div
                  className="absolute bottom-0 right-0 w-16 h-16 md:w-20 md:h-20 flex items-center justify-center z-10"
                  style={{
                    background: hsl(theme.colors.background),
                    borderTopLeftRadius: `calc(${theme.radius} * 2)`,
                    borderLeft: `1px solid ${hsla(theme.colors.border, 1)}`,
                    borderTop: `1px solid ${hsla(theme.colors.border, 1)}`,
                  }}
                >
                  <span
                    className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 transition-all duration-300 group-hover:scale-110"
                    style={{
                      borderRadius: '9999px',
                      background: hsl(theme.colors.secondary),
                      color: hsl(theme.colors.secondaryForeground),
                    }}
                  >
                    <ArrowUpRight />
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};
