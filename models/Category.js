// models/Category.js
import mongoose from 'mongoose';

// Define the Category Schema
const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    // Use mongoose.Schema.Types.ObjectId for explicit type definition
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
});

/**
 * Function to get the Category model.
 * This ensures the model is only accessed after Mongoose has connected,
 * preventing 'Cannot read properties of undefined' errors during module loading.
 * @returns {mongoose.Model} The Category Mongoose Model.
 */
function getCategoryModel() {
    // Check if the model already exists in Mongoose's internal registry.
    // If it exists, reuse the existing model; otherwise, create and compile a new one.
    // This is crucial for preventing "Cannot overwrite model..." errors during hot reloads.
    if (mongoose.models.Category) {
        return mongoose.models.Category;
    } else {
        return mongoose.model('Category', CategorySchema);
    }
}

// Export the function instead of the model directly
export { getCategoryModel };