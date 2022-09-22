import React, { useState, useEffect } from 'react';
import ContributionsByRepo from './contributions-by-repo';
import ContributionsByEvent from './contributions-by-event';
import ContributionsSimple from './contributions-simple';

export type PullRequest = {
  title: string;
  url: string;
  html_url: string;
  number: number;
  state: string;
  updated_at: string;
  additions: number;
  deletions: number;
  merged: boolean;
};
export type PullRequestEventPayload = {
  action: string;
  number: number;
  pull_request: PullRequest;
};

export type IssuesEventPayload = {
  action: string;
  number: number;
  issue: {
    title: string;
    url: string;
    html_url: string;
    number: number;
    state: 'open' | 'closed';
    updated_at: string;
  };
};

export type Commit = {
  author: {
    name: string;
    email: string;
  };
  message: string;
  sha: string;
  url: string;
};

export type PushEventPayload = {
  before: string;
  head: string;
  ref: string;
  commits: Commit[];
};

export type DeleteEventPayload = {
  ref: string;
  ref_type: string;
};

export type CreateEventPayload = {
  ref: string;
  ref_type: string;
};

export type WatchEventPayload = {
  action: string;
};

export type IssueCommentEventPayload = {
  action: string;
  comment: Comment;
  issue: {
    title: string;
    number: number;
    url: string;
    html_url: string;
    state: 'open' | 'closed';
  };
};

export type ForkEventPayload = {
  forkee: {
    url: string;
    html_url: string;
    name: string;
    full_name: string;
  };
};

export type Comment = {
  body: string;
  created_at: string;
  updated_at: string;
  line?: number;
  path?: string;
  position?: number;
  commit_id?: string;
  html_url: string;
  pull_request_url?: string;
  _links?: {
    html: {
      href: string;
    };
    self: {
      href: string;
    };
  };
};

export type PullRequestReviewCommentEventPayload = {
  action: 'created';
  comment: Comment;
  pull_request: PullRequest;
};

export type PullRequestReviewEventPayload = {
  action: 'created';
  pull_request: PullRequest;
  review: {
    body: string;
    commit_id: string;
    html_url: string;
    pull_request_url: string;
    state: 'commented';
    submitted_at: string;
  };
};

export type CommitCommentEventPayload = {
  comment: Comment;
  public: boolean;
};

export type GitHubRepo = {
  url: string;
  name: string;
};

export type GitHubEventType =
  | 'PullRequestEvent'
  | 'IssuesEvent'
  | 'PushEvent'
  | 'CreateEvent'
  | 'DeleteEvent'
  | 'WatchEvent'
  | 'IssueCommentEvent'
  | 'ForkEvent'
  | 'PullRequestReviewCommentEvent'
  | 'PullRequestReviewEvent'
  | 'CommitCommentEvent';

export type GitHubEvent = {
  id: number;
  repo: GitHubRepo;
  created_at: string;
  type: GitHubEventType;
  // FIXME: うまく解決できなかったので余裕ある時に取り組む
  payload: any;
};

export const toHtmlUrl = (url: string) => {
  return url.replace('api.github.com/repos', 'github.com');
};

type Props = {
  result: any;
  user: string;
};

const Contributions = (props: Props) => {
  const [selectedView, setSelectedView] = useState<string>('simple');
  const [exclude, setExclude] = useState<boolean>(false);
  const [apiResult, setApiResult] = useState([]);

  useEffect(() => {
    if (exclude) {
      const filtered = props.result.filter((row: GitHubEvent) => {
        const isRenovateBranch = row.payload.ref_type === 'branch' && row.payload.ref.startsWith('renovate');
        const isRenovatePR = row.payload.pull_request?.user?.login === 'renovate[bot]';
        const isRenovatePush =
          row.payload?.commits?.every((c: Commit) => c.message.includes('update dependency')) ||
          row.payload?.commits?.every((c: Commit) => c.message.includes('Update dependency')) ||
          row.payload?.commits?.at(-1).message.includes('renovate');

        const isDependabotBranch = row.payload.ref_type === 'branch' && row.payload.ref.startsWith('dependabot');
        const isDependabotPR = row.payload.pull_request?.user?.login === 'dependabot[bot]';
        const isDependabotPush = row.payload?.commits?.every((c: Commit) => c.message.includes('dependabot'));

        return (
          !isRenovateBranch &&
          !isRenovatePR &&
          !isRenovatePush &&
          !isDependabotBranch &&
          !isDependabotPR &&
          !isDependabotPush
        );
      });
      console.log('filtered', filtered);

      setApiResult(filtered);
    } else {
      setApiResult(props.result);
    }
  }, [exclude]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExclude(e.target.checked);
  };

  const views = [
    { id: 'simple', name: 'Simple List' },
    { id: 'repo', name: 'Group By Repo' },
    // { id: 'event', name: 'Group By Event' },
  ];

  return (
    <div>
      <h2 className="col-start-1 col-end-4 text-2xl font-bold">Recent {props.user} Events</h2>
      <input type="checkbox" id="exclude" onChange={handleChange} />
      <label htmlFor="exclude">Exclude events related dependencies update</label>
      <nav className="flex flex-row sm:flex-row">
        {views.map((view) => {
          return (
            <div key={view.id}>
              {selectedView == view.id ? (
                <button className="border-b-2 border-blue-500 py-4 px-6 font-medium text-blue-500 hover:text-blue-500 focus:outline-none">
                  {view.name}
                </button>
              ) : (
                <button
                  onClick={() => setSelectedView(view.id)}
                  className="py-4 px-6 text-gray-600 hover:text-blue-500 focus:outline-none"
                >
                  {view.name}
                </button>
              )}
            </div>
          );
        })}
      </nav>

      {selectedView == 'simple' && <ContributionsSimple result={apiResult}></ContributionsSimple>}
      {selectedView == 'repo' && <ContributionsByRepo result={apiResult} user={props.user}></ContributionsByRepo>}
      {/* {selectedView == 'event' && <ContributionsByEvent result={props.result}></ContributionsByEvent>} */}
    </div>
  );
};

export default Contributions;
