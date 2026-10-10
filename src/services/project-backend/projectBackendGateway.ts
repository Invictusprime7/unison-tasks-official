/**
 * ProjectBackendGateway (guidebook §27–29). Every resource command resolves the
 * site's backend first. `shared-legacy` runs through the existing server
 * functions (which authenticate, check membership, scope by business+project
 * and audit). `dedicated` requires the Phase 3 server route and is refused
 * here rather than silently falling back to the shared database.
 */
import { projectBackendResolver } from './projectBackendResolver';
import { describeBackendStatus } from './projectBackendHealth';
import type { ProjectBackendDescriptor } from './projectBackendTypes';

export class ProjectBackendUnavailableError extends Error {}

export async function withProjectBackend<T>(
  projectId: string | null | undefined,
  run: (descriptor: ProjectBackendDescriptor | null) => Promise<T>,
): Promise<T> {
  // Single-site businesses without a resolved project are resolved server-side (cms-records).
  if (!projectId) return run(null);
  const descriptor = await projectBackendResolver.resolve(projectId);
  const health = describeBackendStatus(descriptor);
  if (!health.ok) throw new ProjectBackendUnavailableError(health.reason);
  if (descriptor.mode === 'dedicated') {
    throw new ProjectBackendUnavailableError('This site uses its own database, which needs the dedicated backend service (not set up yet).');
  }
  return run(descriptor);
}
