import { supabase } from '@/integrations/supabase/client';

const record = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
const filesFrom = (value: unknown): Record<string, string> => Object.fromEntries(Object.entries(record(value)).filter(([, source]) => typeof source === 'string')) as Record<string, string>;

/** Read existing authored content only; never generate, repair, or persist source. */
export function resolveLegacyDraftContent(row: {
  code?: unknown; editor_code?: unknown; vfs_files?: unknown; metadata?: unknown;
}) {
  const metadata = record(row.metadata);
  const snapshot = record(metadata.siteBundleSnapshot);
  const candidates = [row.vfs_files, metadata.vfsFiles, snapshot.vfsFiles];
  const files = candidates.map(filesFrom).find((candidate) => Object.values(candidate).some((source) => source.trim())) ?? {};
  const code = [row.editor_code, row.code].find((source): source is string => typeof source === 'string' && !!source.trim()
    && !source.includes('AI-generated code will appear here')) ?? '';
  return { files, code, activePagePath: typeof metadata.activePagePath === 'string' ? metadata.activePagePath : undefined,
    hasContent: Object.values(files).some((source) => source.trim()) || !!code };
}

export async function loadLegacyDraftContent(projectId: string, draftId: string) {
  const { data, error } = await supabase.from('builder_drafts')
    .select('code, editor_code, vfs_files, metadata, last_revision_id')
    .eq('id', draftId).eq('project_id', projectId).maybeSingle();
  if (error) throw error;
  // A canonical revision pointer can never be bypassed by legacy source.
  if (!data || data.last_revision_id) return null;
  const content = resolveLegacyDraftContent(data);
  return content.hasContent ? content : null;
}
