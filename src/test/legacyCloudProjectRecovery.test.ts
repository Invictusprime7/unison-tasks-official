import { beforeEach, describe, expect, it, vi } from 'vitest';
const state = vi.hoisted(() => ({ rows: [] as unknown[], inserts: [] as unknown[] }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: {
  auth: { getUser: async () => ({ data: { user: { id: 'owner' } } }) },
  from: () => {
    const query: Record<string, unknown> = {};
    for (const key of ['select', 'eq', 'order', 'limit']) query[key] = () => query;
    query.insert = (value: unknown) => { state.inserts.push(value); return query; };
    query.maybeSingle = query.single = async () => ({ data: state.rows.shift(), error: null });
    query.then = (resolve: (result: unknown) => void) => resolve({ data: state.rows.shift(), error: null });
    return query;
  },
} }));
import { recoverLegacyCloudProject } from '@/services/legacyCloudProjectRecovery';
import { readBuilderRecoverySnapshot } from '@/services/builderStateRecovery';
const project = { id: 'project', owner_id: 'owner', business_id: 'business', name: 'Saved portfolio', settings: { siteId: 'site' } };
beforeEach(() => { state.rows.length = 0; state.inserts.length = 0; localStorage.clear(); });
describe('cloud projects with missing legacy drafts', () => {
  it('preserves an existing saved source without recomposing or replacing the draft', async () => {
    state.rows.push(project, { id: 'saved-draft', vfs_files: { '/src/App.tsx': 'original source' } });
    expect(await recoverLegacyCloudProject('project')).toBe('saved-draft');
    expect(state.inserts).toHaveLength(0);
    expect(readBuilderRecoverySnapshot('saved-draft')).toBeNull();
  });
  it('recomposes a missing draft from the recorded template, theme, and exact selected pages', async () => {
    state.rows.push(project, null, [], { context: { industry: 'portfolio', templateId: 'portfolio-photography', themePresetId: 'bold', wizardSelections: { businessName: 'Saved brand', requestedPages: ['about', 'gallery', 'contact'], primaryIntent: 'contact.submit' } } }, { id: 'recovered-draft' });
    expect(await recoverLegacyCloudProject('project')).toBe('recovered-draft');
    const recovered = readBuilderRecoverySnapshot('recovered-draft')!;
    expect(recovered.pendingRemote).toBe(true);
    expect(recovered.vfsFiles['/src/App.tsx']).toContain('/work');
    expect(recovered.vfsFiles['/src/App.tsx']).not.toContain('/booking');
    expect(JSON.parse(recovered.vfsFiles['/.unison/legacy-recovery.json'])).toMatchObject({ originalSourceRecovered: false, businessName: 'Saved brand' });
    expect(state.inserts[0]).not.toHaveProperty('vfs_files');
  }, 15_000);
  it('recovers surviving site bundle bytes before considering recomposition', async () => {
    state.rows.push(project, null, [{ bundle: { vfsFiles: { '/src/App.tsx': 'original bundle source' } } }], { id: 'recovered-draft' });
    expect(await recoverLegacyCloudProject('project')).toBe('recovered-draft');
    expect(readBuilderRecoverySnapshot('recovered-draft')?.vfsFiles).toEqual({ '/src/App.tsx': 'original bundle source' });
  });
  it('refuses to guess pages when only a template survives', async () => {
    state.rows.push(project, null, [], { context: { industry: 'portfolio', templateId: 'portfolio-photography', themePresetId: 'bold' } });
    await expect(recoverLegacyCloudProject('project')).rejects.toThrow('Saved page selections are unavailable');
    expect(state.inserts).toHaveLength(0);
  });
  it('refuses projects without an accessible owning identity', async () => {
    state.rows.push(null);
    await expect(recoverLegacyCloudProject('project')).rejects.toThrow('Project ownership');
    expect(state.inserts).toHaveLength(0);
  });
});
