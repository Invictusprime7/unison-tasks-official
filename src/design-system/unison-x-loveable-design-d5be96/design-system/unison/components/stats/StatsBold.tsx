import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl } from '../../themeUtils';
/** Unison original, inspired by the 21st.dev listing "Bold Stats — ui layout" (layout idea only; no third-party code). */
export const StatsBold: React.FC<BaseSectionProps<'stats'>> = ({section,theme}) => {
  const p = section.props;
  return <section data-ut-variant="stats:bold" style={{padding:theme.sectionPadding,background:hsl(theme.colors.primary),color:hsl(theme.colors.primaryForeground)}}>
    <div className="mx-auto px-5 sm:px-6 lg:px-8" style={{maxWidth:theme.containerWidth}}>{p.headline && <h2 data-ut-slot="stats.headline" className="mb-10 text-sm uppercase tracking-[0.2em] opacity-80" style={{fontFamily:theme.typography.bodyFont}}>{p.headline}</h2>}
      <dl className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">{(p.items||[]).map((s,i)=><div key={i} className="border-t pt-4" style={{borderColor:hsl(theme.colors.primaryForeground)}}><dt data-ut-slot={`stat-${i}.label`} className="order-2 text-sm opacity-80">{s.label}</dt><dd data-ut-slot={`stat-${i}.value`} className="text-6xl leading-none md:text-8xl" style={{fontFamily:theme.typography.headingFont,fontWeight:theme.typography.headingWeight}}>{s.value}</dd></div>)}</dl>
    </div></section>;
};
