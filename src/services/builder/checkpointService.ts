/**
 * checkpointService — saved-checkpoint history + undo/redo for the Web Builder.
 *
 * Every accepted edit is already one committed `site_revisions` row written by
 * `commitMutation`. A checkpoint is simply such a row; undo/redo restore a
 * row through `restoreRevision` (which commits a NEW revision), so history is
 * append-only and survives reloads/devices. No new writer, no new table.
 */
import { supabase } from '@/integrations/supabase/client';
import {
  restoreRevision,
  type CommitMutationResult,
  type LoadedRevision,
} from '@/services/vfsCommitService';
import type { BuilderIdentity } from '@/types/builderIdentity';

export interface Checkpoint {
  id: string;
  label: string;
  kind: 'ai' | 'restore' | 'manual' | 'launch' | 'other';
  createdAt: string;
  source: string;
}

const COLUMNS = 'id, source, status, created_at, parent_revision_id, patch_summary:patch_json->>summary';

export function checkpointKind(source: string): Checkpoint['kind'] {
  if (source === 'ai-builder' || source === 'theme-change') return 'ai';
  if (source === 'system-restore' || source === 'restore') return 'restore';
  if (source === 'wizard-launch' || source === 'wizard' || source === 'app-builder') return 'launch';
  if (source === 'playground' || source === 'manual' || source === 'code-editor' || source === 'toolbar') return 'manual';
  return 'other';
}

export function checkpointLabel(source: string, summary: string | null | undefined): string {
  const kind = checkpointKind(source);
  const text = typeof summary === 'string' ? summary.trim() : '';
  if (text && !/^AI candidate\b/.test(text) && !/^ai-builder legacy/.test(text)) return text;
  switch (kind) {
    case 'ai': return 'AI change';
    case 'restore': return 'Restored checkpoint';
    case 'launch': return 'Site launched';
    case 'manual': return 'Manual edit';
    default: return source || 'Saved change';
  }
}

export async function listCheckpoints(draftId: string, limit = 30): Promise<Checkpoint[]> {
  const { data, error } = await supabase
    .from('site_revisions')
    .select(COLUMNS)
    .eq('draft_id', draftId)
    .eq('status', 'committed')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return (data as unknown as Array<Record<string, unknown>>).map((row) => {
    const source = String(row.source ?? '');
    return {
      id: String(row.id),
      source,
      kind: checkpointKind(source),
      label: checkpointLabel(source, row.patch_summary as string | null),
      createdAt: String(row.created_at),
    };
  });
}

/**
 * Pick the checkpoint to undo to: the newest committed non-restore checkpoint
 * strictly older than the one the user is currently looking at.
 */
export function pickUndoTarget(checkpoints: Checkpoint[], effectiveId: string | null): Checkpoint | null {
  const ordered = checkpoints; // newest first
  const start = effectiveId ? ordered.findIndex((c) => c.id === effectiveId) : 0;
  const from = start < 0 ? 0 : start;
  for (let index = from + 1; index < ordered.length; index += 1) {
    if (ordered[index].kind !== 'restore') return ordered[index];
  }
  return null;
}

export async function restoreCheckpoint(
  identity: BuilderIdentity,
  target: Pick<Checkpoint, 'id' | 'label'>,
  verb: 'Undo' | 'Redo' | 'Restored' = 'Restored',
): Promise<CommitMutationResult> {
  return restoreRevision({
    targetRevisionId: target.id,
    identity,
    label: `${verb} → ${target.label}`.slice(0, 160),
  });
}

export type { LoadedRevision };
