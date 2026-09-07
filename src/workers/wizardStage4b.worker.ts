import type {
  WizardStage4bWorkerRequest,
  WizardStage4bWorkerResponse,
} from '@/services/wizardStage4bRuntime';

interface WizardStage4bWorkerScope {
  onmessage: ((event: MessageEvent<WizardStage4bWorkerRequest>) => void) | null;
  postMessage(message: WizardStage4bWorkerResponse): void;
}

const workerScope = self as unknown as WizardStage4bWorkerScope;

/**
 * Vite's React SWC transform injects the dev-only React Refresh runtime into
 * modules reachable from this worker. That runtime expects `window` while a
 * real Worker only exposes `self`, so static imports can terminate the worker
 * before `onmessage` is installed. Give module evaluation a temporary alias,
 * load the narrow compiler entry directly, then restore Worker semantics
 * before any canonical compilation runs.
 */
const workerGlobal = globalThis as typeof globalThis & { window?: unknown };
const hadWindow = Object.prototype.hasOwnProperty.call(workerGlobal, 'window');
const previousWindow = workerGlobal.window;
if (!hadWindow) workerGlobal.window = workerGlobal;
const pipelineModule = import('@/platform/core/commitToPipeline').finally(() => {
  if (hadWindow) workerGlobal.window = previousWindow;
  else delete workerGlobal.window;
});

workerScope.onmessage = async (event) => {
  const request = event.data;
  try {
    const { commitToPipeline } = await pipelineModule;
    const result = commitToPipeline(
      {
        selections: request.selections,
        existingVfsFiles: request.existingVfsFiles,
      },
      'wizard-launch',
    );
    workerScope.postMessage({ requestId: request.requestId, ok: true, result });
  } catch (error) {
    const normalized = error instanceof Error ? error : new Error(String(error));
    workerScope.postMessage({
      requestId: request.requestId,
      ok: false,
      error: {
        name: normalized.name,
        message: normalized.message,
        stack: normalized.stack,
      },
    });
  }
};
