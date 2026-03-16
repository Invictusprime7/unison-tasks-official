/**
 * Import Graph Analyzer — Project dependency graph for AI context
 * 
 * Analyzes import/export relationships across all VFS files to provide:
 * - Which files depend on which (import graph)
 * - Which files export which symbols
 * - Circular dependency detection
 * - Affected file calculation (what needs refresh when X changes)
 * - Structural summary for AI prompts
 */

// ============================================================================
// Types
// ============================================================================

export interface ImportEdge {
  from: string;       // importing file path
  to: string;         // imported file path (resolved)
  specifiers: string[]; // what's imported: ['Button', 'Card'] or ['default']
  isTypeOnly: boolean;
  raw: string;        // raw import source string
}

export interface ExportInfo {
  path: string;
  named: string[];     // named exports
  hasDefault: boolean;
  reExports: string[]; // re-exported modules
}

export interface ImportGraph {
  edges: ImportEdge[];
  exports: Map<string, ExportInfo>;
  entryPoints: string[];
  orphanFiles: string[];
  circularDeps: string[][];
  nodeCount: number;
  edgeCount: number;
  analysisTimeMs: number;
}

export interface AffectedFiles {
  /** Files directly importing the changed file */
  direct: string[];
  /** All files transitively affected */
  transitive: string[];
}

// ============================================================================
// Import Regex Patterns
// ============================================================================

// import X from 'Y'
// import { A, B } from 'Y'
// import * as X from 'Y'
// import 'Y'
// import type { X } from 'Y'
const IMPORT_REGEX = /import\s+(?:type\s+)?(?:(?:(\{[^}]*\})|(\*\s+as\s+\w+)|(\w+))(?:\s*,\s*(?:(\{[^}]*\})|(\*\s+as\s+\w+)|(\w+)))?\s+from\s+)?['"]([^'"]+)['"]/g;

// Dynamic imports: import('Y')
const DYNAMIC_IMPORT_REGEX = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

// require('Y')
const REQUIRE_REGEX = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

// export { X } from 'Y'
const REEXPORT_REGEX = /export\s+(?:type\s+)?(?:\{[^}]*\}|\*)\s+from\s+['"]([^'"]+)['"]/g;

// export const/function/class/default
const EXPORT_REGEX = /export\s+(?:default\s+)?(?:const|let|var|function|class|interface|type|enum)\s+(\w+)/g;
const DEFAULT_EXPORT_REGEX = /export\s+default\s/;

// ============================================================================
// Path Resolution
// ============================================================================

const CODE_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js', '.css', '.json'];

function resolveImportPath(from: string, importSource: string, allPaths: Set<string>): string | null {
  // Skip bare module specifiers (npm packages)
  if (!importSource.startsWith('.') && !importSource.startsWith('/') && !importSource.startsWith('@/')) {
    return null; // External dependency
  }

  // Handle @/ alias
  let resolved = importSource;
  if (importSource.startsWith('@/')) {
    resolved = '/src/' + importSource.slice(2);
  } else if (importSource.startsWith('.')) {
    // Relative path resolution
    const fromDir = from.substring(0, from.lastIndexOf('/'));
    const parts = importSource.split('/');
    const dirParts = fromDir.split('/').filter(Boolean);

    for (const part of parts) {
      if (part === '.') continue;
      if (part === '..') {
        dirParts.pop();
      } else {
        dirParts.push(part);
      }
    }
    resolved = '/' + dirParts.join('/');
  }

  // Try exact match
  if (allPaths.has(resolved)) return resolved;

  // Try with extensions
  for (const ext of CODE_EXTENSIONS) {
    if (allPaths.has(resolved + ext)) return resolved + ext;
    if (allPaths.has(resolved + '/index' + ext)) return resolved + '/index' + ext;
  }

  return null;
}

// ============================================================================
// Core Analyzer
// ============================================================================

