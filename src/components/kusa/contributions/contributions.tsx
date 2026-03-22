import React, { useState, useEffect } from 'react';
import ContributionsByRepo from './contributions-by-repo';
import ContributionsByEvent from './contributions-by-event';
import ContributionsSimple from './contributions-simple';
import { GitHubEvent } from './types';
import { filterDependencyUpdateEvents } from './filter';

type Props = {
  result: any;
  username: string;
};

const Contributions = (props: Props) => {
  const [selectedTab, setSelectedTab] = useState<string>('simple');
  const [exclude, setExclude] = useState<boolean>(false);
  const [apiResult, setApiResult] = useState<GitHubEvent[]>([]);

  useEffect(() => {
    if (exclude) {
      setApiResult(filterDependencyUpdateEvents(props.result));
    } else {
      setApiResult(props.result);
    }
  }, [exclude, props.result]);

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
