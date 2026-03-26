import { filterDependencyUpdateEvents, filterDependencyUpdateSearchData } from '../filter';
import { GitHubEvent, SearchData, SearchPullRequest, SearchCommit } from '../types';

const makeEvent = (type: string, payload: any): GitHubEvent => ({
  id: 1,
  repo: { name: 'user/repo', url: 'https://api.github.com/repos/user/repo' },
  created_at: '2024-01-01T00:00:00Z',
  type: type as GitHubEvent['type'],
  payload,
});

describe('filterDependencyUpdateEvents', () => {
  test('空配列で空配列が返る', () => {
    expect(filterDependencyUpdateEvents([])).toEqual([]);
  });

  test('通常のイベントは保持される', () => {
    const events = [
      makeEvent('PushEvent', {
        commits: [{ message: 'feat: add new feature', author: { name: 'user', email: 'user@example.com' } }],
      }),
      makeEvent('PullRequestEvent', {
        pull_request: { user: { login: 'user' } },
      }),
    ];

    expect(filterDependencyUpdateEvents(events)).toHaveLength(2);
  });

  test('renovateブランチのCreateEventが除外される', () => {
    const events = [makeEvent('CreateEvent', { ref_type: 'branch', ref: 'renovate/eslint-9.x' })];

    expect(filterDependencyUpdateEvents(events)).toHaveLength(0);
  });

  test('renovate[bot]ユーザーのPRが除外される', () => {
    const events = [
      makeEvent('PullRequestEvent', {
        pull_request: { user: { login: 'renovate[bot]' } },
      }),
    ];

    expect(filterDependencyUpdateEvents(events)).toHaveLength(0);
  });

  test('renovateメッセージのPushEventが除外される（update dependency）', () => {
    const events = [
      makeEvent('PushEvent', {
        commits: [
          {
            message: 'update dependency eslint to v9',
            author: { name: 'renovate[bot]', email: 'bot@renovate.com' },
          },
        ],
      }),
    ];

    expect(filterDependencyUpdateEvents(events)).toHaveLength(0);
  });

  test('renovateメッセージのPushEventが除外される（Update dependency）', () => {
    const events = [
      makeEvent('PushEvent', {
        commits: [
          {
            message: 'Update dependency eslint to v9',
            author: { name: 'renovate[bot]', email: 'bot@renovate.com' },
          },
        ],
      }),
    ];

    expect(filterDependencyUpdateEvents(events)).toHaveLength(0);
  });

  test('最後のコミットメッセージにrenovateを含むPushEventが除外される', () => {
    const events = [
      makeEvent('PushEvent', {
        commits: [
          { message: 'some other commit', author: { name: 'user', email: 'user@example.com' } },
          { message: 'chore(deps): renovate update', author: { name: 'renovate[bot]', email: 'bot@renovate.com' } },
        ],
      }),
    ];

    expect(filterDependencyUpdateEvents(events)).toHaveLength(0);
  });

  test('dependabotブランチのCreateEventが除外される', () => {
    const events = [makeEvent('CreateEvent', { ref_type: 'branch', ref: 'dependabot/npm_and_yarn/eslint-9.0.0' })];

    expect(filterDependencyUpdateEvents(events)).toHaveLength(0);
  });

  test('dependabot[bot]ユーザーのPRが除外される', () => {
    const events = [
      makeEvent('PullRequestEvent', {
        pull_request: { user: { login: 'dependabot[bot]' } },
      }),
    ];

    expect(filterDependencyUpdateEvents(events)).toHaveLength(0);
  });

  test('dependabotメッセージのPushEventが除外される', () => {
    const events = [
      makeEvent('PushEvent', {
        commits: [
          { message: 'dependabot bump eslint', author: { name: 'dependabot[bot]', email: 'bot@dependabot.com' } },
        ],
      }),
    ];

    expect(filterDependencyUpdateEvents(events)).toHaveLength(0);
  });

  test('commitsが空配列の場合にクラッシュしない', () => {
    const events = [makeEvent('PushEvent', { commits: [] })];

    expect(() => filterDependencyUpdateEvents(events)).not.toThrow();
  });

  test('commitsがundefinedの場合にクラッシュしない', () => {
    const events = [makeEvent('IssuesEvent', { action: 'opened' })];

    expect(() => filterDependencyUpdateEvents(events)).not.toThrow();
    expect(filterDependencyUpdateEvents(events)).toHaveLength(1);
  });

  test('renovateと通常イベントが混在する場合、通常イベントだけ残る', () => {
    const events = [
      makeEvent('PushEvent', {
        commits: [{ message: 'feat: add feature', author: { name: 'user', email: 'user@example.com' } }],
      }),
      makeEvent('CreateEvent', { ref_type: 'branch', ref: 'renovate/eslint-9.x' }),
      makeEvent('PullRequestEvent', {
        pull_request: { user: { login: 'user' } },
      }),
    ];

    const result = filterDependencyUpdateEvents(events);
    expect(result).toHaveLength(2);
    expect(result[0].type).toBe('PushEvent');
    expect(result[1].type).toBe('PullRequestEvent');
  });
});

