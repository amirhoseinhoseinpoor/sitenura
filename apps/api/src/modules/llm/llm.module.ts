import { Module } from '@nestjs/common';
import { AppConfigService } from '../../config/app-config.service.js';
import { LlmRegistry } from './application/llm-registry.service.js';
import { LLM_POLICY, LlmService, type LlmPolicy } from './application/llm.service.js';
import { LlmCallRepository } from './domain/llm-call.repository.js';
import { LLM_PROVIDERS } from './domain/llm-provider.port.js';
import {
  LLM_MODEL_DEFAULTS,
  createLlmProviders,
  modelDefaultsFrom,
} from './infrastructure/llm-providers.factory.js';
import { PrismaLlmCallRepository } from './infrastructure/prisma-llm-call.repository.js';
import { LlmController } from './presentation/llm.controller.js';

@Module({
  controllers: [LlmController],
  providers: [
    { provide: LLM_PROVIDERS, inject: [AppConfigService], useFactory: createLlmProviders },
    { provide: LLM_MODEL_DEFAULTS, inject: [AppConfigService], useFactory: modelDefaultsFrom },
    {
      provide: LLM_POLICY,
      inject: [AppConfigService],
      useFactory: (config: AppConfigService): LlmPolicy => ({
        timeoutMs: config.get('LLM_TIMEOUT_MS'),
        maxRetries: config.get('LLM_MAX_RETRIES'),
        baseDelayMs: 1_000,
        maxDelayMs: 30_000,
      }),
    },
    { provide: LlmCallRepository, useClass: PrismaLlmCallRepository },
    LlmRegistry,
    LlmService,
  ],
  exports: [LlmService, LlmRegistry],
})
export class LlmModule {}
