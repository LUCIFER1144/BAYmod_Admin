// pages/api/products.js
import { mongooseConnect } from "@/lib/mongoose";
import { Product } from "@/models/Product"; // Make sure your Product model is imported
import { isAdminRequest } from "@/pages/api/auth/[...nextauth]"; // Import the admin check function

export default async function handle(req, res) {
    const { method } = req;
    await mongooseConnect(); // Ensure database connection

    // --- CRITICAL PROTECTION: Only admins can access this API route ---
    try {
        await isAdminRequest(req, res); // This function will throw an error and end the response if not an admin
    } catch (e) {
        // If isAdminRequest throws, it already handled sending the 401/403 response
        return; 
    }
    // --- End Protection ---

    if (method === 'GET') {
        if (req.query?.id) {
            // Get a single product by ID (e.g., for edit page)
            res.json(await Product.findById(req.query.id));
        } else {
            // Get all products
            res.json(await Product.find());
        }
    }

    if (method === 'POST') {
        const {title,description,price,images,category,properties} = req.body;
        const productDoc = await Product.create({
            title,description,price,images,category,properties
        });
        res.json(productDoc);
    }

    if (method === 'PUT') {
        const { _id, title,description,price,images,category,properties} = req.body;
        await Product.updateOne({_id}, {
            title,description,price,images,category,properties
        });
        res.json(true);
    }

    if (method === 'DELETE') {
        if (req.query?.id) {
            await Product.deleteOne({_id:req.query.id});
            res.json(true);
        }
    }
}
