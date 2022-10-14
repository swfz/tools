import Head from 'next/head';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { FetchProvider, useFetch } from 'react-hooks-fetch';
import { Suspense } from 'react';
import Contributions from '../../src/components/contributions/contributions';

type Props = {
  user: string;
  todayContributionCount: number;
  yesterdayContributionCount: number;
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<Props>> => {
  const user = context.params?.user;

  if (typeof user === 'string') {
    const res = await fetch(`https://github-contributions-api.deno.dev/${user}.json`);
    const json = await res.json();

    const contributions = json.contributions
      .flat()
      .reverse()
      .map((c: { contributionCount: number }) => c.contributionCount);

    const [todayContributionCount, yesterdayContributionCount] = contributions;

    return {
      props: { user, todayContributionCount, yesterdayContributionCount },
    };
  } else {
    return {
      notFound: true,
    };
  }
};

const fetchFunc = async (userId: string) => {
  const res = await fetch(`https://api.github.com/users/${userId}/events?per_page=100&page=1`);
  const data = await res.json();

  console.log(data);
  return data;
};

const Detail = ({ user }: { user: string }) => {
  const { result, refetch } = useFetch(fetchFunc);

  return <Contributions result={result} user={user}></Contributions>;
};

const Kusa = (props: Props) => {
  const user = props.user;
  const imgUrl = `https://grass-graph.appspot.com/images/${user}.png`;
  const siteUrl = `https://tools.swfz.io/kusa/${user}`;
  const title = `GitHub Contributions(kusa) in ${user}`;
  const desc = `Today: ${props.todayContributionCount}, Yesterday: ${props.yesterdayContributionCount}`;
  const toGitHub = `https://github.com/${user}`;

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
            <span className="cursor-pointer font-bold text-blue-600 no-underline hover:underline">{user}</span>
          </a>
          &apos;s kusa
        </span>

        <img src={imgUrl} alt="GitHub Contribution" />
        <span>{desc}</span>
        {/* @ts-ignore */}
        <FetchProvider initialInputs={[[fetchFunc, user]]}>
          <Suspense fallback={<span>Loading...</span>}>
            <Detail user={user}></Detail>
          </Suspense>
        </FetchProvider>
      </div>
    </>
  );
};

export default Kusa;
