import { editorialCardStyle } from '../shared/editorialStyles';
import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl } from '../../themeUtils';
import { EditorialSection, EditorialCTA } from '../shared/EditorialSection';

export function ServicesExpandable({ section, theme }: BaseSectionProps<'services'>) {
  return (
    <EditorialSection
      variantId="services:expandable"
      theme={theme}
      headline={section.props.headline}
      description={section.props.subheadline}
    >
      <div className="space-y-3">
        {section.props.items.map((item, index) => (
          <details
            key={index}
            data-ut-slot={`service-${index}`}
            className="group p-5 sm:p-7"
            style={editorialCardStyle(theme)}
          >
            <summary
              className="cursor-pointer text-xl sm:text-2xl"
              style={{ fontFamily: theme.typography.headingFont }}
            >
              {item.title}
              {item.price && (
                <span className="ml-4 text-sm" style={{ color: hsl(theme.colors.mutedForeground) }}>
                  {item.price}
                </span>
              )}
            </summary>
            <div className={`mt-6 grid gap-6 ${item.image ? 'md:grid-cols-2' : ''}`}>
              <div>
                <p className="leading-relaxed" style={{ color: hsl(theme.colors.mutedForeground) }}>
                  {item.description}
                </p>
                {item.duration && <p className="mt-4 text-sm">{item.duration}</p>}
                <EditorialCTA cta={item.cta} theme={theme} />
              </div>
              {item.image && (
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="aspect-[16/9] w-full object-cover"
                  style={{ borderRadius: theme.radius }}
                />
              )}
            </div>
          </details>
        ))}
      </div>
    </EditorialSection>
  );
}
