import Head from 'next/head';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import Link from 'next/link';
import { FetchProvider, useFetch } from 'react-hooks-fetch';
import { Suspense } from 'react';

type Props = {
  user: string;
};

type PullRequestEventPayload = {
  action: string;
  number: number;
  pull_request: {
    title: string;
    url: string;
    html_url: string;
    number: number;
  };
};

type IssuesEventPayload = {
  action: string;
  number: number;
  issue: {
    title: string;
    url: string;
    html_url: string;
    number: number;
  };
};

type Commit = {
  message: string;
  sha: string;
  url: string;
};

type PushEventPayload = {
  before: string;
  head: string;
  ref: string;
  commits: Commit[];
};

type DeleteEventPayload = {
  ref: string;
  ref_type: string;
};

type CreateEventPayload = {
  ref: string;
  ref_type: string;
};

type GitHubRepo = {
  url: string;
  name: string;
};

type GitHubEventType = 'PullRequestEvent' | 'IssuesEvent' | 'PushEvent' | 'CreateEvent' | 'DeleteEvent';

type GitHubEvent = {
  id: number;
  repo: GitHubRepo;
  created_at: string;
  type: GitHubEventType;
  // FIXME: うまく解決できなかったので余裕ある時に取り組む
  payload: any;
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<Props>> => {
  if (typeof context.params?.user === 'string') {
    return {
      props: {
        user: context.params?.user,
      },
    };
  } else {
    return {
      notFound: true,
    };
  }
};

const fetchFunc = async (userId: string) => {
  const res = await fetch(`https://api.github.com/users/${userId}/events`);
  const data = await res.json();

  return data;
};

const toHtmlUrl = (url: string) => {
  return url.replace('api.github.com/repos', 'github.com');
};
const IssueEvent = ({ payload }: { payload: IssuesEventPayload }) => {
  return (
    <div>
      <span className="text-blue-600 hover:underline">
        <a href={payload.issue.html_url} target="_blank">
          #{payload.issue.number} {payload.issue.title}
        </a>
      </span>
      {payload.action}
    </div>
  );
};

const PullRequestEvent = ({ payload }: { payload: PullRequestEventPayload }) => {
  return (
    <div>
      <span className="text-blue-600 hover:underline">
        <a href={payload.pull_request.html_url} target="_blank">
          #{payload.pull_request.number} {payload.pull_request.title}
        </a>
      </span>
      {payload.action}
    </div>
  );
};

const PushEvent = ({ payload }: { payload: PushEventPayload }) => {
  return (
    <ul className="list-disc">
      {payload.commits?.map((c) => {
        return (
          <li className="ml-8">
            <a
              href={toHtmlUrl(c.url).replace('commits', 'commit')}
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              {c.sha.substring(0, 6)}
            </a>{' '}
            {c.message}
          </li>
        );
      })}
    </ul>
  );
};

const DeleteEvent = ({ payload }: { payload: DeleteEventPayload }) => {
  return (
    <div>
      {payload.ref_type}: {payload.ref} Deleted
    </div>
  );
};

const CreateEvent = ({ payload }: { payload: CreateEventPayload }) => {
  return (
    <div>
      {payload.ref_type}: {payload.ref} Created
    </div>
  );
};

const Detail = ({ user }: { user: string }) => {
  const { result, refetch } = useFetch(fetchFunc);
  // console.log(result);

  return (
    <div>
      <h2 className="font-bold">Recent {user} Events</h2>
      <div>
        {result.map((row: GitHubEvent) => {
          return (
            <div key={row.id} className="grid grid-cols-10 gap-4">
              <div className="col-start-1 col-end-1">{row.created_at.split('T')[0]}</div>
              <div className="col-start-2 col-end-3 whitespace-nowrap text-blue-600 hover:underline">
                {row.repo.url ? (
                  <a href={toHtmlUrl(row.repo.url)} target="_blank">
                    {row.repo.name}
                  </a>
                ) : (
                  <>{row.repo.name}</>
                )}
              </div>
              <div className="col-start-4 col-end-10">
                <details>
                  <summary>{row.type}</summary>
                  {row.type === 'PullRequestEvent' && <PullRequestEvent payload={row.payload}></PullRequestEvent>}
                  {row.type === 'PushEvent' && <PushEvent payload={row.payload}></PushEvent>}
                  {row.type === 'IssuesEvent' && <IssueEvent payload={row.payload}></IssueEvent>}
                  {row.type === 'DeleteEvent' && <DeleteEvent payload={row.payload}></DeleteEvent>}
                  {row.type === 'CreateEvent' && <CreateEvent payload={row.payload}></CreateEvent>}
                </details>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Kusa = (props: Props) => {
  const user = props.user;
  const imgUrl = `https://grass-graph.appspot.com/images/${user}.png`;
  const siteUrl = `https://tools.swfz.io/kusa/${user}`;
  const title = `${user}'s kusa`;
  const desc = `GitHub Contributions in ${user}`;
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
        <Link href={toGitHub}>
          <span className="text-blue-600 no-underline hover:underline cursor-pointer font-bold">{user}</span>
        </Link>
        <span>&apos;s kusa</span>
        <img src={imgUrl} alt="GitHub Contribution" />
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
