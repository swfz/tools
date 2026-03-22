import React from 'react';
import { GitHubEvent, PushEventPayload, Summary } from './types';
import { uniqueAndSortCommits, ignoreDuplicatePullRequest, aggregateIssues } from './aggregate';

import Commits from './by-repo/commits';
import PullRequests from './by-repo/pullrequests';
import Issues from './by-repo/issues';
import Repositories from './by-repo/repositories';
import StaredRepositories from './by-repo/stared';
import Forks from './by-repo/forks';
import Comments from './by-repo/comments';

type Props = {
  result: any;
};

const ContributionsByRepo = (props: Props) => {
  const grouped = props.result.reduce(
    (acc: Summary, row: GitHubEvent) => {
      if (row.type === 'PushEvent') {
        // TODO: GitHubEventの型定義を解決すればこちらも解決する
        // BotUserのコミットはノイズになるので除外する
        const targetCommits = ((row.payload as PushEventPayload).commits ?? [])
          .filter((c) => !c.author.email.match('@users.noreply.github.com'))
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
      if (row.type === 'CreateEvent' && row.payload.ref_type === 'repository') {
        const repositories = [...acc.repositories, row];

        return { ...acc, repositories };
      }
      if (row.type === 'WatchEvent' && row.payload.action === 'started') {
        const stared = [...acc.stared, row];

        return { ...acc, stared };
      }
      if (row.type === 'ForkEvent') {
        const forks = [...acc.forks, row.payload];

        return { ...acc, forks };
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
      issues: {},
      pullRequests: {},
      commits: {},
      repositories: [],
      stared: [],
      forks: [],
      comments: {},
    },
  );

  const summary = {
    issues: aggregateIssues(grouped.issues),
    pullRequests: ignoreDuplicatePullRequest(grouped.pullRequests),
    commits: uniqueAndSortCommits(grouped.commits),
    repositories: grouped.repositories,
    stared: grouped.stared,
    forks: grouped.forks,
    comments: grouped.comments,
  };

  return (
    <>
      <Commits commits={summary.commits}></Commits>
      <PullRequests pullRequests={summary.pullRequests}></PullRequests>
      <Issues issues={summary.issues}></Issues>
      <Repositories repositories={summary.repositories}></Repositories>
      <StaredRepositories repositories={summary.stared}></StaredRepositories>
      <Forks forks={summary.forks}></Forks>
      <Comments comments={summary.comments}></Comments>
    </>
  );
};

export default ContributionsByRepo;
