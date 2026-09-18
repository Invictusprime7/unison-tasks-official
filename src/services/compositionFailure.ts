export interface CompositionFailureDetails {
  status?: number;
  errorType?: string;
  fields?: string[];
  missingRoles?: string[];
  message: string;
}

/** Keep structured diagnostics, never raw responses, prompts, or credentials. */
export function describeCompositionFailure(error: unknown, data?: unknown): CompositionFailureDetails {
  const context = (error as { context?: { status?: unknown; body?: unknown } } | null)?.context;
  const status = typeof context?.status === 'number' ? context.status : undefined;
  let payload = data;
  if (!payload && typeof context?.body === 'string') {
    try { payload = JSON.parse(context.body); } catch { /* Transport error or non-JSON gateway response. */ }
  }
  const result = payload as { errorType?: unknown; fields?: unknown } | null;
  const errorType = typeof result?.errorType === 'string' && /^[a-z_]{1,80}$/.test(result.errorType) ? result.errorType : undefined;
  const fields = Array.isArray(result?.fields) ? result.fields.filter((field): field is string => typeof field === 'string' && /^[a-zA-Z0-9_.]{1,120}$/.test(field)).slice(0, 10) : undefined;
  const message = status === 404 ? 'The Wizard composition endpoint is not deployed on this backend. Refresh after deployment and retry.'
    : status === 401 || status === 403 ? 'Your session could not access the Wizard composer. Sign in again and retry.'
    : status === 400 ? `The Wizard composer rejected the launch brief${fields?.length ? ': ' + fields.join(', ') : ''}.`
    : status === 429 ? 'The AI service is rate limited. Wait briefly and retry.'
    : errorType === 'composition_catalog' ? 'AI composition did not satisfy the requested pages, original copy, or variant catalog after repair. Retry generation.'
    : errorType === 'composition_contract' ? 'AI returned an invalid composition format. Retry generation.'
    : 'The Wizard composition request failed. Please retry generation.';
  return { status, errorType, fields, message };
}
