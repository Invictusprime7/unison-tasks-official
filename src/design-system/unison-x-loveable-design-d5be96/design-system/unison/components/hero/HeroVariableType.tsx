import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl } from '../../themeUtils';
/** Unison original, inspired by the 21st.dev listing "Variable Font Hover Hero — Cnippet" (layout idea only; no third-party code). */
export const HeroVariableType: React.FC<BaseSectionProps<'hero'>> = ({section,theme}) => {
  const p = section.props;
  return <section data-ut-variant="hero:variable-type" style={{padding:theme.sectionPadding,background:hsl(theme.colors.background),borderBottom:`1px solid ${hsl(theme.colors.border)}`}}>
    <div className="mx-auto px-5 sm:px-6 lg:px-8" style={{maxWidth:theme.containerWidth}}>
      {p.badge && <p data-ut-slot="hero.badge" className="mb-6 text-xs uppercase tracking-[0.2em]" style={{color:hsl(theme.colors.mutedForeground)}}>{p.badge}</p>}
      <h1 data-ut-slot="hero.headline" aria-label={p.headline} className="text-5xl leading-[0.95] sm:text-7xl md:text-8xl lg:text-9xl" style={{fontFamily:theme.typography.headingFont,fontWeight:theme.typography.headingWeight,color:hsl(theme.colors.foreground)}}>
        {p.headline.split(' ').map((w,i)=><span key={i} aria-hidden="true" className="inline-block pr-[0.25em] motion-safe:transition-[font-weight,letter-spacing] motion-safe:duration-300 hover:tracking-tight" style={{fontWeight:300}} onMouseEnter={(e)=>(e.currentTarget.style.fontWeight='800')} onMouseLeave={(e)=>(e.currentTarget.style.fontWeight='300')}>{w}</span>)}
      </h1>
      <div className="mt-10 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
        {(p.description||p.subheadline) && <p data-ut-slot="hero.description" className="max-w-xl text-base md:text-lg" style={{color:hsl(theme.colors.mutedForeground)}}>{p.description||p.subheadline}</p>}
        <div data-ut-slot="hero.actions" className="flex flex-col gap-3 sm:flex-row">{(p.ctas||[]).map((c,i)=><a key={i} href={c.href||'#'} data-ut-intent={c.intent??'nav.goto'} className="inline-flex min-h-11 items-center justify-center px-6 py-3 text-sm font-semibold no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:transition-opacity hover:opacity-90" style={{borderRadius:theme.radius,background:i?'transparent':hsl(theme.colors.primary),color:i?hsl(theme.colors.foreground):hsl(theme.colors.primaryForeground),border:`1px solid ${hsl(i?theme.colors.border:theme.colors.primary)}`}}>{c.label}</a>)}</div>
      </div></div></section>;
};
