import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { executeSchemaBatch, type BackendDatabase } from '../../supabase/functions/reconcile-generated-runtime/backendOperations';
import type { SchemaBackendOp } from '@/types/backendOperations';

const id = '11111111-1111-4111-8111-111111111111';
const operation: SchemaBackendOp = { type: 'createTable', operationId: 'profiles:create', table: { name: 'profiles', rlsEnabled: true, columns: [{ name: 'user_id', dataType: 'uuid', nullable: false }] } };
const input = { projectId: id, businessId: id, draftId: id, userId: id, runId: 'candidate-1', operations: [operation] };
function database(options: { project?: boolean; draft?: boolean; revision?: string; matches?: boolean; failDdl?: boolean } = {}) {
  const queryArray = vi.fn(async (sql: string) => { if (options.failDdl && sql.startsWith('ALTER TABLE')) throw new Error('DDL_FAILED'); });
  const queryObject = vi.fn(async (sql: string) => {
    if (sql.includes('public.projects')) return { rows: options.project === false ? [] : [{ id }] };
    if (sql.includes('public.builder_drafts')) return { rows: options.draft === false ? [] : [{ id }] };
    if (sql.includes('public.site_revisions')) return { rows: options.revision ? [{ id: options.revision }] : [] };
    if (sql.includes('SELECT proposal')) return { rows: options.matches === undefined ? [] : [{ matches: options.matches }] };
    return { rows: [] };
  });
  return { queryArray, queryObject, db: { queryArray, queryObject } as unknown as BackendDatabase };
}

describe('project-scoped schema transaction', () => {
  it('keeps edge and client validation byte-identical', () => {
    expect(readFileSync('supabase/functions/_shared/backendOperations.ts', 'utf8'))
      .toBe(readFileSync('src/types/backendOperations.ts', 'utf8'));
  });
  it('isolates DDL, enables RLS and revokes client grants before committing the receipt', async () => {
    const mock = database();
    const result = await executeSchemaBatch(mock.db, input);
    expect(result.results).toEqual([{ operationId: operation.operationId, status: 'ok' }]);
    const sql = mock.queryArray.mock.calls.map(([query]) => query);
    expect(sql[0]).toBe('BEGIN');
    expect(sql[sql.length - 1]).toBe('COMMIT');
    expect(sql).toContain(`ALTER TABLE "${result.schema}"."profiles" ENABLE ROW LEVEL SECURITY`);
    expect(sql).toContain(`REVOKE ALL ON TABLE "${result.schema}"."profiles" FROM PUBLIC, anon, authenticated`);
    expect(sql.some((query) => query.includes('INSERT INTO') && query.includes('__operations'))).toBe(true);
  });
  it.each([{ project: false }, { draft: false }, { revision: id }])('rejects unauthorized/stale scopes before schema DDL: %j', async (options) => {
    const mock = database(options);
    await expect(executeSchemaBatch(mock.db, input)).rejects.toThrow();
    expect(mock.queryArray.mock.calls.some(([sql]) => sql.startsWith('CREATE SCHEMA'))).toBe(false);
    expect(mock.queryArray).toHaveBeenLastCalledWith('ROLLBACK');
  });
  it('skips a previously recorded identical operation', async () => {
    const mock = database({ matches: true });
    expect((await executeSchemaBatch(mock.db, input)).results[0].status).toBe('skipped');
    expect(mock.queryArray.mock.calls.some(([sql]) => sql.startsWith('CREATE TABLE "') && sql.includes('"profiles"'))).toBe(false);
  });
  it('rejects operation-ID reuse with different content', async () => {
    const mock = database({ matches: false });
    await expect(executeSchemaBatch(mock.db, input)).rejects.toThrow('OPERATION_ID_CONFLICT');
    expect(mock.queryArray).toHaveBeenLastCalledWith('ROLLBACK');
  });
  it('rolls back DDL failures without returning a successful receipt', async () => {
    const mock = database({ failDdl: true });
    await expect(executeSchemaBatch(mock.db, input)).rejects.toThrow('DDL_FAILED');
    expect(mock.queryArray).toHaveBeenLastCalledWith('ROLLBACK');
    expect(mock.queryArray).not.toHaveBeenCalledWith('COMMIT');
  });
});
