import { mongooseConnect } from "@/lib/mongoose";
import { getCategoryModel } from "@/models/Category"; 

export default async function handle(req, res) {
    const { method } = req;
    await mongooseConnect(); 

    const Category = getCategoryModel(); 

    if (method === 'GET') {
        // Find all categories and populate the 'parent' field
        // This makes category.parent.name directly accessible on the frontend
        res.json(await Category.find().populate('parent')); 
    }

    if (method === 'POST') {
        const { name, parent } = req.body; 
        const categoryDoc = await Category.create({
            name,
            parent: parent || null, 
        });
        res.json(categoryDoc);
    }

    if (method === 'PUT') {
        const { _id, name, parent } = req.body; 
        const categoryDoc = await Category.updateOne({_id}, {
            name,
            parent: parent || null,
        });
        res.json(categoryDoc); 
    }

    if (method === 'DELETE') {
        const {_id} = req.query; // Assuming ID is passed as a query parameter (e.g., /api/categories?id=...)
        await Category.deleteOne({_id});
        res.json('ok');
        
    }
}
