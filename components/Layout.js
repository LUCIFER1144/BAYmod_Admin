import Nav from "@/components/Nav";
import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useTranslation, TranslationProvider } from "@/lib/Translation";
import { Setting } from "@/models/Setting";
import { mongooseConnect } from "@/lib/mongoose";

function Layout({ children, initialLanguage }) {
  const { data: session } = useSession();
  const [showNav, setShowNav] = useState(false);

  // Use the provider to make translations available to children
  return (
    <TranslationProvider initialLanguage={initialLanguage}>
      <InnerLayout showNav={showNav} setShowNav={setShowNav}>
        {children}
      </InnerLayout>
    </TranslationProvider>
  );
}

function InnerLayout({ children, showNav, setShowNav }) {
  const { data: session } = useSession();
  const { language } = useTranslation();

  if (!session) {
    return (
      <div className="bg-gray-900 w-screen h-screen flex items-center">
        <div className="text-center w-full">
          <button
            onClick={() => signIn("google")}
            className="bg-white p-2 rounded-lg"
          >
            Login with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="md:hidden flex items-center p-4">
        <button onClick={() => setShowNav(true)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>
      </div>
      <div className="flex">
        <Nav show={showNav} onClose={() => setShowNav(false)} />
        <div
          className={`flex-grow p-4 min-h-screen text-black transition-all duration-300 ${
            language === "ar" ? "text-right" : "text-left"
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
    const session = await getSession(context);

    if (!session) {
        return {
            props: {
                initialLanguage: 'en',
            },
        };
    }

    await mongooseConnect();
    const userSettings = await Setting.findOne({ userId: session.user.id });
    const initialLanguage = userSettings?.language || 'en';

    return {
        props: {
            initialLanguage,
        },
    };
}

export default Layout;