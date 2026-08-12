// Chrome built-in AI Summarizer API
// https://developer.chrome.com/docs/ai/summarizer-api

export type SummarizerAvailability = 'unavailable' | 'downloadable' | 'downloading' | 'available';

export type SummarizerType = 'key-points' | 'tldr' | 'teaser' | 'headline';
export type SummarizerFormat = 'markdown' | 'plain-text';
export type SummarizerLength = 'short' | 'medium' | 'long';

export type SummarizerMonitor = {
  addEventListener: (type: 'downloadprogress', listener: (event: { loaded: number }) => void) => void;
};

export type SummarizerCreateOptions = {
  type?: SummarizerType;
  format?: SummarizerFormat;
  length?: SummarizerLength;
  sharedContext?: string;
  expectedInputLanguages?: string[];
  outputLanguage?: string;
  monitor?: (monitor: SummarizerMonitor) => void;
  signal?: AbortSignal;
};

export type SummarizeOptions = {
  context?: string;
  signal?: AbortSignal;
};

export type SummarizerInstance = {
  summarize: (input: string, options?: SummarizeOptions) => Promise<string>;
  summarizeStreaming: (input: string, options?: SummarizeOptions) => ReadableStream<string>;
  // Input budget of the underlying model. Not implemented by every runtime
  inputQuota?: number;
  measureInputUsage?: (input: string, options?: SummarizeOptions) => Promise<number>;
  destroy?: () => void;
};

export type SummarizerApi = {
  availability: () => Promise<SummarizerAvailability>;
  create: (options?: SummarizerCreateOptions) => Promise<SummarizerInstance>;
};

declare global {
  interface Window {
    Summarizer?: SummarizerApi;
  }
}

export const getSummarizer = (): SummarizerApi | null => {
  if (typeof self === 'undefined' || !('Summarizer' in self)) {
    return null;
  }

  return self.Summarizer ?? null;
};

// Read the whole streaming result. Chrome yields incremental chunks, so they are concatenated.
export const readSummaryStream = async (
  stream: ReadableStream<string>,
  onChunk: (text: string) => void,
): Promise<string> => {
  const reader = stream.getReader();
  let text = '';

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value === undefined) continue;

      text += value;
      onChunk(text);
    }
  } finally {
    reader.releaseLock();
  }

  return text;
};
