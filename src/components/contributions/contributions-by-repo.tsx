import React from 'react';
import { CheckCircleIcon, InformationCircleIcon, ShareIcon } from '../icon';
import {
  Commit,
  GitHubEvent,
  GitHubRepo,
  IssuesEventPayload,
  PullRequestEventPayload,
  PushEventPayload,
  toHtmlUrl,
} from './contributions';

type Props = {
  result: any;
  user: string;
};

type CommitData = Commit & { date: string };

type Summary = {
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
    };
  };
  issues: {
    [key: string]: {
      repo: GitHubRepo;
      data: IssuesEventPayload[];
    };
  };
  // repositories: {[key: string]: string}
};

const Commits = ({ commits }: { commits: Summary['commits'] }) => {
  return (
    <>
      <div>
        <span className="flex">
          <InformationCircleIcon />
          <span>Created Commmit</span>
        </span>
      </div>
      {Object.keys(commits).map((repoName) => {
        return (
          <div key={repoName}>
            <details>
              <summary>
                <a
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline"
                  href={toHtmlUrl(commits[repoName].repo?.url)}
                >
                  {repoName}
                </a>{' '}
                {commits[repoName].data.length} Commits
              </summary>
              <ul className="list-disc">
                {commits[repoName].data.map((commit) => {
                  return (
                    <li key={commit.sha} className="ml-8">
                      <span>{commit.date.split('T')[0]}</span>{' '}
                      <a
                        target="_blank"
                        rel="noreferrer"
                        href={toHtmlUrl(commit.url).replace('commits', 'commit')}
                        className="text-blue-600 hover:underline"
                      >
                        {commit.sha.substring(0, 6)}
                      </a>{' '}
                      {commit.message}
                    </li>
                  );
                })}
              </ul>
            </details>
          </div>
        );
      })}
    </>
  );
};

