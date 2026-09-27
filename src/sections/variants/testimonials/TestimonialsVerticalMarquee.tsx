import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl } from '../../themeUtils';
/** Unison original, inspired by the 21st.dev listing "Vertical Testimonials Marquee — ShadcnSpace" (layout idea only; no third-party code). */
export const TestimonialsVerticalMarquee: React.FC<BaseSectionProps<'testimonials'>> = ({section,theme}) => {
  const p = section.props; const items = p.items || [];
  const cols = [items.filter((_,i)=>i%2===0), items.filter((_,i)=>i%2===1)];
  const card = (t: typeof items[number], k: string, hidden?: boolean) => <figure key={k} aria-hidden={hidden||undefined} className="p-6" style={{borderRadius:theme.radius,background:hsl(theme.colors.card),border:`1px solid ${hsl(theme.colors.border)}`}}><blockquote data-ut-slot={hidden?undefined:`${k}.quote`} style={{color:hsl(theme.colors.cardForeground)}}>“{t.quote}”</blockquote><figcaption data-ut-slot={hidden?undefined:`${k}.author`} className="mt-4 text-sm" style={{color:hsl(theme.colors.mutedForeground)}}>{t.author}{t.role ? `, ${t.role}` : ''}</figcaption></figure>;
  return <section data-ut-variant="testimonials:vertical-marquee" style={{padding:theme.sectionPadding,background:hsl(theme.colors.muted)}}>
    <div className="mx-auto px-5 sm:px-6 lg:px-8" style={{maxWidth:theme.containerWidth}} ><div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-center"><div><div className="mb-10 md:mb-14">{p.headline && <h2 data-ut-slot="testimonials.headline" className="text-3xl md:text-5xl" style={{fontFamily:theme.typography.headingFont,fontWeight:theme.typography.headingWeight,color:hsl(theme.colors.foreground)}}>{p.headline}</h2>}{p.subheadline && <p data-ut-slot="testimonials.subheadline" className="mt-3 max-w-2xl" style={{color:hsl(theme.colors.mutedForeground)}}>{p.subheadline}</p>}</div></div>
      <div className="grid h-[28rem] gap-4 overflow-hidden sm:grid-cols-2 md:h-[36rem]" style={{maskImage:'linear-gradient(transparent,black 12%,black 88%,transparent)'}}>
        {cols.map((col,c)=><div key={c} className={`flex flex-col gap-4 motion-safe:animate-[ut-vmarquee_32s_linear_infinite] motion-reduce:animate-none ${c?'hidden sm:flex motion-safe:[animation-direction:reverse]':''}`}>{col.map((t,i)=>card(t,`testimonial-${c}-${i}`))}<div className="flex flex-col gap-4 motion-reduce:hidden">{col.map((t,i)=>card(t,`dup-${c}-${i}`,true))}</div></div>)}
      </div></div></div>
    <style>{`@keyframes ut-vmarquee{from{transform:translateY(0)}to{transform:translateY(-50%)}}`}</style></section>;
};
