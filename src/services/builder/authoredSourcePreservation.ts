/** M0 verifier primitive. Ownership must come from revision metadata, not AI markers. */
export type AuthoredSourceOperation =
  | { type: 'create' | 'replace'; path: string; contents: string }
  | { type: 'delete'; path: string };

export interface SourcePreservationViolation {
  path: string;
  stage: string;
  kind: 'changed' | 'missing' | 'unexpected';
}

/** VFS identity is slash-rooted and case-sensitive. Reject traversal and aliases. */
export function normalizeAuthoredPath(path: string): string {
  if (!path || path.includes('\0') || /^[a-z]:/i.test(path) || path.includes('://')) throw new Error('Invalid VFS path.');
  const parts = path.replace(/\\/g, '/').split('/').filter(part => part && part !== '.');
  if (!parts.length || parts.includes('..')) throw new Error('Invalid VFS path.');
  return '/' + parts.join('/');
}

function normalizeFiles(files: Record<string, string>): Map<string, string> {
  const normalized = new Map<string, string>();
  for (const [raw, contents] of Object.entries(files)) {
    const path = normalizeAuthoredPath(raw);
    if (normalized.has(path)) throw new Error(`VFS path collision: ${path}`);
    normalized.set(path, contents);
  }
  return normalized;
}

/**
 * Compare finalized bytes against accepted bytes plus authorized operations.
 * A rename is an explicit delete/create pair. Compiler paths are supplied by
 * the ownership contract; this module never guesses from a directory or marker.
 * Diagnostics intentionally exclude source. No writes or automatic repair.
 */
export function verifyAuthoredSourcePreservation(input: {
  acceptedFiles: Record<string, string>;
  operations: readonly AuthoredSourceOperation[];
  finalizedFiles: Record<string, string>;
  compilerOwnedPaths: readonly string[];
  stage: string;
}): SourcePreservationViolation[] {
  const expected = normalizeFiles(input.acceptedFiles);
  const actual = normalizeFiles(input.finalizedFiles);
  const compilerOwned = new Set(input.compilerOwnedPaths.map(normalizeAuthoredPath));
  const operated = new Set<string>();
  for (const operation of input.operations) {
    const path = normalizeAuthoredPath(operation.path);
    if (operated.has(path)) throw new Error(`Duplicate candidate operation: ${path}`);
    operated.add(path);
    if (operation.type === 'delete') expected.delete(path);
    else expected.set(path, operation.contents);
  }
  const violations: SourcePreservationViolation[] = [];
  for (const path of [...new Set([...expected.keys(), ...actual.keys()])].sort()) {
    if (compilerOwned.has(path)) continue;
    const kind = !expected.has(path) ? 'unexpected' : !actual.has(path) ? 'missing'
      : expected.get(path) !== actual.get(path) ? 'changed' : null;
    if (kind) violations.push({ path, stage: input.stage, kind });
  }
  return violations;
}
