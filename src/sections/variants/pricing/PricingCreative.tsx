import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl } from '../../themeUtils';
import { PricingFrame, PricingCTA, normalizePricingTiers } from './PricingFrame';
/** Unison original, inspired by the 21st.dev listing "Creative Pricing — Kokonut Baffier" (layout idea only; no third-party code). */
export const PricingCreative: React.FC<BaseSectionProps<'pricing'>> = ({section,theme}) => {
  const tiers = normalizePricingTiers(section.props.tiers);
  return <PricingFrame variantId="pricing:creative" theme={theme} headline={section.props.headline} subheadline={section.props.subheadline}>
    <div className="grid gap-6 md:grid-cols-3">{tiers.map((t,i)=><article key={i} className="relative flex flex-col p-7 motion-safe:transition-transform motion-safe:hover:-translate-y-1" style={{background:hsl(t.highlighted?theme.colors.foreground:theme.colors.background),color:hsl(t.highlighted?theme.colors.background:theme.colors.foreground),border:`2px solid ${hsl(theme.colors.foreground)}`,boxShadow:`6px 6px 0 ${hsl(theme.colors.foreground)}`,transform:`rotate(${(i-1)*0.8}deg)`}}>
      {t.badge && <span data-ut-slot={`tier-${i}.badge`} className="absolute -top-3 left-6 px-2 text-xs uppercase" style={{background:hsl(theme.colors.accent),color:hsl(theme.colors.accentForeground)}}>{t.badge}</span>}
      <h3 data-ut-slot={`tier-${i}.name`} className="text-xl" style={{fontFamily:theme.typography.headingFont}}>{t.name}</h3>
      <p data-ut-slot={`tier-${i}.price`} className="mt-4 text-5xl" style={{fontFamily:theme.typography.headingFont}}>{t.price}<small className="text-base opacity-70">{t.period}</small></p>
      <ul className="mt-6 flex-1 space-y-2 text-sm">{t.features.map((f,k)=><li key={k}>→ {f}</li>)}</ul>
      <PricingCTA tier={t} theme={theme} />
    </article>)}</div></PricingFrame>;
};
