import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { onPipelineCommit, type CommitResult } from '@/platform/core';
import { runWizardStage4b } from '@/services/wizardStage4bRuntime';
import type { WizardSelections } from '@/types/playground';

const selections = {
  businessName: 'Northstar Dental',
  businessModel: 'service',
  industryOverlay: 'dental',
  systemType: 'appointment_booking',
  primaryGoal: 'book_appointments',
  secondaryGoals: [],
  needsBooking: true,
  sellsProducts: false,
  wantsLeadCapture: true,
  themePresetId: 'clean-medical',
  themeTokens: {} as WizardSelections['themeTokens'],
  requestedPages: ['home', 'services', 'contact'],
} as unknown as WizardSelections;

function fakeCommitResult(): CommitResult {
  return {
    source: 'wizard-launch',
    committedAt: '2026-08-13T00:00:00.000Z',
  } as CommitResult;
}

describe('Wizard Stage 4b runtime', () => {
  it('bootstraps the worker from the narrow worker-safe pipeline module', () => {
    const workerSource = readFileSync(
      resolve(process.cwd(), 'src/workers/wizardStage4b.worker.ts'),
      'utf8',
    );

    expect(workerSource).toContain("from '@/platform/core/commitToPipeline'");
    expect(workerSource).not.toContain("from '@/platform/core'");
    expect(workerSource).not.toMatch(/\b(?:window|document|localStorage)\b/);
  });

  it('runs compilation in a worker and republishes the canonical commit on the main bus', async () => {
    const result = fakeCommitResult();
    const terminate = vi.fn();
    const seen: string[] = [];
    const off = onPipelineCommit((commit) => seen.push(commit.source));
    let clock = 100;

    const worker = {
      onmessage: null as ((event: MessageEvent) => void) | null,
      onerror: null as ((event: ErrorEvent) => void) | null,
      postMessage: vi.fn((request: { requestId: string }) => {
        clock = 125;
        queueMicrotask(() => worker.onmessage?.({
          data: { requestId: request.requestId, ok: true, result },
        } as MessageEvent));
      }),
      terminate,
    };

    try {
      const stage4b = await runWizardStage4b({
        selections,
        workerFactory: () => worker,
        now: () => clock,
      });

      expect(stage4b).toMatchObject({
        pipelineResult: result,
        execution: 'worker',
        durationMs: 25,
      });
      expect(terminate).toHaveBeenCalledOnce();
      expect(seen).toEqual(['wizard-launch']);
    } finally {
      off();
    }
  });

  it('surfaces compiler contract failures without retrying on the main thread', async () => {
    const worker = {
      onmessage: null as ((event: MessageEvent) => void) | null,
      onerror: null as ((event: ErrorEvent) => void) | null,
      postMessage: vi.fn((request: { requestId: string }) => {
        queueMicrotask(() => worker.onmessage?.({
          data: {
            requestId: request.requestId,
            ok: false,
            error: { name: 'Error', message: 'Stage 4b theme contract failed' },
          },
        } as MessageEvent));
      }),
      terminate: vi.fn(),
    };

    await expect(runWizardStage4b({
      selections,
      workerFactory: () => worker,
    })).rejects.toThrow('Stage 4b theme contract failed');
  });

  it('preserves first-attempt launch when the browser blocks worker startup', async () => {
    const result = fakeCommitResult();
    const fallbackCommit = vi.fn(() => result);
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

    const stage4b = await runWizardStage4b({
      selections,
      workerFactory: () => worker,
      fallbackCommit,
    });

    expect(stage4b.execution).toBe('main-thread-fallback');
    expect(stage4b.pipelineResult).toBe(result);
    expect(stage4b.fallback).toEqual({
      kind: 'execution',
      reason: 'worker-src blocked by policy',
      filename: undefined,
      line: undefined,
      column: undefined,
    });
    expect(fallbackCommit).toHaveBeenCalledOnce();
  });

  it('preserves worker execution location when compatibility fallback is required', async () => {
    const result = fakeCommitResult();
    const worker = {
      onmessage: null as ((event: MessageEvent) => void) | null,
      onerror: null as ((event: ErrorEvent) => void) | null,
      postMessage: vi.fn(() => {
        queueMicrotask(() => worker.onerror?.({
          message: 'Uncaught ReferenceError: document is not defined',
          filename: 'wizardStage4b.worker.js',
          lineno: 42,
          colno: 17,
          error: new ReferenceError('document is not defined'),
          preventDefault: vi.fn(),
        } as unknown as ErrorEvent));
      }),
      terminate: vi.fn(),
    };

    const stage4b = await runWizardStage4b({
      selections,
      workerFactory: () => worker,
      fallbackCommit: () => result,
    });

    expect(stage4b.fallback).toMatchObject({
      kind: 'execution',
      reason: 'document is not defined',
      filename: 'wizardStage4b.worker.js',
      line: 42,
      column: 17,
    });
  });

  it('terminates pending compilation when the shared launch deadline aborts', async () => {
    const controller = new AbortController();
    const terminate = vi.fn();
    const worker = {
      onmessage: null as ((event: MessageEvent) => void) | null,
      onerror: null as ((event: ErrorEvent) => void) | null,
      postMessage: vi.fn(),
      terminate,
    };

    const pending = runWizardStage4b({
      selections,
      signal: controller.signal,
      workerFactory: () => worker,
    });
    await Promise.resolve();
    controller.abort(new Error('launch deadline reached'));

    await expect(pending).rejects.toThrow('launch deadline reached');
    expect(terminate).toHaveBeenCalledOnce();
  });
});
