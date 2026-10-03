import type { AICandidateChangeSet } from './aiCandidateChangeSet';

export interface SequentialAiTask {
  id: string;
  files: Record<string, string>;
  deletions: string[];
  paths: string[];
}

const CODE_EXTENSIONS = ['', '.tsx', '.ts', '.jsx', '.js', '/index.tsx', '/index.ts', '/index.jsx', '/index.js'];
const LOCAL_IMPORT_RE = /(?:from\s*|import\s*\(?\s*)["']([^"']+)["']/g;

function normalize(path: string): string {
  const segments: string[] = [];
  for (const segment of path.split('/')) {
    if (!segment || segment === '.') continue;
    if (segment === '..') segments.pop();
    else segments.push(segment);
  }
  return `/${segments.join('/')}`;
}

function dirname(path: string): string {
  const index = path.lastIndexOf('/');
  return index <= 0 ? '' : path.slice(0, index);
}

function resolveCandidateImport(fromPath: string, specifier: string, candidates: ReadonlySet<string>): string | null {
  if (specifier.startsWith('@/')) {
    const base = normalize(`/src/${specifier.slice(2)}`);
    return CODE_EXTENSIONS.map((extension) => `${base}${extension}`).find((path) => candidates.has(path)) ?? null;
  }
  if (!specifier.startsWith('.')) return null;
  const base = normalize(`${dirname(fromPath)}/${specifier}`);
  return CODE_EXTENSIONS.map((extension) => `${base}${extension}`).find((path) => candidates.has(path)) ?? null;
}

function dependencyOrder(paths: readonly string[], files: Readonly<Record<string, string>>): string[] {
  const candidates = new Set(paths);
  const dependencies = new Map(paths.map((path) => [path, new Set<string>()]));
  for (const path of paths) {
    const source = files[path] ?? '';
    for (const match of source.matchAll(LOCAL_IMPORT_RE)) {
      const dependency = resolveCandidateImport(path, match[1], candidates);
      if (dependency && dependency !== path) dependencies.get(path)?.add(dependency);
    }
  }

  const ordered: string[] = [];
  const remaining = new Set(paths);
  while (remaining.size > 0) {
    const ready = [...remaining].filter((path) => [...(dependencies.get(path) ?? [])].every((dependency) => !remaining.has(dependency))).sort();
    const next = ready.length > 0 ? ready : [...remaining].sort();
    for (const path of next) {
      remaining.delete(path);
      ordered.push(path);
    }
  }
  return ordered;
}

export function buildSequentialAiTasks(
  files: Readonly<Record<string, string>>,
  deletions: readonly string[] = [],
  candidate?: Pick<AICandidateChangeSet, 'id'> | null,
  maxFilesPerTask = 2,
): SequentialAiTask[] {
  const paths = dependencyOrder(Object.keys(files), files);
  const tasks: SequentialAiTask[] = [];
  for (let index = 0; index < paths.length; index += Math.max(1, maxFilesPerTask)) {
    const taskPaths = paths.slice(index, index + Math.max(1, maxFilesPerTask));
    tasks.push({
      id: `${candidate?.id ?? 'ai-edit'}:${tasks.length + 1}`,
      files: Object.fromEntries(taskPaths.map((path) => [path, files[path]])),
      deletions: [],
      paths: taskPaths,
    });
  }
  if (deletions.length > 0) {
    tasks.push({
      id: `${candidate?.id ?? 'ai-edit'}:${tasks.length + 1}`,
      files: {},
      deletions: [...deletions].sort(),
      paths: [...deletions].sort(),
    });
  }
  return tasks;
}
