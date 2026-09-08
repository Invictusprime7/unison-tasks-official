import { describe, it, expect } from 'vitest';
import {
  createLaunchRun,
  classifyLaunchError,
  createLaunchFailureReport,
  isLaunchFatalError,
  publishLaunchDegradations,
  consumeLaunchDegradations,
} from '@/services/launch/launchRun';

describe('launchRun', () => {
  it('degrades a failing non-authorship stage and keeps the journey going', async () => {
    const run = createLaunchRun();
    const value = await run.stage('commit', async () => {
      throw new Error('429 rate limited');
    }, { fallback: () => 'retry-later', degradeCode: 'commit.rate_limited', degradeMessage: 'Save deferred' });

    expect(value).toBe('retry-later');
    const snap = run.snapshot();
    expect(snap.degradations).toHaveLength(1);
    expect(snap.degradations[0].code).toBe('commit.rate_limited');
    expect(snap.stages.find((s) => s.name === 'commit')?.status).toBe('degraded');
    expect(snap.fatal).toBeNull();
  });

  it('never degrades the deterministic seed stage, even with a fallback', async () => {
    const snapshots: ReturnType<typeof createLaunchRun>['snapshot'][] = [];
    const run = createLaunchRun({ onChange: (snapshot) => snapshots.push(() => snapshot) });
    let thrown: unknown;
    try {
      await run.stage('seed', async () => {
        throw new Error('429 rate limited');
      }, { fallback: () => 'seed-files' });
    } catch (error) {
      thrown = error;
    }

    const snap = run.snapshot();
    expect(isLaunchFatalError(thrown)).toBe(true);
    expect(thrown).toMatchObject({ stage: 'seed', code: 'seed.failed' });
    expect((thrown as { originalError: Error }).originalError.stack).toContain('launchRun.test.ts');
    expect(snap.degradations).toHaveLength(0);
    expect(snap.stages.find((s) => s.name === 'seed')?.status).toBe('failed');
    expect(snap.fatal).toMatch(/429 rate limited/);
    expect(snapshots.map((read) => read().stages.find((s) => s.name === 'seed')?.status))
      .toEqual(expect.arrayContaining(['active', 'failed']));

    const report = createLaunchFailureReport(thrown, snap);
    expect(report).toMatchObject({ stage: 'seed', code: 'seed.failed', errorName: 'Error' });
    expect(report.stack).toContain('launchRun.test.ts');
  });

  it('never degrades the deterministic enrichment stage', async () => {
    const run = createLaunchRun();
    await expect(run.stage('enrich', async () => {
      throw new Error('deterministic design finalization failed');
    }, {
      fallback: () => 'seed-files',
    })).rejects.toSatisfy((error: unknown) => isLaunchFatalError(error));

    expect(run.snapshot().stages.find((stage) => stage.name === 'enrich')?.status).toBe('failed');
    expect(run.snapshot().degradations).toHaveLength(0);
  });

  it('redacts secrets from persisted diagnostic fields', () => {
    const cause = Object.assign(new Error('Request failed token=top-secret'), {
      details: { authorization: 'Bearer private-value', blockedFiles: ['/src/App.tsx'] },
    });
    const report = createLaunchFailureReport(cause, null);

    expect(report.message).not.toContain('top-secret');
    expect(report.details).toEqual({
      authorization: '[REDACTED]',
      blockedFiles: ['/src/App.tsx'],
    });
    expect(report.location).not.toContain('?');
  });

  it('degrades a stalled non-authorship stage via its own watchdog', async () => {
    const run = createLaunchRun();
    const value = await run.stage('commit', () => new Promise(() => undefined), {
      timeoutMs: 20,
      fallback: () => 'retry-later',
    });
    expect(value).toBe('retry-later');
    expect(run.snapshot().degradations[0].stage).toBe('commit');
  });

  it('treats session loss as fatal and everything else as degraded', async () => {
    expect(classifyLaunchError(new Error('Invalid or expired token'))).toBe('fatal');
    expect(classifyLaunchError(new Error('Edge function returned 429'))).toBe('degraded');
    expect(classifyLaunchError(new Error('Failed to send a request to the Edge Function'))).toBe('degraded');

    const run = createLaunchRun();
    await expect(
      run.stage('commit', async () => {
        throw new Error('Invalid or expired token');
      }, { fallback: () => 'never' }),
    ).rejects.toThrow(/Invalid or expired token/);
    expect(run.snapshot().fatal).toMatch(/Invalid or expired token/);
  });

  it('hands degradations to the builder exactly once', () => {
    publishLaunchDegradations([
      { code: 'enrich.failed', message: 'AI skipped', stage: 'enrich', at: new Date().toISOString() },
    ]);
    expect(consumeLaunchDegradations()).toHaveLength(1);
    expect(consumeLaunchDegradations()).toHaveLength(0);
  });
});
