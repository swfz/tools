import React from 'react';
import { Commit, GitHubEvent, GitHubRepo, PushEventPayload, toHtmlUrl } from './contributions';

type Props = {
  result: any;
  user: string;
};

// commits
// repo
// pr
// issue
//
type Summary = {
  // issues: {[key: string]: string[]}
  // pullRequests: {[key: string]: string}
  commits: {
    [key: string]: {
      repo: GitHubRepo;
      data: Commit & { date: string }[];
    };
  };
  // repositories: {[key: string]: string}
};
const ContributionsByRepo = (props: Props) => {
  const summary = props.result.reduce(
    (acc: Summary, row: GitHubEvent) => {
      if (row.type === 'PushEvent') {
        const targetCommits = row.payload.commits
          .filter((c) => c.author.name === props.user)
          .map((c) => ({ ...c, date: row.created_at }));
        const commitData = [...(acc.commits[row.repo.name]?.data || []), ...targetCommits];
        const commits = { ...acc.commits, [row.repo.name]: { repo: row.repo, data: commitData } };

        return { ...acc, commits };
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

  console.log(summary);

  return (
    <>
      <div>Created Commmit</div>
      {Object.keys(summary.commits).map((repoName) => {
        return (
          <div key={repoName}>
            <details>
              <summary>
                <a
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline"
                  href={toHtmlUrl(summary.commits[repoName].repo.url)}
                >
                  {repoName}
                </a>{' '}
                {summary.commits[repoName].data.length} Commits
              </summary>
              <ul className="list-disc">
                {summary.commits[repoName].data.map((commit) => {
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
      {JSON.stringify(summary, null, '\t')}
    </>
  );
};

export default ContributionsByRepo;
