import React from 'react';
import { useState } from 'react';
import ContributionsByRepo from './contributions-by-repo';
import ContributionsByEvent from './contributions-by-event';
import ContributionsSimple from './contributions-simple';

export type PullRequestEventPayload = {
  action: string;
  number: number;
  pull_request: {
    title: string;
    url: string;
    html_url: string;
    number: number;
  };
};

export type IssuesEventPayload = {
  action: string;
  number: number;
  issue: {
    title: string;
    url: string;
    html_url: string;
    number: number;
  };
};

export type Commit = {
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

export type ForkEventPayload = {
  forkee: {
    url: string;
    html_url: string;
    name: string;
    full_name: string;
  };
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
  | 'ForkEvent';

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
  const views = [
    { id: 'simple', name: 'Simple List' },
    { id: 'repo', name: 'Group By Repo' },
    { id: 'event', name: 'Group By Event' },
  ];

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

      {selectedView == 'simple' && <ContributionsSimple result={props.result}></ContributionsSimple>}
      {selectedView == 'repo' && <ContributionsByRepo result={props.result} user={props.user}></ContributionsByRepo>}
      {selectedView == 'event' && <ContributionsByEvent result={props.result}></ContributionsByEvent>}
    </div>
  );
};

export default Contributions;
