/** Shared helpers for the Unison certification scripts. Authoring-only; excluded from consumers. */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve, relative, isAbsolute } from 'node:path';
import ts from 'typescript';

export const ROOT = process.cwd();
export const DS = join(ROOT, 'src/sections');
export const REGISTRY = join(DS, 'variants/registry.ts');
export const PUBLIC = join(DS, 'variants/public.ts');
export const EVIDENCE = join(DS, 'unison/certification/evidence.json');

export const readEvidence = () => JSON.parse(readFileSync(EVIDENCE, 'utf8')) as Record<string, any>;
export const writeEvidence = (e: Record<string, any>) =>
  writeFileSync(EVIDENCE, JSON.stringify(Object.fromEntries(Object.entries(e).sort()), null, 2) + '\n');

/** Map of component export name → absolute file, from registry imports. */
export function componentFiles(): Record<string, string> {
  const src = readFileSync(REGISTRY, 'utf8');
  const out: Record<string, string> = {};
  for (const m of src.matchAll(/import \{([^}]+)\} from '(\.\/[^']+)'/g)) {
    for (const n of m[1].split(',')) {
      const name = n.trim().split(' as ').pop()!;
      if (name) out[name] = resolveTs(join(DS, 'variants'), m[2]);
    }
  }
  return out;
}

export function resolveTs(from: string, spec: string): string {
  const base = resolve(from, spec);
  for (const c of [base, base + '.tsx', base + '.ts', join(base, 'index.ts'), join(base, 'index.tsx')]) if (existsSync(c) && !c.endsWith('/')) try { readFileSync(c); return c; } catch { /* dir */ }
  return base;
}

/** Local import closure + external package specifiers. */
export function importClosure(file: string) {
  const local = new Set<string>(); const external = new Set<string>(); const escapes: string[] = [];
  const walk = (f: string) => {
    if (local.has(f)) return; local.add(f);
    if (!existsSync(f)) { escapes.push(`unresolved ${f}`); return; }
    for (const m of readFileSync(f, 'utf8').matchAll(/(?:import|export)[^'"]*?from\s*['"]([^'"]+)['"]/g)) {
      const s = m[1];
      if (s.startsWith('.')) { const r = resolveTs(dirname(f), s); const rel = relative(DS, r); if (rel === '..' || rel.startsWith('..' + '/') || rel.startsWith('..' + '\\') || isAbsolute(rel)) escapes.push(`${s} leaves the design-system root`); else walk(r); }
      else if (s.startsWith('@/')) escapes.push(`absolute alias ${s} in ${f.replace(ROOT + '/', '')}`);
      else external.add(s.startsWith('@') ? s.split('/').slice(0, 2).join('/') : s.split('/')[0]);
    }
  };
  walk(file);
  return { local: [...local], external: [...external], escapes };
}

export const hashFiles = (files: string[]) => {
  const h = createHash('sha256');
  for (const f of [...files].sort()) if (existsSync(f)) h.update(readFileSync(f));
  return h.digest('hex').slice(0, 16);
};

/** Locate the object literal for one registry entry: [start, end) offsets. */
export function registryEntryRange(src: string, id: string): [number, number] {
  const file = ts.createSourceFile('registry.ts', src, ts.ScriptTarget.Latest, true);
  let range: [number, number] | undefined;
  const visit = (node: ts.Node) => {
    if (ts.isObjectLiteralExpression(node) && node.properties.some(property =>
      ts.isPropertyAssignment(property) && property.name.getText(file) === 'id' &&
      ts.isStringLiteral(property.initializer) && property.initializer.text === id)) {
      range = [node.getStart(file), node.end];
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  if (!range) throw new Error(`${id} not found in registry.ts`);
  return range;
}
