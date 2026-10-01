/**
 * Canonical fresh-launch planning without page-body materialization.
 *
 * This module resolves the same topology, capabilities, theme, Art Direction,
 * registry and UI-foundation contracts used by the legacy full compiler. The
 * plan-only projection emits protected runtime infrastructure, but deliberately
 * emits no `/src/pages/*` implementation. UnisonAppBuilder owns those bodies.
 */

import type {
  CapabilityPack,
  PlaygroundState,
  PlaygroundValidation,
  WizardSelections,
} from '@/types/playground';
import type { GeneratedSitePlan } from '@/platform/core/siteTopologyPlanner';
import { resolveCapabilities } from '@/services/wizardCapabilityResolver';
import { materializePlayground } from '@/services/wizardPlaygroundMaterializer';
import { getValidationSummary, validatePlayground } from '@/services/playgroundValidationService';
import { validateComposition } from '@/services/componentIntelligenceRegistry';
import {
  buildThemedIndexCssFromTokens,
  SHADCN_LIBRARY_CSS_MARKER,
} from '@/components/onboarding/themePresetToIndexCss';
import { assertThemeSeed } from '@/platform/core/themeSeedAssert';
import {
  buildWizardDesignIntervention,
  type WizardDesignIntervention,
} from '@/services/wizardDesignIntervention';
import {
  buildGeneratedUiFoundation,
  type GeneratedUiManifest,
} from '@/platform/core/generatedUiFoundation';
import { getRequiredRadixPrimitives } from '@/sections/variants';
import {
  buildThemeContractFiles,
} from '@/platform/core/themeContract';
import { projectResolvedArtDirection, type ResolvedArtDirection } from '@/sections/variants/resolvedArtDirection';
import {
  buildWizardAggregatedRegistryContext,
  WIZARD_REGISTRY_CONTEXT_PATH,
  type WizardAggregatedRegistryContext,
} from '@/services/launch/wizardRegistryAggregation';
import { ensureViteRootFiles } from '@/services/previewSession';
import { generateCanonicalRouter } from '@/utils/topologyRouterGenerator';
import { resolveApprovedExperienceCapabilities } from '@/services/experienceCapabilityResolver';
import { GENERATED_RUNTIME_PROFILE } from '@/platform/core/generatedRuntimeCapabilities';
import { TEMPLATE_DESIGN_CONTRACT_PATH } from '@/services/templateLayoutContract';
import { THEME_OVERRIDES_PATH } from '@/services/theme/themeTokenOverrides';
import type { AppBuilderUIFoundation } from '@/services/app-builder/appBuilderContracts';

export const CANONICAL_LAUNCH_PLAN_VERSION = 'unison-canonical-launch-plan/1' as const;

export interface CanonicalLaunchContractResolution {
  capabilities: CapabilityPack;
  playground: PlaygroundState;
  sitePlan: GeneratedSitePlan;
  validations: PlaygroundValidation[];
  warnings: string[];
  errors: string[];
  themePresetId: string;
  themedCss: string;
  designIntervention: WizardDesignIntervention;
  artDirection: ResolvedArtDirection;
  uiFoundation: ReturnType<typeof buildGeneratedUiFoundation>;
  uiFoundationContract: AppBuilderUIFoundation;
  registryContext: WizardAggregatedRegistryContext;
}

export interface CanonicalLaunchPlan extends CanonicalLaunchContractResolution {
  version: typeof CANONICAL_LAUNCH_PLAN_VERSION;
  infrastructureFiles: Record<string, string>;
}

function planningInputFiles(existingVfsFiles: Readonly<Record<string, string>>): Record<string, string> {
  const allowed = [
    '/.unison/wizard-seed.json',
    TEMPLATE_DESIGN_CONTRACT_PATH,
    THEME_OVERRIDES_PATH,
  ];
  return Object.fromEntries(
    allowed.flatMap((path) => typeof existingVfsFiles[path] === 'string' ? [[path, existingVfsFiles[path]]] : []),
  );
}

