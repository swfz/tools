import { Commit, GitHubEvent } from './types';

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
