import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl } from '../../themeUtils';
/** Unison original, inspired by the 21st.dev listing "Integrations Section — Méschac Irung" (layout idea only; no third-party code). */
export const FeaturesIntegrations: React.FC<BaseSectionProps<'features'>> = ({section,theme}) => {
  const p = section.props;
  return <section data-ut-variant="features:integrations" style={{padding:theme.sectionPadding,background:hsl(theme.colors.muted)}}>
    <div className="mx-auto px-5 sm:px-6 lg:px-8" style={{maxWidth:theme.containerWidth}}><div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:items-center"><div><div className="mb-10 md:mb-14">{p.headline && <h2 data-ut-slot="features.headline" className="text-3xl md:text-5xl" style={{fontFamily:theme.typography.headingFont,fontWeight:theme.typography.headingWeight,color:hsl(theme.colors.foreground)}}>{p.headline}</h2>}{p.subheadline && <p data-ut-slot="features.subheadline" className="mt-3 max-w-2xl" style={{color:hsl(theme.colors.mutedForeground)}}>{p.subheadline}</p>}</div></div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">{(p.items||[]).map((f,i)=><li key={i} className="flex flex-col gap-2 p-5" style={{borderRadius:theme.radius,background:hsl(theme.colors.card),border:`1px solid ${hsl(theme.colors.border)}`}}>
        <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center text-sm font-semibold" style={{borderRadius:theme.radius,background:hsl(theme.colors.primary),color:hsl(theme.colors.primaryForeground)}}>{f.title.slice(0,2).toUpperCase()}</span>
        <h3 data-ut-slot={`feature-${i}.title`} className="text-sm font-semibold" style={{color:hsl(theme.colors.cardForeground)}}>{f.title}</h3>
        <p data-ut-slot={`feature-${i}.description`} className="text-xs" style={{color:hsl(theme.colors.mutedForeground)}}>{f.description}</p>
      </li>)}</ul></div></div></section>;
};
