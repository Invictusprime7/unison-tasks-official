/**
 * runtimeConfigDefaults — inert fallbacks for the two VFS runtime config modules.
 *
 * `/src/components/catalogHydration.ts`, `/src/components/formRuntime.ts`,
 * `/src/components/publishedActionRuntime.ts` and
 * `/src/components/businessProfileHydration.ts` all import
 * `@/unison/publishedRuntime` and `@/unison/generatedSiteRuntimeManifest`.
 * Those modules are authored by the canonical launch pipeline. File sets that
 * are emitted outside a full launch (topology scaffolds, in-builder recompiles,
 * legacy snapshots) never carried them, so the Sandpack preparer synthesized a
 * React placeholder instead and every consumer silently read `undefined` —
 * catalog hydration, forms and CTA intents went dead with no error surfaced.
 *
 * These defaults are filled in only when the module is absent, so real launch
 * configs are never overwritten.
 */

export const PUBLISHED_RUNTIME_CONFIG_PATH = '/src/unison/publishedRuntime.ts';
export const GENERATED_SITE_RUNTIME_MANIFEST_PATH =
  '/src/unison/generatedSiteRuntimeManifest.ts';

const DEFAULT_PUBLISHED_RUNTIME_CONFIG = {
  version: '1.0',
  runtimeVersion: '1.0',
  siteId: null,
  businessId: null,
  projectId: null,
  snapshotId: null,
  endpoint: null,
  runtimeEndpoint: null,
  formEndpoint: null,
  controllerEndpoints: {},
} as const;

const DEFAULT_GENERATED_SITE_RUNTIME_MANIFEST = {
  version: '1.0',
  siteId: null,
  snapshotId: null,
  enabledCapabilities: [],
  components: [],
  reads: [],
  intents: [],
  controllers: [],
  agents: [],
  requiredBackendFunctions: [],
  readiness: { status: 'ready', blockers: [] },
  generatedAt: '1970-01-01T00:00:00.000Z',
} as const;

export const DEFAULT_PUBLISHED_RUNTIME_MODULE = `export const PUBLISHED_RUNTIME_CONFIG = ${JSON.stringify(
  DEFAULT_PUBLISHED_RUNTIME_CONFIG,
  null,
  2,
)} as const;\n`;

export const DEFAULT_GENERATED_SITE_RUNTIME_MANIFEST_MODULE = `export const GENERATED_SITE_RUNTIME_MANIFEST = ${JSON.stringify(
  DEFAULT_GENERATED_SITE_RUNTIME_MANIFEST,
  null,
  2,
)} as const;\n`;

/**
 * Fill the runtime config modules when they are missing. Mutates nothing:
 * returns a new record only when something had to be added.
 */
export function withRuntimeConfigDefaults(
  files: Record<string, string>,
): Record<string, string> {
  const hasPublished = hasModule(files, PUBLISHED_RUNTIME_CONFIG_PATH);
  const hasManifest = hasModule(files, GENERATED_SITE_RUNTIME_MANIFEST_PATH);
  if (hasPublished && hasManifest) return files;
  const next = { ...files };
  if (!hasPublished) next[PUBLISHED_RUNTIME_CONFIG_PATH] = DEFAULT_PUBLISHED_RUNTIME_MODULE;
  if (!hasManifest) {
    next[GENERATED_SITE_RUNTIME_MANIFEST_PATH] =
      DEFAULT_GENERATED_SITE_RUNTIME_MANIFEST_MODULE;
  }
  return next;
}

function hasModule(files: Record<string, string>, srcPath: string): boolean {
  const bare = srcPath.replace(/\.ts$/, '');
  const rootPath = srcPath.replace(/^\/src\//, '/');
  const rootBare = bare.replace(/^\/src\//, '/');
  return [srcPath, bare, `${bare}.tsx`, rootPath, rootBare, `${rootBare}.tsx`].some(
    (candidate) => typeof files[candidate] === 'string' && files[candidate].length > 0,
  );
}