const makeSearchPR = (title: string, htmlUrl: string): SearchPullRequest => ({
  title,
  number: 1,
  state: 'open',
  html_url: htmlUrl,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  repository_url: 'https://api.github.com/repos/user/repo',
  pull_request: {
    url: '',
    html_url: htmlUrl,
    diff_url: '',
    patch_url: '',
    merged_at: null,
  },
});

const makeSearchCommit = (message: string): SearchCommit => ({
  sha: 'abc123',
  html_url: 'https://github.com/user/repo/commit/abc123',
  commit: {
    message,
    author: { date: '2024-01-01T00:00:00Z', name: 'test', email: 'test@example.com' },
  },
  repository: { full_name: 'user/repo', html_url: 'https://github.com/user/repo' },
});

const emptySearchData: SearchData = { pullRequests: [], commits: [], issues: [] };

describe('filterDependencyUpdateSearchData', () => {
  test('空データで空データが返る', () => {
    const result = filterDependencyUpdateSearchData(emptySearchData);
    expect(result.pullRequests).toEqual([]);
    expect(result.commits).toEqual([]);
  });

  test('通常のPRとコミットは保持される', () => {
    const data: SearchData = {
      ...emptySearchData,
      pullRequests: [makeSearchPR('feat: add new feature', 'https://github.com/user/repo/pull/1')],
      commits: [makeSearchCommit('feat: add new feature')],
    };

    const result = filterDependencyUpdateSearchData(data);
    expect(result.pullRequests).toHaveLength(1);
    expect(result.commits).toHaveLength(1);
  });

  test('renovateのURLを含むPRが除外される', () => {
    const data: SearchData = {
      ...emptySearchData,
      pullRequests: [makeSearchPR('Update eslint to v9', 'https://github.com/user/repo/pull/1/renovate/eslint-9.x')],
    };

    const result = filterDependencyUpdateSearchData(data);
    expect(result.pullRequests).toHaveLength(0);
  });

  test('update dependencyタイトルのPRが除外される', () => {
    const data: SearchData = {
      ...emptySearchData,
      pullRequests: [makeSearchPR('Update dependency eslint to v9', 'https://github.com/user/repo/pull/1')],
    };

    const result = filterDependencyUpdateSearchData(data);
    expect(result.pullRequests).toHaveLength(0);
  });

  test('chore(deps)タイトルのPRが除外される', () => {
    const data: SearchData = {
      ...emptySearchData,
      pullRequests: [makeSearchPR('chore(deps): update eslint', 'https://github.com/user/repo/pull/1')],
    };

    const result = filterDependencyUpdateSearchData(data);
    expect(result.pullRequests).toHaveLength(0);
  });

  test('dependabotのURLを含むPRが除外される', () => {
    const data: SearchData = {
      ...emptySearchData,
      pullRequests: [makeSearchPR('Bump eslint from 8 to 9', 'https://github.com/user/repo/pull/1/dependabot/npm')],
    };

    const result = filterDependencyUpdateSearchData(data);
    expect(result.pullRequests).toHaveLength(0);
  });

  test('bump タイトルのPRが除外される', () => {
    const data: SearchData = {
      ...emptySearchData,
      pullRequests: [makeSearchPR('Bump eslint from 8.0 to 9.0', 'https://github.com/user/repo/pull/1')],
    };

    const result = filterDependencyUpdateSearchData(data);
    expect(result.pullRequests).toHaveLength(0);
  });

  test('renovateメッセージのコミットが除外される', () => {
    const data: SearchData = {
      ...emptySearchData,
      commits: [makeSearchCommit('chore(deps): renovate update eslint')],
    };

    const result = filterDependencyUpdateSearchData(data);
    expect(result.commits).toHaveLength(0);
  });

  test('dependabotメッセージのコミットが除外される', () => {
    const data: SearchData = {
      ...emptySearchData,
      commits: [makeSearchCommit('dependabot bump eslint from 8 to 9')],
    };

    const result = filterDependencyUpdateSearchData(data);
    expect(result.commits).toHaveLength(0);
  });

  test('update dependencyメッセージのコミットが除外される', () => {
    const data: SearchData = {
      ...emptySearchData,
      commits: [makeSearchCommit('Update dependency eslint to v9')],
    };

    const result = filterDependencyUpdateSearchData(data);
    expect(result.commits).toHaveLength(0);
  });

  test('issuesはフィルタされない', () => {
    const data: SearchData = {
      ...emptySearchData,
      issues: [
        {
          title: 'renovate issue',
          number: 1,
          state: 'open',
          html_url: '',
          created_at: '',
          updated_at: '',
          repository_url: '',
        },
      ],
    };

    const result = filterDependencyUpdateSearchData(data);
    expect(result.issues).toHaveLength(1);
  });
});
