import { CommitData, IssuesEventPayload, PullRequestEventPayload, Summary } from './types';

export const uniqueAndSortCommits = (commits: Summary['commits']): Summary['commits'] => {
  const uniqByShaAndLatest = (cs: CommitData[]): CommitData[] => {
    const commitMap = cs
      .sort((a, b) => (a.date > b.date ? 1 : -1))
      .reduce((acc, commit) => {
        acc.set(commit.sha, commit);

        return acc;
      }, new Map<string, CommitData>());

    return Array.from(commitMap.values());
  };

  return Object.entries(commits).reduce(
    (acc, [repoName, commitsByRepo]) => {
      const uniqueCommits = uniqByShaAndLatest(commitsByRepo.data);

      return { ...acc, [repoName]: { ...commitsByRepo, data: uniqueCommits.reverse() } };
    },
    {} as Summary['commits'],
  );
};

export const ignoreDuplicatePullRequest = (pullRequests: Summary['pullRequests']): Summary['pullRequests'] => {
  const uniqByNumberAndLatest = (pullRequests: PullRequestEventPayload[]): PullRequestEventPayload[] => {
    const prMap = pullRequests
      .sort((a, b) => (a.pull_request.updated_at > b.pull_request.updated_at ? 1 : -1))
      .reduce((acc, pr) => {
        if (!(pr.pull_request.state === 'closed' && !pr.pull_request.merged)) {
          acc.set(pr.pull_request.number, pr);
        }

        return acc;
      }, new Map<number, PullRequestEventPayload>());

    return Array.from(prMap.values());
  };

  return Object.entries(pullRequests).reduce(
    (acc, [repoName, prsByRepo]) => {
      const filteredPrs = uniqByNumberAndLatest(prsByRepo.data);
      const count = filteredPrs.length;
      const merged = filteredPrs.reduce((acc, pr) => acc + (pr.pull_request.merged ? 1 : 0), 0);
      const open = count - merged;

      return { ...acc, [repoName]: { ...prsByRepo, data: filteredPrs.reverse(), stats: { count, merged, open } } };
    },
    {} as Summary['pullRequests'],
  );
};

export const aggregateIssues = (issues: Summary['issues']): Summary['issues'] => {
  const uniqByNumberAndLatest = (issues: IssuesEventPayload[]): IssuesEventPayload[] => {
    const issueMap = issues
      .sort((a, b) => (a.issue.updated_at > b.issue.updated_at ? 1 : -1))
      .reduce((acc, issue) => {
        acc.set(issue.issue.number, issue);

        return acc;
      }, new Map<number, IssuesEventPayload>());

    return Array.from(issueMap.values());
  };

  return Object.entries(issues).reduce(
    (acc, [repoName, issuesByRepo]) => {
      const filteredIssues = uniqByNumberAndLatest(issuesByRepo.data);

      const closed = filteredIssues.filter((i) => i.issue.state === 'closed').length;
      const open = filteredIssues.filter((i) => i.issue.state === 'open').length;

      return { ...acc, [repoName]: { ...issuesByRepo, data: filteredIssues, stats: { closed, open } } };
    },
    {} as Summary['issues'],
  );
};
