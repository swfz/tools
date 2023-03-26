import '../styles/tailwind.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Layout from '@components/layout';
import { GoogleAnalytics } from '@components/GoogleAnalytics';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      <Head>
        <meta name="theme-color" content="#c71585" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/manifest-icon-192.maskable.png" />
      </Head>
      <GoogleAnalytics />
    </>
  );
}

export default MyApp;
