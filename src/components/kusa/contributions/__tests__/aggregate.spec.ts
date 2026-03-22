import { uniqueAndSortCommits, ignoreDuplicatePullRequest, aggregateIssues } from '../aggregate';
import { CommitData, Summary } from '../types';

const makeCommit = (sha: string, date: string, overrides?: Partial<CommitData>): CommitData => ({
  sha,
  date,
  author: { name: 'test', email: 'test@example.com' },
  message: 'test commit',
  url: `https://api.github.com/repos/user/repo/commits/${sha}`,
  ...overrides,
});

const makeRepo = (name: string) => ({ name, url: `https://api.github.com/repos/${name}` });

describe('uniqueAndSortCommits', () => {
  test('空入力で空オブジェクトが返る', () => {
    expect(uniqueAndSortCommits({})).toEqual({});
  });

  test('同じSHAのコミットが複数ある場合、最新のdateのものだけ残る', () => {
    const commits: Summary['commits'] = {
      'user/repo': {
        repo: makeRepo('user/repo'),
        data: [
          makeCommit('abc123', '2024-01-01T00:00:00Z'),
          makeCommit('abc123', '2024-01-03T00:00:00Z'),
          makeCommit('abc123', '2024-01-02T00:00:00Z'),
        ],
      },
    };

    const result = uniqueAndSortCommits(commits);
    expect(result['user/repo'].data).toHaveLength(1);
    expect(result['user/repo'].data[0].date).toBe('2024-01-03T00:00:00Z');
  });

  test('異なるSHAのコミットはすべて保持される', () => {
    const commits: Summary['commits'] = {
      'user/repo': {
        repo: makeRepo('user/repo'),
        data: [makeCommit('aaa', '2024-01-01T00:00:00Z'), makeCommit('bbb', '2024-01-02T00:00:00Z')],
      },
    };

    const result = uniqueAndSortCommits(commits);
    expect(result['user/repo'].data).toHaveLength(2);
  });

  test('結果が日付降順（最新が先）になる', () => {
    const commits: Summary['commits'] = {
      'user/repo': {
        repo: makeRepo('user/repo'),
        data: [
          makeCommit('aaa', '2024-01-01T00:00:00Z'),
          makeCommit('bbb', '2024-01-03T00:00:00Z'),
          makeCommit('ccc', '2024-01-02T00:00:00Z'),
        ],
      },
    };

    const result = uniqueAndSortCommits(commits);
    const dates = result['user/repo'].data.map((c) => c.date);
    expect(dates).toEqual(['2024-01-03T00:00:00Z', '2024-01-02T00:00:00Z', '2024-01-01T00:00:00Z']);
  });

  test('複数リポジトリのデータが正しく処理される', () => {
    const commits: Summary['commits'] = {
      'user/repo1': {
        repo: makeRepo('user/repo1'),
        data: [makeCommit('aaa', '2024-01-01T00:00:00Z')],
      },
      'user/repo2': {
        repo: makeRepo('user/repo2'),
        data: [makeCommit('bbb', '2024-01-02T00:00:00Z')],
      },
    };

    const result = uniqueAndSortCommits(commits);
    expect(Object.keys(result)).toHaveLength(2);
    expect(result['user/repo1'].data).toHaveLength(1);
    expect(result['user/repo2'].data).toHaveLength(1);
  });
});

