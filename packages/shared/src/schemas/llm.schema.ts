import { z } from 'zod';
import { PlannerProvider } from '../enums.js';

/** Human-friendly names for each provider, used across the UI. */
export const PLANNER_PROVIDER_LABELS: Record<PlannerProvider, string> = {
  OPENAI: 'ChatGPT (OpenAI)',
  GEMINI: 'Gemini (Google)',
  ANTHROPIC: 'Claude (Anthropic)',
};

export const plannerProviderSchema = z.enum([
  PlannerProvider.OPENAI,
  PlannerProvider.GEMINI,
  PlannerProvider.ANTHROPIC,
]);

/** Public view of a provider. Never includes credentials. */
export const llmProviderInfoSchema = z.object({
  id: plannerProviderSchema,
  label: z.string(),
  model: z.string(),
  /** False when the server has no API key for this provider. */
  available: z.boolean(),
});
export type LlmProviderInfo = z.infer<typeof llmProviderInfoSchema>;
