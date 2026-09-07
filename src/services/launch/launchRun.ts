/**
 * Launch Run — the single state machine that owns the Wizard → Web Builder
 * journey.
 *
 *   selections → plan → seed → finalize → preflight → commit → handoff
 *
 * Two hard rules:
 *
 *  1. NEVER BLOCK. Every stage runs asynchronously and yields to the browser on
 *     a frame budget, and every stage carries its own watchdog so a stall
 *     degrades that stage instead of freezing the shell.
 *
 *  2. NEVER HIDE AUTHORSHIP FAILURES. Recoverable integration failures become
 *     degradations; failures in authored output retain their exact stage and
 *     cause so the Wizard can report them without substituting content.
 */

import { startLaunchTelemetry, type LaunchTelemetryEvent } from '@/services/launch/launchTelemetry';

export type LaunchStageName =
  | 'plan'
  | 'seed'
  | 'enrich'
  | 'preflight'
  | 'commit'
  | 'handoff';

export type LaunchStageStatus = 'pending' | 'active' | 'done' | 'degraded' | 'failed';

export interface LaunchDegradation {
  /** Machine-readable reason, e.g. `enrich.rate_limited`. */
  code: string;
  /** Short, user-safe sentence. Rendered as a quiet note in the builder. */
  message: string;
  stage: LaunchStageName;
  detail?: string;
  at: string;
}

export interface LaunchStageState {
  name: LaunchStageName;
  status: LaunchStageStatus;
  label: string;
  startedAt?: number;
  endedAt?: number;
}

export interface LaunchRunSnapshot {
  stages: LaunchStageState[];
  activeStage: LaunchStageName | null;
  degradations: LaunchDegradation[];
  fatal: string | null;
  cancelled: boolean;
}

export const LAUNCH_STAGE_LABELS: Record<LaunchStageName, string> = {
  plan: 'Planning your site structure',
  seed: 'Building your themed scaffold',
  enrich: 'Finalizing your page content',
  preflight: 'Checking every page compiles',
  commit: 'Saving your project',
  handoff: 'Opening the builder',
};

const DEFAULT_STAGE_TIMEOUTS: Record<LaunchStageName, number> = {
  plan: 30_000,
  seed: 60_000,
  enrich: 240_000,
  preflight: 120_000,
  commit: 60_000,
  handoff: 20_000,
};

// ── Cooperative yielding ────────────────────────────────────────────────────

let lastYieldAt = 0;

/**
 * Yield to the browser, but only pay for a real frame when the current task has
 * held the main thread longer than one frame budget. Pipeline steps call this
 * many hundreds of times, so the fast path must stay a microtask.
 */
export function yieldToHost(): Promise<void> {
  const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
  if (lastYieldAt && now - lastYieldAt < 12) return Promise.resolve();
  lastYieldAt = now;
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(() =>
        window.setTimeout(() => {
          lastYieldAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
          resolve();
        }, 0),
      );
      return;
    }
    setTimeout(resolve, 0);
  });
}

// ── Error taxonomy ──────────────────────────────────────────────────────────

export class LaunchFatalError extends Error {
  readonly isLaunchFatal = true;
  readonly stage?: LaunchStageName;
  readonly code?: string;
  readonly originalError?: unknown;

  constructor(
    message: string,
    options: { stage?: LaunchStageName; code?: string; cause?: unknown } = {},
  ) {
    super(message);
    this.name = 'LaunchFatalError';
    this.stage = options.stage;
    this.code = options.code;
    this.originalError = options.cause;
  }
}

function launchStageErrorCode(stage: LaunchStageName, error: unknown): string {
  const message = launchErrorMessage(error);
  if (/stalled after \d+s/i.test(message)) return `${stage}.timeout`;
  if (/auth|session|jwt|token|sign in/i.test(message)) return `${stage}.auth`;
  const nestedStage = typeof error === 'object' && error !== null
    ? (error as { stage?: unknown }).stage
    : null;
  return `${stage}.${typeof nestedStage === 'string' ? nestedStage : 'failed'}`;
}

