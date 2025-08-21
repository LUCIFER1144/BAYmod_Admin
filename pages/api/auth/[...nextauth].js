import NextAuth, { getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from '@/lib/db'; // Ensure this path is correct for your MongoDB client
import { User } from '@/models/User'; // Ensure this path is correct for your User model
import { mongooseConnect } from '@/lib/mongoose'; // Ensure this path is correct for your Mongoose connection utility

export const authOptions = {
  // Use the MongoDB adapter to connect NextAuth.js to your database
  adapter: MongoDBAdapter(clientPromise),
  
  // Configure authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,      // Google Client ID from environment variables
      clientSecret: process.env.GOOGLE_SECRET, // Google Client Secret from environment variables
      authorization: {
        params: {
          prompt: 'select_account' // Forces Google to always show account selection
        }
      }
    }),
  ],
  
  // Set a secret for signing tokens. Use a strong, random string in production.
  secret: process.env.NEXTAUTH_SECRET,
  
  // Configure session management
  session: {
    strategy: 'database', // Use database strategy to store sessions in MongoDB
    maxAge: 30 * 24 * 60 * 60, // Session active for 30 days (max)
    updateAge: 24 * 60 * 60, // Session will be updated/renewed every 24 hours if active
  },
  
  // Configure callbacks for advanced control over authentication flow
  callbacks: {
    // This callback controls what data is exposed in the client-side session.
    // It's crucial for adding the 'isAdmin' flag from the database.
    async session({ session, token, user }) {
      // 'user' object comes from the database adapter (MongoDBAdapter)
      if (user) {
        // Ensure Mongoose is connected before querying the User model
        await mongooseConnect();
        
        // Fetch the user document from the database using your custom User model
        // This ensures we get the most up-to-date 'isAdmin' status.
        const dbUser = await User.findById(user.id);
        
        // Add the 'isAdmin' property to the session user object.
        // If 'dbUser' is null (shouldn't happen here if 'user' exists from adapter)
        // or if 'isAdmin' is not set, default to false.
        session.user.isAdmin = dbUser?.isAdmin || false; 
        
        // Also add the user's database ID to the session for convenience (e.g., in /admin page)
        session.user.id = user.id; 
      }
      return session;
    },

    // This callback is a gatekeeper for the sign-in process.
    // It determines whether a user is allowed to complete the login after OAuth authentication.
    async signIn({ user, account, profile }) {
      // In this setup, we allow ALL users to sign in.
      // Access control (admin vs. non-admin) is handled AFTER login,
      // by checking session.user.isAdmin on specific pages and API routes.
      // This allows new users to be created in the database and then manually promoted to admin.
      return true; 
    }
  },
  
  // No 'allowDangerousEmailAccountLinking: true' needed, as it's typically for development
  // and your issue was resolved by clearing database/browser data.
};

// Export the NextAuth handler
export default NextAuth(authOptions);

// Helper function to protect API routes and getServerSideProps for admin-only access.
// It checks the server-side session for authentication and admin status.
export async function isAdminRequest(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  // If no session exists or the user is not marked as admin, send unauthorized/forbidden response.
  if (!session || !session.user?.isAdmin) {
    res.status(401).send('Unauthorized: Not an admin'); // Send HTTP status code and message
    res.end(); // End the response to prevent further processing
    throw new Error('Not an admin'); // Throw an error for server-side logging/handling
  }
}
