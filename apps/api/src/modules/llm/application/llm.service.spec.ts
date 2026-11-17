import { PlannerProvider } from '@sitenura/shared';
import { LlmCallRepository, type LlmCallRecord } from '../domain/llm-call.repository.js';
import { LlmError, LlmProviderNotConfiguredError } from '../domain/llm.errors.js';
import type {
  LlmCompletionRequest,
  LlmCompletionResult,
  LlmProvider,
} from '../domain/llm-provider.port.js';
import { LlmRegistry } from './llm-registry.service.js';
import { LlmService } from './llm.service.js';

class FakeProvider implements LlmProvider {
  readonly id = PlannerProvider.OPENAI;
  readonly model = 'fake-model';
  readonly requests: LlmCompletionRequest[] = [];
  private readonly script: Array<LlmCompletionResult | LlmError>;

  constructor(...script: Array<LlmCompletionResult | LlmError>) {
    this.script = script;
  }

  async complete(request: LlmCompletionRequest): Promise<LlmCompletionResult> {
    this.requests.push(request);
    const next = this.script.shift();
    if (!next) throw new Error('script exhausted');
    if (next instanceof LlmError) throw next;
    return next;
  }
}

/** Never answers; reacts to aborts the way the real adapters do. */
class HangingProvider extends FakeProvider {
  override async complete(request: LlmCompletionRequest): Promise<LlmCompletionResult> {
    this.requests.push(request);
    return new Promise((_, reject) => {
      request.signal?.addEventListener('abort', () =>
        reject(new LlmError(PlannerProvider.OPENAI, 'cancelled', 'Request was cancelled')),
      );
    });
  }
}

class InMemoryCalls extends LlmCallRepository {
  readonly records: LlmCallRecord[] = [];
  async record(call: LlmCallRecord): Promise<void> {
    this.records.push(call);
  }
}

const ok: LlmCompletionResult = {
  text: 'Hello',
  model: 'fake-model-2026',
  stopReason: 'complete',
  usage: { inputTokens: 12, outputTokens: 3 },
};

const rateLimited = () => new LlmError(PlannerProvider.OPENAI, 'rate_limit', 'slow down');
const badKey = () => new LlmError(PlannerProvider.OPENAI, 'auth', 'bad key');

function setup(provider: FakeProvider) {
  const calls = new InMemoryCalls();
  const registry = new LlmRegistry([provider], {
    OPENAI: 'fake-model',
    GEMINI: 'gemini-default',
    ANTHROPIC: 'claude-default',
  });
  const service = new LlmService(registry, calls, {
    timeoutMs: 5_000,
    maxRetries: 2,
    baseDelayMs: 0,
    maxDelayMs: 0,
  });
  return { service, calls, registry };
}

const request = { messages: [{ role: 'user' as const, content: 'Hi' }] };

describe('LlmService', () => {
  it('returns the result and records usage', async () => {
    const { service, calls } = setup(new FakeProvider(ok));

    await expect(
      service.complete('OPENAI', request, { purpose: 'planner', projectId: 'p1' }),
    ).resolves.toEqual(ok);

    expect(calls.records).toEqual([
      expect.objectContaining({
        provider: 'OPENAI',
        model: 'fake-model-2026',
        purpose: 'planner',
        status: 'SUCCEEDED',
        attempts: 1,
        inputTokens: 12,
        outputTokens: 3,
        projectId: 'p1',
      }),
    ]);
  });

  it('retries transient failures and passes a cancellable signal', async () => {
    const provider = new FakeProvider(rateLimited(), ok);
    const { service, calls } = setup(provider);

    await service.complete('OPENAI', request, { purpose: 'planner' });

    expect(provider.requests).toHaveLength(2);
    expect(provider.requests[0]?.signal).toBeInstanceOf(AbortSignal);
    expect(calls.records[0]).toMatchObject({ status: 'SUCCEEDED', attempts: 2 });
  });

  it('does not retry permanent failures and records them', async () => {
    const provider = new FakeProvider(badKey(), ok);
    const { service, calls } = setup(provider);

    await expect(service.complete('OPENAI', request, { purpose: 'planner' })).rejects.toMatchObject(
      { kind: 'auth' },
    );

    expect(provider.requests).toHaveLength(1);
    expect(calls.records[0]).toMatchObject({ status: 'FAILED', attempts: 1, errorKind: 'auth' });
  });

  it('gives up after the retry budget', async () => {
    const provider = new FakeProvider(rateLimited(), rateLimited(), rateLimited());
    const { service, calls } = setup(provider);

    await expect(service.complete('OPENAI', request, { purpose: 'planner' })).rejects.toMatchObject(
      { kind: 'rate_limit' },
    );
    expect(calls.records[0]).toMatchObject({ status: 'FAILED', attempts: 3 });
  });

  it('reports its own deadline as a retryable timeout, not a cancellation', async () => {
    const provider = new HangingProvider();
    const { service, calls } = setup(provider);

    await expect(
      service.complete('OPENAI', request, { purpose: 'planner', timeoutMs: 20 }),
    ).rejects.toMatchObject({ kind: 'timeout' });

    expect(provider.requests).toHaveLength(3);
    expect(calls.records[0]).toMatchObject({ status: 'FAILED', attempts: 3, errorKind: 'timeout' });
  });

  it('does not retry when the caller cancels', async () => {
    const provider = new HangingProvider();
    const { service } = setup(provider);
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 20);

    await expect(
      service.complete('OPENAI', request, { purpose: 'planner', signal: controller.signal }),
    ).rejects.toMatchObject({ kind: 'cancelled' });
    expect(provider.requests).toHaveLength(1);
  });

  it('rejects providers without an API key', async () => {
    const { service } = setup(new FakeProvider(ok));

    await expect(
      service.complete('GEMINI', request, { purpose: 'planner' }),
    ).rejects.toBeInstanceOf(LlmProviderNotConfiguredError);
  });

  it('still answers when usage logging fails', async () => {
    const { service, calls } = setup(new FakeProvider(ok));
    vi.spyOn(calls, 'record').mockRejectedValue(new Error('db down'));

    await expect(service.complete('OPENAI', request, { purpose: 'planner' })).resolves.toEqual(ok);
  });
});

describe('LlmRegistry', () => {
  it('lists every provider with availability and no secrets', () => {
    const { registry } = setup(new FakeProvider());

    expect(registry.list()).toEqual([
      { id: 'OPENAI', label: 'ChatGPT (OpenAI)', model: 'fake-model', available: true },
      { id: 'GEMINI', label: 'Gemini (Google)', model: 'gemini-default', available: false },
      { id: 'ANTHROPIC', label: 'Claude (Anthropic)', model: 'claude-default', available: false },
    ]);
  });
});
