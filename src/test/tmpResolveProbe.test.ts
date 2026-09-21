import { describe, expect, it } from 'vitest';
import { compositionToReactFileSet } from '@/sections/compositionToFileSet';
import { ALL_COMPOSITIONS } from '@/sections/templates';
import { normalizeLauncherFiles, prepareSandpackFiles } from '@/utils/sandpackFilePrep';
import { SANDPACK_DEPENDENCIES } from '@/utils/sandpackDependencies';

function resolveRelative(fromPath: string, spec: string, files: Record<string, string>): boolean {
  const base = fromPath.split('/').slice(0, -1);
  const parts = spec.split('/');
  for (const part of parts) {
    if (part === '.' || part === '') continue;
    if (part === '..') base.pop();
    else base.push(part);
  }
  const target = base.join('/');
  const candidates = [target, `${target}.ts`, `${target}.tsx`, `${target}.js`, `${target}.jsx`,
    `${target}.css`, `${target}/index.ts`, `${target}/index.tsx`];
  return candidates.some((candidate) => candidate in files);
}

describe('probe: preview import resolution', () => {
  it('resolves every import emitted for every composition home page', () => {
    const problems: string[] = [];
    for (const template of ALL_COMPOSITIONS) {
      const source = compositionToReactFileSet(template, '/src/pages/Home.tsx');
      const normalized = normalizeLauncherFiles(source, { entryPoint: '/src/pages/Home.tsx' });
      let prepared: Record<string, string>;
      try {
        prepared = prepareSandpackFiles(normalized, { entryPoint: '/index.tsx' });
      } catch (error) {
        problems.push(`${template.id}: prepare threw ${(error as Error).message}`);
        continue;
      }
      for (const [path, content] of Object.entries(prepared)) {
        if (!/\.(tsx?|jsx?)$/.test(path)) continue;
        for (const match of content.matchAll(/(?:from|import)\s*['"]([^'"]+)['"]/g)) {
          const spec = match[1];
          if (spec.startsWith('.')) {
            if (!resolveRelative(path, spec, prepared)) problems.push(`${template.id}: ${path} -> ${spec} (missing file)`);
            continue;
          }
          if (spec.startsWith('@/')) { problems.push(`${template.id}: ${path} -> ${spec} (unrewritten alias)`); continue; }
          const pkg = spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0];
          if (pkg === 'react' || pkg === 'react-dom') continue;
          if (!(pkg in SANDPACK_DEPENDENCIES)) problems.push(`${template.id}: ${path} -> ${spec} (unpinned package)`);
        }
      }
    }
    expect([...new Set(problems)].slice(0, 60)).toEqual([]);
  });
});
