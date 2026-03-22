import { filterDependencyUpdateEvents } from '../filter';
import { GitHubEvent } from '../types';

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
