/**
 * About Variant: Editorial Split
 * Narrative column beside a supporting portrait/still.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { AboutBody, AboutCta, AboutFrame, AboutHeading, aboutParagraphs } from './AboutFrame';
import { hsl } from '../../themeUtils';

export const AboutEditorialSplit: React.FC<BaseSectionProps<'about'>> = ({ section, theme }) => {
  const paragraphs = aboutParagraphs(section.props.description);
  const mediaFirst = section.props.layout === 'text-right';

  return (
    <AboutFrame variantId="about:editorial-split" theme={theme}>
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div className={mediaFirst ? 'md:order-2' : ''}>
          <AboutHeading theme={theme} headline={section.props.headline} />
          <AboutBody theme={theme} paragraphs={paragraphs} />
          <AboutCta theme={theme} cta={section.props.cta} />
        </div>
        <div className={mediaFirst ? 'md:order-1' : ''}>
          {section.props.image ? (
            <img
              src={section.props.image}
              alt={section.props.headline || 'About'}
              loading="lazy"
              className="w-full object-cover"
              style={{ borderRadius: theme.radius, aspectRatio: '4 / 5' }}
            />
          ) : (
            <div
              className="w-full"
              style={{
                borderRadius: theme.radius,
                aspectRatio: '4 / 5',
                background: hsl(theme.colors.muted),
                border: `1px solid ${hsl(theme.colors.border)}`,
              }}
            />
          )}
        </div>
      </div>
    </AboutFrame>
  );
};
