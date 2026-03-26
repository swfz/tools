import React from 'react';
import { render, screen } from '@testing-library/react';
import ContributionsByRepo from '../contributions-by-repo';
import {
  createCreateEvent,
  createWatchEvent,
  createForkEvent,
  createIssueCommentEvent,
} from './fixtures';
import { SearchData, SearchPullRequest, SearchCommit, SearchIssue } from '../types';

const emptySearchData: SearchData = { pullRequests: [], commits: [], issues: [] };

const makeSearchCommit = (overrides?: Partial<SearchCommit>): SearchCommit => ({
  sha: 'abc123',
  html_url: 'https://github.com/user/repo/commit/abc123',
  commit: {
    message: 'feat: add new feature',
    author: { date: '2024-01-15T10:00:00Z', name: 'Test User', email: 'test@example.com' },
  },
  repository: { full_name: 'user/repo', html_url: 'https://github.com/user/repo' },
  ...overrides,
});

const makeSearchPR = (overrides?: Partial<SearchPullRequest>): SearchPullRequest => ({
  title: 'Test PR',
  number: 1,
  state: 'open',
  html_url: 'https://github.com/user/repo/pull/1',
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
  repository_url: 'https://api.github.com/repos/user/repo',
  pull_request: {
    url: 'https://api.github.com/repos/user/repo/pulls/1',
    html_url: 'https://github.com/user/repo/pull/1',
    diff_url: 'https://github.com/user/repo/pull/1.diff',
    patch_url: 'https://github.com/user/repo/pull/1.patch',
    merged_at: null,
  },
  ...overrides,
});

const makeSearchIssue = (overrides?: Partial<SearchIssue>): SearchIssue => ({
  title: 'Test Issue',
  number: 1,
  state: 'open',
  html_url: 'https://github.com/user/repo/issues/1',
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
  repository_url: 'https://api.github.com/repos/user/repo',
  ...overrides,
});

describe('ContributionsByRepo', () => {
  test('空データでクラッシュしない', () => {
    expect(() => render(<ContributionsByRepo events={[]} searchData={emptySearchData} />)).not.toThrow();
  });

  test('Search APIのコミットデータでコミット情報が表示される', () => {
    const searchData: SearchData = {
      ...emptySearchData,
      commits: [makeSearchCommit()],
    };
    render(<ContributionsByRepo events={[]} searchData={searchData} />);
    expect(screen.getByText(/Created 1 Commmits in 1 repositories/)).toBeInTheDocument();
  });

  test('Search APIのPRデータでPR情報が表示される', () => {
    const searchData: SearchData = {
      ...emptySearchData,
      pullRequests: [makeSearchPR()],
    };
    render(<ContributionsByRepo events={[]} searchData={searchData} />);
    expect(screen.getByText(/Opened 1 PullRequests in 1 repositories/)).toBeInTheDocument();
  });

  test('Search APIのIssueデータでIssue情報が表示される', () => {
    const searchData: SearchData = {
      ...emptySearchData,
      issues: [makeSearchIssue()],
    };
    render(<ContributionsByRepo events={[]} searchData={searchData} />);
    expect(screen.getByText(/Opened 1 Issues in 1 repositories/)).toBeInTheDocument();
  });

  test('Events APIのCreateEvent(repository)でリポジトリ情報が表示される', () => {
    render(<ContributionsByRepo events={[createCreateEvent('repository')]} searchData={emptySearchData} />);
    expect(screen.getByText(/Created 1 repositories/i)).toBeInTheDocument();
  });

  test('Events APIのWatchEventでStar情報が表示される', () => {
    render(<ContributionsByRepo events={[createWatchEvent()]} searchData={emptySearchData} />);
    expect(screen.getByText(/Stared 1 repositories/i)).toBeInTheDocument();
  });

  test('Search APIとEvents APIの両方のデータで正常に表示される', () => {
    const searchData: SearchData = {
      pullRequests: [makeSearchPR()],
      commits: [makeSearchCommit()],
      issues: [makeSearchIssue()],
    };
    const events = [createWatchEvent(), createCreateEvent('repository')];

    expect(() => render(<ContributionsByRepo events={events} searchData={searchData} />)).not.toThrow();
  });

  test('マージ済みPRのstatsが正しく計算される', () => {
    const searchData: SearchData = {
      ...emptySearchData,
      pullRequests: [
        makeSearchPR({ number: 1, state: 'closed', pull_request: { ...makeSearchPR().pull_request, merged_at: '2024-01-15T10:00:00Z' } }),
        makeSearchPR({ number: 2, state: 'open' }),
      ],
    };
    render(<ContributionsByRepo events={[]} searchData={searchData} />);
    expect(screen.getByText(/Opened 2 PullRequests/)).toBeInTheDocument();
  });
});
