import { LlmError, kindFromStatus, readableMessage } from './llm.errors.js';

describe('readableMessage', () => {
  it('strips HTML error pages down to their text', () => {
    const html =
      '{"error":{"message":"<!DOCTYPE html>\\n \\n<html><style>*{margin:0}</style><p><b>403.</b> <ins>That’s an error.</ins>"}}';
    expect(readableMessage(html)).toBe('{"error":{"message":" 403. That’s an error. "}}');
  });

  it('caps long messages', () => {
    expect(readableMessage('x'.repeat(1_000))).toHaveLength(300);
  });

  it('is applied to every LlmError', () => {
    expect(new LlmError('GEMINI', 'auth', 'a\n\\n  b').message).toBe('a b');
  });
});

describe('kindFromStatus', () => {
  it.each([
    [401, 'auth'],
    [403, 'auth'],
    [408, 'timeout'],
    [429, 'rate_limit'],
    [404, 'bad_request'],
    [503, 'unavailable'],
    [undefined, 'unavailable'],
  ] as const)('maps %s to %s', (status, kind) => {
    expect(kindFromStatus(status)).toBe(kind);
  });
});
