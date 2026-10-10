/** Guidebook 2026-10-09 §6 / §64 — per-site backend binding contracts. */
export type ProjectBackendMode = 'unison-managed' | 'connected-supabase';
export type ProjectBackendProvisioningStatus =
  | 'selected' | 'creating' | 'provisioning' | 'migrating' | 'ready' | 'failed' | 'disconnected';

/** Server-side record. `secretKeyCiphertext` never reaches the browser. */
export interface ProjectBackendBinding {
  id: string;
  businessId: string;
  projectId: string;
  siteId: string;
  provider: 'supabase';
  mode: ProjectBackendMode;
  providerProjectRef: string;
  projectUrl: string;
  publishableKey: string | null;
  secretKeyCiphertext: string;
  schemaVersion: number;
  provisioningStatus: ProjectBackendProvisioningStatus;
  backendManifest: Record<string, unknown>;
  healthStatus: Record<string, unknown>;
}

/** Browser-safe view returned by the resolver. */
export interface ProjectBackendDescriptor {
  bindingId: string;
  projectId: string;
  siteId: string | null;
  /** shared-legacy = Unison control-plane tables scoped by project_id (until Phase 3). */
  mode: 'shared-legacy' | 'dedicated';
  provider: 'supabase';
  status: 'ready' | 'provisioning' | 'failed';
  projectUrl?: string | null;
  publishableKey?: string | null;
}

/** §9 — the single identity row every dedicated runtime database carries. */
export const UNISON_RUNTIME_IDENTITY_SQL = `CREATE TABLE IF NOT EXISTS public.unison_runtime_identity (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  business_id uuid NOT NULL,
  project_id uuid NOT NULL,
  site_id uuid NOT NULL,
  schema_version integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);`;

export interface RuntimeIdentity { businessId: string; projectId: string; siteId: string; schemaVersion: number }
