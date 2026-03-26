import React, { useState, useMemo } from 'react';
import type {
  CommitCommentEventPayload,
  CreateEventPayload,
  DeleteEventPayload,
  ForkEventPayload,
  GitHubEvent,
  IssueCommentEventPayload,
  PullRequestReviewCommentEventPayload,
  PullRequestReviewEventPayload,
  SearchData,
  SearchPullRequest,
  SearchCommit,
  SearchIssue,
  WatchEventPayload,
} from './types';
import { toHtmlUrl } from '@/lib/to-html-url';
import { iso8601DateTimeExtract } from '@/lib/iso8601-date-time-extract';

type Props = {
  events: GitHubEvent[];
  searchData: SearchData;
};

// Unified row type for chronological display
type SimpleRow =
  | { kind: 'search-pr'; date: string; repoName: string; repoUrl: string; data: SearchPullRequest }
  | { kind: 'search-commit'; date: string; repoName: string; repoUrl: string; data: SearchCommit }
  | { kind: 'search-issue'; date: string; repoName: string; repoUrl: string; data: SearchIssue }
  | { kind: 'event'; date: string; repoName: string; repoUrl: string; data: GitHubEvent };

const SearchPullRequestRow = ({ pr }: { pr: SearchPullRequest }) => {
  const merged = pr.pull_request.merged_at !== null;
  const status = merged ? 'merged' : pr.state;
  return (
    <div>
      <span className="text-blue-600 hover:underline">
        <a href={pr.html_url} target="_blank" rel="noreferrer">
          #{pr.number} {pr.title}
        </a>
      </span>
      &nbsp;{status}
    </div>
  );
};

const SearchCommitRow = ({ commit }: { commit: SearchCommit }) => {
  return (
    <ul className="list-disc">
      <li className="ml-8">
        <a
          href={commit.html_url}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 hover:underline"
        >
          {commit.sha.substring(0, 6)}
        </a>{' '}
        {commit.commit.message.split('\n')[0]}
      </li>
    </ul>
  );
};

const SearchIssueRow = ({ issue }: { issue: SearchIssue }) => {
  return (
    <div>
      <span className="text-blue-600 hover:underline">
        <a href={issue.html_url} target="_blank" rel="noreferrer">
          #{issue.number} {issue.title}
        </a>
      </span>
      &nbsp;{issue.state}
    </div>
  );
};

const DeleteEvent = ({ payload }: { payload: DeleteEventPayload }) => {
  return (
    <div>
      {payload.ref_type}: {payload.ref} Deleted
    </div>
  );
};

const CreateEvent = ({ payload }: { payload: CreateEventPayload }) => {
  return (
    <div>
      {payload.ref_type}: {payload.ref} Created
    </div>
  );
};

const WatchEvent = ({ payload }: { payload: WatchEventPayload }) => {
  return <div>{payload.action}</div>;
};

const IssueCommentEvent = ({ payload }: { payload: IssueCommentEventPayload }) => {
  return (
    <div>
      <span className="text-blue-600 hover:underline">
        <a href={payload.comment.html_url} target="_blank" rel="noreferrer">
          #{payload.issue.number} {payload.issue.title}
        </a>
      </span>
      <span className="ml-1">comment {payload.action}</span>
    </div>
  );
};

const ForkEvent = ({ payload }: { payload: ForkEventPayload }) => {
  return (
    <div>
      Fork to{' '}
      <span className="text-blue-600 hover:underline">
        <a href={payload.forkee.html_url} target="_blank" rel="noreferrer">
          {payload.forkee.full_name}
        </a>
      </span>
    </div>
  );
};

const PullRequestReviewEvent = ({ payload }: { payload: PullRequestReviewEventPayload }) => {
  return (
    <div>
      {payload.review.state}{' '}
      <span className="text-blue-600 hover:underline">
        <a target="_blank" rel="noreferrer" href={payload.review.html_url}>
          {payload.pull_request.title}
        </a>
      </span>{' '}
      at {payload.review.submitted_at}
    </div>
  );
};

const PullRequestReviewCommentEvent = ({ payload }: { payload: PullRequestReviewCommentEventPayload }) => {
  return (
    <div>
      <a className="text-blue-600 hover:underline" target="_blank" rel="noreferrer" href={payload.comment.html_url}>
        comment
      </a>{' '}
      to{' '}
      <a
        className="text-blue-600 hover:underline"
        target="_blank"
        rel="noreferrer"
        href={payload.pull_request.html_url}
      >
        {payload.pull_request.title}
      </a>{' '}
      at {payload.comment.updated_at}
    </div>
  );
};

