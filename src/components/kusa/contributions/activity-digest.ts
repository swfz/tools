import dayjs from 'dayjs';
import type { GitHubEvent, SearchData } from './types';
import type { SummarizerInstance } from '@/lib/summarizer';

// Used only when the model does not expose its input quota
const FALLBACK_MAX_ITEMS_PER_SECTION = 30;
const MAX_REPOS = 15;
const MAX_TEXT_LENGTH = 120;
const TOP_PATTERN_COUNT = 3;

// Event types that already have a dedicated section. Anything else is collected as "Other Activities"
const HANDLED_EVENT_TYPES = [
  'PullRequestEvent',
  'PushEvent',
  'IssuesEvent',
  'PullRequestReviewEvent',
  'PullRequestReviewCommentEvent',
  'IssueCommentEvent',
  'CommitCommentEvent',
  'CreateEvent',
  'DeleteEvent',
  'ForkEvent',
  'WatchEvent',
  'ReleaseEvent',
];

export type ContributionStats = {
  today: number | string;
  yesterday: number | string;
  currentStreak: number | string;
  coverage: number | string;
};

export type DigestSection = {
  title: string;
  lines: string[];
};

export type ActivityDigest = {
  header: string[];
  // Always kept as-is: aggregated numbers are cheap and carry the most signal
  fixed: DigestSection[];
  // Trimmed from the tail when the input does not fit into the model quota
  sections: DigestSection[];
};

const repoNameFromApiUrl = (url: string): string => url.replace('https://api.github.com/repos/', '');

const toDate = (isoString: string): string => (isoString ? isoString.slice(0, 10) : 'unknown');

const truncate = (text: string): string => {
  const oneLine = text.split('\n')[0].trim();

  return oneLine.length > MAX_TEXT_LENGTH ? `${oneLine.slice(0, MAX_TEXT_LENGTH)}...` : oneLine;
};

const allTimestamps = (events: GitHubEvent[], searchData: SearchData): string[] =>
  [
    ...searchData.pullRequests.map((pr) => pr.created_at),
    ...searchData.commits.map((commit) => commit.commit.author.date),
    ...searchData.issues.map((issue) => issue.created_at),
    ...events.map((event) => event.created_at),
  ].filter(Boolean);

// `${repo}#${number}` -> `+10/-5`, only PullRequestEvent carries the diff size
const diffStatsByPullRequest = (events: GitHubEvent[]): Map<string, string> =>
  events
    .filter((event) => event.type === 'PullRequestEvent')
    .reduce((acc, event) => {
      const pr = event.payload.pull_request;

      if (pr && typeof pr.additions === 'number' && typeof pr.deletions === 'number') {
        acc.set(`${event.repo.name}#${event.payload.number}`, `+${pr.additions}/-${pr.deletions}`);
      }

      return acc;
    }, new Map<string, string>());

const pullRequestLines = (events: GitHubEvent[], searchData: SearchData): string[] => {
  const diffStats = diffStatsByPullRequest(events);

  return searchData.pullRequests.map((pr) => {
    const repo = repoNameFromApiUrl(pr.repository_url);
    const state = pr.pull_request.merged_at !== null ? 'merged' : pr.state;
    const diff = diffStats.get(`${repo}#${pr.number}`);

    return `- ${toDate(pr.created_at)} ${repo} #${pr.number} ${truncate(pr.title)} (${state}${diff ? `, ${diff}` : ''})`;
  });
};

// Search API commits plus PushEvent commits that the search API did not return
const commitLines = (events: GitHubEvent[], searchData: SearchData): string[] => {
  const searchLines = searchData.commits.map(
    (commit) =>
      `- ${toDate(commit.commit.author.date)} ${commit.repository.full_name} ${truncate(commit.commit.message)}`,
  );
  const knownShas = new Set(searchData.commits.map((commit) => commit.sha));

  const pushLines = events
    .filter((event) => event.type === 'PushEvent')
    .flatMap((event) =>
      (event.payload.commits ?? [])
        .filter((commit: { sha: string }) => !knownShas.has(commit.sha))
        .map(
          (commit: { message: string }) =>
            `- ${toDate(event.created_at)} ${event.repo.name} ${truncate(commit.message)}`,
        ),
    );

  return [...searchLines, ...pushLines];
};

const issueLines = (searchData: SearchData): string[] =>
  searchData.issues.map((issue) => {
    const repo = repoNameFromApiUrl(issue.repository_url);

    return `- ${toDate(issue.created_at)} ${repo} #${issue.number} ${truncate(issue.title)} (${issue.state})`;
  });

