import '@/styles/globals.css';
import { TranslationProvider } from "@/lib/Translation";
import { SessionProvider } from 'next-auth/react'; 
import { Analytics } from '@vercel/analytics/next';
import { mongooseConnect } from "@/lib/mongoose";

function MyApp({ Component, pageProps }) {
  const { session, initialLanguage, ...restPageProps } = pageProps;

  return (
    <SessionProvider session={session}>
      <TranslationProvider initialLanguage={initialLanguage}>
        <Component {...restPageProps} />
        <Analytics />
      </TranslationProvider>
    </SessionProvider>
  );
}

export default MyApp;
