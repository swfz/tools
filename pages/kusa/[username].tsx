import Head from 'next/head';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { FetchProvider, useFetch } from 'react-hooks-fetch';
import { Suspense } from 'react';
import Contributions from '../../src/components/contributions/contributions';

type Props = {
  username: string;
  todayContributionCount: number;
  yesterdayContributionCount: number;
  currentStreak: number;
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

  return { props: { username, todayContributionCount, yesterdayContributionCount, currentStreak } };
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
  const imgUrl = `https://grass-graph.appspot.com/images/${username}.png?${Date.now()}`;
  const siteUrl = `https://tools.swfz.io/kusa/${username}`;
  const title = `GitHub Contributions(kusa) in ${username}`;
  const desc = `Today: ${props.todayContributionCount}, Yesterday: ${props.yesterdayContributionCount}, Streak: ${props.currentStreak}`;
  const toGitHub = `https://github.com/${username}`;

  return (
    <>
      <Head>
        <title>Kusa</title>
        <meta property="og:url" content={siteUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:site_name" content="swfz tools" />
        <meta property="og:image" content={imgUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={imgUrl} />
      </Head>
      <div>
        <span className="text-4xl font-bold">
          <a href={toGitHub} target="_blank" rel="noreferrer">
            <span className="cursor-pointer font-bold text-blue-600 no-underline hover:underline">{username}</span>
          </a>
          &apos;s kusa
        </span>

        <img src={imgUrl} alt="GitHub Contribution" />
        <span>{desc}</span>
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
