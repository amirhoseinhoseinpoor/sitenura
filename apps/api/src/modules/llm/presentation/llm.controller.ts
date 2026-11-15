import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { LlmProviderInfo } from '@sitenura/shared';
import { LlmRegistry } from '../application/llm-registry.service.js';

@ApiTags('llm')
@Controller('llm')
export class LlmController {
  constructor(private readonly registry: LlmRegistry) {}

  /** Which AI models can plan a website on this server. Never exposes keys. */
  @Get('providers')
  listProviders(): LlmProviderInfo[] {
    return this.registry.list();
  }
}
