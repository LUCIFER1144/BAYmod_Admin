// pages/api/categories.js
import { mongooseConnect } from "@/lib/mongoose";
import { Category } from "@/models/Category"; 
import { isAdminRequest } from "@/pages/api/auth/[...nextauth]"; 

export default async function handle(req, res) {
    const { method } = req;
    await mongooseConnect(); // Ensure database connection

    
    try {
        await isAdminRequest(req, res); // This function will throw an error and end the response if not an admin
    } catch (e) {

        return; 
    }
    

    if (method === 'GET') {
        if (req.query?.id) {
            // Get a single category by ID
            res.json(await Category.findById(req.query.id).populate('parent'));
        } else {
            // Get all categories, populating parent details
            res.json(await Category.find().populate('parent'));
        }
    }

    if (method === 'POST') {
        const { name, parent, properties } = req.body;
        const categoryDoc = await Category.create({
            name,
            parent: parent || null,
            properties,
        });
        res.json(categoryDoc);
    }

    if (method === 'PUT') {
        const { _id, name, parent, properties } = req.body;
        await Category.updateOne({_id}, {
            name,
            parent: parent || null,
            properties,
        });
        res.json(true);
    }

    if (method === 'DELETE') {
        if (req.query?._id) { // the client code uses _id as query param
            await Category.deleteOne({_id:req.query._id});
            res.json(true);
        }
    }
}
