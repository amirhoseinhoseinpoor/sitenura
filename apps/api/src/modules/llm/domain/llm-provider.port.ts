import type { PlannerProvider } from '@prompt-bridge/shared';

/**
 * Port for any LLM PromptBridge talks to. Adapters (OpenAI, Gemini, Anthropic)
 * are implemented in Phase 2. The pipeline only ever depends on this contract,
 * which keeps adding a new provider a one-file change.
 */
export interface LlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LlmCompletionRequest {
  messages: LlmMessage[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface LlmCompletionResult {
  text: string;
  model: string;
  usage?: { inputTokens: number; outputTokens: number };
}

export interface LlmProvider {
  readonly id: PlannerProvider;
  complete(request: LlmCompletionRequest): Promise<LlmCompletionResult>;
}

/** Injection token for the registry that resolves a provider by id. */
export const LLM_PROVIDERS = Symbol('LLM_PROVIDERS');
