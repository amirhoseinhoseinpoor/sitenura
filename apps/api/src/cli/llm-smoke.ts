/**
 * Sends one tiny request to every configured LLM provider and reports the
 * result. Use it to check API keys and model names:
 *
 *   pnpm --filter @sitenura/api llm:smoke
 *
 * Each call is billed by its provider (a few tokens).
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { LlmRegistry } from '../modules/llm/application/llm-registry.service.js';
import { LlmService } from '../modules/llm/application/llm.service.js';
import { LlmError } from '../modules/llm/domain/llm.errors.js';

const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
const registry = app.get(LlmRegistry);
const llm = app.get(LlmService);

let failures = 0;
for (const provider of registry.list()) {
  if (!provider.available) {
    console.log(`- ${provider.label}: skipped (no API key)`);
    continue;
  }
  try {
    const result = await llm.complete(
      provider.id,
      {
        system: 'You are a health check. Reply with the single word OK.',
        messages: [{ role: 'user', content: 'Are you there?' }],
        maxTokens: 4_000,
      },
      { purpose: 'smoke-test' },
    );
    console.log(
      `✓ ${provider.label}: "${result.text.trim().slice(0, 40)}" ` +
        `(model ${result.model}, ${result.usage?.inputTokens ?? '?'} in / ` +
        `${result.usage?.outputTokens ?? '?'} out, stop: ${result.stopReason})`,
    );
  } catch (error) {
    failures++;
    const reason = error instanceof LlmError ? `${error.kind}: ${error.message}` : String(error);
    console.log(`✗ ${provider.label}: ${reason}`);
  }
}

await app.close();
process.exitCode = failures > 0 ? 1 : 0;
