import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Phase F — Legacy Erasure Gate. No consumer may read the legacy sealed pack
 * field without first preferring the sealed Art Direction record.
 */
const ALLOW = new Set([
  'src/sections/variants/resolvedArtDirection.ts',
]);

function walk(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'test') walk(full, out); }
    else if (/\.(ts|tsx)$/.test(e.name) && !/\.test\./.test(e.name)) out.push(full);
  }
  return out;
}

describe('Phase F — sealed Art Direction is the only read path', () => {
  it('every meta.artDirectionPackId read is preceded by the sealed record', () => {
    const root = resolve(process.cwd(), 'src');
    const offenders: string[] = [];
    for (const file of walk(root)) {
      const rel = file.replace(`${process.cwd()}/`, '');
      if (ALLOW.has(rel)) continue;
      const lines = readFileSync(file, 'utf8').split('\n');
      lines.forEach((line, i) => {
        if (!/meta\??\.artDirectionPackId/.test(line) || /^\s*(\*|\/\/|\/\*)/.test(line)) return;
        const window = lines.slice(Math.max(0, i - 3), i + 1).join('\n');
        if (!/artDirection\??\.storagePackId|readSealedArtDirection/.test(window)) offenders.push(`${rel}:${i + 1}`);
      });
    }
    expect(offenders).toEqual([]);
  });
});
