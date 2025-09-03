import NextAuth, { getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from '@/lib/db';
import { User } from '@/models/User';
import { mongooseConnect } from '@/lib/mongoose';

export const authOptions = {
  // Use the MongoDB adapter to connect NextAuth.js to your database
  adapter: MongoDBAdapter(clientPromise),

  // Configure authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: 'select_account'
        }
      }
    }),
  ],

  // Set a secret for signing tokens.
  secret: process.env.NEXTAUTH_SECRET,

  // Configure session management
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },

  // This is the crucial part to fix your issue.
  // We define a custom session token cookie name for the admin site
  // to prevent it from conflicting with the main client site's session.
  cookies: {
    sessionToken: {
      name: `next-auth.admin-session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },

  // Configure callbacks for advanced control over authentication flow
  callbacks: {
    async session({ session, token, user }) {
      if (user) {
        await mongooseConnect();
        const dbUser = await User.findById(user.id);
        session.user.isAdmin = dbUser?.isAdmin || false;
        session.user.id = user.id;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      return true;
    }
  },
};

// Export the NextAuth handler
export default NextAuth(authOptions);

// Helper function to protect API routes and getServerSideProps for admin-only access.
export async function isAdminRequest(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.isAdmin) {
    res.status(401).send('Unauthorized: Not an admin');
    res.end();
    throw new Error('Not an admin');
  }
}
