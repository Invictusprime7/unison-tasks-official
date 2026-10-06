import { agentOperations } from '@/services/agent-runtime/operations';
/**
 * backendOpExecutor — Move C transactional commit across backend layers.
 *
 * Executes the `backendOps` carried by a PatchPlan after the canonical
 * pipeline + preview / publish gates + element readiness all pass. Failures
 * here cause `commitMutation` to mark the revision as `rejected` and
 * propagate the diagnostics back to the caller.
 *
 * Ops supported:
 *   - `requireCapability`  → idempotent install-system call for the systemType
 *                            implied by the capability (booking → 'booking',
 *                            commerce → 'store', etc.).
 *   - `seedCapability`     → light-weight seeders for capabilities that need
 *                            backend rows to satisfy `rowAssertion`
 *                            (currently: booking — inserts one default
 *                            service + a 7-day availability window generated
 *                            from the business's `business_hours`, falling
 *                            back to a 9am-5pm default when none are set).
 *
 * Each op is best-effort idempotent: re-running a commit with the same
 * backendOps must NOT produce duplicate rows.
 */

import { supabase } from '@/integrations/supabase/client';
import type { BackendOp } from '@/types/patchPlan';
import type { BuilderIdentity } from '@/types/builderIdentity';
import type { CapabilityId } from '@/platform/core/capabilityRegistry';
import { generateAvailabilitySlots, type BusinessHoursWindow } from '@/services/availabilityGeneration';
import { assertBackendOps, type SchemaBackendOp } from '@/types/backendOperations';
import { emitAgentEvent } from '@/services/agent-runtime/agentEvents';

export type BackendOpStatus = 'ok' | 'skipped' | 'failed';

export interface BackendOpResult {
  op: BackendOp;
  status: BackendOpStatus;
  detail?: string;
  code?: 'invalid-proposal' | 'executor-unavailable' | 'execution-failed' | 'batch-blocked';
  operationId?: string;
  runId?: string;
}

export interface BackendOpExecutionReport {
  results: BackendOpResult[];
  failedCount: number;
}

// ----------------------------------------------------------------------------
// Capability → install-system systemType mapping
// ----------------------------------------------------------------------------

type InstallSystemType = 'booking' | 'portfolio' | 'store' | 'agency' | 'content' | 'saas';

function capabilityToSystemType(cap: CapabilityId): InstallSystemType | null {
  switch (cap) {
    case 'booking':
      return 'booking';
    case 'commerce':
      return 'store';
    case 'donation':
      return 'content';
    case 'newsletter':
      return 'content';
    case 'lead-capture':
    case 'quoting':
      return 'agency';
    case 'auth':
      return 'saas';
    case 'contact':
      return null; // contact is universal — no install-system call needed
    default:
      return null;
  }
}

// ----------------------------------------------------------------------------
// Seeders
// ----------------------------------------------------------------------------

async function seedBooking(businessId: string): Promise<BackendOpStatus> {
  try {
    // Idempotent: if any availability_slot already exists for this business,
    // skip seeding.
    const { count: slotCount } = await supabase
      .from('availability_slots')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId);
    if ((slotCount ?? 0) > 0) return 'skipped';

    // Ensure at least one service exists.
    const { count: svcCount } = await supabase
      .from('services')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId);
    let serviceId: string | null = null;
    let durationMinutes = 60;
    if ((svcCount ?? 0) === 0) {
      try {
        const svc = await agentOperations.create_catalog_item({ files: {}, businessId }, 'services', {
          name: 'Default Service', price: 0, active: true, duration_minutes: durationMinutes,
        });
        serviceId = svc.id;
      } catch {
        return 'failed';
      }
    } else {
      const { data: existing } = await supabase
        .from('services')
        .select('id, duration_minutes')
        .eq('business_id', businessId)
        .limit(1)
        .maybeSingle();
      const existingService = existing as { id: string; duration_minutes: number | null } | null;
      serviceId = existingService?.id ?? null;
      if (existingService?.duration_minutes && existingService.duration_minutes > 0) {
        durationMinutes = existingService.duration_minutes;
      }
    }

    // Generate a 7-day availability window from the business's configured
    // hours, falling back to the legacy 9am-5pm default when none are set.
    const { data: hoursRows } = await supabase
      .from('business_hours')
      .select('day_of_week, opens_at, closes_at, is_closed')
      .eq('business_id', businessId);
    const hours: BusinessHoursWindow[] = (hoursRows ?? []).map((row) => ({
      dayOfWeek: row.day_of_week,
      opensAt: row.opens_at,
      closesAt: row.closes_at,
      isClosed: row.is_closed,
    }));
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const slots = generateAvailabilitySlots({
      businessId,
      serviceId: serviceId ?? '',
      durationMinutes,
      startDate: tomorrow,
      days: 7,
      hours,
    });
    if (slots.length === 0) return 'ok';
    const { error: slotErr } = await supabase.from('availability_slots').insert(slots);
    if (slotErr) return 'failed';
    return 'ok';
  } catch {
    return 'failed';
  }
}

