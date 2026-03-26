import { Commit, GitHubEvent, SearchData, SearchPullRequest, SearchCommit, SearchIssue } from './types';

export const filterDependencyUpdateEvents = (events: GitHubEvent[]): GitHubEvent[] => {
  return events.filter((row) => {
    const isRenovateBranch = row.payload.ref_type === 'branch' && row.payload.ref?.startsWith('renovate');
    const isRenovatePR = row.payload.pull_request?.user?.login === 'renovate[bot]';
    const isRenovatePush =
      row.payload?.commits?.every((c: Commit) => c.message.includes('update dependency')) ||
      row.payload?.commits?.every((c: Commit) => c.message.includes('Update dependency')) ||
      row.payload?.commits?.at(-1)?.message.includes('renovate');

    const isDependabotBranch = row.payload.ref_type === 'branch' && row.payload.ref?.startsWith('dependabot');
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
};

const isDependencyUpdateTitle = (title: string): boolean => {
  const lower = title.toLowerCase();
  return (
    lower.startsWith('update dependency') ||
    lower.startsWith('chore(deps)') ||
    lower.startsWith('fix(deps)') ||
    lower.startsWith('bump ')
  );
};

const isDependencyUpdateCommitMessage = (message: string): boolean => {
  const lower = message.toLowerCase();
  return (
    lower.includes('update dependency') ||
    lower.includes('renovate') ||
    lower.includes('dependabot')
  );
};

export const filterDependencyUpdateSearchData = (searchData: SearchData): SearchData => {
  const pullRequests = searchData.pullRequests.filter((pr) => {
    const prUrl = pr.html_url.toLowerCase();
    const isRenovate = prUrl.includes('/renovate/') || isDependencyUpdateTitle(pr.title);
    const isDependabot = prUrl.includes('/dependabot/') || pr.title.toLowerCase().startsWith('bump ');
    return !isRenovate && !isDependabot;
  });

  const commits = searchData.commits.filter((c) => {
    return !isDependencyUpdateCommitMessage(c.commit.message);
  });

  return { ...searchData, pullRequests, commits };
};
