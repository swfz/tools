import dayjs from 'dayjs';
import { buildActivityDigest, fitDigest, hasActivity, renderDigest } from '../activity-digest';
import type { ContributionStats } from '../activity-digest';
import { GitHubEvent, SearchCommit, SearchData, SearchIssue, SearchPullRequest } from '../types';
import type { SummarizerInstance } from '@/lib/summarizer';
import {
  createCreateEvent,
  createForkEvent,
  createGitHubEvent,
  createIssueCommentEvent,
  createPullRequestEvent,
  createPushEvent,
  createWatchEvent,
} from './fixtures';

const emptySearchData: SearchData = { pullRequests: [], commits: [], issues: [] };

const createSearchPullRequest = (overrides?: Partial<SearchPullRequest>): SearchPullRequest => ({
  title: 'Add summarizer',
  number: 10,
  state: 'open',
  html_url: 'https://github.com/user/repo/pull/10',
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
  repository_url: 'https://api.github.com/repos/user/repo',
  pull_request: {
    url: 'https://api.github.com/repos/user/repo/pulls/10',
    html_url: 'https://github.com/user/repo/pull/10',
    diff_url: 'https://github.com/user/repo/pull/10.diff',
    patch_url: 'https://github.com/user/repo/pull/10.patch',
    merged_at: null,
  },
  ...overrides,
});

const mergedPullRequest = (overrides?: Partial<SearchPullRequest>): SearchPullRequest =>
  createSearchPullRequest({
    state: 'closed',
    pull_request: { ...createSearchPullRequest().pull_request, merged_at: '2024-01-16T10:00:00Z' },
    ...overrides,
  });

const createSearchCommit = (overrides?: Partial<SearchCommit>): SearchCommit => ({
  sha: 'abcdef1234567890',
  html_url: 'https://github.com/user/repo/commit/abcdef1',
  commit: {
    message: 'feat: add summarizer',
    author: { date: '2024-01-14T10:00:00Z', name: 'Test User', email: 'test@example.com' },
  },
  repository: { full_name: 'user/repo', html_url: 'https://github.com/user/repo' },
  ...overrides,
});

const createSearchIssue = (overrides?: Partial<SearchIssue>): SearchIssue => ({
  title: 'Something is broken',
  number: 3,
  state: 'closed',
  html_url: 'https://github.com/user/repo/issues/3',
  created_at: '2024-01-13T10:00:00Z',
  updated_at: '2024-01-13T10:00:00Z',
  repository_url: 'https://api.github.com/repos/user/repo',
  ...overrides,
});

// Fully rendered digest, as passed to a model with an unlimited quota
const render = (events: GitHubEvent[], searchData: SearchData, stats?: ContributionStats): string =>
  renderDigest(buildActivityDigest('testuser', events, searchData, stats), Number.POSITIVE_INFINITY);

