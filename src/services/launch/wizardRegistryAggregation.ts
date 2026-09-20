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
import { resolveComponentStateContract } from '@/sections/variants/componentStates';
import { listCatalogSurfaces } from '@/platform/core/catalogSurfaceRegistry';
import { listArtifacts, resolveArtifact, getArtifact } from '@/platform/core/artifactRegistry';
import { resolveImplementationContract } from '@/platform/core/resolvedImplementationContract';
import { getDesignImplementation, getImplementationVocabularyRefs, designRegistrySignature, designCapabilityFingerprint } from '@/services/designImplementationRegistry';
import { GENERATED_MOTION_PRIMITIVES } from '@/platform/core/generatedUiFoundation';
import { buildGeneratedUiFoundation } from '@/platform/core/generatedUiFoundation';
import { CAPABILITY_REGISTRY, type CapabilityId } from '@/platform/core/capabilityRegistry';
import { WIZARD_PREVIEW_RUNTIME_DEPENDENCIES } from '@/utils/sandpackDependencies';
import type { Asset } from '@/types/asset';
import { deriveImplementationVisualSignature, type ImplementationVisualSignature } from '@/services/implementationVisualSignature';
import { compatibleExperiencePreferences } from '@/services/designCompatibilityGraph';
import type { WizardDesignSelection } from '@/services/wizardDesignSelection';

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
  /** Canonical generated-runtime imports needed by this implementation. */
  runtimeDependencies?: readonly string[];
  /** Component-state contract (V4 M6); absent on older persisted contexts. */
  componentStates?: import('@/sections/variants/componentStates').ComponentStateContract;
  /** Derived only from certified registry metadata; never authored by AI. */
  visualSignature?: ImplementationVisualSignature;
  /** Canonical compatibility edges for Wizard and AI selection. */
  compatibleExperiencePreferences?: readonly import('@/services/wizardDesignSelection').WizardExperiencePreference[];
  /** Derived from the artifact owner; absent on older persisted contexts. */
  artifactContract?: {
    artifactId: string;
    dataSourceKind: string;
    supportedSlots: readonly string[];
    intentBindings: readonly string[];
    aiEditScope: string;
    /** Typed slot projection from the M6 crosswalk; absent on older contexts. */
    slots?: readonly import('@/platform/core/resolvedImplementationContract').ResolvedImplementationSlot[];
    /** Present when the owning artifact hydrates from a catalog surface. */
    catalogSurfaceId?: string;
  };
}

export interface WizardRegistryAssetSummary {
  id: string;
  kind: Asset['kind'];
  name: string;
  url: string;
  width?: number;
  height?: number;
  tags: string[];
}

export interface WizardRegistryCapabilitySummary {
  id: CapabilityId;
  requiredTables: string[];
  supportedSlots: string[];
  providedIntents: string[];
}

export interface WizardRegistryPrimitiveFamilySummary {
  family: 'layout' | 'interaction' | 'form' | 'motion' | 'radix' | 'experience';
  values: string[];
}

export interface WizardAggregatedRegistryContext {
  version: typeof WIZARD_REGISTRY_CONTEXT_VERSION | '1.0';
  generationPolicy?: '21st-only';
  generatedAt: string;
  industry: string;
  templateId: string;
  themePresetId: string;
  artDirectionPackId?: string;
  /** Additive persisted Wizard constraints; absent on legacy snapshots. */
  designSelection?: WizardDesignSelection;
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

  /** Bounded v2 projections derived from canonical owners. */
  assets?: WizardRegistryAssetSummary[];
  runtimeDependencies?: Record<string, string>;
  primitiveFamilies?: WizardRegistryPrimitiveFamilySummary[];
  capabilityRequirements?: WizardRegistryCapabilitySummary[];
}



