import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { describe, expect, it } from 'vitest';
import { countDirectVfsWrites } from '../../scripts/lint-canonical-vfs-writes.mjs';

/**
 * P1.11 — direct canonical VFS writers reach zero.
 *
 * Every remaining `importFiles` / `importBuilderFiles` call site is either a
 * mutation routed through `commitMutation`, or a classified non-mutation
 * (hydration, adoption of an accepted commit, rollback, local undo/redo,
 * deterministic router projection, workspace import, dependency manifest)
 * annotated with a stated reason.
 */
describe('canonical VFS write closure', () => {
  const baseline = JSON.parse(readFileSync('scripts/canonical-vfs-write-baseline.json', 'utf8'));

  it('records no unclassified direct VFS writer anywhere in src', () => {
    expect(baseline).toEqual({});
  });

  const sources: string[] = [];
  (function walk(dir: string) {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) {
        if (name === 'node_modules' || name.startsWith('.')) continue;
        walk(full);
        continue;
      }
      if (!/\.tsx?$/.test(name) || /\.test\.tsx?$/.test(name)) continue;
      sources.push(relative(process.cwd(), full).split(sep).join('/'));
    }
  })('src');

  it('leaves no unannotated direct writer in the tree', () => {
    const offenders = sources.filter(file => countDirectVfsWrites(readFileSync(file, 'utf8')) > 0);
    expect(offenders).toEqual([]);
  });

  it('states a reason on every exemption', () => {
    const bare: string[] = [];
    for (const file of sources) {
      readFileSync(file, 'utf8').split('\n').forEach((line, index) => {
        if (!line.includes('canonical-vfs-exempt')) return;
        if (!/canonical-vfs-exempt:\s*\S+/.test(line)) bare.push(`${file}:${index + 1}`);
      });
    }
    expect(bare).toEqual([]);
  });

  it('keeps the builder mutation surfaces on the canonical commit path', () => {
    const builder = readFileSync('src/components/creatives/WebBuilder.tsx', 'utf8');
    // Funnel scaffolding and functional-block insertion were direct writers.
    expect(builder).toContain("summary: 'Functional block insert'");
    expect(builder).toMatch(/commitBuilderFiles\(newFiles, \{/);
    expect(builder).not.toMatch(/\n\s*virtualFS\.importFiles\(newFiles\);/);
  });
});
