/**
 * BuilderMutationCoordinator — serialises every Builder save surface (AI chat,
 * toolbar AI, terminal, command menu, autosave, catalog) so only one canonical
 * commit runs at a time, and rebases AI candidates whose base revision moved
 * only because of non-overlapping saves. It never writes: callers still commit
 * through runBuilderAiMutation → commitMutation, and aiApplyGate keeps its
 * strict stale-revision check.
 */
import type { AICandidateChangeSet } from '@/services/builder/aiCandidateChangeSet';

export type MutationSurface = 'ai-builder' | 'toolbar-ai' | 'terminal' | 'command-menu' | 'autosave' | 'catalog';

let tail: Promise<unknown> = Promise.resolve();
let activeAiEdits = 0;
let lastCommit: { surface: MutationSurface; revisionId: string | null; at: number } | null = null;

/** Run `task` after every previously queued Builder mutation has settled. */
export function runExclusive<T>(surface: MutationSurface, task: () => Promise<T>): Promise<T> {
  const isAi = surface === 'ai-builder' || surface === 'toolbar-ai';
  if (isAi) activeAiEdits += 1;
  const run = tail.then(task, task);
  tail = run.catch(() => undefined).finally(() => { if (isAi) activeAiEdits -= 1; });
  return run;
}

/** Autosave must skip while an AI edit is generating or committing. */
export function shouldPauseAutosave(): boolean {
  return activeAiEdits > 0;
}

export function recordCommit(surface: MutationSurface, revisionId: string | null): void {
  lastCommit = { surface, revisionId, at: Date.now() };
}

export function getLastCommit() {
  return lastCommit;
}

export type RebaseResult =
  | { ok: true; candidate: AICandidateChangeSet; rebased: boolean }
  | { ok: false; conflicts: string[] };

/**
 * Move a candidate onto `currentRevisionId` when none of the files it touches
 * changed between the candidate's base files and the current files.
 */
export function rebaseCandidate(
  candidate: AICandidateChangeSet,
  candidateBaseFiles: Readonly<Record<string, string>>,
  currentFiles: Readonly<Record<string, string>>,
  currentRevisionId: string | null,
): RebaseResult {
  if ((candidate.baseRevisionId ?? null) === currentRevisionId) {
    return { ok: true, candidate, rebased: false };
  }
  const conflicts = candidate.fileOps
    .map((op) => op.path)
    .filter((path) => (candidateBaseFiles[path] ?? null) !== (currentFiles[path] ?? null));
  if (conflicts.length > 0) return { ok: false, conflicts };
  return {
    ok: true,
    rebased: true,
    candidate: { ...candidate, baseRevisionId: currentRevisionId ?? undefined },
  };
}

/** Plain-language explanation for a stale candidate. */
export function describeStaleCandidate(conflicts: string[] = []): string {
  const who = lastCommit
    ? `${lastCommit.surface === 'autosave' ? 'an autosave' : `a ${lastCommit.surface} save`} at ${new Date(lastCommit.at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
    : 'another save';
  const files = conflicts.length ? ` It changed ${conflicts.slice(0, 3).join(', ')} too.` : '';
  return `Your site changed while the AI was working (${who}).${files} Please send the request again so it runs on the latest version.`;
}
