// models/Category.js
import mongoose, { Schema, model, models } from 'mongoose';

const CategorySchema = new Schema({
    name: { type: String, required: true },
    parent: { type: Schema.Types.ObjectId, ref: 'Category' }, // Correctly referencing 'Category' itself
    properties: [{
        name: { type: String, required: true },
        values: [{ type: String }], 
    }],
}, {
    timestamps: true, 
});

export const Category = models.Category || model('Category', CategorySchema);
