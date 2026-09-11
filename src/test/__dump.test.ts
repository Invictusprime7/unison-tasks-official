import { it } from 'vitest';
import { commitToPipeline } from '@/platform/core/commitToPipeline';
import { buildCanonicalLaunchArtifacts } from '@/services/canonicalLaunchVfs';
import { THEME_PRESETS } from '@/components/onboarding/themePresets';
import { themePresetToThemeTokens } from '@/components/onboarding/themePresetToTokens';
it('dump', () => {
  const preset = THEME_PRESETS.find(p => p.id === 'editorial')!;
  const sel: any = { businessName: 'X', industryOverlay: 'salon', systemType: 'booking', scaffoldMode: 'selected-pages', themePresetId: 'editorial', themeTokens: themePresetToThemeTokens(preset), businessModel: 'appointment_service', primaryGoal: 'book', needsBooking: true, requestedPages: ['home','about','services','gallery','booking','contact'], primaryIntent: 'booking.create' };
  const laneA = commitToPipeline({ selections: sel }, 'wizard-launch');
  const artifacts = buildCanonicalLaunchArtifacts({ generatedFiles: laneA.siteBundleSnapshot.vfsFiles, preferredEntryPoint: '/src/App.tsx', siteBundleSnapshot: laneA.siteBundleSnapshot, compileArtifact: laneA.compileArtifact, compiledPlayground: laneA.compileResult, canonicalPlayground: laneA.playground, mergeWithCanonicalSnapshot: true, systemType: 'booking', systemName: 'booking', businessName: 'X', industry: 'salon', themePresetId: 'editorial', wizardSelections: sel, backendRequired: false } as any);
  const src = artifacts.files['/src/pages/Booking.tsx'] as string;
  console.log('==DUMP\n' + src.split('\n').slice(425, 470).map((l,i)=>(426+i)+': '+l.slice(0,200)).join('\n'));
});
