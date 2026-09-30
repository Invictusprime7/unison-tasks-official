import { describe, expect, it } from 'vitest';
import { buildAiCandidatePatch, type AiCommitContext } from '@/services/aiApplyGate';

function context(): AiCommitContext {
  return {
    businessId: 'business-1',
    projectId: 'project-1',
    draftId: 'draft-1',
    revisionId: 'revision-1',
    beforeFiles: { '/src/App.tsx': 'old', '/src/pages/Removed.tsx': 'remove me' },
    nextFiles: { '/src/App.tsx': 'new' },
    activePagePath: '/src/App.tsx',
    candidate: {
      id: 'candidate-1',
      baseRevisionId: 'revision-1',
      provenance: { origin: 'builder', intent: 'navigation', knowledgeVersion: '2026-09-29.2' },
      targetPages: ['/src/App.tsx'],
      attempt: 1,
      routeOps: [{ type: 'remove_page', pageId: 'removed' }],
      fileOps: [
        { type: 'replace', path: '/src/App.tsx', content: 'new' },
        { type: 'delete', path: '/src/pages/Removed.tsx' },
      ],
    },
  };
}

describe('AI candidate commit protocol', () => {
  it('preserves exact candidate creates, replacements, and deletions in the commit plan', () => {
    expect(buildAiCandidatePatch(context())).toMatchObject({
      summary: 'AI candidate candidate-1',
      candidate: {
        id: 'candidate-1', origin: 'builder', intent: 'navigation', knowledgeVersion: '2026-09-29.2',
        targetPages: ['/src/App.tsx'],
      },
      fileOps: [
        { type: 'replace', path: '/src/App.tsx', contents: 'new' },
        { type: 'delete', path: '/src/pages/Removed.tsx' },
      ],
      routeOps: [{ type: 'remove_page', pageId: 'removed' }],
    });
  });

  it('rejects a candidate based on a different accepted revision', () => {
    const stale = context();
    stale.candidate!.baseRevisionId = 'revision-older';
    expect(() => buildAiCandidatePatch(stale)).toThrow('candidate base revision is stale');
  });
});
