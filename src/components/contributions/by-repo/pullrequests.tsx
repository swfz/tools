import React from 'react';
import { Summary } from '../contributions-by-repo';
import { toHtmlUrl } from '../contributions';
import { GitMergeIcon, GitPullRequestClosedIcon, GitPullRequestIcon, InfoIcon } from '@primer/octicons-react';

const PullRequests = ({ pullRequests }: { pullRequests: Summary['pullRequests'] }) => {
  const totalCount = Object.values(pullRequests).reduce((acc, prs) => acc + prs.data.length, 0);

  return (
    <>
      <div>
        <span className="flex">
          <InfoIcon size={24} />
          <span className="text-lg font-bold">
            Opened {totalCount} PullRequests in {Object.keys(pullRequests).length} repositories
          </span>
        </span>
      </div>
      {Object.keys(pullRequests).map((repoName) => {
        return (
          <div key={repoName}>
            <details>
              <summary className="grid grid-cols-12">
                <span className="col-start-1 col-end-11">
                  <a
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                    href={toHtmlUrl(pullRequests[repoName].repo?.url)}
                  >
                    {repoName}
                  </a>{' '}
                  {pullRequests[repoName].data.length} PullRequests
                </span>
                <span className="col-span-2 col-start-12 col-end-13 inline-flex flex-row-reverse">
                  {pullRequests[repoName].stats.merged > 0 && (
                    <span className="inline-flex">
                      <span className="ml-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-purple-700 text-xs font-semibold text-gray-200">
                        {pullRequests[repoName].stats.merged}
                      </span>
                      <span className="text-xs">&nbsp;merged</span>
                    </span>
                  )}
                  {pullRequests[repoName].stats.open > 0 && (
                    <span className="inline-flex">
                      <span className="ml-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-green-700 text-xs font-semibold text-gray-200">
                        {pullRequests[repoName].stats.open}
                      </span>
                      <span className="text-xs">&nbsp;open</span>
                    </span>
                  )}
                </span>
              </summary>
              <ul className="list-none text-sm">
                {pullRequests[repoName].data.map((pr) => {
                  return (
                    <li key={pr.pull_request.url} className="flex flex-wrap odd:bg-gray-100">
                      <span className="sm:basis-2/12">
                        {pr.pull_request.merged ? (
                          <span className="text-purple-800">
                            <GitMergeIcon size={20} />
                          </span>
                        ) : pr.pull_request.state === 'closed' ? (
                          <span className="text-red-800">
                            <GitPullRequestClosedIcon size={20} />
                          </span>
                        ) : (
                          <span className="text-green-800">
                            <GitPullRequestIcon size={20} />
                          </span>
                        )}
                        {pr.pull_request.updated_at.split('T')[0]}
                        <a
                          target="_blank"
                          rel="noreferrer"
                          href={pr.pull_request.html_url}
                          className="text-blue-600 hover:underline"
                        >
                          {' '}
                          #{pr.number}
                        </a>
                      </span>
                      <span className="sm:basis-8/12">{pr.pull_request.title}</span>
                      <span className="content-end text-xs font-bold sm:basis-2/12 sm:text-right">
                        <span className="text-green-700">+{pr.pull_request.additions}</span>{' '}
                        <span className="text-red-700">-{pr.pull_request.deletions}</span>
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

export default PullRequests;
