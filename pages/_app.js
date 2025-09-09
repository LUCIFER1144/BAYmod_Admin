// pages/_app.js
import '@/styles/globals.css';
import { TranslationProvider } from "@/lib/Translation";
import { SessionProvider } from 'next-auth/react'; // Ensure this import is correct
import { Analytics } from '@vercel/analytics/next';

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  // Ensure that the 'session' from pageProps (which comes from getServerSideProps)
  // is correctly passed to the SessionProvider.
  const initialLanguage = pageProps.initialLanguage || 'en';
  return (
    <SessionProvider session={session}>
      <TranslationProvider initialLanguage={initialLanguage}>
        <Component {...pageProps} />
        <Analytics />
      </TranslationProvider>
    </SessionProvider>
  );
}

export default MyApp; // Use the function name in export default
