import { Schema, model, models } from "mongoose";

const SettingSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, 
  name: { type: String, required: true },
  value: { type: Schema.Types.Mixed }, // Mixed allows string, object, number, etc.
}, { timestamps: true });

// Prevent duplicate setting names per user
SettingSchema.index({ userId: 1, name: 1 }, { unique: true });

export const Setting = models?.Setting || model("Setting", SettingSchema, "settings");
