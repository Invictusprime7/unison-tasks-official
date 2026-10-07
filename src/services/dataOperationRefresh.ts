
/**
 * Notify every mounted preview that canonical catalog/binding data changed.
 * The generated hydration module already treats this as a cache invalidation
 * signal and re-requests rows from the host; no second preview data store.
 */
export function refreshDataOperationResources(input: {
  projectId?: string | null;
  businessId?: string | null;
  /** Only status and operation id are read, so commit summaries fit too. */
  results: ReadonlyArray<{ operationId: string; status: string; type?: string; message?: string }>;
}): boolean {
  const applied = input.results.filter((result) => result.status === 'applied');
  if (!applied.length || typeof window === 'undefined') return false;
  const detail = {
    type: 'RESOURCE_INVALIDATED',
    projectId: input.projectId ?? null,
    businessId: input.businessId ?? null,
    reason: 'canonical-data-operation',
    resourceType: 'catalog' as const,
    operationIds: applied.map((result) => result.operationId),
  };
  try {
    window.postMessage(detail, '*');
    window.dispatchEvent(new CustomEvent('unison:catalog-data-changed', { detail }));
    return true;
  } catch {
    return false;
  }
}
