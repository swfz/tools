import React from 'react';
import { CommitIcon, InfoIcon } from '@primer/octicons-react';
import { Summary } from '../types';
import { toHtmlUrl } from '@lib/to-html-url';
import { iso8601DateTimeExtract } from '@lib/iso8601-date-time-extract';

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
              <ul className="list-none text-sm">
                {commits[repoName].data.map((commit) => {
                  return (
                    <li key={commit.sha} className="flex flex-wrap odd:bg-gray-100">
                      <span className="basis-full sm:basis-1/6">
                        <CommitIcon size={20} />
                        {iso8601DateTimeExtract(commit.date)}{' '}
                        <a
                          target="_blank"
                          rel="noreferrer"
                          href={toHtmlUrl(commit.url).replace('commits', 'commit')}
                          className="text-blue-600 hover:underline"
                        >
                          {commit.sha.substring(0, 6)}
                        </a>{' '}
                      </span>
                      <span className="basis-full sm:basis-5/6">{commit.message}</span>
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
