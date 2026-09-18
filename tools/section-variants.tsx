import React from 'react';
import { createRoot } from 'react-dom/client';
import { getVariantsForSection } from '../src/sections/variants';
import { premiumFamilies, premiumSectionProps } from '../src/test/fixtures/premiumSectionVariants';
import type { SectionEntry, ThemeTokens } from '../src/sections/types';
import '../src/index.css';

const theme: ThemeTokens = { colors: { primary:'150 22% 23%', primaryForeground:'45 30% 98%', secondary:'35 20% 90%', secondaryForeground:'150 20% 15%', accent:'35 30% 85%', accentForeground:'150 20% 15%', background:'45 25% 97%', foreground:'150 15% 16%', muted:'40 18% 92%', mutedForeground:'150 6% 39%', card:'40 35% 99%', cardForeground:'150 15% 16%', border:'40 12% 81%' }, typography: { headingFont:'Georgia, serif', bodyFont:'Arial, sans-serif', headingWeight:'400',bodyWeight:'400' },radius:'1rem',sectionPadding:'4rem 0',containerWidth:'1120px' };
const variants = premiumFamilies.flatMap(f => getVariantsForSection(f).filter(v => (v.tags?.includes('route-design') || v.tags?.includes('popular-source'))));
const requested = new URLSearchParams(location.search).get('variant');
const shown = requested ? variants.filter(v => v.id === requested) : variants;
if (import.meta.env.DEV) createRoot(document.getElementById('root')!).render(<main><header style={{ padding:'1rem',background:'#263c32',color:'#fff',fontFamily:'Arial' }}><h1 style={{ fontSize:20 }}>Section variant review</h1><p>Development fixtures - {shown.length} variants</p></header>{shown.map(v => { const Component=v.component; return <div key={v.id}><div style={{padding:'1rem',borderBottom:'1px solid #ddd',fontFamily:'monospace',fontSize:12}}>{v.id}</div><Component section={{id:'preview-'+v.slug,type:v.sectionType,variantId:v.id,props:premiumSectionProps[v.sectionType]} as SectionEntry} theme={theme}/></div>; })}</main>);
