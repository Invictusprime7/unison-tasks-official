import { describe, expect, it, vi } from 'vitest';
import { runStrictImportContractCheck, runPrepareSandpackFilesOffThread } from '@/services/strictImportContractRuntime';

describe('strict import-contract runtime', () => {
  it('reuses a prior call\'s result for a matching (files, entryPoint, themePresetId) key without touching the worker again', async () => {
    const files = { '/App.tsx': 'export default function App(){ return null; }' };
    const preparedFiles = { '/App.tsx': 'export default function App(){ return null; }', '/index.tsx': 'shim' };
    const postMessage = vi.fn((request: { requestId: string }) => {
      queueMicrotask(() => worker.onmessage?.({
        data: { requestId: request.requestId, ok: true, files: preparedFiles },
      } as MessageEvent));
    });
    const worker = {
      onmessage: null as ((event: MessageEvent) => void) | null,
      onerror: null as ((event: ErrorEvent) => void) | null,
      postMessage,
      terminate: vi.fn(),
    };

    // First call: the launcher's strict check (worker computes and the
    // result gets cached even though this wrapper discards its own copy).
    await runStrictImportContractCheck({
      files,
      entryPoint: '/App.tsx',
      themePresetId: 'modern-cache-test',
      workerFactory: () => worker,
    });
    expect(postMessage).toHaveBeenCalledOnce();

    // Second call: Preview's compile, same content/entryPoint/themePresetId.
    // Must hit the cache — no second worker created/used.
    const secondWorkerFactory = vi.fn(() => worker);
    const result = await runPrepareSandpackFilesOffThread({
      files,
      entryPoint: '/App.tsx',
      themePresetId: 'modern-cache-test',
      workerFactory: secondWorkerFactory,
    });

    expect(secondWorkerFactory).not.toHaveBeenCalled();
    expect(postMessage).toHaveBeenCalledOnce();
    expect(result).toEqual(preparedFiles);
  });

  it('resolves when the worker reports no violations', async () => {
    const terminate = vi.fn();
    const worker = {
      onmessage: null as ((event: MessageEvent) => void) | null,
      onerror: null as ((event: ErrorEvent) => void) | null,
      postMessage: vi.fn((request: { requestId: string }) => {
        queueMicrotask(() => worker.onmessage?.({
          data: { requestId: request.requestId, ok: true },
        } as MessageEvent));
      }),
      terminate,
    };

    await expect(runStrictImportContractCheck({
      files: { '/App.tsx': 'export default function App(){ return null; }' },
      entryPoint: '/App.tsx',
      workerFactory: () => worker,
    })).resolves.toBeUndefined();
    expect(terminate).toHaveBeenCalledOnce();
  });

  it('throws the worker-reported violation instead of silently continuing', async () => {
    const worker = {
      onmessage: null as ((event: MessageEvent) => void) | null,
      onerror: null as ((event: ErrorEvent) => void) | null,
      postMessage: vi.fn((request: { requestId: string }) => {
        queueMicrotask(() => worker.onmessage?.({
          data: {
            requestId: request.requestId,
            ok: false,
            error: { name: 'Error', message: 'Home.tsx imports JSX component "MissingHero"' },
          },
        } as MessageEvent));
      }),
      terminate: vi.fn(),
    };

    await expect(runStrictImportContractCheck({
      files: { '/App.tsx': 'x' },
      workerFactory: () => worker,
    })).rejects.toThrow('MissingHero');
  });

  it('falls back to the main thread (and still enforces the check) when the worker cannot start', async () => {
    const fallbackCheck = vi.fn();
    const worker = {
      onmessage: null as ((event: MessageEvent) => void) | null,
      onerror: null as ((event: ErrorEvent) => void) | null,
      postMessage: vi.fn(() => {
        queueMicrotask(() => worker.onerror?.({
          message: 'worker-src blocked by policy',
          preventDefault: vi.fn(),
        } as unknown as ErrorEvent));
      }),
      terminate: vi.fn(),
    };

    await runStrictImportContractCheck({
      files: { '/App.tsx': 'x' },
      entryPoint: '/App.tsx',
      themePresetId: 'modern',
      workerFactory: () => worker,
      fallbackCheck,
    });

    expect(fallbackCheck).toHaveBeenCalledWith({ '/App.tsx': 'x' }, '/App.tsx', 'modern');
  });

  it('falls back after a worker starts but never reaches its first checkpoint', async () => {
    vi.useFakeTimers();
    const worker = {
      onmessage: null as ((event: MessageEvent) => void) | null,
      onerror: null as ((event: ErrorEvent) => void) | null,
      postMessage: vi.fn(), terminate: vi.fn(),
    };
    const fallbackCompute = vi.fn(() => ({ '/App.tsx': 'compiled after startup stall' }));
    const pending = runPrepareSandpackFilesOffThread({
      files: { '/App.tsx': 'worker-startup-stall-test' },
      workerFactory: () => worker,
      fallbackCompute,
    });
    await vi.advanceTimersByTimeAsync(10_000);
    await expect(pending).resolves.toEqual({ '/App.tsx': 'compiled after startup stall' });
    expect(fallbackCompute).toHaveBeenCalledOnce();
    expect(worker.terminate).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });

  it('does not cache uncompiled source returned by a side-effect-only strict-check fallback', async () => {
    const files = { '/src/App.tsx': 'strict-fallback-cache-test' };
    // Simulate a worker bootstrap failure using its supported error channel.
    const failed = {
      onmessage: null as ((event: MessageEvent) => void) | null,
      onerror: null as ((event: ErrorEvent) => void) | null,
      postMessage: vi.fn(() => queueMicrotask(() => failed.onerror?.({ message: 'CSP blocked worker', preventDefault: vi.fn() } as unknown as ErrorEvent))),
      terminate: vi.fn(),
    };
    await runStrictImportContractCheck({ files, workerFactory: () => failed, fallbackCheck: vi.fn() });
    const prepared = { '/App.tsx': 'compiled source', '/index.tsx': 'controlled entry' };
    const worker = {
      onmessage: null as ((event: MessageEvent) => void) | null,
      onerror: null as ((event: ErrorEvent) => void) | null,
      postMessage: vi.fn((request: { requestId: string }) => queueMicrotask(() => worker.onmessage?.({ data: { requestId: request.requestId, ok: true, files: prepared } } as MessageEvent))),
      terminate: vi.fn(),
    };
    const factory = vi.fn(() => worker);
    await expect(runPrepareSandpackFilesOffThread({ files, workerFactory: factory })).resolves.toEqual(prepared);
    expect(factory).toHaveBeenCalledOnce();
  });

  it('shares the compiled artifact from the default strict fallback with the preview', async () => {
    const files = { '/src/App.tsx': 'export default function App(){ return <main>Default fallback projection</main>; }' };
    const worker = {
      onmessage: null as ((event: MessageEvent) => void) | null,
      onerror: null as ((event: ErrorEvent) => void) | null,
      postMessage: vi.fn(() => queueMicrotask(() => worker.onerror?.({ message: 'CSP blocked worker', preventDefault: vi.fn() } as unknown as ErrorEvent))),
      terminate: vi.fn(),
    };
    await runStrictImportContractCheck({ files, workerFactory: () => worker });
    const nextFactory = vi.fn(() => worker);
    const result = await runPrepareSandpackFilesOffThread({ files, workerFactory: nextFactory });
    expect(nextFactory).not.toHaveBeenCalled();
    expect(result['/App.tsx']).toContain('Default fallback projection');
    expect(result['/index.tsx']).toContain('UNISON_PREVIEW_RENDER_READY');
    expect(result['/src/App.tsx']).toBeUndefined();
  });

  it('terminates the worker and rejects when the caller aborts before it responds', async () => {
    const controller = new AbortController();
    const terminate = vi.fn();
    const worker = {
      onmessage: null as ((event: MessageEvent) => void) | null,
      onerror: null as ((event: ErrorEvent) => void) | null,
      postMessage: vi.fn(),
      terminate,
    };

    const pending = runStrictImportContractCheck({
      files: { '/App.tsx': 'x' },
      signal: controller.signal,
      workerFactory: () => worker,
    });
    await Promise.resolve();
    controller.abort(new Error('stage timed out'));

    await expect(pending).rejects.toThrow('stage timed out');
    // This was the last subscriber. The old implementation left this worker
    // running until its watchdog, competing with every subsequent retry.
    expect(terminate).toHaveBeenCalledOnce();
  });

  it('lets one caller cancel without rejecting another caller sharing the same computation', async () => {
    const controller = new AbortController();
    const preparedFiles = { '/App.tsx': 'prepared' };
    let requestId = '';
    const worker = {
      onmessage: null as ((event: MessageEvent) => void) | null,
      onerror: null as ((event: ErrorEvent) => void) | null,
      postMessage: vi.fn((request: { requestId: string }) => { requestId = request.requestId; }),
      terminate: vi.fn(),
    };
    const files = { '/App.tsx': 'shared-abort-test' };

    const cancelled = runPrepareSandpackFilesOffThread({
      files,
      signal: controller.signal,
      workerFactory: () => worker,
    });
    const surviving = runPrepareSandpackFilesOffThread({
      files,
      workerFactory: () => worker,
    });
    controller.abort(new Error('launcher unmounted'));
    worker.onmessage?.({
      data: { requestId, ok: true, files: preparedFiles },
    } as MessageEvent);

    await expect(cancelled).rejects.toThrow('launcher unmounted');
    await expect(surviving).resolves.toEqual(preparedFiles);
    expect(worker.terminate).toHaveBeenCalledOnce();
  });

  it('evicts a cancelled job before retrying and preserves the new job when the old one settles', async () => {
    const controller = new AbortController();
    const makeWorker = () => ({
      onmessage: null as ((event: MessageEvent) => void) | null,
      onerror: null as ((event: ErrorEvent) => void) | null,
      postMessage: vi.fn(), terminate: vi.fn(),
    });
    const abandoned = makeWorker();
    const replacement = makeWorker();
    const files = { '/App.tsx': 'cancel-and-retry-worker' };
    const pending = runPrepareSandpackFilesOffThread({ files, signal: controller.signal, workerFactory: () => abandoned });
    controller.abort(new Error('user changed site'));
    await expect(pending).rejects.toThrow('user changed site');
    const retry = runPrepareSandpackFilesOffThread({ files, workerFactory: () => replacement });
    await Promise.resolve();
    const extraWorker = vi.fn(() => makeWorker());
    const secondSubscriber = runPrepareSandpackFilesOffThread({ files, workerFactory: extraWorker });
    expect(extraWorker).not.toHaveBeenCalled();
    const requestId = replacement.postMessage.mock.calls[0][0].requestId;
    replacement.onmessage?.({ data: { requestId, ok: true, files: { '/App.tsx': 'retry success' } } } as MessageEvent);
    await expect(retry).resolves.toEqual({ '/App.tsx': 'retry success' });
    await expect(secondSubscriber).resolves.toEqual({ '/App.tsx': 'retry success' });
    expect(abandoned.terminate).toHaveBeenCalledOnce();
  });

  it('reports the last compiler phase and file when a preview deadline cancels the worker', async () => {
    const controller = new AbortController();
    const worker = {
      onmessage: null as ((event: MessageEvent) => void) | null,
      onerror: null as ((event: ErrorEvent) => void) | null,
      postMessage: vi.fn(), terminate: vi.fn(),
    };
    const pending = runPrepareSandpackFilesOffThread({
      files: { '/App.tsx': 'phase-timeout-test' }, signal: controller.signal, workerFactory: () => worker,
    });
    const requestId = worker.postMessage.mock.calls[0][0].requestId;
    worker.onmessage?.({ data: { requestId, progress: { phase: 'preparing module', path: '/src/pages/Home.tsx' } } } as MessageEvent);
    controller.abort(new Error('Preview artifact compilation timed out after 180 seconds.'));
    await expect(pending).rejects.toThrow('Last compiler checkpoint: preparing module (/src/pages/Home.tsx)');
    expect(worker.terminate).toHaveBeenCalledOnce();
  });

  it('preserves a worker-reported pipeline stage and blocked module', async () => {
    const worker = {
      onmessage: null as ((event: MessageEvent) => void) | null,
      onerror: null as ((event: ErrorEvent) => void) | null,
      postMessage: vi.fn((request: { requestId: string }) => queueMicrotask(() => {
        worker.onmessage?.({ data: { requestId: request.requestId, ok: false, error: {
          name: 'PreviewPipelineError', message: '[prep] Missing module', stage: 'prep', summary: 'Missing module',
          blockedFiles: ['/pages/Home.tsx'],
        } } } as MessageEvent);
      })), terminate: vi.fn(),
    };
    await expect(runPrepareSandpackFilesOffThread({ files: { '/App.tsx': 'structured-error-test' }, workerFactory: () => worker }))
      .rejects.toMatchObject({ stage: 'prep', summary: 'Missing module', details: { blockedFiles: ['/pages/Home.tsx'] } });
  });
});
