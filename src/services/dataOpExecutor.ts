/** Executes approved data proposals only from commitMutation. */
import { applyCatalogOperation } from '@/services/catalogOperations';
import { getCmsRecord } from '@/services/cmsRecordService';
import { getCatalogSurface } from '@/platform/core/catalogSurfaceRegistry';
import type { BuilderIdentity } from '@/types/builderIdentity';
import type { CanonicalDataSurface, DataOp } from '@/types/dataOperations';

export interface DataOpExecutionResult {
  operationId: string;
  type: DataOp['type'];
  surfaceId: CanonicalDataSurface;
  sourceTable?: string;
  /** The persisted catalog record affected by the operation, when applicable. */
  rowId?: string;
  /** The section binding affected by a binding operation, when applicable. */
  bindingId?: string;
  status: 'applied' | 'failed';
  message: string;
}

export interface DataOpExecutionReport {
  results: DataOpExecutionResult[];
  failedCount: number;
}

/** Verify persisted row properties after the canonical writer accepts an op. */
async function verifyPersistedDataOp(op: DataOp, identity: BuilderIdentity, result: unknown): Promise<string | null> {
  if (op.type === 'updateBinding') return null;
  const rowId = op.type === 'createRow'
    ? (result as { data?: { id?: string } })?.data?.id
    : op.rowId;
  if (!rowId) return op.type === 'createRow' ? 'Created row did not return a stable id for verification.' : 'Missing row id for verification.';
  const row = await getCmsRecord({ businessId: identity.businessId, resource: op.surfaceId, recordId: rowId });
  const surface = getCatalogSurface(op.surfaceId);
  if (!surface) return `Unknown data surface ${op.surfaceId}.`;
  const expected = op.type === 'archiveRow'
    ? { active: false }
    : op.type === 'createRow' ? op.values : op.patch;
  for (const [requestedKey, expectedValue] of Object.entries(expected)) {
    const field = requestedKey === 'name' ? surface.fields.title
      : requestedKey === 'description' ? surface.fields.description ?? requestedKey
      : requestedKey === 'image_url' ? surface.fields.image ?? requestedKey
      : requestedKey === 'price' ? surface.fields.priceCents ?? surface.fields.price ?? requestedKey
      : requestedKey;
    const normalizedExpected = requestedKey === 'price' && surface.fields.priceCents
      ? Math.round(Number(expectedValue) * 100)
      : expectedValue;
    if (!Object.is(row[field], normalizedExpected)) {
      return `Semantic verification failed for ${op.surfaceId}/${rowId}: ${field} did not match the requested value.`;
    }
  }
  return null;
}

/**
 * This intentionally delegates to the existing registry-aware catalog
 * operations. It adds no database writer and preserves their authorization,
 * field normalization, and binding safeguards.
 */
export async function executeDataOps(
  ops: readonly DataOp[],
  identity: BuilderIdentity,
): Promise<DataOpExecutionReport> {
  const results: DataOpExecutionResult[] = [];
  for (const op of ops) {
    try {
      const result = await applyCatalogOperation(
        op.type === 'updateRow' ? 'updateCatalogRow'
          : op.type === 'createRow' ? 'createCatalogRow'
            : op.type === 'archiveRow' ? 'updateCatalogRow'
              : 'updateSectionBinding',
        op.type === 'updateBinding'
          ? { surfaceId: op.surfaceId, locator: { bindingId: op.bindingId }, patch: op.patch }
          : op.type === 'createRow'
            ? { businessId: identity.businessId, surfaceId: op.surfaceId, patch: op.values }
            : op.type === 'archiveRow'
              ? { businessId: identity.businessId, surfaceId: op.surfaceId, rowId: op.rowId, patch: { active: false } }
              : { businessId: identity.businessId, surfaceId: op.surfaceId, rowId: op.rowId, patch: op.patch },
      );
      const verificationError = result.ok ? await verifyPersistedDataOp(op, identity, result) : null;
      const rowId = op.type === 'createRow'
        ? (result.data as { id?: unknown } | undefined)?.id
        : op.type === 'updateBinding' ? undefined : op.rowId;
      results.push({
        operationId: op.operationId,
        type: op.type,
        surfaceId: op.surfaceId,
        sourceTable: getCatalogSurface(op.surfaceId)?.sourceTable,
        ...(typeof rowId === 'string' && rowId ? { rowId } : {}),
        ...(op.type === 'updateBinding' ? { bindingId: op.bindingId } : {}),
        status: result.ok && !verificationError ? 'applied' : 'failed',
        message: verificationError ?? result.message,
      });
    } catch (error) {
      results.push({
        operationId: op.operationId,
        type: op.type,
        surfaceId: op.surfaceId,
        sourceTable: getCatalogSurface(op.surfaceId)?.sourceTable,
        ...(op.type === 'updateBinding' ? { bindingId: op.bindingId } : {}),
        ...((op.type === 'updateRow' || op.type === 'archiveRow') ? { rowId: op.rowId } : {}),
        status: 'failed',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
  return { results, failedCount: results.filter((result) => result.status === 'failed').length };
}
