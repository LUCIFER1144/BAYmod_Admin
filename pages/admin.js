// pages/admin.js
import Layout from "@/components/Layout";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "@/components/Spinner";
import { Setting } from "@/models/Setting";
import { useTranslation } from "@/lib/Translation";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import { mongooseConnect } from "@/lib/mongoose"; 

export async function getServerSideProps(context) {
    const session = await getServerSession(context.req, context.res, authOptions);

    if (!session) {
        return {
            redirect: {
                destination: '/api/auth/signin',
                permanent: false,
            },
        };
    }

    if (!session.user.isAdmin) {
        return {
            redirect: {
                destination: '/access-denied',
                permanent: false,
            },
        };
    }

    await mongooseConnect();
    
    // Fetch the user's language setting
    const languageSetting = await Setting.findOne({ userId: session.user.id, name: 'language' });
    const initialLanguage = languageSetting?.value || 'en';
    return {
        props: {
            session: JSON.parse(JSON.stringify(session)),
            initialLanguage, // Pass the fetched language to the component
            
        },
    };
}
export default function AdminPage({initialLanguage}) {
    const { data: session, status } = useSession();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const {t} = useTranslation();
    


    useEffect(() => {
        if (status === 'loading') return;

        if (!session || !session.user.isAdmin) {
            setLoading(false);
            setError("You do not have administrative access to this page.");
            return;
        }

        fetchUsers();
    }, [session, status]);

    async function fetchUsers() {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('/api/admin/users');
            setUsers(response.data);
        } catch (err) {
            console.error("Failed to fetch users:", err);
            setError(err.response?.data?.message || "Failed to load users. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    async function toggleAdminStatus(userId, currentStatus) {
        // Prevent changing own admin status
        if (session.user.id === userId) {
            setError("You cannot change your own admin status.");
            return;
        }

        try {
            await axios.put('/api/admin/users', { id: userId, isAdmin: !currentStatus });
            fetchUsers();
        } catch (err) {
            console.error("Failed to toggle admin status:", err);
            setError(err.response?.data?.message || "Failed to update admin status. Please try again.");
        }
    }

    async function deleteUser(userId, userEmail) {
        // Confirmation before deletion
        if (window.confirm(`Are you sure you want to delete the user "${userEmail}"? This action cannot be undone.`)) {
            // Prevent deleting the currently logged-in admin
            if (session.user.id === userId) {
                setError("You cannot delete your own user account while logged in.");
                return;
            }

            try {
                // Call the DELETE API endpoint with the user's ID
                await axios.delete(`/api/admin/users?id=${userId}`);
                fetchUsers(); // Re-fetch users to update the list
            } catch (err) {
                console.error("Failed to delete user:", err);
                setError(err.response?.data?.message || "Failed to delete user. Please try again.");
            }
        }
    }

    if (status === 'loading' || loading) {
        return (
            <Layout initialLanguage={initialLanguage}>
                <div className="flex justify-center items-center min-h-screen">
                    <Spinner />
                </div>
            </Layout>
        );
    }

    if (!session || !session.user.isAdmin) {
        return (
            <Layout initialLanguage={initialLanguage}>
                <div className="text-center text-red-500 mt-8">
                    {error || "Access Denied: You must be an administrator to view this page."}
                </div>
            </Layout>
        );
    }

    return (
        <Layout initialLanguage={initialLanguage}>
            <h1>{t.ManageAdminAccounts}</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            <table className="basic mt-4">
                <thead>
                    <tr>
                        <td>{t.Name}</td>
                        <td>{t.Email}</td>
                        <td>{t.AdminStatus}</td>
                        <td>{t.Actions}</td>
                    </tr>
                </thead>
                <tbody>
                    {users.length === 0 ? (
                        <tr>
                            <td colSpan="4" className="text-center py-4 text-gray-500">{t.NoUsersFound}</td>
                        </tr>
                    ) : (
                        users.map(user => (
                            <tr key={user._id}>
                                <td>{user.name || 'N/A'}</td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.isAdmin ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                        {user.isAdmin ? 'Admin' : 'User'}
                                    </span>
                                </td>
                                <td className="flex gap-1"> {/* Adjusted to flex for button alignment */}
                                    {/* Make Admin/Revoke Admin button */}
                                    {session.user.id !== user._id ? ( 
                                        <button 
                                            onClick={() => toggleAdminStatus(user._id, user.isAdmin)}
                                            className={user.isAdmin ? "btn-red px-2 py-1 text-sm" : "btn-default px-2 py-1 text-sm"}
                                        >
                                            {user.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                                        </button>
                                    ) : (
                                        <span className="text-gray-500 text-sm py-1 px-2">{t.CannotChangeSelfStatus}</span>
                                    )}
                                    
                                    {/* Delete User button */}
                                    {session.user.id !== user._id && ( // Prevent deleting self
                                        <button 
                                            onClick={() => deleteUser(user._id, user.email)}
                                            className="btn-red px-2 py-1 text-sm"
                                        >
                                            {t.Delete}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </Layout>
    );
}
