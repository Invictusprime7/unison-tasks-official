import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  rows: [] as unknown[], commit: vi.fn(), content: vi.fn(), rpc: vi.fn(),
}));
vi.mock('@/integrations/supabase/client', () => ({ supabase: {
  auth: { getUser: async () => ({ data: { user: { id: 'owner' } } }) },
  rpc: mocks.rpc,
  from: () => {
    const chain: Record<string, unknown> = {};
    for (const key of ['select', 'eq', 'update', 'insert', 'order', 'limit']) chain[key] = () => chain;
    chain.maybeSingle = chain.single = async () => ({ data: mocks.rows.shift(), error: null });
    return chain;
  },
} }));
vi.mock('@/services/legacyDraftHydration', () => ({ loadLegacyDraftContent: mocks.content }));
vi.mock('@/services/savedVfsRuntime', () => ({ prepareSavedVfsRuntime: (files: unknown) => files }));
vi.mock('@/services/previewSession', () => ({ ensureViteRootFiles: (files: unknown) => files }));
vi.mock('@/services/vfsCommitService', () => ({ commitMutation: mocks.commit }));
import { repairDraftBusinessLink } from '@/services/draftBusinessLinkRepair';
import { readBuilderRecoverySnapshot } from '@/services/builderStateRecovery';

const files = { '/src/App.tsx': 'export default function App(){return <h1>Original project</h1>}' };
const draft = { id: 'draft', user_id: 'owner', project_id: 'project', business_id: 'business', name: 'Saved project', metadata: {}, last_revision_id: null };
beforeEach(() => {
  mocks.rows.length = 0;
  vi.clearAllMocks();
  localStorage.clear();
  mocks.content.mockResolvedValue({ files, code: '', pageRegistry: { pages: {}, funnels: {}, homePageId: '', version: 1 }, sitePlan: { selectedThemePresetId: 'bold' } });
  mocks.commit.mockResolvedValue({ persistedRevisionId: 'accepted' });
});
function queueHealthyIdentity(row = draft) {
  mocks.rows.push(row, { id: 'project', business_id: 'business' }, { id: 'membership' });
}

describe('legacy cloud canonical conversion', () => {
  it('accepts existing saved source exclusively through commitMutation and journals it first', async () => {
    queueHealthyIdentity();
    mocks.commit.mockImplementationOnce(async () => {
      expect(readBuilderRecoverySnapshot('draft')?.vfsFiles).toEqual(files);
      return { persistedRevisionId: 'accepted' };
    });
    expect(await repairDraftBusinessLink({ draftId: 'draft', projectId: 'project' })).toMatchObject({ revisionId: 'accepted', committedRevision: true });
    expect(mocks.commit).toHaveBeenCalledWith(expect.objectContaining({ source: 'playground-edit', current: expect.objectContaining({ vfsFiles: files }), options: expect.objectContaining({ requirePreviewPass: true }) }));
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it('leaves rejected source recoverable without declaring it committed', async () => {
    queueHealthyIdentity();
    mocks.commit.mockRejectedValueOnce(new Error('Unresolved authored module'));
    const result = await repairDraftBusinessLink({ draftId: 'draft', projectId: 'project' });
    expect(result.committedRevision).toBe(false);
    expect(result.notes.join(' ')).toContain('Unresolved authored module');
    expect(readBuilderRecoverySnapshot('draft')).toMatchObject({ pendingRemote: true, vfsFiles: files });
  });
  it('does not convert an accepted revision again', async () => {
    queueHealthyIdentity({ ...draft, last_revision_id: 'accepted' } as unknown as typeof draft);
    expect((await repairDraftBusinessLink({ draftId: 'draft', projectId: 'project' })).revisionId).toBe('accepted');
    expect(mocks.content).not.toHaveBeenCalled();
    expect(mocks.commit).not.toHaveBeenCalled();
  });
  it.each([{ ...draft, user_id: 'another-owner' }, { ...draft, project_id: 'another-project' }])('refuses mismatched identity', async row => {
    mocks.rows.push(row);
    expect((await repairDraftBusinessLink({ draftId: 'draft', projectId: 'project' })).committedRevision).toBe(false);
    expect(mocks.commit).not.toHaveBeenCalled();
  });
  it('does not replace unavailable content with a generic site', async () => {
    queueHealthyIdentity();
    mocks.content.mockRejectedValueOnce(new Error('Saved source is unavailable'));
    expect((await repairDraftBusinessLink({ draftId: 'draft', projectId: 'project' })).notes.join(' ')).toContain('Saved source is unavailable');
    expect(mocks.commit).not.toHaveBeenCalled();
  });
});
