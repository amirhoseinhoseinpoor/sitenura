import { RetryExhaustedError, withRetry, type RetryOptions } from './retry.js';

class Transient extends Error {}
class Permanent extends Error {}

const baseOptions = (overrides: Partial<RetryOptions> = {}): RetryOptions => ({
  maxRetries: 2,
  baseDelayMs: 100,
  maxDelayMs: 1_000,
  shouldRetry: (error) => error instanceof Transient,
  sleep: vi.fn().mockResolvedValue(undefined),
  random: () => 1,
  ...overrides,
});

describe('withRetry', () => {
  it('returns the first successful result with its attempt count', async () => {
    const operation = vi
      .fn<(attempt: number) => Promise<string>>()
      .mockRejectedValueOnce(new Transient())
      .mockResolvedValueOnce('ok');

    await expect(withRetry(operation, baseOptions())).resolves.toEqual({
      value: 'ok',
      attempts: 2,
    });
  });

  it('does not retry permanent errors', async () => {
    const operation = vi.fn().mockRejectedValue(new Permanent());

    const error = await withRetry(operation, baseOptions()).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(RetryExhaustedError);
    expect((error as RetryExhaustedError).lastError).toBeInstanceOf(Permanent);
    expect((error as RetryExhaustedError).attempts).toBe(1);
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('gives up after maxRetries and reports every attempt', async () => {
    const operation = vi.fn().mockRejectedValue(new Transient());

    const error = (await withRetry(operation, baseOptions()).catch(
      (e: unknown) => e,
    )) as RetryExhaustedError;

    expect(error.attempts).toBe(3);
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it('backs off exponentially up to the cap', async () => {
    const sleep = vi.fn().mockResolvedValue(undefined);
    const operation = vi.fn().mockRejectedValue(new Transient());

    await withRetry(operation, baseOptions({ maxRetries: 5, sleep })).catch(() => undefined);

    expect(sleep.mock.calls.map(([ms]) => ms)).toEqual([100, 200, 400, 800, 1_000]);
  });
});
