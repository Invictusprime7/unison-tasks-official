/**
 * About Variant: Story Panel
 * Overlapping media band with the narrative lifted into a raised card.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { AboutBody, AboutCta, AboutFrame, AboutHeading, aboutParagraphs } from './AboutFrame';
import { hsl } from '../../themeUtils';

export const AboutStoryPanel: React.FC<BaseSectionProps<'about'>> = ({ section, theme }) => {
  const paragraphs = aboutParagraphs(section.props.description);

  return (
    <AboutFrame variantId="about:story-panel" theme={theme} surface="muted">
      <div className="grid gap-0 md:grid-cols-12">
        <div className="md:col-span-7">
          {section.props.image ? (
            <img
              src={section.props.image}
              alt={section.props.headline || 'About'}
              loading="lazy"
              className="h-full w-full object-cover"
              style={{ borderRadius: theme.radius, aspectRatio: '16 / 10' }}
            />
          ) : (
            <div
              className="h-full w-full"
              style={{
                borderRadius: theme.radius,
                aspectRatio: '16 / 10',
                background: hsl(theme.colors.background),
                border: `1px solid ${hsl(theme.colors.border)}`,
              }}
            />
          )}
        </div>
        <div className="md:col-span-5 md:-ml-12 md:mt-16">
          <div
            className="p-10"
            style={{
              background: hsl(theme.colors.card),
              color: hsl(theme.colors.cardForeground),
              border: `1px solid ${hsl(theme.colors.border)}`,
              borderRadius: theme.radius,
            }}
          >
            <AboutHeading theme={theme} headline={section.props.headline} />
            <AboutBody theme={theme} paragraphs={paragraphs} />
            <AboutCta theme={theme} cta={section.props.cta} />
          </div>
        </div>
      </div>
    </AboutFrame>
  );
};
