/** §58 / §9 — health and identity verification for a site's backend. */
import type { ProjectBackendDescriptor, RuntimeIdentity } from './projectBackendTypes';

export interface ProjectBackendHealth { ok: boolean; reason?: string }

/** Guards against routing Project A's command into Project B's database. */
export function verifyRuntimeIdentity(descriptor: ProjectBackendDescriptor, identity: RuntimeIdentity | null): ProjectBackendHealth {
  if (descriptor.mode === 'shared-legacy') return { ok: true };
  if (!identity) return { ok: false, reason: 'This site’s database has no identity record yet.' };
  if (identity.projectId !== descriptor.projectId) return { ok: false, reason: 'This site’s database belongs to a different site.' };
  if (descriptor.siteId && identity.siteId !== descriptor.siteId) return { ok: false, reason: 'This site’s database belongs to a different site.' };
  return { ok: true };
}

export function describeBackendStatus(d: ProjectBackendDescriptor): ProjectBackendHealth {
  if (d.status === 'failed') return { ok: false, reason: 'This site’s database setup failed.' };
  if (d.status === 'provisioning') return { ok: false, reason: 'This site’s database is still being set up.' };
  return { ok: true };
}
