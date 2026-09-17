/**
 * About Variant: Statement
 * Centered manifesto column — type-led, no media dependency.
 */

import React from 'react';
import type { BaseSectionProps } from '../../types';
import { AboutBody, AboutCta, AboutFrame, AboutHeading, aboutParagraphs } from './AboutFrame';

export const AboutStatement: React.FC<BaseSectionProps<'about'>> = ({ section, theme }) => {
  const paragraphs = aboutParagraphs(section.props.description);

  return (
    <AboutFrame variantId="about:statement" theme={theme} surface="muted">
      <div className="mx-auto max-w-3xl text-center">
        <AboutHeading theme={theme} headline={section.props.headline} align="center" />
        <AboutBody theme={theme} paragraphs={paragraphs} align="center" />
        <AboutCta theme={theme} cta={section.props.cta} />
      </div>
    </AboutFrame>
  );
};
