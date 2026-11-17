export interface RetryOptions {
  /** Retries after the first attempt (0 = try once). */
  maxRetries: number;
  /** Delay before the first retry; doubles each time. */
  baseDelayMs: number;
  maxDelayMs: number;
  shouldRetry: (error: unknown) => boolean;
  /** Called before each retry, e.g. for logging. */
  onRetry?: (error: unknown, attempt: number, delayMs: number) => void;
  /** Injected for tests. */
  sleep?: (ms: number) => Promise<void>;
  random?: () => number;
}

export interface RetryOutcome<T> {
  value: T;
  attempts: number;
}

export class RetryExhaustedError extends Error {
  constructor(
    readonly lastError: unknown,
    readonly attempts: number,
  ) {
    super(`Failed after ${attempts} attempt(s)`, { cause: lastError });
    this.name = 'RetryExhaustedError';
  }
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Runs `operation`, retrying transient failures with exponential backoff and
 * full jitter. Non-retryable errors are rethrown immediately (wrapped so the
 * caller still learns how many attempts were made).
 */
export async function withRetry<T>(
  operation: (attempt: number) => Promise<T>,
  options: RetryOptions,
): Promise<RetryOutcome<T>> {
  const sleep = options.sleep ?? defaultSleep;
  const random = options.random ?? Math.random;

  for (let attempt = 1; ; attempt++) {
    try {
      return { value: await operation(attempt), attempts: attempt };
    } catch (error) {
      const canRetry = attempt <= options.maxRetries && options.shouldRetry(error);
      if (!canRetry) throw new RetryExhaustedError(error, attempt);

      const ceiling = Math.min(options.maxDelayMs, options.baseDelayMs * 2 ** (attempt - 1));
      const delayMs = Math.round(random() * ceiling);
      options.onRetry?.(error, attempt, delayMs);
      await sleep(delayMs);
    }
  }
}
