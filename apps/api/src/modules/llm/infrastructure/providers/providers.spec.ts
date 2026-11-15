import Anthropic from '@anthropic-ai/sdk';
import { ApiError, FinishReason, type GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import { AnthropicProvider } from './anthropic.provider.js';
import { GeminiProvider } from './gemini.provider.js';
import { OpenAiProvider } from './openai.provider.js';

const request = {
  system: 'Be brief.',
  messages: [
    { role: 'user' as const, content: 'Hi' },
    { role: 'assistant' as const, content: 'Hello' },
    { role: 'user' as const, content: 'Plan a site' },
  ],
};

describe('AnthropicProvider', () => {
  function make(result: Promise<unknown>) {
    const stream = vi.fn().mockReturnValue({ finalMessage: () => result });
    const client = { beta: { messages: { stream } } } as unknown as Anthropic;
    return {
      provider: new AnthropicProvider(client, { model: 'claude-opus-5-5', effort: 'high' }),
      stream,
    };
  }

  const message = (stop_reason: string) => ({
    model: 'claude-opus-5-5',
    stop_reason,
    content: [
      { type: 'thinking', thinking: '...' },
      { type: 'text', text: 'Part 1. ' },
      { type: 'text', text: 'Part 2.' },
    ],
    usage: { input_tokens: 10, output_tokens: 20 },
  });

  it('streams with effort and refusal fallbacks and joins text blocks', async () => {
    const { provider, stream } = make(Promise.resolve(message('end_turn')));

    await expect(provider.complete(request)).resolves.toEqual({
      text: 'Part 1. Part 2.',
      model: 'claude-opus-5-5',
      stopReason: 'complete',
      usage: { inputTokens: 10, outputTokens: 20 },
    });
    expect(stream).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'claude-opus-5-5',
        system: 'Be brief.',
        max_tokens: 64_000,
        output_config: { effort: 'high' },
        fallbacks: 'default',
      }),
      expect.anything(),
    );
  });

  it.each([
    ['refusal', 'refusal'],
    ['max_tokens', 'max_tokens'],
    ['model_context_window_exceeded', 'max_tokens'],
  ])('maps stop_reason %s to %s', async (raw, expected) => {
    const { provider } = make(Promise.resolve(message(raw)));
    await expect(provider.complete(request)).resolves.toMatchObject({ stopReason: expected });
  });

  it.each([
    [new Anthropic.RateLimitError(429, undefined, 'slow', new Headers()), 'rate_limit'],
    [new Anthropic.AuthenticationError(401, undefined, 'bad key', new Headers()), 'auth'],
    [new Anthropic.InternalServerError(529, undefined, 'overloaded', new Headers()), 'unavailable'],
    [new Anthropic.APIConnectionTimeoutError(), 'timeout'],
    [new Anthropic.APIUserAbortError(), 'cancelled'],
  ])('maps %s to %s', async (error, kind) => {
    const { provider } = make(Promise.reject(error));
    await expect(provider.complete(request)).rejects.toMatchObject({ provider: 'ANTHROPIC', kind });
  });
});

describe('OpenAiProvider', () => {
  function make(result: Promise<unknown>) {
    const create = vi.fn().mockReturnValue(result);
    const client = { responses: { create } } as unknown as OpenAI;
    return { provider: new OpenAiProvider(client, { model: 'gpt-6-astra' }), create };
  }

  const response = (overrides: Record<string, unknown> = {}) => ({
    model: 'gpt-6-astra-2026',
    output_text: 'A plan',
    output: [{ type: 'message', content: [{ type: 'output_text', text: 'A plan' }] }],
    incomplete_details: null,
    usage: { input_tokens: 5, output_tokens: 7 },
    ...overrides,
  });

  it('sends instructions and messages and reads usage', async () => {
    const { provider, create } = make(Promise.resolve(response()));

    await expect(provider.complete(request)).resolves.toEqual({
      text: 'A plan',
      model: 'gpt-6-astra-2026',
      stopReason: 'complete',
      usage: { inputTokens: 5, outputTokens: 7 },
    });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ instructions: 'Be brief.', max_output_tokens: 32_000 }),
      expect.anything(),
    );
  });

  it('detects refusals and truncation', async () => {
    const refused = make(
      Promise.resolve(
        response({ output: [{ type: 'message', content: [{ type: 'refusal', refusal: 'No' }] }] }),
      ),
    );
    await expect(refused.provider.complete(request)).resolves.toMatchObject({
      stopReason: 'refusal',
    });

    const truncated = make(
      Promise.resolve(response({ incomplete_details: { reason: 'max_output_tokens' } })),
    );
    await expect(truncated.provider.complete(request)).resolves.toMatchObject({
      stopReason: 'max_tokens',
    });
  });

  it.each([
    [new OpenAI.RateLimitError(429, undefined, 'slow', new Headers()), 'rate_limit'],
    [new OpenAI.BadRequestError(400, undefined, 'bad', new Headers()), 'bad_request'],
    [new OpenAI.APIConnectionError({ message: 'down' }), 'unavailable'],
  ])('maps %s to %s', async (error, kind) => {
    const { provider } = make(Promise.reject(error));
    await expect(provider.complete(request)).rejects.toMatchObject({ provider: 'OPENAI', kind });
  });
});

describe('GeminiProvider', () => {
  function make(result: Promise<unknown>) {
    const generateContent = vi.fn().mockReturnValue(result);
    const client = { models: { generateContent } } as unknown as GoogleGenAI;
    return {
      provider: new GeminiProvider(client, { model: 'gemini-pro-latest' }),
      generateContent,
    };
  }

  const response = (finishReason: FinishReason, overrides: Record<string, unknown> = {}) => ({
    text: 'Sure',
    modelVersion: 'gemini-3-pro',
    candidates: [{ finishReason }],
    usageMetadata: { promptTokenCount: 3, candidatesTokenCount: 4 },
    ...overrides,
  });

  it('maps the assistant role to "model" and reads usage', async () => {
    const { provider, generateContent } = make(Promise.resolve(response(FinishReason.STOP)));

    await expect(provider.complete(request)).resolves.toEqual({
      text: 'Sure',
      model: 'gemini-3-pro',
      stopReason: 'complete',
      usage: { inputTokens: 3, outputTokens: 4 },
    });
    const call = generateContent.mock.calls[0]?.[0] as { contents: Array<{ role: string }> };
    expect(call.contents.map((c) => c.role)).toEqual(['user', 'model', 'user']);
  });

  it.each([
    [FinishReason.SAFETY, 'refusal'],
    [FinishReason.MAX_TOKENS, 'max_tokens'],
  ])('maps finish reason %s to %s', async (reason, expected) => {
    const { provider } = make(Promise.resolve(response(reason)));
    await expect(provider.complete(request)).resolves.toMatchObject({ stopReason: expected });
  });

  it('treats a blocked prompt as a refusal', async () => {
    const { provider } = make(
      Promise.resolve(response(FinishReason.STOP, { promptFeedback: { blockReason: 'SAFETY' } })),
    );
    await expect(provider.complete(request)).resolves.toMatchObject({ stopReason: 'refusal' });
  });

  it.each([
    [new ApiError({ message: 'quota', status: 429 }), 'rate_limit'],
    [new ApiError({ message: 'bad key', status: 403 }), 'auth'],
    [new TypeError('fetch failed'), 'unavailable'],
  ])('maps %s to %s', async (error, kind) => {
    const { provider } = make(Promise.reject(error));
    await expect(provider.complete(request)).rejects.toMatchObject({ provider: 'GEMINI', kind });
  });
});
