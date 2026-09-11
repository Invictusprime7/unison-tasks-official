import { it } from 'vitest';
import { commitToPipeline } from '@/platform/core/commitToPipeline';
import { buildCanonicalLaunchArtifacts } from '@/services/canonicalLaunchVfs';
import { THEME_PRESETS } from '@/components/onboarding/themePresets';
import { themePresetToThemeTokens } from '@/components/onboarding/themePresetToTokens';
import { auditLayoutSource } from '@/services/layoutSnapshotAudit';
it('dump', () => {
  const preset = THEME_PRESETS.find(p => p.id === 'editorial')!;
  const sel: any = { businessName: 'X', industryOverlay: 'salon', systemType: 'booking', scaffoldMode: 'selected-pages', themePresetId: 'editorial', themeTokens: themePresetToThemeTokens(preset), businessModel: 'appointment_service', primaryGoal: 'book', needsBooking: true, requestedPages: ['home','about','services','gallery','booking','contact'], primaryIntent: 'booking.create' };
  const laneA = commitToPipeline({ selections: sel }, 'wizard-launch');
  const artifacts = buildCanonicalLaunchArtifacts({ generatedFiles: laneA.siteBundleSnapshot.vfsFiles, preferredEntryPoint: '/src/App.tsx', siteBundleSnapshot: laneA.siteBundleSnapshot, compileArtifact: laneA.compileArtifact, compiledPlayground: laneA.compileResult, canonicalPlayground: laneA.playground, mergeWithCanonicalSnapshot: true, systemType: 'booking', systemName: 'booking', businessName: 'X', industry: 'salon', themePresetId: 'editorial', wizardSelections: sel, backendRequired: false } as any);
  for (const [p, src] of Object.entries(artifacts.files)) {
    if (!/^\/src\/pages\/[^/]+\.tsx$/.test(p)) continue;
    const snap = auditLayoutSource(p, src as string);
    const bad = snap.issues.filter(i => i.code === 'uncontained-section' || i.code === 'grid-without-gap');
    if (!bad.length) continue;
    console.log('==DUMP', p, JSON.stringify(bad));
    const lines = (src as string).split('\n');
    for (const i of bad) if (i.line) console.log('LINE', i.line, '>>', lines[i.line-1]?.slice(0,220));
  }
});
