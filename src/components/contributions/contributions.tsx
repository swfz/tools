import React, { useState, useEffect } from 'react';
import ContributionsByRepo from './contributions-by-repo';
import ContributionsByEvent from './contributions-by-event';
import ContributionsSimple from './contributions-simple';
import { Commit, GitHubEvent } from './types';

export const toHtmlUrl = (url: string) => {
  return url.replace('api.github.com/repos', 'github.com');
};

type Props = {
  result: any;
  user: string;
};

const Contributions = (props: Props) => {
  const [selectedView, setSelectedView] = useState<string>('simple');
  const [exclude, setExclude] = useState<boolean>(false);
  const [apiResult, setApiResult] = useState([]);

  useEffect(() => {
    if (exclude) {
      const filtered = props.result.filter((row: GitHubEvent) => {
        const isRenovateBranch = row.payload.ref_type === 'branch' && row.payload.ref.startsWith('renovate');
        const isRenovatePR = row.payload.pull_request?.user?.login === 'renovate[bot]';
        const isRenovatePush =
          row.payload?.commits?.every((c: Commit) => c.message.includes('update dependency')) ||
          row.payload?.commits?.every((c: Commit) => c.message.includes('Update dependency')) ||
          row.payload?.commits?.at(-1).message.includes('renovate');

        const isDependabotBranch = row.payload.ref_type === 'branch' && row.payload.ref.startsWith('dependabot');
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
      console.log('filtered', filtered);

      setApiResult(filtered);
    } else {
      setApiResult(props.result);
    }
  }, [exclude]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExclude(e.target.checked);
  };

  const views = [
    { id: 'simple', name: 'Simple List' },
    { id: 'repo', name: 'Group By Repo' },
    // { id: 'event', name: 'Group By Event' },
  ];

  return (
    <div>
      <h2 className="col-start-1 col-end-4 text-2xl font-bold">Recent {props.user} Events</h2>
      <input type="checkbox" id="exclude" onChange={handleChange} />
      <label htmlFor="exclude" className="text-xs">
        Exclude events related dependencies update
      </label>
      <nav className="flex flex-row sm:flex-row">
        {views.map((view) => {
          return (
            <div key={view.id}>
              {selectedView == view.id ? (
                <button className="border-b-2 border-blue-500 py-4 px-6 font-medium text-blue-500 hover:text-blue-500 focus:outline-none">
                  {view.name}
                </button>
              ) : (
                <button
                  onClick={() => setSelectedView(view.id)}
                  className="py-4 px-6 text-gray-600 hover:text-blue-500 focus:outline-none"
                >
                  {view.name}
                </button>
              )}
            </div>
          );
        })}
      </nav>

      {selectedView == 'simple' && <ContributionsSimple result={apiResult}></ContributionsSimple>}
      {selectedView == 'repo' && <ContributionsByRepo result={apiResult} user={props.user}></ContributionsByRepo>}
      {/* {selectedView == 'event' && <ContributionsByEvent result={props.result}></ContributionsByEvent>} */}
    </div>
  );
};

export default Contributions;
