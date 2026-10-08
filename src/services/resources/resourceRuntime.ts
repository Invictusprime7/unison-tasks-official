/**
 * ResourceRuntime — the one read/write surface for catalog, content and the
 * business profile. Picks the adapter, enforces schema-writable fields, and
 * emits RESOURCE_INVALIDATED so live components rehydrate without a preview
 * remount. Catalog writes from the AI/command menu still go through
 * agentOperations, which delegates here for the same semantics.
 */
import { vfsEventBus } from '@/services/vfsEventBus';
import { emitAgentEvent } from '@/services/agent-runtime/agentEvents';
import { RESOURCE_ADAPTERS, filterWritableValues } from './resourceAdapters';
import { getResource } from './resourceRegistry';
import type {
  ResourceContext, ResourceDataOp, ResourceDefinition, ResourceEntityRef, ResourceInvalidation, ResourceRecord,
} from './resourceTypes';

export const RESOURCE_INVALIDATED = 'RESOURCE_INVALIDATED' as const;

function defOrThrow(key: string): ResourceDefinition {
  const d = getResource(key);
  if (!d) throw new Error(`Unknown resource "${key}".`);
  return d;
}

export function invalidateResource(inv: ResourceInvalidation): void {
  vfsEventBus.emit<ResourceInvalidation>('resource:invalidated', inv);
  if (typeof window === 'undefined') return;
  const message = { type: RESOURCE_INVALIDATED, ...inv };
  for (const iframe of document.querySelectorAll('iframe')) {
    iframe.contentWindow?.postMessage(message, '*');
  }
}

export function onResourceInvalidated(listener: (inv: ResourceInvalidation) => void): () => void {
  return vfsEventBus.on<ResourceInvalidation>('resource:invalidated', (e) => listener(e.payload));
}

export async function queryResource(key: string, ctx: ResourceContext): Promise<ResourceRecord[]> {
  const def = defOrThrow(key);
  return RESOURCE_ADAPTERS[def.storage.adapter].query(def, ctx);
}

export async function getResourceRecord(key: string, ctx: ResourceContext, id: string): Promise<ResourceRecord | null> {
  const def = defOrThrow(key);
  return RESOURCE_ADAPTERS[def.storage.adapter].get(def, ctx, id);
}

/** Validate an op against the schema without touching storage. */
export function validateResourceOp(op: ResourceDataOp): { ok: true; def: ResourceDefinition } | { ok: false; reason: string } {
  const key = op.op === 'create' ? op.resourceKey : op.ref.resourceKey;
  const def = getResource(key);
  if (!def) return { ok: false, reason: `Unknown resource "${key}".` };
  if (op.op === 'delete') {
    if (def.cardinality === 'single-record') return { ok: false, reason: `${def.label} can't be deleted.` };
    if (!RESOURCE_ADAPTERS[def.storage.adapter].delete) return { ok: false, reason: `${def.label} entries are archived, not deleted.` };
    return { ok: true, def };
  }
  if (op.op === 'create' && def.cardinality === 'single-record') return { ok: false, reason: `${def.label} already exists — edit it instead.` };
  const rejected = Object.keys(op.values).filter((k) => !(k in filterWritableValues(def, { [k]: true })));
  if (rejected.length) return { ok: false, reason: `${def.label} has no editable field ${rejected.map((k) => `"${k}"`).join(', ')}.` };
  return { ok: true, def };
}

export async function applyResourceOp(op: ResourceDataOp, ctx: ResourceContext): Promise<ResourceRecord | null> {
  if (ctx.mode !== 'builder') throw new Error('Published sites cannot change records.');
  const v = validateResourceOp(op);
  if (v.ok === false) throw new Error(v.reason);
  const { def } = v;
  const adapter = RESOURCE_ADAPTERS[def.storage.adapter];
  let result: ResourceRecord | null = null;
  if (op.op === 'create') result = await adapter.create(def, ctx, filterWritableValues(def, op.values));
  else if (op.op === 'update') result = await adapter.update(def, ctx, op.ref.recordId, filterWritableValues(def, op.values));
  else await adapter.delete!(def, ctx, op.ref.recordId);
  const recordId = op.op === 'create' ? result?.id ?? '' : op.ref.recordId;
  invalidateResource({ resourceKey: def.key, kind: def.kind, businessId: ctx.businessId, recordIds: recordId ? [recordId] : [] });
  emitAgentEvent({ kind: 'data_change', message: `${op.op === 'create' ? 'Added to' : op.op === 'update' ? 'Updated' : 'Removed from'} ${def.label}`, status: 'ok' });
  return result;
}

/** Parse the `data-ut-resource="key#recordId.field"` provenance attribute generated components carry. */
export function parseResourceProvenance(attr: string | null | undefined): ResourceEntityRef | null {
  const m = /^([a-z0-9:_-]+)#([^.#\s]+)(?:\.([A-Za-z0-9_]+))?$/.exec(String(attr ?? '').trim());
  if (!m) return null;
  const def = getResource(m[1]);
  if (!def) return null;
  return { resourceKey: def.key, kind: def.kind, recordId: m[2], field: m[3] };
}

export function formatResourceProvenance(ref: ResourceEntityRef): string {
  return `${ref.resourceKey}#${ref.recordId}${ref.field ? `.${ref.field}` : ''}`;
}
