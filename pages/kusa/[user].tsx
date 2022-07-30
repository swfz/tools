import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import Link from 'next/link';

type Props = {
  user: string;
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

const Kusa = (props: Props) => {
  const router = useRouter();
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
      </div>
    </>
  );
};

export default Kusa;
