import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from "next/router";
import { event as gaEvent } from '../../src/lib/gtag';

const Kusa: NextPage = () => {
  const router = useRouter();
  const { user } = router.query;
  const imgUrl = `https://grass-graph.appspot.com/images/${user}.png`;
  const siteUrl = `https://tools.swfz.io/kusa/${user}`;
  const title = `${user}'s kusa`;
  const desc = `GitHub Contirbutions in ${user}`;

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
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@swfz" />
      </Head>
      <div>
        {user}
        <img src={imgUrl} />
      </div>
    </>
  );
};

export default Kusa;
