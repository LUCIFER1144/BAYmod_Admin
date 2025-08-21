// pages/_app.js
import '@/styles/globals.css';
import { SessionProvider } from 'next-auth/react'; // Ensure this import is correct

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  // Ensure that the 'session' from pageProps (which comes from getServerSideProps)
  // is correctly passed to the SessionProvider.
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp; // Use the function name in export default
