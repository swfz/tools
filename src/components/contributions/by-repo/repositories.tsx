import React from 'react';
import { InfoIcon, RepoIcon } from '@primer/octicons-react';
import { toHtmlUrl, GitHubEvent } from '../contributions';

const Repositories = ({ repositories }: { repositories: GitHubEvent[] }) => {
  return (
    <>
      <div>
        <span className="flex">
          <InfoIcon size={24} />
          <span className="text-lg font-bold">Created {Object.keys(repositories).length} repositories</span>
        </span>
      </div>
      <ul className="text-sm">
        {repositories.map((repoEvent) => {
          return (
            <li key={repoEvent.repo.name}>
              <RepoIcon size={20} />
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

export default Repositories;
