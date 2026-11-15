import type { PlannerProvider } from '@sitenura/shared';

/**
 * Port for any LLM Sitenura talks to (OpenAI, Gemini, Anthropic). The planner
 * and executor depend only on this contract, so adding a provider is one new
 * adapter file plus one line in the provider factory.
 */
export interface LlmMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface LlmCompletionRequest {
  /** Instructions for the model. Every provider supports a separate system prompt. */
  system?: string;
  messages: LlmMessage[];
  /** Hard cap on generated tokens. Adapters choose a generous default. */
  maxTokens?: number;
  /** Cancels the in-flight request (timeouts, client disconnects). */
  signal?: AbortSignal;
}

/**
 * Normalized reason the model stopped.
 * - complete: finished naturally
 * - max_tokens: output was cut off by the token cap
 * - refusal: the provider's safety systems declined the request
 */
export type LlmStopReason = 'complete' | 'max_tokens' | 'refusal';

export interface LlmUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface LlmCompletionResult {
  text: string;
  /** The model that actually answered (may differ from the requested one, e.g. fallbacks). */
  model: string;
  stopReason: LlmStopReason;
  usage?: LlmUsage;
}

export interface LlmProvider {
  readonly id: PlannerProvider;
  /** Default model this adapter calls. */
  readonly model: string;
  complete(request: LlmCompletionRequest): Promise<LlmCompletionResult>;
}

/** Injection token for the list of configured providers. */
export const LLM_PROVIDERS = Symbol('LLM_PROVIDERS');
