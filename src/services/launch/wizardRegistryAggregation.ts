/**
 * Wizard Registry Aggregation — Single unified registry context for launch.
 *
 * Gathers, for a given industry/template/theme selection, the complete universe
 * of active capabilities:
 *   - Available section families and their ArtDirectionPack-clamped variants
 *   - Registered artifact surfaces (catalog, profile, authored, behavioral)
 *   - Registered catalog data surfaces and physical table mappings
 *   - Installed UI foundation motion primitives and facades
 *   - Design implementation inventory signature
 *
 * This context is stamped into the sealed SiteBundleSnapshot and VFS so
 * AI, Preview, Playground, and runtime data binding all share the same truth.
 */

import { getAllSections } from '@/sections/registry';
import {
  VARIANT_REGISTRY,
  getGenerationVariantsForSection,
  resolveArtDirectionPack,
} from '@/sections/variants';
import type { SectionType } from '@/sections/types';
import { listCatalogSurfaces } from '@/platform/core/catalogSurfaceRegistry';
import { listArtifacts, resolveArtifact, getArtifact } from '@/platform/core/artifactRegistry';
import { getDesignImplementation, getImplementationVocabularyRefs, designRegistrySignature, designCapabilityFingerprint } from '@/services/designImplementationRegistry';
import { GENERATED_MOTION_PRIMITIVES } from '@/platform/core/generatedUiFoundation';

export const WIZARD_REGISTRY_CONTEXT_PATH = '/.unison/wizard-registry-context.json' as const;
export const WIZARD_REGISTRY_CONTEXT_VERSION = '2.0' as const;

export interface WizardRegistrySectionSummary {
  type: SectionType;
  label: string;
  category: string;
  isFirstClass: boolean;
  artifactId: string | null;
  allowedVariantIds: string[];
}

export interface WizardRegistryArtifactSummary {
  artifactId: string;
  name: string;
  sectionType: SectionType;
  category: string;
  dataSourceKind: string;
  catalogSurfaceId?: string;
  sourceTable?: string;
  minRows: number;
  supportedSlots: readonly string[];
  intentBindings: readonly string[];
  aiEditScope: string;
}

export interface WizardRegistryCatalogSurfaceSummary {
  surfaceId: string;
  catalogKind: string;
  sourceTable: string;
  componentType: string;
  friendlyName: string;
  minRows: number;
  supportedIntents: readonly string[];
  fallbackMode: string;
}

export interface WizardRegistryImplementationSummary {
  id: string;
  sectionType: SectionType;
  name: string;
  certification: 'approved' | 'portable';
  source?: import('@/sections/variants/types').SectionVariant['source'];
  pageRoles: readonly string[];
  vocabularyRefs: ReturnType<typeof getImplementationVocabularyRefs>;
  radixPrimitives: readonly string[];
  /** Derived from the artifact owner; absent on older persisted contexts. */
  artifactContract?: {
    artifactId: string;
    dataSourceKind: string;
    supportedSlots: readonly string[];
    intentBindings: readonly string[];
    aiEditScope: string;
  };
}

export interface WizardAggregatedRegistryContext {
  version: typeof WIZARD_REGISTRY_CONTEXT_VERSION | '1.0';
  generationPolicy?: '21st-only';
  generatedAt: string;
  industry: string;
  templateId: string;
  themePresetId: string;
  artDirectionPackId?: string;
  designRegistrySignature: string;
  /** Additive: old persisted contexts remain valid without this fingerprint. */
  designCapabilityFingerprint?: string;

  /** All registered section families and their pack-clamped variants */
  sections: WizardRegistrySectionSummary[];

  /** v2 executable, pack-filtered inventory; absent on older snapshots. */
  implementations?: WizardRegistryImplementationSummary[];

  /** All registered artifact surfaces (catalog, business-profile, authored, behavioral) */
  artifacts: WizardRegistryArtifactSummary[];

  /** All canonical catalog data surfaces */
  catalogSurfaces: WizardRegistryCatalogSurfaceSummary[];

