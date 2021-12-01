import '../styles/tailwind.css';
import type { AppProps } from 'next/app';
import Layout from '../src/components/layout';
import { GoogleAnalytics } from '../src/components/GoogleAnalytics';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      <GoogleAnalytics />
    </>
  );
}

export default MyApp;
