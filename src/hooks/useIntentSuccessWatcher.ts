import { useEffect, useCallback, useRef } from 'react';
import { onIntentSuccess, type IntentSuccessEvent } from '@/runtime/intentSuccessBus';

export interface IntentContinuationRequest {
  prompt: string;
  success: IntentSuccessEvent;
}

/**
 * Watches for intent successes and calls back with an AI-ready continuation prompt.
 * Debounces rapid successes.
 */
export function useIntentSuccessWatcher(
  onContinuationRequest: (request: IntentContinuationRequest) => void,
  enabled = true
) {
  const lastSuccessRef = useRef<number>(0);
  const DEBOUNCE_MS = 2000; // Don't spam the AI

  const handleSuccess = useCallback(
    (success: IntentSuccessEvent) => {
      const now = Date.now();
      if (now - lastSuccessRef.current < DEBOUNCE_MS) return;
      lastSuccessRef.current = now;

      const prompt = buildContinuationPrompt(success);
      onContinuationRequest({ prompt, success });
    },
    [onContinuationRequest]
  );

  useEffect(() => {
    if (!enabled) return;
    return onIntentSuccess(handleSuccess);
  }, [enabled, handleSuccess]);
}

function buildContinuationPrompt(s: IntentSuccessEvent): string {
  const lines = [
    `✅ **Intent Applied Successfully!**`,
    ``,
    `The user just completed: **${s.actionLabel || s.intent}**`,
    ``,
    `Click a suggestion below to continue iterating, or describe your next change:`,
  ];

  return lines.join('\n');
}

export type { IntentSuccessEvent };
