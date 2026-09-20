/**
 * builderRegistryContext — V4 M8: both AI layers see the SAME canonical view.
 *
 * The Wizard composer (`requestAIPageComposition`) and Lane B already receive
 * the bounded `WizardAggregatedRegistryContext` projection. The in-Builder
 * assistant did not: `sanitizeVfsForAI` strips `/.unison/`, so the edit lane
 * was blind to certified 21st variants, component-state contracts, artifact
 * contracts, runtime dependencies and capability requirements.
 *
 * This module resolves the canonical context for an open draft:
 *   1. the sealed projection persisted at WIZARD_REGISTRY_CONTEXT_PATH, else
 *   2. a freshly aggregated projection for the draft's industry/template/theme.
 *
 * It then produces a BOUNDED payload (no source files, no credentials, no
 * global registry dump) shaped exactly like the Lane B projection so both
 * lanes reason over identical vocabulary.
 */

import {
  buildWizardAggregatedRegistryContext,
  WIZARD_REGISTRY_CONTEXT_PATH,
  type WizardAggregatedRegistryContext,
} from '@/services/launch/wizardRegistryAggregation';
import type { ComponentStateContract } from '@/sections/variants/componentStates';

/** Bounded projection handed to the in-Builder AI lane. */
export interface BuilderRegistryContext {
  version: WizardAggregatedRegistryContext['version'];
  generationPolicy?: WizardAggregatedRegistryContext['generationPolicy'];
  industry: string;
  templateId: string;
  themePresetId: string;
  artDirectionPackId?: string;
  designRegistrySignature: string;
  sections: Array<{
    type: string;
    isFirstClass: boolean;
    artifactId: string | null;
    allowedVariantIds: string[];
  }>;
  implementations: Array<{
    id: string;
    sectionType: string;
    name: string;
    certification: string;
    runtimeDependencies?: readonly string[];
    componentStates?: ComponentStateContract;
    artifactContract?: {
      artifactId: string;
      dataSourceKind: string;
      supportedSlots: readonly string[];
      intentBindings: readonly string[];
      aiEditScope: string;
    };
  }>;
  runtimeDependencies?: Record<string, string>;
  primitiveFamilies?: WizardAggregatedRegistryContext['primitiveFamilies'];
  capabilityRequirements?: WizardAggregatedRegistryContext['capabilityRequirements'];
}

const MAX_SECTIONS = 24;
const MAX_IMPLEMENTATIONS = 80;
const MAX_VARIANTS_PER_SECTION = 12;

/** Read the sealed projection persisted into the draft VFS by the launcher. */
export function readPersistedRegistryContext(
  vfsFiles?: Record<string, string> | null,
): WizardAggregatedRegistryContext | null {
  const raw = vfsFiles?.[WIZARD_REGISTRY_CONTEXT_PATH];
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as WizardAggregatedRegistryContext;
    return parsed && Array.isArray(parsed.sections) ? parsed : null;
  } catch {
    return null;
  }
}

/** Narrow a full canonical context down to the bounded AI payload. */
export function boundRegistryContext(
  context: WizardAggregatedRegistryContext,
  options?: { sectionTypes?: readonly string[] },
): BuilderRegistryContext {
  const focus = options?.sectionTypes?.length ? new Set(options.sectionTypes) : null;
  const sections = context.sections
    .filter((section) => !focus || focus.has(section.type))
    .slice(0, MAX_SECTIONS)
    .map((section) => ({
      type: section.type,
      isFirstClass: section.isFirstClass,
      artifactId: section.artifactId ?? null,
      allowedVariantIds: (section.allowedVariantIds ?? []).slice(0, MAX_VARIANTS_PER_SECTION),
    }));
  const allowed = new Set(sections.map((section) => section.type));
  const implementations = (context.implementations ?? [])
    .filter((implementation) => allowed.has(implementation.sectionType))
    .slice(0, MAX_IMPLEMENTATIONS)
    .map((implementation) => ({
      id: implementation.id,
      sectionType: implementation.sectionType,
      name: implementation.name,
      certification: implementation.certification,
      runtimeDependencies: implementation.runtimeDependencies,
      componentStates: implementation.componentStates,
      artifactContract: implementation.artifactContract,
    })) as BuilderRegistryContext['implementations'];

  return {
    version: context.version,
    generationPolicy: context.generationPolicy,
    industry: context.industry,
    templateId: context.templateId,
    themePresetId: context.themePresetId,
    artDirectionPackId: context.artDirectionPackId,
    designRegistrySignature: context.designRegistrySignature,
    sections,
    implementations,
    runtimeDependencies: context.runtimeDependencies,
    primitiveFamilies: context.primitiveFamilies,
    capabilityRequirements: context.capabilityRequirements,
  };
}

/**
 * Resolve the bounded canonical registry context for the in-Builder AI lane.
 * Never throws: the edit lane must still work when a draft predates V2.
 */
export function resolveBuilderRegistryContext(input: {
  vfsFiles?: Record<string, string> | null;
  industry?: string | null;
  templateId?: string | null;
  themePresetId?: string | null;
  seed?: string | null;
  businessId?: string | null;
  projectId?: string | null;
  sectionTypes?: readonly string[];
}): BuilderRegistryContext | null {
  try {
    const persisted = readPersistedRegistryContext(input.vfsFiles);
    if (persisted) return boundRegistryContext(persisted, { sectionTypes: input.sectionTypes });
    if (!input.industry && !input.templateId && !input.themePresetId) return null;
    const rebuilt = buildWizardAggregatedRegistryContext({
      industry: input.industry || 'general',
      templateId: input.templateId || 'default',
      themePresetId: input.themePresetId || 'default',
      seed: input.seed ?? undefined,
      businessId: input.businessId ?? undefined,
      projectId: input.projectId ?? undefined,
    });
    return boundRegistryContext(rebuilt, { sectionTypes: input.sectionTypes });
  } catch {
    return null;
  }
}
