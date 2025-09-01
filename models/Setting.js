import { Schema, model, models } from 'mongoose';

const SettingSchema = new Schema({
    userId: { type: String, required: true, unique: true },
    language: { type: String, default: 'en' },
    theme: { type: String, default: 'light' },
}, { timestamps: true });

export const Setting = models.Setting || model('Setting', SettingSchema);