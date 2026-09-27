import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl } from '../../themeUtils';
import { PricingFrame, PricingCTA, normalizePricingTiers } from './PricingFrame';
/** Unison original, inspired by the 21st.dev listing "Pricing Section with Comparison — Tommy Jepsen" (layout idea only; no third-party code). */
export const PricingComparisonTable: React.FC<BaseSectionProps<'pricing'>> = ({section,theme}) => {
  const tiers = normalizePricingTiers(section.props.tiers); const feats = [...new Set(tiers.flatMap((t)=>t.features))];
  const line = `1px solid ${hsl(theme.colors.border)}`;
  return <PricingFrame variantId="pricing:comparison-table" theme={theme} headline={section.props.headline} subheadline={section.props.subheadline}>
    <div className="overflow-x-auto"><table className="w-full min-w-[36rem] border-collapse text-left text-sm" style={{color:hsl(theme.colors.foreground)}}>
      <caption className="sr-only">Plan comparison</caption>
      <thead><tr><th scope="col" className="p-4" style={{borderBottom:line}}><span className="sr-only">Feature</span></th>{tiers.map((t,i)=><th key={i} scope="col" className="p-4 align-bottom" style={{borderBottom:line,background:t.highlighted?hsl(theme.colors.background):undefined}}><span data-ut-slot={`tier-${i}.name`} className="block text-base">{t.name}</span><span data-ut-slot={`tier-${i}.price`} className="mt-1 block text-2xl md:text-3xl" style={{fontFamily:theme.typography.headingFont}}>{t.price}<small className="text-sm" style={{color:hsl(theme.colors.mutedForeground)}}>{t.period}</small></span></th>)}</tr></thead>
      <tbody>{feats.map((f,r)=><tr key={r}><th scope="row" className="p-4 font-normal" style={{borderBottom:line}}>{f}</th>{tiers.map((t,i)=><td key={i} className="p-4" style={{borderBottom:line,background:t.highlighted?hsl(theme.colors.background):undefined}}>{t.features.includes(f)?<span aria-label="Included">✓</span>:<span aria-label="Not included" style={{color:hsl(theme.colors.mutedForeground)}}>—</span>}</td>)}</tr>)}
      <tr><td /><>{tiers.map((t,i)=><td key={i} className="p-4"><PricingCTA tier={t} theme={theme} /></td>)}</></tr></tbody>
    </table></div></PricingFrame>;
};
