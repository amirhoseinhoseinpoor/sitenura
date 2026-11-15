import Anthropic from '@anthropic-ai/sdk';
import { PlannerProvider } from '@sitenura/shared';
import {
  LlmError,
  isAbortError,
  kindFromStatus,
  type LlmErrorKind,
} from '../../domain/llm.errors.js';
import type {
  LlmCompletionRequest,
  LlmCompletionResult,
  LlmProvider,
  LlmStopReason,
} from '../../domain/llm-provider.port.js';

export type AnthropicEffort = 'low' | 'medium' | 'high' | 'xhigh' | 'max';

export interface AnthropicProviderConfig {
  model: string;
  effort: AnthropicEffort;
}

/** Streaming lets us allow long outputs without hitting HTTP timeouts. */
const DEFAULT_MAX_TOKENS = 64_000;

/**
 * Claude adapter (also the executor in Phase 4).
 *
 * - Streams and waits for the final message, so long generations don't time out.
 * - Thinking is adaptive (always on for current Opus models); depth is set with `effort`.
 * - Server-side refusal fallbacks are enabled (`fallbacks: "default"`), so a safety
 *   decline is retried on a suitable model inside the same call.
 */
export class AnthropicProvider implements LlmProvider {
  readonly id = PlannerProvider.ANTHROPIC;
  readonly model: string;

  constructor(
    private readonly client: Anthropic,
    private readonly config: AnthropicProviderConfig,
  ) {
    this.model = config.model;
  }

  async complete(request: LlmCompletionRequest): Promise<LlmCompletionResult> {
    try {
      const message = await this.client.beta.messages
        .stream(
          {
            model: this.model,
            max_tokens: request.maxTokens ?? DEFAULT_MAX_TOKENS,
            ...(request.system ? { system: request.system } : {}),
            messages: request.messages,
            output_config: { effort: this.config.effort },
            betas: ['server-side-fallback-2026-07-01'],
            fallbacks: 'default',
          },
          { signal: request.signal },
        )
        .finalMessage();

      const text = message.content
        .flatMap((block) => (block.type === 'text' ? [block.text] : []))
        .join('');

      return {
        text,
        model: message.model,
        stopReason: toStopReason(message.stop_reason),
        usage: {
          inputTokens: message.usage.input_tokens,
          outputTokens: message.usage.output_tokens,
        },
      };
    } catch (error) {
      throw this.toLlmError(error);
    }
  }

  private toLlmError(error: unknown): LlmError {
    if (error instanceof LlmError) return error;
    if (error instanceof Anthropic.APIUserAbortError || isAbortError(error)) {
      return new LlmError(this.id, 'cancelled', 'Request was cancelled', { cause: error });
    }
    if (error instanceof Anthropic.APIConnectionTimeoutError) {
      return new LlmError(this.id, 'timeout', 'Anthropic request timed out', { cause: error });
    }
    if (error instanceof Anthropic.APIConnectionError) {
      return new LlmError(this.id, 'unavailable', 'Could not reach Anthropic', { cause: error });
    }
    if (error instanceof Anthropic.APIError) {
      // 529 = overloaded; kindFromStatus already treats every 5xx as unavailable.
      const kind: LlmErrorKind = kindFromStatus(error.status);
      return new LlmError(this.id, kind, `Anthropic API error: ${error.message}`, {
        cause: error,
        status: error.status,
      });
    }
    return new LlmError(this.id, 'unknown', 'Unexpected Anthropic error', { cause: error });
  }
}

function toStopReason(reason: string | null): LlmStopReason {
  if (reason === 'refusal') return 'refusal';
  if (reason === 'max_tokens' || reason === 'model_context_window_exceeded') return 'max_tokens';
  return 'complete';
}
