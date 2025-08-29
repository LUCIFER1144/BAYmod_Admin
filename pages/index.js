// pages/index.js
import Layout from "@/components/Layout";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { useSession } from "next-auth/react";

export async function getServerSideProps(context) {
    const session = await getServerSession(context.req, context.res, authOptions);

    // Case 1: Not logged in at all
    if (!session) {
        return {
            redirect: {
                destination: '/api/auth/signin', // Redirect to NextAuth.js login flow
                permanent: false,
            },
        };
    }

    // Case 2: Logged in, but NOT an admin
    if (!session.user.isAdmin) {
        return {
            redirect: {
                destination: '/access-denied', // Redirect to the custom access denied page
                permanent: false,
            },
        };
    }

    // Case 3: Logged in AND an admin - proceed to show dashboard
    return {
        props: {
            session: JSON.parse(JSON.stringify(session)), // Pass serialized session to component
        },
    };
}

export default function Dashboard() {
    const {data: session} = useSession();
    return (
        <Layout>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
            <div className="flex justify-between items-center bg-blue-100 p-4 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-blue-800">Hello, {session?.user?.name || 'Admin'}</h2>
                <div className="flex items-center gap-2">
                    {session?.user?.image && <img src={session.user.image} alt="User Avatar" className="w-10 h-10 rounded-full border-2 border-blue-500" />}
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold mb-2">Total Products</h3>
                    <p className="text-3xl">120</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold mb-2">Pending Orders</h3>
                    <p className="text-3xl">5</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold mb-2">Categories</h3>
                    <p className="text-3xl">15</p>
                </div>
            </div>
        </Layout>
    );
}
