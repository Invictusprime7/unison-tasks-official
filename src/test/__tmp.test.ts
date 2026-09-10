import { describe, it } from 'vitest';
import { buildThemedIndexCss } from '@/components/onboarding/themePresetToIndexCss';
import { THEME_PRESETS } from '@/components/onboarding/themePresets';
import { normalizeLauncherFiles } from '@/services/canonicalLaunchVfs';
describe('d', () => { it('x', () => {
  const css = buildThemedIndexCss(THEME_PRESETS.find(p=>p.id==='minimalist')!);
  const out = (normalizeLauncherFiles as any)({'/src/App.tsx':'export default () => <button className="rounded-full">Start</button>;','/src/index.css':css}, {themePresetId:'minimalist'});
  console.log('KEYS', Object.keys(out.files ?? out));
}); });
