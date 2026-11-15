import { ApiError, FinishReason, type GoogleGenAI } from '@google/genai';
import { PlannerProvider } from '@sitenura/shared';
import { LlmError, isAbortError, kindFromStatus } from '../../domain/llm.errors.js';
import type {
  LlmCompletionRequest,
  LlmCompletionResult,
  LlmProvider,
  LlmStopReason,
} from '../../domain/llm-provider.port.js';

export interface GeminiProviderConfig {
  model: string;
}

const DEFAULT_MAX_TOKENS = 32_000;

const REFUSAL_REASONS: ReadonlySet<string> = new Set([
  FinishReason.SAFETY,
  FinishReason.PROHIBITED_CONTENT,
  FinishReason.BLOCKLIST,
  FinishReason.SPII,
  FinishReason.RECITATION,
]);

/** Gemini adapter built on the Google Gen AI SDK. */
export class GeminiProvider implements LlmProvider {
  readonly id = PlannerProvider.GEMINI;
  readonly model: string;

  constructor(
    private readonly client: GoogleGenAI,
    config: GeminiProviderConfig,
  ) {
    this.model = config.model;
  }

  async complete(request: LlmCompletionRequest): Promise<LlmCompletionResult> {
    try {
      const response = await this.client.models.generateContent({
        model: this.model,
        contents: request.messages.map((message) => ({
          // Gemini calls the assistant role "model".
          role: message.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: message.content }],
        })),
        config: {
          ...(request.system ? { systemInstruction: request.system } : {}),
          maxOutputTokens: request.maxTokens ?? DEFAULT_MAX_TOKENS,
          abortSignal: request.signal,
        },
      });

      const finishReason = response.candidates?.[0]?.finishReason;
      let stopReason: LlmStopReason = 'complete';
      if (
        response.promptFeedback?.blockReason ||
        (finishReason && REFUSAL_REASONS.has(finishReason))
      ) {
        stopReason = 'refusal';
      } else if (finishReason === FinishReason.MAX_TOKENS) {
        stopReason = 'max_tokens';
      }

      const usage = response.usageMetadata;
      return {
        text: response.text ?? '',
        model: response.modelVersion ?? this.model,
        stopReason,
        usage: usage
          ? {
              inputTokens: usage.promptTokenCount ?? 0,
              outputTokens: usage.candidatesTokenCount ?? 0,
            }
          : undefined,
      };
    } catch (error) {
      throw this.toLlmError(error);
    }
  }

  private toLlmError(error: unknown): LlmError {
    if (error instanceof LlmError) return error;
    if (isAbortError(error)) {
      return new LlmError(this.id, 'cancelled', 'Request was cancelled', { cause: error });
    }
    if (error instanceof ApiError) {
      return new LlmError(
        this.id,
        kindFromStatus(error.status),
        `Gemini API error: ${error.message}`,
        {
          cause: error,
          status: error.status,
        },
      );
    }
    // The SDK uses fetch; network failures surface as a TypeError.
    if (error instanceof TypeError) {
      return new LlmError(this.id, 'unavailable', 'Could not reach Gemini', { cause: error });
    }
    return new LlmError(this.id, 'unknown', 'Unexpected Gemini error', { cause: error });
  }
}
