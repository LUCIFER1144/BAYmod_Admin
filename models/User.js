// models/User.js
import mongoose, { Schema, models, model } from "mongoose";


const UserSchema = new Schema({
    
    name: { type: String },
    email: { type: String, unique: true, required: true },
    image: { type: String },

    isAdmin: { type: Boolean, default: false }, 
}, { 
    timestamps: true 
});


export const User = models?.User || model('User', UserSchema, 'users');