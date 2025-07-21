import { SessionProvider } from "next-auth/react";
import { AppProps } from "next/app";
import Head from 'next/head';



const App = ({ Component, pageProps }: AppProps) => {
  return (
    <SessionProvider session={pageProps.session}>
      <Head>
        <link rel="icon" type="image/x-icon" href="favicon.ico"/>
        <title>osu! br rhythms</title>
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
        />
        <link rel="stylesheet" href="/nstyle.css" />
      </Head>
      <Component {...pageProps} />
    </SessionProvider>
  );
};

export default App;