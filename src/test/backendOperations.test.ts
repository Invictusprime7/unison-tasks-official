import { describe, expect, it, vi, beforeEach } from 'vitest';
import { assertBackendOps, type BackendOp } from '@/types/backendOperations';
import { executeBackendOps } from '@/services/backendOpExecutor';
import type { BuilderIdentity } from '@/types/builderIdentity';
import { prepareAICandidate } from '@/services/builder/aiCandidateGates';
import { buildAiCandidatePatch } from '@/services/aiApplyGate';

const mocks = vi.hoisted(() => ({ invoke: vi.fn(), from: vi.fn(), event: vi.fn() }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { functions: { invoke: mocks.invoke }, from: mocks.from } }));
vi.mock('@/services/agent-runtime/agentEvents', () => ({ emitAgentEvent: mocks.event }));

const table: BackendOp = {
  type: 'createTable', operationId: 'profiles:create',
  table: { name: 'profiles', rlsEnabled: true, columns: [{ name: 'user_id', dataType: 'uuid', nullable: false }] },
};
const identity = { userId: 'user', businessId: 'business', projectId: 'project', draftId: 'draft', revisionId: 'revision', sessionId: 'session' } satisfies BuilderIdentity;

describe('typed backend proposals', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('validates additive schema proposals and preserves them through candidate conversion', async () => {
    const ops: BackendOp[] = [table,
      { type: 'addColumn', operationId: 'profiles:bio', table: 'profiles', column: { name: 'bio', dataType: 'text', nullable: true } },
      { type: 'createIndex', operationId: 'profiles:index', table: 'profiles', name: 'profiles_owner', columns: ['user_id'] },
      { type: 'createRlsPolicy', operationId: 'profiles:policy', table: 'profiles', name: 'owner_read', role: 'authenticated', command: 'select', predicate: { type: 'owner', column: 'user_id' } },
    ];
    expect(() => assertBackendOps(ops)).not.toThrow();
    const prepared = await prepareAICandidate({ aiFiles: {}, baseFiles: {}, baseRevisionId: 'revision', backendOps: ops });
    expect(prepared.ok).toBe(true);
    const patch = buildAiCandidatePatch({ ...identity, beforeFiles: {}, nextFiles: {}, activePagePath: '/', candidate: prepared.build.changeSet });
    expect(patch.backendOps).toEqual(ops);
    expect(patch.candidate?.id).toBe(prepared.build.changeSet.id);
  });

  it.each([
    { ...table, table: { ...table.table, rlsEnabled: false } },
    { ...table, table: { ...table.table, name: 'profiles;drop table users' } },
    { ...table, table: { ...table.table, columns: [{ name: 'id', dataType: 'text;drop table users', nullable: false }] } },
    { type: 'addColumn', operationId: 'column', table: 'profiles', column: { name: 'bio', dataType: 'text', nullable: false } },
    { type: 'createRlsPolicy', operationId: 'policy', table: 'profiles', name: 'all_rows', role: 'anon', command: 'select', predicate: { type: 'rawSql', sql: 'true' } },
    { ...table, operationId: '' },
    { type: 'dropTable', operationId: 'drop', table: 'profiles' },
  ])('rejects unsafe or destructive proposals: %j', (op) => {
    expect(() => assertBackendOps([op])).toThrow('invalid BackendOp');
  });

  it('rejects duplicate operation identities', () => {
    expect(() => assertBackendOps([table, table])).toThrow('invalid BackendOp');
  });

  it('blocks malformed backend proposals at candidate gates', async () => {
    const prepared = await prepareAICandidate({ aiFiles: {}, baseFiles: {}, backendOps: [{ type: 'dropTable', table: 'profiles' }] as never });
    expect(prepared.ok).toBe(false);
    expect(prepared.gates.failures).toContainEqual(expect.objectContaining({ gate: 'backend-proposal' }));
  });

  it('rejects the entire mixed batch before any side effect when schema execution is unavailable', async () => {
    const report = await executeBackendOps([{ type: 'requireCapability', capability: 'auth' }, table], identity, { runId: 'candidate-1' });
    expect(report.failedCount).toBe(2);
    expect(report.results.map((result) => result.code)).toEqual(['batch-blocked', 'executor-unavailable']);
    expect(report.results[1]).toMatchObject({ runId: 'candidate-1', operationId: 'profiles:create' });
    expect(mocks.invoke).not.toHaveBeenCalled();
    expect(mocks.from).not.toHaveBeenCalled();
    expect(mocks.event).toHaveBeenCalledWith(expect.objectContaining({ runId: 'candidate-1', status: 'failed' }));
  });

  it('records shared candidate identity on supported capability execution', async () => {
    mocks.invoke.mockResolvedValue({ error: null });
    const report = await executeBackendOps([{ type: 'requireCapability', capability: 'auth' }], identity, { runId: 'candidate-1' });
    expect(report.failedCount).toBe(0);
    expect(report.results[0]).toMatchObject({ status: 'ok', runId: 'candidate-1', operationId: 'candidate-1:backend:0' });
    expect(mocks.invoke).toHaveBeenCalledWith('install-system', { body: { systemType: 'saas', businessId: 'business' } });
  });
});
