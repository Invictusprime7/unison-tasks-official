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
  familyForSection,
  resolveArtDirectionPack,
} from '@/sections/variants';
import type { SectionType } from '@/sections/types';
import { listCatalogSurfaces } from '@/platform/core/catalogSurfaceRegistry';
import { listArtifacts, resolveArtifact, getArtifact } from '@/platform/core/artifactRegistry';
import { designRegistrySignature } from '@/services/designImplementationRegistry';

export const WIZARD_REGISTRY_CONTEXT_PATH = '/.unison/wizard-registry-context.json' as const;
export const WIZARD_REGISTRY_CONTEXT_VERSION = '1.0' as const;

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

export interface WizardAggregatedRegistryContext {
  version: typeof WIZARD_REGISTRY_CONTEXT_VERSION;
  generatedAt: string;
  industry: string;
  templateId: string;
  themePresetId: string;
  artDirectionPackId?: string;
  designRegistrySignature: string;

  /** All registered section families and their pack-clamped variants */
  sections: WizardRegistrySectionSummary[];

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

const UI_FOUNDATION_MOTION_PRIMITIVES = [
  'Reveal',
  'RevealGroup',
  'Stagger',
  'StaggerGroup',
  'StaggerItem',
  'MarqueeBand',
  'HorizontalRail',
  'HoverDepth',
  'ImageReveal',
  'ParallaxMedia',
  'MaskReveal',
  'MotionImage',
];

const PLACEHOLDER_SECTIONS = new Set<SectionType>(['logo-cloud', 'blog-preview', 'before-after']);

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
    const packVariants = pack ? familyForSection(pack, type) : [];
    const allVariants = (VARIANT_REGISTRY[type] ?? []).map((v) => v.id);
    const allowedVariantIds = packVariants.length > 0 ? packVariants : allVariants;

    return {
      type,
      label: entry.label,
      category: entry.category,
      isFirstClass: !PLACEHOLDER_SECTIONS.has(type),
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
    generatedAt: new Date().toISOString(),
    industry: options.industry,
    templateId: options.templateId,
    themePresetId: options.themePresetId,
    artDirectionPackId: pack?.id,
    designRegistrySignature: designRegistrySignature(),
    sections,
    artifacts,
    catalogSurfaces,
    motionPrimitives: [...UI_FOUNDATION_MOTION_PRIMITIVES],
    motionProfile: pack?.motionProfile,
    interactionProfile: pack?.interactionProfile,
  };
}
