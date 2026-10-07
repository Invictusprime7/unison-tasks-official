/** Executes approved data proposals only from commitMutation. */
import { applyCatalogOperation } from '@/services/catalogOperations';
import type { BuilderIdentity } from '@/types/builderIdentity';
import type { DataOp } from '@/types/dataOperations';

export interface DataOpExecutionResult {
  operationId: string;
  type: DataOp['type'];
  status: 'applied' | 'failed';
  message: string;
}

export interface DataOpExecutionReport {
  results: DataOpExecutionResult[];
  failedCount: number;
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
      results.push({ operationId: op.operationId, type: op.type, status: result.ok ? 'applied' : 'failed', message: result.message });
    } catch (error) {
      results.push({ operationId: op.operationId, type: op.type, status: 'failed', message: error instanceof Error ? error.message : String(error) });
    }
  }
  return { results, failedCount: results.filter((result) => result.status === 'failed').length };
}
