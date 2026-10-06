import { supabase } from '@/integrations/supabase/client';
import { repairDraftBusinessLink } from './draftBusinessLinkRepair';
import { recoverLegacyCloudProject } from './legacyCloudProjectRecovery';

export interface CloudMigrationResult {
  draftId: string;
  projectId: string;
  converted: boolean;
  notes: string[];
}

let activeMigration: Promise<CloudMigrationResult[]> | null = null;

/** Owner-scoped, sequential migration. Every source acceptance uses commitMutation. */
export function migrateCloudProjects(onProgress?: (completed: number, total: number) => void): Promise<CloudMigrationResult[]> {
  if (activeMigration) return activeMigration;
  activeMigration = runMigration(onProgress).finally(() => { activeMigration = null; });
  return activeMigration;
}

async function runMigration(onProgress?: (completed: number, total: number) => void) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Sign in to restore your cloud projects.');
  const drafts: Array<{ id: string; project_id: string }> = [];
  // Capture a stable candidate list before commits change last_revision_id.
  for (let offset = 0; ; offset += 200) {
    const { data, error: lookupError } = await supabase.from('builder_drafts')
      .select('id, project_id').eq('user_id', user.id).is('last_revision_id', null)
      .not('project_id', 'is', null).order('id').range(offset, offset + 199);
    if (lookupError) throw lookupError;
    drafts.push(...(data || []) as Array<{ id: string; project_id: string }>);
    if ((data?.length || 0) < 200) break;
  }
  const results: CloudMigrationResult[] = [];
  const linkedProjects = new Set<string>();
  for (let offset = 0; ; offset += 200) {
    const { data, error } = await supabase.from('builder_drafts').select('project_id').eq('user_id', user.id).order('id').range(offset, offset + 199);
    if (error) throw error;
    for (const row of data || []) if (row.project_id) linkedProjects.add(row.project_id);
    if ((data?.length || 0) < 200) break;
  }
  const projects: Array<{ id: string }> = [];
  for (let offset = 0; ; offset += 200) {
    const { data, error } = await supabase.from('projects').select('id').eq('owner_id', user.id).order('id').range(offset, offset + 199);
    if (error) throw error;
    projects.push(...data || []);
    if ((data?.length || 0) < 200) break;
  }
  for (const project of projects) {
    if (linkedProjects.has(project.id)) continue;
    try {
      const id = await recoverLegacyCloudProject(project.id);
      drafts.push({ id, project_id: project.id });
    } catch (error) {
      results.push({ draftId: '', projectId: project.id, converted: false, notes: [error instanceof Error ? error.message : String(error)] });
    }
  }
  onProgress?.(0, drafts.length);
  for (const draft of drafts) {
    try {
      let result = await repairDraftBusinessLink({ draftId: draft.id, projectId: draft.project_id });
      if (!result.revisionId && result.notes.some(note => /no saved source|source is unavailable|source.*unavailable/i.test(note))) {
        const recoveredId = await recoverLegacyCloudProject(draft.project_id);
        result = await repairDraftBusinessLink({ draftId: recoveredId, projectId: draft.project_id });
      }
      results.push({ draftId: draft.id, projectId: draft.project_id, converted: result.committedRevision || Boolean(result.revisionId), notes: result.notes });
    } catch (error) {
      results.push({ draftId: draft.id, projectId: draft.project_id, converted: false, notes: [error instanceof Error ? error.message : String(error)] });
    }
    onProgress?.(results.filter(result => result.draftId).length, drafts.length);
  }
  return results;
}
