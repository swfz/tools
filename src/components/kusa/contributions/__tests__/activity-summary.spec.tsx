import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ActivitySummary from '../activity-summary';
import { SearchData } from '../types';
import type {
  SummarizerApi,
  SummarizerAvailability,
  SummarizerCreateOptions,
  SummarizerInstance,
} from '@/lib/summarizer';
import { createWatchEvent } from './fixtures';

const emptySearchData: SearchData = { pullRequests: [], commits: [], issues: [] };

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

type SetupOptions = {
  availability?: SummarizerAvailability;
  chunks?: string[];
  inputQuota?: number;
  createImpl?: (options?: SummarizerCreateOptions) => Promise<SummarizerInstance>;
};

const setupSummarizer = (options: SetupOptions = {}) => {
  const destroy = jest.fn();
  const summarizeStreaming = jest.fn((_input: string) => streamOf(options.chunks ?? ['要約テキスト']));
  const instance = {
    summarize: jest.fn(),
    summarizeStreaming,
    destroy,
    inputQuota: options.inputQuota,
    measureInputUsage: options.inputQuota === undefined ? undefined : async (input: string) => input.length,
  } as unknown as SummarizerInstance;
  const create = jest.fn(options.createImpl ?? (async () => instance));
  const api: SummarizerApi = {
    availability: jest.fn().mockResolvedValue(options.availability ?? 'available'),
    create,
  };

  window.Summarizer = api;

  return { api, create, summarizeStreaming, destroy };
};

const renderSummary = () =>
  render(<ActivitySummary username="testuser" events={[createWatchEvent()]} searchData={emptySearchData} />);

// The button renders disabled until the availability check resolves
const findEnabledButton = async (name: string) => {
  const button = await screen.findByRole('button', { name });
  await waitFor(() => expect(button).toBeEnabled());

  return button;
};

describe('ActivitySummary', () => {
  afterEach(() => {
    delete window.Summarizer;
  });

  test('Summarizer APIが無い環境では利用できない旨を表示する', async () => {
    renderSummary();

    expect(await screen.findByText(/この環境ではSummarizer APIを利用できません/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Summarize' })).not.toBeInTheDocument();
  });

  test('availabilityがunavailableの場合も利用できない旨を表示する', async () => {
    setupSummarizer({ availability: 'unavailable' });
    renderSummary();

    expect(await screen.findByText(/この環境ではSummarizer APIを利用できません/)).toBeInTheDocument();
  });

  test('利用可能な場合はSummarizeボタンを表示する', async () => {
    setupSummarizer();
    renderSummary();

    expect(await findEnabledButton('Summarize')).toBeInTheDocument();
  });

  test('downloadableの場合はダウンロードを促すラベルになる', async () => {
    setupSummarizer({ availability: 'downloadable' });
    renderSummary();

    expect(await findEnabledButton('Download model & Summarize')).toBeInTheDocument();
  });

  test('ボタンをクリックすると要約結果を表示する', async () => {
    const user = userEvent.setup();
    const { summarizeStreaming, destroy } = setupSummarizer({ chunks: ['前半', 'と後半'] });
    renderSummary();

    await user.click(await findEnabledButton('Summarize'));

    expect(await screen.findByTestId('summary-output')).toHaveTextContent('前半と後半');
    expect(summarizeStreaming).toHaveBeenCalledWith(expect.stringContaining('GitHub activity of testuser'));
    await waitFor(() => expect(destroy).toHaveBeenCalled());
  });

  test('選択したtype/length/languageをcreateに渡す', async () => {
    const user = userEvent.setup();
    const { create } = setupSummarizer();
    renderSummary();

    await findEnabledButton('Summarize');
    await user.selectOptions(screen.getByLabelText('Type'), 'tldr');
    await user.selectOptions(screen.getByLabelText('Length'), 'short');
    await user.selectOptions(screen.getByLabelText('Language'), 'en');
    await user.click(screen.getByRole('button', { name: 'Summarize' }));

    await waitFor(() =>
      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'tldr', length: 'short', outputLanguage: 'en', format: 'plain-text' }),
      ),
    );
  });

  test('モデルのダウンロード進捗を表示する', async () => {
    const user = userEvent.setup();
    setupSummarizer({
      availability: 'downloadable',
      createImpl: (options) =>
        new Promise(() => {
          options?.monitor?.({
            addEventListener: (_type, listener) => listener({ loaded: 0.42 }),
          });
        }),
    });
    renderSummary();

    await user.click(await findEnabledButton('Download model & Summarize'));

    expect(await screen.findByText(/モデルをダウンロード中\.\.\. 42%/)).toBeInTheDocument();
  });

  test('要約に失敗した場合はエラーを表示する', async () => {
    const user = userEvent.setup();
    setupSummarizer({ createImpl: () => Promise.reject(new Error('creation failed')) });
    renderSummary();

    await user.click(await findEnabledButton('Summarize'));

    expect(await screen.findByText('Error: creation failed')).toBeInTheDocument();
  });

  test('アクティビティが無い場合はボタンを無効化する', async () => {
    setupSummarizer();
    render(<ActivitySummary username="testuser" events={[]} searchData={emptySearchData} />);

    expect(await screen.findByRole('button', { name: 'Summarize' })).toBeDisabled();
  });

  test('要約対象の入力データを確認できる', async () => {
    setupSummarizer();
    renderSummary();

    expect(await screen.findByText('Input data')).toBeInTheDocument();
    expect(screen.getByText(/GitHub activity of testuser/)).toBeInTheDocument();
  });

  test('モデルのクォータに収まるよう入力を調整して送信内容を表示する', async () => {
    const user = userEvent.setup();
    const quota = 400;
    const { summarizeStreaming } = setupSummarizer({ inputQuota: quota });
    render(
      <ActivitySummary
        username="testuser"
        events={Array.from({ length: 30 }, () => createWatchEvent())}
        searchData={emptySearchData}
      />,
    );

    await user.click(await findEnabledButton('Summarize'));

    await waitFor(() => expect(summarizeStreaming).toHaveBeenCalled());
    const sent = summarizeStreaming.mock.calls[0][0];
    expect(sent.length).toBeLessThanOrEqual(quota);
    expect(sent).toContain('## Starred Repositories (30)');
    expect(sent).toContain('more)');
    expect(await screen.findByText('Input data (sent)')).toBeInTheDocument();
  });

  test('Contribution統計を渡すと入力に含まれる', async () => {
    setupSummarizer();
    render(
      <ActivitySummary
        username="testuser"
        events={[createWatchEvent()]}
        searchData={emptySearchData}
        contributionStats={{ today: 5, yesterday: 3, currentStreak: 7, coverage: 85 }}
      />,
    );

    expect(
      await screen.findByText(/Contributions: today 5, yesterday 3, current streak 7 days, coverage 85%/),
    ).toBeInTheDocument();
  });
});