export function buildWizardAggregatedRegistryContext(options: {
  industry: string;
  templateId: string;
  themePresetId: string;
  seed?: string;
  businessId?: string;
  projectId?: string;
  /** Injectable for tests; callers must still provide the active ownership boundary. */
  assets?: readonly Asset[];
  designSelection?: WizardDesignSelection;
}): WizardAggregatedRegistryContext {
  const pack = resolveArtDirectionPack({
    industry: options.industry,
    themePresetId: options.themePresetId,
    seed: options.seed,
    sealedPackId: options.designSelection?.artDirectionPackId,
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

  const foundation = buildGeneratedUiFoundation({
    industry: options.industry,
    templateId: options.templateId,
    themePresetId: options.themePresetId,
    requiredRadixPrimitives: [...new Set(sections.flatMap(section => section.allowedVariantIds)
      .flatMap(id => getDesignImplementation(id)?.radixPrimitives ?? []))],
  });
  const scopedAssets = options.businessId ? (options.assets ?? [])
    .filter(asset => asset.businessId === options.businessId)
    .filter(asset => !options.projectId || !asset.projectId || asset.projectId === options.projectId)
    .slice(0, 40)
    .map(asset => ({ id: asset.id, kind: asset.kind, name: asset.name, url: asset.url,
      width: asset.width, height: asset.height, tags: [...(asset.tags ?? [])].slice(0, 12) })) : [];
  const capabilityIds = [...new Set(artifacts
    .filter(artifact => sections.some(section => section.type === artifact.sectionType && section.isFirstClass))
    .flatMap(artifact => getArtifact(artifact.artifactId)?.capabilities ?? []))];
  const runtimeDependencyNames = new Set([
    'react', 'react-dom', 'react-router-dom', 'lucide-react', 'framer-motion',
    ...foundation.manifest.experience.runtimePackages,
    ...foundation.manifest.runtimeFacades.radixPrimitives.map(id => `@radix-ui/react-${id}`),
  ]);

  return {
    version: WIZARD_REGISTRY_CONTEXT_VERSION,
    generationPolicy: '21st-only',
    generatedAt: new Date().toISOString(),
    industry: options.industry,
    templateId: options.templateId,
    themePresetId: options.themePresetId,
    artDirectionPackId: pack?.id,
    designSelection: options.designSelection,
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
      const contract = resolveImplementationContract(id);
      const visualSignature = deriveImplementationVisualSignature(implementation);
      return {
        id, sectionType: section.type, name: implementation.name,
        certification: implementation.vfs?.certification === 'approved' ? 'approved' as const : 'portable' as const,
        source: implementation.source,
        pageRoles: implementation.pageRoles ?? [],
        vocabularyRefs: getImplementationVocabularyRefs(implementation),
        radixPrimitives: implementation.radixPrimitives ?? [],
        runtimeDependencies: [
          ...(implementation.radixPrimitives ?? []).map(id => `@radix-ui/react-${id}`),
          ...(implementation.experience?.status === 'enabled' ? foundation.manifest.experience.runtimePackages : []),
        ],
        componentStates: resolveComponentStateContract(implementation),
        visualSignature,
        compatibleExperiencePreferences: compatibleExperiencePreferences(visualSignature),
        artifactContract: artifact ? {
          artifactId: artifact.artifactId,
          dataSourceKind: artifact.dataSource.kind,
          supportedSlots: [...artifact.supportedSlots],
          intentBindings: [...artifact.intentBindings],
          aiEditScope: artifact.aiEditScope,
          slots: contract?.slots,
          catalogSurfaceId: contract?.catalogSurfaceId,
        } : undefined,
      };
    })),
    artifacts,
    catalogSurfaces,
    motionPrimitives: [...GENERATED_MOTION_PRIMITIVES],
    motionProfile: pack?.motionProfile,
    interactionProfile: pack?.interactionProfile,
    assets: scopedAssets,
    runtimeDependencies: Object.fromEntries(Object.entries(WIZARD_PREVIEW_RUNTIME_DEPENDENCIES)
      .filter(([name]) => runtimeDependencyNames.has(name))),
    primitiveFamilies: [
      { family: 'layout', values: [...foundation.manifest.layoutRecipes] },
      { family: 'interaction', values: [...foundation.manifest.interactions] },
      { family: 'form', values: [...foundation.manifest.formFormats] },
      { family: 'motion', values: [...(foundation.manifest.motionExports?.components ?? [])] },
      { family: 'radix', values: [...foundation.manifest.runtimeFacades.radixPrimitives] },
      { family: 'experience', values: [...foundation.manifest.experience.primitives] },
    ],
    capabilityRequirements: capabilityIds.map(id => ({
      id,
      requiredTables: [...CAPABILITY_REGISTRY[id].requiredTables],
      supportedSlots: [...CAPABILITY_REGISTRY[id].frontend.supportedSlots],
      providedIntents: [...CAPABILITY_REGISTRY[id].intents.provided],
    })),
  };
}
