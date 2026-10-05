import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl } from '../../themeUtils';
/** Unison original, inspired by the 21st.dev listing "Underline Hero Section — vvisedev Crafts" (layout idea only; no third-party code). */
export const HeroUnderline: React.FC<BaseSectionProps<'hero'>> = ({section,theme}) => {
  const p = section.props; const words = p.headline.split(' '); const last = words.pop();
  return <section data-ut-variant="hero:underline" style={{padding:theme.sectionPadding,background:hsl(theme.colors.background)}}>
    <div className="mx-auto px-5 sm:px-6 lg:px-8" style={{maxWidth:theme.containerWidth}}><div className="max-w-3xl py-8 md:py-16">
      <h1 data-ut-slot="hero.headline" className="text-4xl sm:text-5xl md:text-6xl" style={{fontFamily:theme.typography.headingFont,fontWeight:theme.typography.headingWeight,color:hsl(theme.colors.foreground)}}>{words.join(' ')} <span className="relative inline-block">{last}<span aria-hidden="true" className="absolute -bottom-1 left-0 h-[0.12em] w-full origin-left motion-safe:animate-[ut-underline_900ms_ease-out_both]" style={{background:hsl(theme.colors.accent)}} /></span></h1>
      {(p.description||p.subheadline) && <p data-ut-slot="hero.description" className="mt-6 max-w-xl text-base md:text-lg" style={{color:hsl(theme.colors.mutedForeground)}}>{p.description||p.subheadline}</p>}
      <div data-ut-slot="hero.actions" className="mt-8 flex flex-col gap-3 sm:flex-row">{(p.ctas||[]).map((c,i)=><a key={i} href={c.href||'#'} data-ut-intent={c.intent??'nav.goto'} className="inline-flex min-h-11 items-center justify-center px-6 py-3 text-sm font-semibold no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:transition-opacity hover:opacity-90" style={{borderRadius:theme.radius,background:i?'transparent':hsl(theme.colors.primary),color:i?hsl(theme.colors.foreground):hsl(theme.colors.primaryForeground),border:`1px solid ${hsl(i?theme.colors.border:theme.colors.primary)}`}}>{c.label}</a>)}</div>
    </div></div>
    <style>{`@keyframes ut-underline{from{transform:scaleX(0)}to{transform:scaleX(1)}}`}</style></section>;
};
