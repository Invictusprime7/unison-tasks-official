/**
 * builderMutationService — P0.3 of the canonical closure plan.
 *
 * Every AI Builder edit used to run as two separate pipeline executions:
 * a dry-run commit, then — after a gap — a second real commit, and only then
 * a mirror into the working VFS. Three consequences:
 *
 *   • the patch was validated against one pipeline run and persisted by
 *     another, so the accepted bytes and the persisted bytes were not
 *     provably the same run;
 *   • patch-style mirroring could not remove files, so a committed deletion
 *     remained visible in the working VFS;
 *   • "applied" was reported from the mirror alone, not from a transaction.
 *
 * This service makes an AI edit ONE transaction with one terminal state.
 * It adds no writer: `commitMutation` (via `persistAiCommit`) remains the
 * single durable writer, and the canonical preview gate still rejects a
 * preview-breaking patch *before* anything is persisted or mirrored.
 */

import { persistAiCommit, type AiCommitContext } from '@/services/aiApplyGate';
import {
  CommitRejectedError,
  type CommitMutationResult,
  type PublishBlockerSummary,
} from '@/services/vfsCommitService';

/** Terminal states of a builder mutation transaction. */
export type BuilderMutationState =
  /** Canonical gates refused the patch. Nothing persisted, nothing mirrored. */
  | 'rejected'
  /** Committed durably AND mirrored into the working VFS. */
  | 'applied'
  /** Commit or committed-state mirror failed. Durable details remain available. */
  | 'failed';

export interface BuilderMutationOutcome {
  state: BuilderMutationState;
  /** True only for `applied` — never inferred from a partial step. */
  success: boolean;
  errors: string[];
  blockers: PublishBlockerSummary[];
  /** Human-readable reason for a non-applied outcome. */
  reason?: string;
  commit?: CommitMutationResult;
  revisionId?: string | null;
  /** Canonical post-commit file map (authoritative over the proposed patch). */
  committedFiles?: Record<string, string>;
  changedPaths: string[];
}

export interface BuilderMutationHooks {
  /**
   * Replace the working VFS with the complete committed file map in one state
   * transition. Full replacement is required so accepted deletions converge.
   */
  mirror: (committedFiles: Record<string, string>) => { success: boolean; errors?: string[]; filesWritten?: string[] };
}

function changedPathsBetween(
  before: Record<string, string>,
  after: Record<string, string>,
): string[] {
  return Array.from(new Set([...Object.keys(before), ...Object.keys(after)]))
    .filter(path => before[path] !== after[path])
    .sort();
}

/**
 * Run an AI Builder edit as a single transaction:
 * validate + persist in one canonical commit, then mirror, then settle.
 */
export async function runBuilderAiMutation(
  ctx: AiCommitContext,
  hooks: BuilderMutationHooks,
): Promise<BuilderMutationOutcome> {
  let commit: CommitMutationResult;
  try {
    // One pipeline run validates AND persists — the accepted bytes are, by
    // construction, the persisted bytes.
    commit = await persistAiCommit(ctx);
  } catch (error) {
    if (error instanceof CommitRejectedError) {
      const blockers = error.result.publishBlockers ?? [];
      const primary = blockers.find((b) => b.source === 'preview' || b.source === 'publishGate');
      return {
        state: 'rejected',
        success: false,
        errors: blockers.length ? blockers.map((b) => b.message) : [error.message],
        blockers,
        reason: primary?.message ?? error.message,
        commit: error.result,
        changedPaths: [],
      };
    }
    const message = error instanceof Error ? error.message : String(error);
    return {
      state: 'failed',
      success: false,
      errors: [message],
      blockers: [],
      reason: message,
      changedPaths: [],
    };
  }

  const committedFiles = commit.vfsFiles ?? {};
  const changedPaths = changedPathsBetween(ctx.beforeFiles, committedFiles);
  const mirror = hooks.mirror(committedFiles);

  if (!mirror.success) {
    // Supabase is already durable truth. Never pretend the previous local map
    // rolled back the commit; the returned revision/files let reload reconcile.
    const errors = mirror.errors?.length ? mirror.errors : ['The edit could not be applied to the working files.'];
    return {
      state: 'failed',
      success: false,
      errors,
      blockers: [],
      reason: errors[0],
      commit,
      revisionId: commit.persistedRevisionId ?? null,
      committedFiles,
      changedPaths,
    };
  }

  return {
    state: 'applied',
    success: true,
    errors: [],
    blockers: [],
    commit,
    revisionId: commit.persistedRevisionId ?? null,
    committedFiles,
    changedPaths,
  };
}
