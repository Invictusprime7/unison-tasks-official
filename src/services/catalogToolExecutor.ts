/**
 * catalogToolExecutor — bridges LLM tool-calling responses to the
 * catalog operation dispatcher (M5). Use this from any transport that
 * receives model tool invocations (edge function chat completion,
 * AI SDK stream tool loop, etc.).
 *
 * Contract:
 *   - Accepts either a single {name, arguments} pair or an array of them.
 *   - `arguments` may be a JSON string (chat-completions style) or an
 *     already-parsed object (AI SDK style).
 *   - Only names present in CATALOG_OPERATION_TOOLS are executed; any
 *     other name is returned as {ok:false, message:"non-catalog tool"}.
 *   - Never throws — every failure is returned as a CatalogOperationResult
 *     so callers can safely echo results back into the conversation.
 */

import {
  applyCatalogOperation,
  CATALOG_OPERATION_TOOLS,
  type CatalogOperationName,
  type CatalogOperationResult,
} from '@/services/catalogOperations';
import type { DataOp, CanonicalDataSurface } from '@/types/dataOperations';

const CATALOG_TOOL_NAMES = new Set<CatalogOperationName>(
  CATALOG_OPERATION_TOOLS.map((t) => t.name as CatalogOperationName),
);

export interface RawToolCall {
  name: string;
  /** Chat-completions delivers arguments as a JSON string; AI SDK delivers an object. */
  arguments: string | Record<string, unknown> | null | undefined;
  /** Optional id (chat completions tool_call.id) so callers can echo back a tool_result. */
  id?: string;
}

export interface CatalogToolExecutionResult extends CatalogOperationResult {
  toolCallId?: string;
  toolName: string;
  isCatalogTool: boolean;
}

function parseArgs(raw: RawToolCall['arguments']): Record<string, unknown> {
  if (!raw) return {};
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return raw;
}

export function isCatalogToolName(name: string): name is CatalogOperationName {
  return CATALOG_TOOL_NAMES.has(name as CatalogOperationName);
}

export interface CatalogToolProposal {
  dataOps: DataOp[];
  rejected: Array<{ toolCallId?: string; toolName: string; message: string }>;
}

function isSurface(value: unknown): value is CanonicalDataSurface {
  return typeof value === 'string' && ['products', 'services', 'menu_items', 'pricing_plans', 'testimonials'].includes(value);
}

/** Compile catalog tool calls into PatchPlan proposals; this never writes data. */
export function compileCatalogToolCalls(calls: RawToolCall[]): CatalogToolProposal {
  const dataOps: DataOp[] = [];
  const rejected: CatalogToolProposal['rejected'] = [];
  for (const [index, call] of calls.entries()) {
    if (!isCatalogToolName(call.name)) continue;
    const args = parseArgs(call.arguments);
    const operationId = call.id || `catalog-tool:${index + 1}:${call.name}`;
    const surfaceId = args.surfaceId;
    const rowId = typeof args.rowId === 'string' ? args.rowId : typeof args.itemId === 'string' ? args.itemId : undefined;
    const patch = args.patch;
    if (!isSurface(surfaceId)) {
      rejected.push({ toolCallId: call.id, toolName: call.name, message: 'The tool call did not name a supported catalog surface.' });
    } else if (call.name === 'createCatalogRow' && patch && typeof patch === 'object' && !Array.isArray(patch)) {
      dataOps.push({ type: 'createRow', operationId, surfaceId, values: patch as Record<string, unknown> });
    } else if ((call.name === 'updateCatalogRow' || call.name === 'updateCatalogItem') && rowId && patch && typeof patch === 'object' && !Array.isArray(patch)) {
      dataOps.push({ type: 'updateRow', operationId, surfaceId, rowId, patch: patch as Record<string, unknown> });
    } else if (call.name === 'deleteCatalogRow' && rowId) {
      dataOps.push({ type: 'archiveRow', operationId, surfaceId, rowId });
    } else if (call.name === 'updateSectionBinding' && typeof args.locator === 'object' && args.locator && typeof (args.locator as Record<string, unknown>).bindingId === 'string' && patch && typeof patch === 'object' && !Array.isArray(patch)) {
      dataOps.push({ type: 'updateBinding', operationId, surfaceId, bindingId: (args.locator as Record<string, string>).bindingId, patch: patch as Record<string, unknown> });
    } else {
      rejected.push({ toolCallId: call.id, toolName: call.name, message: 'This tool call needs a concrete row or binding target before it can be committed.' });
    }
  }
  return { dataOps, rejected };
}

export async function executeCatalogToolCall(
  call: RawToolCall,
): Promise<CatalogToolExecutionResult> {
  const isCatalog = isCatalogToolName(call.name);
  if (!isCatalog) {
    return {
      ok: false,
      op: call.name as CatalogOperationName,
      message: `Ignored non-catalog tool "${call.name}"`,
      toolCallId: call.id,
      toolName: call.name,
      isCatalogTool: false,
    };
  }
  const result = await applyCatalogOperation(
    call.name as CatalogOperationName,
    parseArgs(call.arguments),
  );
  return {
    ...result,
    toolCallId: call.id,
    toolName: call.name,
    isCatalogTool: true,
  };
}

export async function executeCatalogToolCalls(
  calls: RawToolCall[],
): Promise<CatalogToolExecutionResult[]> {
  // Sequential — most catalog ops are cheap and later calls may depend on
  // earlier ones (e.g. createCatalogRow → updateSectionBinding).
  const out: CatalogToolExecutionResult[] = [];
  for (const call of calls) {
    // eslint-disable-next-line no-await-in-loop
    out.push(await executeCatalogToolCall(call));
  }
  return out;
}
