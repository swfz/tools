import { useCallback, useEffect, useState } from 'react';
import type { SummarizerAvailability, SummarizerLength, SummarizerType } from '@/lib/summarizer';
import type { ActivityDigest } from './activity-digest';
import { getSummarizer, readSummaryStream } from '@/lib/summarizer';
import { fitDigest, hasActivity } from './activity-digest';

const SHARED_CONTEXT =
  'This is a list of recent GitHub activities (pull requests, commits, issues, reviews and comments) of a single developer. ' +
  'Summarize what the developer has been working on, which repositories and topics they focused on.';

export type SummarizerState = SummarizerAvailability | 'unsupported' | 'checking';

export type UseActivitySummaryOptions = {
  type: SummarizerType;
  length: SummarizerLength;
  outputLanguage: string;
};

export const useActivitySummary = (digest: ActivityDigest, options: UseActivitySummaryOptions) => {
  const [state, setState] = useState<SummarizerState>('checking');
  const [summary, setSummary] = useState<string>('');
  const [input, setInput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const summarizer = getSummarizer();

    if (summarizer === null) {
      setState('unsupported');
      return;
    }

    let cancelled = false;

    summarizer
      .availability()
      .then((availability) => {
        if (!cancelled) setState(availability);
      })
      .catch(() => {
        if (!cancelled) setState('unsupported');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const generate = useCallback(async () => {
    const summarizerApi = getSummarizer();

    if (summarizerApi === null || !hasActivity(digest)) return;

    setIsRunning(true);
    setError(null);
    setSummary('');
    setInput(null);
    setDownloadProgress(null);

    let instance = null;

    try {
      instance = await summarizerApi.create({
        type: options.type,
        length: options.length,
        format: 'plain-text',
        sharedContext: SHARED_CONTEXT,
        expectedInputLanguages: ['en', 'ja'],
        outputLanguage: options.outputLanguage,
        monitor(monitor) {
          monitor.addEventListener('downloadprogress', (event) => {
            setDownloadProgress(event.loaded);
          });
        },
      });

      setState('available');
      setDownloadProgress(null);

      const fitted = await fitDigest(digest, instance);
      setInput(fitted);

      await readSummaryStream(instance.summarizeStreaming(fitted), setSummary);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      instance?.destroy?.();
      setIsRunning(false);
    }
  }, [digest, options.type, options.length, options.outputLanguage]);

  return { state, summary, input, isRunning, downloadProgress, error, generate };
};
