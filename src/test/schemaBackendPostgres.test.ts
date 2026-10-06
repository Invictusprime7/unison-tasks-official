// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { executeSchemaBatch, type BackendDatabase } from '../../supabase/functions/reconcile-generated-runtime/backendOperations';
import type { SchemaBackendOp } from '@/types/backendOperations';

const id = '11111111-1111-4111-8111-111111111111';
const input = { projectId: id, businessId: id, draftId: id, userId: id, runId: 'candidate-1' };
const table: SchemaBackendOp = { type: 'createTable', operationId: 'profiles:create', table: { name: 'profiles', rlsEnabled: true, columns: [{ name: 'user_id', dataType: 'uuid', nullable: false }] } };

async function database() {
  const pg = new PGlite();
  await pg.exec(`
    CREATE ROLE anon; CREATE ROLE authenticated;
    CREATE SCHEMA auth; GRANT USAGE ON SCHEMA auth TO authenticated;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    CREATE TABLE public.projects(id uuid PRIMARY KEY, business_id uuid);
    CREATE TABLE public.builder_drafts(id uuid PRIMARY KEY, project_id uuid, user_id uuid);
    CREATE TABLE public.site_revisions(id uuid PRIMARY KEY, draft_id uuid, status text, revision_number integer);
    INSERT INTO public.projects VALUES ('${id}', '${id}');
    INSERT INTO public.builder_drafts VALUES ('${id}', '${id}', '${id}');
  `);
  const db: BackendDatabase = {
    queryArray: (sql, args) => pg.query(sql, args),
    queryObject: async <T>(sql: string, args?: unknown[]) => ({ rows: (await pg.query<T>(sql, args)).rows }),
  };
  return { pg, db };
}

describe('backend SQL execution on PostgreSQL', () => {
  it('executes additive DDL, applies owner RLS, and retries idempotently', async () => {
    const { pg, db } = await database();
    try {
      const operations: SchemaBackendOp[] = [table,
        { type: 'addColumn', operationId: 'profiles:bio', table: 'profiles', column: { name: 'bio', dataType: 'text', nullable: true } },
        { type: 'createIndex', operationId: 'profiles:index', table: 'profiles', name: 'profiles_owner', columns: ['user_id'] },
        { type: 'createRlsPolicy', operationId: 'profiles:policy', table: 'profiles', name: 'owner_read', command: 'select', role: 'authenticated', predicate: { type: 'owner', column: 'user_id' } },
      ];
      const result = await executeSchemaBatch(db, { ...input, operations });
      expect(result.results.every((op) => op.status === 'ok')).toBe(true);
      expect((await executeSchemaBatch(db, { ...input, operations })).results.every((op) => op.status === 'skipped')).toBe(true);
      const grants = await pg.query<{ access: boolean }>('SELECT has_schema_privilege($1, $2, $3) AS access', ['authenticated', result.schema, 'USAGE']);
      expect(grants.rows[0].access).toBe(false);
      // Explicit test-only grants exercise policies; production schemas stay private.
      await pg.exec(`GRANT USAGE ON SCHEMA "${result.schema}" TO authenticated;
        GRANT SELECT ON "${result.schema}".profiles TO authenticated;
        INSERT INTO "${result.schema}".profiles(user_id, bio) VALUES ('${id}', 'own'), ('22222222-2222-4222-8222-222222222222', 'other');`);
      await pg.query("SELECT set_config('request.jwt.claim.sub', $1, false)", [id]);
      await pg.exec('SET ROLE authenticated');
      const visible = await pg.query(`SELECT bio FROM "${result.schema}".profiles`);
      expect(visible.rows).toEqual([{ bio: 'own' }]);
      await pg.exec('RESET ROLE');
    } finally { await pg.close(); }
  }, 30000);

  it('rolls back the entire DDL batch and operation receipts on an invalid index', async () => {
    const { pg, db } = await database();
    try {
      await expect(executeSchemaBatch(db, { ...input, operations: [table,
        { type: 'createIndex', operationId: 'bad:index', table: 'profiles', name: 'missing_column', columns: ['missing'] },
      ] })).rejects.toThrow();
      const schema = await pg.query('SELECT nspname FROM pg_namespace WHERE nspname = $1', [`unison_site_${id.replace(/-/g, '')}`]);
      expect(schema.rows).toEqual([]);
      expect((await executeSchemaBatch(db, { ...input, operations: [table] })).results[0].status).toBe('ok');
    } finally { await pg.close(); }
  }, 30000);
});
