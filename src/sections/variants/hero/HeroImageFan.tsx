import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl } from '../../themeUtils';
/** Unison original, inspired by the 21st.dev listing "Centered Hero with Image Fan — felipemenezes098" (layout idea only; no third-party code). */
export const HeroImageFan: React.FC<BaseSectionProps<'hero'>> = ({section,theme}) => {
  const p = section.props; const imgs = (p.images?.length ? p.images.map((g)=>g.src) : [p.image]).filter(Boolean).slice(0,5) as string[];
  const mid = (imgs.length-1)/2;
  return <section data-ut-variant="hero:image-fan" style={{padding:theme.sectionPadding,background:hsl(theme.colors.background)}}>
    <div className="mx-auto px-5 sm:px-6 lg:px-8" style={{maxWidth:theme.containerWidth}}><div className="text-center">
      {p.badge && <p data-ut-slot="hero.badge" className="mb-4 text-xs uppercase tracking-[0.18em]" style={{color:hsl(theme.colors.mutedForeground)}}>{p.badge}</p>}
      <h1 data-ut-slot="hero.headline" className="mx-auto max-w-4xl text-4xl sm:text-5xl md:text-7xl" style={{fontFamily:theme.typography.headingFont,fontWeight:theme.typography.headingWeight,color:hsl(theme.colors.foreground)}}>{p.headline}</h1>
      {(p.subheadline||p.description) && <p data-ut-slot="hero.description" className="mx-auto mt-5 max-w-2xl text-base md:text-lg" style={{color:hsl(theme.colors.mutedForeground),fontFamily:theme.typography.bodyFont}}>{p.description||p.subheadline}</p>}
      <div data-ut-slot="hero.actions" className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">{(p.ctas||[]).map((c,i)=><a key={i} href={c.href||'#'} data-ut-intent={c.intent??'nav.goto'} className="inline-flex min-h-11 items-center justify-center px-6 py-3 text-sm font-semibold no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:transition-opacity hover:opacity-90" style={{borderRadius:theme.radius,background:i?'transparent':hsl(theme.colors.primary),color:i?hsl(theme.colors.foreground):hsl(theme.colors.primaryForeground),border:`1px solid ${hsl(i?theme.colors.border:theme.colors.primary)}`}}>{c.label}</a>)}</div>
    </div>
    <div data-ut-slot="hero.media" className="relative mx-auto mt-14 flex h-56 max-w-3xl items-end justify-center sm:h-72 md:h-96">
      {imgs.map((src,i)=><img key={i} src={src} alt="" loading="lazy" className="absolute bottom-0 h-44 w-32 object-cover shadow-lg sm:h-60 sm:w-44 md:h-80 md:w-56 motion-safe:transition-transform motion-safe:duration-500" style={{borderRadius:theme.radius,transform:`translateX(${(i-mid)*38}%) rotate(${(i-mid)*7}deg)`,zIndex:10-Math.abs(i-mid)}} />)}
    </div></div></section>;
};
