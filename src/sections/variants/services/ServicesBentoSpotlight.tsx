import { editorialCardStyle } from '../shared/editorialStyles';
import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl } from '../../themeUtils';
import { EditorialSection, EditorialCTA } from '../shared/EditorialSection';

/** Reworks the checked-in 21st bento source into service-owned content and actions. */
export function ServicesBentoSpotlight({ section, theme }: BaseSectionProps<'services'>) {
  const { headline, subheadline, items = [] } = section.props;
  return (
    <EditorialSection
      variantId="services:bento-spotlight"
      theme={theme}
      headline={headline}
      description={subheadline}
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <article
            key={index}
            data-ut-slot={`service-${index}`}
            data-ut-reveal
            className={`group flex min-w-0 flex-col overflow-hidden ${index === 0 ? 'md:col-span-2 lg:row-span-2' : ''}`}
            style={
              {
                ...editorialCardStyle(theme),
                '--ut-reveal-delay': `${Math.min(index, 5) * 55}ms`,
              } as React.CSSProperties
            }
          >
            {item.image && (
              <div className={`overflow-hidden ${index === 0 ? 'aspect-[16/9]' : 'aspect-[2/1]'}`}>
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105"
                />
              </div>
            )}
            <div className="flex flex-1 flex-col items-start p-6 sm:p-8">
              <div
                className="mb-6 flex w-full items-center justify-between gap-3 text-xs uppercase tracking-widest"
                style={{ color: hsl(theme.colors.mutedForeground) }}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                {item.badge && <span>{item.badge}</span>}
              </div>
              <h3
                className={index === 0 ? 'text-3xl tracking-tight' : 'text-xl tracking-tight'}
                style={{ fontFamily: theme.typography.headingFont }}
              >
                {item.title}
              </h3>
              <p className="mt-3 flex-1 leading-relaxed" style={{ color: hsl(theme.colors.mutedForeground) }}>
                {item.description}
              </p>
              {(item.price || item.duration) && (
                <p className="mt-5 text-sm font-medium">
                  {[item.price, item.duration].filter(Boolean).join(' · ')}
                </p>
              )}
              <EditorialCTA cta={item.cta} theme={theme} />
            </div>
          </article>
        ))}
      </div>
    </EditorialSection>
  );
}
