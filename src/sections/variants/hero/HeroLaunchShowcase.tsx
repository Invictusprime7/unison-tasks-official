import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';
/** Local adaptation of 21st:1526, Launch UI Hero Section (MIT). */
export const HeroLaunchShowcase: React.FC<BaseSectionProps<'hero'>> = ({ section, theme }) => {
  const { headline, subheadline, description, badge, ctas = [], image, backgroundImage } = section.props;
  return <section data-ut-variant="hero:launch-showcase" style={{padding:theme.sectionPadding,background:hsl(theme.colors.background),color:hsl(theme.colors.foreground)}}>
    <div className="mx-auto flex flex-col items-center gap-8 px-6 text-center" style={{maxWidth:theme.containerWidth}}>
      {badge && <span data-ut-slot="hero.badge" className="rounded-full border px-4 py-1 text-sm" style={{borderColor:hsl(theme.colors.border)}}>{badge}</span>}
      <h1 data-ut-slot="hero.headline" className="max-w-5xl text-4xl leading-tight sm:text-6xl lg:text-7xl" style={{fontFamily:theme.typography.headingFont,fontWeight:theme.typography.headingWeight}}>{headline}</h1>
      {(subheadline || description) && <p data-ut-slot="hero.subheadline" className="max-w-2xl text-lg" style={{color:hsl(theme.colors.mutedForeground)}}>{subheadline || description}</p>}
      <div className="flex flex-wrap justify-center gap-4">{ctas.map((cta,i)=><a key={i} href={cta.href || '#'} data-ut-intent={cta.intent} data-ut-cta={i ? 'cta.hero-secondary' : 'cta.hero'} className="px-6 py-3 font-medium" style={{borderRadius:theme.radius,background:hsl(i ? theme.colors.muted : theme.colors.primary),color:hsl(i ? theme.colors.foreground : theme.colors.primaryForeground)}}>{cta.label}</a>)}</div>
      {(image || backgroundImage) && <div className="mt-8 w-full overflow-hidden border p-2" style={{borderColor:hsl(theme.colors.border),borderRadius:theme.radius,boxShadow:'0 24px 80px '+hsla(theme.colors.primary,.16)}}><img data-ut-slot="hero.image" src={image || backgroundImage} alt={headline || ''} className="aspect-video w-full object-cover" /></div>}
    </div>
  </section>;
};