const reviewLines = (events: GitHubEvent[]): string[] =>
  events
    .filter((event) =>
      ['PullRequestReviewEvent', 'PullRequestReviewCommentEvent', 'IssueCommentEvent', 'CommitCommentEvent'].includes(
        event.type,
      ),
    )
    .map((event) => {
      const date = toDate(event.created_at);
      const repo = event.repo.name;

      if (event.type === 'PullRequestReviewEvent') {
        return `- ${date} ${repo} reviewed PR: ${truncate(event.payload.pull_request?.title ?? '')}`;
      }
      if (event.type === 'PullRequestReviewCommentEvent') {
        return `- ${date} ${repo} commented on PR: ${truncate(event.payload.pull_request?.title ?? '')}`;
      }
      if (event.type === 'IssueCommentEvent') {
        return `- ${date} ${repo} commented on #${event.payload.issue?.number}: ${truncate(
          event.payload.issue?.title ?? '',
        )}`;
      }

      return `- ${date} ${repo} commented on commit`;
    });

const releaseLines = (events: GitHubEvent[]): string[] =>
  events
    .filter((event) => event.type === 'ReleaseEvent')
    .map((event) => {
      const release = event.payload.release;
      const name = release?.name ? `: ${truncate(release.name)}` : '';

      return `- ${toDate(event.created_at)} ${event.repo.name} released ${release?.tag_name ?? ''}${name}`;
    });

const repositoryLines = (events: GitHubEvent[]): string[] =>
  events
    .filter((event) => ['CreateEvent', 'DeleteEvent', 'ForkEvent'].includes(event.type))
    .map((event) => {
      const date = toDate(event.created_at);

      if (event.type === 'ForkEvent') {
        return `- ${date} forked ${event.repo.name} to ${event.payload.forkee?.full_name}`;
      }

      const action = event.type === 'CreateEvent' ? 'created' : 'deleted';

      return `- ${date} ${event.repo.name} ${action} ${event.payload.ref_type}${
        event.payload.ref ? `: ${event.payload.ref}` : ''
      }`;
    });

const starLines = (events: GitHubEvent[]): string[] =>
  events
    .filter((event) => event.type === 'WatchEvent')
    .map((event) => `- ${toDate(event.created_at)} ${event.repo.name}`);

const otherLines = (events: GitHubEvent[]): string[] =>
  events
    .filter((event) => !HANDLED_EVENT_TYPES.includes(event.type))
    .map((event) => `- ${toDate(event.created_at)} ${event.repo.name} ${event.type}`);

const activeRepoLines = (events: GitHubEvent[], searchData: SearchData): string[] => {
  const counts = new Map<string, number>();
  const count = (repo: string) => counts.set(repo, (counts.get(repo) ?? 0) + 1);

  searchData.pullRequests.forEach((pr) => count(repoNameFromApiUrl(pr.repository_url)));
  searchData.commits.forEach((commit) => count(commit.repository.full_name));
  searchData.issues.forEach((issue) => count(repoNameFromApiUrl(issue.repository_url)));
  events.forEach((event) => count(event.repo.name));

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || (a[0] > b[0] ? 1 : -1))
    .slice(0, MAX_REPOS)
    .map(([repo, activityCount]) => `- ${repo}: ${activityCount} activities`);
};

const topEntries = <T extends string | number>(values: T[]): [T, number][] => {
  const counts = values.reduce((acc, value) => acc.set(value, (acc.get(value) ?? 0) + 1), new Map<T, number>());

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_PATTERN_COUNT);
};

const patternLines = (events: GitHubEvent[], searchData: SearchData): string[] => {
  const timestamps = allTimestamps(events, searchData).map((timestamp) => dayjs(timestamp));

  if (timestamps.length === 0) return [];

  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekdays = topEntries(timestamps.map((timestamp) => weekdayNames[timestamp.day()]))
    .map(([day, count]) => `${day} (${count})`)
    .join(', ');
  const hours = topEntries(timestamps.map((timestamp) => timestamp.hour()))
    .map(([hour, count]) => `${String(hour).padStart(2, '0')}:00 (${count})`)
    .join(', ');

  return [`- Most active days: ${weekdays}`, `- Most active hours (local time): ${hours}`];
};

