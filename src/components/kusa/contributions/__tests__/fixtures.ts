import { GitHubEvent, GitHubEventType } from '../types';

let idCounter = 1;

const defaultRepo = { name: 'user/repo', url: 'https://api.github.com/repos/user/repo' };

export const createGitHubEvent = (
  type: GitHubEventType,
  payload: any,
  overrides?: Partial<GitHubEvent>,
): GitHubEvent => ({
  id: idCounter++,
  repo: defaultRepo,
  created_at: '2024-01-15T10:00:00Z',
  type,
  payload,
  ...overrides,
});

export const createPushEvent = (overrides?: Partial<GitHubEvent>): GitHubEvent =>
  createGitHubEvent(
    'PushEvent',
    {
      before: 'abc123',
      head: 'def456',
      ref: 'refs/heads/main',
      commits: [
        {
          sha: 'def456',
          message: 'feat: add new feature',
          url: 'https://api.github.com/repos/user/repo/commits/def456',
          author: { name: 'Test User', email: 'test@example.com' },
        },
      ],
    },
    overrides,
  );

export const createPullRequestEvent = (action: string = 'opened', overrides?: Partial<GitHubEvent>): GitHubEvent =>
  createGitHubEvent(
    'PullRequestEvent',
    {
      action,
      number: 1,
      pull_request: {
        title: 'Test PR',
        url: 'https://api.github.com/repos/user/repo/pulls/1',
        html_url: 'https://github.com/user/repo/pull/1',
        number: 1,
        state: 'open',
        updated_at: '2024-01-15T10:00:00Z',
        additions: 10,
        deletions: 5,
        merged: false,
      },
    },
    overrides,
  );

export const createIssuesEvent = (
  action: string = 'opened',
  state: 'open' | 'closed' = 'open',
  overrides?: Partial<GitHubEvent>,
): GitHubEvent =>
  createGitHubEvent(
    'IssuesEvent',
    {
      action,
      number: 1,
      issue: {
        title: 'Test Issue',
        url: 'https://api.github.com/repos/user/repo/issues/1',
        html_url: 'https://github.com/user/repo/issues/1',
        number: 1,
        state,
        updated_at: '2024-01-15T10:00:00Z',
      },
    },
    overrides,
  );

export const createCreateEvent = (refType: string = 'repository', overrides?: Partial<GitHubEvent>): GitHubEvent =>
  createGitHubEvent(
    'CreateEvent',
    {
      ref: refType === 'repository' ? null : 'main',
      ref_type: refType,
    },
    overrides,
  );

export const createWatchEvent = (overrides?: Partial<GitHubEvent>): GitHubEvent =>
  createGitHubEvent('WatchEvent', { action: 'started' }, overrides);

export const createForkEvent = (overrides?: Partial<GitHubEvent>): GitHubEvent =>
  createGitHubEvent(
    'ForkEvent',
    {
      forkee: {
        url: 'https://api.github.com/repos/user/forked-repo',
        html_url: 'https://github.com/user/forked-repo',
        name: 'forked-repo',
        full_name: 'user/forked-repo',
      },
    },
    overrides,
  );

export const createIssueCommentEvent = (overrides?: Partial<GitHubEvent>): GitHubEvent =>
  createGitHubEvent(
    'IssueCommentEvent',
    {
      action: 'created',
      comment: {
        body: 'Test comment',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
        html_url: 'https://github.com/user/repo/issues/1#issuecomment-1',
      },
      issue: {
        title: 'Test Issue',
        number: 1,
        url: 'https://api.github.com/repos/user/repo/issues/1',
        html_url: 'https://github.com/user/repo/issues/1',
        state: 'open',
      },
    },
    overrides,
  );
