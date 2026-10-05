import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl } from '../../themeUtils';
/** Unison original, inspired by the 21st.dev listing "Footer Section — Shaban Haider" (layout idea only; no third-party code). */
export const FooterMultiColumn: React.FC<BaseSectionProps<'footer'>> = ({section,theme}) => {
  const p = section.props;
  return <footer data-ut-variant="footer:multi-column" style={{padding:'4rem 0 2rem',background:hsl(theme.colors.muted),borderTop:`1px solid ${hsl(theme.colors.border)}`}}>
    <div className="mx-auto px-5 sm:px-6 lg:px-8" style={{maxWidth:theme.containerWidth}}><div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_repeat(4,1fr)]">
      <div data-ut-slot="footer.brand"><p className="text-xl" style={{fontFamily:theme.typography.headingFont,fontWeight:theme.typography.headingWeight,color:hsl(theme.colors.foreground)}}>{p.brand}</p>
        {!!p.socials?.length && <ul className="mt-4 flex gap-4">{p.socials.map((s,i)=><li key={i}><a href={s.url} data-ut-intent="nav.goto" className="text-sm capitalize underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2" style={{color:hsl(theme.colors.mutedForeground)}}>{s.platform}</a></li>)}</ul>}</div>
      {(p.columns||[]).map((col,i)=><nav key={i} aria-label={col.title} data-ut-slot="footer.links"><p className="mb-3 text-xs uppercase tracking-[0.14em]" style={{color:hsl(theme.colors.mutedForeground)}}>{col.title}</p><ul className="space-y-2">{col.links.map((l,k)=><li key={k}><a href={l.href} data-ut-intent="nav.goto" className="text-sm underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2" style={{color:hsl(theme.colors.foreground)}}>{l.label}</a></li>)}</ul></nav>)}
    </div>
    {p.copyright && <p data-ut-slot="footer.copyright" className="mt-12 border-t pt-6 text-xs" style={{borderColor:hsl(theme.colors.border),color:hsl(theme.colors.mutedForeground)}}>{p.copyright}</p>}
    </div></footer>;
};
