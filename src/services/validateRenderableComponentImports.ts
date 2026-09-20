/**
 * Static renderability gate for generated TSX candidates.
 *
 * This runs before a Lane B page is merged. It proves that every imported
 * component used as a PascalCase JSX root resolves to the export shape the
 * import requested. Package exports remain governed by the runtime dependency
 * allow-list; local and generated Unison modules are checked against exact VFS
 * bytes.
 */
import { tryParse } from './aiSitePreflightRepair';

const CODE_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'] as const;

export interface RenderableImportViolation {
  path: string;
  symbol: string;
  importSource: string;
  reason: 'module-unresolved' | 'named-export-unavailable' | 'default-export-unavailable';
  message: string;
}

export interface RenderableImportValidation {
  valid: boolean;
  violations: RenderableImportViolation[];
}

interface ImportedBinding {
  local: string;
  imported: string;
  source: string;
  kind: 'default' | 'named' | 'namespace';
}

function normalizePath(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}

function resolveImportPath(fromPath: string, source: string, paths: Set<string>): string | null {
  if (!source.startsWith('.') && !source.startsWith('/') && !source.startsWith('@/')) return null;
  let base: string;
  if (source.startsWith('@/')) base = `/src/${source.slice(2)}`;
  else if (source.startsWith('/')) base = source;
  else {
    const segments = normalizePath(fromPath).split('/').slice(0, -1);
    for (const segment of source.split('/')) {
      if (!segment || segment === '.') continue;
      if (segment === '..') segments.pop();
      else segments.push(segment);
    }
    base = segments.join('/') || '/';
  }
  const candidates = [base, ...CODE_EXTENSIONS.map(ext => `${base}${ext}`), ...CODE_EXTENSIONS.map(ext => `${base}/index${ext}`)];
  return candidates.find(candidate => paths.has(candidate)) ?? null;
}

function parseBindings(source: string): ImportedBinding[] {
  const bindings: ImportedBinding[] = [];
  const pattern = /import\s+(?!type\b)([\s\S]*?)\s+from\s+['"]([^'"]+)['"];?/g;
  for (const match of source.matchAll(pattern)) {
    const clause = match[1].trim();
    const importSource = match[2];
    if (!clause || !importSource) continue;
    const namespace = clause.match(/\*\s+as\s+([A-Za-z_$][\w$]*)/);
    if (namespace?.[1]) bindings.push({ local: namespace[1], imported: '*', source: importSource, kind: 'namespace' });
    const named = clause.match(/\{([\s\S]*?)\}/)?.[1];
    if (named) {
      for (const specifier of named.split(',')) {
        const [imported, local] = specifier.trim().split(/\s+as\s+/);
        if (imported) bindings.push({ local: local || imported, imported, source: importSource, kind: 'named' });
      }
    }
    const defaultName = clause.split(',')[0]?.trim();
    if (defaultName && /^[A-Za-z_$][\w$]*$/.test(defaultName)) {
      bindings.push({ local: defaultName, imported: 'default', source: importSource, kind: 'default' });
    }
  }
  return bindings;
}

function jsxRoots(source: string): Set<string> {
  return new Set(Array.from(source.matchAll(/<([A-Z][A-Za-z0-9_$]*)(?:\.[A-Za-z_$][\w$]*)?(?=[\s/>])/g), match => match[1]));
}

function exportedNames(source: string): { named: Set<string>; hasDefault: boolean } {
  const named = new Set<string>();
  for (const match of source.matchAll(/export\s+(?:declare\s+)?(?:const|let|var|function|class|enum)\s+([A-Za-z_$][\w$]*)/g)) {
    if (match[1]) named.add(match[1]);
  }
  for (const match of source.matchAll(/export\s*\{([^}]+)\}/g)) {
    for (const specifier of match[1].split(',')) {
      const parts = specifier.trim().split(/\s+as\s+/);
      const exported = parts[1] || parts[0];
      if (exported && exported !== 'default') named.add(exported);
    }
  }
  return { named, hasDefault: /export\s+default\b/.test(source) || /export\s*\{[^}]*\bas\s+default\b[^}]*\}/.test(source) };
}

export function validateRenderableComponentImports(options: {
  path: string;
  source: string;
  files: Record<string, string>;
}): RenderableImportValidation {
  if (!tryParse(options.source).ok) return { valid: true, violations: [] };
  const files = Object.fromEntries(Object.entries(options.files).map(([path, content]) => [normalizePath(path), content]));
  files[normalizePath(options.path)] = options.source;
  const paths = new Set(Object.keys(files));
  const roots = jsxRoots(options.source);
  const violations: RenderableImportViolation[] = [];

  for (const binding of parseBindings(options.source)) {
    if (!roots.has(binding.local)) continue;
    const resolved = resolveImportPath(options.path, binding.source, paths);
    if (!resolved) {
      if (binding.source.startsWith('.') || binding.source.startsWith('/') || binding.source.startsWith('@/')) {
        violations.push({
          path: options.path, symbol: binding.local, importSource: binding.source, reason: 'module-unresolved',
          message: `${options.path} renders ${binding.local}, but import "${binding.source}" does not resolve in the candidate VFS.`,
        });
      }
      continue;
    }
    const exports = exportedNames(files[resolved] ?? '');
    if (binding.kind === 'default' && !exports.hasDefault) {
      violations.push({
        path: options.path, symbol: binding.local, importSource: binding.source, reason: 'default-export-unavailable',
        message: `${options.path} renders ${binding.local}, but "${binding.source}" has no default export.`,
      });
    } else if (binding.kind === 'named' && !exports.named.has(binding.imported)) {
      violations.push({
        path: options.path, symbol: binding.local, importSource: binding.source, reason: 'named-export-unavailable',
        message: `${options.path} renders ${binding.local}, but "${binding.source}" does not export ${binding.imported}.`,
      });
    }
  }

  return { valid: violations.length === 0, violations };
}