// models/User.js
import mongoose, { Schema, models, model } from "mongoose";

// Define the User schema
const UserSchema = new Schema({
    // These fields are typically managed by NextAuth.js from OAuth providers
    name: { type: String },
    email: { type: String, unique: true, required: true },
    image: { type: String },
    // Add the isAdmin field to determine administrative privileges
    isAdmin: { type: Boolean, default: false }, 
}, { 
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Use the existing 'User' model if it's already compiled, otherwise compile it.
// Explicitly specify 'users' as the collection name to match NextAuth.js's adapter.
export const User = models?.User || model('User', UserSchema, 'users');