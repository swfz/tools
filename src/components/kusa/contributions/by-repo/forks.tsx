import React from 'react';
import { ForkEventPayload } from '../types';

type Props = {
  forks: ForkEventPayload[];
};

const Forks = ({ forks }: Props) => {
  if (forks.length === 0) {
    return <></>;
  }

  return (
    <div className="mb-4 border-4 border-solid border-pink-400 p-2">
      <h3 className="mb-2 text-lg font-bold">Forks ({forks.length})</h3>
      <div className="grid gap-2">
        {forks.map((fork, index) => (
          <div key={index} className="rounded bg-gray-50 p-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Fork:</span>
              <a
                href={fork.forkee.html_url}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-blue-600 hover:underline"
              >
                {fork.forkee.full_name}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Forks;
