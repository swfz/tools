import Head from 'next/head';
import type { NextPage } from 'next';

const Sample: NextPage = () => {
  return (
    <>
      <Head>
        <title>Hello world</title>
        <meta property="og:url" content="/sample" />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="Sampele OG" />
        <meta property="og:description" content="Sample OG" />
        <meta property="og:site_name" content="swfz tools" />
        <meta property="og:image" content="/api/og" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="/api/og" />
      </Head>
      <div>Sample</div>
    </>
  );
};

export default Sample;
