import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl } from '../../themeUtils';
/** Unison original, inspired by the 21st.dev listing "Team — Méschac Irung" (layout idea only; no third-party code). */
export const TeamEditorial: React.FC<BaseSectionProps<'team'>> = ({section,theme}) => {
  const p = section.props;
  return <section data-ut-variant="team:editorial" style={{padding:theme.sectionPadding,background:hsl(theme.colors.background)}}>
    <div className="mx-auto px-5 sm:px-6 lg:px-8" style={{maxWidth:theme.containerWidth}}><div className="mb-10 md:mb-14">{p.headline && <h2 data-ut-slot="team.headline" className="text-3xl md:text-5xl" style={{fontFamily:theme.typography.headingFont,fontWeight:theme.typography.headingWeight,color:hsl(theme.colors.foreground)}}>{p.headline}</h2>}{p.subheadline && <p data-ut-slot="team.subheadline" className="mt-3 max-w-2xl" style={{color:hsl(theme.colors.mutedForeground)}}>{p.subheadline}</p>}</div>
      <ul className="border-t" style={{borderColor:hsl(theme.colors.border)}}>{(p.members||[]).map((m,i)=><li key={i} className="grid items-center gap-4 border-b py-5 sm:grid-cols-[4rem_1fr_1fr] md:grid-cols-[5rem_1fr_1fr_2fr]" style={{borderColor:hsl(theme.colors.border)}}>
        {m.image ? <img src={m.image} alt={m.name} loading="lazy" className="h-16 w-16 object-cover md:h-20 md:w-20" style={{borderRadius:theme.radius}} /> : <span />}
        <h3 data-ut-slot={`member-${i}.name`} className="text-xl" style={{fontFamily:theme.typography.headingFont,fontWeight:theme.typography.headingWeight,color:hsl(theme.colors.foreground)}}>{m.name}</h3>
        <p data-ut-slot={`member-${i}.role`} className="text-sm uppercase tracking-[0.12em]" style={{color:hsl(theme.colors.mutedForeground)}}>{m.role}</p>
        {m.bio && <p data-ut-slot={`member-${i}.bio`} className="hidden text-sm md:block" style={{color:hsl(theme.colors.mutedForeground)}}>{m.bio}</p>}
      </li>)}</ul></div></section>;
};
