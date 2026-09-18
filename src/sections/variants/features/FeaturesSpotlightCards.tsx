import React, { useRef } from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl, hsla } from '../../themeUtils';
import { EditorialSection } from '../shared/EditorialSection';

export function FeaturesSpotlightCards({ section, theme }: BaseSectionProps<'features'>) {
  const root = useRef<HTMLDivElement>(null);
  return <EditorialSection variantId="features:spotlight-cards" theme={theme} headline={section.props.headline} description={section.props.subheadline}>
    <style>{`.ut-spotlight-card{position:relative;overflow:hidden}.ut-spotlight-card::before{content:'';position:absolute;inset:0;pointer-events:none;opacity:0;background:radial-gradient(350px circle at var(--spot-x,50%) var(--spot-y,50%),var(--spot-color),transparent 80%)}.ut-spotlight-card:hover::before,.ut-spotlight-card:focus-within::before{opacity:1}@media(prefers-reduced-motion:reduce){.ut-spotlight-card::before{display:none}}`}</style>
    <div ref={root} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" onPointerMove={event => {
      if (event.pointerType === 'touch' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const card = (event.target as HTMLElement).closest<HTMLElement>('[data-spotlight-card]');
      if (!card || !root.current?.contains(card)) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--spot-x', (event.clientX - rect.left) + 'px');
      card.style.setProperty('--spot-y', (event.clientY - rect.top) + 'px');
    }}>
      {(section.props.items ?? []).map((item, index) => <article key={index} data-spotlight-card data-ut-slot={'feature-' + index} className="ut-spotlight-card min-w-0 border p-7 sm:p-9" style={{ '--spot-color': hsla(theme.colors.primary, 0.16), borderColor: hsl(theme.colors.border), background: hsl(theme.colors.card), borderRadius: theme.radius, overflowWrap: 'anywhere' } as React.CSSProperties}>
        <div className="relative">
          <span aria-hidden="true" className="mb-6 block text-3xl">{item.icon}</span>
          <h3 className="text-xl font-semibold" style={{ fontFamily: theme.typography.headingFont }}>{item.title}</h3>
          <p className="mt-3 text-sm leading-7" style={{ color: hsl(theme.colors.mutedForeground) }}>{item.description}</p>
        </div>
      </article>)}
    </div>
  </EditorialSection>;
}
