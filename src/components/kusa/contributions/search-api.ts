import dayjs from 'dayjs';
import { SearchPullRequest, SearchCommit, SearchIssue } from './types';

const SEARCH_API_BASE = 'https://api.github.com/search';

type SearchResponse<T> = {
  total_count: number;
  incomplete_results: boolean;
  items: T[];
};

const defaultSince = () => dayjs().subtract(1, 'month').format('YYYY-MM-DD');

export const fetchSearchPullRequests = async (
  username: string,
  since: string = defaultSince(),
): Promise<SearchPullRequest[]> => {
  const q = `author:${username}+type:pr+created:>${since}`;
  const res = await fetch(`${SEARCH_API_BASE}/issues?q=${q}&per_page=100&sort=created&order=desc`);

  if (!res.ok) return [];

  const json: SearchResponse<SearchPullRequest> = await res.json();
  return json.items;
};

export const fetchSearchCommits = async (
  username: string,
  since: string = defaultSince(),
): Promise<SearchCommit[]> => {
  const q = `author:${username}+author-date:>${since}`;
  const res = await fetch(`${SEARCH_API_BASE}/commits?q=${q}&per_page=100&sort=author-date&order=desc`);

  if (!res.ok) return [];

  const json: SearchResponse<SearchCommit> = await res.json();
  return json.items;
};

export const fetchSearchIssues = async (
  username: string,
  since: string = defaultSince(),
): Promise<SearchIssue[]> => {
  const q = `author:${username}+type:issue+created:>${since}`;
  const res = await fetch(`${SEARCH_API_BASE}/issues?q=${q}&per_page=100&sort=created&order=desc`);

  if (!res.ok) return [];

  const json: SearchResponse<SearchIssue> = await res.json();
  return json.items;
};
