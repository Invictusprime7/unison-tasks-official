/**
 * Retry utility with exponential backoff and jitter.
 *
 * Retries a failing async operation up to `maxRetries` times, waiting
 * progressively longer between attempts (base * 2^attempt + random jitter).
 * Only network / transient errors are retried; 4xx client errors (except
 * 429 Too Many Requests) are not retried by default.
 */

export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3). */
  maxRetries?: number;
  /** Base delay in milliseconds before the first retry (default: 500). */
  baseDelayMs?: number;
  /** Maximum delay cap in milliseconds (default: 10_000). */
  maxDelayMs?: number;
  /**
   * Predicate that decides whether an error should trigger a retry.
   * By default, 4xx errors (other than 429) are NOT retried.
   */
  shouldRetry?: (error: unknown, attempt: number) => boolean;
  /** Called before each retry with the current attempt number (1-indexed). */
  onRetry?: (error: unknown, attempt: number) => void;
}

/**
 * Returns true for errors that are worth retrying (network / server errors).
 * Skips retry for most 4xx client errors where a retry would not help.
 */
function defaultShouldRetry(error: unknown): boolean {
  // Check for an explicit HTTP status code on the error object
  if (error !== null && typeof error === 'object') {
    const status = (error as Record<string, unknown>).status ??
                   (error as Record<string, unknown>).statusCode;
    if (typeof status === 'number') {
      // 4xx errors (except 429 rate-limit) are not worth retrying
      if (status >= 400 && status < 500 && status !== 429) return false;
      return true;
    }
  }

  // Fall back to scanning the error message for status codes
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    // Explicit non-retryable HTTP status codes in the message
    if (/\b(400|401|403|404|422)\b/.test(msg)) return false;
    // Rate-limit (429) and server errors (5xx) are retryable
  }
  return true;
}

/**
 * Computes the delay for an attempt using full-jitter exponential backoff.
 * delay = random(0, min(maxDelayMs, baseDelayMs * 2^attempt))
 */
function computeDelay(attempt: number, baseDelayMs: number, maxDelayMs: number): number {
  const exponential = baseDelayMs * Math.pow(2, attempt);
  const capped = Math.min(exponential, maxDelayMs);
  return Math.random() * capped;
}

/**
 * Executes `fn` and retries on failure according to `options`.
 *
 * @example
 * const data = await retryWithBackoff(() =>
 *   supabase.functions.invoke('my-function', { body: payload })
 * );
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelayMs = 500,
    maxDelayMs = 10_000,
    shouldRetry = defaultShouldRetry,
    onRetry,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      const isLastAttempt = attempt === maxRetries;
      if (isLastAttempt || !shouldRetry(error, attempt + 1)) {
        throw error;
      }

      const delay = computeDelay(attempt, baseDelayMs, maxDelayMs);
      onRetry?.(error, attempt + 1);
      console.warn(
        `[retryWithBackoff] Attempt ${attempt + 1}/${maxRetries} failed. Retrying in ${Math.round(delay)}ms…`,
        error
      );
      await new Promise<void>((resolve) => setTimeout(resolve, delay));
    }
  }

  // Should never reach here, but TypeScript requires it.
  throw lastError;
}
