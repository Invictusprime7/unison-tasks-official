import { beforeEach, describe, expect, it, vi } from 'vitest';

const mock = vi.hoisted(() => ({ row: null as Record<string, unknown> | null, error: null as unknown, filters: [] as unknown[][] }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: {
  from: vi.fn(() => {
    const query = {
      select: () => query,
      eq: (key: string, value: string) => { mock.filters.push([key, value]); return query; },
      maybeSingle: async () => ({ data: mock.row, error: mock.error }),
    };
    return query;
  }),
} }));
import { loadLegacyDraftContent, resolveLegacyDraftContent } from '@/services/legacyDraftHydration';

describe('legacy saved draft hydration', () => {
  beforeEach(() => { mock.row = null; mock.error = null; mock.filters = []; });
  it('prefers saved editor code without changing authored source', () => {
    const code = 'export default () => <h1>My saved site</h1>';
    expect(resolveLegacyDraftContent({ editor_code: code, code: 'older' }).code).toBe(code);
  });
  it('recovers metadata files when the primary file map is empty', () => {
    const files = { '/src/App.tsx': 'saved application' };
    expect(resolveLegacyDraftContent({ vfs_files: {}, metadata: { vfsFiles: files } }).files).toEqual(files);
    expect(resolveLegacyDraftContent({ metadata: { siteBundleSnapshot: { vfsFiles: files } } }).files).toEqual(files);
  });
  it('recognizes truly empty drafts and ignores placeholder code', () => {
    expect(resolveLegacyDraftContent({ code: 'AI-generated code will appear here', vfs_files: { '/src/App.tsx': ' ' } }).hasContent).toBe(false);
  });
  it('scopes recovery to the requested project and draft', async () => {
    mock.row = { code: 'saved', last_revision_id: null };
    expect((await loadLegacyDraftContent('project', 'draft'))?.code).toBe('saved');
    expect(mock.filters).toEqual([['id', 'draft'], ['project_id', 'project']]);
  });
  it('never bypasses an existing canonical revision pointer', async () => {
    mock.row = { code: 'legacy', last_revision_id: 'revision' };
    expect(await loadLegacyDraftContent('project', 'draft')).toBeNull();
  });
  it('does not invent content for a missing draft', async () => {
    expect(await loadLegacyDraftContent('project', 'draft')).toBeNull();
  });
  it('propagates access or network errors instead of reporting an empty site', async () => {
    mock.error = new Error('Access denied');
    await expect(loadLegacyDraftContent('project', 'draft')).rejects.toThrow('Access denied');
  });
});
