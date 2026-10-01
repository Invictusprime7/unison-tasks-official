/**
 * Ephemeral execution projection of the sealed AppBuildContract's design
 * knowledge. Never persisted, never a second source of truth.
 */

import type { ImplementationVisualSignature } from '@/services/implementationVisualSignature';
import type { ComponentStateContract } from '@/sections/variants/componentStates';
import type { WizardDesignSelection } from '@/services/wizardDesignSelection';
import type { ArtDirectionGrammar } from '@/services/launch/artDirectionGrammar';
import type {
  WizardRegistryAssetSummary,
  WizardRegistryImplementationSummary,
  WizardRegistryPageCompositionSummary,
  WizardRegistryPrimitiveFamilySummary,
} from '@/services/launch/wizardRegistryAggregation';

export const DESIGN_SOURCE_BUNDLE_VERSION = '1.0' as const;

export interface ResolvedDesignSource {
  implementationId: string;
  sectionType: string;
  name: string;
  certification: 'approved' | 'portable';
  pageRoles: readonly string[];
  provenance: {
    origin?: string;
    sourceId?: string;
    derivation?: string;
    adaptationVersion?: string;
  };
  vocabularyRefs: WizardRegistryImplementationSummary['vocabularyRefs'];
  componentStates?: ComponentStateContract;
  visualSignature?: ImplementationVisualSignature;
  artifactContract?: WizardRegistryImplementationSummary['artifactContract'];
  execution: {
    mode: 'portable-recipe' | 'source-module' | 'generated-component';
    sourceModulePath?: string;
    portableRecipeId?: string;
    runtimeDependencies: readonly string[];
  };
}

export interface DesignSourceBundle {
  version: typeof DESIGN_SOURCE_BUNDLE_VERSION;
  identity: {
    seed: string;
    industry: string;
    templateId: string;
    themePresetId: string;
    artDirectionPackId: string;
    designRegistrySignature: string;
  };
  artDirection: {
    grammar?: ArtDirectionGrammar;
    motionProfile?: string;
    interactionProfile?: string;
    selection?: WizardDesignSelection;
  };
  primitives: {
    families: WizardRegistryPrimitiveFamilySummary[];
    legalImports: string[];
    experienceCapabilities: string[];
  };
  implementations: ResolvedDesignSource[];
  /** pageId → implementation ids eligible for that page, richest first. */
  eligibleByPage: Record<string, string[]>;
  pageCompositions: WizardRegistryPageCompositionSummary[];
  assets: WizardRegistryAssetSummary[];
  dependencies: Record<string, string>;
}
