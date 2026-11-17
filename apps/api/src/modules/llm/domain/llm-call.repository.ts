import type { PlannerProvider } from '@sitenura/shared';
import type { LlmErrorKind } from './llm.errors.js';

export interface LlmCallRecord {
  provider: PlannerProvider;
  model: string;
  purpose: string;
  status: 'SUCCEEDED' | 'FAILED';
  attempts: number;
  latencyMs: number;
  inputTokens?: number;
  outputTokens?: number;
  errorKind?: LlmErrorKind;
  projectId?: string;
}

/** Port: where usage records are stored. */
export abstract class LlmCallRepository {
  abstract record(call: LlmCallRecord): Promise<void>;
}
