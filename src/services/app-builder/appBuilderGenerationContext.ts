/** Single per-job derivation of everything a page turn may know, taken only from the sealed contract. */

import type { AppBuildContract } from '@/services/app-builder/appBuilderContracts';
import { resolveDesignSourceBundle, isGenericImplementationId } from './design/designSystemResolver';
import type { DesignSourceBundle } from './design/DesignSourceBundle';
import { materializeDesignSources, type DesignSourceMaterialization } from './design/designSourceMaterializer';

export interface AppBuilderGenerationContext {
  contract: AppBuildContract;
  designSources: DesignSourceBundle;
  materialization: DesignSourceMaterialization;
  runtimeContext: string;
}

export function buildAppBuilderGenerationContext(contract: AppBuildContract): AppBuilderGenerationContext {
  const { business, runtime } = contract;
  const designSources = resolveDesignSourceBundle(contract);
  const materialization = materializeDesignSources(designSources);
  return {
    contract,
    designSources,
    materialization,
    runtimeContext: [
      `Industry ${business.industry}; goals ${business.goals.join(', ') || 'none'}.`,
      `Intents: ${business.intents.join(', ') || 'none'}; capabilities: ${business.capabilities.join(', ') || 'none'}.`,
      business.bindingGuide ? `Binding guide: ${business.bindingGuide}` : '',
      `Protected paths: ${runtime.protectedPaths.join(', ')}.`,
      `Approved dependencies: ${runtime.approvedDependencies.join(', ')}.`,
      renderDesignSourceModules(materialization),
      `Approved experience capabilities: ${runtime.approvedExperienceCapabilities.join(', ') || 'none'}.`,
    ].filter(Boolean).join('\n'),
  };
}

const MAX_IDS_PER_MODULE = 12;

function renderDesignSourceModules(materialization: DesignSourceMaterialization): string {
  const byModule = new Map<string, string[]>();
  const exports = new Map<string, string>();
  for (const [id, entry] of Object.entries(materialization.manifest.implementations)) {
    if (entry.exportName) exports.set(id, entry.props ? entry.exportName + '(' + entry.props + ')' : entry.exportName);
    byModule.set(entry.modulePath, [...(byModule.get(entry.modulePath) ?? []), id]);
  }
  const lines = [...byModule].sort(([a], [b]) => a.localeCompare(b)).map(([modulePath, ids]) =>
    `- ${modulePath.replace(/^\/src\//, '@/').replace(/\.tsx$/, '')} (props, variantId): ${ids.sort().slice(0, MAX_IDS_PER_MODULE).map((id) => (exports.has(id) ? `${id}={ ${exports.get(id)} }` : id)).join(', ')}`);
  return lines.length
    ? `Certified design-source modules (read-only; import the named export and pass the listed props directly, e.g. import { Name } from '@/unison/design-sources/<Family>'; <Name headline=".." items={[..]} />; props marked [] are required, non-empty arrays (name?[] is optional and may be omitted) and {a|b|c?} lists the fields every item needs (? = optional; fill each non-? field with real business copy, never leave items empty); headline/subheadline are plain strings, never nested <h1>/<h2>; never import from recipes/ or REGISTERED_VARIANTS):\n${lines.join('\n')}`
    : '';
}

export interface DesignSourceUsageReport {
  version: '1.0';
  eligiblePerPage: Record<string, number>;
  referencedPerPage: Record<string, string[]>;
  genericFallbackIds: string[];
  primitiveOnlyPages: string[];
}

/** R0: which design sources were available and which a candidate actually references. */
export function reportDesignSourceUsage(
  contract: AppBuildContract,
  bundle: DesignSourceBundle,
  files: Readonly<Record<string, string>>,
): DesignSourceUsageReport {
  const report: DesignSourceUsageReport = { version: '1.0', eligiblePerPage: {}, referencedPerPage: {}, genericFallbackIds: [], primitiveOnlyPages: [] };
  const known = bundle.implementations.map((impl) => impl.implementationId);
  const generic = new Set<string>();
  for (const page of contract.topology.sitePlan.pages) {
    const source = files[page.filePath] ?? '';
    const referenced = known.filter((id) => source.includes(id));
    report.eligiblePerPage[page.id] = bundle.eligibleByPage[page.id]?.length ?? 0;
    report.referencedPerPage[page.id] = referenced;
    referenced.filter(isGenericImplementationId).forEach((id) => generic.add(id));
    if (referenced.length === 0 && report.eligiblePerPage[page.id] > 0) report.primitiveOnlyPages.push(page.id);
  }
  report.genericFallbackIds = [...generic].sort();
  return report;
}
