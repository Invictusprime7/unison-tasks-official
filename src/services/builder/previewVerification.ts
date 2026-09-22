/**
 * previewVerification — P0.4 of the canonical closure plan.
 *
 * `verified` may not mean "the commit persisted". The plan requires the
 * Preview to have loaded the committed revision without a fatal compile or
 * render error before any surface may claim the edit landed.
 *
 * This module owns exactly one thing: the observed liveness of the preview
 * runtime, reported by the single Sandpack listener in `VFSPreview`. It adds
 * no preview runtime, no writer and no store — it is a small observation
 * point the transaction layer can await.
 */

export type PreviewVerificationState = 'idle' | 'pending' | 'running' | 'error';

export interface PreviewVerificationSnapshot {
  state: PreviewVerificationState;
  error?: string;
  /** Monotonic counter — increments on every reported transition. */
  revision: number;
}

export interface PreviewVerificationResult {
  verified: boolean;
  /** Present when not verified: why the preview could not confirm the edit. */
  reason?: string;
}

type Waiter = (result: PreviewVerificationResult) => void;

const DEFAULT_TIMEOUT_MS = 20_000;

let state: PreviewVerificationState = 'idle';
let lastError: string | undefined;
let revision = 0;
const waiters = new Set<Waiter>();

function settle(result: PreviewVerificationResult): void {
  if (waiters.size === 0) return;
  const pending = [...waiters];
  waiters.clear();
  for (const waiter of pending) waiter(result);
}

/** Called by the mutation layer immediately before a commit is applied. */
export function markPreviewPending(): void {
  state = 'pending';
  lastError = undefined;
  revision += 1;
}

/** Reported by the preview runtime when it compiled and is rendering. */
export function reportPreviewRunning(): void {
  state = 'running';
  lastError = undefined;
  revision += 1;
  settle({ verified: true });
}

/** Reported by the preview runtime on a fatal compile or render error. */
export function reportPreviewError(message: string): void {
  state = 'error';
  lastError = message || 'The preview reported an error.';
  revision += 1;
  settle({ verified: false, reason: lastError });
}

export function getPreviewVerificationSnapshot(): PreviewVerificationSnapshot {
  return { state, error: lastError, revision };
}

/** Test/reset hook — never used by production callers. */
export function resetPreviewVerification(): void {
  state = 'idle';
  lastError = undefined;
  revision = 0;
  waiters.clear();
}

/**
 * Await the preview verdict for the change that was just committed.
 *
 * - preview already running        → verified
 * - preview already in fatal error → not verified, with the preview's reason
 * - nothing observed in time       → not verified ("held", never "applied")
 */
export function awaitPreviewVerification(
  options: { timeoutMs?: number } = {},
): Promise<PreviewVerificationResult> {
  if (state === 'running') return Promise.resolve({ verified: true });
  if (state === 'error') {
    return Promise.resolve({ verified: false, reason: lastError ?? 'The preview reported an error.' });
  }

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  return new Promise<PreviewVerificationResult>((resolve) => {
    let done = false;
    const waiter: Waiter = (result) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      resolve(result);
    };
    const timer = setTimeout(() => {
      if (done) return;
      done = true;
      waiters.delete(waiter);
      resolve({
        verified: false,
        reason: 'The preview did not confirm the change in time.',
      });
    }, timeoutMs);
    waiters.add(waiter);
  });
}
