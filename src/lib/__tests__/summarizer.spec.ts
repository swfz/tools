import { getSummarizer, readSummaryStream } from '../summarizer';
import type { SummarizerApi } from '../summarizer';

const stubApi = (): SummarizerApi => ({
  availability: jest.fn().mockResolvedValue('available'),
  create: jest.fn(),
});

// jsdom does not provide ReadableStream, so only the interface readSummaryStream relies on is faked
const streamOf = (chunks: string[]): ReadableStream<string> => {
  let index = 0;

  return {
    getReader: () => ({
      read: async () =>
        index < chunks.length ? { done: false, value: chunks[index++] } : { done: true, value: undefined },
      releaseLock: () => {},
    }),
  } as unknown as ReadableStream<string>;
};

const failingStream = (error: Error): ReadableStream<string> =>
  ({
    getReader: () => ({ read: () => Promise.reject(error), releaseLock: () => {} }),
  }) as unknown as ReadableStream<string>;

describe('getSummarizer', () => {
  afterEach(() => {
    delete window.Summarizer;
  });

  test('Summarizerが存在しない場合はnullを返す', () => {
    expect(getSummarizer()).toBeNull();
  });

  test('Summarizerが存在する場合はそのAPIを返す', () => {
    const api = stubApi();
    window.Summarizer = api;

    expect(getSummarizer()).toBe(api);
  });
});

describe('readSummaryStream', () => {
  test('チャンクを連結した結果を返す', async () => {
    const result = await readSummaryStream(streamOf(['ab', 'cd', 'ef']), () => {});

    expect(result).toBe('abcdef');
  });

  test('チャンクごとに連結済みのテキストをコールバックする', async () => {
    const received: string[] = [];

    await readSummaryStream(streamOf(['ab', 'cd', 'ef']), (text) => received.push(text));

    expect(received).toEqual(['ab', 'abcd', 'abcdef']);
  });

  test('空のストリームでは空文字を返しコールバックされない', async () => {
    const onChunk = jest.fn();

    const result = await readSummaryStream(streamOf([]), onChunk);

    expect(result).toBe('');
    expect(onChunk).not.toHaveBeenCalled();
  });

  test('ストリームがエラーになった場合はrejectする', async () => {
    await expect(readSummaryStream(failingStream(new Error('stream failed')), () => {})).rejects.toThrow(
      'stream failed',
    );
  });
});
