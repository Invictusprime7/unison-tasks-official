/**
 * About Variant: Timeline
 * Company milestones displayed as a vertical timeline.
 */
import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';

export const AboutTimeline: React.FC<BaseSectionProps<'about'>> = ({ section, theme }) => {
  const { headline, description, image, cta } = section.props;
  // Split description by sentences for timeline items
  const sentences = description.split(/\.\s+/).filter(s => s.trim()).map(s => s.endsWith('.') ? s : s + '.');
  return (
    <section style={{ padding: theme.sectionPadding, background: hsl(theme.colors.background) }}>
      <div className="mx-auto px-6" style={{ maxWidth: '48rem' }}>
        {headline && <h2 className="text-3xl text-center mb-10" style={{ fontFamily: theme.typography.headingFont, fontWeight: theme.typography.headingWeight, color: hsl(theme.colors.foreground) }}>{headline}</h2>}
        <div className="relative" style={{ paddingLeft: '2rem' }}>
          <div className="absolute left-3 top-0 bottom-0 w-px" style={{ background: hsla(theme.colors.primary, 0.2) }} />
          {sentences.map((sentence, i) => (
            <div key={i} className="relative mb-8 pl-6">
              <div className="absolute -left-3 top-1.5 w-3 h-3 rounded-full" style={{ background: hsl(theme.colors.primary), border: `2px solid ${hsl(theme.colors.background)}` }} />
              <p className="text-base leading-relaxed" style={{ color: hsl(theme.colors.foreground) }}>{sentence}</p>
            </div>
          ))}
        </div>
        {cta && (
          <div className="text-center mt-8">
            <a href={cta.href || '#'} className="inline-block py-2.5 px-6 rounded text-sm font-medium" style={{ background: hsl(theme.colors.primary), color: hsl(theme.colors.primaryForeground), borderRadius: theme.radius, textDecoration: 'none' }}>{cta.label}</a>
          </div>
        )}
      </div>
    </section>
  );
};