function asLaunchStageError(stage: LaunchStageName, error: unknown): LaunchFatalError {
  if (isLaunchFatalError(error) && error.stage) return error;
  return new LaunchFatalError(launchErrorMessage(error), {
    stage,
    code: launchStageErrorCode(stage, error),
    cause: error,
  });
}

export function isLaunchFatalError(value: unknown): value is LaunchFatalError {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as { isLaunchFatal?: boolean }).isLaunchFatal === true
  );
}

/**
 * Only session loss is fatal — the user must sign in again, no amount of
 * degradation can produce a project without an owner.
 */
export function classifyLaunchError(error: unknown): 'fatal' | 'degraded' {
  if (isLaunchFatalError(error)) return 'fatal';
  const message = error instanceof Error ? error.message : String(error ?? '');
  if (/invalid or expired token|not authenticated|please sign in|jwt expired|auth session missing/i.test(message)) {
    return 'fatal';
  }
  return 'degraded';
}

export function launchErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  try {
    return JSON.stringify(error).slice(0, 240);
  } catch {
    return 'Unknown error';
  }
}

// ── The run ─────────────────────────────────────────────────────────────────

export interface LaunchRunOptions {
  onChange?: (snapshot: LaunchRunSnapshot) => void;
  /** Per-stage timeout overrides (ms). */
  timeouts?: Partial<Record<LaunchStageName, number>>;
}

export interface LaunchRun {
  /**
   * Run a stage with its own watchdog. If `fallback` is provided, any
   * non-fatal failure (including a stall) is recorded as a degradation and the
   * fallback value is returned so the journey continues. Without a fallback a
   * non-fatal failure still rethrows, so callers opt into degradation
   * explicitly.
   */
  stage<T>(
    name: LaunchStageName,
    work: (signal: AbortSignal) => Promise<T>,
    options?: { fallback?: () => T | Promise<T>; timeoutMs?: number; degradeCode?: string; degradeMessage?: string },
  ): Promise<T>;
  /** Record a non-fatal degradation without failing a stage. */
  degrade(stage: LaunchStageName, code: string, message: string, detail?: string): void;
  /** Mark a stage complete without wrapping work (for inline stages). */
  markStage(name: LaunchStageName, status: LaunchStageStatus): void;
  cancel(): void;
  readonly cancelled: boolean;
  readonly signal: AbortSignal;
  snapshot(): LaunchRunSnapshot;
  yieldToHost: typeof yieldToHost;
}

/**
 * Authorship stages own the page bodies (Lane B generation + the canonical
 * merge/preflight that seals them). A failure here can never be degraded away:
 * degradation would mean sealing content nobody authored. Non-authorship
 * stages (plan, commit, handoff) may still degrade with an explicit fallback.
 */
const AUTHORSHIP_STAGES: ReadonlySet<LaunchStageName> = new Set<LaunchStageName>([
  'seed',
  'enrich',
  'preflight',
]);

/**
 * M8 — canonical telemetry event for the completion of each stage. Structural
 * health is measured on this vocabulary, never on ad-hoc console output.
 */
const STAGE_TELEMETRY_EVENT: Partial<Record<LaunchStageName, LaunchTelemetryEvent>> = {
  seed: 'wizard.lane_a.compiled',
  enrich: 'wizard.lane_b.completed',
  preflight: 'wizard.preflight.accepted',
  commit: 'wizard.revision.committed',
  handoff: 'wizard.web_builder.ready',
};

