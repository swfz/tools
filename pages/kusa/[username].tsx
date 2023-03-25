import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { FetchProvider, useFetch } from 'react-hooks-fetch';
import { Suspense } from 'react';
import Head from '../../src/components/kusa/head';
import Title from '../../src/components/kusa/title';
import Contributions from '../../src/components/kusa/contributions/contributions';
import { toGrassGraphImageUrl } from '../../src/lib/to-grass-graph-image-url';

type Props = {
  username: string;
  description: string;
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<Props>> => {
  const username = context.params?.username;

  if (typeof username !== 'string') {
    return { notFound: true };
  }

  const res = await fetch(`https://github-contributions-api.deno.dev/${username}.json`);
  const json = await res.json();

  const contributions = json.contributions
    .flat()
    .reverse()
    .map((c: { contributionCount: number }) => c.contributionCount);

  const [todayContributionCount, yesterdayContributionCount] = contributions;
  const currentStreak = todayContributionCount > 0 ? contributions.indexOf(0) : contributions.slice(1).indexOf(0);
  const description = `Today: ${todayContributionCount}, Yesterday: ${yesterdayContributionCount}, Streak: ${currentStreak}`;

  return { props: { username, description } };
};

const fetchFunc = async (username: string) => {
  const res = await fetch(`https://api.github.com/users/${username}/events?per_page=100&page=1`);
  const data = await res.json();

  return data;
};

const Detail = ({ username }: { username: string }) => {
  const { result, refetch } = useFetch(fetchFunc);

  return <Contributions result={result} username={username}></Contributions>;
};

const Kusa = (props: Props) => {
  const username = props.username;

  return (
    <>
      <Head username={username} description={props.description} />
      <div>
        <Title username={username} />

        <img src={toGrassGraphImageUrl(username)} alt="GitHub Contribution" />
        <span>{props.description}</span>
        {/* @ts-ignore */}
        <FetchProvider initialInputs={[[fetchFunc, username]]}>
          <Suspense fallback={<span>Loading...</span>}>
            <Detail username={username}></Detail>
          </Suspense>
        </FetchProvider>
      </div>
    </>
  );
};

export default Kusa;
