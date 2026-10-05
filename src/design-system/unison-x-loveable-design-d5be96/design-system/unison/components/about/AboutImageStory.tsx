import { editorialCardStyle } from '../shared/editorialStyles';
import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl } from '../../themeUtils';
import { EditorialSection, EditorialCTA } from '../shared/EditorialSection';

export function AboutImageStory({ section, theme }: BaseSectionProps<'about'>) {
  const { headline, description, image, cta } = section.props;
  return (
    <EditorialSection variantId="about:image-story" theme={theme}>
      <div className={`grid gap-5 ${image ? 'lg:grid-cols-[1.4fr_1fr]' : ''}`}>
        {image && (
          <figure
            data-ut-slot="image"
            data-ut-reveal
            className="min-w-0 overflow-hidden"
            style={{ borderRadius: theme.radius }}
          >
            <img
              src={image}
              alt={headline || 'Our story'}
              loading="lazy"
              className="aspect-[4/3] h-full w-full object-cover"
            />
          </figure>
        )}
        <div
          data-ut-reveal
          className="flex flex-col items-start justify-center p-7 sm:p-12"
          style={editorialCardStyle(theme)}
        >
          {headline && (
            <h2
              data-ut-slot="headline"
              className="text-3xl tracking-tight sm:text-4xl"
              style={{ fontFamily: theme.typography.headingFont }}
            >
              {headline}
            </h2>
          )}
          <p
            data-ut-slot="description"
            className="mt-6 whitespace-pre-line text-base leading-relaxed"
            style={{ color: hsl(theme.colors.mutedForeground) }}
          >
            {description}
          </p>
          <EditorialCTA cta={cta} theme={theme} />
        </div>
      </div>
    </EditorialSection>
  );
}
