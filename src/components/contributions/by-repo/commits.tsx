import React from 'react';
import { CommitIcon, InfoIcon } from '@primer/octicons-react';
import { Summary } from '../contributions-by-repo';
import { toHtmlUrl } from '../contributions';

const Commits = ({ commits }: { commits: Summary['commits'] }) => {
  const count = Object.values(commits).reduce((acc, c) => acc + c.data.length, 0);

  return (
    <>
      <div>
        <span className="flex">
          <InfoIcon size={24} />
          <span className="text-lg font-bold">
            Created {count} Commmits in {Object.keys(commits).length} repositories
          </span>
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
              <ul className="list-none">
                {commits[repoName].data.map((commit) => {
                  return (
                    <li key={commit.sha} className="[&:nth-child(odd)]:bg-gray-100">
                      <CommitIcon size={20} />
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

export default Commits;