async function seedCapability(
  cap: CapabilityId,
  businessId: string,
): Promise<BackendOpStatus> {
  switch (cap) {
    case 'booking':
      return seedBooking(businessId);
    default:
      return 'skipped';
  }
}

// ----------------------------------------------------------------------------
// requireCapability — idempotent install-system call
// ----------------------------------------------------------------------------

async function requireCapability(
  cap: CapabilityId,
  identity: BuilderIdentity,
): Promise<BackendOpStatus> {
  const systemType = capabilityToSystemType(cap);
  if (!systemType) return 'skipped';
  try {
    const { error } = await supabase.functions.invoke('install-system', {
      body: {
        systemType,
        businessId: identity.businessId,
      },
    });
    if (error) return 'failed';
    return 'ok';
  } catch {
    return 'failed';
  }
}

// ----------------------------------------------------------------------------
// Public entry
// ----------------------------------------------------------------------------

export async function executeBackendOps(
  ops: BackendOp[],
  identity: BuilderIdentity,
  context?: { runId: string },
): Promise<BackendOpExecutionReport> {
  const runId = context?.runId;
  let invalid: string | undefined;
  try { assertBackendOps(ops, 'backendOpExecutor'); }
  catch (error) { invalid = error instanceof Error ? error.message : String(error); }
  const schemaOps = ops.filter((op): op is SchemaBackendOp => op.type !== 'requireCapability' && op.type !== 'seedCapability');
  const unavailable = schemaOps.length > 0 && (schemaOps.length !== ops.length || !runId);
  // Gate the whole batch before the first install/seed. An unsupported schema
  // proposal must never silently succeed after partially provisioning a site.
  if (invalid || unavailable) {
    const results: BackendOpResult[] = ops.map((op, index) => ({
      op, status: 'failed', operationId: op.operationId ?? (runId ? `${runId}:backend:${index}` : undefined), runId,
      code: invalid ? 'invalid-proposal'
        : op.type === 'requireCapability' || op.type === 'seedCapability' ? 'batch-blocked' : 'executor-unavailable',
      detail: invalid ?? 'Schema operations require a candidate identity and a schema-only batch; no backend operations were executed.',
    }));
    emitAgentEvent({ kind: 'error', message: invalid ?? 'Backend batch rejected: schema execution is unavailable.', status: 'failed', runId });
    return { results, failedCount: results.length };
  }
  if (schemaOps.length) {
    emitAgentEvent({ kind: 'tool_call', message: 'Preparing project schema transaction', runId, status: 'running' });
    try {
      const { data, error } = await supabase.functions.invoke('reconcile-generated-runtime', {
        body: { mode: 'backend-operations', businessId: identity.businessId, projectId: identity.projectId,
          draftId: identity.draftId, baseRevisionId: identity.revisionId || null, runId, operations: schemaOps },
      });
      if (error || data?.success !== true || data.runId !== runId || !Array.isArray(data.results)
        || data.results.length !== schemaOps.length
        || schemaOps.some((op, index) => data.results[index]?.operationId !== op.operationId
          || !['ok', 'skipped'].includes(data.results[index]?.status))) throw new Error('Schema transaction was rejected or returned an invalid receipt.');
      emitAgentEvent({ kind: 'data_change', message: 'Project schema transaction prepared', runId, status: 'ok' });
      return { results: schemaOps.map((op, index) => ({ op, operationId: op.operationId, runId, status: data.results[index].status })), failedCount: 0 };
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      emitAgentEvent({ kind: 'error', message: detail, runId, status: 'failed' });
      return { results: schemaOps.map((op) => ({ op, operationId: op.operationId, runId, status: 'failed', code: 'execution-failed', detail })), failedCount: schemaOps.length };
    }
  }
  const results: BackendOpResult[] = [];
  for (const [index, op] of ops.entries()) {
    const operationId = op.operationId ?? (runId ? `${runId}:backend:${index}` : undefined);
    emitAgentEvent({ kind: 'tool_call', message: `Executing backend operation: ${op.type}`, runId, status: 'running' });
    if (op.type === 'requireCapability') {
      const status = await requireCapability(op.capability as CapabilityId, identity);
      results.push({ op, status, operationId, runId, ...(status === 'failed' ? { code: 'execution-failed' as const } : {}) });
      emitAgentEvent({ kind: 'tool_call', message: `Backend capability ${op.capability}: ${status}`, runId, status: status === 'failed' ? 'failed' : 'ok' });
      continue;
    }
    if (op.type === 'seedCapability') {
      const status = await seedCapability(op.capability as CapabilityId, identity.businessId);
      results.push({ op, status, operationId, runId, ...(status === 'failed' ? { code: 'execution-failed' as const } : {}) });
      emitAgentEvent({ kind: 'tool_call', message: `Backend seed ${op.capability}: ${status}`, runId, status: status === 'failed' ? 'failed' : 'ok' });
      continue;
    }
    results.push({ op, status: 'failed', code: 'executor-unavailable', operationId, runId });
  }
  return {
    results,
    failedCount: results.filter((r) => r.status === 'failed').length,
  };
}
