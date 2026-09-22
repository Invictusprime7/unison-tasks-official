import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * P0.3 — no AI surface may claim an edit landed. The only authoritative
 * success string is APPLIED_VERDICT_LINE, emitted after the transaction is
 * verified (see builderTransactionState.ts).
 */
const BANNED = [
  /✅\s*\*{0,2}(?:Applied|Done|Files applied|Element updated|Packs Installed)/i,
  /✅\s*Changes applied/i,
  /Your code is now live/i,
  /Changes have been applied/i,
];

const ALLOWLIST = new Set(['src/services/builder/builderTransactionState.ts']);

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

describe('P0.3 — legacy AI surfaces make no false success claims', () => {
  it.each([
    'src/components/creatives/AICodeAssistant.tsx',
    'src/components/creatives/web-builder/AIAssistantPanel.tsx',
  ])('%s stays deleted', (path) => {
    expect(existsSync(path)).toBe(false);
  });

  it('no source file asserts an edit was applied', () => {
    const root = resolve(process.cwd(), 'src');
    const offenders = walk(root)
      .map((file) => file.replace(`${process.cwd()}/`, ''))
      .filter((file) => !ALLOWLIST.has(file))
      .filter((file) => {
        const source = readFileSync(file, 'utf8');
        return BANNED.some((pattern) => pattern.test(source));
      });
    expect(offenders).toEqual([]);
  });
});