  /** Installed UI foundation motion primitives */
  motionPrimitives: string[];

  /** Active motion profile & interaction profile */
  motionProfile?: string;
  interactionProfile?: string;
}



export function buildWizardAggregatedRegistryContext(options: {
  industry: string;
  templateId: string;
  themePresetId: string;
  seed?: string;
}): WizardAggregatedRegistryContext {
  const pack = resolveArtDirectionPack({
    industry: options.industry,
    themePresetId: options.themePresetId,
    seed: options.seed,
  });

  const allSections = getAllSections();
  const sections: WizardRegistrySectionSummary[] = (
    Object.entries(allSections) as Array<[SectionType, (typeof allSections)[SectionType]]>
  ).map(([type, entry]) => {
    const artifact = getArtifact(type);
    const executable = getGenerationVariantsForSection(type, pack);
    const allowedVariantIds = executable.map(variant => variant.id);

    return {
      type,
      label: entry.label,
      category: entry.category,
      isFirstClass: executable.length > 0,
      artifactId: artifact?.artifactId ?? null,
      allowedVariantIds,
    };
  });

  const artifacts: WizardRegistryArtifactSummary[] = listArtifacts().map((def) => {
    const resolved = resolveArtifact(def.artifactId);
    return {
      artifactId: def.artifactId,
      name: def.name,
      sectionType: def.sectionType,
      category: def.category,
      dataSourceKind: def.dataSource.kind,
      catalogSurfaceId: def.dataSource.surfaceId,
      sourceTable: resolved?.catalogSurface?.sourceTable,
      minRows: def.dataSource.minRows,
      supportedSlots: def.supportedSlots,
      intentBindings: def.intentBindings,
      aiEditScope: def.aiEditScope,
    };
  });

  const catalogSurfaces: WizardRegistryCatalogSurfaceSummary[] = listCatalogSurfaces().map((s) => ({
    surfaceId: s.surfaceId,
    catalogKind: s.catalogKind,
    sourceTable: s.sourceTable,
    componentType: s.componentType,
    friendlyName: s.friendlyName,
    minRows: s.minRows,
    supportedIntents: s.supportedIntents,
    fallbackMode: s.fallbackMode,
  }));

  return {
    version: WIZARD_REGISTRY_CONTEXT_VERSION,
    generationPolicy: '21st-only',
    generatedAt: new Date().toISOString(),
    industry: options.industry,
    templateId: options.templateId,
    themePresetId: options.themePresetId,
    artDirectionPackId: pack?.id,
    designRegistrySignature: designRegistrySignature(),
    designCapabilityFingerprint: designCapabilityFingerprint({
      ...options,
      artDirectionPackId: pack?.id,
      eligibleImplementationIds: sections.flatMap((section) => section.allowedVariantIds),
    }),
    sections,
    implementations: sections.flatMap(section => section.allowedVariantIds.map(id => {
      const implementation = getDesignImplementation(id)!;
      const artifact = getArtifact(section.type);
      return {
        id, sectionType: section.type, name: implementation.name,
        certification: implementation.vfs?.certification === 'approved' ? 'approved' as const : 'portable' as const,
        source: implementation.source,
        pageRoles: implementation.pageRoles ?? [],
        vocabularyRefs: getImplementationVocabularyRefs(implementation),
        radixPrimitives: implementation.radixPrimitives ?? [],
        artifactContract: artifact ? {
          artifactId: artifact.artifactId,
          dataSourceKind: artifact.dataSource.kind,
          supportedSlots: [...artifact.supportedSlots],
          intentBindings: [...artifact.intentBindings],
          aiEditScope: artifact.aiEditScope,
        } : undefined,
      };
    })),
    artifacts,
    catalogSurfaces,
    motionPrimitives: [...GENERATED_MOTION_PRIMITIVES],
    motionProfile: pack?.motionProfile,
    interactionProfile: pack?.interactionProfile,
  };
}