export function resolveCanonicalLaunchContracts(
  selections: WizardSelections,
  existingVfsFiles: Record<string, string> = {},
): CanonicalLaunchContractResolution {
  const themePresetId = assertThemeSeed(
    selections.themePresetId,
    'WizardSelections -> canonical launch contracts',
  );
  if (!selections.themeTokens) {
    throw new Error('[canonicalLaunchPlan] Wizard selections require resolved themeTokens.');
  }

  const warnings: string[] = [];
  const errors: string[] = [];
  const capabilities = resolveCapabilities(selections);
  const materialization = materializePlayground(selections, capabilities);
  warnings.push(...materialization.warnings);
  const playground = materialization.playground;
  const sitePlan = materialization.sitePlan;
  const validations = validatePlayground(playground, existingVfsFiles);
  const summary = getValidationSummary(validations);
  if (!summary.isHealthy) {
    errors.push(...validations.filter((item) => item.severity === 'error').map((item) => item.message));
    warnings.push(...validations.filter((item) => item.severity === 'warning').map((item) => item.message));
  }
  for (const page of Object.values(playground.pageRegistry.pages)) {
    const sectionTypes = (page as { sectionTypes?: string[] }).sectionTypes;
    if (!sectionTypes?.length) continue;
    const composition = validateComposition(sectionTypes as never);
    warnings.push(...composition.issues.map((issue) => `[${page.title}] ${issue}`));
  }

  const designIntervention = buildWizardDesignIntervention({
    compositionPlan: selections.compositionPlan,
    businessName: selections.businessName,
    businessModel: selections.businessModel,
    industryOverlay: selections.industryOverlay || (selections as { industry?: string }).industry,
    templateId: selections.templateId,
    themePresetId,
    wizardSeedId: selections.wizardSeedId,
    regenerationNonce: selections.regenerationNonce,
    primaryGoal: selections.primaryGoal,
    secondaryGoals: selections.secondaryGoals,
    requestedPages: selections.requestedPages,
    projectId: selections.businessId,
    needsBooking: selections.needsBooking,
    sellsProducts: selections.sellsProducts,
    wantsLeadCapture: selections.wantsLeadCapture,
    needsImmersive: selections.needsImmersive,
    designSelection: selections.designSelection,
  });
  const themedCss = buildThemedIndexCssFromTokens(selections.themeTokens, {
    presetId: themePresetId,
    label: themePresetId,
    artDirectionPackId: designIntervention.artDirectionPackId,
  });
  if (!themedCss.includes('--primary') || !themedCss.includes(SHADCN_LIBRARY_CSS_MARKER)) {
    throw new Error('[canonicalLaunchPlan] Theme tokens did not produce the canonical shadcn stylesheet.');
  }

  const uiFoundation = buildGeneratedUiFoundation({
    industry: selections.industryOverlay || (selections as { industry?: string }).industry,
    templateId: selections.templateId,
    themePresetId,
    needsBooking: selections.needsBooking,
    wantsLeadCapture: selections.wantsLeadCapture,
    sellsProducts: selections.sellsProducts,
    requiredRadixPrimitives: getRequiredRadixPrimitives(
      Object.values(designIntervention.activeVariants),
    ),
  });
  const artDirection = projectResolvedArtDirection({ ...designIntervention, themePresetId });
  if (!artDirection) throw new Error('[canonicalLaunchPlan] Art Direction could not be projected.');
  const registryContext = buildWizardAggregatedRegistryContext({
    industry: selections.industryOverlay || (selections as { industry?: string }).industry || 'general',
    templateId: selections.templateId || 'unknown',
    themePresetId,
    seed: designIntervention.seed,
    businessId: selections.businessId,
    projectId: selections.businessId,
    designSelection: selections.designSelection,
  });
  const uiFoundationContract: AppBuilderUIFoundation = {
    version: uiFoundation.manifest.version,
    manifestPath: '/.unison/ui-manifest.json',
    importRoot: uiFoundation.manifest.importRoot,
    runtimeProfile: uiFoundation.manifest.runtimeProfile || GENERATED_RUNTIME_PROFILE.id,
    experienceCapabilities: [...(uiFoundation.manifest.experience?.capabilities || [])],
    approvedExperienceCapabilities: resolveApprovedExperienceCapabilities({
      webgl: designIntervention.envelope?.webgl,
      foundationCapabilities: uiFoundation.manifest.experience?.capabilities,
      reachesExperienceLayer: false,
    }),
  };

  return {
    capabilities,
    playground,
    sitePlan,
    validations,
    warnings,
    errors,
    themePresetId,
    themedCss,
    designIntervention,
    artDirection,
    uiFoundation,
    uiFoundationContract,
    registryContext,
  };
}

export function buildCanonicalLaunchPlan(
  selections: WizardSelections,
  existingVfsFiles: Record<string, string> = {},
): CanonicalLaunchPlan {
  const resolved = resolveCanonicalLaunchContracts(selections, existingVfsFiles);
  let infrastructureFiles: Record<string, string> = {
    ...planningInputFiles(existingVfsFiles),
    ...resolved.uiFoundation.files,
    ...buildThemeContractFiles({
      artDirectionPackId: resolved.designIntervention.artDirectionPackId,
      themePresetId: resolved.themePresetId,
    }),
    '/src/index.css': resolved.themedCss,
    '/.unison/design-intervention.json': JSON.stringify(resolved.designIntervention, null, 2),
    [WIZARD_REGISTRY_CONTEXT_PATH]: JSON.stringify(resolved.registryContext, null, 2),
  };
  infrastructureFiles['/src/App.tsx'] = generateCanonicalRouter(
    resolved.playground.pageRegistry,
    selections.businessName,
  );
  infrastructureFiles = ensureViteRootFiles(infrastructureFiles, {
    stage4bCss: resolved.themedCss,
    themePresetId: resolved.themePresetId,
  });
  infrastructureFiles['/src/index.css'] = resolved.themedCss;

  const pageBodies = Object.keys(infrastructureFiles).filter((path) => /^\/src\/pages\//.test(path));
  if (pageBodies.length) {
    throw new Error(`[canonicalLaunchPlan] Plan-only projection emitted page bodies: ${pageBodies.join(', ')}`);
  }
  return {
    version: CANONICAL_LAUNCH_PLAN_VERSION,
    ...resolved,
    infrastructureFiles,
  };
}

