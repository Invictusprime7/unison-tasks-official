import { resolveLocalImport } from './aiCandidateGates';

/** Read-only project knowledge, bounded by its encoded transport size. */
export function selectSourceKnowledge(
  files: Record<string, string>,
  targets: string[],
  maxBytes = 140_000,
): Record<string, string> {
  return selectSourceKnowledgeWithReport(files, targets, maxBytes).files;
}

export interface SourceKnowledgeReport {
  files: Record<string, string>;
  omitted: Array<{ path: string; reason: 'missing' | 'per-file-limit' | 'transport-budget' }>;
  unresolvedImports: Array<{ path: string; specifier: string }>;
  encodedBytes: number;
  completeTargets: boolean;
}

/** Keeps whole sources and makes missing context observable to the caller. */
export function selectSourceKnowledgeWithReport(
  files: Record<string, string>,
  targets: string[],
  maxBytes = 140_000,
): SourceKnowledgeReport {
  if (!Number.isFinite(maxBytes) || maxBytes < 4) throw new Error('Source context budget must fit an empty encoded object.');
  const omitted: SourceKnowledgeReport['omitted'] = [];
  const unresolvedImports: SourceKnowledgeReport['unresolvedImports'] = [];
  const selected: Record<string, string> = {};
  const visited = new Set<string>();
  const queue = [...targets, '/src/index.css', '/package.json',
    ...Object.keys(files).filter((path) => path.startsWith('/src/project-components/site/')).sort()];
  const encoder = new TextEncoder();
  for (let index = 0; index < queue.length; index++) {
    const path = queue[index];
    if (visited.has(path)) continue;
    visited.add(path);
    const source = files[path];
    if (typeof source !== 'string') {
      omitted.push({ path, reason: 'missing' });
      continue;
    }
    // Match the Composer's per-file schema. Never send partially cut source.
    if (source.length <= 60_000) {
      selected[path] = source;
      // Composer JSON is itself carried inside a JSON message string.
      if (encoder.encode(JSON.stringify(JSON.stringify(selected))).byteLength > maxBytes) {
        delete selected[path];
        omitted.push({ path, reason: 'transport-budget' });
      }
    } else omitted.push({ path, reason: 'per-file-limit' });
    for (const match of source.matchAll(/(?:import|export)\s[^'"`;]*?from\s*['"]([^'"]+)['"]|import\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g)) {
      const specifier = match[1] ?? match[2] ?? match[3];
      const resolved = resolveLocalImport(path, specifier, files);
      if (resolved && !visited.has(resolved)) queue.push(resolved);
      if (resolved === undefined && /^(\.|@\/|\/)/.test(specifier)) unresolvedImports.push({ path, specifier });
    }
  }
  return {
    files: selected, omitted, unresolvedImports,
    encodedBytes: encoder.encode(JSON.stringify(JSON.stringify(selected))).byteLength,
    completeTargets: targets.every(path => Object.prototype.hasOwnProperty.call(selected, path)),
  };
}
