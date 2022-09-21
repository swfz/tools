import React from 'react';
import { InfoIcon, StarFillIcon } from '@primer/octicons-react';
import { toHtmlUrl, GitHubEvent } from '../contributions';

const StaredRepositories = ({ repositories }: { repositories: GitHubEvent[] }) => {
  return (
    <>
      <div>
        <span className="flex">
          <InfoIcon size={24} />
          <span className="text-lg font-bold">Stared {Object.keys(repositories).length} repositories</span>
        </span>
      </div>
      <ul>
        {repositories.map((repoEvent) => {
          return (
            <li key={repoEvent.repo.name}>
              <span className="text-yellow-500">
                <StarFillIcon size={20} />
              </span>
              <a
                target="_blank"
                rel="noreferrer"
                href={toHtmlUrl(repoEvent.repo.url)}
                className="text-blue-600 hover:underline"
              >
                {repoEvent.repo.name}
              </a>
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default StaredRepositories;