const CommitCommentEvent = ({ payload }: { payload: CommitCommentEventPayload }) => {
  return (
    <div>
      commented to{' '}
      <a className="text-blue-600 hover:underline" target="_blank" rel="noreferrer" href={payload.comment.html_url}>
        {payload.comment.commit_id?.substring(0, 6)}
      </a>{' '}
      at {iso8601DateTimeExtract(payload.comment.updated_at, 1)}
    </div>
  );
};

const rowTypeName = (row: SimpleRow): string => {
  switch (row.kind) {
    case 'search-pr': return 'PullRequestEvent';
    case 'search-commit': return 'PushEvent';
    case 'search-issue': return 'IssuesEvent';
    case 'event': return row.data.type;
  }
};

const EventDetail = ({ row }: { row: SimpleRow }) => {
  switch (row.kind) {
    case 'search-pr':
      return <SearchPullRequestRow pr={row.data} />;
    case 'search-commit':
      return <SearchCommitRow commit={row.data} />;
    case 'search-issue':
      return <SearchIssueRow issue={row.data} />;
    case 'event': {
      const event = row.data;
      if (event.type === 'DeleteEvent') return <DeleteEvent payload={event.payload} />;
      if (event.type === 'CreateEvent') return <CreateEvent payload={event.payload} />;
      if (event.type === 'WatchEvent') return <WatchEvent payload={event.payload} />;
      if (event.type === 'IssueCommentEvent') return <IssueCommentEvent payload={event.payload} />;
      if (event.type === 'ForkEvent') return <ForkEvent payload={event.payload} />;
      if (event.type === 'PullRequestReviewCommentEvent') return <PullRequestReviewCommentEvent payload={event.payload} />;
      if (event.type === 'PullRequestReviewEvent') return <PullRequestReviewEvent payload={event.payload} />;
      if (event.type === 'CommitCommentEvent') return <CommitCommentEvent payload={event.payload} />;
      return null;
    }
  }
};

const ContributionsSimple = (props: Props) => {
  const [open, setOpen] = useState<boolean>();

  const handleSummaryOpen = () => {
    setOpen((prev) => !prev);
  };

  const rows: SimpleRow[] = useMemo(() => {
    const result: SimpleRow[] = [];

    // Search APIデータ
    for (const pr of props.searchData.pullRequests) {
      const repoName = pr.repository_url.replace('https://api.github.com/repos/', '');
      result.push({
        kind: 'search-pr',
        date: pr.created_at,
        repoName,
        repoUrl: pr.html_url.replace(/\/pull\/\d+$/, ''),
        data: pr,
      });
    }
    for (const c of props.searchData.commits) {
      result.push({
        kind: 'search-commit',
        date: c.commit.author.date,
        repoName: c.repository.full_name,
        repoUrl: c.repository.html_url,
        data: c,
      });
    }
    for (const issue of props.searchData.issues) {
      const repoName = issue.repository_url.replace('https://api.github.com/repos/', '');
      result.push({
        kind: 'search-issue',
        date: issue.created_at,
        repoName,
        repoUrl: issue.html_url.replace(/\/issues\/\d+$/, ''),
        data: issue,
      });
    }

    // Events APIデータ（PR/Push/Issuesは除外、Search APIに移行したため）
    for (const event of props.events) {
      if (['PullRequestEvent', 'PushEvent', 'IssuesEvent'].includes(event.type)) continue;
      result.push({
        kind: 'event',
        date: event.created_at,
        repoName: event.repo.name,
        repoUrl: event.repo.url ? toHtmlUrl(event.repo.url) : '',
        data: event,
      });
    }

    // 時系列でソート（新しい順）
    result.sort((a, b) => (a.date > b.date ? -1 : 1));

    return result;
  }, [props.searchData, props.events]);

  return (
    <div>
      <div className="flex justify-start sm:justify-end">
        <button
          onClick={handleSummaryOpen}
          className="basis-full rounded border border-gray-400 bg-white px-2 py-1 font-semibold text-gray-800 shadow hover:bg-gray-100 sm:basis-1/2"
        >
          {open ? 'Fold up' : 'Open'} All Details
        </button>
      </div>
      {rows.map((row, index) => {
        const key = row.kind === 'event' ? row.data.id : `${row.kind}-${index}`;
        return (
          <div key={key} className="flex flex-wrap text-sm odd:bg-gray-100">
            <div className="basis-1/4 sm:basis-1/12">{iso8601DateTimeExtract(row.date)}</div>
            <div className="basis-3/4 text-blue-600 hover:underline sm:basis-4/12">
              {row.repoUrl ? (
                <a href={row.repoUrl} target="_blank" rel="noreferrer">
                  {row.repoName}
                </a>
              ) : (
                <>{row.repoName}</>
              )}
            </div>
            <div className="basis-full text-sm sm:basis-7/12">
              <details open={open}>
                <summary>{rowTypeName(row)}</summary>
                <EventDetail row={row} />
              </details>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ContributionsSimple;