export function createLaunchRun(options: LaunchRunOptions = {}): LaunchRun {
  const controller = new AbortController();
  const telemetry = startLaunchTelemetry();
  const stageOrder: LaunchStageName[] = ['plan', 'seed', 'enrich', 'preflight', 'commit', 'handoff'];
  const stages: LaunchStageState[] = stageOrder.map((name) => ({
    name,
    status: 'pending',
    label: LAUNCH_STAGE_LABELS[name],
  }));
  const degradations: LaunchDegradation[] = [];
  let activeStage: LaunchStageName | null = null;
  let fatal: string | null = null;
  let cancelled = false;

  const snapshot = (): LaunchRunSnapshot => ({
    stages: stages.map((s) => ({ ...s })),
    activeStage,
    degradations: [...degradations],
    fatal,
    cancelled,
  });

  const emit = () => options.onChange?.(snapshot());

  const setStatus = (name: LaunchStageName, status: LaunchStageStatus) => {
    const entry = stages.find((s) => s.name === name);
    if (!entry) return;
    entry.status = status;
    if (status === 'done') {
      const event = STAGE_TELEMETRY_EVENT[name];
      if (event) telemetry.emit(event);
    }
    if (status === 'active') {
      entry.startedAt = Date.now();
      activeStage = name;
    } else if (status !== 'pending') {
      entry.endedAt = Date.now();
      if (activeStage === name) activeStage = null;
    }
    emit();
  };

  const degrade = (stage: LaunchStageName, code: string, message: string, detail?: string) => {
    degradations.push({ stage, code, message, detail, at: new Date().toISOString() });
    telemetry.measure({ degradedPresentation: true });
    console.warn(`[launchRun] degraded ${stage}/${code}`, message, detail ?? '');
    emit();
  };

  const stage: LaunchRun['stage'] = async (name, work, opts = {}) => {
    setStatus(name, 'active');
    console.info(`[launchRun] started ${name}`);
    const timeoutMs = opts.timeoutMs ?? options.timeouts?.[name] ?? DEFAULT_STAGE_TIMEOUTS[name];
    let timer: ReturnType<typeof setTimeout> | undefined;
    const stageController = new AbortController();
    const abortRun = () => stageController.abort();
    controller.signal.addEventListener('abort', abortRun);

    try {
      const guard = new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          stageController.abort();
          reject(new Error(`${LAUNCH_STAGE_LABELS[name]} stalled after ${Math.round(timeoutMs / 1000)}s.`));
        }, timeoutMs);
      });
      const value = await Promise.race([work(stageController.signal), guard]);
      setStatus(name, 'done');
      console.info(`[launchRun] completed ${name}`, {
        durationMs: Date.now() - (stages.find((entry) => entry.name === name)?.startedAt ?? Date.now()),
      });
      return value as Awaited<ReturnType<typeof work>>;
    } catch (error) {
      const stageError = asLaunchStageError(name, error);
      const logFailure = () => console.error(`[launchRun] failed ${name}/${stageError.code}`, {
          name: error instanceof Error ? error.name : typeof error,
          message: launchErrorMessage(error),
          error,
        });
      if (classifyLaunchError(error) === 'fatal') {
        fatal = launchErrorMessage(error);
        setStatus(name, 'failed');
        logFailure();
        throw stageError;
      }
      if (AUTHORSHIP_STAGES.has(name)) {
        // No fallback is honoured for authorship stages, even if a caller
        // passes one — substituting a page body is not a recovery.
        const message = launchErrorMessage(error);
        fatal = message;
        setStatus(name, 'failed');
        logFailure();
        throw stageError;
      }
      if (!opts.fallback) {
        setStatus(name, 'failed');
        logFailure();
        throw stageError;
      }
      degrade(
        name,
        opts.degradeCode ?? `${name}.failed`,
        opts.degradeMessage ?? `${LAUNCH_STAGE_LABELS[name]} did not finish, so we continued with your wizard selections.`,
        launchErrorMessage(error),
      );
      const fallbackValue = await opts.fallback();
      setStatus(name, 'degraded');
      return fallbackValue;
    } finally {
      if (timer) clearTimeout(timer);
      controller.signal.removeEventListener('abort', abortRun);
    }
  };

  return {
    stage,
    degrade,
    markStage: setStatus,
    cancel() {
      cancelled = true;
      controller.abort();
      emit();
    },
    get cancelled() {
      return cancelled;
    },
    get signal() {
      return controller.signal;
    },
    snapshot,
    yieldToHost,
  };
}

/**
 * Session-storage channel used to hand degradations to the builder so it can
 * render a quiet inline note instead of the wizard firing an error toast.
 */
