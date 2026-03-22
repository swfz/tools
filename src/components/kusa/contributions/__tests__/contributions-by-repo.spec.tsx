import React from 'react';
import { render, screen } from '@testing-library/react';
import ContributionsByRepo from '../contributions-by-repo';
import {
  createPushEvent,
  createPullRequestEvent,
  createIssuesEvent,
  createCreateEvent,
  createWatchEvent,
  createForkEvent,
  createIssueCommentEvent,
} from './fixtures';

describe('ContributionsByRepo', () => {
  test('空配列でクラッシュしない', () => {
    expect(() => render(<ContributionsByRepo result={[]} />)).not.toThrow();
  });

  test('PushEventを含むデータでコミット情報が表示される', () => {
    render(<ContributionsByRepo result={[createPushEvent()]} />);
    expect(screen.getByText(/Created 1 Commmits in 1 repositories/)).toBeInTheDocument();
  });

  test('PullRequestEventを含むデータでPR情報が表示される', () => {
    render(<ContributionsByRepo result={[createPullRequestEvent()]} />);
    expect(screen.getByText(/Opened 1 PullRequests in 1 repositories/)).toBeInTheDocument();
  });

  test('IssuesEventを含むデータでIssue情報が表示される', () => {
    render(<ContributionsByRepo result={[createIssuesEvent()]} />);
    expect(screen.getByText(/Opened 1 Issues in 1 repositories/)).toBeInTheDocument();
  });

  test('CreateEvent(repository)でリポジトリ情報が表示される', () => {
    render(<ContributionsByRepo result={[createCreateEvent('repository')]} />);
    expect(screen.getByText(/Created 1 repositories/i)).toBeInTheDocument();
  });

  test('WatchEventでStar情報が表示される', () => {
    render(<ContributionsByRepo result={[createWatchEvent()]} />);
    expect(screen.getByText(/Stared 1 repositories/i)).toBeInTheDocument();
  });

  test('複数イベントタイプが混在するデータで正常に表示される', () => {
    const events = [
      createPushEvent(),
      createPullRequestEvent(),
      createIssuesEvent(),
      createWatchEvent(),
    ];

    expect(() => render(<ContributionsByRepo result={events} />)).not.toThrow();
  });

  test('BotユーザーのコミットはPushEventから除外される', () => {
    const botPushEvent = createPushEvent();
    botPushEvent.payload.commits = [
      {
        sha: 'bot123',
        message: 'bot commit',
        url: 'https://api.github.com/repos/user/repo/commits/bot123',
        author: { name: 'bot', email: '12345+bot@users.noreply.github.com' },
      },
    ];

    render(<ContributionsByRepo result={[botPushEvent]} />);
    expect(screen.getByText(/Created 0 Commmits in 1 repositories/)).toBeInTheDocument();
  });
});
