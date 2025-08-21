// pages/api/admin/users.js
import { mongooseConnect } from "@/lib/mongoose";
import { User } from "@/models/User";
import { isAdminRequest } from "@/pages/api/auth/[...nextauth]"; // Ensure this path is correct

export default async function handle(req, res) {
    const { method } = req;
    await mongooseConnect();

    // Protect this API route: only authenticated admins can access it
    try {
        await isAdminRequest(req, res); // This function throws an error and ends response if not admin
    } catch (e) {
        // If isAdminRequest throws, it already handled the response (e.g., sent 401/403)
        return; 
    }

    if (method === 'GET') {
        res.json(await User.find({}));
    }

    if (method === 'PUT') {
        const { id, isAdmin } = req.body;
        await User.findByIdAndUpdate(id, { isAdmin });
        res.json({ message: "User status updated successfully" });
    }

    if (method === 'DELETE') {
        const { id } = req.query; // Expecting the user ID to be passed as a query parameter (e.g., /api/admin/users?id=...)
        if (!id) {
            return res.status(400).json({ message: "User ID is required for deletion." });
        }
        
        // Find and delete the user
        const result = await User.findByIdAndDelete(id);
        if (result) {
            res.json({ message: "User deleted successfully" });
        } else {
            res.status(404).json({ message: "User not found." });
        }
    }
}
