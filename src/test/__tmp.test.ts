import { describe, it } from 'vitest';
import { buildThemedIndexCss } from '@/components/onboarding/themePresetToIndexCss';
import { THEME_PRESETS } from '@/components/onboarding/themePresets';
import { normalizeLauncherFiles } from '@/utils/sandpackFilePrep';
describe('d', () => { it('x', () => {
  const css = buildThemedIndexCss(THEME_PRESETS.find(p=>p.id==='minimalist')!);
  const out = normalizeLauncherFiles({'/src/App.tsx':'export default () => <button className="rounded-full">Start</button>;','/src/index.css':css}, { entryPoint:'/src/App.tsx', themePresetId:'minimalist', allowMissingWizardArtifacts:true, injectCssIfMissing:false } as any);
  console.log('KEYS', JSON.stringify(Object.keys(out)));
}); });
