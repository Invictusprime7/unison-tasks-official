/**
 * About Variant: Centered
 * Centered text layout with optional image above.
 */
import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';

export const AboutCentered: React.FC<BaseSectionProps<'about'>> = ({ section, theme }) => {
  const { headline, description, image, cta } = section.props;
  return (
    <section style={{ padding: theme.sectionPadding, background: hsl(theme.colors.muted) }}>
      <div className="mx-auto px-6 text-center" style={{ maxWidth: '48rem' }}>
        {image && <img src={image} alt={headline || 'About'} className="w-full mb-8 rounded" style={{ borderRadius: theme.radius, maxHeight: '20rem', objectFit: 'cover' }} />}
        {headline && <h2 className="text-3xl mb-4" style={{ fontFamily: theme.typography.headingFont, fontWeight: theme.typography.headingWeight, color: hsl(theme.colors.foreground) }}>{headline}</h2>}
        <p className="text-base leading-relaxed mb-6 max-w-2xl mx-auto" style={{ color: hsl(theme.colors.mutedForeground) }}>{description}</p>
        {cta && <a href={cta.href || '#'} className="inline-block py-2.5 px-6 rounded text-sm font-medium" style={{ background: hsl(theme.colors.primary), color: hsl(theme.colors.primaryForeground), borderRadius: theme.radius, textDecoration: 'none' }}>{cta.label}</a>}
      </div>
    </section>
  );
};
