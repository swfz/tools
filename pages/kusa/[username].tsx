import Head from 'next/head';
import dayjs from 'dayjs';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { useEffect } from 'react';
import { useInfiniteQuery, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Contributions from '@components/kusa/contributions/contributions';

const queryClient = new QueryClient();

type Props = {
  username: string;
  todayContributionCount: number;
  yesterdayContributionCount: number;
  currentStreak: number;
};

const fetchContribution = async (username: string, to: string): Promise<number[]> => {
  console.log(`https://forked-gh-contributions.deno.dev/${username}.json?to=${to}`);

  const res = await fetch(`https://forked-gh-contributions.deno.dev/${username}.json?to=${to}`);
  const json = await res.json();

  const contributions = json.contributions
    .flat()
    .reverse()
    .map((c: { contributionCount: number }) => c.contributionCount);

  // slice(1) because the first element is today's contribution count
  if (contributions.slice(1).every((c: number) => c !== 0)) {
    const oldestDate = dayjs(json.contributions.flat()[0].date).subtract(1, 'days').format('YYYY-MM-DD');

    return [...contributions, ...(await fetchContribution(username, oldestDate))];
  }

  return contributions;
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<Props>> => {
  const username = context.params?.username;

  if (typeof username !== 'string') {
    return { notFound: true };
  }

  const contributions = await fetchContribution(username, '');
  const [todayContributionCount, yesterdayContributionCount] = contributions;

  const currentStreak = todayContributionCount > 0 ? contributions.indexOf(0) : contributions.slice(1).indexOf(0);

  return { props: { username, todayContributionCount, yesterdayContributionCount, currentStreak } };
};

const createQueryFn = (username: string) => {
  const fetchEvents = async ({ pageParam = 1 }) => {
    const res = await fetch(`https://api.github.com/users/${username}/events?per_page=100&page=${pageParam}`);
    return res.json();
  };

  return fetchEvents;
};

const Detail = ({ username }: { username: string }) => {
  const queryClient = useQueryClient();
  const queryFn = createQueryFn(username);

  const { status, data, error, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteQuery(
    ['events'],
    queryFn,
    {
      getNextPageParam: (lastPage, allPages) => (allPages.length >= 3 ? undefined : allPages.length + 1),
    },
  );

  useEffect(() => {
    fetchNextPage();
  }, [fetchNextPage]);

  return status === 'loading' ? (
    <div>Loading...</div>
  ) : status === 'error' ? (
    <div>Eerror</div>
  ) : (
    <>
      <div className="flex justify-start sm:justify-end">
        <button
          className="basis-full rounded border border-gray-400 bg-white px-2 py-1 font-semibold text-gray-800 shadow hover:bg-gray-100 disabled:border-gray-300 disabled:bg-white disabled:text-gray-300 sm:basis-1/6"
          onClick={() => {
            fetchNextPage();
          }}
          disabled={!hasNextPage}
        >
          Load More
        </button>
      </div>

      <Contributions result={data.pages.flat()} username={username}></Contributions>
    </>
  );
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
        <div>{desc}</div>
        <QueryClientProvider client={queryClient}>
          <Detail username={username}></Detail>
        </QueryClientProvider>
      </div>
    </>
  );
};

export default Kusa;