const overviewLines = (events: GitHubEvent[], searchData: SearchData, stats?: ContributionStats): string[] => {
  const lines: string[] = [];

  if (searchData.pullRequests.length > 0) {
    const merged = searchData.pullRequests.filter((pr) => pr.pull_request.merged_at !== null).length;
    const open = searchData.pullRequests.filter((pr) => pr.state === 'open').length;
    const closed = searchData.pullRequests.length - merged - open;

    lines.push(`- Pull Requests: ${searchData.pullRequests.length} (merged ${merged}, open ${open}, closed ${closed})`);
  }

  const commitCount = commitLines(events, searchData).length;
  if (commitCount > 0) lines.push(`- Commits: ${commitCount}`);

  if (searchData.issues.length > 0) {
    const open = searchData.issues.filter((issue) => issue.state === 'open').length;

    lines.push(`- Issues: ${searchData.issues.length} (open ${open}, closed ${searchData.issues.length - open})`);
  }

  const reviewCount = reviewLines(events).length;
  if (reviewCount > 0) lines.push(`- Reviews and comments: ${reviewCount}`);

  if (stats && typeof stats.today === 'number' && typeof stats.yesterday === 'number') {
    lines.push(
      `- Contributions: today ${stats.today}, yesterday ${stats.yesterday}, current streak ${stats.currentStreak} days, coverage ${stats.coverage}%`,
    );
  }

  return [...lines, ...patternLines(events, searchData)];
};

const periodLine = (events: GitHubEvent[], searchData: SearchData): string | null => {
  const dates = allTimestamps(events, searchData).sort();

  if (dates.length === 0) return null;

  return `Period: ${toDate(dates[0])} - ${toDate(dates[dates.length - 1])}`;
};

/**
 * Flatten GitHub activity into sections so that the Summarizer API can digest it.
 * Detail sections are ordered by information density: the tail is dropped first when trimming.
 */
export const buildActivityDigest = (
  username: string,
  events: GitHubEvent[],
  searchData: SearchData,
  stats?: ContributionStats,
): ActivityDigest => {
  const period = periodLine(events, searchData);

  return {
    header: [`GitHub activity of ${username}`, ...(period ? [period] : [])],
    fixed: [
      { title: 'Overview', lines: overviewLines(events, searchData, stats) },
      { title: 'Active Repositories', lines: activeRepoLines(events, searchData) },
    ],
    sections: [
      { title: 'Pull Requests', lines: pullRequestLines(events, searchData) },
      { title: 'Issues', lines: issueLines(searchData) },
      { title: 'Reviews and Comments', lines: reviewLines(events) },
      { title: 'Releases', lines: releaseLines(events) },
      { title: 'Commits', lines: commitLines(events, searchData) },
      { title: 'Repository Operations', lines: repositoryLines(events) },
      { title: 'Starred Repositories', lines: starLines(events) },
      { title: 'Other Activities', lines: otherLines(events) },
    ],
  };
};

export const hasActivity = (digest: ActivityDigest): boolean =>
  [...digest.fixed, ...digest.sections].some((section) => section.lines.length > 0);

const renderFixedSection = (section: DigestSection): string[] =>
  section.lines.length === 0 ? [] : ['', `## ${section.title}`, ...section.lines];

const renderSection = (section: DigestSection, maxItems: number): string[] => {
  // Dropping the section entirely is better than a header with no item under it
  if (section.lines.length === 0 || maxItems < 1) return [];

  const shown = section.lines.slice(0, maxItems);
  const rest = section.lines.length - shown.length;

  return ['', `## ${section.title} (${section.lines.length})`, ...shown, ...(rest > 0 ? [`- (and ${rest} more)`] : [])];
};

export const renderDigest = (digest: ActivityDigest, maxItemsPerSection: number): string => {
  const body = [
    ...digest.fixed.flatMap(renderFixedSection),
    ...digest.sections.flatMap((section) => renderSection(section, maxItemsPerSection)),
  ];

  if (body.length === 0) return '';

  return [...digest.header, ...body].join('\n');
};

/**
 * Fill the model input up to its actual quota instead of guessing a fixed limit.
 * Falls back to a conservative item count when the runtime does not report a quota.
 */
export const fitDigest = async (digest: ActivityDigest, summarizer: SummarizerInstance): Promise<string> => {
  const { inputQuota, measureInputUsage } = summarizer;

  if (typeof measureInputUsage !== 'function' || typeof inputQuota !== 'number' || !Number.isFinite(inputQuota)) {
    return renderDigest(digest, FALLBACK_MAX_ITEMS_PER_SECTION);
  }

  const measure = (text: string) => measureInputUsage.call(summarizer, text);
  const full = renderDigest(digest, Number.POSITIVE_INFINITY);

  if ((await measure(full)) <= inputQuota) return full;

  // Binary search the largest per-section item count that still fits
  let low = 0;
  let high = Math.max(...digest.sections.map((section) => section.lines.length));
  let fitted = renderDigest(digest, 0);

  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const candidate = renderDigest(digest, middle);

    if ((await measure(candidate)) <= inputQuota) {
      fitted = candidate;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }

  return fitted;
};
