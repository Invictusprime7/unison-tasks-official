/**
 * Intent Success Bus
 * 
 * Emits structured success events when intents complete successfully.
 * AI systems can subscribe to these events to auto-continue iterating.
 */

export interface IntentSuccessEvent {
  intent: string;
  payload: Record<string, unknown>;
  result: unknown;
  timestamp: number;
  source: 'pipeline' | 'overlay' | 'direct';
  /** Context about what action completed */
  actionLabel?: string;
}

const EVENT_NAME = 'intent:success' as const;

/**
 * Emit a structured intent success event for AI auto-continuation
 */
export function emitIntentSuccess(success: Omit<IntentSuccessEvent, 'timestamp'>): void {
  const event: IntentSuccessEvent = {
    ...success,
    timestamp: Date.now(),
  };

  console.log('[IntentSuccessBus]', event.intent, '→ completed', event.actionLabel || '');

  window.dispatchEvent(
    new CustomEvent<IntentSuccessEvent>(EVENT_NAME, { detail: event })
  );
}

/**
 * Subscribe to intent successes. Returns an unsubscribe function.
 */
export function onIntentSuccess(
  callback: (success: IntentSuccessEvent) => void
): () => void {
  const handler = (e: Event) => {
    const detail = (e as CustomEvent<IntentSuccessEvent>).detail;
    if (detail) callback(detail);
  };

  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}
