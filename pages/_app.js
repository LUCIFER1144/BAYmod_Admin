import '@/styles/globals.css';
import { TranslationProvider } from "@/lib/Translation";
import { SessionProvider, getSession } from 'next-auth/react'; 
import { Analytics } from '@vercel/analytics/next';
import { mongooseConnect } from "@/lib/mongoose";
import Layout from '@/components/Layout';
import { Setting } from '@/models/Setting';

function MyApp({ Component, pageProps: { session, initialLanguage, ...pageProps } }) {


  return (
    <SessionProvider session={session}>
      <TranslationProvider initialLanguage={initialLanguage || "en"}>
        <Layout session={session} initialLanguage={initialLanguage || "en"}>
          <Component {...pageProps} />
          <Analytics />
        </Layout>
      </TranslationProvider>
    </SessionProvider>
  );
}
MyApp.getInitialProps = async ({ Component, ctx }) => {
  const session = await getSession(ctx);
  let pageProps = {};

  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(ctx);
  }

  let initialLanguage = "en";
  if (session) {
    await mongooseConnect();
    const languageSetting = await Setting.findOne({ userId: session.user.id, name: "language" });
    initialLanguage = languageSetting?.value || "en";
  }

  return { pageProps: { ...pageProps, initialLanguage, session } };
};
export default MyApp;
