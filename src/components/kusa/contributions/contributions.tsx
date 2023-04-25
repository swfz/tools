import React, { useState, useEffect } from 'react';
import ContributionsByRepo from './contributions-by-repo';
import ContributionsByEvent from './contributions-by-event';
import ContributionsSimple from './contributions-simple';
import { Commit, GitHubEvent } from './types';

type Props = {
  result: any;
  username: string;
};

const Contributions = (props: Props) => {
  const [selectedTab, setSelectedTab] = useState<string>('simple');
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

      setApiResult(filtered);
    } else {
      setApiResult(props.result);
    }
  }, [exclude]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExclude(e.target.checked);
  };

  const tabs = [
    { name: 'simple', displayName: 'Simple List' },
    { name: 'repo', displayName: 'Group By Repo' },
    // { name: 'event', displayName: 'Group By Event' },
  ];

  return (
    <div>
      <h2 className="col-start-1 col-end-4 text-2xl font-bold">Recent {props.username} Events</h2>
      <input type="checkbox" id="exclude" onChange={handleChange} />
      <label htmlFor="exclude" className="text-xs">
        Exclude events related dependencies update
      </label>
      <nav className="flex flex-row sm:flex-row">
        {tabs.map((tab) => {
          return (
            <div key={tab.name}>
              {selectedTab == tab.name ? (
                <button className="border-b-2 border-blue-500 px-6 py-4 font-medium text-blue-500 hover:text-blue-500 focus:outline-none">
                  {tab.displayName}
                </button>
              ) : (
                <button
                  onClick={() => setSelectedTab(tab.name)}
                  className="px-6 py-4 text-gray-600 hover:text-blue-500 focus:outline-none"
                >
                  {tab.displayName}
                </button>
              )}
            </div>
          );
        })}
      </nav>

      {selectedTab == 'simple' && <ContributionsSimple result={apiResult}></ContributionsSimple>}
      {selectedTab == 'repo' && <ContributionsByRepo result={apiResult}></ContributionsByRepo>}
      {/* {selectedTab == 'event' && <ContributionsByEvent result={props.result}></ContributionsByEvent>} */}
    </div>
  );
};

export default Contributions;
