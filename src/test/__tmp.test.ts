import { describe, it } from 'vitest';
import { buildThemedIndexCss } from '@/components/onboarding/themePresetToIndexCss';
import { THEME_PRESETS } from '@/components/onboarding/themePresets';
import { runFullPreflight } from '@/services/runFullPreflight';
describe('d', () => { it('x', () => {
  const css = buildThemedIndexCss(THEME_PRESETS.find(p=>p.id==='minimalist')!);
  const r = runFullPreflight({'/src/App.tsx':'export default () => <button className="rounded-full">Start</button>;','/src/index.css':css});
  console.log('KEYS', JSON.stringify(Object.keys(r.files)));
}); });
