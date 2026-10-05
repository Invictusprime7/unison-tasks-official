import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl } from '../../themeUtils';
/** Unison original, inspired by the 21st.dev listing "Call To Action — Méschac Irung" (layout idea only; no third-party code). */
export const CTAEditorial: React.FC<BaseSectionProps<'cta'>> = ({section,theme}) => {
  const p = section.props;
  return <section data-ut-variant="cta:editorial" style={{padding:theme.sectionPadding,background:hsl(theme.colors.background)}}>
    <div className="mx-auto px-5 sm:px-6 lg:px-8" style={{maxWidth:theme.containerWidth}}><div className="grid gap-8 border-t pt-10 md:grid-cols-[2fr_1fr] md:items-end md:pt-16" style={{borderColor:hsl(theme.colors.foreground)}}>
      <div><h2 data-ut-slot="cta.headline" className="text-4xl sm:text-5xl md:text-6xl" style={{fontFamily:theme.typography.headingFont,fontWeight:theme.typography.headingWeight,color:hsl(theme.colors.foreground)}}>{p.headline}</h2>
      {p.description && <p data-ut-slot="cta.description" className="mt-4 max-w-xl text-base md:text-lg" style={{color:hsl(theme.colors.mutedForeground)}}>{p.description}</p>}</div>
      <div data-ut-slot="cta.actions" className="flex flex-col gap-3 md:items-end">{(p.ctas||[]).map((c,i)=><a key={i} href={c.href||'#'} data-ut-intent={c.intent??'nav.goto'} className="inline-flex min-h-11 items-center justify-center px-6 py-3 text-sm font-semibold no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:transition-opacity hover:opacity-90" style={{borderRadius:theme.radius,background:i?'transparent':hsl(theme.colors.primary),color:i?hsl(theme.colors.foreground):hsl(theme.colors.primaryForeground),border:`1px solid ${hsl(i?theme.colors.border:theme.colors.primary)}`}}>{c.label}</a>)}</div>
    </div></div></section>;
};