describe('buildActivityDigest / renderDigest', () => {
  test('アクティビティが無い場合は空文字を返す', () => {
    expect(render([], emptySearchData)).toBe('');
  });

  test('ヘッダーにユーザー名と期間が含まれる', () => {
    const searchData: SearchData = {
      ...emptySearchData,
      pullRequests: [createSearchPullRequest()],
      commits: [createSearchCommit()],
    };

    const digest = render([], searchData);

    expect(digest).toContain('GitHub activity of testuser');
    expect(digest).toContain('Period: 2024-01-14 - 2024-01-15');
  });

  test('PullRequestがstate付きで出力される', () => {
    const searchData: SearchData = { ...emptySearchData, pullRequests: [createSearchPullRequest()] };

    expect(render([], searchData)).toContain('- 2024-01-15 user/repo #10 Add summarizer (open)');
  });

  test('マージ済みPullRequestはmergedとして出力される', () => {
    const searchData: SearchData = { ...emptySearchData, pullRequests: [mergedPullRequest()] };

    expect(render([], searchData)).toContain('(merged)');
  });

  test('PullRequestEventがある場合は変更行数が付与される', () => {
    const searchData: SearchData = { ...emptySearchData, pullRequests: [createSearchPullRequest()] };
    const event = createPullRequestEvent('opened');
    event.payload.number = 10;
    event.payload.pull_request.additions = 120;
    event.payload.pull_request.deletions = 4;

    expect(render([event], searchData)).toContain('- 2024-01-15 user/repo #10 Add summarizer (open, +120/-4)');
  });

  test('Commitはメッセージの1行目のみ出力される', () => {
    const searchData: SearchData = {
      ...emptySearchData,
      commits: [
        createSearchCommit({
          commit: { message: 'feat: add\n\ndetail body', author: createSearchCommit().commit.author },
        }),
      ],
    };

    const digest = render([], searchData);

    expect(digest).toContain('- 2024-01-14 user/repo feat: add');
    expect(digest).not.toContain('detail body');
  });

  test('Search APIに含まれないPushEventのコミットも出力される', () => {
    const digest = render([createPushEvent()], emptySearchData);

    expect(digest).toContain('- 2024-01-15 user/repo feat: add new feature');
  });

  test('PushEventのコミットがSearch APIと重複する場合は除外される', () => {
    const searchData: SearchData = {
      ...emptySearchData,
      commits: [
        createSearchCommit({
          sha: 'def456',
          commit: { message: 'feat: add new feature', author: createSearchCommit().commit.author },
        }),
      ],
    };

    const digest = render([createPushEvent()], searchData);

    expect(digest).toContain('## Commits (1)');
  });

  test('Issueが出力される', () => {
    const searchData: SearchData = { ...emptySearchData, issues: [createSearchIssue()] };

    expect(render([], searchData)).toContain('- 2024-01-13 user/repo #3 Something is broken (closed)');
  });

  test('120文字を超えるタイトルは切り詰められる', () => {
    const searchData: SearchData = {
      ...emptySearchData,
      pullRequests: [createSearchPullRequest({ title: 'a'.repeat(200) })],
    };

    const digest = render([], searchData);

    expect(digest).toContain(`${'a'.repeat(120)}...`);
    expect(digest).not.toContain('a'.repeat(121));
  });

  test('コメント系イベントがReviews and Commentsに出力される', () => {
    const digest = render([createIssueCommentEvent()], emptySearchData);

    expect(digest).toContain('## Reviews and Comments (1)');
    expect(digest).toContain('- 2024-01-15 user/repo commented on #1: Test Issue');
  });

  test('レビューイベントが出力される', () => {
    const reviewEvent = createGitHubEvent('PullRequestReviewEvent', {
      action: 'created',
      pull_request: { title: 'Review target' },
      review: { state: 'commented', submitted_at: '2024-01-15T10:00:00Z' },
    });

    expect(render([reviewEvent], emptySearchData)).toContain('- 2024-01-15 user/repo reviewed PR: Review target');
  });

  test('ReleaseEventがReleasesに出力される', () => {
    const releaseEvent = createGitHubEvent('ReleaseEvent', {
      action: 'published',
      release: { tag_name: 'v1.0.0', name: 'First release', html_url: 'https://github.com/user/repo/releases/v1.0.0' },
    });

    const digest = render([releaseEvent], emptySearchData);

    expect(digest).toContain('## Releases (1)');
    expect(digest).toContain('- 2024-01-15 user/repo released v1.0.0: First release');
  });

  test('未対応のイベント種別もOther Activitiesとして残る', () => {
    const unknownEvent = createGitHubEvent('MemberEvent' as never, { action: 'added' });

    const digest = render([unknownEvent], emptySearchData);

    expect(digest).toContain('## Other Activities (1)');
    expect(digest).toContain('- 2024-01-15 user/repo MemberEvent');
  });

  test('Create/Fork系イベントがRepository Operationsに出力される', () => {
    const digest = render([createCreateEvent('branch'), createForkEvent()], emptySearchData);

    expect(digest).toContain('## Repository Operations (2)');
    expect(digest).toContain('- 2024-01-15 user/repo created branch: main');
    expect(digest).toContain('- 2024-01-15 forked user/repo to user/forked-repo');
  });

  test('StarイベントがStarred Repositoriesに出力される', () => {
    const digest = render([createWatchEvent()], emptySearchData);

    expect(digest).toContain('## Starred Repositories (1)');
    expect(digest).toContain('- 2024-01-15 user/repo');
  });

  test('Active Repositoriesにリポジトリごとの件数が多い順で出力される', () => {
    const events = [
      createWatchEvent({ repo: { name: 'user/other', url: 'https://api.github.com/repos/user/other' } }),
      createWatchEvent(),
      createWatchEvent(),
    ];
    const searchData: SearchData = { ...emptySearchData, commits: [createSearchCommit()] };

    const repoSection = render(events, searchData).split('## Active Repositories')[1];

    expect(repoSection).toContain('- user/repo: 3 activities');
    expect(repoSection).toContain('- user/other: 1 activities');
    expect(repoSection.indexOf('user/repo')).toBeLessThan(repoSection.indexOf('user/other'));
  });

  test('空のセクションは出力されない', () => {
    const digest = render([createWatchEvent()], emptySearchData);

    expect(digest).not.toContain('## Pull Requests');
    expect(digest).not.toContain('## Commits');
    expect(digest).not.toContain('## Issues');
  });
});

