import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('launch orchestrator canonical handoff', () => {
  const source = readFileSync('src/services/launch/launchOrchestrator.ts', 'utf8');

  it('hands Builder the exact artifacts returned by the canonical commit', () => {
    expect(source).toContain('const committed = commit.result;');
    expect(source).toContain('vfsFiles: committed.vfsFiles');
    expect(source).toContain('siteBundleSnapshot: committed.siteBundleSnapshot');
    expect(source).toContain('runtimeManifest: committed.runtimeManifest');
    expect(source).toContain('revisionId: committed.persistedRevisionId');
  });

  it('rejects an incomplete canonical result before navigation', () => {
    expect(source).toContain('if (!result.siteBundleSnapshot || !result.runtimeManifest)');
    expect(source).toContain('The canonical commit returned an incomplete launch artifact.');
  });
});