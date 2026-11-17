import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from '@google/genai';
import type { PlannerProvider } from '@sitenura/shared';
import OpenAI from 'openai';
import type { AppConfigService } from '../../../config/app-config.service.js';
import type { LlmProvider } from '../domain/llm-provider.port.js';
import { AnthropicProvider } from './providers/anthropic.provider.js';
import { GeminiProvider } from './providers/gemini.provider.js';
import { OpenAiProvider } from './providers/openai.provider.js';

export type LlmModelDefaults = Record<PlannerProvider, string>;
export const LLM_MODEL_DEFAULTS = Symbol('LLM_MODEL_DEFAULTS');

export function modelDefaultsFrom(config: AppConfigService): LlmModelDefaults {
  return {
    OPENAI: config.get('OPENAI_MODEL'),
    GEMINI: config.get('GEMINI_MODEL'),
    ANTHROPIC: config.get('ANTHROPIC_MODEL'),
  };
}

/**
 * Builds one adapter per provider that has an API key. SDK-level retries are
 * disabled because LlmService applies one retry policy to every provider.
 */
export function createLlmProviders(config: AppConfigService): LlmProvider[] {
  const providers: LlmProvider[] = [];

  const openAiKey = config.get('OPENAI_API_KEY');
  if (openAiKey) {
    providers.push(
      new OpenAiProvider(new OpenAI({ apiKey: openAiKey, maxRetries: 0 }), {
        model: config.get('OPENAI_MODEL'),
      }),
    );
  }

  const geminiKey = config.get('GEMINI_API_KEY');
  if (geminiKey) {
    providers.push(
      new GeminiProvider(new GoogleGenAI({ apiKey: geminiKey }), {
        model: config.get('GEMINI_MODEL'),
      }),
    );
  }

  const anthropicKey = config.get('ANTHROPIC_API_KEY');
  if (anthropicKey) {
    providers.push(
      new AnthropicProvider(new Anthropic({ apiKey: anthropicKey, maxRetries: 0 }), {
        model: config.get('ANTHROPIC_MODEL'),
        effort: config.get('ANTHROPIC_EFFORT'),
      }),
    );
  }

  return providers;
}
