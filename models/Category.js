// models/Category.js
import mongoose, { Schema, model, models } from 'mongoose';

// Define the Category Schema
const CategorySchema = new Schema({
    name: { type: String, required: true },
    parent: { type: Schema.Types.ObjectId, ref: 'Category' }, // Correctly referencing 'Category' itself
    properties: [{
        name: { type: String, required: true },
        values: [{ type: String }], // Array of strings for values, e.g., ["red", "blue"]
    }],
}, {
    timestamps: true, // Automatically add createdAt and updatedAt fields
});

// This is the CRUCIAL line for Next.js hot reloading and Mongoose.
// It checks if the model has already been compiled (models.Category)
// and reuses it; otherwise, it compiles and creates the new model.
export const Category = models.Category || model('Category', CategorySchema);
