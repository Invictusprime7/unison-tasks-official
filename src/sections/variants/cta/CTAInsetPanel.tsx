import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl } from '../../themeUtils';
/** Adapted from 21st:1414 by Tommy Jepsen (MIT); business CTAs replace demo buttons. */
export const CTAInsetPanel: React.FC<BaseSectionProps<'cta'>> = ({section,theme}) => <section data-ut-variant="cta:inset-panel" style={{padding:theme.sectionPadding,background:hsl(theme.colors.background)}}>
 <div className="mx-auto px-6" style={{maxWidth:theme.containerWidth}}><div className="flex flex-col items-center gap-7 p-8 text-center md:p-16" style={{borderRadius:theme.radius,background:hsl(theme.colors.muted)}}>
 <h2 className="max-w-3xl text-3xl md:text-5xl" style={{fontFamily:theme.typography.headingFont,fontWeight:theme.typography.headingWeight,color:hsl(theme.colors.foreground)}}>{section.props.headline}</h2>
 {section.props.description && <p className="max-w-2xl text-lg" style={{color:hsl(theme.colors.mutedForeground)}}>{section.props.description}</p>}
 <div className="flex flex-wrap justify-center gap-4">{(section.props.ctas || []).map((cta,i)=><a key={i} href={cta.href || '#'} data-ut-intent={cta.intent} data-ut-cta={i ? 'cta.banner-secondary' : 'cta.banner'} className="border px-6 py-3" style={{borderRadius:theme.radius,borderColor:hsl(theme.colors.border),background:hsl(i ? theme.colors.background : theme.colors.primary),color:hsl(i ? theme.colors.foreground : theme.colors.primaryForeground)}}>{cta.label}<span aria-hidden="true"> ?</span></a>)}</div>
 </div></div></section>;
