import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { getSession, useSession } from "next-auth/react";
import axios from 'axios';
import { Setting } from "@/models/Setting";
import { mongooseConnect } from "@/lib/mongoose";
import { useTranslation } from "@/lib/Translation";

function SettingsPage({ initialSettings }) {
    const { data: session } = useSession();
    const { t, setLanguage } = useTranslation();
    const [theme, setTheme] = useState(initialSettings?.theme || 'light');
    const [language, setLocalLanguage] = useState(initialSettings?.language || 'en');
    const [status, setStatus] = useState("");

    useEffect(() => {
        document.documentElement.className = theme === 'dark' ? 'dark' : '';
    }, [theme]);

    async function saveLanguage(e) {
        e.preventDefault();
        setStatus(t.savingStatus);
        try {
            await axios.put('/api/settings', { language });
            setLanguage(language);
            setStatus(t.saveSuccess);
        } catch (error) {
            console.error(t.saveError, error);
            setStatus(t.saveError);
        }
        setTimeout(() => setStatus(""), 3000);
    }

    async function saveTheme(e) {
        e.preventDefault();
        setStatus(t.savingStatus);
        try {
            await axios.put('/api/settings', { theme });
            setStatus(t.saveSuccess);
        } catch (error) {
            console.error(t.saveError, error);
            setStatus(t.saveError);
        }
        setTimeout(() => setStatus(""), 3000);
    }

    return (
        <Layout>
            <h2 className="text-2xl font-bold mb-4">{t.settingsTitle}</h2>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-lg mx-auto transition-colors duration-300">
                <form>
                    <div className="mb-6">
                        <label htmlFor="language" className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">{t.languageLabel}</label>
                        <select
                            id="language"
                            value={language}
                            onChange={(e) => setLocalLanguage(e.target.value)}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring focus:ring-purple-200"
                        >
                            <option value="en">English</option>
                            <option value="ar">Arabic</option>
                        </select>
                        <button
                            type="button"
                            onClick={saveLanguage}
                            className="mt-4 px-6 py-2 bg-purple-600 text-white font-semibold rounded-md shadow-md hover:bg-purple-700 transition-colors duration-300"
                        >
                            {t.saveLanguageButton || "Save Language"}
                        </button>
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">{t.themeLabel}</label>
                        <div className="flex space-x-4">
                            <button
                                type="button"
                                onClick={() => setTheme('light')}
                                className={`px-4 py-2 rounded-md transition-colors duration-300 ${theme === 'light' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}`}
                            >
                                {t.lightMode}
                            </button>
                            <button
                                type="button"
                                onClick={() => setTheme('dark')}
                                className={`px-4 py-2 rounded-md transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-700 text-white hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700'}`}
                            >
                                {t.darkMode}
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={saveTheme}
                            className="mt-4 px-6 py-2 bg-purple-600 text-white font-semibold rounded-md shadow-md hover:bg-purple-700 transition-colors duration-300"
                        >
                            {t.saveThemeButton || "Save Theme"}
                        </button>
                    </div>

                    {status && (
                        <div className="flex justify-end text-sm font-medium text-gray-500 dark:text-gray-400">
                            <span>{status}</span>
                        </div>
                    )}
                </form>
            </div>
        </Layout>
    );
}

export async function getServerSideProps(context) {
    const session = await getSession(context);

    if (!session || !session.user.isAdmin) {
        return {
            redirect: {
                destination: '/access-denied',
                permanent: false,
            },
        };
    }
    
    await mongooseConnect();
    const languageSetting = await Setting.findOne({ userId: session.user.id, name: 'language' });
    const themeSetting = await Setting.findOne({ userId: session.user.id, name: 'theme' });

    const initialSettings = {
        language: languageSetting?.value || 'en',
        theme: themeSetting?.value || 'light'
    };
    
    return {
        props: {
            initialSettings: JSON.parse(JSON.stringify(initialSettings)),
        },
    };
}

export default SettingsPage;
