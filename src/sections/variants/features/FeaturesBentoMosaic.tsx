import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl } from '../../themeUtils';
/** Unison original, inspired by the 21st.dev listing "Bento — KinfeMichael Tariku" (layout idea only; no third-party code). */
const span = ['md:col-span-2 md:row-span-2','md:col-span-1','md:col-span-1','md:col-span-2'];
export const FeaturesBentoMosaic: React.FC<BaseSectionProps<'features'>> = ({section,theme}) => {
  const p = section.props;
  return <section data-ut-variant="features:bento-mosaic" style={{padding:theme.sectionPadding,background:hsl(theme.colors.background)}}>
    <div className="mx-auto px-5 sm:px-6 lg:px-8" style={{maxWidth:theme.containerWidth}}><div className="mb-10 md:mb-14">{p.headline && <h2 data-ut-slot="features.headline" className="text-3xl md:text-5xl" style={{fontFamily:theme.typography.headingFont,fontWeight:theme.typography.headingWeight,color:hsl(theme.colors.foreground)}}>{p.headline}</h2>}{p.subheadline && <p data-ut-slot="features.subheadline" className="mt-3 max-w-2xl" style={{color:hsl(theme.colors.mutedForeground)}}>{p.subheadline}</p>}</div>
      <div className="grid auto-rows-[minmax(10rem,auto)] gap-4 md:grid-cols-4">{(p.items||[]).slice(0,6).map((f,i)=><article key={i} className={`relative flex flex-col justify-end overflow-hidden p-6 ${span[i%4]}`} style={{borderRadius:theme.radius,background:hsl(i===0?theme.colors.primary:theme.colors.muted),color:hsl(i===0?theme.colors.primaryForeground:theme.colors.foreground)}}>
        {f.image && i===0 && <img src={f.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-30" />}
        <h3 data-ut-slot={`feature-${i}.title`} className={`relative ${i===0?'text-2xl md:text-4xl':'text-lg'}`} style={{fontFamily:theme.typography.headingFont}}>{f.title}</h3>
        <p data-ut-slot={`feature-${i}.description`} className="relative mt-2 text-sm opacity-80">{f.description}</p>
      </article>)}</div></div></section>;
};
