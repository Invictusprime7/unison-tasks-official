/**
 * Upload usage guard: before a stored file is deleted, check whether any of
 * the owner's saved sites still reference it. Signed upload URLs embed the
 * storage path, so a substring match on saved site source is authoritative.
 */
import { supabase } from '@/integrations/supabase/client';

export interface UploadUsage {
  draftId: string;
  draftName: string;
}

/** Returns the saved sites whose source references this storage path. */
export async function findUploadUsage(storagePath: string): Promise<UploadUsage[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('builder_drafts')
    .select('id, name, code, editor_code, vfs_files')
    .eq('user_id', user.id)
    .limit(25);
  if (error || !data) return [];
  const usages: UploadUsage[] = [];
  for (const draft of data) {
    const haystack = [
      typeof draft.code === 'string' ? draft.code : '',
      typeof draft.editor_code === 'string' ? draft.editor_code : '',
      draft.vfs_files ? JSON.stringify(draft.vfs_files) : '',
    ].join('\n');
    if (haystack.includes(storagePath)) {
      usages.push({ draftId: draft.id as string, draftName: (draft.name as string) || 'Untitled site' });
    }
  }
  return usages;
}
