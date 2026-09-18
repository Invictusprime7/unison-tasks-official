import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { getAllIndustries } from '../src/platform/core/industryMatrix';
import { getDefaultTemplateCardForIndustry, SYSTEM_TO_BUSINESS_MODEL } from '../src/components/onboarding/wizard/wizardCatalog';
import { getCompositionById } from '../src/sections/templates';
import { getVariantById } from '../src/sections/variants';
import { resolveThemeTokens } from '../src/sections/themes';
import { buildWizardDesignIntervention } from '../src/services/wizardDesignIntervention';
import '../src/index.css';
const industries = getAllIndustries();
function Review() {
 const [industry, setIndustry] = useState(industries[0].industry);
 const profile = industries.find(entry => entry.industry === industry)!;
 const template = getCompositionById(getDefaultTemplateCardForIndustry(industry)!.id)!;
 const theme = resolveThemeTokens(template.theme);
 const design = buildWizardDesignIntervention({ businessName: 'Launch review', businessModel: SYSTEM_TO_BUSINESS_MODEL[profile.systemType], industryOverlay: industry, templateId: template.id, themePresetId: 'editorial', wizardSeedId: 'browser-proof' });
 return <main><header style={{ padding:16, background:'#0f172a', color:'white' }}><label>Industry <select aria-label="Industry" value={industry} onChange={event => setIndustry(event.target.value)} style={{background:'#243348',padding:8}}>{industries.map(entry => <option key={entry.industry} value={entry.industry}>{entry.name}</option>)}</select></label><p>Registered components selected by the Launcher. Local review; no launch or save.</p></header>{template.sections.filter(section => !section.hidden).map(section => {const variant=getVariantById(design.activeVariants[section.id])!;const Component=variant.component;return <div key={industry+section.id} data-review-variant={variant.id}><div style={{padding:8,background:'#0f172a',color:'#67e8f9',fontSize:12}}>{variant.id} {variant.source?.origin==='21st'?' / 21st-derived':''}</div><Component section={{...section,variantId:variant.id} as never} theme={theme}/></div>;})}</main>;
}
if(import.meta.env.DEV) createRoot(document.getElementById('root')!).render(<Review/>);
