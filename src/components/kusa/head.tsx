import NextHead from 'next/head';
import { toGrassGraphImageUrl } from '../../lib/to-grass-graph-image-url';

const Head = ({ username, description }: { username: string; description: string }) => {
  const imageUrl = toGrassGraphImageUrl(username);
  const siteUrl = `https://tools.swfz.io/kusa/${username}`;
  const title = `GitHub Contributions(kusa) in ${username}`;

  return (
    <NextHead>
      <title>Kusa</title>
      <meta property="og:url" content={siteUrl} />
      <meta property="og:type" content="article" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content="swfz tools" />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content={imageUrl} />
    </NextHead>
  );
};

export default Head;