export function analyzeImportGraph(files: Record<string, string>): ImportGraph {
  const start = performance.now();
  const allPaths = new Set(Object.keys(files));
  const edges: ImportEdge[] = [];
  const exports = new Map<string, ExportInfo>();

  // Adjacency list for graph traversal
  const adjacency = new Map<string, Set<string>>();
  const reverseAdj = new Map<string, Set<string>>();

  for (const path of allPaths) {
    adjacency.set(path, new Set());
    reverseAdj.set(path, new Set());
  }

  // --- Parse each file ---
  for (const [path, content] of Object.entries(files)) {
    if (!path.match(/\.(tsx?|jsx?|mjs|cjs)$/)) continue;

    // Extract imports
    const importMatches = [...content.matchAll(IMPORT_REGEX)];
    const dynamicMatches = [...content.matchAll(DYNAMIC_IMPORT_REGEX)];
    const requireMatches = [...content.matchAll(REQUIRE_REGEX)];
    const reexportMatches = [...content.matchAll(REEXPORT_REGEX)];

    const allImportSources = new Set<string>();

    for (const match of importMatches) {
      const source = match[7];
      const isTypeOnly = match[0].includes('import type');
      allImportSources.add(source);

      // Parse specifiers
      const specifiers: string[] = [];
      const namedBlock = match[1] || match[4]; // { A, B }
      if (namedBlock) {
        const inner = namedBlock.replace(/[{}]/g, '').trim();
        specifiers.push(...inner.split(',').map(s => s.trim().split(/\s+as\s+/)[0]).filter(Boolean));
      }
      const starImport = match[2] || match[5]; // * as X
      if (starImport) specifiers.push('*');
      const defaultImport = match[3] || match[6]; // X (default)
      if (defaultImport) specifiers.push('default');
      if (specifiers.length === 0) specifiers.push('side-effect');

      const resolved = resolveImportPath(path, source, allPaths);
      edges.push({
        from: path,
        to: resolved || source,
        specifiers,
        isTypeOnly,
        raw: source,
      });

      if (resolved) {
        adjacency.get(path)?.add(resolved);
        reverseAdj.get(resolved)?.add(path);
      }
    }

    for (const match of [...dynamicMatches, ...requireMatches]) {
      const source = match[1];
      const resolved = resolveImportPath(path, source, allPaths);
      if (resolved) {
        edges.push({ from: path, to: resolved, specifiers: ['dynamic'], isTypeOnly: false, raw: source });
        adjacency.get(path)?.add(resolved);
        reverseAdj.get(resolved)?.add(path);
      }
    }

    // Extract exports
    const namedExports: string[] = [];
    const exportMatches = [...content.matchAll(EXPORT_REGEX)];
    for (const match of exportMatches) {
      namedExports.push(match[1]);
    }
    const reExportSources = reexportMatches.map(m => m[1]);
    const hasDefault = DEFAULT_EXPORT_REGEX.test(content);

    exports.set(path, {
      path,
      named: namedExports,
      hasDefault,
      reExports: reExportSources,
    });
  }

  // --- Detect entry points (not imported by anything) ---
  const importedFiles = new Set(edges.filter(e => allPaths.has(e.to)).map(e => e.to));
  const codeFiles = [...allPaths].filter(p => p.match(/\.(tsx?|jsx?)$/));
  const entryPoints = codeFiles.filter(p => !importedFiles.has(p));

  // --- Detect orphans (don't import anything and aren't imported) ---
  const orphanFiles = codeFiles.filter(p =>
    !importedFiles.has(p) &&
    (adjacency.get(p)?.size || 0) === 0
  );

  // --- Detect circular dependencies (DFS) ---
  const circularDeps = detectCycles(adjacency);

  return {
    edges,
    exports,
    entryPoints,
    orphanFiles,
    circularDeps,
    nodeCount: codeFiles.length,
    edgeCount: edges.length,
    analysisTimeMs: performance.now() - start,
  };
}

// ============================================================================
// Affected Files (what to refresh when a file changes)
// ============================================================================

export function getAffectedFiles(
  changedPath: string,
  files: Record<string, string>
): AffectedFiles {
  const graph = analyzeImportGraph(files);
  const allPaths = new Set(Object.keys(files));

  // Build reverse adjacency from edges
  const reverseAdj = new Map<string, Set<string>>();
  for (const path of allPaths) reverseAdj.set(path, new Set());
  for (const edge of graph.edges) {
    if (allPaths.has(edge.to)) {
      reverseAdj.get(edge.to)?.add(edge.from);
    }
  }

  // Direct importers
  const direct = [...(reverseAdj.get(changedPath) || [])];

  // BFS for transitive
  const visited = new Set<string>([changedPath]);
  const queue = [...direct];
  const transitive: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);
    transitive.push(current);

    const importers = reverseAdj.get(current);
    if (importers) {
      for (const importer of importers) {
        if (!visited.has(importer)) queue.push(importer);
      }
    }
  }

  return { direct, transitive };
}

// ============================================================================
// Graph Summary for AI Context
// ============================================================================

export function getGraphSummaryForAI(files: Record<string, string>): string {
  const graph = analyzeImportGraph(files);
  const lines: string[] = ['## Project Import Graph'];

  lines.push(`- ${graph.nodeCount} source files, ${graph.edgeCount} import edges`);
  lines.push(`- Entry points: ${graph.entryPoints.join(', ') || 'none detected'}`);

  if (graph.circularDeps.length > 0) {
    lines.push(`- ⚠️ Circular dependencies detected:`);
    for (const cycle of graph.circularDeps.slice(0, 5)) {
      lines.push(`  - ${cycle.join(' → ')}`);
    }
  }

  if (graph.orphanFiles.length > 0) {
    lines.push(`- Orphan files (unused): ${graph.orphanFiles.join(', ')}`);
  }

  // Component tree
  lines.push('', '### Component Dependencies:');
  for (const [path, exportInfo] of graph.exports) {
    const importers = graph.edges.filter(e => e.to === path);
    if (importers.length > 0 || exportInfo.hasDefault || exportInfo.named.length > 0) {
      const exportsStr = exportInfo.hasDefault ? 'default' : '';
      const namedStr = exportInfo.named.length > 0 ? `{ ${exportInfo.named.join(', ')} }` : '';
      const usedBy = importers.map(e => e.from).join(', ');
      lines.push(`- \`${path}\` exports: ${[exportsStr, namedStr].filter(Boolean).join(', ')}${usedBy ? ` ← used by: ${usedBy}` : ''}`);
    }
  }

  return lines.join('\n');
}

// ============================================================================
// Cycle Detection (Tarjan's algorithm simplified)
// ============================================================================

function detectCycles(adjacency: Map<string, Set<string>>): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const inStack = new Set<string>();
  const stack: string[] = [];

  function dfs(node: string) {
    if (inStack.has(node)) {
      // Found cycle
      const cycleStart = stack.indexOf(node);
      if (cycleStart !== -1) {
        cycles.push([...stack.slice(cycleStart), node]);
      }
      return;
    }
    if (visited.has(node)) return;

    visited.add(node);
    inStack.add(node);
    stack.push(node);

    const neighbors = adjacency.get(node);
    if (neighbors) {
      for (const neighbor of neighbors) {
        dfs(neighbor);
      }
    }

    stack.pop();
    inStack.delete(node);
  }

  for (const node of adjacency.keys()) {
    dfs(node);
  }

  return cycles;
}
