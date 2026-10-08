import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { deriveIntentChecks } from '@/services/agent-runtime/browserVerification';

describe('browser verification', () => {
  it('checks only intents that survive the change', () => {
    const before = { '/src/pages/Home.tsx': '<a data-ut-intent="nav.goto"/><a data-ut-intent="lead.capture"/>' };
    const after = { '/src/pages/Home.tsx': '<a data-ut-intent="nav.goto"/>' };
    expect(deriveIntentChecks(before, after, ['/src/pages/Home.tsx'])).toEqual([{ kind: 'intent', value: 'nav.goto' }]);
    expect(deriveIntentChecks(before, {}, ['/src/pages/Home.tsx'])).toEqual([]);
  });
});

describe('zero-bypass guards', () => {
  const walk = (d: string): string[] => readdirSync(d).flatMap((f) => {
    const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : /\.(t|j)sx?$/.test(f) ? [p] : [];
  });
  const files = walk('src').filter((f) => !f.includes('/test/'));
  it('no client code imports Playwright', () => {
    expect(files.filter((f) => /from ['"](@playwright\/test|playwright)['"]/.test(readFileSync(f, 'utf8')))).toEqual([]);
  });
  it('terminal never writes the VFS directly', () => {
    for (const f of ['src/services/terminalCommands.ts', 'src/components/creatives/code-editor/VFSTerminal.tsx']) {
      expect(readFileSync(f, 'utf8'), f).not.toMatch(/importFiles\(|importBuilderFiles\(|updateFileContent\(|onWriteFile/);
    }
  });
  it('the Builder wires terminal saves through the coordinator', () => {
    const wb = readFileSync('src/components/creatives/WebBuilder.tsx', 'utf8');
    expect(wb).toMatch(/runExclusive\('terminal'/);
    expect(wb).toMatch(/onTerminalPatch=\{onTerminalPatch\}/);
  });
});

describe('browser verifier contract', () => {
  it('defaults to the in-preview verifier and refuses clicks without a browser provider', async () => {
    const m = await import('@/services/agent-runtime/browserVerification');
    expect(m.getBrowserVerifier().id).toBe('in-preview');
    await expect(m.getBrowserVerifier().click('button')).rejects.toThrow(/browser provider/);
  });
});
