import { beforeEach, describe, expect, it, vi } from 'vitest';
const mock = vi.hoisted(() => ({ rows: [] as unknown[], filters: [] as unknown[][], repair: vi.fn(), recover: vi.fn() }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: {
  auth: { getUser: async () => ({ data: { user: { id: 'owner' } } }) },
  from: () => {
    const chain: Record<string, unknown> = {};
    for (const key of ['select', 'eq', 'is', 'not', 'order', 'range']) chain[key] = (...args: unknown[]) => { mock.filters.push([key, ...args]); return chain; };
    chain.then = (resolve: (result: unknown) => void) => resolve({ data: mock.rows.shift(), error: null });
    return chain;
  },
} }));
vi.mock('@/services/draftBusinessLinkRepair', () => ({ repairDraftBusinessLink: mock.repair }));
vi.mock('@/services/legacyCloudProjectRecovery', () => ({ recoverLegacyCloudProject: mock.recover }));
import { migrateCloudProjects } from '@/services/cloudProjectCanonicalMigration';
beforeEach(() => { mock.rows.length = 0; mock.filters.length = 0; vi.clearAllMocks(); });
describe('profile cloud migration batch', () => {
  it('processes owner-scoped legacy and missing-draft projects sequentially, skipping accepted projects', async () => {
    mock.rows.push([{ id: 'legacy-draft', project_id: 'legacy-project' }], [{ project_id: 'legacy-project' }, { project_id: 'accepted-project' }], [{ id: 'legacy-project' }, { id: 'accepted-project' }, { id: 'orphan-project' }]);
    mock.recover.mockResolvedValue('recovered-draft');
    let active = 0;
    mock.repair.mockImplementation(async () => {
      expect(++active).toBe(1);
      await Promise.resolve();
      active--;
      return { committedRevision: true, revisionId: 'accepted', notes: [] };
    });
    const first = migrateCloudProjects();
    expect(migrateCloudProjects()).toBe(first);
    const results = await first;
    expect(results).toHaveLength(2);
    expect(results.every(result => result.converted)).toBe(true);
    expect(mock.recover).toHaveBeenCalledWith('orphan-project');
    expect(mock.repair.mock.calls.map(call => call[0].projectId)).toEqual(['legacy-project', 'orphan-project']);
    expect(mock.filters).toContainEqual(['eq', 'user_id', 'owner']);
    expect(mock.filters).toContainEqual(['eq', 'owner_id', 'owner']);
  });
  it('continues after one invalid candidate and reports its failure', async () => {
    mock.rows.push([{ id: 'bad', project_id: 'bad-project' }, { id: 'good', project_id: 'good-project' }], [{ project_id: 'bad-project' }, { project_id: 'good-project' }], []);
    mock.repair.mockRejectedValueOnce(new Error('Unresolved module')).mockResolvedValueOnce({ committedRevision: true, revisionId: 'accepted', notes: [] });
    expect(await migrateCloudProjects()).toMatchObject([{ converted: false, notes: ['Unresolved module'] }, { converted: true }]);
  });
});
