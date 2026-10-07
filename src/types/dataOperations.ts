/**
 * Project-scoped data mutations carried by a PatchPlan. These are proposals
 * until `commitMutation` executes them after canonical preview validation.
 */
export const CANONICAL_DATA_SURFACES = [
  'products',
  'services',
  'menu_items',
  'pricing_plans',
  'featured_offers',
  'testimonials',
  'portfolio_projects',
  'availability_slots',
] as const;

export type CanonicalDataSurface = (typeof CANONICAL_DATA_SURFACES)[number];

export type DataOp =
  | {
      type: 'updateRow';
      operationId: string;
      surfaceId: CanonicalDataSurface;
      rowId: string;
      patch: Record<string, unknown>;
    }
  | {
      type: 'createRow';
      operationId: string;
      surfaceId: CanonicalDataSurface;
      values: Record<string, unknown>;
    }
  | {
      type: 'archiveRow';
      operationId: string;
      surfaceId: CanonicalDataSurface;
      rowId: string;
    }
  | {
      type: 'updateBinding';
      operationId: string;
      surfaceId: CanonicalDataSurface;
      bindingId: string;
      patch: Record<string, unknown>;
    };

export function assertDataOps(value: unknown, context = 'assertDataOps'): asserts value is DataOp[] {
  if (!Array.isArray(value)) throw new Error(`[${context}] dataOps must be an array`);
  const ids = new Set<string>();
  for (const op of value) {
    if (!op || typeof op !== 'object' || !('type' in op) || !('operationId' in op)) {
      throw new Error(`[${context}] invalid data operation`);
    }
    if (typeof op.operationId !== 'string' || !op.operationId.trim() || ids.has(op.operationId)) {
      throw new Error(`[${context}] data operation IDs must be unique non-empty strings`);
    }
    ids.add(op.operationId);
    if (op.type === 'updateBinding') {
      if (!CANONICAL_DATA_SURFACES.includes(op.surfaceId) || typeof op.bindingId !== 'string' || !op.bindingId || !isRecord(op.patch)) {
        throw new Error(`[${context}] updateBinding requires a supported surfaceId, bindingId, and patch`);
      }
      continue;
    }
    if (!CANONICAL_DATA_SURFACES.includes(op.surfaceId)) {
      throw new Error(`[${context}] operation references an unsupported data surface`);
    }
    if ((op.type === 'updateRow' || op.type === 'archiveRow') && (!('rowId' in op) || typeof op.rowId !== 'string' || !op.rowId)) {
      throw new Error(`[${context}] ${op.type} requires rowId`);
    }
    if (op.type === 'updateRow' && !isRecord(op.patch)) throw new Error(`[${context}] updateRow requires patch`);
    if (op.type === 'createRow' && !isRecord(op.values)) throw new Error(`[${context}] createRow requires values`);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
