import React from 'react';
import { Summary } from '../types';
import { toHtmlUrl } from '../../../../lib/to-html-url';
import { InfoIcon, IssueClosedIcon, IssueOpenedIcon } from '@primer/octicons-react';

const Issues = ({ issues }: { issues: Summary['issues'] }) => {
  const count = Object.values(issues).reduce((acc, is) => acc + is.data.length, 0);

  return (
    <>
      <div>
        <span className="flex">
          <InfoIcon size={24} />
          <span className="text-lg font-bold">
            Opened {count} Issues in {Object.keys(issues).length} repositories
          </span>
        </span>
      </div>
      {Object.keys(issues).map((repoName) => {
        return (
          <div key={repoName}>
            <details>
              <summary className="grid grid-cols-12">
                <span className="col-start-1 col-end-11">
                  <a
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                    href={toHtmlUrl(issues[repoName].repo?.url)}
                  >
                    {repoName}
                  </a>{' '}
                  {issues[repoName].data.length} Issues
                </span>
                <span className="col-span-2 col-start-12 col-end-13 inline-flex flex-row-reverse">
                  {issues[repoName].stats.closed > 0 && (
                    <span className="inline-flex">
                      <span className="ml-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-xs font-semibold text-gray-200">
                        {issues[repoName].stats.closed}
                      </span>
                      <span className="text-xs">&nbsp;closed</span>
                    </span>
                  )}
                  {issues[repoName].stats.open > 0 && (
                    <span className="inline-flex">
                      <span className="ml-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-green-700 text-xs font-semibold text-gray-200">
                        {issues[repoName].stats.open}
                      </span>
                      <span className="text-xs">&nbsp;open</span>
                    </span>
                  )}
                </span>
              </summary>
              <ul className="list-none text-sm">
                {issues[repoName].data.map((issue) => {
                  return (
                    <li key={issue.issue.url} className="flex flex-wrap odd:bg-gray-100">
                      <span className="ml-3">
                        {issue.issue.state === 'closed' ? (
                          <span className="text-purple-800">
                            <IssueClosedIcon size={20} />
                          </span>
                        ) : (
                          <span className="text-green-800">
                            <IssueOpenedIcon size={20} />
                          </span>
                        )}
                        <a
                          target="_blank"
                          rel="noreferrer"
                          href={issue.issue.html_url}
                          className="text-blue-600 hover:underline"
                        >
                          #{issue.issue.number}
                        </a>{' '}
                        {issue.issue.title}
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

export default Issues;
