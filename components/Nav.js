// components/Nav.js
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "@/lib/Translation";

export default function Nav({ show, onClose, language }) {
    const { data: session } = useSession();
    const { t } = useTranslation();
    const router = useRouter();
    const { pathname } = router;

    if (!session) return null;

    const inactiveIcon = "w-6 h-6";
    const activeIcon = inactiveIcon + " text-primary";
    const inactiveLink = "flex gap-2 items-center";
    const activeLink =
        inactiveLink +
        " text-black bg-gradient-to-r from-blue-500 to-purple-300 rounded-md";

    async function logout() {
    await router.push("/");
    await signOut("google");
    }

  // Navigation links 
    const navItems = [
        {
            href: "/",
            label: t.dashboard,
            icon: (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                />
            ),
            adminOnly: true,
        },
        {
            href: "/products",
            label: t.products,
            icon: (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
                />
            ),
            adminOnly: true,
        },
        {
            href: "/categories",
            label: t.Categories,
            icon: (
                <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
            ),
            adminOnly: true,
        },
        {
            href: "/orders",
            label: t.Orders,
            icon: (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z"
                />
            ),
            adminOnly: true,
        },
        {
            href: "/settings",
            label: t.settings,
            icon: (
            <>
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"
                />
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
            </>
            ),
            adminOnly: true,
        },
        {
            href: "/admin",
            label: t.admin,
            icon: (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 18.75V10.5m0 0a2.25 2.25 0 000-4.5H16.5m0 0a2.25 2.25 0 00-2.25 2.25V18m0 0a2.25 2.25 0 002.25 2.25H20.25a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H10.5A2.25 2.25 0 008.25 6.75v10.5m0 0a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18.75V8.25a2.25 2.25 0 012.25-2.25h1.5"
                />
            ),
            adminOnly: true,
        },
    ];

    const asideClass = `
        bg-gradient-to-r from-indigo-500 to-blue-500 text-black md:bg-none md:bg-[#fbfafd] md:text-black
        fixed top-0 h-screen w-full transition-transform duration-300 z-50
        ${language === "ar" ? (show ? "right-0 translate-x-0" : "right-0 translate-x-full") : (show ? "left-0 translate-x-0" : "left-0 -translate-x-full")}
        md:static md:w-64 md:h-auto md:translate-x-0 md:flex md:flex-col
    `;

    return (
        <aside
            className={asideClass}
        dir={language === "ar" ? "rtl" : "ltr"}
        >
            <div
                className={`p-4 h-full flex flex-col justify-between items-center transition-all duration-300 ${
                    language === "ar" ? "text-right" : "text-left"
                }`}
            >
                <div className="flex-grow w-full">
                {/* Close button (mobile only) */}
                    <button onClick={onClose} className="md:hidden">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className={`w-6 h-6 text-white absolute top-4 ${
                                language === "ar" ? "left-4" : "right-4"
                            }`}
                        >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                        </svg>
                    </button>

                {/* Logo */}
                <Link
                    href="/"
                    className="flex gap-1 mb-3 items-center w-full rounded-md text-lg md:text-center font-bold text-black"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-7"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 3.001 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 3.001 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z"
                        />
                    </svg>
                    <span>BAYmod Admin</span>
                </Link>

            {/* Menu */}
            <nav
                className={`flex flex-col gap-2 ${
                language === "ar" ? "items-end" : "items-start"
                }`}
            >
                {navItems.map(
                    (item) =>
                        (!item.adminOnly || session.user.isAdmin) && (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${
                                pathname === item.href ||
                                pathname.startsWith(item.href + "/")
                                    ? activeLink
                                    : inactiveLink
                            } w-full p-2 flex ${
                                language === "ar" ? "flex-row-reverse" : "flex-row"
                            }`}
                            onClick={onClose}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className={
                                    pathname === item.href ||
                                    pathname.startsWith(item.href + "/")
                                        ? activeIcon
                                        : inactiveIcon
                                }
                            >
                                {item.icon}
                            </svg>
                            <span>{item.label}</span>
                        </Link>
                        )
                )}

                {/* Logout button */}
                <button
                    onClick={logout}
                    className={`${inactiveLink} w-full p-2 flex ${
                        language === "ar" ? "flex-row-reverse" : "flex-row"
                    }`}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-6"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"
                        />
                    </svg>
                    <span>{t.logout}</span>
                </button>
            </nav>
        </div>
        </div>
    </aside>
    );
}
