import React, { useMemo, useState } from 'react';
import type { GitHubEvent, SearchData } from './types';
import type { SummarizerLength, SummarizerType } from '@/lib/summarizer';
import type { ContributionStats } from './activity-digest';
import { buildActivityDigest, hasActivity, renderDigest } from './activity-digest';
import { useActivitySummary } from './use-activity-summary';

type Props = {
  username: string;
  events: GitHubEvent[];
  searchData: SearchData;
  contributionStats?: ContributionStats;
};

const DOCS_URL = 'https://developer.chrome.com/docs/ai/summarizer-api';

const types: { value: SummarizerType; label: string }[] = [
  { value: 'key-points', label: 'Key Points' },
  { value: 'tldr', label: 'TL;DR' },
  { value: 'teaser', label: 'Teaser' },
  { value: 'headline', label: 'Headline' },
];

const lengths: { value: SummarizerLength; label: string }[] = [
  { value: 'short', label: 'Short' },
  { value: 'medium', label: 'Medium' },
  { value: 'long', label: 'Long' },
];

const languages: { value: string; label: string }[] = [
  { value: 'ja', label: '日本語' },
  { value: 'en', label: 'English' },
];

// pr-8 keeps the text clear of the dropdown arrow drawn by @tailwindcss/forms
const selectClass = 'rounded border border-gray-400 bg-white py-1 pl-2 pr-8 text-sm';

const ActivitySummary = (props: Props) => {
  const [type, setType] = useState<SummarizerType>('key-points');
  const [length, setLength] = useState<SummarizerLength>('medium');
  const [outputLanguage, setOutputLanguage] = useState<string>('ja');

  const digest = useMemo(
    () => buildActivityDigest(props.username, props.events, props.searchData, props.contributionStats),
    [props.username, props.events, props.searchData, props.contributionStats],
  );

  const { state, summary, input, isRunning, downloadProgress, error, generate } = useActivitySummary(digest, {
    type,
    length,
    outputLanguage,
  });

  // Before generating, the full digest is shown; afterwards, what actually fit into the model quota
  const inputPreview = input ?? renderDigest(digest, Number.POSITIVE_INFINITY);

  const buttonLabel = isRunning
    ? 'Summarizing...'
    : state === 'downloadable'
      ? 'Download model & Summarize'
      : 'Summarize';
  const disabled = isRunning || !hasActivity(digest) || state === 'checking' || state === 'unsupported';

  return (
    <div className="my-4 rounded border border-gray-300 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="basis-full text-xl font-bold sm:basis-auto">AI Summary</h3>
        <span className="text-xs text-gray-500">
          by{' '}
          <a href={DOCS_URL} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
            Chrome Summarizer API
          </a>
        </span>
      </div>

      {state === 'unsupported' || state === 'unavailable' ? (
        <p className="mt-2 text-sm text-gray-600">
          この環境ではSummarizer APIを利用できません。Chrome 138以降かつ
          <a href={DOCS_URL} target="_blank" rel="noreferrer" className="mx-1 text-blue-600 hover:underline">
            ハードウェア要件
          </a>
          を満たしている必要があります。
        </p>
      ) : (
        <>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <label className="text-sm" htmlFor="summary-type">
              Type
            </label>
            <select
              id="summary-type"
              className={selectClass}
              value={type}
              onChange={(e) => setType(e.target.value as SummarizerType)}
            >
              {types.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>

            <label className="text-sm" htmlFor="summary-length">
              Length
            </label>
            <select
              id="summary-length"
              className={selectClass}
              value={length}
              onChange={(e) => setLength(e.target.value as SummarizerLength)}
            >
              {lengths.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>

            <label className="text-sm" htmlFor="summary-language">
              Language
            </label>
            <select
              id="summary-language"
              className={selectClass}
              value={outputLanguage}
              onChange={(e) => setOutputLanguage(e.target.value)}
            >
              {languages.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>

            <button
              onClick={generate}
              disabled={disabled}
              className="rounded border border-gray-400 bg-white px-2 py-1 font-semibold text-gray-800 shadow hover:bg-gray-100 disabled:border-gray-300 disabled:bg-white disabled:text-gray-300"
            >
              {buttonLabel}
            </button>
          </div>

          {downloadProgress !== null && (
            <p className="mt-2 text-sm text-gray-600">
              モデルをダウンロード中... {Math.floor(downloadProgress * 100)}%
            </p>
          )}

          {error !== null && <p className="mt-2 text-sm text-red-600">Error: {error}</p>}

          {summary !== '' && (
            <div className="mt-2 rounded bg-gray-100 p-2 text-sm whitespace-pre-wrap" data-testid="summary-output">
              {summary}
            </div>
          )}

          {inputPreview !== '' && (
            <details className="mt-2 text-xs text-gray-600">
              <summary className="cursor-pointer">{input === null ? 'Input data' : 'Input data (sent)'}</summary>
              <pre className="mt-1 max-h-64 overflow-auto whitespace-pre-wrap">{inputPreview}</pre>
            </details>
          )}
        </>
      )}
    </div>
  );
};

export default ActivitySummary;