const PullRequests = ({ pullRequests }: { pullRequests: Summary['pullRequests'] }) => {
  return (
    <>
      <div>
        <span className="flex">
          <InformationCircleIcon />
          <span>Opened PullRequests in {Object.keys(pullRequests).length} repositories</span>
        </span>
      </div>
      {Object.keys(pullRequests).map((repoName) => {
        return (
          <div key={repoName}>
            <details>
              <summary>
                <a
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline"
                  href={toHtmlUrl(pullRequests[repoName].repo?.url)}
                >
                  {repoName}
                </a>{' '}
                {pullRequests[repoName].data.length} PullRequests
              </summary>
              <ul className="list-none">
                {pullRequests[repoName].data.map((pr) => {
                  return (
                    <li key={pr.pull_request.url} className="ml-8">
                      <span className="flex items-center">
                        {pr.pull_request.state === 'closed' ? (
                          <span className="text-purple-800">
                            <ShareIcon />
                          </span>
                        ) : (
                          <span className="text-green-800">
                            <ShareIcon />
                          </span>
                        )}
                        <a
                          target="_blank"
                          rel="noreferrer"
                          href={pr.pull_request.html_url}
                          className="text-blue-600 hover:underline"
                        >
                          #{pr.number}
                        </a>{' '}
                        {pr.pull_request.title}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </details>
          </div>
        );
      })}
    </>
  );
};

const Issues = ({ issues }: { issues: Summary['issues'] }) => {
  return (
    <>
      <div>
        <span className="flex">
          <InformationCircleIcon />
          <span>Opened Issues in {Object.keys(issues).length} repositories</span>
        </span>
      </div>
      {Object.keys(issues).map((repoName) => {
        return (
          <div key={repoName}>
            <details>
              <summary>
                <a
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline"
                  href={toHtmlUrl(issues[repoName].repo?.url)}
                >
                  {repoName}
                </a>{' '}
                {issues[repoName].data.length} Issues
              </summary>
              <ul className="list-none">
                {issues[repoName].data.map((issue) => {
                  return (
                    <li key={issue.issue.url}>
                      <span className="flex items-center">
                        {issue.issue.state === 'closed' ? (
                          <span className="text-purple-800">
                            <CheckCircleIcon />
                          </span>
                        ) : (
                          <span className="text-green-800">
                            <CheckCircleIcon />
                          </span>
                        )}
                        <a
                          target="_blank"
                          rel="noreferrer"
                          href={issue.issue.html_url}
                          className="text-blue-600 hover:underline"
                        >
                          #{issue.issue.number}
                        </a>{' '}
                        {issue.issue.title}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </details>
          </div>
        );
      })}
    </>
  );
};

const uniqueAndSortCommits = (commits: Summary['commits']): Summary['commits'] => {
  const uniqByShaAndLatest = (cs: CommitData[]): CommitData[] => {
    const commitMap = cs
      .sort((a, b) => (a.date > b.date ? 1 : -1))
      .reduce((acc, commit) => {
        acc.set(commit.sha, commit);

        return acc;
      }, new Map<string, CommitData>());

    return Array.from(commitMap.values());
  };

  return Object.entries(commits).reduce((acc, [repoName, commitsByRepo]) => {
    const uniqueCommits = uniqByShaAndLatest(commitsByRepo.data);

    return { ...acc, [repoName]: { ...commitsByRepo, data: uniqueCommits.reverse() } };
  }, {} as Summary['commits']);
};

const ignoreDuplicatePullRequest = (pullRequests: Summary['pullRequests']): Summary['pullRequests'] => {
  const uniqByNumberAndLatest = (pullRequests: PullRequestEventPayload[]): PullRequestEventPayload[] => {
    const prMap = pullRequests
      .sort((a, b) => (a.pull_request.updated_at > b.pull_request.updated_at ? 1 : -1))
      .reduce((acc, pr) => {
        acc.set(pr.pull_request.number, pr);

        return acc;
      }, new Map<number, PullRequestEventPayload>());

    return Array.from(prMap.values());
  };

  return Object.entries(pullRequests).reduce((acc, [repoName, prsByRepo]) => {
    const filteredPrs = uniqByNumberAndLatest(prsByRepo.data);

    return { ...acc, [repoName]: { ...prsByRepo, data: filteredPrs } };
  }, {} as Summary['pullRequests']);
};

const ignoreDuplicateIssue = (issues: Summary['issues']): Summary['issues'] => {
  const uniqByNumberAndLatest = (issues: IssuesEventPayload[]): IssuesEventPayload[] => {
    const issueMap = issues
      .sort((a, b) => (a.issue.updated_at > b.issue.updated_at ? 1 : -1))
      .reduce((acc, issue) => {
        acc.set(issue.number, issue);

        return acc;
      }, new Map<number, IssuesEventPayload>());

    return Array.from(issueMap.values());
  };

  return Object.entries(issues).reduce((acc, [repoName, issuesByRepo]) => {
    const filteredIssues = uniqByNumberAndLatest(issuesByRepo.data);

    return { ...acc, [repoName]: { ...issuesByRepo, data: filteredIssues } };
  }, {} as Summary['issues']);
};

const ContributionsByRepo = (props: Props) => {
  const grouped = props.result.reduce(
    (acc: Summary, row: GitHubEvent) => {
      if (row.type === 'PushEvent') {
        // TODO: GitHubEventの型定義を解決すればこちらも解決する
        const targetCommits = (row.payload as PushEventPayload).commits
          .filter((c) => c.author.name === props.user)
          .map((c) => ({ ...c, date: row.created_at }));
        const commitData = [...(acc.commits[row.repo.name]?.data || []), ...targetCommits];
        const commits = { ...acc.commits, [row.repo.name]: { repo: row.repo, data: commitData } };

        return { ...acc, commits };
      }
      if (row.type === 'PullRequestEvent') {
        const prPayloads = [...(acc.pullRequests[row.repo.name]?.data || []), row.payload];
        const pullRequests = { ...acc.pullRequests, [row.repo.name]: { repo: row.repo, data: prPayloads } };

        return { ...acc, pullRequests };
      }
      if (row.type === 'IssuesEvent') {
        const issuesPayloads = [...(acc.issues[row.repo.name]?.data || []), row.payload];
        const issues = { ...acc.issues, [row.repo.name]: { repo: row.repo, data: issuesPayloads } };

        return { ...acc, issues };
      }
      return acc;
    },
    {
      issues: {},
      pullRequests: {},
      commits: {},
      repositories: {},
    },
  );

  const summary = {
    issues: ignoreDuplicateIssue(grouped.issues),
    pullRequests: ignoreDuplicatePullRequest(grouped.pullRequests),
    commits: uniqueAndSortCommits(grouped.commits),
    repositories: grouped.repositories,
  };

  return (
    <>
      <Commits commits={summary.commits}></Commits>
      <PullRequests pullRequests={summary.pullRequests}></PullRequests>
      <Issues issues={summary.issues}></Issues>
    </>
  );
};

export default ContributionsByRepo;
