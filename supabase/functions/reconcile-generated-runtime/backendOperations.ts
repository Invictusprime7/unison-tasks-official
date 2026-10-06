import { assertBackendOps, type SchemaBackendOp } from '../_shared/backendOperations.ts';

export interface BackendDatabase {
  queryArray(sql: string, args?: unknown[]): Promise<unknown>;
  queryObject<T>(sql: string, args?: unknown[]): Promise<{ rows: T[] }>;
}

const quote = (name: string) => `"${name}"`;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Called only after JWT + business access checks in the existing edge entry. */
export async function executeSchemaBatch(db: BackendDatabase, input: {
  projectId: string; businessId: string; draftId: string; userId: string; baseRevisionId?: string | null;
  runId: string; operations: SchemaBackendOp[];
}) {
  assertBackendOps(input.operations);
  if (!UUID.test(input.projectId) || !UUID.test(input.businessId) || !UUID.test(input.draftId) || !UUID.test(input.userId)
    || (input.baseRevisionId && !UUID.test(input.baseRevisionId))
    || !input.runId?.trim() || input.runId.length > 160
    || input.operations.length < 1 || input.operations.length > 50
    || input.operations.some((op) => op.type === ('requireCapability' as string) || op.type === ('seedCapability' as string))) {
    throw new Error('INVALID_SCHEMA_BATCH');
  }
  const schema = `unison_site_${input.projectId.replace(/-/g, '').toLowerCase()}`;
  const results: Array<{ operationId: string; status: 'ok' | 'skipped' }> = [];
  await db.queryArray('BEGIN');
  try {
    await db.queryArray("SET LOCAL lock_timeout = '5s'");
    await db.queryArray("SET LOCAL statement_timeout = '15s'");
    await db.queryArray('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', [schema]);
    const project = await db.queryObject<{ id: string }>(
      'SELECT id FROM public.projects WHERE id = $1 AND business_id = $2 FOR UPDATE',
      [input.projectId, input.businessId],
    );
    if (!project.rows.length) throw new Error('PROJECT_SCOPE_MISMATCH');
    const draft = await db.queryObject<{ id: string }>(
      'SELECT id FROM public.builder_drafts WHERE id = $1 AND project_id = $2 AND user_id = $3 FOR UPDATE',
      [input.draftId, input.projectId, input.userId],
    );
    if (!draft.rows.length) throw new Error('DRAFT_SCOPE_MISMATCH');
    const revision = await db.queryObject<{ id: string }>(
      "SELECT id FROM public.site_revisions WHERE draft_id = $1 AND status = 'committed' ORDER BY created_at DESC, id DESC LIMIT 1",
      [input.draftId],
    );
    if ((revision.rows[0]?.id ?? null) !== (input.baseRevisionId ?? null)) throw new Error('STALE_BASE_REVISION');
    await db.queryArray(`CREATE SCHEMA IF NOT EXISTS ${quote(schema)}`);
    await db.queryArray(`REVOKE ALL ON SCHEMA ${quote(schema)} FROM PUBLIC, anon, authenticated`);
    await db.queryArray(`CREATE TABLE IF NOT EXISTS ${quote(schema)}."__operations" (
      operation_id text PRIMARY KEY, proposal jsonb NOT NULL, run_id text NOT NULL,
      preparation_state text NOT NULL DEFAULT 'prepared',
      prepared_at timestamptz NOT NULL DEFAULT now())`);
    for (const op of input.operations) {
      const existing = await db.queryObject<{ matches: boolean }>(
        `SELECT proposal = $2::jsonb AS matches FROM ${quote(schema)}."__operations" WHERE operation_id = $1`,
        [op.operationId, JSON.stringify(op)],
      );
      if (existing.rows.length) {
        if (!existing.rows[0].matches) throw new Error('OPERATION_ID_CONFLICT');
        results.push({ operationId: op.operationId, status: 'skipped' });
        continue;
      }
      const tableName = op.type === 'createTable' ? op.table.name : op.table;
      const table = `${quote(schema)}.${quote(tableName)}`;
      if (op.type === 'createTable') {
        const columns = op.table.columns.map((col) => `${quote(col.name)} ${col.dataType}${col.nullable ? '' : ' NOT NULL'}`).join(', ');
        await db.queryArray(`CREATE TABLE ${table} (${columns})`);
        await db.queryArray(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
        await db.queryArray(`REVOKE ALL ON TABLE ${table} FROM PUBLIC, anon, authenticated`);
      } else {
        const state = await db.queryObject<{ rls: boolean }>(
          'SELECT c.relrowsecurity AS rls FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = $1 AND c.relname = $2 AND c.relkind = $3',
          [schema, tableName, 'r'],
        );
        if (!state.rows[0]?.rls) throw new Error('TABLE_MISSING_OR_RLS_DISABLED');
        if (op.type === 'addColumn') {
          await db.queryArray(`ALTER TABLE ${table} ADD COLUMN ${quote(op.column.name)} ${op.column.dataType}`);
        } else if (op.type === 'createIndex') {
          await db.queryArray(`CREATE INDEX ${quote(op.name)} ON ${table} (${op.columns.map(quote).join(', ')})`);
        } else if (op.type === 'createRlsPolicy') {
          const owner = await db.queryObject<{ data_type: string }>(
            'SELECT data_type FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2 AND column_name = $3',
            [schema, tableName, op.predicate.column],
          );
          if (owner.rows[0]?.data_type !== 'uuid') throw new Error('OWNER_COLUMN_MUST_BE_UUID');
          const predicate = `((SELECT auth.uid()) = ${quote(op.predicate.column)})`;
          const clause = op.command === 'insert' ? `WITH CHECK (${predicate})`
            : op.command === 'update' ? `USING (${predicate}) WITH CHECK (${predicate})` : `USING (${predicate})`;
          await db.queryArray(`CREATE POLICY ${quote(op.name)} ON ${table} FOR ${op.command.toUpperCase()} TO authenticated ${clause}`);
        }
      }
      await db.queryArray(`INSERT INTO ${quote(schema)}."__operations" (operation_id, proposal, run_id) VALUES ($1, $2::jsonb, $3)`,
        [op.operationId, JSON.stringify(op), input.runId]);
      results.push({ operationId: op.operationId, status: 'ok' });
    }
    await db.queryArray('COMMIT');
    return { success: true, runId: input.runId, schema, results };
  } catch (error) {
    await db.queryArray('ROLLBACK');
    throw error;
  }
}
