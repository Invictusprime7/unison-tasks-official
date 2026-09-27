import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl } from '../../themeUtils';
/** Unison original, inspired by the 21st.dev listing "Testimonials Five — Méschac Irung" (layout idea only; no third-party code). */
export const TestimonialsEditorial: React.FC<BaseSectionProps<'testimonials'>> = ({section,theme}) => {
  const p = section.props; const [lead, ...rest] = p.items || [];
  return <section data-ut-variant="testimonials:editorial" style={{padding:theme.sectionPadding,background:hsl(theme.colors.background)}}>
    <div className="mx-auto px-5 sm:px-6 lg:px-8" style={{maxWidth:theme.containerWidth}}><div className="mb-10 md:mb-14">{p.headline && <h2 data-ut-slot="testimonials.headline" className="text-3xl md:text-5xl" style={{fontFamily:theme.typography.headingFont,fontWeight:theme.typography.headingWeight,color:hsl(theme.colors.foreground)}}>{p.headline}</h2>}{p.subheadline && <p data-ut-slot="testimonials.subheadline" className="mt-3 max-w-2xl" style={{color:hsl(theme.colors.mutedForeground)}}>{p.subheadline}</p>}</div>
      {lead && <figure className="border-t pt-8 md:pt-12" style={{borderColor:hsl(theme.colors.foreground)}}><blockquote data-ut-slot="testimonial-0.quote" className="max-w-4xl text-2xl leading-snug md:text-4xl" style={{fontFamily:theme.typography.headingFont,fontWeight:theme.typography.headingWeight,color:hsl(theme.colors.foreground)}}>“{lead.quote}”</blockquote><figcaption className="mt-6 text-sm" style={{color:hsl(theme.colors.mutedForeground)}}><span data-ut-slot="testimonial-0.author" style={{color:hsl(theme.colors.foreground)}}>{lead.author}</span>{lead.role && <> — {lead.role}</>}</figcaption></figure>}
      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{rest.map((t,i)=><figure key={i} className="border-t pt-5" style={{borderColor:hsl(theme.colors.border)}}><blockquote data-ut-slot={`testimonial-${i+1}.quote`} className="text-base" style={{color:hsl(theme.colors.foreground)}}>“{t.quote}”</blockquote><figcaption data-ut-slot={`testimonial-${i+1}.author`} className="mt-3 text-xs uppercase tracking-[0.14em]" style={{color:hsl(theme.colors.mutedForeground)}}>{t.author}{t.role ? ` · ${t.role}` : ''}</figcaption></figure>)}</div>
    </div></section>;
};
