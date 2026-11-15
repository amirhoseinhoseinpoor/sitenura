import type { PlannerProvider } from '@sitenura/shared';

/**
 * Provider-neutral failure categories. Adapters translate each SDK's typed
 * errors into these so the application layer can decide on retries without
 * knowing which provider it is talking to.
 */
export type LlmErrorKind =
  | 'auth' // bad or missing API key, no permission
  | 'rate_limit' // 429, quota exhausted
  | 'timeout' // our deadline or the provider's
  | 'unavailable' // 5xx, overloaded, network failure
  | 'bad_request' // invalid request, model not found, context too long
  | 'cancelled' // caller aborted
  | 'unknown';

const RETRYABLE_KINDS: ReadonlySet<LlmErrorKind> = new Set([
  'rate_limit',
  'timeout',
  'unavailable',
]);

export class LlmError extends Error {
  readonly retryable: boolean;
  /** HTTP status from the provider, when there was one. */
  readonly status?: number;

  constructor(
    readonly provider: PlannerProvider,
    readonly kind: LlmErrorKind,
    message: string,
    options?: { cause?: unknown; status?: number },
  ) {
    super(readableMessage(message), { cause: options?.cause });
    this.name = 'LlmError';
    this.status = options?.status;
    this.retryable = RETRYABLE_KINDS.has(kind);
  }
}

const MAX_MESSAGE_LENGTH = 300;

/**
 * Provider errors sometimes embed a whole HTML error page. Strip tags, collapse
 * whitespace and cap the length so logs and the usage table stay readable.
 * The original error stays available as `cause`.
 */
export function readableMessage(message: string): string {
  const text = message
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    // JSON-escaped newlines ("\n" as two characters) from embedded payloads.
    .replace(/\\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > MAX_MESSAGE_LENGTH ? `${text.slice(0, MAX_MESSAGE_LENGTH - 1)}…` : text;
}

/** Thrown when a caller asks for a provider whose API key is not configured. */
export class LlmProviderNotConfiguredError extends Error {
  constructor(readonly provider: PlannerProvider) {
    super(`LLM provider ${provider} is not configured. Set its API key on the server.`);
    this.name = 'LlmProviderNotConfiguredError';
  }
}

/** Maps a plain HTTP status to an error kind. Shared by adapters as a fallback. */
export function kindFromStatus(status: number | undefined): LlmErrorKind {
  if (status === undefined) return 'unavailable';
  if (status === 401 || status === 403) return 'auth';
  if (status === 408) return 'timeout';
  if (status === 429) return 'rate_limit';
  if (status >= 500) return 'unavailable';
  if (status >= 400) return 'bad_request';
  return 'unknown';
}

/** True for errors raised because an AbortSignal fired. */
export function isAbortError(error: unknown): boolean {
  return error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError');
}
