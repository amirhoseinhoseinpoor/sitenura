import { z } from 'zod';

/** Treats an empty string (e.g. `OPENAI_API_KEY=` in .env) as "not set". */
const optionalSecret = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

/**
 * Single source of truth for runtime configuration.
 * The app refuses to boot if the environment does not match this schema.
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:3000')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
  DATABASE_URL: z.url(),

  // LLM providers. A provider is enabled only when its API key is set.
  OPENAI_API_KEY: optionalSecret,
  OPENAI_MODEL: z.string().min(1).default('gpt-6-astra'),
  GEMINI_API_KEY: optionalSecret,
  GEMINI_MODEL: z.string().min(1).default('gemini-pro-latest'),
  ANTHROPIC_API_KEY: optionalSecret,
  ANTHROPIC_MODEL: z.string().min(1).default('claude-opus-5-5'),
  ANTHROPIC_EFFORT: z.enum(['low', 'medium', 'high', 'xhigh', 'max']).default('high'),

  /** Upper bound for one LLM attempt. Long generations can take minutes. */
  LLM_TIMEOUT_MS: z.coerce.number().int().positive().default(300_000),
  /** Retries after the first attempt for transient failures (429, 5xx, network). */
  LLM_MAX_RETRIES: z.coerce.number().int().min(0).max(5).default(2),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    throw new Error(`Invalid environment configuration:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
