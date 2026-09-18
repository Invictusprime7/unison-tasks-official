import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl } from '../../themeUtils';
import { EditorialSection, EditorialCTA } from '../shared/EditorialSection';

export function ServicesEditorialRows({ section, theme }: BaseSectionProps<'services'>) {
  return (
    <EditorialSection
      variantId="services:editorial-rows"
      theme={theme}
      headline={section.props.headline}
      description={section.props.subheadline}
    >
      {section.props.items.map((item, index) => (
        <article
          key={index}
          data-ut-slot={`service-${index}`}
          data-ut-reveal
          className="grid items-start gap-6 border-t py-8 md:grid-cols-[3rem_1fr_1.2fr] lg:gap-12"
          style={{ borderColor: hsl(theme.colors.border) }}
        >
          <span className="text-sm tabular-nums" style={{ color: hsl(theme.colors.mutedForeground) }}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <div>
            <h3 className="text-2xl sm:text-3xl" style={{ fontFamily: theme.typography.headingFont }}>
              {item.title}
            </h3>
            {item.image && (
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                className="mt-6 aspect-[3/2] w-full object-cover"
                style={{ borderRadius: theme.radius }}
              />
            )}
          </div>
          <div>
            <p className="text-base leading-relaxed" style={{ color: hsl(theme.colors.mutedForeground) }}>
              {item.description}
            </p>
            {(item.price || item.duration) && (
              <p className="mt-4 text-sm font-semibold">
                {[item.price, item.duration].filter(Boolean).join(' · ')}
              </p>
            )}
            <EditorialCTA cta={item.cta} theme={theme} />
          </div>
        </article>
      ))}
    </EditorialSection>
  );
}
