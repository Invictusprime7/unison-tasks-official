import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { THEME_PRESETS } from '@/components/onboarding/themePresets';
import { themePresetToThemeTokens } from '@/components/onboarding/themePresetToTokens';
import { buildCanonicalLaunchPlan } from '@/services/launch/canonicalLaunchPlan';
import { commitToPipeline } from '@/platform/core/commitToPipeline';
import type { WizardSelections } from '@/types/playground';

const preset = THEME_PRESETS.find((item) => item.id === 'editorial')!;
const selections: WizardSelections = {
  businessName: 'Northstar Studio',
  businessModel: 'appointment_service',
  industryOverlay: 'salon',
  systemType: 'booking',
  primaryGoal: 'book',
  secondaryGoals: ['build_trust'],
  needsBooking: true,
  wantsLeadCapture: true,
  sellsProducts: false,
  primaryIntent: 'booking.create',
  requestedPages: ['home', 'contact'],
  scaffoldMode: 'selected-pages',
  templateId: 'salon-premium',
  themePresetId: preset.id,
  themeTokens: themePresetToThemeTokens(preset),
  wizardSeedId: 'plan-only-test',
  businessId: 'business-1',
};

describe('canonical launch plan', () => {
  it('resolves complete launch contracts and protected infrastructure without page bodies', () => {
    const plan = buildCanonicalLaunchPlan(selections, {
      '/.unison/wizard-seed.json': JSON.stringify({ id: 'plan-only-test' }),
    });
    const paths = Object.keys(plan.infrastructureFiles);

    expect(plan.version).toBe('unison-canonical-launch-plan/1');
    expect(plan.sitePlan.pages.map((page) => page.role)).toEqual(['home', 'contact']);
    expect(Object.keys(plan.playground.pageRegistry.pages)).toHaveLength(2);
    expect(plan.artDirection.storagePackId).toBe(plan.designIntervention.artDirectionPackId);
    expect(plan.registryContext.artDirectionPackId).toBe(plan.designIntervention.artDirectionPackId);
    expect(plan.uiFoundationContract.manifestPath).toBe('/.unison/ui-manifest.json');
    expect(plan.infrastructureFiles['/src/App.tsx']).toContain('/src/pages/Home.tsx'.replace('/src', '.'));
    expect(plan.infrastructureFiles['/src/main.tsx']).toContain("import App from './App'");
    expect(plan.infrastructureFiles['/src/index.css']).toContain('--primary');
    expect(plan.infrastructureFiles['/.unison/wizard-registry-context.json']).toBeTruthy();
    expect(paths.some((path) => path.startsWith('/src/pages/'))).toBe(false);
  });

  it('shares contract resolution with the compatibility full compiler', () => {
    const plan = buildCanonicalLaunchPlan(selections);
    const compiled = commitToPipeline({ selections }, 'wizard-launch');

    expect(compiled.sitePlan?.pages.map((page) => page.role)).toEqual(plan.sitePlan.pages.map((page) => page.role));
    expect(compiled.siteBundleSnapshot.meta.artDirection?.storagePackId).toBe(plan.artDirection.storagePackId);
    expect(compiled.siteBundleSnapshot.meta.registryContext?.designRegistrySignature).toBe(plan.registryContext.designRegistrySignature);
    expect(compiled.siteBundleSnapshot.vfsFiles['/.unison/wizard-registry-context.json']).toBeTruthy();
  });

  it('keeps compilePlayground out of the plan-only implementation', () => {
    const planSource = readFileSync('src/services/launch/canonicalLaunchPlan.ts', 'utf8');
    const compatibilitySource = readFileSync('src/platform/core/canonicalPipeline.ts', 'utf8');

    expect(planSource).not.toContain('compilePlayground(');
    expect(compatibilitySource).toContain('resolveCanonicalLaunchContracts(selections, existingVfsFiles)');
  });
});

