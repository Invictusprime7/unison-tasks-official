import { it } from 'vitest';
import { commitToPipeline } from '@/platform/core/commitToPipeline';
import { compilePlayground } from '@/services/playgroundCompiler';
import { THEME_PRESETS } from '@/components/onboarding/themePresets';
import { themePresetToThemeTokens } from '@/components/onboarding/themePresetToTokens';
it('repro', () => {
  const preset = THEME_PRESETS[0];
  const launched = commitToPipeline({ selections: {
    businessName: 'Role Healing Co', businessModel: 'appointment_service', industryOverlay: 'real-estate',
    primaryGoal: 'showcase', secondaryGoals: [], requestedPages: ['immersive'],
    templateId: 'real-estate-premium', themePresetId: preset.id, themeTokens: themePresetToThemeTokens(preset),
  } }, 'wizard-launch');
  const registry = launched.playground.pageRegistry;
  const immersive = Object.values(registry.pages).find((p: any) => p.path === '/experience')! as any;
  immersive.pageRole = 'custom'; immersive.pageType = 'custom';
  try {
    compilePlayground(launched.playground, launched.siteBundleSnapshot.vfsFiles, 'Role Healing Co', {
      selectedTemplateId: 'real-estate-premium', stage4bCss: launched.siteBundleSnapshot.vfsFiles['/src/index.css'],
    });
    console.log('OK');
  } catch (e: any) { console.log('STACK:\n' + e.stack); }
});
