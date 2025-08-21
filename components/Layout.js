import Nav from "@/components/Nav";
import { useSession, signIn, signOut } from "next-auth/react"

export default function Layout({ children }) {
    const { data: session } = useSession()
    if (!session) {
        return (
            <div className="bg-blue-900 w-screen h-screen flex items-center justify-center">
                <div className="text-center">
                    <button 
                        onClick={() => signIn('google', { prompt: 'select_account' })} 
                        className="bg-white p-2 px-4 rounded-lg"
                    >
                        Sign in
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-blue-900 min-h-screen flex items-start p-4"> 
            <Nav />
            <div className="bg-white flex-grow rounded-lg p-4"> 
                {children}
            </div>
        </div>
    );
}
