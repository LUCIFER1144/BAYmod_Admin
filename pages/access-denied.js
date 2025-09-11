// pages/access-denied.js

import { getServerSession } from "next-auth"; 
import { authOptions } from "@/pages/api/auth/[...nextauth]";


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

    
    if (session.user.isAdmin) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        };
    }


    return {
        props: {
            session: JSON.parse(JSON.stringify(session)), // Pass session to component for personalized message
        },
    };
}

export default function AccessDeniedPage({ session }) {
  return (
    <>
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
    </>
  );
}
