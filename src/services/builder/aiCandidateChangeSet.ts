/**
 * AICandidateChangeSet — AI Composer milestone, Phase 2 (doc §9–§10).
 *
 * An ephemeral, in-memory transaction layer — NOT a second VFS.
 *
 *   lastKnownGoodFiles + candidate fileOps = candidateFiles
 *
 * Nothing here writes to the working VFS, emits preview events, or persists.
 * The candidate is disposable until validation passes; only then may the
 * caller hand `candidateFiles` to the single legal writer (vfsCommitService
 * via aiApplyGate / builderMutationService).
 */

import {
  canonicalizeAIFilePaths,
  generatePackageJson,
  repairAiJsxTypos,
  validateAIFileEdits,
} from '@/services/aiVFSOrchestrator';
import { getDependenciesForSandpack } from '@/utils/dependencyExtractor';

export type CandidateFileOp =
  | { type: 'create'; path: string; content: string }
  | { type: 'replace'; path: string; content: string }
  | { type: 'delete'; path: string };

export interface AICandidateChangeSet {
  id: string;
  baseRevisionId?: string;
  fileOps: CandidateFileOp[];
  requestedDependencies?: string[];
  targetPages: string[];
  attempt: number;
}

export interface BuildCandidateInput {
  /** Raw AI file map (path → full contents). */
  aiFiles: Record<string, string>;
  /** Paths the AI asked to delete. */
  deletions?: string[];
  /** Last committed (known-good) VFS. Never mutated. */
  baseFiles: Readonly<Record<string, string>>;
  baseRevisionId?: string;
  targetPages?: string[];
  attempt?: number;
  /** Resolve deps and regenerate package.json in the candidate (default true). */
  resolveDependencies?: boolean;
}

export interface CandidateBuildResult {
  changeSet: AICandidateChangeSet;
  /** base + fileOps, in memory. Not user-visible. */
  candidateFiles: Record<string, string>;
  /** Edits refused before validation (protected paths, slot violations). */
  refused: Array<{ path: string; reason: string }>;
}

function fnv1a(text: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

/** Normalize AI output into a transactional change set (no side effects). */
export function buildAICandidateChangeSet(input: BuildCandidateInput): CandidateBuildResult {
  const base = input.baseFiles;
  const canonical = canonicalizeAIFilePaths(input.aiFiles, base as Record<string, string>);
  const { appliable, skipped } = validateAIFileEdits(canonical, base as Record<string, string>);
  const repaired = repairAiJsxTypos(appliable);

  const fileOps: CandidateFileOp[] = [];
  for (const path of Object.keys(repaired).sort()) {
    const content = repaired[path];
    if (base[path] === content) continue;
    fileOps.push({ type: path in base ? 'replace' : 'create', path, content });
  }
  const refused = [...skipped];
  for (const raw of [...(input.deletions ?? [])].sort()) {
    const [path] = Object.keys(canonicalizeAIFilePaths({ [raw]: '' }, base as Record<string, string>));
    if (!(path in base)) continue;
    const guard = validateAIFileEdits({ [path]: '' }, {});
    if (guard.skipped.length) { refused.push(...guard.skipped); continue; }
    fileOps.push({ type: 'delete', path });
  }

  const candidateFiles = applyCandidateFileOps(base, fileOps);
  let requestedDependencies: string[] | undefined;
  if (input.resolveDependencies !== false && fileOps.length) {
    const { dependencies } = getDependenciesForSandpack(candidateFiles);
    const pkg = generatePackageJson(dependencies, candidateFiles);
    const prev = JSON.parse(base['/package.json'] || '{"dependencies":{}}').dependencies ?? {};
    requestedDependencies = Object.keys(JSON.parse(pkg).dependencies).filter((d) => !(d in prev)).sort();
    if (pkg !== base['/package.json']) {
      fileOps.push({ type: base['/package.json'] ? 'replace' : 'create', path: '/package.json', content: pkg });
      candidateFiles['/package.json'] = pkg;
    }
  }

  const attempt = input.attempt ?? 1;
  const id = `cand_${fnv1a(`${input.baseRevisionId ?? ''}|${attempt}|${JSON.stringify(fileOps)}`)}`;
  return {
    changeSet: {
      id,
      baseRevisionId: input.baseRevisionId,
      fileOps,
      requestedDependencies,
      targetPages: [...(input.targetPages ?? [])].sort(),
      attempt,
    },
    candidateFiles,
    refused,
  };
}

/** Pure: apply file ops to a copy of the base. The base is never mutated. */
export function applyCandidateFileOps(
  base: Readonly<Record<string, string>>,
  ops: readonly CandidateFileOp[],
): Record<string, string> {
  const next: Record<string, string> = { ...base };
  for (const op of ops) {
    if (op.type === 'delete') delete next[op.path];
    else next[op.path] = op.content;
  }
  return next;
}
