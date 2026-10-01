/** System-owned materialization of resolved design sources into a candidate workspace. */

import type { DesignSourceBundle } from './DesignSourceBundle';
import { DESIGN_SOURCE_BUNDLE_VERSION } from './DesignSourceBundle';
import { compilePortableRecipes, DESIGN_SOURCE_ROOT, type MaterializedDesignModule } from './portableRecipeCompiler';

export const DESIGN_SOURCE_MANIFEST_PATH = '/.unison/design-source-manifest.json';

export interface DesignSourceManifest {
  version: typeof DESIGN_SOURCE_BUNDLE_VERSION;
  root: string;
  modules: MaterializedDesignModule[];
  implementations: Record<string, { modulePath: string; sectionType: string; certification: string; exportName?: string; props?: string }>;
  unresolved: string[];
}

export interface DesignSourceMaterialization {
  files: Record<string, string>;
  manifest: DesignSourceManifest;
}

export function materializeDesignSources(bundle: DesignSourceBundle): DesignSourceMaterialization {
  const compiled = compilePortableRecipes(bundle);
  const implementations: DesignSourceManifest['implementations'] = {};
  for (const impl of bundle.implementations) {
    const modulePath = compiled.implementationModules[impl.implementationId];
    if (modulePath) implementations[impl.implementationId] = { modulePath, sectionType: impl.sectionType, certification: impl.certification, exportName: compiled.exportNames[impl.implementationId], props: compiled.propHints[impl.implementationId] };
  }
  const manifest: DesignSourceManifest = {
    version: DESIGN_SOURCE_BUNDLE_VERSION,
    root: DESIGN_SOURCE_ROOT,
    modules: compiled.modules,
    implementations,
    unresolved: compiled.unresolved,
  };
  return { files: { ...compiled.files, [DESIGN_SOURCE_MANIFEST_PATH]: `${JSON.stringify(manifest, null, 2)}\n` }, manifest };
}

/** Rewrites system-owned design-source paths over a workspace; everything else is untouched. */
export function applyDesignSources(base: Readonly<Record<string, string>>, materialization: DesignSourceMaterialization): Record<string, string> {
  const next = { ...base };
  for (const path of Object.keys(next)) {
    if (path.startsWith(`${DESIGN_SOURCE_ROOT}/`)) delete next[path];
  }
  return { ...next, ...materialization.files };
}
