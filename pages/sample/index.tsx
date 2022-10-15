import Head from 'next/head'
import type { NextPage } from 'next';


const Sample: NextPage = () => {
  return (
    <>
    <Head>
      <title>Hello world</title>
      <meta
        key="og:image"
        property="og:image"
        content="/api/og"
      />
    </Head>
    <div>
      Sample
    </div>
    </>

  )
}

export default Sample;