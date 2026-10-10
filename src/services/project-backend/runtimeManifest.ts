/**
 * `unison.runtime.json` (guidebook §53–54): portable runtime descriptor for
 * exports. Carries public identity and contracts only — never control-plane
 * secrets, OAuth tokens or encrypted backend keys.
 */
import type { ProjectBackendDescriptor } from './projectBackendTypes';

export interface UnisonRuntimeManifest {
  version: '1.0';
  provider: 'supabase';
  projectId: string;
  siteId: string | null;
  backendMode: ProjectBackendDescriptor['mode'];
  schemaVersion: number;
  resources: string[];
  storageBuckets: string[];
  publicEnv: Record<string, string>;
  serverEnv: string[];
}

const FORBIDDEN_KEY = /secret|service[_-]?role|ciphertext|refresh[_-]?token|password/i;

export function buildRuntimeManifest(input: {
  backend: ProjectBackendDescriptor;
  resources: string[];
  schemaVersion?: number;
  needsServerAccess?: boolean;
}): UnisonRuntimeManifest {
  const { backend } = input;
  const dedicated = backend.mode === 'dedicated';
  const publicEnv: Record<string, string> = {
    VITE_UNISON_PROJECT_ID: backend.projectId,
    VITE_UNISON_SITE_ID: backend.siteId ?? '',
  };
  if (dedicated) {
    publicEnv.VITE_SITE_SUPABASE_URL = backend.projectUrl ?? '';
    publicEnv.VITE_SITE_SUPABASE_PUBLISHABLE_KEY = backend.publishableKey ?? '';
  }
  const manifest: UnisonRuntimeManifest = {
    version: '1.0',
    provider: 'supabase',
    projectId: backend.projectId,
    siteId: backend.siteId,
    backendMode: backend.mode,
    schemaVersion: input.schemaVersion ?? 1,
    resources: [...new Set(input.resources)].sort(),
    storageBuckets: dedicated ? ['site-assets', 'context-artifacts', 'private-uploads'] : [],
    publicEnv,
    // Names only; values are never exported (§50, never prefixed VITE_).
    serverEnv: dedicated && input.needsServerAccess ? ['SITE_SUPABASE_SECRET_KEY'] : [],
  };
  assertNoSecrets(manifest);
  return manifest;
}

/** Throws if any public value looks like a secret slipped in. */
export function assertNoSecrets(manifest: UnisonRuntimeManifest): void {
  for (const key of Object.keys(manifest.publicEnv)) {
    if (FORBIDDEN_KEY.test(key)) throw new Error(`Runtime manifest must not export ${key}.`);
  }
}

export function serializeRuntimeManifest(m: UnisonRuntimeManifest): string {
  return `${JSON.stringify(m, null, 2)}\n`;
}