describe('ignoreDuplicatePullRequest', () => {
  const makePR = (
    number: number,
    updated_at: string,
    state: string = 'open',
    merged: boolean = false,
  ): Summary['pullRequests'][string] => ({
    repo: makeRepo('user/repo'),
    data: [
      {
        action: 'opened',
        number,
        pull_request: {
          title: `PR #${number}`,
          url: `https://api.github.com/repos/user/repo/pulls/${number}`,
          html_url: `https://github.com/user/repo/pull/${number}`,
          number,
          state,
          updated_at,
          additions: 10,
          deletions: 5,
          merged,
        },
      },
    ],
    stats: { count: 0, merged: 0, open: 0 },
  });

  test('空入力で空オブジェクトが返る', () => {
    expect(ignoreDuplicatePullRequest({})).toEqual({});
  });

  test('同じPR番号の重複が除去され、最新のupdated_atのものが残る', () => {
    const pullRequests: Summary['pullRequests'] = {
      'user/repo': {
        repo: makeRepo('user/repo'),
        data: [
          {
            action: 'opened',
            number: 1,
            pull_request: {
              title: 'PR #1',
              url: '',
              html_url: '',
              number: 1,
              state: 'open',
              updated_at: '2024-01-01T00:00:00Z',
              additions: 10,
              deletions: 5,
              merged: false,
            },
          },
          {
            action: 'closed',
            number: 1,
            pull_request: {
              title: 'PR #1',
              url: '',
              html_url: '',
              number: 1,
              state: 'closed',
              updated_at: '2024-01-03T00:00:00Z',
              additions: 10,
              deletions: 5,
              merged: true,
            },
          },
        ],
        stats: { count: 0, merged: 0, open: 0 },
      },
    };

    const result = ignoreDuplicatePullRequest(pullRequests);
    expect(result['user/repo'].data).toHaveLength(1);
    expect(result['user/repo'].data[0].pull_request.updated_at).toBe('2024-01-03T00:00:00Z');
    expect(result['user/repo'].data[0].pull_request.merged).toBe(true);
  });

  test('closed+未マージのPRは除外される', () => {
    const pullRequests: Summary['pullRequests'] = {
      'user/repo': {
        repo: makeRepo('user/repo'),
        data: [
          {
            action: 'closed',
            number: 1,
            pull_request: {
              title: 'PR #1',
              url: '',
              html_url: '',
              number: 1,
              state: 'closed',
              updated_at: '2024-01-01T00:00:00Z',
              additions: 0,
              deletions: 0,
              merged: false,
            },
          },
        ],
        stats: { count: 0, merged: 0, open: 0 },
      },
    };

    const result = ignoreDuplicatePullRequest(pullRequests);
    expect(result['user/repo'].data).toHaveLength(0);
  });

  test('stats.mergedがマージ済みPR数をカウントする', () => {
    const pullRequests: Summary['pullRequests'] = {
      'user/repo': {
        repo: makeRepo('user/repo'),
        data: [
          {
            action: 'closed',
            number: 1,
            pull_request: {
              title: 'PR #1',
              url: '',
              html_url: '',
              number: 1,
              state: 'closed',
              updated_at: '2024-01-01T00:00:00Z',
              additions: 0,
              deletions: 0,
              merged: true,
            },
          },
          {
            action: 'opened',
            number: 2,
            pull_request: {
              title: 'PR #2',
              url: '',
              html_url: '',
              number: 2,
              state: 'open',
              updated_at: '2024-01-02T00:00:00Z',
              additions: 0,
              deletions: 0,
              merged: false,
            },
          },
        ],
        stats: { count: 0, merged: 0, open: 0 },
      },
    };

    const result = ignoreDuplicatePullRequest(pullRequests);
    expect(result['user/repo'].stats.count).toBe(2);
    expect(result['user/repo'].stats.merged).toBe(1);
    expect(result['user/repo'].stats.open).toBe(1);
  });
});

describe('aggregateIssues', () => {
  test('空入力で空オブジェクトが返る', () => {
    expect(aggregateIssues({})).toEqual({});
  });

  test('同じIssue番号の重複が除去され、最新のupdated_atのものが残る', () => {
    const issues: Summary['issues'] = {
      'user/repo': {
        repo: makeRepo('user/repo'),
        data: [
          {
            action: 'opened',
            number: 1,
            issue: {
              title: 'Issue #1',
              url: '',
              html_url: '',
              number: 1,
              state: 'open',
              updated_at: '2024-01-01T00:00:00Z',
            },
          },
          {
            action: 'closed',
            number: 1,
            issue: {
              title: 'Issue #1',
              url: '',
              html_url: '',
              number: 1,
              state: 'closed',
              updated_at: '2024-01-03T00:00:00Z',
            },
          },
        ],
        stats: { closed: 0, open: 0 },
      },
    };

    const result = aggregateIssues(issues);
    expect(result['user/repo'].data).toHaveLength(1);
    expect(result['user/repo'].data[0].issue.state).toBe('closed');
    expect(result['user/repo'].data[0].issue.updated_at).toBe('2024-01-03T00:00:00Z');
  });

  test('stats.closedとstats.openが正しくカウントされる', () => {
    const issues: Summary['issues'] = {
      'user/repo': {
        repo: makeRepo('user/repo'),
        data: [
          {
            action: 'opened',
            number: 1,
            issue: {
              title: 'Issue #1',
              url: '',
              html_url: '',
              number: 1,
              state: 'closed',
              updated_at: '2024-01-01T00:00:00Z',
            },
          },
          {
            action: 'opened',
            number: 2,
            issue: {
              title: 'Issue #2',
              url: '',
              html_url: '',
              number: 2,
              state: 'open',
              updated_at: '2024-01-02T00:00:00Z',
            },
          },
          {
            action: 'opened',
            number: 3,
            issue: {
              title: 'Issue #3',
              url: '',
              html_url: '',
              number: 3,
              state: 'closed',
              updated_at: '2024-01-03T00:00:00Z',
            },
          },
        ],
        stats: { closed: 0, open: 0 },
      },
    };

    const result = aggregateIssues(issues);
    expect(result['user/repo'].stats.closed).toBe(2);
    expect(result['user/repo'].stats.open).toBe(1);
  });
});