describe('Overview', () => {
  test('PullRequestの内訳が集計される', () => {
    const searchData: SearchData = {
      ...emptySearchData,
      pullRequests: [
        mergedPullRequest({ number: 1 }),
        createSearchPullRequest({ number: 2 }),
        createSearchPullRequest({ number: 3, state: 'closed' }),
      ],
    };

    expect(render([], searchData)).toContain('- Pull Requests: 3 (merged 1, open 1, closed 1)');
  });

  test('Issueの内訳が集計される', () => {
    const searchData: SearchData = {
      ...emptySearchData,
      issues: [createSearchIssue(), createSearchIssue({ number: 4, state: 'open' })],
    };

    expect(render([], searchData)).toContain('- Issues: 2 (open 1, closed 1)');
  });

  test('CommitとReviewの件数が集計される', () => {
    const searchData: SearchData = { ...emptySearchData, commits: [createSearchCommit()] };

    const digest = render([createIssueCommentEvent()], searchData);

    expect(digest).toContain('- Commits: 1');
    expect(digest).toContain('- Reviews and comments: 1');
  });

  test('Contribution統計が渡された場合は出力される', () => {
    const stats: ContributionStats = { today: 5, yesterday: 3, currentStreak: 7, coverage: 85 };

    expect(render([createWatchEvent()], emptySearchData, stats)).toContain(
      '- Contributions: today 5, yesterday 3, current streak 7 days, coverage 85%',
    );
  });

  test('Contribution統計が取得できていない場合は出力されない', () => {
    const stats: ContributionStats = { today: '-', yesterday: '-', currentStreak: '-', coverage: '-' };

    expect(render([createWatchEvent()], emptySearchData, stats)).not.toContain('- Contributions:');
  });

  test('活動が多い曜日と時間帯が出力される', () => {
    const event = createWatchEvent();
    const expectedDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayjs(event.created_at).day()];
    const expectedHour = String(dayjs(event.created_at).hour()).padStart(2, '0');

    const digest = render([event], emptySearchData);

    expect(digest).toContain(`- Most active days: ${expectedDay} (1)`);
    expect(digest).toContain(`- Most active hours (local time): ${expectedHour}:00 (1)`);
  });
});

describe('hasActivity', () => {
  test('アクティビティが無い場合はfalse', () => {
    expect(hasActivity(buildActivityDigest('testuser', [], emptySearchData))).toBe(false);
  });

  test('イベントが1件でもあればtrue', () => {
    expect(hasActivity(buildActivityDigest('testuser', [createWatchEvent()], emptySearchData))).toBe(true);
  });
});

describe('renderDigest', () => {
  const manyCommits: SearchData = {
    ...emptySearchData,
    commits: Array.from({ length: 35 }, (_, i) =>
      createSearchCommit({
        sha: `sha${i}`,
        commit: { message: `commit ${i}`, author: createSearchCommit().commit.author },
      }),
    ),
  };

  test('上限を超えた分は残数として表示される', () => {
    const digest = renderDigest(buildActivityDigest('testuser', [], manyCommits), 30);

    expect(digest).toContain('## Commits (35)');
    expect(digest).toContain('- (and 5 more)');
    expect(digest).toContain('commit 29');
    expect(digest).not.toContain('commit 30');
  });

  test('上限0でも集計セクションは残る', () => {
    const digest = renderDigest(buildActivityDigest('testuser', [], manyCommits), 0);

    expect(digest).toContain('- Commits: 35');
    expect(digest).toContain('## Active Repositories');
    expect(digest).not.toContain('## Commits (35)');
  });
});

describe('fitDigest', () => {
  const digest = buildActivityDigest('testuser', [], {
    ...emptySearchData,
    commits: Array.from({ length: 50 }, (_, i) =>
      createSearchCommit({
        sha: `sha${i}`,
        commit: { message: `commit ${i}`, author: createSearchCommit().commit.author },
      }),
    ),
  });

  // measureInputUsage is faked as the character count so that the quota is deterministic
  const summarizer = (overrides: Partial<SummarizerInstance>): SummarizerInstance => ({
    summarize: jest.fn(),
    summarizeStreaming: jest.fn(),
    measureInputUsage: async (input: string) => input.length,
    ...overrides,
  });

  test('クォータに収まる場合は全件をそのまま渡す', async () => {
    const fitted = await fitDigest(digest, summarizer({ inputQuota: 100000 }));

    expect(fitted).toBe(renderDigest(digest, Number.POSITIVE_INFINITY));
    expect(fitted).toContain('commit 49');
  });

  test('クォータを超える場合は収まるところまで詰める', async () => {
    const quota = 1000;

    const fitted = await fitDigest(digest, summarizer({ inputQuota: quota }));

    expect(fitted.length).toBeLessThanOrEqual(quota);
    expect(fitted).toContain('commit 0');
    expect(fitted).not.toContain('commit 49');
  });

  test('クォータが大きいほど多くの情報を渡す', async () => {
    const small = await fitDigest(digest, summarizer({ inputQuota: 800 }));
    const large = await fitDigest(digest, summarizer({ inputQuota: 1600 }));

    expect(large.length).toBeGreaterThan(small.length);
  });

  test('measureInputUsage未対応の場合は固定上限にフォールバックする', async () => {
    const fitted = await fitDigest(digest, summarizer({ measureInputUsage: undefined, inputQuota: undefined }));

    expect(fitted).toBe(renderDigest(digest, 30));
  });

  test('inputQuotaが取得できない場合も固定上限にフォールバックする', async () => {
    const fitted = await fitDigest(digest, summarizer({ inputQuota: undefined }));

    expect(fitted).toBe(renderDigest(digest, 30));
  });
});
