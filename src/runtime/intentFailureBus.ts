/**
 * Intent Failure Bus
 * 
 * Emits structured failure events when intents fail execution.
 * AI systems can subscribe to these events to auto-diagnose and apply fixes.
 */

export interface IntentFailureEvent {
  intent: string;
  normalizedIntent: string;
  error: { code: string; message: string };
  payload: Record<string, unknown>;
  timestamp: number;
  source: 'executor' | 'router' | 'listener';
  /** Optional context about what the user was trying to do */
  userAction?: string;
}

const EVENT_NAME = 'intent:failure' as const;

/**
 * Emit a structured intent failure event for AI consumption
 */
export function emitIntentFailure(failure: Omit<IntentFailureEvent, 'timestamp'>): void {
  const event: IntentFailureEvent = {
    ...failure,
    timestamp: Date.now(),
  };

  console.warn('[IntentFailureBus]', event.intent, '→', event.error.code, event.error.message);

  window.dispatchEvent(
    new CustomEvent<IntentFailureEvent>(EVENT_NAME, { detail: event })
  );
}

/**
 * Subscribe to intent failures. Returns an unsubscribe function.
 */
export function onIntentFailure(
  callback: (failure: IntentFailureEvent) => void
): () => void {
  const handler = (e: Event) => {
    const detail = (e as CustomEvent<IntentFailureEvent>).detail;
    if (detail) callback(detail);
  };

  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}
