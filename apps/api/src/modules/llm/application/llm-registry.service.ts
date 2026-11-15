import { Inject, Injectable } from '@nestjs/common';
import { PLANNER_PROVIDER_LABELS, PlannerProvider, type LlmProviderInfo } from '@sitenura/shared';
import { LlmProviderNotConfiguredError } from '../domain/llm.errors.js';
import { LLM_PROVIDERS, type LlmProvider } from '../domain/llm-provider.port.js';
import {
  LLM_MODEL_DEFAULTS,
  type LlmModelDefaults,
} from '../infrastructure/llm-providers.factory.js';

/** Resolves providers by id and describes which ones are available. */
@Injectable()
export class LlmRegistry {
  private readonly providers: ReadonlyMap<PlannerProvider, LlmProvider>;

  constructor(
    @Inject(LLM_PROVIDERS) providers: LlmProvider[],
    @Inject(LLM_MODEL_DEFAULTS) private readonly modelDefaults: LlmModelDefaults,
  ) {
    this.providers = new Map(providers.map((provider) => [provider.id, provider]));
  }

  get(id: PlannerProvider): LlmProvider {
    const provider = this.providers.get(id);
    if (!provider) throw new LlmProviderNotConfiguredError(id);
    return provider;
  }

  isAvailable(id: PlannerProvider): boolean {
    return this.providers.has(id);
  }

  list(): LlmProviderInfo[] {
    return Object.values(PlannerProvider).map((id) => ({
      id,
      label: PLANNER_PROVIDER_LABELS[id],
      model: this.providers.get(id)?.model ?? this.modelDefaults[id],
      available: this.providers.has(id),
    }));
  }
}
