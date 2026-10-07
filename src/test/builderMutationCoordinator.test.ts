import { describe, it, expect } from 'vitest';
import { rebaseCandidate, runExclusive, shouldPauseAutosave, setAiGenerationActive } from '@/services/builder/builderMutationCoordinator';
import { fnv1a, type AICandidateChangeSet } from '@/services/builder/aiCandidateChangeSet';

const cand = (prints?: Record<string, string | null>): AICandidateChangeSet => ({
  id: 'c1', baseRevisionId: 'r1', provenance: { origin: 'builder', knowledgeVersion: 'x' },
  fileOps: [{ type: 'replace', path: '/src/pages/About.tsx', content: 'new' }], routeOps: [], targetPages: [], attempt: 1,
  baseFingerprints: prints,
});

describe('builderMutationCoordinator', () => {
  it('rebases when touched files are unchanged', () => {
    const r = rebaseCandidate(cand({ '/src/pages/About.tsx': fnv1a('old') }), { '/src/pages/About.tsx': 'old', '/src/pages/Home.tsx': 'changed' }, 'r2');
    expect(r.ok && r.candidate.baseRevisionId).toBe('r2');
  });
  it('refuses when a touched file changed', () => {
    const r = rebaseCandidate(cand({ '/src/pages/About.tsx': fnv1a('old') }), { '/src/pages/About.tsx': 'other' }, 'r2');
    expect(r.ok).toBe(false);
  });
  it('refuses without fingerprints', () => {
    expect(rebaseCandidate(cand(), {}, 'r2').ok).toBe(false);
  });
  it('serialises tasks and pauses autosave during AI work', async () => {
    const order: number[] = [];
    setAiGenerationActive(true);
    expect(shouldPauseAutosave()).toBe(true);
    setAiGenerationActive(false);
    await Promise.all([
      runExclusive('terminal', async () => { await new Promise((r) => setTimeout(r, 10)); order.push(1); }),
      runExclusive('autosave', async () => { order.push(2); }),
    ]);
    expect(order).toEqual([1, 2]);
  });
});
