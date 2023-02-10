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

export type CommitData = Commit & { date: string };

export type Summary = {
  commits: {
    [key: string]: {
      repo: GitHubRepo;
      data: CommitData[];
    };
  };
  pullRequests: {
    [key: string]: {
      repo: GitHubRepo;
      data: PullRequestEventPayload[];
      stats: {
        merged: number;
        open: number;
        count: number;
      };
    };
  };
  issues: {
    [key: string]: {
      repo: GitHubRepo;
      data: IssuesEventPayload[];
      stats: {
        open: number;
        closed: number;
      };
    };
  };
  repositories: CreateEventPayload[];
  stared: WatchEventPayload[];
  comments: {
    [key: string]: {
      repo: GitHubRepo;
      data: (
        | PullRequestReviewCommentEventPayload
        | IssueCommentEventPayload
        | PullRequestReviewEventPayload
        | CommitCommentEventPayload
      )[];
    };
  };
};
