// components/Layout.js
import Nav from "@/components/Nav";
import { useSession, signIn } from "next-auth/react";
import { useState } from "react";
import { useTranslation, TranslationProvider } from "@/lib/Translation";

function Layout({ children, initialLanguage }) {
  const [showNav, setShowNav] = useState(false);

  
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
  const isArabic = language === "ar";

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
    <div
      className="bg-gray-100 min-h-screen"
      dir={isArabic ? "rtl" : "ltr"} 
    >
      {/* Mobile top bar with hamburger */}
      <div
        className={`md:hidden flex items-center p-4 ${
          isArabic ? "justify-end" : "justify-start"
        }`}
      >
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

      {/* Sidebar + main content */}
      <div className={`flex gap-4 ${isArabic ? "flex-row-reverse" : "flex-row"}`}>
        <Nav
          show={showNav}
          onClose={() => setShowNav(false)}
          language={language}
        />
        <div className="flex-1 p-4">{children}</div>
      </div>
    </div>
  );
}

export default Layout;
