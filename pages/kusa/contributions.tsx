import React from 'react';
import { useState } from 'react';

type PullRequestEventPayload = {
  action: string;
  number: number;
  pull_request: {
    title: string;
    url: string;
    html_url: string;
    number: number;
  };
};

type IssuesEventPayload = {
  action: string;
  number: number;
  issue: {
    title: string;
    url: string;
    html_url: string;
    number: number;
  };
};

type Commit = {
  message: string;
  sha: string;
  url: string;
};

type PushEventPayload = {
  before: string;
  head: string;
  ref: string;
  commits: Commit[];
};

type DeleteEventPayload = {
  ref: string;
  ref_type: string;
};

type CreateEventPayload = {
  ref: string;
  ref_type: string;
};

type WatchEventPayload = {
  action: string;
};

type IssueCommentEventPayload = {
  action: string;
  comment: {
    url: string;
    html_url: string;
  };
  issue: {
    title: string;
    number: number;
    url: string;
    html_url: string;
  };
};

type ForkEventPayload = {
  forkee: {
    url: string;
    html_url: string;
    name: string;
    full_name: string;
  };
};

type GitHubRepo = {
  url: string;
  name: string;
};

type GitHubEventType =
  | 'PullRequestEvent'
  | 'IssuesEvent'
  | 'PushEvent'
  | 'CreateEvent'
  | 'DeleteEvent'
  | 'WatchEvent'
  | 'IssueCommentEvent'
  | 'ForkEvent';

type GitHubEvent = {
  id: number;
  repo: GitHubRepo;
  created_at: string;
  type: GitHubEventType;
  // FIXME: うまく解決できなかったので余裕ある時に取り組む
  payload: any;
};

const toHtmlUrl = (url: string) => {
  return url.replace('api.github.com/repos', 'github.com');
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
      {payload.action}
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

type Props = {
  result: any;
  user: string;
};

const Contributions = (props: Props) => {
  const [open, setOpen] = useState<boolean>();
  const [selectedView, setSelectedView] = useState<string>('simple');
  const views = [
    { id: 'simple', name: 'Simple List' },
    { id: 'repo', name: 'Group By Repo' },
  ];

  const handleSummaryOpen = () => {
    setOpen((prev) => !prev);
  };
  return (
    <div>
      <h2 className="font-bold col-start-1 col-end-4">Recent {props.user} Events</h2>
      <nav className="flex flex-col sm:flex-row">
        {views.map((view) => {
          return (
            <>
              {selectedView == view.id ? (
                <button className="text-gray-600 py-4 px-6 block hover:text-blue-500 focus:outline-none text-blue-500 border-b-2 font-medium border-blue-500">
                  {view.name}
                </button>
              ) : (
                <button
                  onClick={() => setSelectedView(view.id)}
                  className="text-gray-600 py-4 px-6 block hover:text-blue-500 focus:outline-none"
                >
                  {view.name}
                </button>
              )}
            </>
          );
        })}
      </nav>
      <div className="grid grid-cols-10">
        <button
          onClick={handleSummaryOpen}
          className="col-start-5 col-end-10 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-1 px-2 border border-gray-400 rounded shadow"
        >
          {open ? 'Fold up' : 'Open'} All Details
        </button>
      </div>
      <div>
        {props.result.map((row: GitHubEvent) => {
          return (
            <div key={row.id} className="grid grid-cols-10 gap-4">
              <div className="col-start-1 col-end-1">{row.created_at.split('T')[0]}</div>
              <div className="col-start-2 col-end-4 whitespace-nowrap text-blue-600 hover:underline">
                {row.repo.url ? (
                  <a href={toHtmlUrl(row.repo.url)} target="_blank" rel="noreferrer">
                    {row.repo.name}
                  </a>
                ) : (
                  <>{row.repo.name}</>
                )}
              </div>
              <div className="col-start-5 col-end-10">
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
                </details>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Contributions;
