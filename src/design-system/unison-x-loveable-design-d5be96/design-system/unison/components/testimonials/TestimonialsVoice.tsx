import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl } from '../../themeUtils';
/** Unison original, inspired by the 21st.dev listing "Voice Testimonial — Ayushmaan Singh" (layout idea only; no third-party code). */
const bars = [40,70,55,90,35,80,60,45,75,50,65,30];
export const TestimonialsVoice: React.FC<BaseSectionProps<'testimonials'>> = ({section,theme}) => {
  const p = section.props;
  return <section data-ut-variant="testimonials:voice" style={{padding:theme.sectionPadding,background:hsl(theme.colors.background)}}>
    <div className="mx-auto px-5 sm:px-6 lg:px-8" style={{maxWidth:theme.containerWidth}}><div className="mb-10 md:mb-14">{p.headline && <h2 data-ut-slot="testimonials.headline" className="text-3xl md:text-5xl" style={{fontFamily:theme.typography.headingFont,fontWeight:theme.typography.headingWeight,color:hsl(theme.colors.foreground)}}>{p.headline}</h2>}{p.subheadline && <p data-ut-slot="testimonials.subheadline" className="mt-3 max-w-2xl" style={{color:hsl(theme.colors.mutedForeground)}}>{p.subheadline}</p>}</div>
      <div className="grid gap-5 md:grid-cols-2">{(p.items||[]).map((t,i)=><figure key={i} className="flex gap-5 p-6" style={{borderRadius:theme.radius,border:`1px solid ${hsl(theme.colors.border)}`}}>
        <div aria-hidden="true" className="flex h-14 shrink-0 items-center gap-[3px]">{bars.map((h,b)=><span key={b} className="w-1 rounded-full" style={{height:`${h}%`,background:hsl(b%3?theme.colors.border:theme.colors.accent)}} />)}</div>
        <div><blockquote data-ut-slot={`testimonial-${i}.quote`} style={{color:hsl(theme.colors.foreground)}}>“{t.quote}”</blockquote><figcaption data-ut-slot={`testimonial-${i}.author`} className="mt-3 text-sm" style={{color:hsl(theme.colors.mutedForeground)}}>{t.author}{t.role ? ` · ${t.role}` : ''}</figcaption></div>
      </figure>)}</div></div></section>;
};
