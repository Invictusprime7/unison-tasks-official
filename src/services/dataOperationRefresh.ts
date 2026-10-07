
/**
 * Notify every mounted preview that canonical catalog/binding data changed.
 * The generated hydration module already treats this as a cache invalidation
 * signal and re-requests rows from the host; no second preview data store.
 */
export function refreshDataOperationResources(input: {
  projectId?: string | null;
  businessId?: string | null;
  /** Identity-rich execution results let the preview rehydrate only affected bindings. */
  results: ReadonlyArray<{
    operationId: string;
    status: string;
    type?: string;
    surfaceId?: string;
    sourceTable?: string;
    rowId?: string;
    bindingId?: string;
    message?: string;
  }>;
}): boolean {
  const applied = input.results.filter((result) => result.status === 'applied');
  if (!applied.length || typeof window === 'undefined') return false;
  const unique = (values: Array<string | undefined>) => Array.from(new Set(values.filter((value): value is string => Boolean(value))));
  const detail = {
    type: 'RESOURCE_INVALIDATED',
    projectId: input.projectId ?? null,
    businessId: input.businessId ?? null,
    reason: 'canonical-data-operation',
    resourceType: 'catalog' as const,
    operationIds: applied.map((result) => result.operationId),
    surfaceIds: unique(applied.map((result) => result.surfaceId)),
    sourceTables: unique(applied.map((result) => result.sourceTable)),
    rowIds: unique(applied.map((result) => result.rowId)),
    bindingIds: unique(applied.map((result) => result.bindingId)),
  };
  try {
    window.postMessage(detail, '*');
    window.dispatchEvent(new CustomEvent('unison:catalog-data-changed', { detail }));
    return true;
  } catch {
    return false;
  }
}
