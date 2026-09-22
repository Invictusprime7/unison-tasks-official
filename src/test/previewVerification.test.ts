import { describe, expect, it, beforeEach, vi } from 'vitest';
import {
  awaitPreviewVerification,
  getPreviewVerificationSnapshot,
  markPreviewPending,
  reportPreviewError,
  reportPreviewRunning,
  resetPreviewVerification,
} from '@/services/builder/previewVerification';
import { transactionVerdictLine } from '@/services/builder/builderTransactionState';

describe('preview verification (P0.4)', () => {
  beforeEach(() => resetPreviewVerification());

  it('verifies only once the preview reports a running runtime', async () => {
    markPreviewPending();
    expect(getPreviewVerificationSnapshot().state).toBe('pending');
    const pending = awaitPreviewVerification({ timeoutMs: 1000 });
    reportPreviewRunning();
    await expect(pending).resolves.toEqual({ verified: true });
  });

  it('refuses to verify when the preview reports a fatal error', async () => {
    markPreviewPending();
    const pending = awaitPreviewVerification({ timeoutMs: 1000 });
    reportPreviewError('SyntaxError: Unexpected token (Hero.tsx:12)');
    const result = await pending;
    expect(result.verified).toBe(false);
    expect(result.reason).toContain('SyntaxError');
  });

  it('holds rather than applies when the preview never confirms', async () => {
    vi.useFakeTimers();
    markPreviewPending();
    const pending = awaitPreviewVerification({ timeoutMs: 50 });
    await vi.advanceTimersByTimeAsync(60);
    const result = await pending;
    vi.useRealTimers();
    expect(result.verified).toBe(false);
    expect(transactionVerdictLine('held-for-review', result.reason)).toContain('not applied');
  });

  it('answers immediately from an already-observed terminal state', async () => {
    reportPreviewRunning();
    await expect(awaitPreviewVerification({ timeoutMs: 5 })).resolves.toEqual({ verified: true });
    reportPreviewError('boom');
    await expect(awaitPreviewVerification({ timeoutMs: 5 })).resolves.toEqual({
      verified: false,
      reason: 'boom',
    });
  });
});