export const LAUNCH_DEGRADATION_STORAGE_KEY = 'unison:launch-degradations';
export const LAUNCH_FAILURE_STORAGE_KEY = 'unison:latest-launch-failure';

export interface LaunchFailureReport {
  id: string;
  occurredAt: string;
  stage: LaunchStageName | 'unknown';
  code: string;
  errorName: string;
  message: string;
  stack?: string;
  details?: unknown;
  snapshot: LaunchRunSnapshot | null;
  location?: string;
}

const SENSITIVE_DIAGNOSTIC_KEY = /authorization|cookie|credential|password|secret|token|api.?key/i;

function redactDiagnosticText(value: string): string {
  return value
    .replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, 'Bearer [REDACTED]')
    .replace(/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, '[REDACTED_JWT]')
    .replace(
      /((?:api.?key|password|secret|token)\s*[:=]\s*)["']?[^\s,"'}]+/gi,
      '$1[REDACTED]',
    );
}

function redactDiagnosticValue(value: unknown, seen = new WeakSet<object>()): unknown {
  if (typeof value === 'string') return redactDiagnosticText(value);
  if (!value || typeof value !== 'object') return value;
  if (seen.has(value)) return '[Circular]';
  seen.add(value);
  if (Array.isArray(value)) return value.map((entry) => redactDiagnosticValue(entry, seen));
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      SENSITIVE_DIAGNOSTIC_KEY.test(key) ? '[REDACTED]' : redactDiagnosticValue(entry, seen),
    ]),
  );
}

function safeErrorDetails(error: unknown): unknown {
  if (!error || typeof error !== 'object') return undefined;
  const details = (error as Record<string, unknown>).details;
  return details === undefined ? undefined : redactDiagnosticValue(details);
}

export function createLaunchFailureReport(
  error: unknown,
  snapshot: LaunchRunSnapshot | null,
): LaunchFailureReport {
  const stageError = isLaunchFatalError(error) ? error : null;
  const original = stageError?.originalError;
  const sourceError = original instanceof Error ? original : error instanceof Error ? error : null;
  const failedStage = snapshot?.stages.find((entry) => entry.status === 'failed')?.name;
  const stage = stageError?.stage ?? failedStage ?? snapshot?.activeStage ?? 'unknown';
  const details = safeErrorDetails(original ?? error);
  return {
    id: `launch_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    occurredAt: new Date().toISOString(),
    stage,
    code: stageError?.code ?? `${stage}.failed`,
    errorName: sourceError?.name ?? typeof error,
    message: redactDiagnosticText(launchErrorMessage(error)),
    ...(sourceError?.stack ? { stack: redactDiagnosticText(sourceError.stack) } : {}),
    ...(details !== undefined
      ? { details }
      : {}),
    snapshot,
    ...(typeof window !== 'undefined'
      ? { location: `${window.location.origin}${window.location.pathname}` }
      : {}),
  };
}

export function persistLaunchFailureReport(report: LaunchFailureReport): void {
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(LAUNCH_FAILURE_STORAGE_KEY, JSON.stringify(report));
    }
  } catch {
    /* storage is best-effort */
  }
}

export function publishLaunchDegradations(degradations: LaunchDegradation[]): void {
  try {
    if (typeof sessionStorage === 'undefined') return;
    if (degradations.length === 0) {
      sessionStorage.removeItem(LAUNCH_DEGRADATION_STORAGE_KEY);
      return;
    }
    sessionStorage.setItem(LAUNCH_DEGRADATION_STORAGE_KEY, JSON.stringify(degradations));
  } catch {
    /* storage is best-effort */
  }
}

export function consumeLaunchDegradations(): LaunchDegradation[] {
  try {
    if (typeof sessionStorage === 'undefined') return [];
    const raw = sessionStorage.getItem(LAUNCH_DEGRADATION_STORAGE_KEY);
    if (!raw) return [];
    sessionStorage.removeItem(LAUNCH_DEGRADATION_STORAGE_KEY);
    const parsed = JSON.parse(raw) as LaunchDegradation[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
