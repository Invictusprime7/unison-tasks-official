import { resolveLocalImport } from './aiCandidateGates';

/** Read-only project knowledge, bounded by its encoded transport size. */
export function selectSourceKnowledge(
  files: Record<string, string>,
  targets: string[],
  maxBytes = 140_000,
): Record<string, string> {
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
    if (typeof source !== 'string') continue;
    // Match the Composer's per-file schema. Never send partially cut source.
    if (source.length <= 60_000) {
      selected[path] = source;
      // Composer JSON is itself carried inside a JSON message string.
      if (encoder.encode(JSON.stringify(JSON.stringify(selected))).byteLength > maxBytes) delete selected[path];
    }
    for (const match of source.matchAll(/(?:import|export)\s[^'"`;]*?from\s*['"]([^'"]+)['"]|import\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g)) {
      const resolved = resolveLocalImport(path, match[1] ?? match[2] ?? match[3], files);
      if (resolved && !visited.has(resolved)) queue.push(resolved);
    }
  }
  return selected;
}
