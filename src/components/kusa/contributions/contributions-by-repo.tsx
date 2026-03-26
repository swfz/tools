import React from 'react';
import { GitHubEvent, SearchData, Summary } from './types';
import { uniqueAndSortCommits, ignoreDuplicatePullRequest, aggregateIssues } from './aggregate';

import Commits from './by-repo/commits';
import PullRequests from './by-repo/pullrequests';
import Issues from './by-repo/issues';
import Repositories from './by-repo/repositories';
import StaredRepositories from './by-repo/stared';
import Forks from './by-repo/forks';
import Comments from './by-repo/comments';

type Props = {
  events: GitHubEvent[];
  searchData: SearchData;
};

const repoNameFromUrl = (repositoryUrl: string): string => {
  // "https://api.github.com/repos/swfz/tools" -> "swfz/tools"
  return repositoryUrl.replace('https://api.github.com/repos/', '');
};

const ContributionsByRepo = (props: Props) => {
  // Search APIデータからPR/Commit/Issueを構築
  const searchCommits: Summary['commits'] = {};
  for (const c of props.searchData.commits) {
    const repoName = c.repository.full_name;
    if (!searchCommits[repoName]) {
      searchCommits[repoName] = {
        repo: { name: repoName, url: `https://api.github.com/repos/${repoName}` },
        data: [],
      };
    }
    searchCommits[repoName].data.push({
      sha: c.sha,
      message: c.commit.message,
      url: `https://api.github.com/repos/${repoName}/commits/${c.sha}`,
      author: { name: c.commit.author.name, email: c.commit.author.email },
      date: c.commit.author.date,
    });
  }

  const searchPullRequests: Summary['pullRequests'] = {};
  for (const pr of props.searchData.pullRequests) {
    const repoName = repoNameFromUrl(pr.repository_url);
    if (!searchPullRequests[repoName]) {
      searchPullRequests[repoName] = {
        repo: { name: repoName, url: pr.repository_url },
        data: [],
        stats: { count: 0, merged: 0, open: 0 },
      };
    }
    const merged = pr.pull_request.merged_at !== null;
    searchPullRequests[repoName].data.push({
      action: merged ? 'merged' : pr.state === 'closed' ? 'closed' : 'opened',
      number: pr.number,
      pull_request: {
        title: pr.title,
        url: pr.pull_request.url,
        html_url: pr.html_url,
        number: pr.number,
        state: pr.state,
        updated_at: pr.updated_at,
        additions: 0,
        deletions: 0,
        merged,
      },
    });
  }

  const searchIssues: Summary['issues'] = {};
  for (const issue of props.searchData.issues) {
    const repoName = repoNameFromUrl(issue.repository_url);
    if (!searchIssues[repoName]) {
      searchIssues[repoName] = {
        repo: { name: repoName, url: issue.repository_url },
        data: [],
        stats: { open: 0, closed: 0 },
      };
    }
    searchIssues[repoName].data.push({
      action: issue.state === 'closed' ? 'closed' : 'opened',
      number: issue.number,
      issue: {
        title: issue.title,
        url: `https://api.github.com/repos/${repoName}/issues/${issue.number}`,
        html_url: issue.html_url,
        number: issue.number,
        state: issue.state as 'open' | 'closed',
        updated_at: issue.updated_at,
      },
    });
  }

  // Events APIデータからStar/Fork/Create/Delete/Commentsを構築
  const eventsGrouped = props.events.reduce(
    (acc, row: GitHubEvent) => {
      if (row.type === 'CreateEvent' && row.payload.ref_type === 'repository') {
        return { ...acc, repositories: [...acc.repositories, row] };
      }
      if (row.type === 'WatchEvent' && row.payload.action === 'started') {
        return { ...acc, stared: [...acc.stared, row] };
      }
      if (row.type === 'ForkEvent') {
        return { ...acc, forks: [...acc.forks, row.payload] };
      }
      if (
        ['IssueCommentEvent', 'PullRequestReviewCommentEvent', 'PullRequestReviewEvent', 'CommitCommentEvent'].includes(
          row.type,
        )
      ) {
        const commentsPayloads = [...(acc.comments[row.repo.name]?.data || []), row.payload];
        const comments = {
          ...acc.comments,
          [row.repo.name]: { repo: row.repo, data: commentsPayloads },
        };
        return { ...acc, comments };
      }
      return acc;
    },
    {
      repositories: [] as GitHubEvent[],
      stared: [] as GitHubEvent[],
      forks: [] as any[],
      comments: {} as Summary['comments'],
    },
  );

  const summary = {
    issues: aggregateIssues(searchIssues),
    pullRequests: ignoreDuplicatePullRequest(searchPullRequests),
    commits: uniqueAndSortCommits(searchCommits),
    repositories: eventsGrouped.repositories,
    stared: eventsGrouped.stared,
    forks: eventsGrouped.forks,
    comments: eventsGrouped.comments,
  };

  return (
    <>
      <Commits commits={summary.commits} />
      <PullRequests pullRequests={summary.pullRequests} />
      <Issues issues={summary.issues} />
      <Repositories repositories={summary.repositories} />
      <StaredRepositories repositories={summary.stared} />
      <Forks forks={summary.forks} />
      <Comments comments={summary.comments} />
    </>
  );
};

export default ContributionsByRepo;
