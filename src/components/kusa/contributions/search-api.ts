import dayjs from 'dayjs';
import { SearchPullRequest, SearchCommit, SearchIssue } from './types';

const SEARCH_API_BASE = 'https://api.github.com/search';

type SearchResponse<T> = {
  total_count: number;
  incomplete_results: boolean;
  items: T[];
};

const defaultSince = () => dayjs().subtract(1, 'month').format('YYYY-MM-DD');

// Rate limited responses of the search API can be rejected by the browser before
// they reach us (invalid CORS header), so a rejected fetch must not break the whole panel
const fetchSearchItems = async <T>(url: string): Promise<T[]> => {
  try {
    const res = await fetch(url);

    if (!res.ok) return [];

    const json: SearchResponse<T> = await res.json();
    return json.items;
  } catch (e) {
    console.log('[search-api] request failed:', e);
    return [];
  }
};

export const fetchSearchPullRequests = async (
  username: string,
  since: string = defaultSince(),
): Promise<SearchPullRequest[]> => {
  const q = `author:${username}+type:pr+created:>${since}`;
  return await fetchSearchItems<SearchPullRequest>(
    `${SEARCH_API_BASE}/issues?q=${q}&per_page=100&sort=created&order=desc`,
  );
};

export const fetchSearchCommits = async (username: string, since: string = defaultSince()): Promise<SearchCommit[]> => {
  const q = `author:${username}+author-date:>${since}`;
  return await fetchSearchItems<SearchCommit>(
    `${SEARCH_API_BASE}/commits?q=${q}&per_page=100&sort=author-date&order=desc`,
  );
};

export const fetchSearchIssues = async (username: string, since: string = defaultSince()): Promise<SearchIssue[]> => {
  const q = `author:${username}+type:issue+created:>${since}`;
  return await fetchSearchItems<SearchIssue>(`${SEARCH_API_BASE}/issues?q=${q}&per_page=100&sort=created&order=desc`);
};
