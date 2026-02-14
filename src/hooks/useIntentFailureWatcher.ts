import { useEffect, useCallback, useRef } from 'react';
import { onIntentFailure, type IntentFailureEvent } from '@/runtime/intentFailureBus';

export interface IntentDiagnosisRequest {
  prompt: string;
  failure: IntentFailureEvent;
}

/**
 * Watches for intent failures and calls back with an AI-ready diagnosis prompt.
 * Debounces rapid failures (e.g. user mashing a broken button).
 */
export function useIntentFailureWatcher(
  onDiagnosisRequest: (request: IntentDiagnosisRequest) => void,
  enabled = true
) {
  const lastFailureRef = useRef<number>(0);
  const DEBOUNCE_MS = 3000; // Don't spam the AI

  const handleFailure = useCallback(
    (failure: IntentFailureEvent) => {
      const now = Date.now();
      if (now - lastFailureRef.current < DEBOUNCE_MS) return;
      lastFailureRef.current = now;

      const prompt = buildDiagnosisPrompt(failure);
      onDiagnosisRequest({ prompt, failure });
    },
    [onDiagnosisRequest]
  );

  useEffect(() => {
    if (!enabled) return;
    return onIntentFailure(handleFailure);
  }, [enabled, handleFailure]);
}

function buildDiagnosisPrompt(f: IntentFailureEvent): string {
  const lines = [
    `🔧 **Auto-Diagnosis Request**`,
    ``,
    `An intent just failed and needs fixing:`,
    ``,
    `- **Intent:** \`${f.intent}\` → normalized to \`${f.normalizedIntent}\``,
    `- **Error:** ${f.error.code} — ${f.error.message}`,
    `- **Source:** ${f.source}`,
  ];

  if (f.userAction) {
    lines.push(`- **User action:** ${f.userAction}`);
  }

  const payloadKeys = Object.keys(f.payload || {});
  if (payloadKeys.length > 0) {
    lines.push(`- **Payload keys:** ${payloadKeys.join(', ')}`);
  }

  lines.push(
    ``,
    `Please analyze why this intent failed and apply the necessary fix — whether it's a missing handler, alias mapping, business context, or configuration issue. Auto-apply the change if possible.`
  );

  return lines.join('\n');
}
