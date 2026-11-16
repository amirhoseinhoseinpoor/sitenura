import { Inject, Injectable, Logger } from '@nestjs/common';
import type { PlannerProvider } from '@sitenura/shared';
import { LlmCallRepository } from '../domain/llm-call.repository.js';
import { LlmError } from '../domain/llm.errors.js';
import type { LlmCompletionRequest, LlmCompletionResult } from '../domain/llm-provider.port.js';
import { LlmRegistry } from './llm-registry.service.js';
import { RetryExhaustedError, withRetry } from './retry.js';

export interface LlmPolicy {
  timeoutMs: number;
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

export const LLM_POLICY = Symbol('LLM_POLICY');

export interface CompleteOptions {
  /** Why the call is made; stored with usage records ("planner", "executor", ...). */
  purpose: string;
  projectId?: string;
  /** Caller-side cancellation (e.g. the HTTP client went away). */
  signal?: AbortSignal;
  /** Overrides the per-attempt timeout from the policy (e.g. short health checks). */
  timeoutMs?: number;
}

/**
 * The one entry point the rest of the app uses to talk to any LLM. It adds,
 * uniformly across providers: per-attempt timeouts, retries with backoff for
 * transient failures, structured logging, and usage records.
 */
@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);

  constructor(
    private readonly registry: LlmRegistry,
    private readonly calls: LlmCallRepository,
    @Inject(LLM_POLICY) private readonly policy: LlmPolicy,
  ) {}

  async complete(
    providerId: PlannerProvider,
    request: Omit<LlmCompletionRequest, 'signal'>,
    options: CompleteOptions,
  ): Promise<LlmCompletionResult> {
    const provider = this.registry.get(providerId);
    const startedAt = performance.now();
    let attempts = 0;

    try {
      const outcome = await withRetry(
        async (attempt) => {
          attempts = attempt;
          const timeoutMs = options.timeoutMs ?? this.policy.timeoutMs;
          const deadline = AbortSignal.timeout(timeoutMs);
          const signals = [deadline];
          if (options.signal) signals.push(options.signal);
          try {
            return await provider.complete({ ...request, signal: AbortSignal.any(signals) });
          } catch (error) {
            // Adapters see any abort as "cancelled". If our own deadline fired
            // (not the caller), it is a timeout, which is worth retrying.
            if (deadline.aborted && !options.signal?.aborted) {
              throw new LlmError(providerId, 'timeout', `No response within ${timeoutMs} ms`, {
                cause: error,
              });
            }
            throw error;
          }
        },
        {
          maxRetries: this.policy.maxRetries,
          baseDelayMs: this.policy.baseDelayMs,
          maxDelayMs: this.policy.maxDelayMs,
          shouldRetry: (error) =>
            error instanceof LlmError && error.retryable && !options.signal?.aborted,
          onRetry: (error, attempt, delayMs) =>
            this.logger.warn(
              `${providerId} attempt ${attempt} failed (${describe(error)}); retrying in ${delayMs}ms`,
            ),
        },
      );

      const result = outcome.value;
      await this.record({
        provider: providerId,
        model: result.model,
        purpose: options.purpose,
        status: 'SUCCEEDED',
        attempts: outcome.attempts,
        latencyMs: Math.round(performance.now() - startedAt),
        inputTokens: result.usage?.inputTokens,
        outputTokens: result.usage?.outputTokens,
        projectId: options.projectId,
      });

      if (result.stopReason !== 'complete') {
        this.logger.warn(`${providerId} stopped with reason "${result.stopReason}"`);
      }
      return result;
    } catch (error) {
      const cause = error instanceof RetryExhaustedError ? error.lastError : error;
      const llmError =
        cause instanceof LlmError
          ? cause
          : new LlmError(providerId, 'unknown', 'Unexpected LLM failure', { cause });

      await this.record({
        provider: providerId,
        model: provider.model,
        purpose: options.purpose,
        status: 'FAILED',
        attempts: Math.max(attempts, 1),
        latencyMs: Math.round(performance.now() - startedAt),
        errorKind: llmError.kind,
        projectId: options.projectId,
      });
      this.logger.error(`${providerId} call failed: ${describe(llmError)}`);
      throw llmError;
    }
  }

  /** Usage logging must never break the user's request. */
  private async record(call: Parameters<LlmCallRepository['record']>[0]): Promise<void> {
    try {
      await this.calls.record(call);
    } catch (error) {
      const hint =
        errorCode(error) === 'ECONNREFUSED'
          ? ' The database is not reachable. Is it running? (pnpm db:up)'
          : '';
      this.logger.error(`Failed to record LLM usage: ${describe(error)}.${hint}`);
    }
  }
}

function describe(error: unknown): string {
  if (error instanceof LlmError) return `${error.kind}: ${error.message}`;
  if (!(error instanceof Error)) return String(error);
  // Prisma messages are multi-line and can be empty after their header;
  // the real reason is then only in `code` (e.g. ECONNREFUSED).
  const message = error.message.replace(/\s+/g, ' ').trim();
  const code = errorCode(error);
  return code ? `${message} [${code}]` : message;
}

function errorCode(error: unknown): string | undefined {
  const code = (error as { code?: unknown } | null)?.code;
  return typeof code === 'string' ? code : undefined;
}
