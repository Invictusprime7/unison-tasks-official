import { describe, expect, it, vi, beforeEach } from 'vitest';

const persistAiCommit = vi.fn();

vi.mock('@/services/aiApplyGate', () => ({
  persistAiCommit: (...args: unknown[]) => persistAiCommit(...args),
}));

import { runBuilderAiMutation } from '@/services/builder/builderMutationService';
import { CommitRejectedError } from '@/services/vfsCommitService';

const ctx = {
  businessId: 'b1',
  projectId: 'p1',
  draftId: 'd1',
  beforeFiles: { '/src/pages/Home.tsx': 'old' },
  nextFiles: { '/src/pages/Home.tsx': 'new' },
  activePagePath: '/',
} as never as Parameters<typeof runBuilderAiMutation>[0];

beforeEach(() => persistAiCommit.mockReset());

describe('builder AI mutation transaction', () => {
  it('commits once and reports applied only after the mirror succeeds', async () => {
    persistAiCommit.mockResolvedValue({
      vfsFiles: { '/src/pages/Home.tsx': 'new' },
      persistedRevisionId: 'rev-2',
    });
    const mirror = vi.fn(() => ({ success: true, filesWritten: ['/src/pages/Home.tsx'] }));

    const outcome = await runBuilderAiMutation(ctx, { mirror });

    expect(persistAiCommit).toHaveBeenCalledTimes(1);
    expect(mirror).toHaveBeenCalledWith({ '/src/pages/Home.tsx': 'new' });
    expect(outcome.state).toBe('applied');
    expect(outcome.success).toBe(true);
    expect(outcome.revisionId).toBe('rev-2');
  });

  it('reports rejected without mirroring when the canonical gate refuses', async () => {
    persistAiCommit.mockRejectedValue(new CommitRejectedError('blocked', {
      publishBlockers: [{ source: 'preview', code: 'syntax', message: 'Preview would break.' }],
    } as never));
    const mirror = vi.fn(() => ({ success: true }));

    const outcome = await runBuilderAiMutation(ctx, { mirror });

    expect(mirror).not.toHaveBeenCalled();
    expect(outcome.state).toBe('rejected');
    expect(outcome.success).toBe(false);
    expect(outcome.reason).toBe('Preview would break.');
  });

  it('rolls the working files back when the mirror fails after commit', async () => {
    persistAiCommit.mockResolvedValue({
      vfsFiles: { '/src/pages/Home.tsx': 'new' },
      persistedRevisionId: 'rev-3',
    });
    const rollback = vi.fn();

    const outcome = await runBuilderAiMutation(ctx, {
      mirror: () => ({ success: false, errors: ['write failed'] }),
      rollback,
    });

    expect(rollback).toHaveBeenCalledWith(ctx.beforeFiles);
    expect(outcome.state).toBe('failed');
    expect(outcome.success).toBe(false);
    expect(outcome.errors).toEqual(['write failed']);
  });

  it('never reports success when the commit itself throws', async () => {
    persistAiCommit.mockRejectedValue(new Error('network down'));
    const outcome = await runBuilderAiMutation(ctx, { mirror: () => ({ success: true }) });
    expect(outcome.state).toBe('failed');
    expect(outcome.success).toBe(false);
  });
});
