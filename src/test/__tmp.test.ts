import { describe, it } from 'vitest';
import { buildThemedIndexCss } from '@/components/onboarding/themePresetToIndexCss';
import { THEME_PRESETS } from '@/components/onboarding/themePresets';
import { buildCanonicalLaunchArtifacts } from '@/services/canonicalLaunchVfs';
describe('d', () => { it('x', () => {
  const css = buildThemedIndexCss(THEME_PRESETS.find(p=>p.id==='minimalist')!);
  console.log('CSSLEN', css.length, css.includes('--primary:'));
  try {
    buildCanonicalLaunchArtifacts({ generatedFiles: {'/src/App.tsx':'export default () => <button className="rounded-full">Start</button>;','/src/index.css':css}, preferredEntryPoint:'/src/App.tsx', themePresetId:'minimalist' } as any);
  } catch (e) { console.log('ERR', (e as Error).message); }
}); });
