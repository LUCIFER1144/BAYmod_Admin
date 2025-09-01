import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { getSession } from "next-auth/react";
import axios from 'axios';
import { Setting } from "@/models/Setting";
import { mongooseConnect } from "@/lib/mongoose";

function SettingsPage({ initialSettings }) {
    const [language, setLanguage] = useState(initialSettings?.language || 'en');
    const [theme, setTheme] = useState(initialSettings?.theme || 'light');
    const [status, setStatus] = useState("");

    // Apply theme on initial load and whenever it changes
    useEffect(() => {
        document.documentElement.className = theme === 'dark' ? 'dark' : '';
    }, [theme]);

    async function saveSettings(e) {
        e.preventDefault();
        setStatus("Saving...");
        try {
            await axios.put('/api/settings', { language, theme });
            setStatus("Settings saved successfully!");
        } catch (error) {
            console.error("Failed to save settings:", error);
            setStatus("Failed to save settings.");
        }
        setTimeout(() => setStatus(""), 3000);
    }

    return (
        <Layout>
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-lg mx-auto">
                <form onSubmit={saveSettings}>
                    <div className="mb-6">
                        <label htmlFor="language" className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Language</label>
                        <select
                            id="language"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-purple-200"
                        >
                            <option value="en">English</option>
                            <option value="ar">Arabic</option>
                        </select>
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Theme</label>
                        <div className="flex space-x-4">
                            <button
                                type="button"
                                onClick={() => setTheme('light')}
                                className={`px-4 py-2 rounded-md transition-colors duration-300 ${theme === 'light' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            >
                                Light Mode
                            </button>
                            <button
                                type="button"
                                onClick={() => setTheme('dark')}
                                className={`px-4 py-2 rounded-md transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-700 text-white hover:bg-gray-800'}`}
                            >
                                Dark Mode
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-md shadow-md hover:bg-purple-700 transition-colors duration-300"
                        >
                            Save Settings
                        </button>
                        {status && (
                            <span className="text-sm font-medium text-gray-500">{status}</span>
                        )}
                    </div>
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
    
    // Fetch initial settings from the API
    await mongooseConnect();
    const settings = await Setting.findOne({ userId: session.user.id }) || { language: 'en', theme: 'light' };
    
    return {
        props: {
            initialSettings: JSON.parse(JSON.stringify(settings)),
        },
    };
}

export default SettingsPage;
