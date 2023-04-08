import React, { useState } from 'react';
import type {
  CommitCommentEventPayload,
  CreateEventPayload,
  DeleteEventPayload,
  ForkEventPayload,
  GitHubEvent,
  IssueCommentEventPayload,
  IssuesEventPayload,
  PullRequestEventPayload,
  PullRequestReviewCommentEventPayload,
  PullRequestReviewEventPayload,
  PushEventPayload,
  WatchEventPayload,
} from './types';
import { toHtmlUrl } from '@lib/to-html-url';
import { iso8601DateTimeExtract } from '@lib/iso8601-date-time-extract';

type Props = {
  result: any;
};

const IssueEvent = ({ payload }: { payload: IssuesEventPayload }) => {
  return (
    <div>
      <span className="text-blue-600 hover:underline">
        <a href={payload.issue.html_url} target="_blank" rel="noreferrer">
          #{payload.issue.number} {payload.issue.title}
        </a>
      </span>
      {payload.action}
    </div>
  );
};

const PullRequestEvent = ({ payload }: { payload: PullRequestEventPayload }) => {
  return (
    <div>
      <span className="text-blue-600 hover:underline">
        <a href={payload.pull_request.html_url} target="_blank" rel="noreferrer">
          #{payload.pull_request.number} {payload.pull_request.title}
        </a>
      </span>
      &nbsp;{payload.action}
    </div>
  );
};

const PushEvent = ({ payload }: { payload: PushEventPayload }) => {
  return (
    <ul className="list-disc">
      {payload.commits?.map((c) => {
        return (
          <li key={c.sha} className="ml-8">
            <a
              href={toHtmlUrl(c.url).replace('commits', 'commit')}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline"
            >
              {c.sha.substring(0, 6)}
            </a>{' '}
            {c.message}
          </li>
        );
      })}
    </ul>
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
      Fork to
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

const ContributionsSimple = (props: Props) => {
  const [open, setOpen] = useState<boolean>();

  const handleSummaryOpen = () => {
    setOpen((prev) => !prev);
  };

  return (
    <div>
      <div className="flex justify-start sm:justify-end">
        <button
          onClick={handleSummaryOpen}
          className="basis-full rounded border border-gray-400 bg-white py-1 px-2 font-semibold text-gray-800 shadow hover:bg-gray-100 sm:basis-1/2"
        >
          {open ? 'Fold up' : 'Open'} All Details
        </button>
      </div>
      {props.result.map((row: GitHubEvent) => {
        return (
          <div key={row.id} className="flex flex-wrap text-sm odd:bg-gray-100">
            <div className="basis-1/4 sm:basis-1/12">{iso8601DateTimeExtract(row.created_at)}</div>
            <div className="basis-3/4 text-blue-600 hover:underline sm:basis-4/12">
              {row.repo.url ? (
                <a href={toHtmlUrl(row.repo.url)} target="_blank" rel="noreferrer">
                  {row.repo.name}
                </a>
              ) : (
                <>{row.repo.name}</>
              )}
            </div>
            <div className="basis-full text-sm sm:basis-7/12">
              <details open={open}>
                <summary>{row.type}</summary>
                {row.type === 'PullRequestEvent' && <PullRequestEvent payload={row.payload}></PullRequestEvent>}
                {row.type === 'PushEvent' && <PushEvent payload={row.payload}></PushEvent>}
                {row.type === 'IssuesEvent' && <IssueEvent payload={row.payload}></IssueEvent>}
                {row.type === 'DeleteEvent' && <DeleteEvent payload={row.payload}></DeleteEvent>}
                {row.type === 'CreateEvent' && <CreateEvent payload={row.payload}></CreateEvent>}
                {row.type === 'WatchEvent' && <WatchEvent payload={row.payload}></WatchEvent>}
                {row.type === 'IssueCommentEvent' && <IssueCommentEvent payload={row.payload}></IssueCommentEvent>}
                {row.type === 'ForkEvent' && <ForkEvent payload={row.payload}></ForkEvent>}
                {row.type === 'PullRequestReviewCommentEvent' && (
                  <PullRequestReviewCommentEvent payload={row.payload}></PullRequestReviewCommentEvent>
                )}
                {row.type === 'PullRequestReviewEvent' && (
                  <PullRequestReviewEvent payload={row.payload}></PullRequestReviewEvent>
                )}
                {row.type === 'CommitCommentEvent' && <CommitCommentEvent payload={row.payload}></CommitCommentEvent>}
              </details>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ContributionsSimple;
