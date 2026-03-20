/**
 * About Variant: Split
 * Image + text split layout with CTA button. Default variant.
 */
import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';

export const AboutSplit: React.FC<BaseSectionProps<'about'>> = ({ section, theme }) => {
  const { headline, description, image, cta, layout = 'text-left' } = section.props;
  const textFirst = layout !== 'text-right';
  return (
    <section style={{ padding: theme.sectionPadding, background: hsl(theme.colors.background) }}>
      <div className="mx-auto px-6 grid gap-10 items-center" style={{ maxWidth: theme.containerWidth, gridTemplateColumns: '1fr 1fr' }}>
        <div style={{ order: textFirst ? 0 : 1 }}>
          {headline && <h2 className="text-3xl mb-4" style={{ fontFamily: theme.typography.headingFont, fontWeight: theme.typography.headingWeight, color: hsl(theme.colors.foreground) }}>{headline}</h2>}
          <p className="text-base leading-relaxed mb-6" style={{ color: hsl(theme.colors.mutedForeground) }}>{description}</p>
          {cta && <a href={cta.href || '#'} className="inline-block py-2.5 px-6 rounded text-sm font-medium" style={{ background: hsl(theme.colors.primary), color: hsl(theme.colors.primaryForeground), borderRadius: theme.radius, textDecoration: 'none' }}>{cta.label}</a>}
        </div>
        <div style={{ order: textFirst ? 1 : 0 }}>
          {image ? (
            <img src={image} alt={headline || 'About'} className="w-full rounded" style={{ borderRadius: theme.radius, aspectRatio: '4/3', objectFit: 'cover' }} />
          ) : (
            <div className="w-full rounded flex items-center justify-center text-5xl" style={{ borderRadius: theme.radius, aspectRatio: '4/3', background: `linear-gradient(135deg, ${hsla(theme.colors.primary, 0.08)}, ${hsla(theme.colors.secondary, 0.08)})`, color: hsl(theme.colors.primary) }}>🏢</div>
          )}
        </div>
      </div>
    </section>
  );
};
