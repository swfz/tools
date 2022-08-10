import React from 'react';
import { ShareIcon } from '../../src/components/icon';
import { Commit, GitHubEvent, GitHubRepo, PullRequestEventPayload, PushEventPayload, toHtmlUrl } from './contributions';

type Props = {
  result: any;
  user: string;
};

type CommitData = Commit & { date: string };

type Summary = {
  // issues: {[key: string]: string[]}
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
  // repositories: {[key: string]: string}
};

const Commits = ({ commits }: { commits: Summary['commits'] }) => {
  return (
    <>
      <div>Created Commmit</div>
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
      <div>Opened PullRequests in {Object.keys(pullRequests).length} repositories</div>
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
                    <li className="ml-8">
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
                        {/* <span>{pr.date.split('T')[0]}</span>{' '} */}
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
      if (row.type === 'PullRequestEvent') {
        if (acc.pullRequests[row.repo.name]?.data.find((pr) => pr.number === row.payload.number)) {
          return acc;
        } else {
          const prData = [...(acc.pullRequests[row.repo.name]?.data || []), row.payload];
          const pullRequests = { ...acc.pullRequests, [row.repo.name]: { repo: row.repo, data: prData } };

          return { ...acc, pullRequests };
        }
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
      <Commits commits={summary.commits}></Commits>
      <PullRequests pullRequests={summary.pullRequests}></PullRequests>
    </>
  );
};

export default ContributionsByRepo;
