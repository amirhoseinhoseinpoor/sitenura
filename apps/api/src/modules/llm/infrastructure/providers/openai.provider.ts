import OpenAI from 'openai';
import { PlannerProvider } from '@sitenura/shared';
import { LlmError, isAbortError, kindFromStatus } from '../../domain/llm.errors.js';
import type {
  LlmCompletionRequest,
  LlmCompletionResult,
  LlmProvider,
  LlmStopReason,
} from '../../domain/llm-provider.port.js';

export interface OpenAiProviderConfig {
  model: string;
}

const DEFAULT_MAX_TOKENS = 32_000;

/** ChatGPT adapter built on the OpenAI Responses API. */
export class OpenAiProvider implements LlmProvider {
  readonly id = PlannerProvider.OPENAI;
  readonly model: string;

  constructor(
    private readonly client: OpenAI,
    config: OpenAiProviderConfig,
  ) {
    this.model = config.model;
  }

  async complete(request: LlmCompletionRequest): Promise<LlmCompletionResult> {
    try {
      const response = await this.client.responses.create(
        {
          model: this.model,
          ...(request.system ? { instructions: request.system } : {}),
          input: request.messages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
          max_output_tokens: request.maxTokens ?? DEFAULT_MAX_TOKENS,
        },
        { signal: request.signal },
      );

      const refused = response.output.some(
        (item) => item.type === 'message' && item.content.some((part) => part.type === 'refusal'),
      );

      let stopReason: LlmStopReason = 'complete';
      if (refused || response.incomplete_details?.reason === 'content_filter') {
        stopReason = 'refusal';
      } else if (response.incomplete_details?.reason === 'max_output_tokens') {
        stopReason = 'max_tokens';
      }

      return {
        text: response.output_text,
        model: response.model,
        stopReason,
        usage: response.usage
          ? {
              inputTokens: response.usage.input_tokens,
              outputTokens: response.usage.output_tokens,
            }
          : undefined,
      };
    } catch (error) {
      throw this.toLlmError(error);
    }
  }

  private toLlmError(error: unknown): LlmError {
    if (error instanceof LlmError) return error;
    if (error instanceof OpenAI.APIUserAbortError || isAbortError(error)) {
      return new LlmError(this.id, 'cancelled', 'Request was cancelled', { cause: error });
    }
    if (error instanceof OpenAI.APIConnectionTimeoutError) {
      return new LlmError(this.id, 'timeout', 'OpenAI request timed out', { cause: error });
    }
    if (error instanceof OpenAI.APIConnectionError) {
      return new LlmError(this.id, 'unavailable', 'Could not reach OpenAI', { cause: error });
    }
    if (error instanceof OpenAI.APIError) {
      return new LlmError(
        this.id,
        kindFromStatus(error.status),
        `OpenAI API error: ${error.message}`,
        {
          cause: error,
          status: error.status,
        },
      );
    }
    return new LlmError(this.id, 'unknown', 'Unexpected OpenAI error', { cause: error });
  }
}
