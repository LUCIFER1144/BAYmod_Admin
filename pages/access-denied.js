// pages/access-denied.js
import Layout from "@/components/Layout";
import { getServerSession } from "next-auth"; // For server-side session check
import { authOptions } from "@/pages/api/auth/[...nextauth]"; // Import authOptions

// This function runs on the server-side before the page component is rendered
export async function getServerSideProps(context) {
    const session = await getServerSession(context.req, context.res, authOptions);

    // Case 1: If not logged in at all, redirect to login page
    if (!session) {
        return {
            redirect: {
                destination: '/api/auth/signin', // Direct to NextAuth.js login flow
                permanent: false,
            },
        };
    }

    // Case 2: If logged in AND IS an admin, redirect them to the Dashboard
    // This prevents admins from ever seeing the "Access Denied" page.
    if (session.user.isAdmin) {
        return {
            redirect: {
                destination: '/', // Redirect admins to their Dashboard
                permanent: false,
            },
        };
    }

    // Case 3: Logged in but NOT an admin - proceed to show Access Denied message
    return {
        props: {
            session: JSON.parse(JSON.stringify(session)), // Pass session to component for personalized message
        },
    };
}

export default function AccessDeniedPage({ session }) {
  return (
    <Layout>
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto mt-10 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied!</h1>
        <p className="text-gray-600 mb-4">
          Welcome, {session?.user?.name || 'User'}!
        </p>
        <p className="text-gray-600">
          Your account does not currently have the necessary privileges to view this content or access administrative features.
        </p>
        <p className="text-sm text-gray-500 mt-4">
          Please contact an existing administrator if you believe this is an error or if you require elevated access.
          You can log out using the button in the sidebar.
        </p>
      </div>
    </Layout>
  );
}
